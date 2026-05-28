#!/usr/bin/env python3
"""PROTOTYPE: build a Diana Workbook-only map dataset.

Question: what does V1 feel like if visible markers only come from coordinates
present in the Diana Workbook?
"""

from __future__ import annotations

import importlib.util
import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent / "diana-data.json"
TRUSTED_SCRIPT = (
    ROOT
    / "website/cultural-map-redesign-stitch-lab/v1-discovery-map/prototypes/trusted-coordinate-map/build_trusted_data.py"
)


def load_trusted_module():
    spec = importlib.util.spec_from_file_location("trusted_coordinate_builder", TRUSTED_SCRIPT)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


def main() -> None:
    trusted = load_trusted_module()
    workbook_rows = trusted.read_workbook_rows()
    current_v1 = json.loads(
        (
            ROOT
            / "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/places.json"
        ).read_text(encoding="utf-8")
    )
    workbook_ids = {str(row["id"]) for row in workbook_rows}
    current_ids = {str(place["id"]) for place in current_v1}

    features = []
    for row in workbook_rows:
        features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [row["lng"], row["lat"]]},
                "properties": {
                    key: value
                    for key, value in row.items()
                    if key not in {"lat", "lng"}
                },
            }
        )

    source_counts = Counter(feature["properties"].get("source") for feature in features)
    coord_counts = Counter(feature["properties"].get("coordinateSource") for feature in features)
    sheet_counts = Counter(feature["properties"].get("sheet") for feature in features)
    city_counts = Counter(feature["properties"].get("city") or "City missing" for feature in features)

    payload = {
        "prototype": {
            "question": "What if visible V1 markers only use coordinates from the Diana Workbook?",
            "status": "throwaway prototype, not production data",
            "visibleRule": "Only rows with coordinates in the Diana Workbook are visible as map markers.",
            "dianaWorkbook": "docs/source-artifacts/Cultural Assets - data engineering.xlsx",
        },
        "stats": {
            "visibleDianaMarkers": len(features),
            "currentV1VisiblePlaces": len(current_v1),
            "currentV1RowsAlsoInDianaCoordinateSet": len(current_ids & workbook_ids),
            "currentV1RowsWithoutDianaCoordinates": len(current_ids - workbook_ids),
            "sourceCounts": dict(source_counts),
            "coordinateSourceCounts": dict(coord_counts),
            "topSheets": dict(sheet_counts.most_common(8)),
            "topCities": dict(city_counts.most_common(8)),
        },
        "geojson": {"type": "FeatureCollection", "features": features},
    }
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {OUT}")
    print(f"visible Diana markers: {len(features)}")


if __name__ == "__main__":
    main()
