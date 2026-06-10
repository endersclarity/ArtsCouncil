# PROTOTYPE AUDIT — cross-check stored place coordinates against the free US
# Census batch geocoder. Writes scripts/coord-audit-report.json with per-place
# distances and a flagged list. Read-only over places.json.
import json, csv, io, math, sys, urllib.request, urllib.parse

PLACES = "data/places.json"
OUT = "scripts/coord-audit-report.json"
BATCH_URL = "https://geocoding.geo.census.gov/geocoder/locations/addressbatch"
FLAG_METERS = 150

rows = json.load(open(PLACES, encoding="utf-8"))
rows = rows.get("places", rows) if isinstance(rows, dict) else rows

# Only audit places that are drawn publicly, have coords and a street address.
targets = [r for r in rows
           if r.get("publicMarker") is not False
           and r.get("lat") is not None
           and (r.get("address") or "").strip()
           and any(ch.isdigit() for ch in r.get("address", ""))]
print(f"auditable places (public, coords, street address): {len(targets)}", file=sys.stderr)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = math.radians(lat2-lat1), math.radians(lon2-lon1)
    a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*R*math.asin(math.sqrt(a))

results = {}
CHUNK = 5000  # census limit is 10k rows per batch
for start in range(0, len(targets), CHUNK):
    chunk = targets[start:start+CHUNK]
    buf = io.StringIO()
    w = csv.writer(buf)
    for r in chunk:
        w.writerow([r["id"], r["address"], r.get("city") or "", "CA", ""])
    body_file = buf.getvalue().encode()

    boundary = "----audit7f3"
    parts = []
    def field(name, value):
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n")
    field("benchmark", "Public_AR_Current")
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"addressFile\"; filename=\"batch.csv\"\r\nContent-Type: text/csv\r\n\r\n")
    payload = "".join(parts).encode() + body_file + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(BATCH_URL, data=payload,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    print(f"posting batch {start}..{start+len(chunk)}", file=sys.stderr)
    with urllib.request.urlopen(req, timeout=300) as resp:
        text = resp.read().decode("utf-8", "replace")
    for line in csv.reader(io.StringIO(text)):
        # id, input addr, match flag, exact/non-exact, matched addr, "lon,lat", tigerline, side
        if len(line) >= 6 and line[2] == "Match":
            try:
                lon, lat = map(float, line[5].split(","))
                results[line[0]] = {"censusLat": lat, "censusLng": lon,
                                    "matchedAddress": line[4], "exact": line[3]}
            except ValueError:
                pass

report = []
for r in targets:
    hit = results.get(r["id"])
    if not hit:
        report.append({"id": r["id"], "name": r["name"], "status": "no-census-match",
                       "coordinateSource": r.get("coordinateSource"), "tier": r.get("markerTier")})
        continue
    d = haversine(r["lat"], r["lng"], hit["censusLat"], hit["censusLng"])
    report.append({"id": r["id"], "name": r["name"], "address": r.get("address"),
                   "city": r.get("city"), "coordinateSource": r.get("coordinateSource"),
                   "tier": r.get("markerTier"), "distanceM": round(d, 1),
                   "exact": hit["exact"], "matchedAddress": hit["matchedAddress"],
                   "status": "flag" if d > FLAG_METERS else "ok"})

flags = [x for x in report if x["status"] == "flag"]
ok = [x for x in report if x["status"] == "ok"]
nomatch = [x for x in report if x["status"] == "no-census-match"]
summary = {"audited": len(report), "ok": len(ok), "flagged": len(flags),
           "noCensusMatch": len(nomatch), "flagThresholdMeters": FLAG_METERS}
json.dump({"summary": summary, "flags": sorted(flags, key=lambda x: -x["distanceM"]),
           "report": report}, open(OUT, "w", encoding="utf-8"), indent=1)
print(json.dumps(summary, indent=1))
