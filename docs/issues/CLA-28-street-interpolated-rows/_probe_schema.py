import json, io, os
BASE = os.path.dirname(os.path.abspath(__file__))
PLACES = os.path.join(BASE, "..", "..", "..", "website",
                      "cultural-map-redesign-stitch-lab", "v1-discovery-map", "data", "places.json")
d = json.load(io.open(PLACES, encoding="utf-8"))
out = []
out.append(f"total places: {len(d)}")
fields = ['id','name','address','city','lat','lng','locationReviewStatus',
          'coordinateSource','coordinateConfidence','coordinateProvenance',
          'coordinateDecisionId','markerTier','locationCaveat']
def grab(pred, label):
    for p in d:
        if pred(p):
            out.append(f"--- {label} ---")
            for k in fields:
                out.append(f"  {k}: {p.get(k)!r}")
            return
grab(lambda p: p.get('coordinateSource') == 'us-census-geocoder', 'CENSUS (target)')
grab(lambda p: p.get('coordinateSource') == 'arcgis-cultural-assets-confident-match', 'ARCGIS high')
grab(lambda p: str(p.get('coordinateProvenance')) == 'human-verified', 'HUMAN-VERIFIED')
# distinct enum values
import collections
for f in ['coordinateSource','coordinateConfidence','coordinateProvenance','locationReviewStatus','markerTier']:
    vals = collections.Counter(str(p.get(f)) for p in d)
    out.append(f"== {f} values ==")
    for k, v in vals.most_common():
        out.append(f"   {v:5d}  {k}")
io.open(os.path.join(BASE, "_probe_schema_out.txt"), "w", encoding="utf-8").write("\n".join(out))
print("wrote _probe_schema_out.txt")
