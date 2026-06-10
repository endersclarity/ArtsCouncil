"""Stage 1 of the data-cleanliness pass: og:image sweep over ALL Google-hot-linked images.

Targets places with a website whose image.src still points at googleusercontent.com
(alive but expiring). Harvests the venue's own og:image, applies the flat-color
logo filter (<2000 unique colors in a 64x64 thumb = reject), self-hosts survivors.
Never touches places already on self-hosted photos. Writes scripts/og-fullsweep.json.
"""
import json, os, io, concurrent.futures, importlib.util
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("h", os.path.join(ROOT, "og-image-harvest.py"))
h = importlib.util.module_from_spec(spec)
spec.loader.exec_module(h)
h.UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}
NCOLORS_MIN = 2000


def harvest_with_logo_filter(place):
    res = h.harvest(place)
    if res.get("outcome") != "saved":
        return res
    path = os.path.join(h.OUTDIR, place["id"] + ".jpg")
    im = Image.open(path).convert("RGB").resize((64, 64))
    ncolors = len(set(im.getdata()))
    res["ncolors64"] = ncolors
    if ncolors < NCOLORS_MIN:
        os.remove(path)
        res["outcome"] = f"rejected-logo-like:{ncolors}colors"
    return res


def main():
    os.makedirs(h.OUTDIR, exist_ok=True)
    places = json.load(open(os.path.join(ROOT, "..", "data", "places.json"), encoding="utf8"))
    plist = places if isinstance(places, list) else places.get("places", places)
    targets = [
        {"id": p["id"], "website": p["website"]}
        for p in plist
        if (p.get("website") or "").startswith("http")
        and isinstance(p.get("image"), dict)
        and "googleusercontent.com" in (p["image"].get("src") or "")
    ]
    print(f"targets (google-hot-linked image + website): {len(targets)}", flush=True)
    with concurrent.futures.ThreadPoolExecutor(8) as ex:
        results = list(ex.map(harvest_with_logo_filter, targets))
    json.dump(results, open(os.path.join(ROOT, "og-fullsweep.json"), "w", encoding="utf8"), indent=1)
    from collections import Counter
    print(dict(Counter(r["outcome"].split(":")[0] for r in results)))
    saved = [r for r in results if r["outcome"] == "saved"]
    print(f"saved: {len(saved)}")
    for r in saved[:8]:
        print(f"  {r['id']}  {r['width']}px  ncolors={r['ncolors64']}")


if __name__ == "__main__":
    main()
