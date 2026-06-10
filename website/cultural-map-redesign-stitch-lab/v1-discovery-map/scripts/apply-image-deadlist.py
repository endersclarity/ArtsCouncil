"""Stage A merge of free-image-pass-HANDOFF.md: dead Google image URLs -> honest placeholders.

Reads scripts/image-audit.json; for each dead/bad src, sets image.kind="placeholder",
moves the dead URL to image.deadSrc (audit trail). Dry-run by default; --apply writes.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PLACES = os.path.join(ROOT, "..", "data", "places.json")


def main():
    apply = "--apply" in sys.argv
    audit = json.load(open(os.path.join(ROOT, "image-audit.json"), encoding="utf8"))
    dead = {r["id"]: r for r in audit if r["status"] != "alive"}
    places = json.load(open(PLACES, encoding="utf8"))
    plist = places if isinstance(places, list) else places.get("places", places)

    changed = 0
    for p in plist:
        rec = dead.get(p["id"])
        img = p.get("image")
        if not rec or not isinstance(img, dict) or img.get("src") != rec["src"]:
            continue
        img["deadSrc"] = img.pop("src")
        img["kind"] = "placeholder"
        changed += 1

    print(f"dead in audit: {len(dead)}  matched & changed: {changed}  apply={apply}")
    if apply:
        json.dump(places, open(PLACES, "w", encoding="utf8"), indent=1, ensure_ascii=False)
        print("written data/places.json")


if __name__ == "__main__":
    main()
