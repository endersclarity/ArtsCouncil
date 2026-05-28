#!/usr/bin/env python3
"""PROTOTYPE: build a trusted-coordinate map dataset.

This is throwaway audit/prototype code. It answers one question:
what does the map look like if markers come only from coordinate sources
we can explain, instead of the old Arts Hub V2 coordinate bridge?
"""

from __future__ import annotations

import json
import math
import re
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[5]
OUT_DIR = Path(__file__).resolve().parent
WORKBOOK = ROOT / "docs/source-artifacts/Cultural Assets - data engineering.xlsx"
ARCGIS = ROOT / "data/cultural-asset-map/all_cultural_assets.geojson"
V1_PLACES = ROOT / "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/places.json"
OUT = OUT_DIR / "trusted-data.json"

EXCLUDED_SHEETS = {"Out of Business_Table 1", "Parking_Table 1", "Sofia notes_Table 1"}
WEB_MERCATOR_RADIUS = 6378137.0


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


def parse_coordinate_pair(raw_x: object, raw_y: object) -> tuple[float, float, str] | None:
    try:
        x = float(raw_x)
        y = float(raw_y)
    except (TypeError, ValueError):
        return None

    if -180 <= x <= 180 and -90 <= y <= 90 and x != 0 and y != 0:
        return y, x, "workbook-lonlat"

    if abs(x) > 1_000_000 and abs(y) > 1_000_000:
        lng = x / WEB_MERCATOR_RADIUS * 180 / math.pi
        lat = (2 * math.atan(math.exp(y / WEB_MERCATOR_RADIUS)) - math.pi / 2) * 180 / math.pi
        if -180 <= lng <= 180 and -90 <= lat <= 90:
            return lat, lng, "workbook-webmercator"

    return None


def read_workbook_rows() -> list[dict[str, object]]:
    ns = {
        "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
        "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
        "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    }
    rows: list[dict[str, object]] = []
    with ZipFile(WORKBOOK) as z:
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
            parsed_rows = []
            for row in ws.findall(".//a:sheetData/a:row", ns):
                values_by_column = {}
                for cell in row.findall("a:c", ns):
                    value = cell.find("a:v", ns)
                    text = ""
                    if value is not None and value.text is not None:
                        text = value.text
                        if cell.attrib.get("t") == "s":
                            try:
                                text = shared[int(text)]
                            except (ValueError, IndexError):
                                pass
                    values_by_column[column_index(cell.attrib.get("r", ""))] = clean(text)
                if values_by_column:
                    parsed_rows.append(values_by_column)
            if not parsed_rows:
                continue
            headers = [parsed_rows[0].get(i, "") for i in range(max(parsed_rows[0]) + 1)]
            if not {"Name", "x", "y"}.issubset(set(headers)):
                continue
            name_i = headers.index("Name")
            x_i = headers.index("x")
            y_i = headers.index("y")
            city_i = headers.index("City") if "City" in headers else None
            address_i = headers.index("Address") if "Address" in headers else None
            website_i = headers.index("Website") if "Website" in headers else None
            desc_i = headers.index("Description") if "Description" in headers else None
            type_i = headers.index("AssetType") if "AssetType" in headers else None
            for row in parsed_rows[1:]:
                name = clean(row.get(name_i, ""))
                if not name:
                    continue
                coord = parse_coordinate_pair(row.get(x_i, ""), row.get(y_i, ""))
                if not coord:
                    continue
                lat, lng, system = coord
                city = clean(row.get(city_i, "")) if city_i is not None else ""
                rows.append({
                    "id": slug(name, city),
                    "name": name,
                    "city": city,
                    "category": clean(row.get(type_i, "")) if type_i is not None else sheet_name.replace("_Table 1", ""),
                    "address": clean(row.get(address_i, "")) if address_i is not None else "",
                    "website": clean(row.get(website_i, "")) if website_i is not None else "",
                    "description": clean(row.get(desc_i, "")) if desc_i is not None else "",
                    "lat": lat,
                    "lng": lng,
                    "source": "Diana workbook",
                    "coordinateSource": system,
                    "confidence": "trusted",
                    "sheet": sheet_name,
                })
    return rows


def read_arcgis_rows() -> list[dict[str, object]]:
    data = json.loads(ARCGIS.read_text(encoding="utf-8"))
    rows = []
    for feature in data.get("features", []):
        coords = feature.get("geometry", {}).get("coordinates")
        if not coords or len(coords) < 2:
            continue
        props = feature.get("properties", {})
        name = clean(props.get("Name") or props.get("Organization") or props.get("Historic_Landmarks"))
        if not name:
            continue
        city = clean(props.get("City") or "")
        rows.append({
            "id": slug(name, city),
            "name": name,
            "city": city,
            "category": clean(props.get("_layer") or ""),
            "address": clean(props.get("Address") or props.get("Location") or ""),
            "website": clean(props.get("Website") or ""),
            "description": clean(props.get("Mission") or props.get("Description") or ""),
            "lat": float(coords[1]),
            "lng": float(coords[0]),
            "source": "ArcGIS cultural asset export",
            "coordinateSource": "arcgis-geometry",
            "confidence": "verified",
            "objectId": props.get("ObjectId"),
        })
    return rows


def build() -> dict[str, object]:
    workbook = read_workbook_rows()
    arcgis = read_arcgis_rows()
    current_v1 = json.loads(V1_PLACES.read_text(encoding="utf-8"))

    trusted_by_id: dict[str, dict[str, object]] = {}
    duplicates: list[dict[str, object]] = []
    for row in arcgis:
        trusted_by_id.setdefault(str(row["id"]), row)
    for row in workbook:
        existing = trusted_by_id.get(str(row["id"]))
        if existing:
            duplicates.append({"id": row["id"], "name": row["name"], "arcgis": existing["coordinateSource"], "workbook": row["coordinateSource"]})
            existing["alsoInWorkbook"] = True
            existing["workbookCoordinateSource"] = row["coordinateSource"]
            continue
        trusted_by_id[str(row["id"])] = row

    current_ids = {str(place["id"]) for place in current_v1}
    trusted_ids = set(trusted_by_id)
    quarantined_legacy = [place for place in current_v1 if str(place["id"]) not in trusted_ids]

    features = []
    for row in trusted_by_id.values():
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [row["lng"], row["lat"]]},
            "properties": {key: value for key, value in row.items() if key not in {"lat", "lng"}},
        })

    source_counts = Counter(feature["properties"]["source"] for feature in features)
    coord_counts = Counter(feature["properties"]["coordinateSource"] for feature in features)
    city_counts = Counter(clean(feature["properties"].get("city")) or "City missing" for feature in features)

    return {
        "prototype": {
            "question": "What does the map look like if markers come only from explainable coordinate sources?",
            "status": "throwaway prototype, not production data",
            "rule": "Visible markers are Diana workbook coordinates, ArcGIS geometry, or both. Current V1 legacy-only coordinate rows are quarantined.",
        },
        "stats": {
            "trustedMarkers": len(features),
            "arcgisRows": len(arcgis),
            "workbookRowsWithCoordinates": len(workbook),
            "trustedOverlapRows": len(duplicates),
            "currentV1VisiblePlaces": len(current_v1),
            "currentV1CoveredByTrustedCoordinates": len(current_ids & trusted_ids),
            "currentV1QuarantinedLegacyOnly": len(quarantined_legacy),
            "sourceCounts": dict(source_counts),
            "coordinateSourceCounts": dict(coord_counts),
            "topCities": dict(city_counts.most_common(12)),
        },
        "quarantinedExamples": [
            {
                "id": place.get("id"),
                "name": place.get("name"),
                "city": place.get("city"),
                "category": place.get("category"),
                "lat": place.get("lat"),
                "lng": place.get("lng"),
            }
            for place in quarantined_legacy[:80]
        ],
        "currentV1TrustedIds": sorted(current_ids & trusted_ids),
        "geojson": {"type": "FeatureCollection", "features": features},
    }


if __name__ == "__main__":
    data = build()
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"PROTOTYPE trusted markers: {data['stats']['trustedMarkers']}")
    print(f"PROTOTYPE current V1 quarantined legacy-only: {data['stats']['currentV1QuarantinedLegacyOnly']}")
    print(f"PROTOTYPE wrote {OUT}")
