#!/usr/bin/env python3
"""
Validate curated events data for the cultural map demo.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


DEFAULT_EVENTS_FILE = Path("website/cultural-map-redesign/events.json")
REQUIRED_FIELDS = (
    "event_id",
    "title",
    "start_iso",
    "end_iso",
    "timezone",
    "venue_name",
    "source_type",
)
ALLOWED_SOURCE_TYPES = {"curated", "feed"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate events.json schema and ISO timestamps.")
    parser.add_argument(
        "--events-file",
        type=Path,
        default=DEFAULT_EVENTS_FILE,
        help=f"Path to events JSON file (default: {DEFAULT_EVENTS_FILE})",
    )
    return parser.parse_args()


def fail(message: str) -> None:
    print(f"[X] {message}")
    sys.exit(1)


def parse_iso_datetime(value: str) -> datetime:
    text = value.strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError as exc:
        raise ValueError(f"Invalid ISO datetime: {value}") from exc
    if parsed.tzinfo is None:
        raise ValueError(f"Timezone offset required in datetime: {value}")
    return parsed


def main() -> int:
    args = parse_args()

    if not args.events_file.exists():
        fail(f"Events file not found: {args.events_file}")

    try:
        events = json.loads(args.events_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {args.events_file}: {exc}")

    if not isinstance(events, list):
        fail("Top-level JSON must be an array of events")

    seen_ids: set[str] = set()
    now_utc = datetime.now(timezone.utc)
    window_end = now_utc + timedelta(days=14)
    upcoming_14d = 0
    weekend_events = 0

    for idx, event in enumerate(events):
        if not isinstance(event, dict):
            fail(f"Event at index {idx} is not an object")

        missing = [field for field in REQUIRED_FIELDS if field not in event]
        if missing:
            fail(f"Event at index {idx} missing required fields: {', '.join(missing)}")

        for field in REQUIRED_FIELDS:
            if not isinstance(event[field], str) or not event[field].strip():
                fail(f"Event at index {idx} has empty/non-string required field: {field}")

        event_id = event["event_id"]
        if event_id in seen_ids:
            fail(f"Duplicate event_id detected: {event_id}")
        seen_ids.add(event_id)

        if event["source_type"] not in ALLOWED_SOURCE_TYPES:
            fail(
                f"Invalid source_type for {event_id}: {event['source_type']} "
                f"(expected one of {sorted(ALLOWED_SOURCE_TYPES)})"
            )

        try:
            start_dt = parse_iso_datetime(event["start_iso"])
            end_dt = parse_iso_datetime(event["end_iso"])
        except ValueError as exc:
            fail(f"{event_id}: {exc}")

        if end_dt <= start_dt:
            fail(f"{event_id}: end_iso must be after start_iso")

        tags = event.get("tags")
        if tags is not None:
            if not isinstance(tags, list) or not all(isinstance(tag, str) for tag in tags):
                fail(f"{event_id}: tags must be an array of strings when present")

        for optional_text_field in ("description", "image_url", "ticket_url", "venue_city"):
            value = event.get(optional_text_field)
            if value is not None and (not isinstance(value, str) or not value.strip()):
                fail(f"{event_id}: {optional_text_field} must be a non-empty string when present")

        if start_dt >= now_utc and start_dt <= window_end:
            upcoming_14d += 1
        if start_dt.weekday() in (5, 6):
            weekend_events += 1

    print("[OK] Events validation passed")
    print(f"  total={len(events)}")
    print(f"  upcoming_14d={upcoming_14d}")
    print(f"  weekend_events={weekend_events}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
