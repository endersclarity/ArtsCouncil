#!/usr/bin/env python3
"""
Ingest events from Squarespace-powered venue sites into canonical events JSON.

Parameterized script that fetches the public JSON events endpoint from any
Squarespace site ({site_url}/events?format=json) and converts the upcoming
events array into the canonical schema used by other ingest scripts.

Usage:
    python ingest_squarespace_events.py \\
        --site-url https://www.goldeneralounge.com \\
        --source-name goldenera \\
        --output-file website/cultural-map-redesign-stitch-lab/events-goldenera.json

    python ingest_squarespace_events.py \\
        --site-url https://www.bodhi-hive.com \\
        --source-name bodhihive \\
        --output-file website/cultural-map-redesign-stitch-lab/events-bodhihive.json
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import requests


DEFAULT_TZ = "America/Los_Angeles"
DEFAULT_TIMEOUT = 30


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert Squarespace events JSON into canonical events JSON."
    )
    parser.add_argument(
        "--site-url",
        required=True,
        help="Base URL of the Squarespace site (e.g. https://www.goldeneralounge.com)",
    )
    parser.add_argument(
        "--source-name",
        required=True,
        help="Short identifier for this source (e.g. goldenera, bodhihive)",
    )
    parser.add_argument(
        "--output-file",
        type=Path,
        required=True,
        help="Output events JSON file path",
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


def epoch_ms_to_iso(epoch_ms: int | float, tz: ZoneInfo) -> str:
    """Convert epoch milliseconds to ISO 8601 string in the given timezone."""
    dt = datetime.fromtimestamp(epoch_ms / 1000, tz=tz)
    return dt.isoformat(timespec="seconds")


def parse_squarespace_events(
    data: dict[str, Any],
    source_name: str,
    site_url: str,
    tz_name: str,
) -> list[dict[str, Any]]:
    """Parse Squarespace JSON response into canonical event dicts."""
    tz = ZoneInfo(tz_name)
    now = datetime.now(tz)

    # Squarespace stores upcoming events in the "upcoming" or "items" array
    upcoming = data.get("upcoming") or data.get("items") or []

    events: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for item in upcoming:
        try:
            title = item.get("title", "").strip()
            if not title:
                continue

            # Event ID from urlId or fallback
            url_id = item.get("urlId", "")
            if url_id:
                event_id = f"{source_name}-{url_id}"
            else:
                start_ms = item.get("startDate", 0)
                if start_ms:
                    dt = datetime.fromtimestamp(start_ms / 1000, tz=tz)
                    event_id = f"{source_name}-{dt.strftime('%Y%m%d%H%M')}"
                else:
                    event_id = f"{source_name}-{len(events)}"

            # Dedup
            if event_id in seen_ids:
                counter = 2
                while f"{event_id}-{counter}" in seen_ids:
                    counter += 1
                event_id = f"{event_id}-{counter}"
            seen_ids.add(event_id)

            # Dates (epoch milliseconds)
            start_ms = item.get("startDate")
            end_ms = item.get("endDate")
            if not start_ms:
                continue

            start_iso = epoch_ms_to_iso(start_ms, tz)
            end_iso = epoch_ms_to_iso(end_ms, tz) if end_ms else ""

            # Location
            location = item.get("location", {}) or {}
            venue_name = location.get("addressTitle", "").strip()
            address_parts = []
            if location.get("addressLine1"):
                address_parts.append(location["addressLine1"].strip())
            if location.get("addressLine2"):
                address_parts.append(location["addressLine2"].strip())
            venue_address = ", ".join(address_parts) if address_parts else ""

            # Ticket/detail URL
            full_url = item.get("fullUrl", "")
            ticket_url = f"{site_url.rstrip('/')}{full_url}" if full_url else ""

            # Description (excerpt or body)
            description = item.get("excerpt", "").strip()
            if not description:
                body = item.get("body", "")
                if body:
                    # Strip HTML tags for plain text
                    import re
                    description = re.sub(r"<[^>]+>", " ", body)
                    description = re.sub(r"\s+", " ", description).strip()
            if description:
                description = description[:500]

            event: dict[str, Any] = {
                "event_id": event_id,
                "title": title,
                "start_iso": start_iso,
                "timezone": tz_name,
                "venue_name": venue_name if venue_name else source_name.title(),
                "venue_city": "Nevada City",
                "source_type": "squarespace",
                "source_ref": site_url,
                "source_label": venue_name if venue_name else source_name.title(),
                "is_family": False,
                "last_verified_at": now.isoformat(timespec="seconds"),
            }
            if end_iso:
                event["end_iso"] = end_iso
            if description:
                event["description"] = description
            if venue_address:
                event["venue_address"] = venue_address
            if ticket_url:
                event["ticket_url"] = ticket_url

            events.append(event)
        except Exception as exc:
            print(f"[WARN] Skipping event: {exc}", file=sys.stderr)
            continue

    events.sort(key=lambda e: (e["start_iso"], e["event_id"]))
    return events


def main() -> int:
    args = parse_args()

    # Fetch Squarespace events JSON
    events_url = f"{args.site_url.rstrip('/')}/events?format=json"
    try:
        response = requests.get(
            events_url,
            timeout=args.timeout_seconds,
            headers={"User-Agent": "Mozilla/5.0 (cultural-map-ingest)"},
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        fail(f"Failed to fetch events from {events_url}: {exc}")

    try:
        data = response.json()
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON response from {events_url}: {exc}")

    events = parse_squarespace_events(
        data=data,
        source_name=args.source_name,
        site_url=args.site_url,
        tz_name=args.timezone,
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
        f"Fetched {len(events)} events from {args.source_name} ({events_url})",
        file=sys.stderr,
    )
    print(f"[OK] Squarespace events ingested", file=sys.stderr)
    print(f"  site_url={args.site_url}", file=sys.stderr)
    print(f"  source_name={args.source_name}", file=sys.stderr)
    print(f"  output={args.output_file}", file=sys.stderr)
    print(f"  total={len(events)}", file=sys.stderr)
    if events:
        print(f"  first={events[0]['start_iso']} :: {events[0]['title']}", file=sys.stderr)
        print(f"  last={events[-1]['start_iso']} :: {events[-1]['title']}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
