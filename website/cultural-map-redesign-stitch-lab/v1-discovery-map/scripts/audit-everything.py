"""One-command data health report for the V1 Discovery Map.

Run:  python scripts/audit-everything.py            (fast: no network probes)
      python scripts/audit-everything.py --probe    (also probe image + website URLs; ~2 min)

Checks: image inventory + dead-link probe, website inventory + dead-link probe,
coordinate sanity (county bbox, tier counts), description provenance,
events freshness. Prints a one-page report; writes nothing.
"""
import json, os, sys, datetime, urllib.request, concurrent.futures
from collections import Counter

ROOT = os.path.dirname(os.path.abspath(__file__))
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"}
BBOX = (38.9, 39.7, -121.4, -120.0)  # generous county box (Truckee/Soda Springs are in-county)


def probe_url(url, image=False):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=15) as r:
            if image:
                return r.status == 200 and (r.headers.get("Content-Type") or "").startswith("image/")
            return r.status == 200
    except Exception:
        return False


def main():
    do_probe = "--probe" in sys.argv
    places = json.load(open(os.path.join(ROOT, "..", "data", "places.json"), encoding="utf8"))
    events = json.load(open(os.path.join(ROOT, "..", "data", "events.json"), encoding="utf8"))
    today = datetime.date.today().isoformat()
    print(f"=== V1 Discovery Map data health — {today} ===\n")

    # --- markers / tiers ---
    public = [p for p in places if p.get("publicMarker") is not False]
    tiers = Counter(p.get("markerTier") for p in places)
    print(f"places: {len(places)} total, {len(public)} public markers")
    print(f"tiers: map-ready {tiers['map-ready']} / candidate {tiers['candidate']} / directory-only {tiers['directory-only']}")
    out_of_box = [p["id"] for p in places if p.get("markerTier") == "map-ready" and p.get("lat")
                  and not (BBOX[0] < p["lat"] < BBOX[1] and BBOX[2] < p["lng"] < BBOX[3])]
    print(f"coordinate sanity: {len(out_of_box)} map-ready pins outside county bbox" + (f"  <-- INVESTIGATE: {out_of_box[:5]}" if out_of_box else "  (clean)"))

    # --- images ---
    imgs = [p for p in places if isinstance(p.get("image"), dict)]
    kinds = Counter(p["image"].get("kind") for p in imgs)
    hosted = [p for p in imgs if (p["image"].get("src") or "").startswith("assets/")]
    google = [p for p in imgs if "googleusercontent.com" in (p["image"].get("src") or "")]
    print(f"\nimages: {kinds.get('real', 0)} real ({len(hosted)} self-hosted, {len(google)} still on expiring Google links), {kinds.get('placeholder', 0)} placeholders")
    missing_files = [p["id"] for p in hosted if not os.path.exists(os.path.join(ROOT, "..", p["image"]["src"]))]
    print(f"self-hosted files present: {len(hosted) - len(missing_files)}/{len(hosted)}" + (f"  <-- MISSING: {missing_files[:5]}" if missing_files else ""))
    if do_probe and google:
        with concurrent.futures.ThreadPoolExecutor(8) as ex:
            alive = sum(ex.map(lambda p: probe_url(p["image"]["src"], image=True), google))
        print(f"google-link probe: {alive}/{len(google)} still alive  ({len(google) - alive} newly dead -> run image-audit.py + apply-image-deadlist.py)")

    # --- websites ---
    sites = [p for p in places if (p.get("website") or "").startswith("http")]
    dead_flag = [p for p in sites if p.get("websiteStatus") == "dead"]
    live_sites = [p for p in sites if p.get("websiteStatus") != "dead"]
    print(f"\nwebsites: {len(sites)} listed, {len(dead_flag)} marked dead (links hidden), {len(live_sites)} linked")
    if do_probe:
        sample = live_sites
        with concurrent.futures.ThreadPoolExecutor(8) as ex:
            alive = sum(ex.map(lambda p: probe_url(p["website"]), sample))
        print(f"website probe: {alive}/{len(sample)} reachable  (failures include bot-blocked platforms; run website-audit.py for triage)")

    # --- descriptions ---
    templated = [p for p in places if "included for alpha review" in (p.get("description") or "")]
    own_words = [p for p in places if (p.get("descriptionSource") or {}).get("kind") == "venue-website"]
    print(f"\ndescriptions: {len(own_words)} in venues' own words, {len(templated)} still templated"
          f" ({sum(1 for p in templated if (p.get('website') or '').startswith('http'))} of those have websites)")

    # --- events ---
    dates = [e.get("date", "")[:10] for e in events if e.get("date")]
    future = [d for d in dates if d >= today]
    newest = max(dates) if dates else "n/a"
    linked = sum(1 for e in events if e.get("placeId"))
    print(f"\nevents: {len(events)} total, {len(future)} today-or-future, newest date {newest}, {linked} linked to places")
    if not future:
        print("  <-- NO UPCOMING EVENTS: the refresh pipeline may be stalled")

    print("\nDeep-dive scripts: image-audit.py, website-audit.py, audit-coords-census.py, audit-coords-parcel.py, og-image-fullsweep.py")


if __name__ == "__main__":
    main()
