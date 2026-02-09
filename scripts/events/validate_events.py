#!/usr/bin/env python3
"""
Validate curated events data for the cultural map demo.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


DEFAULT_EVENTS_FILE = Path("website/cultural-map-redesign/events.json")
DEFAULT_INDEX_FILE = Path("website/cultural-map-redesign/events.index.json")
DEFAULT_DATA_FILE = Path("website/cultural-map-redesign/data.json")
DEFAULT_REPORT_FILE = Path("scripts/events/reports/events-validation-report.json")
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
    parser.add_argument(
        "--index-file",
        type=Path,
        default=DEFAULT_INDEX_FILE,
        help=f"Path to events index JSON file (default: {DEFAULT_INDEX_FILE})",
    )
    parser.add_argument(
        "--data-file",
        type=Path,
        default=DEFAULT_DATA_FILE,
        help=f"Path to venue data file used for dropdown categories (default: {DEFAULT_DATA_FILE})",
    )
    parser.add_argument(
        "--report-file",
        type=Path,
        default=DEFAULT_REPORT_FILE,
        help=f"Path to validation report JSON file (default: {DEFAULT_REPORT_FILE})",
    )
    parser.add_argument(
        "--window-days",
        type=int,
        default=14,
        help="Upcoming window size for validation stats (default: 14)",
    )
    parser.add_argument(
        "--max-unmatched-ratio",
        type=float,
        default=0.75,
        help="Fail when unmatched / total exceeds this ratio (default: 0.75)",
    )
    parser.add_argument(
        "--max-upcoming-unmatched-ratio",
        type=float,
        default=0.85,
        help="Fail when unmatched_upcoming / upcoming exceeds this ratio (default: 0.85)",
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
    if not args.index_file.exists():
        fail(f"Index file not found: {args.index_file}")
    if not args.data_file.exists():
        fail(f"Data file not found: {args.data_file}")

    try:
        events = json.loads(args.events_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {args.events_file}: {exc}")
    try:
        index_payload = json.loads(args.index_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {args.index_file}: {exc}")
    try:
        venue_data = json.loads(args.data_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {args.data_file}: {exc}")

    if not isinstance(events, list):
        fail("Top-level JSON must be an array of events")
    if not isinstance(index_payload, dict):
        fail("Index file must be a JSON object")
    indexed_events = index_payload.get("events")
    if not isinstance(indexed_events, list):
        fail("Index file must include an events array")
    if not isinstance(venue_data, list):
        fail("Data file must be a JSON array")

    allowed_categories = {
        venue.get("l")
        for venue in venue_data
        if isinstance(venue, dict) and isinstance(venue.get("l"), str) and venue.get("l")
    }
    if not allowed_categories:
        fail("No categories found in venue data")

    indexed_by_id: dict[str, dict[str, Any]] = {}
    for event in indexed_events:
        if not isinstance(event, dict):
            continue
        event_id = event.get("event_id")
        if isinstance(event_id, str) and event_id:
            indexed_by_id[event_id] = event

    seen_ids: set[str] = set()
    now_utc = datetime.now(timezone.utc)
    window_end = now_utc + timedelta(days=args.window_days)
    upcoming_14d = 0
    weekend_events = 0
    mapped_total = 0
    unmatched_total = 0
    mapped_upcoming = 0
    unmatched_upcoming = 0
    uncategorized_ids: list[str] = []
    disallowed_category_ids: list[str] = []
    missing_index_ids: list[str] = []
    unmatched_venue_counter: Counter[tuple[str, str]] = Counter()

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
        if event_id not in indexed_by_id:
            missing_index_ids.append(event_id)
            continue

        try:
            start_dt = parse_iso_datetime(event["start_iso"])
            end_dt = parse_iso_datetime(event["end_iso"])
        except ValueError as exc:
            fail(f"{event_id}: {exc}")

        if end_dt <= start_dt:
            fail(f"{event_id}: end_iso must be after start_iso")

        indexed = indexed_by_id[event_id]
        match_status = indexed.get("match_status")
        is_unmatched = bool(indexed.get("is_unmatched"))
        matched_asset_idx = indexed.get("matched_asset_idx")
        if match_status == "mapped" or (isinstance(matched_asset_idx, int) and matched_asset_idx >= 0):
            mapped_total += 1
            is_mapped = True
        else:
            unmatched_total += 1
            is_mapped = False
            unmatched_venue_counter[(event.get("venue_name", "") or "", event.get("venue_city", "") or "")] += 1

        category = indexed.get("event_category")
        categories = indexed.get("event_categories")
        has_category = isinstance(category, str) and bool(category.strip())
        if not has_category and isinstance(categories, list):
            has_category = any(isinstance(cat, str) and cat.strip() for cat in categories)
        if not has_category:
            uncategorized_ids.append(event_id)
        else:
            primary_ok = isinstance(category, str) and category in allowed_categories
            secondary_ok = True
            if isinstance(categories, list):
                secondary_ok = all(
                    isinstance(cat, str) and cat in allowed_categories
                    for cat in categories
                    if isinstance(cat, str) and cat.strip()
                )
            if not primary_ok or not secondary_ok:
                disallowed_category_ids.append(event_id)

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
            if is_mapped:
                mapped_upcoming += 1
            else:
                unmatched_upcoming += 1
        if start_dt.weekday() in (5, 6):
            weekend_events += 1

    if missing_index_ids:
        fail(f"Missing index entries for {len(missing_index_ids)} events (sample: {', '.join(missing_index_ids[:6])})")
    if uncategorized_ids:
        fail(f"Missing event_category assignment for {len(uncategorized_ids)} events (sample: {', '.join(uncategorized_ids[:6])})")
    if disallowed_category_ids:
        fail(
            "Events contain categories not present in dropdown set: "
            f"{len(disallowed_category_ids)} (sample: {', '.join(disallowed_category_ids[:6])})"
        )

    total = len(events)
    unmatched_ratio = (unmatched_total / total) if total else 0.0
    upcoming_unmatched_ratio = (unmatched_upcoming / upcoming_14d) if upcoming_14d else 0.0
    if unmatched_ratio > args.max_unmatched_ratio:
        fail(
            f"Unmatched ratio too high: {unmatched_total}/{total} = {unmatched_ratio:.3f} "
            f"(max {args.max_unmatched_ratio:.3f})"
        )
    if upcoming_unmatched_ratio > args.max_upcoming_unmatched_ratio:
        fail(
            f"Upcoming unmatched ratio too high: {unmatched_upcoming}/{upcoming_14d} = {upcoming_unmatched_ratio:.3f} "
            f"(max {args.max_upcoming_unmatched_ratio:.3f})"
        )

    unmatched_venues = [
        {
            "venue_name": venue_name or "Unknown venue",
            "venue_city": venue_city,
            "count": count,
        }
        for (venue_name, venue_city), count in unmatched_venue_counter.most_common()
    ]
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "events_file": str(args.events_file).replace("\\", "/"),
        "index_file": str(args.index_file).replace("\\", "/"),
        "data_file": str(args.data_file).replace("\\", "/"),
        "window_days": args.window_days,
        "stats": {
            "total_events": total,
            "upcoming_events": upcoming_14d,
            "weekend_events": weekend_events,
            "mapped_total": mapped_total,
            "unmatched_total": unmatched_total,
            "mapped_upcoming": mapped_upcoming,
            "unmatched_upcoming": unmatched_upcoming,
            "unmatched_ratio": round(unmatched_ratio, 6),
            "upcoming_unmatched_ratio": round(upcoming_unmatched_ratio, 6),
            "allowed_categories_count": len(allowed_categories),
            "uncategorized_count": len(uncategorized_ids),
            "disallowed_category_count": len(disallowed_category_ids),
        },
        "thresholds": {
            "max_unmatched_ratio": args.max_unmatched_ratio,
            "max_upcoming_unmatched_ratio": args.max_upcoming_unmatched_ratio,
        },
        "unmatched_venues": unmatched_venues,
        "allowed_categories": sorted(allowed_categories),
    }
    args.report_file.parent.mkdir(parents=True, exist_ok=True)
    args.report_file.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("[OK] Events validation passed")
    print(f"  total={total}")
    print(f"  upcoming_14d={upcoming_14d}")
    print(f"  weekend_events={weekend_events}")
    print(f"  mapped={mapped_total}")
    print(f"  unmatched={unmatched_total}")
    print(f"  unmatched_ratio={unmatched_ratio:.3f}")
    print(f"  upcoming_unmatched_ratio={upcoming_unmatched_ratio:.3f}")
    print(f"  report={args.report_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
