#!/usr/bin/env python3
"""Apply the trail match report to the data layer. MUTATES data/places.json.

For each matched record in scripts/trail-match-report.json:
  - writes line/point geometry to the sidecar data/trails.json (keyed by place id),
    so places.json stays lean (BYLT lines total ~4 MB).
  - sets the place record's lat/lng to the representative trailhead coordinate.
  - flips locationReviewStatus -> "Map-Ready" and coordinateSource -> bylt/osm.
  - attaches a `trail` object (difficulty, length, surface, uses, url, photo, manager)
    and a `trailRef` pointing into the sidecar. Existing real images/descriptions
    are preserved; trail meta is additive.

Idempotent (re-run = same result) and reversible: original field values for every
touched record are recorded in scripts/trail-apply-log.json. Run with --revert to
restore them.

Mirrors the audit -> apply-coord-corrections pattern already in this repo.

Usage:
  python scripts/apply-trail-matches.py            # apply
  python scripts/apply-trail-matches.py --dry-run  # report what would change
  python scripts/apply-trail-matches.py --revert   # roll back using the log
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

PLACES = os.path.join(ROOT, "data", "places.json")
TRAILS = os.path.join(ROOT, "data", "trails.json")
BYLT_TRAILS = os.path.join(HERE, "bylt-trails.geojson")
OSM_RAW = os.path.join(HERE, "osm-trails-raw.json")
REPORT = os.path.join(HERE, "trail-match-report.json")
LOG = os.path.join(HERE, "trail-apply-log.json")

# Map a place `trail` object from BYLT field names.
TRAIL_META = {
    "difficulty": "Difficulty", "length_txt": "Length_txt", "length_mi": "Length",
    "surface": "Trail_Surf", "uses": "Access", "permitted": "Perm_Use",
    "url": "URL", "photo": "Photo_URL", "altitude": "Altitude",
    "manager": "Manager", "blurb": "Desc_",
}
TOUCHED_FIELDS = ["lat", "lng", "locationReviewStatus", "coordinateSource",
                  "coordinateConfidence", "coordinateProvenance", "publicMarker",
                  "markerTier", "trail", "trailRef"]


def load_json(path):
    return json.load(open(path, encoding="utf-8"))


def bylt_geom_by_fid():
    feats = load_json(BYLT_TRAILS).get("features", [])
    out = {}
    for f in feats:
        fid = (f.get("properties") or {}).get("FID")
        if fid is not None and f.get("geometry"):
            out[fid] = f["geometry"]
    return out


def osm_line_by_id():
    """LineString per OSM way id, from an `out geom` pull (geometry = [{lat,lon},...])."""
    out = {}
    for e in load_json(OSM_RAW).get("elements", []):
        g = e.get("geometry") or []
        coords = [[round(p["lon"], 6), round(p["lat"], 6)] for p in g if "lat" in p and "lon" in p]
        if len(coords) >= 2:
            out[e["id"]] = {"type": "LineString", "coordinates": coords}
    return out


def revert():
    if not os.path.exists(LOG):
        print("No apply log; nothing to revert.")
        return
    log = load_json(LOG)
    places = load_json(PLACES)
    by_id = {r["id"]: r for r in places}
    n = 0
    for entry in log.get("originals", []):
        rec = by_id.get(entry["id"])
        if not rec:
            continue
        for k in TOUCHED_FIELDS:
            rec.pop(k, None)
        for k, v in entry["fields"].items():
            rec[k] = v
        n += 1
    json.dump(places, open(PLACES, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    if os.path.exists(TRAILS):
        os.remove(TRAILS)
    print("Reverted %d records; removed data/trails.json." % n)


def main():
    if "--revert" in sys.argv:
        revert()
        return
    dry = "--dry-run" in sys.argv

    report = load_json(REPORT)
    matched = [e for e in report["entries"] if e["matched"]]
    places = load_json(PLACES)
    by_id = {r["id"]: r for r in places}

    geom_bylt = bylt_geom_by_fid()
    geom_osm = osm_line_by_id()

    sidecar = {}
    originals = []
    promoted = 0

    for e in matched:
        rec = by_id.get(e["id"])
        if not rec:
            continue
        head = e.get("trailhead")
        if not head:
            continue

        # Geometry comes from whichever source the matcher chose as the FULLER line
        # (geom_source/geom_ref), independent of the meta source (e["source"]).
        gsrc = e.get("geom_source")
        if gsrc == "osm":
            geom = geom_osm.get(e.get("geom_ref"))
        elif gsrc == "bylt":
            geom = geom_bylt.get(e.get("geom_ref"))
        else:
            geom = None
        if geom is None and head:
            geom = {"type": "Point", "coordinates": head}

        # Record originals for reversibility (only fields we touch).
        originals.append({"id": e["id"],
                          "fields": {k: rec.get(k) for k in TOUCHED_FIELDS if k in rec}})

        trail_meta = {}
        for out_key, src_key in TRAIL_META.items():
            val = e.get("fields", {}).get(src_key)
            if val not in (None, ""):
                trail_meta[out_key] = val
        trail_meta["source"] = e["source"]
        trail_meta["matchedName"] = e.get("matched_name")

        sidecar[e["id"]] = {
            "geometry": geom,
            "trailhead": head,
            "source": e["source"],
            "geomSource": e.get("geom_source"),  # provenance of the drawn line (ODbL if osm)
            "matchedName": e.get("matched_name"),
            "hasLine": geom.get("type") in ("LineString", "MultiLineString"),
        }

        if not dry:
            rec["lng"], rec["lat"] = head[0], head[1]
            rec["locationReviewStatus"] = "Map-Ready"
            rec["coordinateSource"] = e["source"]
            rec["coordinateConfidence"] = "high" if e["source"] == "bylt" else "medium"
            rec["coordinateProvenance"] = e["source"] + "-trail"
            rec["publicMarker"] = True
            rec["markerTier"] = "candidate"
            rec["trail"] = trail_meta
            rec["trailRef"] = e["id"]
        promoted += 1

    s = report["summary"]
    print("Apply trail matches  (dry-run=%s)" % dry)
    print("  matched in report: %d | would promote: %d | with line geometry: %d"
          % (s["matched"], promoted, sum(1 for v in sidecar.values() if v["hasLine"])))

    if dry:
        print("  (dry run: no files written)")
        return

    json.dump({"type": "trail-geometry-sidecar", "trails": sidecar},
              open(TRAILS, "w", encoding="utf-8"), ensure_ascii=False)
    json.dump(places, open(PLACES, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    json.dump({"applied": promoted, "originals": originals},
              open(LOG, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("  wrote data/trails.json (%d trails), updated data/places.json, log -> trail-apply-log.json"
          % len(sidecar))


if __name__ == "__main__":
    main()
