#!/usr/bin/env python3
"""Independent verifier for the trail-data-layer loop.

Reads ONLY on-disk artifacts (never the matcher/applier internals) and exits 0
only when the contract holds:
  1. raw pulls present with sane counts;
  2. trail-match-report.json internally consistent;
  3. every record the report marks matched is, in places.json, promoted to
     Map-Ready with a trailhead lat/lng, a trailRef resolving in data/trails.json,
     and >=1 trail meta field;
  4. promoted-and-matched count >= FLOOR.

Prints the true promoted count regardless of pass/fail. Exit 1 on any failure.

Usage: python scripts/verify-trail-data.py [--floor N]
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

PLACES = os.path.join(ROOT, "data", "places.json")
TRAILS = os.path.join(ROOT, "data", "trails.json")
REPORT = os.path.join(HERE, "trail-match-report.json")
RAW = {
    "bylt-trails.geojson": (os.path.join(HERE, "bylt-trails.geojson"), 300),
    "bylt-trailheads.geojson": (os.path.join(HERE, "bylt-trailheads.geojson"), 60),
    "osm-trails-raw.json": (os.path.join(HERE, "osm-trails-raw.json"), 200),
}

# Floor lowered 150 -> 135 (user-sanctioned 2026-06-13): precise BYLT+OSM tops out
# at 135; the remaining ~45 OHV routes need USFS Tahoe NF (a separate source).
# (After the OSM `out geom` rework, matched rose to ~159; 135 stays as a regression floor.)
FLOOR = 135

# OSM `out geom` rework: trails whose drawn line now comes from OSM (fuller than the
# BYLT stub, or BYLT-absent). Honest first count = 36; floor leaves margin.
OSM_LINE_FLOOR = 30


def fail(msg):
    print("  FAIL:", msg)
    return False


def main():
    floor = FLOOR
    if "--floor" in sys.argv:
        floor = int(sys.argv[sys.argv.index("--floor") + 1])

    ok = True
    print("Verifying trail data layer (floor=%d) ..." % floor)

    # 1. Raw artifacts.
    for name, (path, minfeat) in RAW.items():
        if not os.path.exists(path):
            ok = fail("missing raw artifact %s" % name); continue
        data = json.load(open(path, encoding="utf-8"))
        n = len(data.get("features", data.get("elements", [])))
        if n < minfeat:
            ok = fail("%s has only %d features (< %d)" % (name, n, minfeat))

    if not os.path.exists(REPORT):
        print("  FAIL: no trail-match-report.json"); print("RESULT: FAIL"); sys.exit(1)
    report = json.load(open(REPORT, encoding="utf-8"))
    matched = [e for e in report["entries"] if e["matched"]]

    # Geometry-source self-consistency + OSM-line floor (the point of this rework).
    gs = {"osm": 0, "bylt": 0, "point": 0, None: 0}
    for e in matched:
        gs[e.get("geom_source")] = gs.get(e.get("geom_source"), 0) + 1
    osm_line = gs.get("osm", 0)
    print("  geometry source: OSM-line %d | BYLT-line %d | point %d"
          % (osm_line, gs.get("bylt", 0), gs.get("point", 0)))
    if osm_line < OSM_LINE_FLOOR:
        ok = fail("OSM-line geometry %d < floor %d" % (osm_line, OSM_LINE_FLOOR))

    if not os.path.exists(TRAILS):
        print("  FAIL: no data/trails.json (apply not run)"); print("promoted: 0"); print("RESULT: FAIL"); sys.exit(1)
    sidecar = json.load(open(TRAILS, encoding="utf-8")).get("trails", {})
    places = json.load(open(PLACES, encoding="utf-8"))
    by_id = {r["id"]: r for r in places}

    promoted = 0
    structural_bad = 0
    for e in matched:
        rec = by_id.get(e["id"])
        if not rec:
            ok = fail("report id not in places.json: %s" % e["id"]); structural_bad += 1; continue
        problems = []
        if rec.get("locationReviewStatus") != "Map-Ready":
            problems.append("not Map-Ready")
        if not (isinstance(rec.get("lat"), (int, float)) and isinstance(rec.get("lng"), (int, float))):
            problems.append("no lat/lng")
        ref = rec.get("trailRef")
        if not ref or ref not in sidecar:
            problems.append("trailRef missing/unresolved")
        if not rec.get("trail"):
            problems.append("no trail meta")
        if problems:
            structural_bad += 1
            if structural_bad <= 6:
                ok = fail("%s: %s" % (e["id"], ", ".join(problems)))
        else:
            promoted += 1

    print("  report matched: %d | structurally valid & promoted: %d | bad: %d"
          % (len(matched), promoted, structural_bad))
    print("promoted: %d" % promoted)

    if structural_bad:
        ok = False
    if promoted < floor:
        ok = fail("promoted %d < floor %d" % (promoted, floor))

    print("RESULT:", "PASS" if ok else "FAIL")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
