#!/usr/bin/env python3
"""
Ingest CivicEngage municipal RSS feeds into canonical events JSON.

Fetches RSS feeds from CivicEngage-powered municipal websites (e.g., Nevada City),
parses event entries, and outputs events in the same canonical schema as
ingest_trumba_rss.py.

CivicEngage is a low-volume source. Empty output (0 events) is expected and
not an error -- many feeds contain only government meetings.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import feedparser
import requests


DEFAULT_FEEDS = [
    {
        "url": "https://www.nevadacityca.gov/RSSFeed.aspx?ModID=58&CID=Events-Calendar-24",
        "label": "City of Nevada City",
        "default_city": "Nevada City",
    },
]

DEFAULT_OUTPUT_FILE = Path("website/cultural-map-redesign/events-civicengage.json")
DEFAULT_WINDOW_DAYS = 14
DEFAULT_TZ = "America/Los_Angeles"
DEFAULT_TIMEOUT = 30


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert CivicEngage RSS feeds into canonical events JSON."
    )
    parser.add_argument(
        "--feeds",
        default=None,
        help="JSON string of feed configs. Each: {url, label, default_city}. "
             "Default: Nevada City Events Calendar only.",
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
    return re.sub(r"<[^>]+>", "", value)


def slugify(text: str, max_len: int = 30) -> str:
    """Create a URL-safe slug from text."""
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:max_len]


def parse_entry_date(entry: Any, tz: ZoneInfo) -> datetime | None:
    """
    Parse date from a feedparser entry. Tries multiple strategies:
    1. CivicEngage calendarEvent_eventdates custom field (actual event date)
    2. Other custom namespace date fields
    3. published_parsed (RSS post date -- fallback only)
    4. Regex from title for date patterns

    IMPORTANT: published_parsed is the RSS *post* date, NOT the event date.
    CivicEngage posts events weeks before they occur, so we must prefer
    the calendarEvent_eventdates field.
    """
    # Strategy 1: CivicEngage calendarEvent_eventdates (e.g., "February 16, 2026")
    event_dates = entry.get("calendarevent_eventdates", "")
    if event_dates and isinstance(event_dates, str):
        for fmt in ("%B %d, %Y", "%m/%d/%Y", "%Y-%m-%d"):
            try:
                dt = datetime.strptime(event_dates.strip(), fmt)
                # Try to add time from calendarevent_eventtimes
                event_times = entry.get("calendarevent_eventtimes", "")
                if event_times and isinstance(event_times, str):
                    time_match = re.match(r"(\d{1,2}:\d{2}\s*[APap][Mm])", event_times.strip())
                    if time_match:
                        try:
                            t = datetime.strptime(time_match.group(1).strip(), "%I:%M %p")
                            dt = dt.replace(hour=t.hour, minute=t.minute)
                        except ValueError:
                            pass
                return dt.replace(tzinfo=tz)
            except ValueError:
                continue

    # Strategy 2: Other custom namespace date fields
    for key in entry.keys():
        if key == "calendarevent_eventdates":
            continue  # Already tried above
        if "date" in key.lower() or "start" in key.lower():
            raw = entry.get(key, "")
            if isinstance(raw, str) and raw:
                try:
                    dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
                    return dt.astimezone(tz)
                except ValueError:
                    pass
                for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%B %d, %Y", "%m/%d/%Y %I:%M %p"):
                    try:
                        dt = datetime.strptime(raw.strip(), fmt)
                        return dt.replace(tzinfo=tz)
                    except ValueError:
                        continue

    # Strategy 3: published_parsed (RSS post date -- often weeks before event)
    published = entry.get("published_parsed")
    if published:
        try:
            ts = time.mktime(published)
            dt = datetime.fromtimestamp(ts, tz=tz)
            return dt
        except (ValueError, OverflowError, OSError):
            pass

    # Strategy 4: Parse date from title (e.g., "02/18/2026 - Some Event")
    title = entry.get("title", "")
    m = re.search(r"(\d{1,2}/\d{1,2}/\d{4})", title)
    if m:
        try:
            dt = datetime.strptime(m.group(1), "%m/%d/%Y")
            return dt.replace(tzinfo=tz)
        except ValueError:
            pass

    return None


def parse_entry_end_date(entry: Any, start_dt: datetime, tz: ZoneInfo) -> datetime:
    """Try to find end date/time, default to start + 2 hours."""
    # Strategy 1: CivicEngage calendarevent_eventtimes (e.g., "12:00 AM - 11:59 PM")
    event_times = entry.get("calendarevent_eventtimes", "")
    if event_times and isinstance(event_times, str):
        # Parse "HH:MM AM - HH:MM PM" format
        m = re.match(
            r"\d{1,2}:\d{2}\s*[APap][Mm]\s*-\s*(\d{1,2}:\d{2}\s*[APap][Mm])",
            event_times.strip(),
        )
        if m:
            try:
                t = datetime.strptime(m.group(1).strip(), "%I:%M %p")
                end_dt = start_dt.replace(hour=t.hour, minute=t.minute, second=0)
                if end_dt <= start_dt:
                    end_dt += timedelta(days=1)
                return end_dt
            except ValueError:
                pass

    # Strategy 2: Look for end date in custom fields
    for key in entry.keys():
        if "end" in key.lower() and "date" in key.lower():
            raw = entry.get(key, "")
            if isinstance(raw, str) and raw:
                try:
                    dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
                    return dt.astimezone(tz)
                except ValueError:
                    pass
    return start_dt + timedelta(hours=2)


def extract_venue_from_entry(entry: Any, default_label: str) -> str:
    """Try to extract venue name from entry fields."""
    # Strategy 1: CivicEngage calendarevent_location
    # Format: "317 Broad Street<br>(530) 265-2496Nevada City, CA 95959"
    civic_location = entry.get("calendarevent_location", "")
    if civic_location and isinstance(civic_location, str):
        # Take first line/segment before <br> or phone number
        first_part = re.split(r"<br>|\n", civic_location)[0]
        venue = clean_space(strip_html(first_part))
        if venue:
            return venue

    # Strategy 2: Check for other location-like custom fields
    for key in entry.keys():
        if key == "calendarevent_location":
            continue  # Already tried above
        key_lower = key.lower()
        if "location" in key_lower or "venue" in key_lower:
            raw = entry.get(key, "")
            if isinstance(raw, str) and raw.strip():
                return clean_space(strip_html(raw))

    # Check description for location hints
    summary = entry.get("summary", "")
    if summary:
        # Look for "Location: ..." or "Where: ..." patterns
        text = strip_html(summary)
        m = re.search(r"(?:location|where|venue)\s*:\s*([^\n]+)", text, re.IGNORECASE)
        if m:
            venue = clean_space(m.group(1))
            if venue:
                return venue

    return default_label


def parse_single_feed(
    feed_config: dict[str, str],
    tz_name: str,
    window_days: int,
    timeout: int,
) -> list[dict[str, Any]]:
    """Parse a single CivicEngage RSS feed and return canonical events."""
    url = feed_config["url"]
    label = feed_config["label"]
    default_city = feed_config.get("default_city", "Nevada City")

    tz = ZoneInfo(tz_name)
    now = datetime.now(tz)
    window_end = now + timedelta(days=window_days)

    # Fetch with requests first (for timeout control), then parse with feedparser
    try:
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()
        feed_content = response.text
    except requests.RequestException as exc:
        print(f"[WARN] Failed to fetch {label} ({url}): {exc}", file=sys.stderr)
        return []

    feed = feedparser.parse(feed_content)

    events: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for entry in feed.entries:
        title = clean_space(entry.get("title", ""))
        if not title:
            continue

        # Strip HTML from title if present
        title = clean_space(strip_html(title))

        start_dt = parse_entry_date(entry, tz)
        if start_dt is None:
            continue

        # Window filter
        if start_dt < now or start_dt > window_end:
            continue

        end_dt = parse_entry_end_date(entry, start_dt, tz)

        # Generate event_id
        date_str = start_dt.strftime("%Y%m%d")
        title_slug = slugify(title, 30)
        event_id = f"civic-{date_str}-{title_slug}"

        # Deduplicate within same feed
        if event_id in seen_ids:
            counter = 2
            while f"{event_id}-{counter}" in seen_ids:
                counter += 1
            event_id = f"{event_id}-{counter}"
        seen_ids.add(event_id)

        venue_name = extract_venue_from_entry(entry, label)

        # Extract description
        summary = entry.get("summary", "")
        description = clean_space(strip_html(summary)) if summary else None

        # Extract link
        link = entry.get("link", "")

        event: dict[str, Any] = {
            "event_id": event_id,
            "title": title,
            "start_iso": start_dt.isoformat(timespec="seconds"),
            "end_iso": end_dt.isoformat(timespec="seconds"),
            "timezone": tz_name,
            "venue_name": venue_name,
            "venue_city": default_city,
            "source_type": "rss",
            "source_ref": url,
            "source_label": label,
            "is_family": False,
            "last_verified_at": now.isoformat(timespec="seconds"),
        }
        if description:
            event["description"] = description[:500]
        if link:
            event["ticket_url"] = link

        events.append(event)

    print(f"Fetched {len(events)} events from {label}", file=sys.stderr)
    return events


def main() -> int:
    args = parse_args()

    # Parse feed configs
    if args.feeds:
        try:
            feeds = json.loads(args.feeds)
        except json.JSONDecodeError as exc:
            fail(f"Invalid --feeds JSON: {exc}")
    else:
        feeds = DEFAULT_FEEDS

    tz = ZoneInfo(args.timezone)
    now = datetime.now(tz)

    all_events: list[dict[str, Any]] = []
    for feed_config in feeds:
        events = parse_single_feed(
            feed_config=feed_config,
            tz_name=args.timezone,
            window_days=args.window_days,
            timeout=args.timeout_seconds,
        )
        all_events.extend(events)

    # Sort by start_iso then event_id
    all_events.sort(key=lambda e: (e["start_iso"], e["event_id"]))

    # Wrap with generated_at timestamp
    output = {
        "generated_at": now.isoformat(timespec="seconds"),
        "events": all_events,
    }

    args.output_file.parent.mkdir(parents=True, exist_ok=True)
    args.output_file.write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"[OK] CivicEngage RSS ingested", file=sys.stderr)
    print(f"  output={args.output_file}", file=sys.stderr)
    print(f"  total={len(all_events)}", file=sys.stderr)
    if all_events:
        print(f"  first={all_events[0]['start_iso']} :: {all_events[0]['title']}", file=sys.stderr)
        print(f"  last={all_events[-1]['start_iso']} :: {all_events[-1]['title']}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
