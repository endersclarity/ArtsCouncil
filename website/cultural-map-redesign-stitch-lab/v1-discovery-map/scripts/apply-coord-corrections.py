# Apply audit-driven coordinate corrections to places.json. Conservative and
# reversible: only overwrite a coordinate when the Census found an EXACT rooftop
# match AND the stored point is grossly wrong (> CORRECT_M). Smaller exact-match
# disagreements are not overwritten but get downgraded to the 'candidate' tier so
# the map renders them as honest rings, and stamped for human review.
# Writes scripts/coord-corrections-log.json. Run with --apply to write places.json.
import json, sys

PLACES = "data/places.json"
REPORT = "scripts/coord-audit-report.json"
LOG = "scripts/coord-corrections-log.json"
CORRECT_M = 3000      # above this, an exact-match census rooftop replaces the stored point
DOWNGRADE_M = 150     # flagged but below CORRECT_M: keep coord, drop confidence

apply = "--apply" in sys.argv
data = json.load(open(PLACES, encoding="utf-8"))
rows = data.get("places", data) if isinstance(data, dict) else data
by = {r["id"]: r for r in rows}
report = {x["id"]: x for x in json.load(open(REPORT, encoding="utf-8"))["report"]}

corrected, downgraded = [], []
for pid, a in report.items():
    if a.get("status") != "flag":
        continue
    r = by.get(pid)
    if not r:
        continue
    dist = a.get("distanceM", 0)
    exact = a.get("exact") == "Exact"
    raw = next((x for x in json.load(open(REPORT, encoding="utf-8"))["report"] if x["id"] == pid), {})
    if exact and dist > CORRECT_M:
        before = {"lat": r["lat"], "lng": r["lng"], "source": r.get("coordinateSource"), "tier": r.get("markerTier")}
        # census coords live only in the report's distance calc; re-pull from audit report
        # (report rows don't carry census coords, so read them from the full report file once)
        corrected.append({"id": pid, "name": r["name"], "distanceM": dist, "before": before})
    elif dist > DOWNGRADE_M:
        if r.get("markerTier") == "map-ready":
            downgraded.append({"id": pid, "name": r["name"], "distanceM": dist,
                               "wasTier": "map-ready", "source": r.get("coordinateSource")})

# Pull census coords for the corrigible set from the report file (has censusLat/Lng on flags array).
audit = json.load(open(REPORT, encoding="utf-8"))
flagmap = {f["id"]: f for f in audit.get("flags", [])}
# flags array doesn't carry census coords either in current schema; recompute by re-reading triage if present.
# Fallback: corrections require census coords, so read them from the report's per-id if available.

# The report rows lack censusLat; re-run is unnecessary — we stored matchedAddress only.
# To keep this self-contained, fetch census coords from the saved raw results if present:
raw_results = audit.get("censusCoords", {})

applied_corr = []
for c in corrected:
    cc = raw_results.get(c["id"])
    if not cc:
        c["action"] = "needs-census-coord (rerun audit with --emit-coords)"
        continue
    if apply:
        r = by[c["id"]]
        r["lat"], r["lng"] = cc["lat"], cc["lng"]
        r["coordinateSource"] = "us-census-geocoder-corrected"
        r["coordinateConfidence"] = "rooftop-exact"
        r["locationCaveat"] = f"Auto-corrected {c['distanceM']:.0f}m from prior {c['before']['source']} point (audit {audit['summary']['flagThresholdMeters']}m)."
    c["after"] = cc
    c["action"] = "corrected" if apply else "would-correct"
    applied_corr.append(c)

for d in downgraded:
    if apply:
        r = by[d["id"]]
        r["markerTier"] = "candidate"
        r["locationReviewStatus"] = "Needs Location Review"
        r["locationCaveat"] = f"Tier downgraded by audit: {d['distanceM']:.0f}m from exact address geocode."

if apply:
    json.dump(data, open(PLACES, "w", encoding="utf-8"), indent=1, ensure_ascii=False)

log = {"applied": apply, "correctThresholdM": CORRECT_M,
       "corrected": applied_corr, "downgraded": downgraded,
       "counts": {"corrected": len([c for c in applied_corr if c.get('after')]),
                  "downgraded": len(downgraded)}}
json.dump(log, open(LOG, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print(json.dumps(log["counts"], indent=1))
print("corrected names:", [c["name"] for c in applied_corr])
print("downgraded:", len(downgraded))
