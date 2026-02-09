#!/usr/bin/env python3
"""
Build a deterministic event index with venue-to-asset matching.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


DEFAULT_EVENTS_FILE = Path("website/cultural-map-redesign/events.json")
DEFAULT_DATA_FILE = Path("website/cultural-map-redesign/data.json")
DEFAULT_OUTPUT_FILE = Path("website/cultural-map-redesign/events.index.json")
DEFAULT_ALIAS_FILE = Path("scripts/events/venue_aliases.json")
DEFAULT_REPORT_FILE = Path("scripts/events/reports/events-match-report.json")

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

ALL_CATEGORIES = tuple(CATEGORY_PRIORITY.keys())

VENUE_STOP_WORDS = {
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
    parser.add_argument(
        "--aliases-file",
        type=Path,
        default=DEFAULT_ALIAS_FILE,
        help=f"Path to venue alias JSON file (default: {DEFAULT_ALIAS_FILE})",
    )
    parser.add_argument(
        "--report-file",
        type=Path,
        default=DEFAULT_REPORT_FILE,
        help=f"Path to matcher report JSON file (default: {DEFAULT_REPORT_FILE})",
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


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", str(value).strip())


def make_name_city_key(name: str | None, city: str | None) -> str:
    return f"{normalize_token(name)}|{normalize_token(city)}"


def tokenize_venue_name(value: str | None) -> list[str]:
    tokens = re.split(r"[^a-z0-9]+", str(value or "").lower().replace("&", " and "))
    result: list[str] = []
    for token in tokens:
        token = token.strip()
        if len(token) < 3:
            continue
        if token in VENUE_STOP_WORDS:
            continue
        result.append(token)
    return result


def score_token_overlap(event_tokens: list[str], asset_tokens: list[str]) -> int:
    if not event_tokens or not asset_tokens:
        return 0
    asset_set = set(asset_tokens)
    overlap = 0
    longest = 0
    for token in event_tokens:
        if token in asset_set:
            overlap += 1
            longest = max(longest, len(token))
    if overlap >= 2:
        return overlap * 10 + longest
    if overlap == 1 and longest >= 4:
        return overlap * 10 + longest
    return 0


def infer_event_categories(event: dict[str, Any]) -> list[str]:
    categories: list[str] = []
    seen: set[str] = set()

    existing = event.get("event_category")
    if isinstance(existing, str) and existing in CATEGORY_PRIORITY:
        categories.append(existing)
        seen.add(existing)

    tags = event.get("tags")
    tags_text = " ".join(tag for tag in tags if isinstance(tag, str)) if isinstance(tags, list) else ""
    title_text = normalize_text(event.get("title"))
    description_text = normalize_text(event.get("description"))
    venue_text = normalize_text(event.get("venue_name"))
    text = f"{tags_text} {event.get('event_category', '')} {title_text} {description_text} {venue_text}".lower().strip()
    if not text:
        return categories

    checks = [
        (r"(^|[^a-z])(fair|festival|gala|wild\s*&\s*scenic|wsff)([^a-z]|$)", "Fairs & Festivals"),
        (r"(^|[^a-z])(music|concert|dance|theatre|theater|film|comedy|improv|spoken word|poetry)([^a-z]|$)", "Performance Spaces"),
        (r"(^|[^a-z])(art|gallery|museum|visual|craft)([^a-z]|$)", "Galleries & Museums"),
        (r"(^|[^a-z])(beer|wine|food|culinary)([^a-z]|$)", "Eat, Drink & Stay"),
        (r"(^|[^a-z])(outdoors|recreation|trail|walk|hike)([^a-z]|$)", "Walks & Trails"),
        (r"(^|[^a-z])(history|heritage|culture)([^a-z]|$)", "Preservation & Culture"),
        (r"(^|[^a-z])(organization|facilit)([^a-z]|$)", "Arts Organizations"),
    ]
    for pattern, category in checks:
        if category in seen:
            continue
        if re.search(pattern, text):
            categories.append(category)
            seen.add(category)

    return categories


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


def build_lookup_tables(venues: list[dict[str, Any]]) -> tuple[dict[str, list[int]], dict[str, list[int]], dict[str, list[int]]]:
    by_pid: dict[str, list[int]] = {}
    by_name_city: dict[str, list[int]] = {}
    by_city: dict[str, list[int]] = {}

    for idx, venue in enumerate(venues):
        pid = venue.get("pid")
        if isinstance(pid, str) and pid:
            by_pid.setdefault(pid, []).append(idx)

        key = make_name_city_key(venue.get("n"), venue.get("c"))
        if key != "|":
            by_name_city.setdefault(key, []).append(idx)

        city_key = normalize_token(venue.get("c"))
        if city_key:
            by_city.setdefault(city_key, []).append(idx)

    return by_pid, by_name_city, by_city


def load_alias_lookup(
    path: Path,
    venues: list[dict[str, Any]],
    by_pid: dict[str, list[int]],
    by_name_city: dict[str, list[int]],
) -> tuple[dict[str, list[int]], list[str]]:
    warnings: list[str] = []
    if not path.exists():
        return {}, [f"Alias file not found, continuing without aliases: {path}"]

    payload = load_json(path)
    if not isinstance(payload, dict):
        return {}, [f"Alias file must be an object: {path}"]
    aliases = payload.get("aliases")
    if not isinstance(aliases, list):
        return {}, [f"Alias file missing aliases list: {path}"]

    resolved: dict[str, list[int]] = {}
    for idx, alias in enumerate(aliases):
        if not isinstance(alias, dict):
            warnings.append(f"aliases[{idx}] ignored: expected object")
            continue
        venue_name = normalize_text(alias.get("venue_name"))
        if not venue_name:
            warnings.append(f"aliases[{idx}] ignored: missing venue_name")
            continue
        venue_city = normalize_text(alias.get("venue_city"))
        alias_key = make_name_city_key(venue_name, venue_city)

        target_indices: list[int] = []
        asset_idx = alias.get("asset_idx")
        if isinstance(asset_idx, int) and 0 <= asset_idx < len(venues):
            target_indices = [asset_idx]
        else:
            target_pid = alias.get("asset_pid")
            if isinstance(target_pid, str) and target_pid in by_pid:
                target_indices = by_pid[target_pid]
            else:
                target_name = normalize_text(alias.get("asset_name"))
                target_city = normalize_text(alias.get("asset_city"))
                if target_name:
                    key = make_name_city_key(target_name, target_city)
                    if key in by_name_city:
                        target_indices = by_name_city[key]

        if not target_indices:
            warnings.append(f"aliases[{idx}] unresolved target for '{venue_name}' ({venue_city or 'any city'})")
            continue
        resolved[alias_key] = target_indices
        if venue_city:
            resolved[make_name_city_key(venue_name, "")] = target_indices

    return resolved, warnings


def rank_asset_candidates(
    *,
    event_venue_name: str | None,
    event_venue_city: str | None,
    venues: list[dict[str, Any]],
    by_city: dict[str, list[int]],
    asset_tokens_by_idx: list[list[str]],
    max_results: int = 3,
) -> list[dict[str, Any]]:
    city_key = normalize_token(event_venue_city)
    candidates = by_city.get(city_key, []) if city_key else list(range(len(venues)))
    event_tokens = tokenize_venue_name(event_venue_name)
    scored: list[tuple[int, int]] = []
    for idx in candidates:
        score = score_token_overlap(event_tokens, asset_tokens_by_idx[idx])
        if score <= 0:
            continue
        scored.append((score, idx))
    scored.sort(key=lambda item: (-item[0], CATEGORY_PRIORITY.get(venues[item[1]].get("l", ""), 50), item[1]))
    result: list[dict[str, Any]] = []
    for score, idx in scored[:max_results]:
        venue = venues[idx]
        result.append(
            {
                "asset_idx": idx,
                "asset_name": venue.get("n"),
                "asset_city": venue.get("c"),
                "asset_category": venue.get("l"),
                "score": score,
            }
        )
    return result


def derive_event_categories(
    event: dict[str, Any],
    matched_category: str | None,
    allowed_categories: set[str],
) -> tuple[str, list[str]]:
    categories = infer_event_categories(event)
    if (
        matched_category
        and matched_category in CATEGORY_PRIORITY
        and matched_category in allowed_categories
        and matched_category not in categories
    ):
        categories.insert(0, matched_category)

    categories = [name for name in categories if name in allowed_categories]
    if not categories:
        fallback = "Cultural Resources" if "Cultural Resources" in allowed_categories else None
        if fallback is None:
            ordered_allowed = sorted(allowed_categories, key=lambda name: CATEGORY_PRIORITY.get(name, 99))
            fallback = ordered_allowed[0] if ordered_allowed else None
        if fallback is None:
            fail("No allowed categories available to classify events")
        categories = [fallback]

    ordered = sorted(set(categories), key=lambda name: CATEGORY_PRIORITY.get(name, 99))
    primary = ordered[0]
    return primary, ordered


def main() -> int:
    args = parse_args()
    events = load_json(args.events_file)
    venues = load_json(args.data_file)

    if not isinstance(events, list):
        fail("events file must be a JSON array")
    if not isinstance(venues, list):
        fail("data file must be a JSON array")
    allowed_categories = {
        venue.get("l")
        for venue in venues
        if isinstance(venue, dict) and isinstance(venue.get("l"), str) and venue.get("l")
    }
    if not allowed_categories:
        fail("No categories found in venue data")

    by_pid, by_name_city, by_city = build_lookup_tables(venues)
    alias_lookup, alias_warnings = load_alias_lookup(
        args.aliases_file,
        venues,
        by_pid,
        by_name_city,
    )
    for warning in alias_warnings:
        print(f"[!] {warning}")

    asset_tokens_by_idx = [tokenize_venue_name(venue.get("n")) for venue in venues]

    now_utc = datetime.now(timezone.utc)
    window_end = now_utc + timedelta(days=14)

    stats = {
        "total_events": 0,
        "matched_events": 0,
        "unmatched_events": 0,
        "matched_by_pid": 0,
        "matched_by_alias": 0,
        "matched_by_name_city": 0,
        "matched_by_name_city_fuzzy": 0,
        "upcoming_14d": 0,
    }

    indexed_events: list[dict[str, Any]] = []
    by_asset_idx: dict[str, list[str]] = {}
    unmatched_venue_counter: Counter[str] = Counter()
    unmatched_examples: dict[str, dict[str, Any]] = {}

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
            venue_name = normalize_text(event.get("venue_name"))
            venue_city = normalize_text(event.get("venue_city"))
            key = make_name_city_key(venue_name, venue_city)

            alias_key_with_city = key
            alias_key_name_only = make_name_city_key(venue_name, "")
            if alias_key_with_city in alias_lookup:
                matched_idx = choose_best_asset(alias_lookup[alias_key_with_city], venues)
                match_method = "alias"
                match_confidence = "high"
                stats["matched_by_alias"] += 1
            elif alias_key_name_only in alias_lookup:
                matched_idx = choose_best_asset(alias_lookup[alias_key_name_only], venues)
                match_method = "alias"
                match_confidence = "high"
                stats["matched_by_alias"] += 1
            elif key in by_name_city:
                matched_idx = choose_best_asset(by_name_city[key], venues)
                match_method = "name_city"
                match_confidence = "medium"
                stats["matched_by_name_city"] += 1
            else:
                city_key = normalize_token(venue_city)
                event_tokens = tokenize_venue_name(venue_name)
                best_score = 0
                best_indices: list[int] = []
                for idx in by_city.get(city_key, []):
                    score = score_token_overlap(event_tokens, asset_tokens_by_idx[idx])
                    if score <= 0:
                        continue
                    if score > best_score:
                        best_score = score
                        best_indices = [idx]
                    elif score == best_score:
                        best_indices.append(idx)
                if best_indices:
                    matched_idx = choose_best_asset(best_indices, venues)
                    match_method = "name_city_fuzzy"
                    match_confidence = "low"
                    stats["matched_by_name_city_fuzzy"] += 1

        if matched_idx is not None:
            stats["matched_events"] += 1
            by_asset_idx.setdefault(str(matched_idx), []).append(event_id)
        else:
            stats["unmatched_events"] += 1
            unmatched_key = make_name_city_key(event.get("venue_name"), event.get("venue_city"))
            unmatched_venue_counter[unmatched_key] += 1
            if unmatched_key not in unmatched_examples:
                unmatched_examples[unmatched_key] = {
                    "venue_name": normalize_text(event.get("venue_name")) or "Unknown venue",
                    "venue_city": normalize_text(event.get("venue_city")) or "",
                    "sample_event_id": event_id,
                    "sample_title": normalize_text(event.get("title")) or "Untitled event",
                }

        indexed = dict(event)
        matched_category = venues[matched_idx].get("l") if matched_idx is not None else None
        primary_category, event_categories = derive_event_categories(indexed, matched_category, allowed_categories)
        indexed["matched_asset_idx"] = matched_idx
        indexed["match_method"] = match_method
        indexed["match_confidence"] = match_confidence
        indexed["match_status"] = "mapped" if matched_idx is not None else "needs_mapping"
        indexed["is_unmatched"] = matched_idx is None
        indexed["event_category"] = primary_category
        indexed["event_categories"] = event_categories
        indexed_events.append(indexed)

    # Keep each asset list deterministic by event sort order
    for key, event_ids in by_asset_idx.items():
        by_asset_idx[key] = sorted(event_ids)

    unmatched_venues: list[dict[str, Any]] = []
    for venue_key, count in unmatched_venue_counter.most_common():
        example = unmatched_examples[venue_key]
        unmatched_venues.append(
            {
                "venue_key": venue_key,
                "venue_name": example["venue_name"],
                "venue_city": example["venue_city"],
                "count": count,
                "sample_event_id": example["sample_event_id"],
                "sample_title": example["sample_title"],
                "candidate_assets": rank_asset_candidates(
                    event_venue_name=example["venue_name"],
                    event_venue_city=example["venue_city"],
                    venues=venues,
                    by_city=by_city,
                    asset_tokens_by_idx=asset_tokens_by_idx,
                ),
            }
        )

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_events_file": str(args.events_file).replace("\\", "/"),
        "source_data_file": str(args.data_file).replace("\\", "/"),
        "source_aliases_file": str(args.aliases_file).replace("\\", "/"),
        "window_days": 14,
        "stats": stats,
        "by_asset_idx": by_asset_idx,
        "events": indexed_events,
    }
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_events_file": str(args.events_file).replace("\\", "/"),
        "source_data_file": str(args.data_file).replace("\\", "/"),
        "source_aliases_file": str(args.aliases_file).replace("\\", "/"),
        "stats": stats,
        "unmatched_venues": unmatched_venues,
        "category_coverage": {
            "allowed_categories": sorted(
                list(allowed_categories),
                key=lambda name: CATEGORY_PRIORITY.get(name, 99),
            ),
            "categories_seen": sorted(
                {
                    event.get("event_category")
                    for event in indexed_events
                    if isinstance(event.get("event_category"), str) and event.get("event_category")
                },
                key=lambda name: CATEGORY_PRIORITY.get(name, 99),
            ),
            "events_with_disallowed_categories": [
                event.get("event_id")
                for event in indexed_events
                if any(
                    isinstance(cat, str) and cat not in allowed_categories
                    for cat in (event.get("event_categories") or [])
                )
            ],
            "all_categories": list(ALL_CATEGORIES),
        },
    }

    args.output_file.parent.mkdir(parents=True, exist_ok=True)
    args.output_file.write_text(
        json.dumps(output, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    args.report_file.parent.mkdir(parents=True, exist_ok=True)
    args.report_file.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("[OK] Event index built")
    print(f"  output={args.output_file}")
    print(f"  report={args.report_file}")
    print(f"  total={stats['total_events']}")
    print(f"  matched={stats['matched_events']}")
    print(f"  unmatched={stats['unmatched_events']}")
    print(f"  matched_by_pid={stats['matched_by_pid']}")
    print(f"  matched_by_alias={stats['matched_by_alias']}")
    print(f"  matched_by_name_city={stats['matched_by_name_city']}")
    print(f"  matched_by_name_city_fuzzy={stats['matched_by_name_city_fuzzy']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
