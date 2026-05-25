#!/usr/bin/env python3
"""Prepare V1 Discovery Map data from source artifacts.

Inputs:
- Diana workbook export, treated as source authority.
- Arts Hub V2 JSON, used only for map-ready coordinates and image references.
- Live NCAC Trumba RSS, used for the light current event layer.

Outputs are static JSON files consumed by the V1 prototype plus a data gaps log.
"""

from __future__ import annotations

import html
import json
import re
import sys
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[4]
V1 = ROOT / "website/cultural-map-redesign-stitch-lab/v1-discovery-map"
WORKBOOK = ROOT / "docs/source-artifacts/Cultural Assets - data engineering.xlsx"
ARTS_HUB_ASSETS = ROOT / "website/arts-hub-v2/data/cultural-assets.json"
IMAGE_DATA = ROOT / "website/cultural-map-redesign-stitch-lab/image_data.json"
RSS_URL = "https://www.trumba.com/calendars/nevada-county-arts-council.rss"

OUT_PLACES = V1 / "data/places.json"
OUT_EVENTS = V1 / "data/events.json"
OUT_PATHS = V1 / "data/paths.json"
OUT_GAPS = V1 / "docs/DATA-GAPS.md"

EXCLUDED_SHEETS = {"Out of Business_Table 1", "Parking_Table 1", "Sofia notes_Table 1"}

CATEGORY_LABELS = {
    "Gallery Studio Museum": "Galleries & Studios",
    "Gallery / Studio / Museum": "Galleries & Studios",
    "Performance Spaces / Entertainment": "Performing Arts",
    "Artisan Place to Eat, Drink or Stay": "Eat, Drink & Stay",
    "Artisan Places to Eat, Drink or Stay": "Eat, Drink & Stay",
    "Artisan Places to Shop": "Shops & Makers",
    "Arts Organization": "Arts Organizations",
    "Cultural Resource / Media": "Cultural Resources",
    "Cultural Resources and Media": "Cultural Resources",
    "Fair or Festival": "Fairs & Festivals",
    "Fairs and Festivals": "Fairs & Festivals",
    "Historic Landmarks": "Historic Places",
    "MUSE BD": "MUSE Picks",
    "Preservation & Cultural Organization": "Cultural Resources",
    "Preservation & Cultural Organiz": "Cultural Resources",
    "Public Art": "Public Art",
    "Services": "Creative Services",
    "Walks and Trails": "Walks & Trails",
}

INTENT_GROUPS = {
    "See a Show": {"Performing Arts", "Fairs & Festivals"},
    "Galleries & Studios": {"Galleries & Studios", "Public Art", "Arts Organizations"},
    "Historic Places": {"Historic Places", "Cultural Resources"},
    "Eat, Drink & Stay": {"Eat, Drink & Stay"},
    "Outdoors": {"Walks & Trails"},
    "Shops & Makers": {"Shops & Makers", "Creative Services"},
}

PLACEHOLDER_BY_CATEGORY = {
    "Galleries & Studios": "gallery-studio",
    "Performing Arts": "performance-event-venue",
    "Fairs & Festivals": "performance-event-venue",
    "Historic Places": "historic-place",
    "Cultural Resources": "historic-place",
    "Walks & Trails": "historic-place",
    "Public Art": "public-art",
    "Shops & Makers": "maker-shop",
    "Creative Services": "maker-shop",
    "Eat, Drink & Stay": "food-stay-gathering",
}

PLACEHOLDER_ASSETS = {
    "gallery-studio": "assets/placeholders/gallery-studio.webp",
    "performance-event-venue": "assets/placeholders/performance-event-venue.webp",
    "historic-place": "assets/placeholders/historic-place.webp",
    "public-art": "assets/placeholders/public-art.webp",
    "maker-shop": "assets/placeholders/maker-shop.webp",
    "food-stay-gathering": "assets/placeholders/food-stay-gathering.webp",
}

IMAGE_FILE_RE = re.compile(r"\.(?:jpe?g|png|webp|gif)(?:\?|$)", re.I)
LOGO_RE = re.compile(r"(?:logo|logomark|brandmark|favicon|siteicon|wordmark)", re.I)

PATH_DEFS = [
    {
        "id": "living-like-a-local",
        "title": "Living Like a Local",
        "dek": "A compact Grass Valley and Nevada City loop for coffee, books, galleries, and the places locals actually point visitors toward.",
        "stop_names": [
            "Booktown Books",
            "The Center for the Arts",
            "Nevada City Winery",
            "Nevada Theatre",
        ],
    },
    {
        "id": "makers-working-artists",
        "title": "Makers / Working Artists",
        "thesis": "Culture in western Nevada County is something people make, teach, share, and practice together.",
        "dek": "A working-arts path that follows art from a public gallery into studios, classes, tools, and hands-on creative practice.",
        "copy": "This path shows that the Discovery Map can point to culture being made, taught, shared, and practiced, not only culture on a calendar. Art Works Gallery, ASiF Studios, and The Curious Forge each make the creative process visible: artists showing current work, studio communities teaching and practicing skills, and maker spaces opening tools and craft to more people.",
        "stop_names": [
            "Art Works Gallery",
            "ASiF Studios",
            "The Curious Forge",
        ],
        "stop_notes": {
            "Art Works Gallery": "Start with working artists presenting finished pieces in a cooperative downtown gallery.",
            "ASiF Studios": "Continue into a studio community where classes and shared workspace keep art practice visible.",
            "The Curious Forge": "End at a maker space where tools, workshops, and hands-on learning broaden what creative production can mean.",
        },
    },
    {
        "id": "evening-arts-night",
        "title": "Evening Arts Night",
        "dek": "A night-out route connecting performance, film, music, and after-hours cultural anchors.",
        "stop_names": [
            "Miners Foundry Cultural Center",
            "Nevada Theatre",
            "The Center for the Arts",
            "The Stone House",
        ],
    },
]

ANCHOR_DEFS = {
    "miners-foundry-cultural-center-nevada-city": {
        "label": "Performance anchor",
        "hook": "Start with the old foundry turned cultural center: concerts, civic nights, and Nevada City's most recognizable gathering room.",
        "iconKey": "stage",
        "priority": 1,
        "pathIds": ["evening-arts-night"],
    },
    "nevada-theatre-nevada-city": {
        "label": "Historic stage",
        "hook": "A living theater landmark that makes Nevada City's cultural memory visible from the sidewalk.",
        "iconKey": "historic",
        "priority": 2,
        "pathIds": ["living-like-a-local", "evening-arts-night"],
    },
    "the-center-for-the-arts-grass-valley": {
        "label": "Show night anchor",
        "hook": "Grass Valley's major arts venue gives the map an immediate reason to plan around a performance.",
        "iconKey": "stage",
        "priority": 3,
        "pathIds": ["living-like-a-local", "evening-arts-night"],
    },
    "booktown-books-grass-valley": {
        "label": "Browsing anchor",
        "hook": "A downtown book stop that turns the map from places into a slow, visitor-friendly day out.",
        "iconKey": "book",
        "priority": 4,
        "pathIds": ["living-like-a-local"],
    },
    "nevada-city-winery-nevada-city": {
        "label": "Gathering stop",
        "hook": "A walkable tasting room that connects cultural browsing with an easy place to pause.",
        "iconKey": "food-drink",
        "priority": 5,
        "pathIds": ["living-like-a-local"],
    },
    "the-stone-house-nevada-city": {
        "label": "After-hours anchor",
        "hook": "Historic dining and music give an arts night somewhere atmospheric to land after the show.",
        "iconKey": "food-drink",
        "priority": 6,
        "pathIds": ["evening-arts-night"],
    },
    "art-works-gallery-grass-valley": {
        "label": "Gallery anchor",
        "hook": "A local-artist gallery that makes downtown Grass Valley feel hand-made rather than generic.",
        "iconKey": "gallery",
        "priority": 7,
        "pathIds": ["gallery-studio-day"],
    },
    "c-h-a-m-p-gallery-at-city-hall-nevada-city": {
        "label": "Civic gallery",
        "hook": "City Hall doubles as an arts stop, making public space part of the cultural route.",
        "iconKey": "gallery",
        "priority": 8,
        "pathIds": ["gallery-studio-day"],
    },
    "asif-studios-grass-valley": {
        "label": "Studio anchor",
        "hook": "A working studio community that shows the maker layer behind the gallery window.",
        "iconKey": "maker",
        "priority": 9,
        "pathIds": ["gallery-studio-day"],
    },
    "the-curious-forge-nevada-city": {
        "label": "Maker anchor",
        "hook": "A large creative workshop where classes, tools, and production make the route feel active.",
        "iconKey": "maker",
        "priority": 10,
        "pathIds": ["gallery-studio-day"],
    },
}

DEMO_PLACE_OVERRIDES = {
    "booktown-books-grass-valley": {
        "category": "Shops & Makers",
        "intent": "Shops & Makers",
        "description": "A downtown Grass Valley bookstore and local browsing anchor, useful as a soft start to a culture-forward day out.",
    },
    "the-center-for-the-arts-grass-valley": {
        "description": "Grass Valley's major performing arts anchor, with concerts, theater, community programs, and touring artists close to downtown.",
    },
    "nevada-city-winery-nevada-city": {
        "description": "A Nevada City tasting room and gathering stop that gives an evening route a local, walkable place to land.",
    },
    "nevada-theatre-nevada-city": {
        "description": "A historic Nevada City performance house with a long cultural memory, still useful as a recognizable arts-night anchor.",
    },
    "art-works-gallery-grass-valley": {
        "description": "A cooperative downtown gallery where local artists show ceramics, paintings, jewelry, sculpture, and other studio work.",
    },
    "c-h-a-m-p-gallery-at-city-hall-nevada-city": {
        "description": "A public-facing Nevada City gallery program that turns civic space into a rotating place for local artists.",
    },
    "asif-studios-grass-valley": {
        "description": "A Grass Valley studio community and teaching space that makes the gallery route feel active, local, and maker-led.",
    },
    "the-curious-forge-nevada-city": {
        "description": "A large maker space with studios, tools, classes, and creative production capacity beyond a traditional gallery stop.",
    },
    "miners-foundry-cultural-center-nevada-city": {
        "category": "Performing Arts",
        "intent": "See a Show",
        "description": "A Nevada City cultural center for concerts, performances, community gatherings, and the kind of nights visitors remember.",
    },
    "the-stone-house-nevada-city": {
        "description": "A historic Nevada City dining and music venue that works as an after-hours gathering point for an arts night.",
    },
}


def normalize(value: Any) -> str:
    text = str(value or "").lower()
    text = html.unescape(text)
    text = re.sub(r"&amp;", "and", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def clean_text(value: Any) -> str:
    text = html.unescape(str(value or "")).replace("\xa0", " ")
    fixes = {
        "â€™": "'",
        "â€œ": '"',
        "â€": '"',
        "â€“": "-",
        "â€”": "-",
        "â€°": "",
        "Ã©": "e",
    }
    for bad, good in fixes.items():
        text = text.replace(bad, good)
    return re.sub(r"\s+", " ", text).strip()


def read_xlsx(path: Path) -> dict[str, list[dict[str, str]]]:
    ns = {
        "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
        "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
        "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    }
    out: dict[str, list[dict[str, str]]] = {}
    with ZipFile(path) as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall("a:si", ns):
                shared.append("".join(t.text or "" for t in si.findall(".//a:t", ns)))

        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        targets = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels.findall("rel:Relationship", ns)}

        for sheet in wb.find("a:sheets", ns):
            name = sheet.attrib["name"]
            rid = sheet.attrib[f"{{{ns['r']}}}id"]
            target = targets[rid]
            xml_path = "xl/" + target if not target.startswith("xl/") else target
            ws = ET.fromstring(z.read(xml_path))
            rows = []
            for row in ws.findall(".//a:sheetData/a:row", ns):
                values = []
                for c in row.findall("a:c", ns):
                    v = c.find("a:v", ns)
                    cell = ""
                    if v is not None and v.text is not None:
                        cell = v.text
                        if c.attrib.get("t") == "s":
                            try:
                                cell = shared[int(cell)]
                            except (ValueError, IndexError):
                                pass
                    values.append(clean_text(cell))
                if any(values):
                    rows.append(values)
            if not rows:
                out[name] = []
                continue
            headers = [clean_text(h) or f"Column {i+1}" for i, h in enumerate(rows[0])]
            records = []
            for values in rows[1:]:
                record = {headers[i]: values[i] if i < len(values) else "" for i in range(len(headers))}
                if any(record.values()):
                    records.append(record)
            out[name] = records
    return out


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def build_coordinate_index(assets: list[dict[str, Any]]) -> tuple[dict[str, dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    exact: dict[str, dict[str, Any]] = {}
    by_name: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in assets:
        lat = item.get("lat")
        lng = item.get("lng")
        try:
            lat_f = float(lat)
            lng_f = float(lng)
        except (TypeError, ValueError):
            continue
        if not (-90 <= lat_f <= 90 and -180 <= lng_f <= 180):
            continue
        item = {**item, "lat": lat_f, "lng": lng_f}
        name = normalize(item.get("name"))
        city = normalize(item.get("city"))
        exact[f"{name}|{city}"] = item
        by_name[name].append(item)
    return exact, by_name


def map_category(sheet: str, asset_type: str) -> str:
    direct = CATEGORY_LABELS.get(asset_type)
    if direct:
        return direct
    sheet_direct = CATEGORY_LABELS.get(sheet.replace("_Table 1", ""))
    text = normalize(f"{asset_type} {sheet}")
    if "performance" in text or "entertainment" in text or "theatre" in text or "theater" in text or "music" in text or "venue" in text:
        return "Performing Arts"
    if "gallery" in text or "studio" in text or "museum" in text or "visual art" in text:
        return "Galleries & Studios"
    if "public art" in text or "mural" in text:
        return "Public Art"
    if "restaurant" in text or "bar" in text or "brew" in text or "wine" in text or "hotel" in text or "lodg" in text or "stay" in text or "eat" in text or "drink" in text or "cafe" in text:
        return "Eat, Drink & Stay"
    if "shop" in text or "antique" in text or "vintage" in text or "maker" in text or "artisan" in text:
        return "Shops & Makers"
    if "trail" in text or "walk" in text or "outdoor" in text:
        return "Walks & Trails"
    if "festival" in text or "fair" in text or "parade" in text:
        return "Fairs & Festivals"
    if "organization" in text or "arts org" in text:
        return "Arts Organizations"
    if "media" in text or "resource" in text or "preservation" in text:
        return "Cultural Resources"
    if "historic" in text or "landmark" in text:
        return "Historic Places"
    return sheet_direct or clean_text(asset_type or sheet)


def intent_for(category: str) -> str:
    for group, cats in INTENT_GROUPS.items():
        if category in cats:
            return group
    return "Galleries & Studios" if "Gallery" in category else "Historic Places"


def description_for(record: dict[str, str], category: str, city: str) -> str:
    desc = clean_text(record.get("Description"))
    if desc and len(desc) > 24:
        return desc
    place = city or "Nevada County"
    return f"A {category.lower()} entry in {place}, included for alpha review while source descriptions are cleaned."


def normalize_website(value: str) -> str:
    website = clean_text(value)
    if website and not re.match(r"https?://", website, re.I):
        return f"https://{website}"
    return website


def placeholder_type_for(category: str) -> str:
    return PLACEHOLDER_BY_CATEGORY.get(category, "gallery-studio")


def classify_image(name: str, category: str, image: Any) -> tuple[dict[str, str], str | None]:
    placeholder_type = placeholder_type_for(category)
    placeholder_src = PLACEHOLDER_ASSETS[placeholder_type]
    base = {
        "placeholderType": placeholder_type,
        "placeholderSrc": placeholder_src,
    }
    if not isinstance(image, dict) or not image.get("img"):
        return {
            **base,
            "kind": "placeholder",
            "src": placeholder_src,
            "alt": f"Editorial placeholder image for {name}",
            "credit": "Generated placeholder",
            "status": "missing",
            "reason": "missing image",
        }, "missing image"

    src = clean_text(image.get("img"))
    alt = clean_text(image.get("alt") or name)
    credit = clean_text(image.get("credit") or "")
    lower = src.lower()
    weak_reason = ""

    if "img/watercolor/" in lower or "../img/watercolor/" in lower:
        weak_reason = "watercolor/category art"
    elif LOGO_RE.search(src):
        weak_reason = "logo or brand mark"
    elif not (lower.startswith("img/") or lower.startswith("../img/") or lower.startswith("http://") or lower.startswith("https://")):
        weak_reason = "non-image-looking source"
    elif lower.startswith("http") and not ("googleusercontent.com" in lower or "wikimedia.org" in lower or IMAGE_FILE_RE.search(src)):
        weak_reason = "non-image-looking URL"
    elif (lower.startswith("img/") or lower.startswith("../img/")) and not IMAGE_FILE_RE.search(src):
        weak_reason = "non-image-looking local asset"

    if weak_reason:
        return {
            **base,
            "kind": "placeholder",
            "src": placeholder_src,
            "alt": f"Editorial placeholder image for {name}",
            "credit": "Generated placeholder",
            "status": "weak",
            "reason": weak_reason,
            "originalSrc": src,
            "originalAlt": alt,
            "originalCredit": credit,
        }, weak_reason

    return {
        **base,
        "kind": "real",
        "src": src,
        "alt": alt,
        "credit": credit,
        "status": "credible",
        "reason": "",
    }, None


def build_places(workbook: dict[str, list[dict[str, str]]], coord_exact: dict[str, dict[str, Any]], coord_by_name: dict[str, list[dict[str, Any]]], image_data: dict[str, Any]) -> tuple[list[dict[str, Any]], list[str]]:
    places = []
    gaps = []
    seen = set()
    for sheet, records in workbook.items():
        if sheet in EXCLUDED_SHEETS:
            continue
        for record in records:
            name = clean_text(record.get("Name"))
            city = clean_text(record.get("City"))
            if not name:
                continue
            key = f"{normalize(name)}|{normalize(city)}"
            if key in seen:
                gaps.append(f"- Duplicate source row skipped: {name} ({city or 'city missing'}) from {sheet}.")
                continue
            seen.add(key)

            coord = coord_exact.get(key)
            if coord is None:
                candidates = coord_by_name.get(normalize(name), [])
                if len(candidates) == 1:
                    coord = candidates[0]
            if coord is None:
                gaps.append(f"- Missing coordinates: {name} ({city or 'city missing'}) from {sheet}.")
                continue

            asset_type = clean_text(record.get("AssetType") or coord.get("assetType") or coord.get("sheet"))
            category = map_category(sheet, asset_type)
            website = normalize_website(record.get("Website") or coord.get("website"))
            description = description_for(record, category, city or clean_text(coord.get("city")))
            place_id = re.sub(r"[^a-z0-9]+", "-", normalize(f"{name} {city}")).strip("-")
            override = DEMO_PLACE_OVERRIDES.get(place_id)
            if override:
                category = override.get("category", category)
                description = override.get("description", description)
            if not website:
                gaps.append(f"- Missing website: {name} ({city or clean_text(coord.get('city')) or 'city missing'}).")
            if description.startswith("A ") and "included for alpha review" in description:
                gaps.append(f"- Weak description: {name} ({city or clean_text(coord.get('city')) or 'city missing'}).")

            image = image_data.get(name) or image_data.get(coord.get("name", ""))
            image_record, image_gap = classify_image(name, category, image)
            if image_gap:
                gaps.append(f"- Image placeholder used: {name} ({image_gap}).")

            muse_pick = sheet.startswith("MUSE")
            anchor = ANCHOR_DEFS.get(place_id)
            place_record = {
                "id": place_id,
                "name": name,
                "city": city or clean_text(coord.get("city")),
                "category": category,
                "intent": override.get("intent", intent_for(category)) if override else intent_for(category),
                "musePick": muse_pick,
                "description": description,
                "website": website,
                "lat": coord["lat"],
                "lng": coord["lng"],
                "sourceSheet": sheet,
                "image": image_record,
                "featured": bool(anchor),
            }
            if anchor:
                place_record["anchor"] = anchor
            places.append(place_record)
    places.sort(key=lambda p: (0 if p["city"] in {"Grass Valley", "Nevada City"} else 1, p["category"], p["name"]))
    return places, gaps


def strip_tags(value: str) -> str:
    return clean_text(re.sub(r"<[^>]+>", " ", html.unescape(value or "")))


def extract_field(description: str, label: str) -> str:
    pattern = re.compile(rf"<b>{re.escape(label)}</b>:\s*(?:&nbsp;)?(.*?)(?:<br\s*/?>|$)", re.I | re.S)
    match = pattern.search(description or "")
    return strip_tags(match.group(1)) if match else ""


def parse_date(item: ET.Element) -> str:
    category = item.findtext("category", default="")
    match = re.search(r"(\d{4})/(\d{2})/(\d{2})", category)
    if match:
        return "-".join(match.groups())
    desc = html.unescape(item.findtext("description", default=""))
    match = re.search(r"(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Z][a-z]+)\s+(\d{1,2}),\s+(202\d)", desc)
    if not match:
        return ""
    months = {
        "January": "01", "February": "02", "March": "03", "April": "04",
        "May": "05", "June": "06", "July": "07", "August": "08",
        "September": "09", "October": "10", "November": "11", "December": "12",
    }
    return f"{match.group(4)}-{months[match.group(2)]}-{int(match.group(3)):02d}"


def fetch_events(places: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[str]]:
    gaps = []
    by_name = {normalize(p["name"]): p for p in places}
    events = []
    try:
        raw = urllib.request.urlopen(RSS_URL, timeout=18).read()
    except Exception as exc:
        return [], [f"- Live RSS fetch failed: {exc}."]
    root = ET.fromstring(raw)
    for item in root.findall("./channel/item")[:80]:
        title = clean_text(item.findtext("title", default=""))
        desc_html = item.findtext("description", default="")
        venue = extract_field(desc_html, "Venue") or extract_field(desc_html, "Event location")
        city = extract_field(desc_html, "City/Area")
        event_type = extract_field(desc_html, "Type of event")
        body = extract_field(desc_html, "Event description") or strip_tags(desc_html)
        date = parse_date(item)
        image_match = re.search(r'<img[^>]+src="([^"]+)"', desc_html or "", re.I)
        image = html.unescape(image_match.group(1)).replace("w=100", "w=800") if image_match else ""
        link = clean_text(item.findtext("link", default=""))
        web_link = item.findtext("{http://schemas.trumba.com/rss/x-trumba}weblink", default="")

        place = by_name.get(normalize(venue))
        if place is None and venue:
            venue_norm = normalize(venue)
            for key, candidate in by_name.items():
                if key and (key in venue_norm or venue_norm in key):
                    place = candidate
                    break
        if place is None:
            gaps.append(f"- Event not mapped: {title} at {venue or city or 'location missing'} on {date or 'date missing'}.")
            continue

        events.append({
            "id": re.sub(r"[^a-z0-9]+", "-", normalize(f"{title} {date}")).strip("-"),
            "title": title,
            "date": date,
            "category": event_type,
            "description": body[:360],
            "url": web_link or link,
            "image": image,
            "placeId": place["id"],
            "placeName": place["name"],
            "city": place["city"],
            "lat": place["lat"],
            "lng": place["lng"],
        })
    events.sort(key=lambda e: (e["date"], e["title"]))
    return events[:24], gaps


def build_paths(places: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[str]]:
    gaps = []
    by_name = {normalize(p["name"]): p for p in places}
    paths = []
    for path in PATH_DEFS:
        stops = []
        for name in path["stop_names"]:
            place = by_name.get(normalize(name))
            if place is None:
                for key, candidate in by_name.items():
                    if normalize(name) in key or key in normalize(name):
                        place = candidate
                        break
            if place is None:
                gaps.append(f"- Path stop missing from visible data: {path['title']} needs {name}.")
                continue
            stops.append({
                "placeId": place["id"],
                "name": place["name"],
                "category": place["category"],
                "city": place["city"],
                "lat": place["lat"],
                "lng": place["lng"],
                "note": path.get("stop_notes", {}).get(
                    name,
                    f"{place['category']} stop for {path['title'].lower()}.",
                ),
            })
        paths.append({**path, "stops": stops, "stop_names": None})
        del paths[-1]["stop_names"]
        paths[-1].pop("stop_notes", None)
    return paths, gaps


def write_gaps(gaps: list[str], places: list[dict[str, Any]], events: list[dict[str, Any]], paths: list[dict[str, Any]]) -> None:
    counts = Counter(p["category"] for p in places)
    image_status = Counter(p.get("image", {}).get("status", "unknown") for p in places)
    placeholder_types = Counter(p.get("image", {}).get("placeholderType", "unknown") for p in places if p.get("image", {}).get("kind") == "placeholder")
    lines = [
        "# V1 Discovery Map Data Gaps",
        "",
        f"Generated: {datetime.now(timezone.utc).isoformat(timespec='seconds')}",
        "",
        "This log preserves records and content gaps that were not displayed in the alpha because V1 only shows data that can appear credibly on the map.",
        "",
        "## Visible Data Summary",
        "",
        f"- Visible places: {len(places)}",
        f"- Mapped live events: {len(events)}",
        f"- Curated paths: {len(paths)}",
        "",
        "## Image Quality Summary",
        "",
        f"- Credible image refs: {image_status.get('credible', 0)}",
        f"- Missing image placeholders: {image_status.get('missing', 0)}",
        f"- Weak image placeholders: {image_status.get('weak', 0)}",
        "",
        "## Placeholder Types Used",
        "",
    ]
    for placeholder_type, count in sorted(placeholder_types.items()):
        lines.append(f"- {placeholder_type}: {count}")
    lines.extend([
        "",
        "## Demo-Critical Records",
        "",
        "These records are likely to be clicked during stakeholder review because they appear in the curated paths.",
        "",
    ])
    path_ids = []
    for path in paths:
        path_ids.extend(stop["placeId"] for stop in path["stops"])
    by_id = {place["id"]: place for place in places}
    for place_id in sorted(set(path_ids)):
        place = by_id.get(place_id)
        if not place:
            continue
        image = place.get("image", {})
        issues = []
        if image.get("kind") == "placeholder":
            issues.append(f"placeholder image: {image.get('reason', 'missing')}")
        if not place.get("website"):
            issues.append("missing website")
        if place.get("description", "").startswith("A ") and "included for alpha review" in place.get("description", ""):
            issues.append("weak description")
        status = "; ".join(issues) if issues else "demo-ready for alpha"
        lines.append(f"- {place['name']} ({place['city']}): {status}.")
    lines.extend([
        "",
        "## Visible Places By Category",
        "",
    ])
    for category, count in sorted(counts.items()):
        lines.append(f"- {category}: {count}")
    lines.extend(["", "## Gaps", ""])
    lines.extend(gaps[:900] if gaps else ["- No gaps recorded."])
    OUT_GAPS.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    if not WORKBOOK.exists():
        print(f"Missing workbook: {WORKBOOK}", file=sys.stderr)
        return 1
    workbook = read_xlsx(WORKBOOK)
    coord_exact, coord_by_name = build_coordinate_index(load_json(ARTS_HUB_ASSETS))
    image_data = load_json(IMAGE_DATA)
    places, place_gaps = build_places(workbook, coord_exact, coord_by_name, image_data)
    events, event_gaps = fetch_events(places)
    paths, path_gaps = build_paths(places)

    OUT_PLACES.write_text(json.dumps(places, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUT_EVENTS.write_text(json.dumps(events, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUT_PATHS.write_text(json.dumps(paths, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_gaps(place_gaps + event_gaps + path_gaps, places, events, paths)

    print(f"[OK] places={len(places)} events={len(events)} paths={len(paths)}")
    print(f"[OK] wrote {OUT_PLACES.relative_to(ROOT)}")
    print(f"[OK] wrote {OUT_EVENTS.relative_to(ROOT)}")
    print(f"[OK] wrote {OUT_PATHS.relative_to(ROOT)}")
    print(f"[OK] wrote {OUT_GAPS.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
