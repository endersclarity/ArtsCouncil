"""Stage A of free-image-pass-HANDOFF.md: probe expiring Google-hosted image URLs.

Probes every place whose image.src points at googleusercontent.com and writes
scripts/image-audit.json (gitignored) with per-place status. Read-only.
"""
import json, os, urllib.request, concurrent.futures

ROOT = os.path.dirname(os.path.abspath(__file__))
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NCACCulturalMap/1.0"}


def probe(item):
    pid, src = item
    req = urllib.request.Request(src, headers=UA, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            ctype = r.headers.get("Content-Type", "")
            ok = r.status == 200 and ctype.startswith("image/")
            return {"id": pid, "src": src, "status": "alive" if ok else f"bad:{r.status}:{ctype[:30]}"}
    except Exception as e:
        return {"id": pid, "src": src, "status": f"dead:{str(e)[:60]}"}


def main():
    places = json.load(open(os.path.join(ROOT, "..", "data", "places.json"), encoding="utf8"))
    if not isinstance(places, list):
        places = places.get("places", places)
    targets = []
    for p in places:
        img = p.get("image")
        if isinstance(img, dict) and "googleusercontent.com" in (img.get("src") or ""):
            targets.append((p["id"], img["src"]))
    print(f"probing {len(targets)} googleusercontent images...", flush=True)

    with concurrent.futures.ThreadPoolExecutor(8) as ex:
        results = list(ex.map(probe, targets))

    json.dump(results, open(os.path.join(ROOT, "image-audit.json"), "w", encoding="utf8"), indent=1)
    alive = sum(1 for r in results if r["status"] == "alive")
    dead = [r for r in results if r["status"] != "alive"]
    print(f"alive: {alive}  dead/bad: {len(dead)}")
    for r in dead[:10]:
        print(f"  sample dead: {r['id']}  {r['status']}")


if __name__ == "__main__":
    main()
