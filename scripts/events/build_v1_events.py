#!/usr/bin/env python3
"""Build the V1 Discovery Map events feed from the merged firehose.

Reads the merged-flat firehose output and emits the flat schema the V1
Discovery Map app expects (``v1-discovery-map/data/events.json``), keeping
ONLY events that (a) resolve to a venue that is a visible place in the V1
``places.json`` and (b) start on or after today (America/Los_Angeles).

This is the data-side half of the Event Freshness Guarantee (see
``app/docs/V1-DISCOVERY-MAP-DECISION-LOG.md`` Events ruling 2026-05-30 and
``app/CONTEXT.md``). The app applies a belt-and-suspenders filter too.

Matching principle (do NOT regenerate place ids): V1 place ids preserve
"the" and render apostrophes as ``-s-``, which the canonical ``slug()`` does
not reproduce. So we build a normalized ``(name, city) -> place`` index over
``places.json`` and read each matched place's REAL existing
``id``/``lat``/``lng``/``name``/``category`` straight from the record.

Usage:
    python scripts/events/build_v1_events.py [--keep-stale] [--quiet]

``--keep-stale`` skips the ``date >= today`` filter (match-rate sanity check
against the March firehose). Never use it for the committed file.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Repo layout: this file lives at app/scripts/events/build_v1_events.py
APP_ROOT = Path(__file__).resolve().parents[2]
FIREHOSE = APP_ROOT / "website" / "cultural-map-redesign" / "events-merged-flat.json"
PLACES = APP_ROOT / "website" / "cultural-map-redesign-stitch-lab" / "v1-discovery-map" / "data" / "places.json"
ALIASES = APP_ROOT / "scripts" / "events" / "venue_aliases.json"
EVENT_TAGS = APP_ROOT / "scripts" / "events" / "event_tags.json"
OUT = APP_ROOT / "website" / "cultural-map-redesign-stitch-lab" / "v1-discovery-map" / "data" / "events.json"
REPORT = APP_ROOT / "scripts" / "events" / "reports" / "build_v1_events_report.json"

# America/Los_Angeles is UTC-8 (PST) / UTC-7 (PDT). The firehose start_iso
# already carries the local offset (e.g. "2026-03-07T10:00:00-08:00"), so the
# date portion is already local-wall-clock — we slice it directly. "Today" is
# computed in Pacific by applying the current offset; -7h is correct late May
# (PDT) and only ever shifts the boundary by an hour, which the app's filter
# also guards.
PACIFIC_OFFSET = timedelta(hours=-7)


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\xa0", " ")).strip()


def normalize(value: object) -> str:
    """Mirror scripts/build-v1-coordinate-sanity-pass.py normalize()."""
    text = clean(value).lower().replace("&", "and")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def strip_articles(text: str) -> str:
    """Drop a leading article so 'the center for the arts' matches 'center for the arts'."""
    return re.sub(r"^(the|a|an)\s+", "", text).strip()


def venue_key(name: object, city: object) -> str:
    return f"{normalize(name)}|{normalize(city)}"


def venue_key_loose(name: object, city: object) -> str:
    return f"{strip_articles(normalize(name))}|{normalize(city)}"


def pacific_today_iso() -> str:
    now_pacific = datetime.now(timezone.utc) + PACIFIC_OFFSET
    return now_pacific.strftime("%Y-%m-%d")


def load_json(path: Path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def build_place_index(places: list[dict]) -> tuple[dict, dict]:
    """Return (strict, loose) maps from venue key -> place record.

    First write wins so the earliest/most canonical record is preferred on
    collision; collisions are rare and both records share coordinates anyway.
    """
    strict: dict[str, dict] = {}
    loose: dict[str, dict] = {}
    for place in places:
        name, city = place.get("name"), place.get("city")
        strict.setdefault(venue_key(name, city), place)
        loose.setdefault(venue_key_loose(name, city), place)
    return strict, loose


def build_alias_map(aliases_doc: dict) -> dict:
    """venue (normalized name|city) -> (asset_name, asset_city)."""
    out: dict[str, tuple[str, str]] = {}
    for entry in aliases_doc.get("aliases", []):
        key = venue_key(entry.get("venue_name"), entry.get("venue_city"))
        out[key] = (entry.get("asset_name"), entry.get("asset_city"))
    return out


def resolve_place(event: dict, strict: dict, loose: dict, alias_map: dict) -> dict | None:
    name, city = event.get("venue_name"), event.get("venue_city")

    # 1. Alias bridge: map the firehose venue to a canonical asset name first.
    alias = alias_map.get(venue_key(name, city))
    if alias:
        a_name, a_city = alias
        place = strict.get(venue_key(a_name, a_city)) or loose.get(venue_key_loose(a_name, a_city))
        if place:
            return place

    # 2. Direct strict match, then article-insensitive match.
    return strict.get(venue_key(name, city)) or loose.get(venue_key_loose(name, city))


def derive_category(event: dict, place: dict) -> str:
    tags = event.get("event_tags") or []
    if tags:
        return ", ".join(t.replace("-", " ").title() for t in tags)
    return clean(place.get("category"))


def hhmm(iso: str) -> str:
    """Venue-local wall-clock 'HH:MM' from an offset-carrying ISO string.

    start_iso already encodes Pacific wall-clock time (e.g.
    '2026-06-12T20:00:00-07:00'), so slicing avoids any viewer-timezone drift.
    Returns '' for all-day/midnight starts so the card omits a bogus time.
    """
    t = clean(iso)[11:16]
    return "" if t in ("", "00:00") else t


def to_v1_event(event: dict, place: dict, tag_labels: dict) -> dict:
    start_iso = clean(event.get("start_iso"))
    date = start_iso[:10]
    tags = event.get("event_tags") or []
    # Program tab names the event's own intent via the first tag's human label
    # ("Live Music", "Family & Kids"); no tag → no tab (the venue category is
    # the place's type, not the event's). Labels come from event_tags.json.
    program = tag_labels.get(tags[0], "") if tags else ""
    # The Trumba RSS/GVDA ingests already harvest a per-event flyer (image_url,
    # upscaled to w=900) and a per-event link (ticket_url); both survive the
    # merge into the firehose. Pass them through. Prefer the per-event link
    # over source_ref, which is only the feed URL. Events with no upstream
    # image (Crazy Horse, Golden Era) keep image:"" and the card falls back to
    # the brand gradient spray. start/end times, presenter, tags, and the
    # family flag feed the enriched detail card (poster anatomy).
    return {
        "id": event.get("event_id"),
        "title": clean(event.get("title")),
        "date": date,
        "startTime": hhmm(start_iso),
        "endTime": hhmm(event.get("end_iso")),
        "category": derive_category(event, place),
        "program": program,
        "family": bool(event.get("is_family")),
        "presenter": clean(event.get("source_label")),
        "description": clean(event.get("description")),
        "url": clean(event.get("ticket_url")) or clean(event.get("source_ref")),
        "image": clean(event.get("image_url")),
        "placeId": place.get("id"),
        "placeName": place.get("name"),
        "city": place.get("city"),
        "lat": place.get("lat"),
        "lng": place.get("lng"),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--keep-stale", action="store_true",
                        help="skip the date>=today filter (match-rate sanity only)")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    firehose = load_json(FIREHOSE)
    places = load_json(PLACES)
    alias_map = build_alias_map(load_json(ALIASES))
    strict, loose = build_place_index(places)
    tag_labels = {slug: cfg.get("display", "") for slug, cfg in load_json(EVENT_TAGS).get("tags", {}).items()}
    today = pacific_today_iso()

    emitted: list[dict] = []
    unmatched: list[dict] = []
    dropped_stale = 0
    dropped_no_coords = 0
    seen_ids: set[str] = set()

    for event in firehose:
        place = resolve_place(event, strict, loose, alias_map)
        if not place:
            unmatched.append({
                "venue_name": event.get("venue_name"),
                "venue_city": event.get("venue_city"),
                "title": event.get("title"),
            })
            continue
        # A matched place with no coordinates can't render a map marker
        # (MapLibre needs [lng, lat]); skip rather than emit a broken point.
        if place.get("lat") is None or place.get("lng") is None:
            dropped_no_coords += 1
            continue
        v1 = to_v1_event(event, place, tag_labels)
        if not args.keep_stale and v1["date"] < today:
            dropped_stale += 1
            continue
        if v1["id"] in seen_ids:
            continue
        seen_ids.add(v1["id"])
        emitted.append(v1)

    emitted.sort(key=lambda e: (e["date"], e["title"]))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(emitted, fh, ensure_ascii=False, indent=2)

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "today_pacific": today,
        "keep_stale": args.keep_stale,
        "firehose_count": len(firehose),
        "emitted_count": len(emitted),
        "dropped_stale_count": dropped_stale,
        "dropped_no_coords_count": dropped_no_coords,
        "unmatched_count": len(unmatched),
        "unmatched": sorted(
            {f"{u['venue_name']} | {u['venue_city']}" for u in unmatched}
        ),
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT, "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)

    if not args.quiet:
        matched = len(firehose) - len(unmatched)
        print(f"firehose={len(firehose)} matched={matched} "
              f"unmatched={len(unmatched)} dropped_stale={dropped_stale} "
              f"emitted={len(emitted)} (today={today}, keep_stale={args.keep_stale})")
        print(f"-> {OUT}")
        print(f"-> {REPORT}")


if __name__ == "__main__":
    main()
