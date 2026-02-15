#!/usr/bin/env python3
"""
Ingest GVDA (Grass Valley Downtown Association) Trumba JSON feed into canonical events JSON.

Fetches the public Trumba JSON calendar feed, extracts structured event data
including custom fields (venue, city, event type, age range), strips HTML from
location fields, and outputs events in the same canonical schema as other ingest
scripts.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import requests


DEFAULT_JSON_URL = "https://www.trumba.com/calendars/GVDA.json"
DEFAULT_OUTPUT_FILE = Path("website/cultural-map-redesign/events-gvda.json")
DEFAULT_WINDOW_DAYS = 14
DEFAULT_TZ = "America/Los_Angeles"
DEFAULT_TIMEOUT = 30

# Nevada County cities for fallback city inference from location text
NC_CITIES_DISPLAY = {
    "grass valley": "Grass Valley",
    "nevada city": "Nevada City",
    "penn valley": "Penn Valley",
    "north san juan": "North San Juan",
    "truckee": "Truckee",
    "chicago park": "Chicago Park",
    "alta sierra": "Alta Sierra",
    "lake wildwood": "Lake Wildwood",
    "rough and ready": "Rough and Ready",
    "cedar ridge": "Cedar Ridge",
    "washington": "Washington",
    "north columbia": "North Columbia",
    "camptonville": "Camptonville",
    "downieville": "Downieville",
    "sierra city": "Sierra City",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert GVDA Trumba JSON feed into canonical events JSON."
    )
    parser.add_argument(
        "--json-url",
        default=DEFAULT_JSON_URL,
        help=f"GVDA Trumba JSON feed URL (default: {DEFAULT_JSON_URL})",
    )
    parser.add_argument(
        "--output-file",
        type=Path,
        default=DEFAULT_OUTPUT_FILE,
        help=f"Output events JSON file (default: {DEFAULT_OUTPUT_FILE})",
    )
    parser.add_argument(
        "--window-days",
        type=int,
        default=DEFAULT_WINDOW_DAYS,
        help=f"Include upcoming events in next N days (default: {DEFAULT_WINDOW_DAYS})",
    )
    parser.add_argument(
        "--timezone",
        default=DEFAULT_TZ,
        help=f"IANA timezone name for output datetimes (default: {DEFAULT_TZ})",
    )
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=DEFAULT_TIMEOUT,
        help=f"HTTP timeout in seconds (default: {DEFAULT_TIMEOUT})",
    )
    return parser.parse_args()


def fail(message: str) -> None:
    print(f"[X] {message}", file=sys.stderr)
    sys.exit(1)


def clean_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def strip_html(value: str) -> str:
    """Remove HTML tags from a string."""
    return re.sub(r"<[^>]+>", "", value).strip()


def parse_custom_fields(event: dict) -> dict[str, str]:
    """Convert customFields array to dict keyed by label."""
    result: dict[str, str] = {}
    for cf in event.get("customFields", []):
        label = cf.get("label", "")
        value = cf.get("value", "")
        if label and value:
            result[label] = value
    return result


def extract_venue_name(location: str, custom_fields: dict[str, str]) -> str:
    """Extract venue name from location field and custom fields.

    Checks customFields first (most reliable), then parses HTML location.
    Location can be:
    - Plain text: "SDA Church"
    - HTML anchor: '<a href="...">Nevada City Winery</a>'
    - HTML with address: '<a href="...">325 Spring Street Nevada City</a>'
    """
    # Check customFields first (most reliable)
    for key in ("Venue", "Event Location", "Other Location"):
        value = custom_fields.get(key, "").strip()
        if value:
            return clean_space(strip_html(value))

    if not location or not location.strip():
        return "Unknown venue"

    # Extract text from HTML anchor tag
    anchor_match = re.search(r">([^<]+)<", location)
    if anchor_match:
        text = anchor_match.group(1).strip()
    else:
        text = strip_html(location)

    text = clean_space(text)

    # If text looks like an address (starts with digit), return Unknown
    if text and re.match(r"^\d", text):
        return "Unknown venue"

    return text if text else "Unknown venue"


def extract_city(location: str, custom_fields: dict[str, str]) -> str:
    """Extract city from customFields or location text."""
    # Check customFields first
    for key in ("City/Area", "City / Area"):
        value = custom_fields.get(key, "").strip()
        if value:
            return clean_space(value)

    # Fall back to scanning location text for NC city names
    if location:
        loc_lower = strip_html(location).lower()
        for pattern, display_name in NC_CITIES_DISPLAY.items():
            if pattern in loc_lower:
                return display_name

    return ""


def parse_gvda_datetime(dt_str: str, tz: ZoneInfo) -> datetime:
    """Parse GVDA datetime string into timezone-aware datetime.

    GVDA JSON has startDateTime like "2026-02-15T14:00:00" (no timezone)
    and a separate startTimeZoneOffset like "-0800".
    We use Pacific timezone directly since the offset confirms it.
    """
    naive = datetime.fromisoformat(dt_str)
    return naive.replace(tzinfo=tz)


def extract_tags(custom_fields: dict[str, str]) -> list[str]:
    """Extract event type tags from customFields."""
    raw = custom_fields.get("Type of Event", "")
    if not raw:
        return []
    tags = [clean_space(part) for part in raw.split(",")]
    return [tag for tag in tags if tag]


def is_family_event(custom_fields: dict[str, str]) -> bool:
    """Check if event is family-friendly based on age range."""
    age_range = custom_fields.get("Age Range", "").lower()
    if not age_range:
        return False
    family_keywords = {"family", "all ages", "children", "kids", "youth"}
    return any(kw in age_range for kw in family_keywords)


def parse_events(
    raw_events: list[dict],
    tz_name: str,
    source_ref: str,
    window_days: int,
) -> tuple[list[dict[str, Any]], int, int]:
    """Parse GVDA JSON events and return (events, skipped_past, skipped_future)."""
    tz = ZoneInfo(tz_name)
    now = datetime.now(tz)
    window_end = now + timedelta(days=window_days)

    events: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    skipped_past = 0
    skipped_future = 0
    warnings: list[str] = []

    for raw in raw_events:
        title = clean_space(raw.get("title", ""))
        if not title:
            continue

        # Parse datetime
        start_str = raw.get("startDateTime", "")
        if not start_str:
            continue

        try:
            start_dt = parse_gvda_datetime(start_str, tz)
        except (ValueError, TypeError) as exc:
            warnings.append(f"Skipped '{title}': bad startDateTime '{start_str}': {exc}")
            continue

        # End datetime
        end_str = raw.get("endDateTime", "")
        if end_str:
            try:
                end_dt = parse_gvda_datetime(end_str, tz)
            except (ValueError, TypeError):
                end_dt = start_dt + timedelta(hours=2)
        else:
            end_dt = start_dt + timedelta(hours=2)

        # 14-day window filter
        if start_dt < now:
            skipped_past += 1
            continue
        if start_dt > window_end:
            skipped_future += 1
            continue

        # Parse custom fields
        custom_fields = parse_custom_fields(raw)

        # Extract structured data
        location = raw.get("location", "")
        venue_name = extract_venue_name(location, custom_fields)
        venue_city = extract_city(location, custom_fields)
        tags = extract_tags(custom_fields)
        family = is_family_event(custom_fields)

        # Event ID from Trumba numeric ID
        trumba_id = raw.get("eventID")
        if trumba_id:
            event_id = f"gvda-{trumba_id}"
        else:
            slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
            if not slug:
                slug = "event"
            event_id = f"gvda-{start_dt.strftime('%Y%m%d%H%M')}-{slug[:40]}"

        # Handle duplicate IDs
        if event_id in seen_ids:
            counter = 2
            while f"{event_id}-{counter}" in seen_ids:
                counter += 1
            event_id = f"{event_id}-{counter}"
        seen_ids.add(event_id)

        # Description: strip HTML, truncate
        description_raw = raw.get("description", "")
        description = ""
        if description_raw:
            description = clean_space(strip_html(description_raw))[:500]

        # Build canonical event
        event: dict[str, Any] = {
            "event_id": event_id,
            "title": title,
            "start_iso": start_dt.isoformat(timespec="seconds"),
            "end_iso": end_dt.isoformat(timespec="seconds"),
            "timezone": tz_name,
            "venue_name": venue_name,
            "source_type": "json",
            "source_ref": source_ref,
            "source_label": "Grass Valley Downtown Association",
            "is_family": family,
            "last_verified_at": now.isoformat(timespec="seconds"),
        }

        if venue_city:
            event["venue_city"] = venue_city
        if description:
            event["description"] = description
        if tags:
            event["tags"] = tags

        # Ticket URL from permaURL
        perma_url = raw.get("permaURL", "")
        if perma_url and perma_url.startswith("http"):
            event["ticket_url"] = perma_url

        # Image URL (eventImage is a dict with "url" key)
        event_image = raw.get("eventImage")
        if isinstance(event_image, dict):
            image_url = event_image.get("url", "")
            if image_url and image_url.startswith("http"):
                event["image_url"] = image_url
        elif isinstance(event_image, str) and event_image.startswith("http"):
            event["image_url"] = event_image

        events.append(event)

    # Print warnings
    for w in warnings[:5]:
        print(f"  [WARN] {w}", file=sys.stderr)
    if len(warnings) > 5:
        print(f"  [WARN] ...and {len(warnings) - 5} more warnings", file=sys.stderr)

    events.sort(key=lambda e: (e["start_iso"], e["event_id"]))
    return events, skipped_past, skipped_future


def main() -> int:
    args = parse_args()

    # Fetch JSON feed
    try:
        response = requests.get(args.json_url, timeout=args.timeout_seconds)
        response.raise_for_status()
    except requests.RequestException as exc:
        fail(f"Failed to fetch JSON feed: {exc}")

    try:
        raw_events = response.json()
    except (json.JSONDecodeError, ValueError) as exc:
        fail(f"Invalid JSON from feed: {exc}")

    if not isinstance(raw_events, list):
        fail(f"Expected JSON array, got {type(raw_events).__name__}")

    events, skipped_past, skipped_future = parse_events(
        raw_events=raw_events,
        tz_name=args.timezone,
        source_ref=args.json_url,
        window_days=args.window_days,
    )

    # Wrap with generated_at timestamp
    output = {
        "generated_at": datetime.now(ZoneInfo(args.timezone)).isoformat(timespec="seconds"),
        "events": events,
    }

    args.output_file.parent.mkdir(parents=True, exist_ok=True)
    args.output_file.write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(
        f"Fetched {len(events)} events from GVDA ({skipped_past} past skipped, {skipped_future} future skipped)",
        file=sys.stderr,
    )
    print(f"[OK] GVDA Trumba JSON ingested", file=sys.stderr)
    print(f"  json_url={args.json_url}", file=sys.stderr)
    print(f"  output={args.output_file}", file=sys.stderr)
    print(f"  total={len(events)}", file=sys.stderr)
    print(f"  raw_feed_size={len(raw_events)}", file=sys.stderr)
    if events:
        print(f"  first={events[0]['start_iso']} :: {events[0]['title']}", file=sys.stderr)
        print(f"  last={events[-1]['start_iso']} :: {events[-1]['title']}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
