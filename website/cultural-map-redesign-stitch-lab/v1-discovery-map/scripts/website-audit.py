"""Stage 2 of the data-cleanliness pass: probe every place.website for link rot.

For each place with a website: GET the URL (browser UA, 15s). On failure, try
https<->http and www-toggle variants. Records the working URL (and whether it
differs from the stored one) or marks the site dead. Writes
scripts/website-audit.json (gitignored). Read-only; merge is a separate script.
"""
import json, os, urllib.request, urllib.parse, concurrent.futures, ssl

ROOT = os.path.dirname(os.path.abspath(__file__))
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}
CTX = ssl.create_default_context()


def try_url(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=15, context=CTX) as r:
        return r.status, r.geturl()


def variants(url):
    u = urllib.parse.urlparse(url)
    hosts = [u.netloc]
    if u.netloc.startswith("www."):
        hosts.append(u.netloc[4:])
    else:
        hosts.append("www." + u.netloc)
    out = []
    for scheme in ("https", "http"):
        for host in hosts:
            v = urllib.parse.urlunparse((scheme, host, u.path or "/", u.params, u.query, ""))
            if v != url:
                out.append(v)
    return out


def probe(place):
    pid, url = place["id"], place["website"]
    res = {"id": pid, "website": url}
    try:
        status, final = try_url(url)
        res["outcome"] = "alive"
        if urllib.parse.urlparse(final).netloc != urllib.parse.urlparse(url).netloc:
            res["redirectsTo"] = final
        return res
    except Exception as e:
        res["error"] = str(e)[:80]
    for v in variants(url):
        try:
            status, final = try_url(v)
            res["outcome"] = "fixed"
            res["workingUrl"] = final if urllib.parse.urlparse(final).netloc != urllib.parse.urlparse(v).netloc else v
            return res
        except Exception:
            continue
    res["outcome"] = "dead"
    return res


def main():
    places = json.load(open(os.path.join(ROOT, "..", "data", "places.json"), encoding="utf8"))
    plist = places if isinstance(places, list) else places.get("places", places)
    targets = [{"id": p["id"], "website": p["website"]} for p in plist if (p.get("website") or "").startswith("http")]
    print(f"probing {len(targets)} websites...", flush=True)
    with concurrent.futures.ThreadPoolExecutor(8) as ex:
        results = list(ex.map(probe, targets))
    json.dump(results, open(os.path.join(ROOT, "website-audit.json"), "w", encoding="utf8"), indent=1)
    from collections import Counter
    print(dict(Counter(r["outcome"] for r in results)))
    for r in [x for x in results if x["outcome"] == "fixed"][:8]:
        print(f"  fixed: {r['id']}  -> {r['workingUrl']}")
    for r in [x for x in results if x["outcome"] == "dead"][:8]:
        print(f"  dead: {r['id']}  {r.get('error','')}")


if __name__ == "__main__":
    main()
