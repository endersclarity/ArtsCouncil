"""Build data/muse-stories.json for the MUSE Story Lens.

Uses ONLY exact-match, direct-evidence links from data/muse_evidence_links.json
(fuzzy/theme matches are too weak to show visitors). A story = one MUSE article
plus the mappable places it actually names. Stories with fewer than 2 mapped
places are dropped (a lens needs somewhere to look).
"""
import json, os
from collections import defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))


def main():
    ev = json.load(open(os.path.join(ROOT, "..", "data", "muse_evidence_links.json"), encoding="utf8"))
    places = json.load(open(os.path.join(ROOT, "..", "data", "places.json"), encoding="utf8"))
    byid = {p["id"]: p for p in places}

    articles, members = {}, defaultdict(list)
    for l in ev["links"]:
        if l.get("target_type") != "place" or l.get("match_type") != "exact" or not l.get("is_direct_evidence"):
            continue
        p = byid.get(l["target_id"])
        if not p or p.get("publicMarker") is False or not (p.get("lat") and p.get("lng")):
            continue
        a = l["article"]
        articles[a["id"]] = a
        if l["target_id"] not in members[a["id"]]:
            members[a["id"]].append(l["target_id"])

    stories = []
    for aid, a in articles.items():
        ids = members[aid]
        if len(ids) < 2:
            continue
        stories.append({
            "id": aid,
            "title": a["title"],
            "issue": a["issue"],
            "issueYear": a["issue_year"],
            "pages": [a.get("page_start"), a.get("page_end")],
            "placeIds": ids,
        })
    stories.sort(key=lambda s: (-s["issueYear"], -len(s["placeIds"])))
    out = os.path.join(ROOT, "..", "data", "muse-stories.json")
    json.dump({"generated": True, "rule": "exact direct-evidence links only, >=2 mapped places", "stories": stories},
              open(out, "w", encoding="utf8"), indent=1, ensure_ascii=False)
    print(f"stories: {len(stories)} (from {len(articles)} articles with exact links)")
    for s in stories[:12]:
        print(f"  {s['issue']}: {s['title']} — {len(s['placeIds'])} places")


if __name__ == "__main__":
    main()
