#!/usr/bin/env python3
"""
Audit coverage gaps between asset data and upcoming events index.

This is a non-blocking diagnostic script intended to surface:
1) Upcoming events that are not mapped to any asset.
2) Event categories that are not present in asset category dropdown set.
3) Event-like festival assets that appear stale (historic year text only).
4) Stale festival assets that have no likely upcoming event counterpart.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


DEFAULT_DATA_FILE = Path("website/cultural-map-redesign/data.json")
DEFAULT_INDEX_FILE = Path("website/cultural-map-redesign/events.index.json")
DEFAULT_OUTPUT_FILE = Path("scripts/events/reports/events-coverage-audit.json")

TOKEN_STOP_WORDS = {
    "the",
    "and",
    "for",
    "with",
    "from",
    "into",
    "onto",
    "near",
    "inside",
    "outside",
    "at",
    "in",
    "on",
    "of",
    "to",
    "by",
    "via",
    "city",
    "county",
    "downtown",
    "street",
    "st",
    "road",
    "rd",
    "avenue",
    "ave",
    "blvd",
    "boulevard",
    "way",
    "wy",
    "drive",
    "dr",
    "center",
    "centre",
    "hall",
    "plaza",
    "park",
    "building",
    "festival",
    "festivals",
    "fair",
    "fairs",
    "parade",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit event/asset coverage quality.")
    parser.add_argument("--data-file", type=Path, default=DEFAULT_DATA_FILE)
    parser.add_argument("--index-file", type=Path, default=DEFAULT_INDEX_FILE)
    parser.add_argument("--output-file", type=Path, default=DEFAULT_OUTPUT_FILE)
    parser.add_argument("--window-days", type=int, default=14)
    parser.add_argument("--max-examples", type=int, default=40)
    return parser.parse_args()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_iso_datetime(value: str) -> datetime:
    text = value.strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    dt = datetime.fromisoformat(text)
    if dt.tzinfo is None:
        raise ValueError(f"Timezone required: {value}")
    return dt.astimezone(timezone.utc)


def normalize_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def normalize_token(value: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())


def tokenize(value: str | None) -> set[str]:
    parts = re.split(r"[^a-z0-9]+", str(value or "").lower().replace("&", " and "))
    return {
        part
        for part in parts
        if len(part) >= 4 and part not in TOKEN_STOP_WORDS
    }


def extract_years(text: str) -> list[int]:
    years = [int(y) for y in re.findall(r"\b(19\d{2}|20\d{2})\b", text)]
    return sorted(set(years))


def has_probable_upcoming_counterpart(asset: dict[str, Any], upcoming_events: list[dict[str, Any]]) -> bool:
    asset_name_tokens = tokenize(asset.get("n"))
    if not asset_name_tokens:
        return False

    asset_city = normalize_token(asset.get("c"))
    for event in upcoming_events:
        event_city = normalize_token(event.get("venue_city"))
        if asset_city and event_city and asset_city != event_city:
            continue

        title_tokens = tokenize(event.get("title"))
        if len(asset_name_tokens.intersection(title_tokens)) >= 1:
            return True

        desc_tokens = tokenize(event.get("description"))
        if len(asset_name_tokens.intersection(desc_tokens)) >= 2:
            return True
    return False


def main() -> int:
    args = parse_args()
    data = load_json(args.data_file)
    payload = load_json(args.index_file)
    events = payload.get("events", []) if isinstance(payload, dict) else []

    if not isinstance(data, list):
        raise SystemExit("data-file must be a JSON array")
    if not isinstance(events, list):
        raise SystemExit("index-file must contain events array")

    now = datetime.now(timezone.utc)
    window_end = now + timedelta(days=args.window_days)

    allowed_categories = sorted(
        {
            asset.get("l")
            for asset in data
            if isinstance(asset, dict) and isinstance(asset.get("l"), str) and asset.get("l")
        }
    )
    allowed_set = set(allowed_categories)

    upcoming_events: list[dict[str, Any]] = []
    upcoming_unmapped: list[dict[str, Any]] = []
    events_with_disallowed_categories: list[dict[str, Any]] = []

    for event in events:
        if not isinstance(event, dict):
            continue
        start_iso = event.get("start_iso")
        end_iso = event.get("end_iso")
        if not isinstance(start_iso, str) or not isinstance(end_iso, str):
            continue
        try:
            start_dt = parse_iso_datetime(start_iso)
            end_dt = parse_iso_datetime(end_iso)
        except Exception:
            continue

        if end_dt >= now and start_dt <= window_end:
            upcoming_events.append(event)
            if not isinstance(event.get("matched_asset_idx"), int):
                upcoming_unmapped.append(event)

        categories = []
        ec = event.get("event_category")
        if isinstance(ec, str) and ec:
            categories.append(ec)
        ecs = event.get("event_categories")
        if isinstance(ecs, list):
            categories.extend([c for c in ecs if isinstance(c, str) and c])
        if any(cat not in allowed_set for cat in categories):
            events_with_disallowed_categories.append(
                {
                    "event_id": event.get("event_id"),
                    "title": event.get("title"),
                    "categories": sorted(set(categories)),
                }
            )

    stale_festival_assets: list[dict[str, Any]] = []
    stale_festival_assets_without_upcoming_counterpart: list[dict[str, Any]] = []

    for asset in data:
        if not isinstance(asset, dict):
            continue
        if asset.get("l") != "Fairs & Festivals":
            continue
        text = f"{normalize_text(asset.get('n'))} {normalize_text(asset.get('d'))}"
        years = extract_years(text)
        if not years:
            continue
        latest_year = max(years)
        is_stale = latest_year < now.year
        if not is_stale:
            continue
        record = {
            "name": asset.get("n"),
            "city": asset.get("c"),
            "latest_year_in_text": latest_year,
            "years_found": years,
        }
        stale_festival_assets.append(record)
        if not has_probable_upcoming_counterpart(asset, upcoming_events):
            stale_festival_assets_without_upcoming_counterpart.append(record)

    report = {
        "generated_at": now.isoformat(),
        "window_days": args.window_days,
        "sources": {
            "data_file": str(args.data_file).replace("\\", "/"),
            "index_file": str(args.index_file).replace("\\", "/"),
        },
        "summary": {
            "allowed_categories_count": len(allowed_categories),
            "upcoming_events_count": len(upcoming_events),
            "upcoming_unmapped_count": len(upcoming_unmapped),
            "events_with_disallowed_categories_count": len(events_with_disallowed_categories),
            "stale_festival_assets_count": len(stale_festival_assets),
            "stale_festival_assets_without_upcoming_counterpart_count": len(
                stale_festival_assets_without_upcoming_counterpart
            ),
        },
        "allowed_categories": allowed_categories,
        "upcoming_unmapped_examples": [
            {
                "event_id": event.get("event_id"),
                "title": event.get("title"),
                "start_iso": event.get("start_iso"),
                "venue_name": event.get("venue_name"),
                "venue_city": event.get("venue_city"),
                "event_category": event.get("event_category"),
            }
            for event in upcoming_unmapped[: args.max_examples]
        ],
        "events_with_disallowed_categories": events_with_disallowed_categories[: args.max_examples],
        "stale_festival_assets": stale_festival_assets[: args.max_examples],
        "stale_festival_assets_without_upcoming_counterpart": (
            stale_festival_assets_without_upcoming_counterpart[: args.max_examples]
        ),
    }

    args.output_file.parent.mkdir(parents=True, exist_ok=True)
    args.output_file.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("[OK] Event coverage audit complete")
    print(f"  output={args.output_file}")
    print(f"  allowed_categories={len(allowed_categories)}")
    print(f"  upcoming_events={len(upcoming_events)}")
    print(f"  upcoming_unmapped={len(upcoming_unmapped)}")
    print(f"  disallowed_categories={len(events_with_disallowed_categories)}")
    print(f"  stale_festival_assets={len(stale_festival_assets)}")
    print(
        "  stale_festival_assets_without_upcoming_counterpart="
        f"{len(stale_festival_assets_without_upcoming_counterpart)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
