"""Stage B of free-image-pass-HANDOFF.md: harvest venues' own og:image photos.

Targets: places with a website whose image is currently a placeholder (never
touches healthy real images). Fetches the homepage head, extracts
og:image -> twitter:image, filters deterministically, downloads survivors,
resizes to <=1280px JPEG at assets/venue-photos/<id>.jpg, and writes
scripts/og-image-harvest.json (gitignored) with per-place outcomes.
"""
import json, os, re, io, urllib.request, urllib.parse, concurrent.futures

ROOT = os.path.dirname(os.path.abspath(__file__))
OUTDIR = os.path.join(ROOT, "..", "assets", "venue-photos")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NCACCulturalMap/1.0"}
BAD_NAME = re.compile(r"(?i)logo|icon|favicon|badge|sprite|default[-_]?(share|og|social)|placeholder")
BAD_HOST = re.compile(r"(?i)gravatar\.com|s\.w\.org|parastorage\.com|cdn\.shopify\.com/s/files/.*logo")
META = re.compile(
    r'(?is)<meta[^>]+(?:property|name)=["\'](og:image|og:image:secure_url|twitter:image)(?::src)?["\'][^>]*?content=["\']([^"\']+)["\']'
    r'|<meta[^>]+content=["\']([^"\']+)["\'][^>]*?(?:property|name)=["\'](og:image|og:image:secure_url|twitter:image)(?::src)?["\']'
)

from PIL import Image


def fetch(url, limit=120_000, timeout=15):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read(limit)


def extract_candidates(html_text, base_url):
    found = []
    for m in META.finditer(html_text):
        tag = m.group(1) or m.group(4)
        url = m.group(2) or m.group(3)
        if url:
            found.append((tag, html_unescape(url.strip())))
    # og:image first, then twitter:image
    found.sort(key=lambda t: 0 if t[0].startswith("og:image") else 1)
    return [urllib.parse.urljoin(base_url, u) for _, u in found]


def html_unescape(s):
    import html
    return html.unescape(s)


def acceptable_url(u):
    path = urllib.parse.urlparse(u).path.lower()
    if path.endswith(".svg") or ".svg?" in u.lower():
        return False
    if BAD_NAME.search(os.path.basename(path)) or BAD_HOST.search(u):
        return False
    return True


def harvest(place):
    pid, site = place["id"], place["website"]
    res = {"id": pid, "website": site}
    try:
        head = fetch(site).decode("utf-8", "ignore")
    except Exception as e:
        res["outcome"] = f"fetch-fail:{str(e)[:60]}"
        return res
    cands = [u for u in extract_candidates(head, site) if acceptable_url(u)]
    if not cands:
        res["outcome"] = "no-og-image"
        return res
    for u in cands[:2]:
        try:
            raw = fetch(u, limit=8_000_000)
            img = Image.open(io.BytesIO(raw))
            img.load()
            if img.width < 400:
                res["outcome"] = f"too-small:{img.width}px"
                continue
            if img.mode != "RGB":
                img = img.convert("RGB")
            if img.width > 1280:
                img = img.resize((1280, round(img.height * 1280 / img.width)))
            out = os.path.join(OUTDIR, f"{pid}.jpg")
            img.save(out, "JPEG", quality=82)
            res.update({"outcome": "saved", "sourceUrl": u, "width": img.width, "file": f"assets/venue-photos/{pid}.jpg"})
            return res
        except Exception as e:
            res["outcome"] = f"download-fail:{str(e)[:60]}"
    return res


def main():
    os.makedirs(OUTDIR, exist_ok=True)
    places = json.load(open(os.path.join(ROOT, "..", "data", "places.json"), encoding="utf8"))
    plist = places if isinstance(places, list) else places.get("places", places)
    targets = [
        {"id": p["id"], "website": p["website"]}
        for p in plist
        if (p.get("website") or "").startswith("http")
        and isinstance(p.get("image"), dict)
        and p["image"].get("kind") != "real"
    ]
    print(f"targets (placeholder image + website): {len(targets)}", flush=True)
    with concurrent.futures.ThreadPoolExecutor(8) as ex:
        results = list(ex.map(harvest, targets))
    json.dump(results, open(os.path.join(ROOT, "og-image-harvest.json"), "w", encoding="utf8"), indent=1)
    from collections import Counter
    counts = Counter(r["outcome"].split(":")[0] for r in results)
    print(dict(counts))
    saved = [r for r in results if r["outcome"] == "saved"]
    for r in saved[:10]:
        print(f"  saved: {r['id']}  {r['width']}px  <- {r['sourceUrl'][:80]}")


if __name__ == "__main__":
    main()
