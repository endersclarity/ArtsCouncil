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
import math
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
# Prefer the OSM polyline over BYLT's line only at a near-exact name match, so we
# never draw the wrong (but fuller) OSM way. Below this, a matched OSM trail still
# contributes a name/point but BYLT keeps the drawn line.
OSM_LINE_THRESH = 0.92
CANARIES = ["Hirschman Trail", "Round Mountain Trail", "South Yuba Trail"]

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


def osm_line_coords(elem):
    """[[lng,lat],...] from an Overpass `out geom` way (geometry = [{lat,lon},...])."""
    g = (elem or {}).get("geometry") or []
    return [[round(p["lon"], 6), round(p["lat"], 6)] for p in g if "lat" in p and "lon" in p]


def line_length_km(coords):
    """Great-circle length of a [[lng,lat],...] polyline, km."""
    if not coords or len(coords) < 2:
        return 0.0
    R = 6371.0
    tot = 0.0
    for (lo1, la1), (lo2, la2) in zip(coords, coords[1:]):
        p1, p2 = math.radians(la1), math.radians(la2)
        dp, dl = math.radians(la2 - la1), math.radians(lo2 - lo1)
        a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
        tot += 2 * R * math.asin(min(1.0, math.sqrt(a)))
    return tot


def geom_length_km(geom):
    """Length of a GeoJSON geometry, km. Sums MultiLineString parts; 0 for points."""
    if not geom:
        return 0.0
    t, c = geom.get("type"), geom.get("coordinates")
    if t == "LineString":
        return line_length_km(c)
    if t == "MultiLineString":
        return sum(line_length_km(p) for p in c)
    return 0.0


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
             "score": 0.0, "has_line": False, "trailhead": None, "fields": {},
             "geom_source": None, "geom_ref": None, "geom_vertices": 0}

        bf, bsc = best_bylt(rec, bylt)
        of, osc = best_osm(rec, osm)
        bylt_ok = bool(bf) and bsc >= BYLT_THRESH
        osm_ok = bool(of) and osc >= OSM_THRESH

        if not bylt_ok and not osm_ok:
            e["near_miss"] = {"bylt": [bf["properties"]["NAME"] if bf else None, round(bsc, 3)],
                              "osm": [of["tags"]["name"] if of else None, round(osc, 3)]}
            entries.append(e)
            continue

        # Geometry source: among lines we trust (OSM only at a near-exact name match;
        # BYLT whenever it carries a line), draw the FULLER one by great-circle length.
        # This kills BYLT stubs (Coyote View) without discarding a complete BYLT trail
        # for a short OSM fragment (South Yuba: BYLT 4498 vtx vs one 121-vtx OSM segment).
        osm_coords = osm_line_coords(of) if of else []
        osm_line_ok = osm_ok and osc >= OSM_LINE_THRESH and len(osm_coords) >= 2
        bylt_geom = bf.get("geometry") if bylt_ok else None  # only a trusted BYLT match
        bylt_has_line = bool(bylt_geom) and bylt_geom.get("type") in ("LineString", "MultiLineString")

        osm_km = line_length_km(osm_coords) if osm_line_ok else 0.0
        bylt_km = geom_length_km(bylt_geom) if bylt_has_line else 0.0

        if osm_line_ok and (not bylt_has_line or osm_km >= bylt_km):
            geom = {"type": "LineString", "coordinates": osm_coords}
            geom_source, geom_ref, has_line = "osm", of.get("id"), True
        elif bylt_has_line:
            geom = bylt_geom
            geom_source, geom_ref, has_line = "bylt", bf["properties"].get("FID"), True
        else:
            pts = osm_coords if (osm_ok and osm_coords) else flatten_coords(bylt_geom)
            geom = {"type": "Point", "coordinates": pts[len(pts) // 2]} if pts else None
            geom_source, geom_ref, has_line = "point", None, False

        tp = midpoint(geom)
        head = (nearest_head(tp, heads) or tp) if tp else None

        # Meta source: BYLT's rich fields whenever BYLT matched (OSM lacks difficulty/length/photo).
        if bylt_ok:
            props = bf["properties"]
            meta_source, meta_ref = "bylt", props.get("FID")
            matched_name = props["NAME"]
            fields = {k: props.get(k) for k in BYLT_FIELDS if props.get(k) not in (None, "")}
            score = round(bsc, 3)
        else:
            meta_source, meta_ref = "osm", of.get("id")
            matched_name = of["tags"]["name"]
            fields = {"highway": of["tags"].get("highway"), "osm_id": of.get("id")}
            score = round(osc, 3)

        e.update({
            "matched": True,
            "source": meta_source, "ref": meta_ref,
            "geom_source": geom_source, "geom_ref": geom_ref,
            "matched_name": matched_name, "score": score,
            "bylt_score": round(bsc, 3), "osm_score": round(osc, 3),
            "has_line": has_line,
            "geom_vertices": len(flatten_coords(geom)),
            "geom_km": round(geom_length_km(geom), 3),
            "bylt_km": round(bylt_km, 3), "osm_km": round(osm_km, 3),
            "trailhead": head,
            "fields": fields,
        })
        entries.append(e)

    matched = [e for e in entries if e["matched"]]
    with_line = [e for e in matched if e["has_line"]]
    with_head = [e for e in matched if e["trailhead"]]
    by_bylt = [e for e in matched if e["source"] == "bylt"]
    by_osm = [e for e in matched if e["source"] == "osm"]
    geom_osm = [e for e in matched if e["geom_source"] == "osm"]
    geom_bylt = [e for e in matched if e["geom_source"] == "bylt"]
    geom_point = [e for e in matched if e["geom_source"] == "point"]

    report = {
        "generated_from": {"bylt_trails": len(bylt), "bylt_trailheads": len(heads), "osm_named": len(osm)},
        "thresholds": {"bylt": BYLT_THRESH, "osm": OSM_THRESH, "osm_line": OSM_LINE_THRESH},
        "summary": {
            "targets": len(targets),
            "matched": len(matched),
            "matched_bylt": len(by_bylt),
            "matched_osm": len(by_osm),
            "with_line_geometry": len(with_line),
            "geom_osm_line": len(geom_osm),
            "geom_bylt_line": len(geom_bylt),
            "geom_point": len(geom_point),
            "with_trailhead": len(with_head),
            "unmatched": len(targets) - len(matched),
        },
        "entries": entries,
    }
    with open(REPORT, "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)

    s = report["summary"]
    print("Trail match report -> scripts/trail-match-report.json")
    print("  targets: %d | matched: %d (meta: bylt %d, osm %d) | with line: %d | unmatched: %d"
          % (s["targets"], s["matched"], s["matched_bylt"], s["matched_osm"],
             s["with_line_geometry"], s["unmatched"]))
    print("  geometry source: OSM-line %d | BYLT-line %d | point %d"
          % (s["geom_osm_line"], s["geom_bylt_line"], s["geom_point"]))

    if pilot:
        targ_by_name = {r["name"]: r for r in targets}
        print("\n--- PILOT canaries (OSM line vs BYLT stub) ---")
        for c in CANARIES:
            rec = targ_by_name.get(c)
            hit = next((e for e in entries if e["name"] == c), None)
            if not rec or not hit:
                print("  %s: NOT among the %d location-review targets" % (c, len(targets)))
                continue
            bf, bsc = best_bylt(rec, bylt)
            of, osc = best_osm(rec, osm)
            bylt_v = len(flatten_coords(bf.get("geometry"))) if bf else 0
            osm_v = len(osm_line_coords(of))
            bylt_km = geom_length_km(bf.get("geometry")) if bf else 0.0
            osm_km = line_length_km(osm_line_coords(of))
            print("  %s" % c)
            print("     BYLT: '%s' score %.3f, %d vtx %.2f km | OSM: '%s' score %.3f, %d vtx %.2f km"
                  % (bf["properties"]["NAME"] if bf else "-", bsc, bylt_v, bylt_km,
                     of["tags"]["name"] if of else "-", osc, osm_v, osm_km))
            print("     CHOSEN: geom_source=%s (%.2f km), meta_source=%s, line=%s"
                  % (hit["geom_source"], hit["geom_km"], hit["source"], hit["has_line"]))


if __name__ == "__main__":
    main()
