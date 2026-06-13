#!/usr/bin/env python3
"""Fetch BYLT (Bear Yuba Land Trust) trail data as WGS84 GeoJSON.

Source: services6.arcgis.com/wuk3UeLQ401hBhEO (public hosted feature services,
confirmed queryable 2026-06-12). Two layers:
  - BYLT_Other_Trails_v9/FeatureServer/0  ~342 trail polylines (MultiLineString)
  - Parking_Lots_v5/FeatureServer/0       ~74 trailhead parking points

Writes scripts/bylt-trails.geojson and scripts/bylt-trailheads.geojson. The
?f=geojson&outSR=4326 request returns geographic coords that overlay MapLibre
directly (no reprojection). Idempotent: re-run to refresh.

Licensing to-do (not a blocker for fetching): BYLT is a fellow Grass Valley
nonprofit; surface needs their written OK + attribution before publish.

Usage: python scripts/fetch-bylt-trails.py
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request

HOST = "https://services6.arcgis.com/wuk3UeLQ401hBhEO/arcgis/rest/services"
HERE = os.path.dirname(os.path.abspath(__file__))

LAYERS = {
    "bylt-trails.geojson": "BYLT_Other_Trails_v9/FeatureServer/0",
    "bylt-trailheads.geojson": "Parking_Lots_v5/FeatureServer/0",
}


def fetch_geojson(layer_path):
    """Page through an ArcGIS feature layer, returning a merged GeoJSON dict."""
    features = []
    offset = 0
    page = 1000
    while True:
        params = {
            "where": "1=1",
            "outFields": "*",
            "f": "geojson",
            "outSR": "4326",
            "resultOffset": offset,
            "resultRecordCount": page,
        }
        url = HOST + "/" + layer_path + "/query?" + urllib.parse.urlencode(params)
        for attempt in range(3):
            try:
                with urllib.request.urlopen(url, timeout=60) as resp:
                    chunk = json.load(resp)
                break
            except Exception as exc:  # noqa: BLE001 - network retry
                if attempt == 2:
                    raise
                print("    retry after error:", str(exc)[:80], file=sys.stderr)
                time.sleep(2)
        feats = chunk.get("features", [])
        features.extend(feats)
        if len(feats) < page or chunk.get("exceededTransferLimit") is False:
            if len(feats) < page:
                break
        if not feats:
            break
        offset += len(feats)
    return {"type": "FeatureCollection", "features": features}


def main():
    for filename, layer_path in LAYERS.items():
        print("Fetching", layer_path, "...")
        gj = fetch_geojson(layer_path)
        out = os.path.join(HERE, filename)
        with open(out, "w", encoding="utf-8") as fh:
            json.dump(gj, fh, ensure_ascii=False)
        geom_types = sorted({(f.get("geometry") or {}).get("type") or "null" for f in gj["features"]})
        print("  -> %s  (%d features, geom %s)" % (filename, len(gj["features"]), geom_types))


if __name__ == "__main__":
    main()
