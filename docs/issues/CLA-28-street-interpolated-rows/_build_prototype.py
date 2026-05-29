# PROTOTYPE — throwaway. Answers: "how accurate is OSM rooftop geocoding vs our census coords?"
# Geocodes Mill St (Grass Valley) places via Nominatim and emits a before/after comparison page.
# Delete me (and prototype-rooftop-geocode.html) once the verdict is captured in NOTES.md.
import json, io, os, time, urllib.parse, urllib.request, math

BASE = os.path.dirname(os.path.abspath(__file__))
PLACES = os.path.join(BASE, "..", "..", "..", "website",
                      "cultural-map-redesign-stitch-lab", "v1-discovery-map", "data", "places.json")
UA = "CulturalAssetMap-prototype/1.0 (endersclarity@gmail.com)"

def haversine_m(a, b):
    R = 6371000
    la1, lo1, la2, lo2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    dla, dlo = la2-la1, lo2-lo1
    h = math.sin(dla/2)**2 + math.cos(la1)*math.cos(la2)*math.sin(dlo/2)**2
    return 2*R*math.asin(math.sqrt(h))

def geocode(q):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"format": "json", "q": q, "limit": 1, "addressdetails": 1})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            d = json.load(r)
        if not d:
            return None
        x = d[0]
        return {"lat": float(x["lat"]), "lng": float(x["lon"]),
                "kind": f"{x.get('class')}/{x.get('type')}",
                "label": x.get("display_name", "")[:70]}
    except Exception as e:
        return {"error": str(e)[:60]}

d = json.load(io.open(PLACES, encoding="utf-8"))
mill = [p for p in d if "mill" in str(p.get("address", "")).lower()
        and p.get("lat") and p.get("lng")]
print(f"{len(mill)} Mill St places with coords")

rows = []
for i, p in enumerate(mill):
    addr = str(p.get("address", "")).strip()
    # normalize: ensure city/state for a clean query
    q = addr if "grass valley" in addr.lower() else f"{addr}, Grass Valley, CA"
    g = geocode(q)
    cur = (p["lat"], p["lng"])
    rec = {"name": p.get("name"), "address": addr, "src": p.get("coordinateSource"),
           "conf": p.get("coordinateConfidence"),
           "cur_lat": cur[0], "cur_lng": cur[1]}
    if g and "error" not in g:
        rec.update({"osm_lat": g["lat"], "osm_lng": g["lng"], "osm_kind": g["kind"],
                    "osm_label": g["label"],
                    "shift_m": round(haversine_m(cur, (g["lat"], g["lng"])), 1)})
    else:
        rec.update({"osm_lat": None, "osm_lng": None,
                    "osm_kind": (g or {}).get("error", "no-result")})
    rows.append(rec)
    print(f"  [{i+1}/{len(mill)}] {rec['name'][:28]:28s} shift={rec.get('shift_m','-')}  {rec.get('osm_kind')}")
    time.sleep(1.05)  # Nominatim politeness: max 1 req/sec

hit = [r for r in rows if r.get("osm_lat")]
print(f"\nOSM resolved {len(hit)}/{len(rows)}")
if hit:
    shifts = sorted(r["shift_m"] for r in hit)
    print(f"median shift: {shifts[len(shifts)//2]} m  | max: {shifts[-1]} m")
    print(f"named POI hits (shop/amenity/tourism): "
          f"{sum(1 for r in hit if any(k in r['osm_kind'] for k in ['shop','amenity','tourism','leisure']))}")

io.open(os.path.join(BASE, "_mill_geocoded.json"), "w", encoding="utf-8").write(
    json.dumps(rows, ensure_ascii=False, indent=1))
print("wrote _mill_geocoded.json")
