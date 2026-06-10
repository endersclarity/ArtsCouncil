"""Stage B merge of free-image-pass-HANDOFF.md: adopt harvested venue-website photos.

Reads scripts/og-image-harvest.json; for each outcome=="saved" place (still a
placeholder — never overwrites a healthy real image) sets image to the
self-hosted file with venue-website provenance. Dry-run by default; --apply writes.
"""
import json, os, sys, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
PLACES = os.path.join(ROOT, "..", "data", "places.json")
TODAY = datetime.date.today().isoformat()


def main():
    apply = "--apply" in sys.argv
    harvest = json.load(open(os.path.join(ROOT, "og-image-harvest.json"), encoding="utf8"))
    saved = {r["id"]: r for r in harvest if r["outcome"] == "saved"}
    places = json.load(open(PLACES, encoding="utf8"))
    plist = places if isinstance(places, list) else places.get("places", places)

    changed = 0
    for p in plist:
        rec = saved.get(p["id"])
        img = p.get("image")
        if not rec or not isinstance(img, dict) or img.get("kind") == "real":
            continue
        if not os.path.exists(os.path.join(ROOT, "..", rec["file"])):
            print(f"  MISSING FILE, skipped: {rec['file']}")
            continue
        img["kind"] = "real"
        img["src"] = rec["file"]
        img["alt"] = p["name"]
        img["credit"] = f"Photo: {p['name']} website"
        img["imageSource"] = {"kind": "venue-website", "url": rec["sourceUrl"], "fetched": TODAY}
        changed += 1

    print(f"saved in harvest: {len(saved)}  merged: {changed}  apply={apply}")
    if apply:
        json.dump(places, open(PLACES, "w", encoding="utf8"), indent=1, ensure_ascii=False)
        print("written data/places.json")


if __name__ == "__main__":
    main()
