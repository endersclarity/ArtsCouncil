"""Stages 3-5 of self-description-pass-SPEC.md: strict-verify every extraction,
merge accepted entries into places.json, write link findings."""
import json, re, os, glob, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
TODAY = datetime.date.today().isoformat()


def norm(s):
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def main():
    accepted, rejected, empties = [], [], []
    for f in sorted(glob.glob(os.path.join(ROOT, "fullpass-out", "batch-*.json"))):
        b = os.path.basename(f)[6:9]
        src = {r["id"]: r for r in json.load(open(os.path.join(ROOT, "fullpass-pages", f"batch-{b}.json"), encoding="utf8"))}
        for o in json.load(open(f, encoding="utf8")):
            sd = (o.get("self_description") or "").strip()
            if not sd or o.get("confidence") not in ("high", "medium"):
                empties.append(o)
                continue
            pages = src.get(o["id"], {}).get("pages", {})
            text = norm(" ".join(v for v in pages.values() if isinstance(v, str)))
            sents = [s.strip() for s in re.split(r"(?<=[.!?]) ", sd) if len(s.strip()) > 15]
            if sents and all(norm(s)[:60] in text for s in sents):
                accepted.append(o)
            else:
                rejected.append(o)

    json.dump(accepted, open(os.path.join(ROOT, "..", "data", "self-descriptions.json"), "w", encoding="utf8"), indent=1, ensure_ascii=False)

    # merge into places.json (only templated descriptions are replaced)
    ppath = os.path.join(ROOT, "..", "data", "places.json")
    places = json.load(open(ppath, encoding="utf8"))
    plist = places if isinstance(places, list) else places.get("places", places)
    byid = {p["id"]: p for p in plist}
    merged = 0
    for o in accepted:
        p = byid.get(o["id"])
        if not p or "included for alpha review" not in p.get("description", ""):
            continue
        p["description"] = o["self_description"]
        p["descriptionSource"] = {"kind": "venue-website", "url": o["source_url"], "page": o.get("source_page", "home"), "fetched": TODAY}
        merged += 1
    json.dump(places, open(ppath, "w", encoding="utf8"), indent=1, ensure_ascii=False)

    # link findings
    fails = json.load(open(os.path.join(ROOT, "fullpass-pages", "fetch-failures.json"), encoding="utf8"))
    lines = ["# Website link findings — self-description pass " + TODAY, "",
             "Dead/broken/junk website links found while fetching venue sites.",
             "Owner decision required before removing any link from data.", "",
             "## Known hijacked (CONFIRMED MALICIOUS — recommend removing link ASAP)",
             "- The Vault @ Crush / Crush Nevada City — https://crushnevadacity.com/ serves Indonesian gambling spam (found in pilot + batch 006; also Native Wren flagged in batch 007)", "",
             "## Fetch failures (dead DNS, SSL errors, 404s, junk URLs)"]
    for name, url, err in fails:
        lines.append(f"- {name} — {url} — {err}")
    open(os.path.join(ROOT, "fullpass-link-findings.md"), "w", encoding="utf8").write("\n".join(lines) + "\n")

    print(f"accepted(verbatim)={len(accepted)} rejected(reworded)={len(rejected)} empty/low={len(empties)}")
    print(f"merged into places.json: {merged}; fetch failures logged: {len(fails)}")


if __name__ == "__main__":
    main()
