#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Fetch hotlinked photos for placeholder places via the Google Places API (NEW).

Targets the LIVE map data: v1-discovery-map/data/places.json.
For each place whose image.kind != "real", it runs a Places API (New) Text
Search, takes the first result's first photo, resolves it to a hotlink URL,
and rewrites that place's `image` block to kind="real" (keeping the existing
placeholder fields as a fallback).

Cost shape (per place): 1 searchText + at most 1 photo-media call.
The script processes a BOUNDED list (no retry loops), so a full run makes at
most ~2x the number of placeholders in API calls. Use --limit to test small.

Usage:
  python scripts/fetch_place_photos.py --limit 10           # test on 10
  python scripts/fetch_place_photos.py --limit 10 --dry-run # no calls, just show targets
  python scripts/fetch_place_photos.py                      # full run (all placeholders)
  python scripts/fetch_place_photos.py --resume             # default: skips kind==real already

Key is read from app/.env (GOOGLE_PLACES_API_KEY) or the environment.
"""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

import argparse
import json
import os
import time
import urllib.request
import urllib.error
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
APP_DIR = SCRIPT_DIR.parent
PLACES_JSON = APP_DIR / "website" / "cultural-map-redesign-stitch-lab" / "v1-discovery-map" / "data" / "places.json"
REPORT_FILE = SCRIPT_DIR / "place_photos_report.json"
ENV_FILE = APP_DIR / ".env"

SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
PHOTO_MAX_WIDTH = 800
REQUEST_TIMEOUT = 15
DELAY = 0.15  # polite pause between places


def load_api_key():
    key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not key and ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("GOOGLE_PLACES_API_KEY=") and not line.startswith("#"):
                key = line.split("=", 1)[1].strip()
                break
    if not key or key == "your_api_key_here":
        sys.exit("ERROR: GOOGLE_PLACES_API_KEY not found in env or app/.env")
    return key


def post_json(url, payload, headers):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8"))


def get_json(url, headers):
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8"))


def search_first_photo(key, place):
    """Return (photo_resource_name, attribution_text) or (None, reason)."""
    query_bits = [place.get("name", "")]
    if place.get("city"):
        query_bits.append(place["city"])
    query_bits.append("CA")
    text_query = ", ".join(b for b in query_bits if b)

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        # Field mask drives the SKU. Keep it minimal: id, name, photos.
        "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
    }
    try:
        d = post_json(SEARCH_URL, {"textQuery": text_query}, headers)
    except urllib.error.HTTPError as e:
        return None, f"search HTTP {e.code}: {e.read().decode('utf-8','replace')[:120]}"
    except Exception as e:
        return None, f"search error: {e}"

    places = d.get("places", [])
    if not places:
        return None, "no search result"
    photos = places[0].get("photos", [])
    if not photos:
        return None, "result has no photos"
    photo = photos[0]
    attrs = photo.get("authorAttributions", [])
    attr_text = attrs[0].get("displayName", "") if attrs else ""
    return photo["name"], attr_text


def resolve_photo_url(key, photo_name):
    """Resolve a photo resource name to a hotlink URL (no image download)."""
    url = (f"https://places.googleapis.com/v1/{photo_name}/media"
           f"?maxWidthPx={PHOTO_MAX_WIDTH}&skipHttpRedirect=true")
    headers = {"X-Goog-Api-Key": key}
    try:
        d = get_json(url, headers)
    except urllib.error.HTTPError as e:
        return None, f"photo HTTP {e.code}: {e.read().decode('utf-8','replace')[:120]}"
    except Exception as e:
        return None, f"photo error: {e}"
    uri = d.get("photoUri")
    return (uri, None) if uri else (None, "no photoUri in response")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="max places to process (0 = all)")
    ap.add_argument("--dry-run", action="store_true", help="list targets, make no API calls")
    ap.add_argument("--no-resume", action="store_true", help="re-process even places already kind==real")
    args = ap.parse_args()

    key = None if args.dry_run else load_api_key()
    items = json.loads(PLACES_JSON.read_text(encoding="utf-8"))

    targets = []
    for idx, p in enumerate(items):
        img = p.get("image") or {}
        is_real = img.get("kind") == "real"
        if is_real and not args.no_resume:
            continue
        targets.append(idx)

    if args.limit:
        targets = targets[: args.limit]

    print(f"places.json: {len(items)} total, {len(targets)} to process"
          + (f" (limit {args.limit})" if args.limit else ""))
    if args.dry_run:
        for i in targets[:50]:
            print(f"  - {items[i].get('name')} [{items[i].get('city')}]")
        print(f"DRY RUN: would make up to {len(targets)} searchText + {len(targets)} photo calls.")
        return

    stats = {"found": 0, "no_photo": 0, "no_result": 0, "error": 0}
    search_calls = photo_calls = 0
    changes, failures = [], []

    for n, i in enumerate(targets, 1):
        p = items[i]
        name = p.get("name", "?")
        photo_name, attr = search_first_photo(key, p)
        search_calls += 1
        if not photo_name:
            if attr == "no search result":
                stats["no_result"] += 1
            elif attr == "result has no photos":
                stats["no_photo"] += 1
            else:
                stats["error"] += 1
                failures.append({"name": name, "stage": "search", "detail": attr})
            print(f"[{n}/{len(targets)}] {name}: {attr}")
            time.sleep(DELAY)
            continue

        url, err = resolve_photo_url(key, photo_name)
        photo_calls += 1
        if not url:
            stats["error"] += 1
            failures.append({"name": name, "stage": "photo", "detail": err})
            print(f"[{n}/{len(targets)}] {name}: {err}")
            time.sleep(DELAY)
            continue

        img = p.get("image") or {}
        img.update({
            "kind": "real",
            "src": url,
            "alt": f"{name}" + (f" in {p['city']}" if p.get("city") else ""),
            "credit": (f"{attr}, via Google" if attr else "via Google Places"),
            "status": "credible",
            "reason": "",
        })
        p["image"] = img
        stats["found"] += 1
        changes.append({"name": name, "src": url})
        print(f"[{n}/{len(targets)}] {name}: OK -> photo")
        time.sleep(DELAY)

    # Write back atomically
    tmp = PLACES_JSON.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(PLACES_JSON)

    REPORT_FILE.write_text(json.dumps(
        {"stats": stats, "search_calls": search_calls, "photo_calls": photo_calls,
         "changes": changes, "failures": failures},
        ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n=== SUMMARY ===")
    print(f"  photos added:   {stats['found']}")
    print(f"  no photo avail: {stats['no_photo']}")
    print(f"  no result:      {stats['no_result']}")
    print(f"  errors:         {stats['error']}")
    print(f"  API calls made: {search_calls} searchText + {photo_calls} photo = {search_calls + photo_calls}")
    print(f"  report: {REPORT_FILE}")
    print(f"  updated: {PLACES_JSON}")


if __name__ == "__main__":
    main()
