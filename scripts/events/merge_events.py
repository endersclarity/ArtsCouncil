#!/usr/bin/env python3
"""
Merge, deduplicate, tag, and classify events from multiple sources.

Combines Trumba, LibCal, CivicEngage, KVMR, GVDA, Crazy Horse, Golden Era,
Bodhi Hive, and Community event feeds into a single deduplicated
events-merged.json with event type tagging and family-friendly classification.

Also outputs events-merged-flat.json (bare JSON array) for compatibility
with build_event_index.py which expects isinstance(events, list).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from rapidfuzz.fuzz import token_sort_ratio


DEFAULT_TRUMBA_FILE = Path("website/cultural-map-redesign/events.json")
DEFAULT_LIBCAL_FILE = Path("website/cultural-map-redesign/events-libcal.json")
DEFAULT_CIVICENGAGE_FILE = Path("website/cultural-map-redesign/events-civicengage.json")
DEFAULT_KVMR_FILE = Path("website/cultural-map-redesign/events-kvmr.json")
DEFAULT_GVDA_FILE = Path("website/cultural-map-redesign/events-gvda.json")
DEFAULT_CRAZYHORSE_FILE = Path("website/cultural-map-redesign-stitch-lab/events-crazyhorse.json")
DEFAULT_GOLDENERA_FILE = Path("website/cultural-map-redesign-stitch-lab/events-goldenera.json")
DEFAULT_BODHIHIVE_FILE = Path("website/cultural-map-redesign-stitch-lab/events-bodhihive.json")
DEFAULT_COMMUNITY_FILE = Path("website/cultural-map-redesign-stitch-lab/events-community.json")
DEFAULT_OUTPUT_FILE = Path("website/cultural-map-redesign/events-merged.json")
DEFAULT_FLAT_OUTPUT_FILE = Path("website/cultural-map-redesign/events-merged-flat.json")
DEFAULT_FAMILY_KEYWORDS = Path("scripts/events/family_keywords.json")
DEFAULT_EVENT_TAGS = Path("scripts/events/event_tags.json")
DEFAULT_DEDUP_THRESHOLD = 85
DEFAULT_VENUE_THRESHOLD = 70
DEFAULT_TZ = "America/Los_Angeles"

# Source priority for dedup: lower = preferred
SOURCE_PRIORITY = {
    "trumba": 0,
    "gvda": 1,
    "libcal": 2,
    "kvmr": 3,
    "crazyhorse": 4,
    "goldenera": 5,
    "bodhihive": 6,
    "community": 7,
    "civicengage": 8,
}

# Venue-specific dedup override: venue source wins for events at its own venue
VENUE_SOURCE_MAP = {
    "crazyhorse": "Crazy Horse Saloon",
    "goldenera": "Golden Era Lounge",
    "bodhihive": "Bodhi Hive",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Merge, deduplicate, and classify events from multiple sources."
    )
    parser.add_argument(
        "--trumba-file",
        type=Path,
        default=DEFAULT_TRUMBA_FILE,
        help=f"Trumba events file (default: {DEFAULT_TRUMBA_FILE})",
    )
    parser.add_argument(
        "--libcal-file",
        type=Path,
        default=DEFAULT_LIBCAL_FILE,
        help=f"LibCal events file (default: {DEFAULT_LIBCAL_FILE})",
    )
    parser.add_argument(
        "--civicengage-file",
        type=Path,
        default=DEFAULT_CIVICENGAGE_FILE,
        help=f"CivicEngage events file (default: {DEFAULT_CIVICENGAGE_FILE})",
    )
    parser.add_argument(
        "--kvmr-file",
        type=Path,
        default=DEFAULT_KVMR_FILE,
        help=f"KVMR events file (default: {DEFAULT_KVMR_FILE})",
    )
    parser.add_argument(
        "--gvda-file",
        type=Path,
        default=DEFAULT_GVDA_FILE,
        help=f"GVDA events file (default: {DEFAULT_GVDA_FILE})",
    )
    parser.add_argument(
        "--crazyhorse-file",
        type=Path,
        default=DEFAULT_CRAZYHORSE_FILE,
        help=f"Crazy Horse events file (default: {DEFAULT_CRAZYHORSE_FILE})",
    )
    parser.add_argument(
        "--goldenera-file",
        type=Path,
        default=DEFAULT_GOLDENERA_FILE,
        help=f"Golden Era events file (default: {DEFAULT_GOLDENERA_FILE})",
    )
    parser.add_argument(
        "--bodhihive-file",
        type=Path,
        default=DEFAULT_BODHIHIVE_FILE,
        help=f"Bodhi Hive events file (default: {DEFAULT_BODHIHIVE_FILE})",
    )
    parser.add_argument(
        "--community-file",
        type=Path,
        default=DEFAULT_COMMUNITY_FILE,
        help=f"Community events file (default: {DEFAULT_COMMUNITY_FILE})",
    )
    parser.add_argument(
        "--event-tags-file",
        type=Path,
        default=DEFAULT_EVENT_TAGS,
        help=f"Event tags config file (default: {DEFAULT_EVENT_TAGS})",
    )
    parser.add_argument(
        "--output-file",
        type=Path,
        default=DEFAULT_OUTPUT_FILE,
        help=f"Output merged events file (default: {DEFAULT_OUTPUT_FILE})",
    )
    parser.add_argument(
        "--flat-output-file",
        type=Path,
        default=DEFAULT_FLAT_OUTPUT_FILE,
        help=f"Output flat events file (default: {DEFAULT_FLAT_OUTPUT_FILE})",
    )
    parser.add_argument(
        "--family-keywords",
        type=Path,
        default=DEFAULT_FAMILY_KEYWORDS,
        help=f"Family keywords JSON file (default: {DEFAULT_FAMILY_KEYWORDS})",
    )
    parser.add_argument(
        "--dedup-threshold",
        type=int,
        default=DEFAULT_DEDUP_THRESHOLD,
        help=f"Title fuzzy match threshold (default: {DEFAULT_DEDUP_THRESHOLD})",
    )
    parser.add_argument(
        "--venue-threshold",
        type=int,
        default=DEFAULT_VENUE_THRESHOLD,
        help=f"Venue fuzzy match threshold (default: {DEFAULT_VENUE_THRESHOLD})",
    )
    return parser.parse_args()


def load_source_events(path: Path, source_name: str) -> list[dict[str, Any]]:
    """Load events from a source file. Handles both bare arrays and wrapped formats."""
    if not path.exists():
        print(f"[WARN] Source file not found, skipping: {path}", file=sys.stderr)
        return []
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        print(f"[WARN] Failed to parse {path}: {exc}", file=sys.stderr)
        return []

    # Trumba events.json is a bare array; LibCal/CivicEngage use {"events": [...]}
    if isinstance(raw, list):
        events = raw
    elif isinstance(raw, dict) and "events" in raw:
        events = raw["events"]
    else:
        print(f"[WARN] Unexpected format in {path}, skipping", file=sys.stderr)
        return []

    if not isinstance(events, list):
        print(f"[WARN] Events field is not a list in {path}, skipping", file=sys.stderr)
        return []

    return events


def get_source_type(event: dict[str, Any]) -> str:
    """Determine the source type of an event based on event_id prefix or source_type."""
    event_id = event.get("event_id", "")
    if event_id.startswith("trumba-"):
        return "trumba"
    if event_id.startswith("libcal-"):
        return "libcal"
    if event_id.startswith("civic-"):
        return "civicengage"
    if event_id.startswith("gvda-"):
        return "gvda"
    if event_id.startswith("kvmr-"):
        return "kvmr"
    if event_id.startswith("crazyhorse-"):
        return "crazyhorse"
    if event_id.startswith("goldenera-"):
        return "goldenera"
    if event_id.startswith("bodhihive-"):
        return "bodhihive"
    if event_id.startswith("community-"):
        return "community"
    # Fallback: check source_type field
    source_type = event.get("source_type", "")
    if source_type == "feed":
        return "trumba"
    if source_type == "json":
        return "gvda"
    if source_type == "ical":
        return "libcal"
    if source_type == "rss":
        return "civicengage"
    if source_type in ("crazyhorse", "goldenera", "bodhihive", "community"):
        return source_type
    return "unknown"


def normalize_title(title: str) -> str:
    """Normalize title for fuzzy comparison."""
    text = title.lower().strip()
    # Strip leading articles
    text = re.sub(r"^(the|a|an)\s+", "", text)
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text)
    # Strip punctuation
    text = re.sub(r"[^\w\s]", "", text)
    return text.strip()


def normalize_venue(venue: str) -> str:
    """Normalize venue name for fuzzy comparison."""
    text = venue.lower().strip()
    # Strip common suffixes
    text = re.sub(r"\b(theater|theatre|center|centre|hall)\b", "", text)
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text)
    # Strip punctuation
    text = re.sub(r"[^\w\s]", "", text)
    return text.strip()


def is_duplicate(
    event_a: dict[str, Any],
    event_b: dict[str, Any],
    dedup_threshold: int,
    venue_threshold: int,
) -> bool:
    """Check if two events are duplicates using title + venue fuzzy matching."""
    title_a = normalize_title(event_a.get("title", ""))
    title_b = normalize_title(event_b.get("title", ""))

    if not title_a or not title_b:
        return False

    title_score = token_sort_ratio(title_a, title_b)
    if title_score < dedup_threshold:
        return False

    # Check venue similarity
    venue_a = event_a.get("venue_name", "") or ""
    venue_b = event_b.get("venue_name", "") or ""

    # If either venue is empty/missing, treat as potential match on title alone
    if not venue_a.strip() or not venue_b.strip():
        return True

    norm_venue_a = normalize_venue(venue_a)
    norm_venue_b = normalize_venue(venue_b)

    if not norm_venue_a or not norm_venue_b:
        return True

    venue_score = token_sort_ratio(norm_venue_a, norm_venue_b)
    return venue_score >= venue_threshold


def deduplicate_events(
    events: list[dict[str, Any]],
    dedup_threshold: int,
    venue_threshold: int,
) -> tuple[list[dict[str, Any]], int, list[str]]:
    """
    Deduplicate events within same-date groups across different sources.
    Returns (deduped_events, removed_count, dedup_details).
    """
    # Group by date
    by_date: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for event in events:
        date_key = event.get("start_iso", "")[:10]
        if date_key:
            by_date[date_key].append(event)

    removed_count = 0
    dedup_details: list[str] = []
    kept_event_ids: set[str] = set()

    for date_key in sorted(by_date.keys()):
        date_events = by_date[date_key]

        # Mark events to remove (indices within date group)
        to_remove: set[int] = set()

        for i in range(len(date_events)):
            if i in to_remove:
                continue
            for j in range(i + 1, len(date_events)):
                if j in to_remove:
                    continue

                event_a = date_events[i]
                event_b = date_events[j]

                # Only dedup across different sources
                source_a = get_source_type(event_a)
                source_b = get_source_type(event_b)
                if source_a == source_b:
                    continue

                if is_duplicate(event_a, event_b, dedup_threshold, venue_threshold):
                    # Venue-specific override: if one source owns the venue, it wins
                    venue_a = normalize_venue(event_a.get("venue_name", "") or "")
                    venue_b = normalize_venue(event_b.get("venue_name", "") or "")
                    venue_override = False

                    for src_key, venue_name in VENUE_SOURCE_MAP.items():
                        norm_venue_map = normalize_venue(venue_name)
                        if source_a == src_key and norm_venue_map and venue_a and \
                                token_sort_ratio(venue_a, norm_venue_map) >= venue_threshold:
                            winner_idx, loser_idx = i, j
                            venue_override = True
                            break
                        if source_b == src_key and norm_venue_map and venue_b and \
                                token_sort_ratio(venue_b, norm_venue_map) >= venue_threshold:
                            winner_idx, loser_idx = j, i
                            venue_override = True
                            break

                    if not venue_override:
                        # Default: keep the higher-priority source
                        priority_a = SOURCE_PRIORITY.get(source_a, 99)
                        priority_b = SOURCE_PRIORITY.get(source_b, 99)

                        if priority_a <= priority_b:
                            winner_idx, loser_idx = i, j
                        else:
                            winner_idx, loser_idx = j, i

                    winner = date_events[winner_idx]
                    loser = date_events[loser_idx]

                    # Merge source_labels onto winner
                    winner_labels = winner.get("source_labels", [])
                    if not winner_labels:
                        # Initialize with winner's own label
                        own_label = winner.get("source_label", "")
                        winner_labels = [own_label] if own_label else []
                    loser_label = loser.get("source_label", "")
                    if loser_label and loser_label not in winner_labels:
                        winner_labels.append(loser_label)
                    winner["source_labels"] = winner_labels

                    to_remove.add(loser_idx)
                    detail = (
                        f"  Dedup [{date_key}]: kept '{winner.get('title', '')}' "
                        f"({get_source_type(winner)}), "
                        f"removed '{loser.get('title', '')}' "
                        f"({get_source_type(loser)}), "
                        f"venue: '{loser.get('venue_name', '')}'"
                    )
                    dedup_details.append(detail)
                    removed_count += 1

        # Collect kept events
        for idx, event in enumerate(date_events):
            if idx not in to_remove:
                kept_event_ids.add(event.get("event_id", ""))

    # Build final list preserving original order
    deduped = [e for e in events if e.get("event_id", "") in kept_event_ids]
    return deduped, removed_count, dedup_details


def load_family_keywords(path: Path) -> tuple[list[re.Pattern], list[re.Pattern]]:
    """Load family keyword patterns from JSON config."""
    if not path.exists():
        print(f"[WARN] Family keywords file not found: {path}", file=sys.stderr)
        return [], []

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        print(f"[WARN] Failed to parse family keywords: {exc}", file=sys.stderr)
        return [], []

    positive = []
    for pattern_str in data.get("positive_patterns", []):
        try:
            positive.append(re.compile(pattern_str, re.IGNORECASE))
        except re.error as exc:
            print(f"[WARN] Invalid positive pattern '{pattern_str}': {exc}", file=sys.stderr)

    negative = []
    for pattern_str in data.get("negative_patterns", []):
        try:
            negative.append(re.compile(pattern_str, re.IGNORECASE))
        except re.error as exc:
            print(f"[WARN] Invalid negative pattern '{pattern_str}': {exc}", file=sys.stderr)

    return positive, negative


def classify_family(
    event: dict[str, Any],
    positive_patterns: list[re.Pattern],
    negative_patterns: list[re.Pattern],
) -> bool:
    """Classify whether an event is family-friendly."""
    # Concatenate searchable text
    parts = [
        event.get("title", ""),
        event.get("description", ""),
    ]
    tags = event.get("tags", [])
    if isinstance(tags, list):
        parts.extend(str(t) for t in tags)
    search_text = " ".join(parts).lower()

    if not search_text.strip():
        return False

    # Check negative patterns first
    for pattern in negative_patterns:
        if pattern.search(search_text):
            return False

    # Check positive patterns
    for pattern in positive_patterns:
        if pattern.search(search_text):
            return True

    return False


def load_event_tags(path: Path) -> dict[str, Any]:
    """Load event tag definitions from JSON config."""
    if not path.exists():
        print(f"[WARN] Event tags file not found: {path}", file=sys.stderr)
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data.get("tags", {})
    except (json.JSONDecodeError, OSError) as exc:
        print(f"[WARN] Failed to parse event tags: {exc}", file=sys.stderr)
        return {}


def apply_event_tags(
    events: list[dict[str, Any]], tag_config: dict[str, Any]
) -> int:
    """
    Apply event type tags to all events based on keyword patterns and source defaults.

    Returns the count of events that received at least one tag.
    """
    if not tag_config:
        for event in events:
            event.setdefault("event_tags", [])
        return 0

    # Pre-compile patterns for each tag
    compiled_tags: dict[str, dict[str, Any]] = {}
    for slug, cfg in tag_config.items():
        pos = []
        for p in cfg.get("positive_patterns", []):
            try:
                pos.append(re.compile(p, re.IGNORECASE))
            except re.error:
                pass
        neg = []
        for p in cfg.get("negative_patterns", []):
            try:
                neg.append(re.compile(p, re.IGNORECASE))
            except re.error:
                pass
        compiled_tags[slug] = {
            "positive": pos,
            "negative": neg,
            "source_defaults": cfg.get("source_defaults", []),
            "default_excluded": cfg.get("default_excluded", False),
        }

    tagged_count = 0
    for event in events:
        # If event already has manual tags (from community form), preserve them
        if event.get("tag_confidence") == "manual" and event.get("event_tags"):
            tagged_count += 1
            continue

        source = get_source_type(event)
        search_text = " ".join([
            event.get("title", ""),
            event.get("description", ""),
        ]).lower()

        matched_tags: list[str] = []
        for slug, cfg in compiled_tags.items():
            # Check source defaults
            if source in cfg["source_defaults"]:
                matched_tags.append(slug)
                continue

            # Check negative patterns first (for tags like family-kids)
            neg_hit = False
            for pat in cfg["negative"]:
                if pat.search(search_text):
                    neg_hit = True
                    break
            if neg_hit:
                continue

            # Check positive patterns
            for pat in cfg["positive"]:
                if pat.search(search_text):
                    matched_tags.append(slug)
                    break

        event["event_tags"] = matched_tags

        # Backward compat: derive is_family from family-kids tag
        if "family-kids" in matched_tags:
            event["is_family"] = True

        if matched_tags:
            tagged_count += 1

    return tagged_count


def ensure_trumba_fields(event: dict[str, Any]) -> None:
    """Add source_label and source_type to Trumba events if missing."""
    if not event.get("source_label"):
        event["source_label"] = "Nevada County Arts Council"
    if not event.get("source_type"):
        event["source_type"] = "feed"


def main() -> int:
    args = parse_args()
    tz = ZoneInfo(DEFAULT_TZ)
    now = datetime.now(tz)

    # Step 1: Load all source files
    trumba_events = load_source_events(args.trumba_file, "trumba")
    libcal_events = load_source_events(args.libcal_file, "libcal")
    civicengage_events = load_source_events(args.civicengage_file, "civicengage")
    kvmr_events = load_source_events(args.kvmr_file, "kvmr")
    gvda_events = load_source_events(args.gvda_file, "gvda")
    crazyhorse_events = load_source_events(args.crazyhorse_file, "crazyhorse")
    goldenera_events = load_source_events(args.goldenera_file, "goldenera")
    bodhihive_events = load_source_events(args.bodhihive_file, "bodhihive")
    community_events = load_source_events(args.community_file, "community")

    source_counts = {
        "trumba": len(trumba_events),
        "gvda": len(gvda_events),
        "libcal": len(libcal_events),
        "kvmr": len(kvmr_events),
        "civicengage": len(civicengage_events),
        "crazyhorse": len(crazyhorse_events),
        "goldenera": len(goldenera_events),
        "bodhihive": len(bodhihive_events),
        "community": len(community_events),
    }

    print("Source counts: " + ", ".join(
        f"{k}={v}" for k, v in source_counts.items()
    ), file=sys.stderr)

    # Step 2: Normalize -- ensure Trumba events have source fields
    for event in trumba_events:
        ensure_trumba_fields(event)

    # Combine all events
    all_events = (
        trumba_events + libcal_events + civicengage_events + kvmr_events + gvda_events +
        crazyhorse_events + goldenera_events + bodhihive_events + community_events
    )

    if not all_events:
        print("[WARN] No events from any source!", file=sys.stderr)
        # Still write empty output for pipeline stability
        empty_output = {
            "generated_at": now.isoformat(timespec="seconds"),
            "source_counts": source_counts,
            "dedup_removed": 0,
            "family_tagged": 0,
            "events": [],
        }
        args.output_file.parent.mkdir(parents=True, exist_ok=True)
        args.output_file.write_text(
            json.dumps(empty_output, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        args.flat_output_file.parent.mkdir(parents=True, exist_ok=True)
        args.flat_output_file.write_text("[]", encoding="utf-8")
        return 0

    # Step 3: Deduplicate cross-source
    deduped, dedup_removed, dedup_details = deduplicate_events(
        all_events, args.dedup_threshold, args.venue_threshold
    )

    if dedup_details:
        print(f"\nDedup removed {dedup_removed} duplicates:", file=sys.stderr)
        for detail in dedup_details:
            print(detail, file=sys.stderr)

    # Step 4: Apply event type tags
    tag_config = load_event_tags(args.event_tags_file)
    tagged_count = apply_event_tags(deduped, tag_config)

    # Step 5: Classify family events (legacy, supplements family-kids tag)
    positive_patterns, negative_patterns = load_family_keywords(args.family_keywords)
    family_count = 0
    for event in deduped:
        # If already tagged family-kids by the tag system, keep it
        if event.get("is_family"):
            family_count += 1
            continue
        is_family = classify_family(event, positive_patterns, negative_patterns)
        event["is_family"] = is_family
        if is_family:
            family_count += 1

    # Sort by start_iso then event_id
    deduped.sort(key=lambda e: (e.get("start_iso", ""), e.get("event_id", "")))

    # Step 6: Output wrapped format
    output = {
        "generated_at": now.isoformat(timespec="seconds"),
        "source_counts": source_counts,
        "dedup_removed": dedup_removed,
        "event_tagged": tagged_count,
        "family_tagged": family_count,
        "events": deduped,
    }

    args.output_file.parent.mkdir(parents=True, exist_ok=True)
    args.output_file.write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Output flat format (bare array for build_event_index.py compatibility)
    args.flat_output_file.parent.mkdir(parents=True, exist_ok=True)
    args.flat_output_file.write_text(
        json.dumps(deduped, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Summary
    print(f"\n[OK] Events merged", file=sys.stderr)
    print(f"  output={args.output_file}", file=sys.stderr)
    print(f"  flat_output={args.flat_output_file}", file=sys.stderr)
    print(f"  total={len(deduped)}", file=sys.stderr)
    print(f"  dedup_removed={dedup_removed}", file=sys.stderr)
    print(f"  event_tagged={tagged_count}", file=sys.stderr)
    print(f"  family_tagged={family_count}", file=sys.stderr)
    print(f"  source_counts={source_counts}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
