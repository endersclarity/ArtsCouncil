"""Stage 1 of self-description-pass-SPEC.md: fetch venue sites into 25-venue batches."""
import json, re, urllib.request, html, concurrent.futures, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NCACCulturalMap/1.0"}
PAGE_CHARS = 5000


def textify(raw):
    raw = re.sub(r"(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>", " ", raw)
    raw = re.sub(r"(?is)<[^>]+>", " ", raw)
    raw = html.unescape(raw)
    return re.sub(r"\s+", " ", raw).strip()


def fetch(url, timeout=15):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read(800_000).decode("utf-8", "ignore")


def grab(v):
    out = {"id": v["id"], "name": v["name"], "website": v["website"], "pages": {}}
    try:
        homeraw = fetch(v["website"])
        out["pages"]["home"] = textify(homeraw)[:PAGE_CHARS]
        m = re.findall(r"(?i)href=[\"']([^\"']*about[^\"']*)[\"']", homeraw)[:1]
        if m:
            href = m[0]
            if href.startswith("/"):
                base = re.match(r"https?://[^/]+", v["website"])
                href = (base.group(0) + href) if base else ""
            if href.startswith("http"):
                try:
                    out["pages"]["about"] = textify(fetch(href))[:PAGE_CHARS]
                except Exception as e:
                    out["pages"]["about_error"] = str(e)[:80]
    except Exception as e:
        out["error"] = str(e)[:120]
    return out


def main():
    places = json.load(open(os.path.join(ROOT, "..", "data", "places.json"), encoding="utf8"))
    if not isinstance(places, list):
        places = places.get("places", places)
    targets = [
        {"id": p["id"], "name": p["name"], "category": p["category"], "city": p.get("city"), "website": p["website"]}
        for p in places
        if (p.get("website") or "").startswith("http") and "included for alpha review" in p.get("description", "")
    ]
    json.dump(targets, open(os.path.join(ROOT, "fullpass-venues.json"), "w", encoding="utf8"), indent=1)
    print(f"targets: {len(targets)}", flush=True)

    outdir = os.path.join(ROOT, "fullpass-pages")
    os.makedirs(outdir, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(8) as ex:
        results = list(ex.map(grab, targets))

    ok = sum(1 for r in results if not r.get("error"))
    for i in range(0, len(results), 25):
        batch = results[i : i + 25]
        json.dump(batch, open(os.path.join(outdir, f"batch-{i // 25:03d}.json"), "w", encoding="utf8"), indent=1)
    fails = [(r["name"], r["website"], r["error"]) for r in results if r.get("error")]
    json.dump(fails, open(os.path.join(outdir, "fetch-failures.json"), "w", encoding="utf8"), indent=1)
    print(f"fetched ok: {ok}/{len(results)}; batches: {(len(results) + 24) // 25}; failures logged", flush=True)


if __name__ == "__main__":
    sys.exit(main())
