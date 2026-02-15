#!/usr/bin/env python3
"""
Ingest Nevada County Library LibCal iCal feed into canonical events JSON.

Fetches the public iCal subscription feed, expands recurring events (RRULE)
within the configured window, and outputs events in the same canonical schema
as ingest_trumba_rss.py.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import requests
from icalendar import Calendar
import recurring_ical_events


DEFAULT_ICAL_URL = "https://nevadacountyca.libcal.com/ical_subscribe.php?src=p&cid=20247"
DEFAULT_OUTPUT_FILE = Path("website/cultural-map-redesign/events-libcal.json")
DEFAULT_WINDOW_DAYS = 14
DEFAULT_TZ = "America/Los_Angeles"
DEFAULT_TIMEOUT = 30


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert LibCal iCal feed into canonical events JSON."
    )
    parser.add_argument(
        "--ical-url",
        default=DEFAULT_ICAL_URL,
        help=f"LibCal iCal feed URL (default: {DEFAULT_ICAL_URL})",
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


def strip_uid_suffix(uid: str) -> str:
    """Strip the @libcal.com suffix from UID if present."""
    uid = uid.strip()
    if "@" in uid:
        uid = uid.split("@")[0]
    return uid


def make_event_id(uid: str, start_dt: datetime, title: str) -> str:
    """Generate a stable event_id from UID, falling back to date+title slug."""
    cleaned = strip_uid_suffix(uid)
    if cleaned:
        # For recurring event instances, include the date to differentiate
        return f"libcal-{cleaned}-{start_dt.strftime('%Y%m%d')}"
    slug = re.sub(r"[^a-z0-9]+", "-", (title or "").lower()).strip("-")
    if not slug:
        slug = "event"
    return f"libcal-{start_dt.strftime('%Y%m%d%H%M')}-{slug[:30]}"


def infer_venue_city(location: str) -> str:
    """Infer city from LibCal LOCATION field."""
    loc_lower = location.lower()
    if "truckee" in loc_lower:
        return "Truckee"
    if "madelyn helling" in loc_lower or "nevada city" in loc_lower:
        return "Nevada City"
    if "grass valley" in loc_lower:
        return "Grass Valley"
    if "penn valley" in loc_lower:
        return "Penn Valley"
    if "bear river" in loc_lower:
        return "Grass Valley"
    # Default: Nevada County Library HQ is in Nevada City
    return "Nevada City"


def infer_venue_name(location: str) -> str:
    """Extract venue name from LOCATION, falling back to library name."""
    if not location or not location.strip():
        return "Nevada County Library"
    # Use the first part before comma (usually the venue name)
    parts = location.split(",")
    name = clean_space(parts[0])
    return name if name else "Nevada County Library"


def ensure_aware(dt: datetime | date, tz: ZoneInfo) -> datetime:
    """Convert date or naive datetime to timezone-aware datetime."""
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            return dt.replace(tzinfo=tz)
        return dt.astimezone(tz)
    # date-only (all-day event)
    return datetime.combine(dt, datetime.min.time(), tzinfo=tz)


def parse_ical_events(
    ical_bytes: bytes,
    tz_name: str,
    source_ref: str,
    window_days: int,
) -> tuple[list[dict[str, Any]], int]:
    """Parse iCal feed and return (events, recurring_expanded_count)."""
    tz = ZoneInfo(tz_name)
    now = datetime.now(tz)
    window_start = now
    window_end = now + timedelta(days=window_days)

    cal = Calendar.from_ical(ical_bytes)

    # Use recurring_ical_events to expand RRULEs within the window
    expanded = recurring_ical_events.of(cal).between(
        window_start, window_end
    )

    # Count how many base VEVENTs have RRULE (for reporting)
    base_recurring = 0
    for component in cal.walk("VEVENT"):
        if component.get("RRULE"):
            base_recurring += 1

    events: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for component in expanded:
        # Extract core fields
        summary_prop = component.get("summary")
        summary = str(summary_prop) if summary_prop else ""
        summary = clean_space(summary)
        if not summary:
            continue

        uid_prop = component.get("uid")
        uid = str(uid_prop) if uid_prop else ""

        location_prop = component.get("location")
        location = str(location_prop) if location_prop else ""
        location = clean_space(location)

        description_prop = component.get("description")
        description = str(description_prop) if description_prop else ""
        description = clean_space(description)

        dtstart_prop = component.get("dtstart")
        if not dtstart_prop:
            continue
        dtstart = dtstart_prop.dt if hasattr(dtstart_prop, "dt") else dtstart_prop

        dtend_prop = component.get("dtend")
        if dtend_prop:
            dtend = dtend_prop.dt if hasattr(dtend_prop, "dt") else dtend_prop
        else:
            # Default to 2-hour duration if no end time
            if isinstance(dtstart, date) and not isinstance(dtstart, datetime):
                dtend = dtstart + timedelta(days=1)
            else:
                dtend = dtstart + timedelta(hours=2)

        # Ensure timezone-aware datetimes
        start_dt = ensure_aware(dtstart, tz)
        end_dt = ensure_aware(dtend, tz)

        # Window filter (recurring_ical_events should handle this, but verify)
        if start_dt < now or start_dt > window_end:
            continue

        # Generate unique event_id
        event_id = make_event_id(uid, start_dt, summary)
        # Handle duplicates (same UID + same date can happen with edge cases)
        if event_id in seen_ids:
            counter = 2
            while f"{event_id}-{counter}" in seen_ids:
                counter += 1
            event_id = f"{event_id}-{counter}"
        seen_ids.add(event_id)

        venue_name = infer_venue_name(location)
        venue_city = infer_venue_city(location)

        event: dict[str, Any] = {
            "event_id": event_id,
            "title": summary,
            "start_iso": start_dt.isoformat(timespec="seconds"),
            "end_iso": end_dt.isoformat(timespec="seconds"),
            "timezone": tz_name,
            "venue_name": venue_name,
            "venue_city": venue_city,
            "source_type": "ical",
            "source_ref": source_ref,
            "source_label": "Nevada County Library",
            "is_family": False,
            "last_verified_at": now.isoformat(timespec="seconds"),
        }
        if description:
            event["description"] = description[:500]
        if location:
            event["venue_address"] = location

        events.append(event)

    events.sort(key=lambda e: (e["start_iso"], e["event_id"]))
    return events, base_recurring


def main() -> int:
    args = parse_args()

    # Fetch iCal feed
    try:
        response = requests.get(args.ical_url, timeout=args.timeout_seconds)
        response.raise_for_status()
    except requests.RequestException as exc:
        fail(f"Failed to fetch iCal feed: {exc}")

    events, recurring_count = parse_ical_events(
        ical_bytes=response.content,
        tz_name=args.timezone,
        source_ref=args.ical_url,
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
        f"Fetched {len(events)} events from LibCal ({recurring_count} recurring expanded)",
        file=sys.stderr,
    )
    print(f"[OK] LibCal iCal ingested", file=sys.stderr)
    print(f"  ical_url={args.ical_url}", file=sys.stderr)
    print(f"  output={args.output_file}", file=sys.stderr)
    print(f"  total={len(events)}", file=sys.stderr)
    if events:
        print(f"  first={events[0]['start_iso']} :: {events[0]['title']}", file=sys.stderr)
        print(f"  last={events[-1]['start_iso']} :: {events[-1]['title']}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
