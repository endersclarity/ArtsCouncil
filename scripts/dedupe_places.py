#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Detect (and optionally merge) duplicate place records in the LIVE map data:
v1-discovery-map/data/places.json.

Two detection passes:
  1. Exact normalized-name collisions (normalize = lowercase, strip non-alnum).
  2. Near-dups: token-overlap name similarity + coordinate proximity (~50m)
     and/or shared website domain or normalized phone.

For each candidate group it scores a "richest" record (real photo, field count,
coordinate confidence) to keep, and flags whether any to-be-dropped id is
referenced in sibling data files (anchor_cards.json, paths.json) or as a
coordinateDecisionId.

Detection writes a review report only. Merge is a separate, explicit step.

Usage:
  python scripts/dedupe_places.py                      # detect, write report
  python scripts/dedupe_places.py --merge --dry-run    # show merge plan
  python scripts/dedupe_places.py --merge              # apply (backs up first)
  python scripts/dedupe_places.py --merge --only-exact # merge exact groups only
"""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

import argparse
import json
import math
import re
import time
import unicodedata
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
APP_DIR = SCRIPT_DIR.parent
DATA_DIR = APP_DIR / "website" / "cultural-map-redesign-stitch-lab" / "v1-discovery-map" / "data"
PLACES_JSON = DATA_DIR / "places.json"
ANCHOR_CARDS = DATA_DIR / "anchor_cards.json"
PATHS_JSON = DATA_DIR / "paths.json"
REPORT_FILE = SCRIPT_DIR / "dedupe_report.json"

# Curated allowlist of variant-name pairs CONFIRMED as the same entity (B1+B2 in
# reports/dedupe-review.md). Each entry is a set of record names that should
# collapse to one. Names are matched after norm_name(). Anything not listed here
# (sculptures-at-a-site, venue-in-venue, distinct businesses) is left untouched.
APPROVED_VARIANT_DUPS = [
    {"Northridge Penn Valley", "Penn Valley Northridge"},
    {"Bespoke & Atelier", "Atelier & Bespoke"},
    {"Greater Grass Valley Chamber of Commerce", "Grass Valley Chamber of Commerce"},
    {"Truckee Tahoe Community Television", "Truckee Tahoe Community Television (TTCTV)"},
    {"Front Street Station Pizza", "Front Street Station Pizza Co."},
    {"Wild Cherries Coffee House", "Wild Cherries Coffee House & Bakery"},
    {"BriarPatch Food Co-op", "BriarPatch Co-op"},
    {"Mountain Valley Meats, Inc", "Mountain Valley Meats"},
    {"Pacific Crest Coffee", "Pacific Crest Coffee Co."},
    {"The Richardson House Inn", "The Richardson House"},
    {"Truckee Brewing Company", "Truckee Brewing Company Restaurant"},
    {"Diego’s Restaurant", "Diego's"},
    {"Narrow Gauge Railroad Museum", "Nevada County Narrow Gauge Railroad Museum"},
    {"Nevada City Crystal and Glass", "Nevada City Crystal & Glass Shop"},
    {"Mountain Forge Inc.", "Mountain Forge"},
    {"Truckee Tavern", "Truckee Tavern & Grill"},
    {"Searls Historical Library", "Searls Historical Library (NC Historical Society)"},
    {"Grass Valley Brewing Company", "Grass Valley Brewing Co."},
    {"Nevada City Classic Café", "Nevada City Classic Cafe"},
    {"Pete's Pizza", "Pete’s Pizza & Tap House"},
    {"Art Works Gallery", "Art Works Gallery Co-op"},
    {"The Pour House", "The Pour House Wine Shop"},
    {"Nevada County Library Grass Valley Royce Branch", "Grass Valley Library Royce Branch",
     "Grass Valley Public Library (Josiah Royce Library)"},
    {"Nevada County Digital Media Center", "Nevada County Television/Digital Media Ctr"},
    {"Nevada County Doris Foley Library for Historical Research",
     "Doris Foley Library of Historical Research"},
    {"California Organics Restaurant & Gallery", "California Organics"},
    {"Wyld Tiger", "Wyld Tiger Sourdough Bakery"},
    {"Bear River Library", "Nevada County Library Bear River Branch"},
    {"Pianeta Ristorante", "Pianeta"},
    {"RMU", "RMU Restaurant"},
    {"Sierra Starr Vineyard & Winery (Winery)", "Sierra Starr Vineyard and Winery"},
    {"The Thirsty Barrel Taphouse", "The Thirsty Barrel Taphouse & Grille"},
    {"Lucchesi Vineyards Tasting Room", "Lucchesi Tasting Room"},
    {"Starr Winery Tasting Room", "Sierra Starr Tasting Room"},
    {"The Mine Shaft", "The Mine Shaft Saloon"},
    {"Old Jail Museum", "Old Truckee Jail Museum"},
    {"Off Broadstreet", "Off Broadstreet Theatre"},
    {"Golden Era Lounge", "Golden Era Lounge/309 Broad Street"},
    {"Penn Valley Community Rodeo Association", "Penn Valley Rodeo"},
    {"Prime Cinemas", "Prime Cinemas Grass Valley"},
    {"Heartwood Eatery", "Heartwood Eatery & Annex"},
    {"Nevada County Fair", "Nevada County Fairgrounds"},
    # B2 Firehouse cluster (3-way, same building)
    {"Firehouse No.1", "Nevada City Firehouse No. 1", "Firehouse No. 1 Museum"},
    # B4 ref-sensitive: same place; dropped id is referenced in paths.json -> ref auto-rewritten
    {"Miners Foundry", "Miners Foundry Cultural Center"},
]

PROXIMITY_M = 50.0          # near-dup coordinate threshold
NEAR_PROXIMITY_M = 200.0    # looser window when name+contact strongly match
NAME_SIM_THRESHOLD = 0.5    # Jaccard token overlap for variant-name match


def fold_accents(s):
    """é -> e, ñ -> n, etc. so accented variants collide with plain ones."""
    return "".join(c for c in unicodedata.normalize("NFKD", s or "")
                   if not unicodedata.combining(c))


def norm_name(s):
    return re.sub(r"[^a-z0-9]", "", fold_accents(s).lower())


def name_tokens(s):
    return set(t for t in re.sub(r"[^a-z0-9 ]", " ", fold_accents(s).lower()).split() if t)


def jaccard(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def norm_phone(s):
    d = re.sub(r"\D", "", s or "")
    return d[-10:] if len(d) >= 10 else d


def domain(url):
    if not url:
        return ""
    m = re.sub(r"^https?://", "", url.lower()).split("/")[0]
    m = re.sub(r"^www\.", "", m)
    # collapse facebook/instagram to the path-bearing handle? keep host for now
    return m


def haversine_m(lat1, lng1, lat2, lng2):
    if None in (lat1, lng1, lat2, lng2):
        return float("inf")
    R = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def richness(p):
    """Higher = keep. Real photo dominates, then field count, then confidence."""
    img = p.get("image") or {}
    real = 1 if img.get("kind") == "real" else 0
    conf = {"high": 2, "medium": 1, "low": 0}.get(p.get("coordinateConfidence"), 0)
    fields = sum(1 for k, v in p.items() if v not in (None, "", [], {}))
    return (real, conf, fields)


def build_reference_index():
    """Map of place id -> list of references in sibling files."""
    refs = {}
    def add(pid, where):
        if pid:
            refs.setdefault(pid, []).append(where)
    if ANCHOR_CARDS.exists():
        for c in json.loads(ANCHOR_CARDS.read_text(encoding="utf-8")):
            add(c.get("placeId"), "anchor_cards.json")
    if PATHS_JSON.exists():
        for path in json.loads(PATHS_JSON.read_text(encoding="utf-8")):
            for stop in path.get("stops", []):
                add(stop.get("placeId"), f"paths.json:{path.get('id')}")
    return refs


def rewrite_references(id_map):
    """Repoint placeId references in sibling files from dropped ids to kept ids.
    Backs up each touched file. id_map: {old_id: new_id}."""
    stamp = time.strftime("%Y%m%d-%H%M%S")
    for path, kind in ((ANCHOR_CARDS, "anchor"), (PATHS_JSON, "paths")):
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        changed = 0
        if kind == "anchor":
            for c in data:
                if c.get("placeId") in id_map:
                    c["placeId"] = id_map[c["placeId"]]
                    changed += 1
        else:
            for p in data:
                for stop in p.get("stops", []):
                    if stop.get("placeId") in id_map:
                        stop["placeId"] = id_map[stop["placeId"]]
                        changed += 1
        if changed:
            path.with_name(path.name + f".bak-before-dedupe-{stamp}").write_text(
                path.read_text(encoding="utf-8"), encoding="utf-8")
            tmp = path.with_suffix(path.suffix + ".tmp")
            tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            tmp.replace(path)
            print(f"  rewrote {changed} ref(s) in {path.name}")


def group_record(p, idx):
    return {
        "idx": idx,
        "id": p.get("id"),
        "name": p.get("name"),
        "city": p.get("city"),
        "website": p.get("website"),
        "phone": p.get("phone"),
        "lat": p.get("lat"),
        "lng": p.get("lng"),
        "image_kind": (p.get("image") or {}).get("kind"),
        "coordinateConfidence": p.get("coordinateConfidence"),
        "richness": richness(p),
    }


def exact_groups(items):
    """Groups of records sharing an identical normalized name. Authoritative."""
    by_norm = {}
    for i, p in enumerate(items):
        nm = norm_name(p.get("name"))
        if nm:
            by_norm.setdefault(nm, []).append(i)
    return [idxs for idxs in by_norm.values() if len(idxs) > 1]


def variant_pairs(items, exact_lookup):
    """Variant-name near-dup PAIRS (review only). Excludes exact-group members
    of the same group so true exact dups aren't double-counted here."""
    n = len(items)
    toks = [name_tokens(p.get("name")) for p in items]
    doms = [domain(p.get("website")) for p in items]
    phones = [norm_phone(p.get("phone")) for p in items]
    pairs = []
    for i in range(n):
        for j in range(i + 1, n):
            if exact_lookup.get(i) is not None and exact_lookup.get(i) == exact_lookup.get(j):
                continue  # already an exact dup, handled there
            if norm_name(items[i].get("name")) == norm_name(items[j].get("name")):
                continue
            sim = jaccard(toks[i], toks[j])
            if sim < NAME_SIM_THRESHOLD:
                continue
            dist = haversine_m(items[i].get("lat"), items[i].get("lng"),
                               items[j].get("lat"), items[j].get("lng"))
            same_dom = bool(doms[i]) and doms[i] == doms[j]
            same_phone = bool(phones[i]) and phones[i] == phones[j]
            if dist <= PROXIMITY_M or ((same_dom or same_phone) and dist <= NEAR_PROXIMITY_M):
                pairs.append((i, j, round(sim, 2), round(dist, 1), same_dom, same_phone))
    return pairs


def detect(items):
    refs = build_reference_index()

    exacts = exact_groups(items)
    exact_lookup = {}
    for gid, idxs in enumerate(exacts):
        for i in idxs:
            exact_lookup[i] = gid

    exact_report = []
    for idxs in exacts:
        recs = [group_record(items[i], i) for i in idxs]
        recs.sort(key=lambda r: r["richness"], reverse=True)
        keep, drops = recs[0], recs[1:]
        for d in drops:
            d["referenced_in"] = refs.get(d["id"], [])
        exact_report.append({
            "type": "exact",
            "size": len(idxs),
            "keep": keep,
            "drop": drops,
            "drop_has_refs": any(d["referenced_in"] for d in drops),
        })
    exact_report.sort(key=lambda g: -g["size"])

    variant_report = []
    for i, j, sim, dist, same_dom, same_phone in variant_pairs(items, exact_lookup):
        a, b = group_record(items[i], i), group_record(items[j], j)
        recs = sorted([a, b], key=lambda r: r["richness"], reverse=True)
        keep, drop = recs[0], recs[1]
        drop["referenced_in"] = refs.get(drop["id"], [])
        variant_report.append({
            "type": "variant",
            "name_jaccard": sim,
            "distance_m": dist,
            "shared_domain": same_dom,
            "shared_phone": same_phone,
            "keep": keep,
            "drop": [drop],
            "drop_has_refs": bool(drop["referenced_in"]),
        })
    variant_report.sort(key=lambda g: -g["name_jaccard"])
    return {"exact": exact_report, "variant": variant_report}


def merge_group(items, keep_idx, drop_idxs):
    """Fold unique non-empty fields from drops into keep (keep wins conflicts)."""
    keep = items[keep_idx]
    for di in drop_idxs:
        d = items[di]
        for k, v in d.items():
            if k == "image":
                continue
            if v in (None, "", [], {}):
                continue
            if keep.get(k) in (None, "", [], {}):
                keep[k] = v
    return keep


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--merge", action="store_true", help="apply merges (default: detect only)")
    ap.add_argument("--dry-run", action="store_true", help="with --merge: show plan, write nothing")
    ap.add_argument("--only-exact", action="store_true", help="merge only exact-name groups")
    args = ap.parse_args()

    items = json.loads(PLACES_JSON.read_text(encoding="utf-8"))
    report = detect(items)
    exact = report["exact"]
    variant = report["variant"]
    extra = sum(g["size"] - 1 for g in exact)
    print(f"places.json: {len(items)} records")
    print(f"exact groups: {len(exact)} ({extra} extra records)   "
          f"variant pairs (review): {len(variant)}")

    if not args.merge:
        REPORT_FILE.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print("\n--- EXACT groups (safe auto-merge) ---")
        for g in exact:
            print(f"  [{g['size']}] keep {g['keep']['name']} ({g['keep']['city']}) "
                  f"photo={g['keep']['image_kind']}"
                  + ("  <DROP HAS REFS>" if g["drop_has_refs"] else ""))
        print("\n--- VARIANT pairs (need review; NOT auto-merged) ---")
        for g in variant:
            d = g["drop"][0]
            print(f"  sim={g['name_jaccard']} dist={g['distance_m']}m "
                  f"dom={int(g['shared_domain'])} ph={int(g['shared_phone'])}: "
                  f"{g['keep']['name']}  |  {d['name']}"
                  + ("  <DROP HAS REFS>" if g["drop_has_refs"] else ""))
        print(f"\nreport: {REPORT_FILE}")
        return

    # MERGE — cluster by indices: always exact groups; add approved variants
    # unless --only-exact.
    n = len(items)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for g in exact:
        base = g["keep"]["idx"]
        for d in g["drop"]:
            union(base, d["idx"])

    if not args.only_exact:
        approved_norm = [set(norm_name(x) for x in s) for s in APPROVED_VARIANT_DUPS]
        for g in variant:
            ni = norm_name(g["keep"]["name"])
            nj = norm_name(g["drop"][0]["name"])
            if any(ni in s and nj in s for s in approved_norm):
                union(g["keep"]["idx"], g["drop"][0]["idx"])

    clusters = {}
    for i in range(n):
        clusters.setdefault(find(i), []).append(i)
    clusters = [idxs for idxs in clusters.values() if len(idxs) > 1]

    drop_indices = set()
    id_remap = {}   # dropped id -> kept id (for ref rewriting)
    plan = []
    for idxs in clusters:
        idxs.sort(key=lambda i: richness(items[i]), reverse=True)
        keep_idx, drop_idxs = idxs[0], idxs[1:]
        plan.append((keep_idx, drop_idxs))
        for di in drop_idxs:
            drop_indices.add(di)
            if items[di].get("id"):
                id_remap[items[di]["id"]] = items[keep_idx].get("id")

    print(f"\nmerge plan: {len(plan)} clusters, dropping {len(drop_indices)} records "
          + ("(exact only)" if args.only_exact else "(exact + approved variants)"))
    for ki, dis in plan:
        print(f"  keep {items[ki]['name']} ({items[ki].get('city')}) "
              f"photo={(items[ki].get('image') or {}).get('kind')} "
              f"<- drop {[items[i]['name'] for i in dis]}")

    refs = build_reference_index()
    ref_fixes = {d: k for d, k in id_remap.items() if d in refs}
    if ref_fixes:
        print("\nreference rewrites (paths/anchor placeId):")
        for d, k in ref_fixes.items():
            print(f"  {d}  ->  {k}   (in {refs[d]})")

    if args.dry_run:
        print("\nDRY RUN: no files written.")
        return

    # Backup
    stamp = time.strftime("%Y%m%d-%H%M%S")
    backup = PLACES_JSON.with_name(f"places.json.bak-before-dedupe-{stamp}")
    backup.write_text(PLACES_JSON.read_text(encoding="utf-8"), encoding="utf-8")
    print(f"\nbackup: {backup}")

    for ki, dis in plan:
        merge_group(items, ki, dis)

    kept = [p for i, p in enumerate(items) if i not in drop_indices]
    tmp = PLACES_JSON.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(kept, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(PLACES_JSON)
    print(f"merged: {len(items)} -> {len(kept)} records")

    # Rewrite sibling references for any dropped-but-referenced id
    if ref_fixes:
        rewrite_references(ref_fixes)

    print(f"updated: {PLACES_JSON}")


if __name__ == "__main__":
    main()
