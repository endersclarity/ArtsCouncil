"""Stage C of free-image-pass-HANDOFF.md: demote contentless entries, list the rest.

A place has "all four gaps" when its description is still templated, its image
is a placeholder, it has no website, and no upcoming events. Such places get:
- auto-demotion (publicMarker=false) ONLY if markerTier=="candidate" and not
  musePick and not anchor and not featured;
- otherwise a row in scripts/demotion-review.md for the owner.
Dry-run by default; --apply writes places.json and the review file.
"""
import json, os, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))
PLACES = os.path.join(ROOT, "..", "data", "places.json")
TEMPLATED = "included for alpha review"


def main():
    apply = "--apply" in sys.argv
    places = json.load(open(PLACES, encoding="utf8"))
    plist = places if isinstance(places, list) else places.get("places", places)
    events = json.load(open(os.path.join(ROOT, "..", "data", "events.json"), encoding="utf8"))
    elist = events if isinstance(events, list) else events.get("events", events)
    event_ids = {e.get("placeId") for e in elist}

    before_public = sum(1 for p in plist if p.get("publicMarker") is not False)
    demoted, review = [], []
    for p in plist:
        if p.get("publicMarker") is False:
            continue
        gaps = (
            TEMPLATED in (p.get("description") or "")
            and not (isinstance(p.get("image"), dict) and p["image"].get("kind") == "real")
            and not (p.get("website") or "").startswith("http")
            and p["id"] not in event_ids
        )
        if not gaps:
            continue
        protected = p.get("musePick") or p.get("anchor") or p.get("featured")
        if p.get("markerTier") == "candidate" and not protected:
            demoted.append(p)
            if apply:
                p["publicMarker"] = False
        else:
            review.append(p)

    print(f"all-four-gaps places: {len(demoted) + len(review)}")
    print(f"auto-demoted (candidate, unprotected): {len(demoted)}")
    print(f"owner review: {len(review)}")
    print(f"public markers: {before_public} -> {before_public - (len(demoted) if apply else 0)} (after apply)")
    for p in demoted[:8]:
        print(f"  demote: {p['id']}")

    if apply:
        json.dump(places, open(PLACES, "w", encoding="utf8"), indent=1, ensure_ascii=False)
        lines = [
            "# Demotion review — owner's call",
            "",
            "These places have ALL FOUR gaps (templated description, placeholder image,",
            "no website, no upcoming events) but were NOT auto-demoted because of their",
            "tier or protected status (MUSE pick / anchor / featured). Decide per place:",
            "keep public, demote, or source real content.",
            "",
            f"Auto-demoted in the same pass: {len(demoted)} candidate-tier unprotected places",
            "(set `publicMarker: false`; reversible by flipping the flag back).",
            "",
        ]
        groups = defaultdict(list)
        for p in review:
            groups[p.get("markerTier", "?")].append(p)
        for tier in sorted(groups):
            lines.append(f"## markerTier: {tier} ({len(groups[tier])})")
            lines.append("")
            for p in sorted(groups[tier], key=lambda x: x["id"]):
                flags = ",".join(k for k in ("musePick", "anchor", "featured") if p.get(k)) or "-"
                lines.append(f"- `{p['id']}` — {p['name']} ({p.get('city','?')}) [{flags}]")
            lines.append("")
        lines.append("## Auto-demoted list (for the record)")
        lines.append("")
        for p in sorted(demoted, key=lambda x: x["id"]):
            lines.append(f"- `{p['id']}` — {p['name']} ({p.get('city','?')})")
        open(os.path.join(ROOT, "demotion-review.md"), "w", encoding="utf8").write("\n".join(lines) + "\n")
        print("written data/places.json + scripts/demotion-review.md")


if __name__ == "__main__":
    main()
