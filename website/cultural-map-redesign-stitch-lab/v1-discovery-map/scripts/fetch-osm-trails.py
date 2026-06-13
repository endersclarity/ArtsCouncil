#!/usr/bin/env python3
"""Fetch named trail ways in Nevada County from OpenStreetMap via Overpass.

OSM is the name + centroid fallback for trails BYLT does not carry (ODbL:
attribution + share-alike on publish). `out center` returns a representative
point per way, not the full polyline -- enough to place a trailhead-style dot
and to name-match. Trails that need a drawn line should match BYLT (which
carries full geometry) or be re-fetched here with `out geom`.

Writes scripts/osm-trails-raw.json. Idempotent: skips if the file already holds
a non-trivial pull unless --force is passed (Overpass is rate-limited; don't
hammer it).

Usage: python scripts/fetch-osm-trails.py [--force]
"""
import json
import os
import sys
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "osm-trails-raw.json")
ENDPOINT = "https://overpass-api.de/api/interpreter"

# Nevada County bounding box (S, W, N, E), generous to catch Truckee/OHV cluster.
BBOX = "39.00,-121.30,39.62,-120.00"

QUERY = """
[out:json][timeout:90];
(
  way["highway"~"^(path|footway|track|bridleway|cycleway|steps)$"]["name"](%s);
);
out tags center;
""" % BBOX


def main():
    force = "--force" in sys.argv
    if os.path.exists(OUT) and not force:
        try:
            existing = json.load(open(OUT, encoding="utf-8"))
            n = len(existing.get("elements", []))
            if n > 50:
                print("osm-trails-raw.json already has %d elements; skipping (use --force to refetch)." % n)
                return
        except Exception:
            pass

    print("Querying Overpass for named trail ways in Nevada County ...")
    data = urllib.parse.urlencode({"data": QUERY}).encode("utf-8")
    req = urllib.request.Request(ENDPOINT, data=data)
    with urllib.request.urlopen(req, timeout=120) as resp:
        payload = json.load(resp)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False)
    named = [e for e in payload.get("elements", []) if e.get("tags", {}).get("name")]
    print("  -> osm-trails-raw.json  (%d elements, %d named)" % (len(payload.get("elements", [])), len(named)))


if __name__ == "__main__":
    main()
