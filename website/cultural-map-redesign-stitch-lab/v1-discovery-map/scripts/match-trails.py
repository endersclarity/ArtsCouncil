#!/usr/bin/env python3
"""Match the 233 "Walks & Trails / Needs Location Review" records to BYLT/OSM.

READ-ONLY: produces scripts/trail-match-report.json (proposed matches). It never
mutates data/places.json -- apply-trail-matches.py does that, gated on review.

Match priority per record:
  1. BYLT trail (best: full line geometry + rich fields + a trailhead coord)
  2. OSM named way (fallback: a representative centroid point, no drawn line)

Scoring: difflib ratio on normalized names, with a containment boost. A town
agreement gives a small boost but is not required (many records have no town,
and OSM has no reliable town field).

Usage:
  python scripts/match-trails.py            # full report
  python scripts/match-trails.py --pilot    # also print the 2 canary matches
"""
import difflib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

PLACES = os.path.join(ROOT, "data", "places.json")
BYLT_TRAILS = os.path.join(HERE, "bylt-trails.geojson")
BYLT_HEADS = os.path.join(HERE, "bylt-trailheads.geojson")
OSM_RAW = os.path.join(HERE, "osm-trails-raw.json")
REPORT = os.path.join(HERE, "trail-match-report.json")

BYLT_THRESH = 0.78
OSM_THRESH = 0.84
CANARIES = ["Alan Thiesen Trail", "Hirschman Trail"]

# BYLT scalar fields worth carrying onto the place record / detail card.
BYLT_FIELDS = ["Desc_", "Length", "Length_txt", "Difficulty", "Trail_Surf",
               "Perm_Use", "Access", "Location", "URL", "Photo_URL", "Altitude", "Manager"]

_STOP = {"trail", "trails", "route", "loop", "the", "ohv", "path", "and"}


def norm(name):
    s = (name or "").lower()
    s = re.sub(r"[:/\-_,.']", " ", s)
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    toks = [t for t in s.split() if t and t not in _STOP]
    return " ".join(toks)


def score(a, b):
    na, nb = norm(a), norm(b)
    if not na or not nb:
        return 0.0
    r = difflib.SequenceMatcher(None, na, nb).ratio()
    # Containment boost: one name's WHOLE tokens are all present in the other
    # (e.g. "cascade canal" inside "cascade canal banner mountain"). Whole-token
    # (not substring) + a 2-token floor avoids "ridge"<-"bridge", "cross"<-"crossing".
    ta, tb = set(na.split()), set(nb.split())
    shorter, longer = (ta, tb) if len(ta) <= len(tb) else (tb, ta)
    if len(shorter) >= 2 and shorter <= longer:
        r = max(r, 0.90)
    return r


def flatten_coords(geom):
    if not geom:
        return []
    t = geom.get("type")
    c = geom.get("coordinates")
    if t == "LineString":
        return list(c)
    if t == "MultiLineString":
        out = []
        for part in c:
            out.extend(part)
        return out
    if t == "Point":
        return [c]
    if t == "MultiPoint":
        return list(c)
    return []


def midpoint(geom):
    pts = flatten_coords(geom)
    if not pts:
        return None
    mid = pts[len(pts) // 2]
    return [round(mid[0], 6), round(mid[1], 6)]  # [lng, lat]


def load():
    places = json.load(open(PLACES, encoding="utf-8"))
    targets = [r for r in places
               if r.get("category") == "Walks & Trails"
               and r.get("locationReviewStatus") == "Needs Location Review"]
    bylt = json.load(open(BYLT_TRAILS, encoding="utf-8")).get("features", [])
    bylt = [f for f in bylt if (f.get("properties") or {}).get("NAME")]
    heads = json.load(open(BYLT_HEADS, encoding="utf-8")).get("features", [])
    osm = json.load(open(OSM_RAW, encoding="utf-8")).get("elements", [])
    osm = [e for e in osm if e.get("tags", {}).get("name")]
    return targets, bylt, heads, osm


def nearest_head(point, heads):
    """Nearest BYLT trailhead-parking point to a [lng,lat], crude planar distance."""
    if not point or not heads:
        return None
    best, bestd = None, 1e9
    lng, lat = point
    for h in heads:
        hp = midpoint(h.get("geometry"))
        if not hp:
            continue
        d = (hp[0] - lng) ** 2 + (hp[1] - lat) ** 2
        if d < bestd:
            bestd, best = d, hp
    # ~0.02 deg ~ 1.5 mi cap; beyond that the lot isn't this trail's head.
    return best if bestd <= 0.0004 else None


def best_bylt(rec, bylt):
    name = rec.get("name", "")
    best, bestsc = None, 0.0
    for f in bylt:
        sc = score(name, f["properties"]["NAME"])
        if sc > bestsc:
            bestsc, best = sc, f
    return best, bestsc


def best_osm(rec, osm):
    name = rec.get("name", "")
    best, bestsc = None, 0.0
    for e in osm:
        sc = score(name, e["tags"]["name"])
        if sc > bestsc:
            bestsc, best = sc, e
    return best, bestsc


def main():
    pilot = "--pilot" in sys.argv
    targets, bylt, heads, osm = load()

    entries = []
    for rec in targets:
        e = {"id": rec["id"], "name": rec["name"], "city": rec.get("city", ""),
             "matched": False, "source": None, "matched_name": None,
             "score": 0.0, "has_line": False, "trailhead": None, "fields": {}}

        bf, bsc = best_bylt(rec, bylt)
        if bf and bsc >= BYLT_THRESH:
            geom = bf.get("geometry")
            tp = midpoint(geom)
            head = nearest_head(tp, heads)
            props = bf["properties"]
            e.update({
                "matched": True, "source": "bylt",
                "matched_name": props["NAME"], "score": round(bsc, 3),
                "ref": props.get("FID"),
                "has_line": bool(geom),
                "trailhead": head or tp,
                "fields": {k: props.get(k) for k in BYLT_FIELDS if props.get(k) not in (None, "")},
            })
            entries.append(e)
            continue

        of, osc = best_osm(rec, osm)
        if of and osc >= OSM_THRESH:
            center = of.get("center") or {}
            e.update({
                "matched": True, "source": "osm",
                "matched_name": of["tags"]["name"], "score": round(osc, 3),
                "ref": of.get("id"),
                "has_line": False,
                "trailhead": [round(center["lon"], 6), round(center["lat"], 6)] if center else None,
                "fields": {"highway": of["tags"].get("highway"), "osm_id": of.get("id")},
            })
        else:
            # Record the near-miss to aid threshold tuning.
            e["near_miss"] = {"bylt": [bf["properties"]["NAME"] if bf else None, round(bsc, 3)],
                              "osm": [of["tags"]["name"] if of else None, round(osc, 3)]}
        entries.append(e)

    matched = [e for e in entries if e["matched"]]
    with_line = [e for e in matched if e["has_line"]]
    with_head = [e for e in matched if e["trailhead"]]
    by_bylt = [e for e in matched if e["source"] == "bylt"]
    by_osm = [e for e in matched if e["source"] == "osm"]

    report = {
        "generated_from": {"bylt_trails": len(bylt), "bylt_trailheads": len(heads), "osm_named": len(osm)},
        "thresholds": {"bylt": BYLT_THRESH, "osm": OSM_THRESH},
        "summary": {
            "targets": len(targets),
            "matched": len(matched),
            "matched_bylt": len(by_bylt),
            "matched_osm": len(by_osm),
            "with_line_geometry": len(with_line),
            "with_trailhead": len(with_head),
            "unmatched": len(targets) - len(matched),
        },
        "entries": entries,
    }
    with open(REPORT, "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)

    s = report["summary"]
    print("Trail match report -> scripts/trail-match-report.json")
    print("  targets: %d | matched: %d (bylt %d, osm %d) | with line: %d | with trailhead: %d | unmatched: %d"
          % (s["targets"], s["matched"], s["matched_bylt"], s["matched_osm"],
             s["with_line_geometry"], s["with_trailhead"], s["unmatched"]))

    if pilot:
        print("\n--- PILOT canaries ---")
        for c in CANARIES:
            hit = next((e for e in entries if e["name"] == c), None)
            if not hit:
                print("  %s: RECORD NOT FOUND" % c)
                continue
            print("  %s -> %s [%s, score %.3f] head=%s line=%s"
                  % (hit["name"], hit["matched_name"], hit["source"], hit["score"],
                     hit["trailhead"], hit["has_line"]))
            if hit["fields"]:
                print("     fields: %s" % {k: (str(v)[:40]) for k, v in hit["fields"].items()})


if __name__ == "__main__":
    main()
