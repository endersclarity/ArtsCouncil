"""Stage 4 of the data-cleanliness pass: parcel-locator check of no-census-match places.

Geocodes the 127 places the US Census audit could not match, against Nevada
County's own parcel-address locator (PARCEL_ADDRESS_PRO_LOC GeocodeServer).
Same conservative rules as the census audit:
  - score >= 95 exact match AND stored point > 3 km away  -> correct the point
  - score >= 95 AND 150 m - 3 km                          -> downgrade map-ready -> candidate
  - score >= 95 AND <= 150 m                              -> confirmed OK
  - weaker/no candidate                                   -> untouched
Dry-run by default; --apply writes places.json and appends coord-corrections-log.json.
"""
import json, os, sys, math, time, datetime, urllib.request, urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
LOC = "https://maps.nevadacountyca.gov/arcgis/rest/services/web_public/PARCEL_ADDRESS_PRO_LOC/GeocodeServer/findAddressCandidates"
UA = {"User-Agent": "NCACCulturalMap/1.0"}
TODAY = datetime.date.today().isoformat()

# Corrections to skip: the ADDRESS field itself is suspect, so an exact parcel
# match would move the pin to the wrong kind of place. Human review instead.
EXCLUDE_CORRECTIONS = {
    # name says Broad St downtown, address field says residential Tammy Way
    "broad-street-inn-nevada-city",
}


def dist_m(lat1, lon1, lat2, lon2):
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1) * math.cos(math.radians((lat1 + lat2) / 2))
    return 6371000 * math.hypot(dlat, dlon)


def geocode(addr):
    q = LOC + "?SingleLine=" + urllib.parse.quote(addr) + "&outSR=4326&maxLocations=1&f=json"
    req = urllib.request.Request(q, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.load(r)
    c = (d.get("candidates") or [None])[0]
    return c


def main():
    apply = "--apply" in sys.argv
    audit = json.load(open(os.path.join(ROOT, "coord-audit-report.json"), encoding="utf8"))
    nm_ids = {r["id"] for r in audit["report"] if r["status"] == "no-census-match"}
    places = json.load(open(os.path.join(ROOT, "..", "data", "places.json"), encoding="utf8"))
    byid = {p["id"]: p for p in places}

    results, corrections, downgrades, confirmed = [], [], [], []
    for pid in sorted(nm_ids):
        p = byid.get(pid)
        if not p or not p.get("address") or not (p.get("lat") and p.get("lng")):
            results.append({"id": pid, "status": "no-address-or-coords"})
            continue
        try:
            c = geocode(p["address"])
        except Exception as e:
            results.append({"id": pid, "status": f"geocode-error:{str(e)[:50]}"})
            continue
        time.sleep(0.15)
        if not c or c.get("score", 0) < 95:
            results.append({"id": pid, "status": "no-parcel-match", "score": c.get("score") if c else None})
            continue
        d = dist_m(p["lat"], p["lng"], c["location"]["y"], c["location"]["x"])
        row = {"id": pid, "status": "", "score": c["score"], "distM": round(d), "parcel": {"lat": c["location"]["y"], "lng": c["location"]["x"]}, "matched": c["address"]}
        if d > 3000 and pid in EXCLUDE_CORRECTIONS:
            row["status"] = "excluded-needs-human"
            downgrades.append((p, row))
        elif d > 3000:
            row["status"] = "correct"
            corrections.append((p, row))
        elif d > 150:
            row["status"] = "downgrade"
            downgrades.append((p, row))
        else:
            row["status"] = "ok"
            confirmed.append(pid)
        results.append(row)

    from collections import Counter
    print(Counter(r["status"].split(":")[0] for r in results))
    for p, row in corrections:
        print(f"  CORRECT {p['id']}: {row['distM']}m off -> {row['matched']}")
    for p, row in downgrades[:10]:
        print(f"  downgrade {p['id']}: {row['distM']}m (tier {p.get('markerTier')})")

    json.dump(results, open(os.path.join(ROOT, "coord-parcel-report.json"), "w", encoding="utf8"), indent=1)
    if not apply:
        return

    logpath = os.path.join(ROOT, "coord-corrections-log.json")
    log = json.load(open(logpath, encoding="utf8"))
    log.setdefault("parcelPass", {"date": TODAY, "source": "nevada-county-parcel-locator", "corrected": [], "downgraded": []})
    for p, row in corrections:
        log["parcelPass"]["corrected"].append({"id": p["id"], "before": {"lat": p["lat"], "lng": p["lng"]},
                                               "after": row["parcel"], "distM": row["distM"], "matched": row["matched"]})
        p["lat"], p["lng"] = row["parcel"]["lat"], row["parcel"]["lng"]
        p["coordinateSource"] = "nevada-county-parcel-corrected"
        p["coordinateConfidence"] = "parcel-exact"
    for p, row in downgrades:
        if p.get("markerTier") == "map-ready":
            log["parcelPass"]["downgraded"].append({"id": p["id"], "distM": row["distM"], "status": row["status"]})
            p["markerTier"] = "candidate"
            p["locationReviewStatus"] = "Needs Location Review"
    json.dump(log, open(logpath, "w", encoding="utf8"), indent=1)
    json.dump(places, open(os.path.join(ROOT, "..", "data", "places.json"), "w", encoding="utf8"), indent=1, ensure_ascii=False)
    mr_down = sum(1 for p, _ in downgrades if p.get("markerTier") == "candidate")
    print(f"applied: {len(corrections)} corrections, downgrades hit map-ready: see log; confirmed ok: {len(confirmed)}")


if __name__ == "__main__":
    main()
