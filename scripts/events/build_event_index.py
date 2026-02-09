#!/usr/bin/env python3
"""
Build a deterministic event index with venue-to-asset matching.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


DEFAULT_EVENTS_FILE = Path("website/cultural-map-redesign/events.json")
DEFAULT_DATA_FILE = Path("website/cultural-map-redesign/data.json")
DEFAULT_OUTPUT_FILE = Path("website/cultural-map-redesign/events.index.json")

CATEGORY_PRIORITY = {
    "Performance Spaces": 0,
    "Arts Organizations": 1,
    "Fairs & Festivals": 2,
    "Galleries & Museums": 3,
    "Preservation & Culture": 4,
    "Historic Landmarks": 5,
    "Cultural Resources": 6,
    "Public Art": 7,
    "Eat, Drink & Stay": 8,
    "Walks & Trails": 9,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build events.index.json from events + venues.")
    parser.add_argument(
        "--events-file",
        type=Path,
        default=DEFAULT_EVENTS_FILE,
        help=f"Path to canonical events file (default: {DEFAULT_EVENTS_FILE})",
    )
    parser.add_argument(
        "--data-file",
        type=Path,
        default=DEFAULT_DATA_FILE,
        help=f"Path to venue data file (default: {DEFAULT_DATA_FILE})",
    )
    parser.add_argument(
        "--output-file",
        type=Path,
        default=DEFAULT_OUTPUT_FILE,
        help=f"Path to output index file (default: {DEFAULT_OUTPUT_FILE})",
    )
    return parser.parse_args()


def fail(message: str) -> None:
    print(f"[X] {message}")
    sys.exit(1)


def load_json(path: Path) -> Any:
    if not path.exists():
        fail(f"File not found: {path}")
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {path}: {exc}")


def normalize_token(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def make_name_city_key(name: str | None, city: str | None) -> str:
    return f"{normalize_token(name)}|{normalize_token(city)}"


def parse_iso_datetime(value: str) -> datetime:
    text = value.strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    parsed = datetime.fromisoformat(text)
    if parsed.tzinfo is None:
        raise ValueError(f"Timezone offset required in datetime: {value}")
    return parsed


def choose_best_asset(indices: list[int], venues: list[dict[str, Any]]) -> int:
    def sort_key(idx: int) -> tuple[int, int]:
        category = venues[idx].get("l", "")
        return CATEGORY_PRIORITY.get(category, 50), idx

    return sorted(indices, key=sort_key)[0]


def build_lookup_tables(venues: list[dict[str, Any]]) -> tuple[dict[str, list[int]], dict[str, list[int]]]:
    by_pid: dict[str, list[int]] = {}
    by_name_city: dict[str, list[int]] = {}

    for idx, venue in enumerate(venues):
        pid = venue.get("pid")
        if isinstance(pid, str) and pid:
            by_pid.setdefault(pid, []).append(idx)

        key = make_name_city_key(venue.get("n"), venue.get("c"))
        if key != "|":
            by_name_city.setdefault(key, []).append(idx)

    return by_pid, by_name_city


def main() -> int:
    args = parse_args()
    events = load_json(args.events_file)
    venues = load_json(args.data_file)

    if not isinstance(events, list):
        fail("events file must be a JSON array")
    if not isinstance(venues, list):
        fail("data file must be a JSON array")

    by_pid, by_name_city = build_lookup_tables(venues)
    now_utc = datetime.now(timezone.utc)
    window_end = now_utc + timedelta(days=14)

    stats = {
        "total_events": 0,
        "matched_events": 0,
        "unmatched_events": 0,
        "matched_by_pid": 0,
        "matched_by_name_city": 0,
        "upcoming_14d": 0,
    }

    indexed_events: list[dict[str, Any]] = []
    by_asset_idx: dict[str, list[str]] = {}

    for event in sorted(events, key=lambda item: (item.get("start_iso", ""), item.get("event_id", ""))):
        stats["total_events"] += 1

        event_id = event.get("event_id")
        if not isinstance(event_id, str) or not event_id:
            fail("All events must include non-empty event_id in canonical file")

        try:
            start_dt = parse_iso_datetime(str(event.get("start_iso", "")))
        except Exception as exc:  # noqa: BLE001
            fail(f"{event_id}: invalid start_iso ({exc})")

        if start_dt >= now_utc and start_dt <= window_end:
            stats["upcoming_14d"] += 1

        matched_idx: int | None = None
        match_method = "none"
        match_confidence = "none"

        venue_pid = event.get("venue_pid")
        if isinstance(venue_pid, str) and venue_pid in by_pid:
            matched_idx = choose_best_asset(by_pid[venue_pid], venues)
            match_method = "pid"
            match_confidence = "high"
            stats["matched_by_pid"] += 1
        else:
            key = make_name_city_key(
                str(event.get("venue_name", "")),
                str(event.get("venue_city", "")),
            )
            if key in by_name_city:
                matched_idx = choose_best_asset(by_name_city[key], venues)
                match_method = "name_city"
                match_confidence = "medium"
                stats["matched_by_name_city"] += 1

        if matched_idx is not None:
            stats["matched_events"] += 1
            by_asset_idx.setdefault(str(matched_idx), []).append(event_id)
        else:
            stats["unmatched_events"] += 1

        indexed = dict(event)
        indexed["matched_asset_idx"] = matched_idx
        indexed["match_method"] = match_method
        indexed["match_confidence"] = match_confidence
        indexed["is_unmatched"] = matched_idx is None
        indexed_events.append(indexed)

    # Keep each asset list deterministic by event sort order
    for key, event_ids in by_asset_idx.items():
        by_asset_idx[key] = sorted(event_ids)

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_events_file": str(args.events_file).replace("\\", "/"),
        "source_data_file": str(args.data_file).replace("\\", "/"),
        "window_days": 14,
        "stats": stats,
        "by_asset_idx": by_asset_idx,
        "events": indexed_events,
    }

    args.output_file.parent.mkdir(parents=True, exist_ok=True)
    args.output_file.write_text(
        json.dumps(output, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    print("[OK] Event index built")
    print(f"  output={args.output_file}")
    print(f"  total={stats['total_events']}")
    print(f"  matched={stats['matched_events']}")
    print(f"  unmatched={stats['unmatched_events']}")
    print(f"  matched_by_pid={stats['matched_by_pid']}")
    print(f"  matched_by_name_city={stats['matched_by_name_city']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
