# CLA-28 — re-geocode ALL us-census-geocoder places via OSM/Nominatim (rooftop/POI).
# Writes a PATCH file (_census_patch.json); does NOT modify places.json.
# Guardrail: accept only building/POI results; reject highway/* (road fallback) and no-result.
import json, io, os, time, urllib.parse, urllib.request, math, re

BASE = os.path.dirname(os.path.abspath(__file__))
PLACES = os.path.join(BASE, "..", "..", "..", "website",
                      "cultural-map-redesign-stitch-lab", "v1-discovery-map", "data", "places.json")
UA = "CulturalAssetMap-cla28/1.0 (endersclarity@gmail.com)"
ACCEPT_PREFIX = ("shop/", "amenity/", "tourism/", "leisure/", "office/", "historic/", "building/")
ACCEPT_EXACT = ("place/house",)

def haversine_m(a, b):
    R = 6371000
    la1, lo1, la2, lo2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    dla, dlo = la2 - la1, lo2 - lo1
    h = math.sin(dla/2)**2 + math.cos(la1)*math.cos(la2)*math.sin(dlo/2)**2
    return 2 * R * math.asin(math.sqrt(h))

def geocode(q):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"format": "json", "q": q, "limit": 1, "addressdetails": 1})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                d = json.load(r)
            if not d:
                return None
            x = d[0]
            return {"lat": float(x["lat"]), "lng": float(x["lon"]),
                    "kind": f"{x.get('class')}/{x.get('type')}",
                    "label": x.get("display_name", "")[:80]}
        except Exception as e:
            if attempt == 2:
                return {"error": str(e)[:60]}
            time.sleep(2)

def accept(kind):
    if not kind or kind.startswith("highway"):
        return False
    return kind in ACCEPT_EXACT or any(kind.startswith(p) for p in ACCEPT_PREFIX)

def normalize_query(addr, city):
    a = (addr or "").strip()
    if not a:
        return None
    # drop suite/unit noise that throws off geocoders
    a = re.sub(r",?\s*(ste|suite|unit|#)\s*\S+", "", a, flags=re.I).strip().rstrip(",")
    low = a.lower()
    if city and city.lower() not in low:
        a = f"{a}, {city}, CA"
    elif "ca" not in low and "california" not in low:
        a = f"{a}, CA"
    return a

d = json.load(io.open(PLACES, encoding="utf-8"))
census = [p for p in d if p.get("coordinateSource") == "us-census-geocoder"
          and p.get("lat") and p.get("lng")]
print(f"{len(census)} us-census-geocoder places to re-geocode", flush=True)

patch = []
acc = rej = noaddr = 0
for i, p in enumerate(census):
    q = normalize_query(p.get("address"), p.get("city"))
    rec = {"id": p.get("id"), "name": p.get("name"), "address": p.get("address"),
           "city": p.get("city"), "cur_lat": p["lat"], "cur_lng": p["lng"]}
    if not q:
        rec["decision"] = "no-address"; noaddr += 1; patch.append(rec)
        continue
    g = geocode(q)
    time.sleep(1.05)  # Nominatim: max 1 req/sec
    if not g or "error" in g:
        rec["decision"] = "no-result"; rec["osm_kind"] = (g or {}).get("error", "no-result")
        rej += 1; patch.append(rec);
        if i % 20 == 0: print(f"[{i+1}/{len(census)}] acc={acc} rej={rej}", flush=True)
        continue
    shift = round(haversine_m((p["lat"], p["lng"]), (g["lat"], g["lng"])), 1)
    rec.update({"osm_lat": g["lat"], "osm_lng": g["lng"], "osm_kind": g["kind"],
                "osm_label": g["label"], "shift_m": shift})
    if accept(g["kind"]):
        rec["decision"] = "accept"; acc += 1
    else:
        rec["decision"] = "reject-road" if g["kind"].startswith("highway") else "reject-other"
        rej += 1
    patch.append(rec)
    if i % 20 == 0:
        print(f"[{i+1}/{len(census)}] acc={acc} rej={rej}", flush=True)

io.open(os.path.join(BASE, "_census_patch.json"), "w", encoding="utf-8").write(
    json.dumps(patch, ensure_ascii=False, indent=1))
print(f"\nDONE  total={len(census)}  ACCEPT={acc}  REJECT={rej}  no-address={noaddr}", flush=True)
print("wrote _census_patch.json", flush=True)
