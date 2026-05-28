#!/usr/bin/env python3
"""Build the V1 free-only coordinate sanity pass from canonical sources."""

from __future__ import annotations

import argparse
import csv
import io
import json
import math
import re
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "data/v1-canonical-sources"
WORKBOOK = SOURCES / "diana-workbook.xlsx"
ARCGIS = SOURCES / "arcgis-cultural-assets.geojson"
OUT_DIR = ROOT / "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data"
REPORTS = ROOT / "reports"
DECISIONS_OUT = OUT_DIR / "coordinate_sanity_pass.json"
MARKERS_OUT = OUT_DIR / "coordinate_sanity_markers.geojson"
REPORT_OUT = REPORTS / "v1-coordinate-sanity-pass-summary.json"
CENSUS_CANDIDATES_OUT = REPORTS / "v1-census-geocoder-candidates.csv"

EXCLUDED_SHEETS = {"Out of Business_Table 1", "Parking_Table 1", "Sofia notes_Table 1"}
EXCLUDED_CATEGORY_TERMS = ("parking", "out of business")
WEB_MERCATOR_RADIUS = 6378137.0
NEVADA_COUNTY_BOUNDS = {"min_lng": -121.35, "max_lng": -120.0, "min_lat": 39.0, "max_lat": 39.6}


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\xa0", " ")).strip()


def normalize(value: object) -> str:
    text = clean(value).lower().replace("&", "and")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def slug(name: object, city: object = "") -> str:
    return re.sub(r"[^a-z0-9]+", "-", normalize(f"{name} {city}")).strip("-")


def column_index(cell_ref: str) -> int:
    match = re.match(r"([A-Z]+)", cell_ref or "")
    if not match:
        return 0
    index = 0
    for char in match.group(1):
        index = index * 26 + (ord(char) - ord("A") + 1)
    return index - 1


def valid_nevada_county_coordinate(lat: float, lng: float) -> bool:
    return (
        NEVADA_COUNTY_BOUNDS["min_lat"] <= lat <= NEVADA_COUNTY_BOUNDS["max_lat"]
        and NEVADA_COUNTY_BOUNDS["min_lng"] <= lng <= NEVADA_COUNTY_BOUNDS["max_lng"]
    )


def parse_coordinate_pair(raw_x: object, raw_y: object) -> tuple[float, float, str] | None:
    try:
        x = float(raw_x)
        y = float(raw_y)
    except (TypeError, ValueError):
        return None

    if -180 <= x <= 180 and -90 <= y <= 90 and x != 0 and y != 0:
        lat, lng = y, x
        if valid_nevada_county_coordinate(lat, lng):
            return lat, lng, "diana-workbook-lonlat"

    if abs(x) > 1_000_000 and abs(y) > 1_000_000:
        lng = x / WEB_MERCATOR_RADIUS * 180 / math.pi
        lat = (2 * math.atan(math.exp(y / WEB_MERCATOR_RADIUS)) - math.pi / 2) * 180 / math.pi
        if valid_nevada_county_coordinate(lat, lng):
            return lat, lng, "diana-workbook-webmercator"

    return None


def read_xlsx_rows(path: Path) -> list[tuple[str, list[dict[int, str]]]]:
    ns = {
        "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
        "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
        "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    }
    sheets: list[tuple[str, list[dict[int, str]]]] = []
    with ZipFile(path) as z:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall("a:si", ns):
                shared.append("".join(t.text or "" for t in si.findall(".//a:t", ns)))

        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        targets = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels.findall("rel:Relationship", ns)}

        for sheet in wb.find("a:sheets", ns):
            sheet_name = sheet.attrib["name"]
            if sheet_name in EXCLUDED_SHEETS:
                continue
            target = targets[sheet.attrib[f"{{{ns['r']}}}id"]]
            xml_path = "xl/" + target if not target.startswith("xl/") else target
            ws = ET.fromstring(z.read(xml_path))
            parsed_rows: list[dict[int, str]] = []
            for row in ws.findall(".//a:sheetData/a:row", ns):
                values_by_column: dict[int, str] = {}
                for cell in row.findall("a:c", ns):
                    text = ""
                    value = cell.find("a:v", ns)
                    inline = cell.find("a:is", ns)
                    if value is not None and value.text is not None:
                        text = value.text
                        if cell.attrib.get("t") == "s":
                            try:
                                text = shared[int(text)]
                            except (ValueError, IndexError):
                                pass
                    elif inline is not None:
                        text = "".join(t.text or "" for t in inline.findall(".//a:t", ns))
                    values_by_column[column_index(cell.attrib.get("r", ""))] = clean(text)
                if values_by_column:
                    parsed_rows.append(values_by_column)
            if parsed_rows:
                sheets.append((sheet_name, parsed_rows))
    return sheets


def index_for(headers: list[str], *names: str) -> int | None:
    normalized = {normalize(header): idx for idx, header in enumerate(headers)}
    for name in names:
        idx = normalized.get(normalize(name))
        if idx is not None:
            return idx
    return None


def read_diana_rows() -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for sheet_name, parsed_rows in read_xlsx_rows(WORKBOOK):
        headers = [parsed_rows[0].get(i, "") for i in range(max(parsed_rows[0]) + 1)]
        name_i = index_for(headers, "Name")
        if name_i is None:
            continue
        x_i = index_for(headers, "x")
        y_i = index_for(headers, "y")
        city_i = index_for(headers, "City")
        address_i = index_for(headers, "Address")
        website_i = index_for(headers, "Website")
        desc_i = index_for(headers, "Description")
        type_i = index_for(headers, "AssetType", "Asset Type", "Type")
        phone_i = index_for(headers, "Phone", "Phone Number")
        for row_index, row in enumerate(parsed_rows[1:], start=2):
            name = clean(row.get(name_i, ""))
            if not name:
                continue
            city = clean(row.get(city_i, "")) if city_i is not None else ""
            category = clean(row.get(type_i, "")) if type_i is not None else sheet_name.replace("_Table 1", "")
            coord = parse_coordinate_pair(row.get(x_i, ""), row.get(y_i, "")) if x_i is not None and y_i is not None else None
            row_id = slug(name, city)
            rows.append(
                {
                    "id": row_id,
                    "decisionId": f"{row_id}--{normalize(sheet_name) or 'sheet'}--row-{row_index}",
                    "name": name,
                    "city": city,
                    "category": category,
                    "address": clean(row.get(address_i, "")) if address_i is not None else "",
                    "website": clean(row.get(website_i, "")) if website_i is not None else "",
                    "phone": clean(row.get(phone_i, "")) if phone_i is not None else "",
                    "description": clean(row.get(desc_i, "")) if desc_i is not None else "",
                    "sheet": sheet_name,
                    "sourceRow": row_index,
                    "dianaCoordinate": coord,
                }
            )
    return rows


def read_arcgis_rows() -> list[dict[str, object]]:
    data = json.loads(ARCGIS.read_text(encoding="utf-8"))
    rows = []
    for feature in data.get("features", []):
        coords = feature.get("geometry", {}).get("coordinates") or []
        if len(coords) < 2:
            continue
        try:
            lng = float(coords[0])
            lat = float(coords[1])
        except (TypeError, ValueError):
            continue
        if not valid_nevada_county_coordinate(lat, lng):
            continue
        props = feature.get("properties", {})
        name = clean(props.get("Name") or props.get("Organization") or props.get("Historic_Landmarks"))
        city = clean(props.get("City") or "")
        category = clean(props.get("_layer") or "")
        if not name or category_excluded(category):
            continue
        rows.append(
            {
                "id": slug(name, city),
                "matchKey": match_key(name, city),
                "name": name,
                "city": city,
                "category": category,
                "address": clean(props.get("Address") or props.get("Location") or ""),
                "website": clean(props.get("Website") or ""),
                "description": clean(props.get("Mission") or props.get("Description") or ""),
                "lat": lat,
                "lng": lng,
                "objectId": props.get("ObjectId"),
            }
        )
    return rows


def category_excluded(category: object) -> bool:
    normalized = normalize(category)
    return any(term in normalized for term in EXCLUDED_CATEGORY_TERMS)


def match_key(name: object, city: object) -> str:
    return f"{normalize(name)}|{normalize(city)}"


def street_number(address: object) -> str:
    match = re.search(r"\b\d+[a-z]?\b", clean(address).lower())
    return match.group(0) if match else ""


def addresses_compatible(diana_address: object, arcgis_address: object) -> bool:
    diana_num = street_number(diana_address)
    arcgis_num = street_number(arcgis_address)
    return not diana_num or not arcgis_num or diana_num == arcgis_num


def confidence_record(source: str, confidence: str, match_quality: str, note: str, geocoded_address: str = "") -> dict[str, object]:
    return {
        "coordinateSource": source,
        "coordinateConfidence": confidence,
        "geocodedAddress": geocoded_address,
        "matchQuality": match_quality,
        "reviewNotes": note,
    }


def make_decision(row: dict[str, object], arcgis_by_key: dict[str, list[dict[str, object]]]) -> dict[str, object]:
    base = {key: value for key, value in row.items() if key != "dianaCoordinate"}
    base["sourceAuthority"] = "Diana Workbook"

    coord = row.get("dianaCoordinate")
    if coord:
        lat, lng, system = coord
        return {
            **base,
            "lat": lat,
            "lng": lng,
            "locationReviewStatus": "Map-Ready",
            "publicMarker": True,
            **confidence_record(system, "authoritative", "direct-diana-coordinate", "Diana Workbook supplied valid Nevada County coordinates."),
        }

    candidates = arcgis_by_key.get(match_key(row.get("name"), row.get("city")), [])
    compatible = [candidate for candidate in candidates if addresses_compatible(row.get("address"), candidate.get("address"))]
    if len(candidates) == 1 and len(compatible) == 1:
        candidate = compatible[0]
        return {
            **base,
            "lat": candidate["lat"],
            "lng": candidate["lng"],
            "locationReviewStatus": "Map-Ready",
            "publicMarker": True,
            "arcgisObjectId": candidate.get("objectId"),
            **confidence_record(
                "arcgis-cultural-assets-confident-match",
                "high",
                "normalized-name-city-unique",
                "ArcGIS fallback used only because normalized name + city had one candidate, no address-number contradiction, and coordinates were inside Nevada County bounds.",
                clean(candidate.get("address")),
            ),
        }

    if candidates and not compatible:
        note = "ArcGIS candidate rejected because Diana and ArcGIS street numbers conflict."
        match_quality = "arcgis-address-contradiction"
    elif len(candidates) > 1:
        note = "ArcGIS candidate rejected because normalized name + city produced duplicate candidates."
        match_quality = "arcgis-duplicate-candidates"
    else:
        note = "No Diana coordinate and no confident ArcGIS fallback. Address-bearing rows are eligible for the optional free Census Geocoder pass."
        match_quality = "no-trusted-coordinate"

    return {
        **base,
        "lat": None,
        "lng": None,
        "locationReviewStatus": "Needs Location Review",
        "publicMarker": False,
        **confidence_record("none", "needs-review", match_quality, note),
    }


def census_candidate_rows(decisions: list[dict[str, object]]) -> list[dict[str, str]]:
    rows = []
    for row in decisions:
        if row["publicMarker"] or not row.get("address") or not row.get("city"):
            continue
        rows.append(
            {
                "id": str(row["id"]),
                "street": str(row["address"]),
                "city": str(row["city"]),
                "state": "CA",
                "zip": "",
            }
        )
    return rows


def write_census_candidates(rows: list[dict[str, str]]) -> None:
    REPORTS.mkdir(parents=True, exist_ok=True)
    with CENSUS_CANDIDATES_OUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["id", "street", "city", "state", "zip"])
        writer.writeheader()
        writer.writerows(rows)


def run_census_batch(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    if not rows:
        return {}
    body = io.StringIO()
    writer = csv.writer(body)
    for row in rows:
        writer.writerow([row["id"], row["street"], row["city"], row["state"], row["zip"]])
    boundary = "----v1-coordinate-sanity-pass"
    payload = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="addressFile"; filename="addresses.csv"\r\n'
        "Content-Type: text/csv\r\n\r\n"
        f"{body.getvalue()}\r\n"
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="benchmark"\r\n\r\n'
        "Public_AR_Current\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")
    request = urllib.request.Request(
        "https://geocoding.geo.census.gov/geocoder/locations/addressbatch",
        data=payload,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", "User-Agent": "v1-coordinate-sanity-pass/1.0"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        text = response.read().decode("utf-8", errors="replace")
    results: dict[str, dict[str, str]] = {}
    for cells in csv.reader(io.StringIO(text)):
        if len(cells) < 6 or cells[2].lower() != "match":
            continue
        coords = cells[5].split(",")
        if len(coords) != 2:
            continue
        try:
            lng = float(coords[0])
            lat = float(coords[1])
        except ValueError:
            continue
        if valid_nevada_county_coordinate(lat, lng):
            results[cells[0]] = {"matchedAddress": cells[1], "matchType": cells[3], "lat": str(lat), "lng": str(lng)}
    return results


def apply_census_results(decisions: list[dict[str, object]], results: dict[str, dict[str, str]]) -> None:
    for row in decisions:
        result = results.get(str(row["id"]))
        if not result or row["publicMarker"]:
            continue
        row["lat"] = float(result["lat"])
        row["lng"] = float(result["lng"])
        row["locationReviewStatus"] = "Map-Ready"
        row["publicMarker"] = True
        row.update(
            confidence_record(
                "us-census-geocoder",
                "medium",
                f"census-{normalize(result.get('matchType')) or 'match'}",
                "US Census Geocoder result accepted as a free, interpolated street-address coordinate; not storefront/building certainty.",
                result.get("matchedAddress", ""),
            )
        )


def build(run_census: bool) -> dict[str, object]:
    diana = read_diana_rows()
    arcgis = read_arcgis_rows()
    arcgis_by_key: dict[str, list[dict[str, object]]] = defaultdict(list)
    for row in arcgis:
        arcgis_by_key[str(row["matchKey"])].append(row)

    decisions = [make_decision(row, arcgis_by_key) for row in diana]
    candidates = census_candidate_rows(decisions)
    write_census_candidates(candidates)
    census_results = run_census_batch(candidates) if run_census else {}
    apply_census_results(decisions, census_results)

    marker_rows = [row for row in decisions if row["publicMarker"]]
    features = [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [row["lng"], row["lat"]]},
            "properties": {key: value for key, value in row.items() if key not in {"lat", "lng"}},
        }
        for row in marker_rows
    ]

    source_counts = Counter(str(row["coordinateSource"]) for row in decisions)
    confidence_counts = Counter(str(row["coordinateConfidence"]) for row in decisions)
    review_counts = Counter(str(row["locationReviewStatus"]) for row in decisions)
    match_counts = Counter(str(row["matchQuality"]) for row in decisions)
    summary = {
        "sourceArtifacts": {
            "dianaWorkbook": str(WORKBOOK.relative_to(ROOT)),
            "arcgisCulturalAssets": str(ARCGIS.relative_to(ROOT)),
            "quarantinedBridge": "data/v1-canonical-sources/DO-NOT-TRUST-arts-hub-coordinate-bridge.json",
        },
        "rules": [
            "Diana Workbook identity is authoritative.",
            "Diana Workbook coordinates win when present and valid.",
            "ArcGIS is only a fallback for unique normalized name + city matches with no address-number contradiction.",
            "US Census Geocoder is optional, free, and treated as medium-confidence street interpolation.",
            "Rows without trusted coordinates remain Needs Location Review and are not ordinary public markers.",
            "The Arts Hub Coordinate Bridge is not read by this script.",
        ],
        "censusTermsNote": "Official Census docs describe a public geocoder/API for single or batch address geocoding. Returned latitude/longitude values are MAF/TIGER address-range interpolations, so accepted Census rows are medium confidence rather than building certainty.",
        "runCensus": run_census,
        "counts": {
            "dianaRows": len(diana),
            "arcgisRows": len(arcgis),
            "mapReadyMarkers": len(marker_rows),
            "needsLocationReview": review_counts.get("Needs Location Review", 0),
            "dianaCoordinates": sum(count for source, count in source_counts.items() if source.startswith("diana-workbook")),
            "arcgisConfidentFallbacks": source_counts.get("arcgis-cultural-assets-confident-match", 0),
            "freeGeocodedCandidates": source_counts.get("us-census-geocoder", 0),
            "censusCandidatesWritten": len(candidates),
            "rejectedOrLowConfidence": review_counts.get("Needs Location Review", 0),
        },
        "coordinateSourceCounts": dict(source_counts),
        "coordinateConfidenceCounts": dict(confidence_counts),
        "locationReviewStatusCounts": dict(review_counts),
        "matchQualityCounts": dict(match_counts),
        "outputs": {
            "decisions": str(DECISIONS_OUT.relative_to(ROOT)),
            "mapReadyGeojson": str(MARKERS_OUT.relative_to(ROOT)),
            "summary": str(REPORT_OUT.relative_to(ROOT)),
            "censusCandidates": str(CENSUS_CANDIDATES_OUT.relative_to(ROOT)),
        },
    }

    return {"summary": summary, "decisions": decisions, "geojson": {"type": "FeatureCollection", "features": features}}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-census", action="store_true", help="Submit remaining address-bearing rows to the free US Census batch geocoder.")
    args = parser.parse_args()

    data = build(run_census=args.run_census)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    DECISIONS_OUT.write_text(json.dumps({"summary": data["summary"], "decisions": data["decisions"]}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    MARKERS_OUT.write_text(json.dumps(data["geojson"], indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT_OUT.write_text(json.dumps(data["summary"], indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    counts = data["summary"]["counts"]
    print(
        "V1 coordinate sanity pass: "
        f"Diana={counts['dianaCoordinates']} "
        f"ArcGIS={counts['arcgisConfidentFallbacks']} "
        f"Census={counts['freeGeocodedCandidates']} "
        f"NeedsReview={counts['needsLocationReview']} "
        f"Markers={counts['mapReadyMarkers']}"
    )
    print(f"Wrote {DECISIONS_OUT.relative_to(ROOT)}, {MARKERS_OUT.relative_to(ROOT)}, {REPORT_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
