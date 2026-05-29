# CLA-28 — apply the rooftop-geocode patch to places.json.
# Lives in app/tools/ (a TRACKED dir) so it can't get wiped like the untracked issue folder.
# Moves ONLY the safe accepts onto their OSM coords; leaves everything else untouched.
#
# Safe-to-apply rule (must match tests/test_cla28_census_geocode_patch.js):
#   decision == "accept"  AND  shift_m <= APPLY_MAX_SHIFT_M
# The shift cutoff is the SECOND gate: it rejects building-typed-but-wrong-building
# OSM matches (same house number on another street / same-named POI miles away),
# which show up as large jumps inside the "accept" bucket (worst ~4.4 km).
#
# Run from app/:  python tools/cla28_apply_patch.py
import json, io, os

APPLY_MAX_SHIFT_M = 150
HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(HERE)
PLACES = os.path.join(APP, "website", "cultural-map-redesign-stitch-lab",
                      "v1-discovery-map", "data", "places.json")
PATCH = os.path.join(APP, "docs", "issues", "CLA-28-street-interpolated-rows",
                     "_census_patch.json")

raw = io.open(PLACES, encoding="utf-8").read()
trailing_nl = raw.endswith("\n")
places = json.loads(raw)
patch = json.load(io.open(PATCH, encoding="utf-8"))
by_id = {p["id"]: p for p in places}

def is_applied(r):
    return (r.get("decision") == "accept"
            and isinstance(r.get("shift_m"), (int, float))
            and r["shift_m"] <= APPLY_MAX_SHIFT_M
            and not str(r.get("osm_kind", "")).startswith("highway"))

applied = quarantined = missing = 0
for r in patch:
    p = by_id.get(r["id"])
    if p is None:
        missing += 1
        continue
    if not is_applied(r):
        quarantined += 1
        continue
    p["lat"] = r["osm_lat"]
    p["lng"] = r["osm_lng"]
    p["coordinateSource"] = "osm-nominatim"
    p["coordinateConfidence"] = "high"
    p["coordinateProvenance"] = "osm-rooftop"
    p["locationReviewStatus"] = "Map-Ready"
    p["locationCaveat"] = ""
    applied += 1

out = json.dumps(places, ensure_ascii=False, indent=2)
if trailing_nl:
    out += "\n"
io.open(PLACES, "w", encoding="utf-8").write(out)
print(f"APPLIED={applied} QUARANTINED={quarantined} MISSING={missing} TOTAL={len(places)}")
