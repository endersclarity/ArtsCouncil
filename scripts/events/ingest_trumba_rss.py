#!/usr/bin/env python3
"""
Ingest Trumba RSS into canonical events.json for the cultural map.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse
from zoneinfo import ZoneInfo

import requests


DEFAULT_RSS_URL = "https://www.trumba.com/calendars/nevada-county-arts-council.rss"
DEFAULT_OUTPUT_FILE = Path("website/cultural-map-redesign/events.json")
DEFAULT_WINDOW_DAYS = 14
DEFAULT_TZ = "America/Los_Angeles"
DEFAULT_TIMEOUT = 30

XTRUMBA_NS = "http://schemas.trumba.com/rss/x-trumba"
WEEKDAYS = "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert Trumba RSS feed into canonical events.json.")
    parser.add_argument("--rss-url", default=DEFAULT_RSS_URL, help=f"Trumba RSS feed URL (default: {DEFAULT_RSS_URL})")
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
    print(f"[X] {message}")
    sys.exit(1)


def clean_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def strip_tags(value: str) -> str:
    return re.sub(r"<[^>]+>", "", value)


def html_to_text(description_html: str) -> str:
    decoded = html.unescape(description_html or "")
    with_breaks = re.sub(r"<br\s*/?>", "\n", decoded, flags=re.IGNORECASE)
    text = strip_tags(with_breaks)
    lines = [clean_space(line) for line in text.splitlines()]
    return "\n".join([line for line in lines if line])


def parse_labeled_fields(description_html: str) -> dict[str, str]:
    """
    Parse Trumba description chunks like:
      <b>Venue</b>: Miners Foundry
      <b>City/Area</b>: Nevada City
    """
    decoded = html.unescape(description_html or "")
    fields: dict[str, str] = {}

    pattern = re.compile(
        r"<b>\s*([^<]+?)\s*</b>\s*:\s*(.*?)(?:(?:<br\s*/?>\s*)?<b>\s*[^<]+?\s*</b>\s*:|$)",
        re.IGNORECASE | re.DOTALL,
    )
    for match in pattern.finditer(decoded):
        raw_key = clean_space(strip_tags(match.group(1))).lower()
        raw_val = clean_space(strip_tags(match.group(2)).strip(" ,;"))
        if not raw_key or not raw_val:
            continue
        fields[raw_key] = raw_val
    return fields


def parse_plain_fields(text: str) -> dict[str, str]:
    """
    Parse plain text lines like:
      City/Area: Truckee
      Type of Event: Music
    """
    fields: dict[str, str] = {}
    for line in text.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key_norm = clean_space(key).lower()
        value_norm = clean_space(value.strip(" ,;"))
        if not key_norm or not value_norm:
            continue
        if key_norm in {
            "price",
            "phone",
            "email",
            "type of event",
            "type of events",
            "venue",
            "event location",
            "other location",
            "city/area",
            "city / area",
            "online ticket",
            "more info",
            "event details",
            "event description",
            "age range",
        }:
            fields[key_norm] = value_norm
    return fields


def month_name_to_int(name: str) -> int:
    return datetime.strptime(name, "%B").month


def parse_time_token(token: str, meridiem_hint: str | None = None) -> tuple[int, int, str | None]:
    text = token.strip().lower().replace(".", "")
    text = re.sub(r"\s+", "", text)
    if not text:
        raise ValueError("Empty time token")

    if text in {"noon"}:
        return 12, 0, "pm"
    if text in {"midnight"}:
        return 0, 0, "am"

    m = re.match(r"^(?P<h>\d{1,2})(?::(?P<m>\d{2}))?(?P<mer>am|pm|a|p)?$", text)
    if not m:
        raise ValueError(f"Unsupported time token: {token}")

    hour = int(m.group("h"))
    minute = int(m.group("m") or 0)
    mer = m.group("mer")
    if mer == "a":
        mer = "am"
    elif mer == "p":
        mer = "pm"

    if mer is None:
        mer = meridiem_hint

    if mer is None:
        raise ValueError(f"Missing AM/PM marker: {token}")

    hour = hour % 12
    if mer == "pm":
        hour += 12

    return hour, minute, mer


def parse_time_range(time_range: str) -> tuple[tuple[int, int], tuple[int, int]]:
    norm = (
        time_range.replace("\u2013", "-")
        .replace("\u2014", "-")
        .replace("\u2212", "-")
        .replace("\xa0", " ")
    )
    norm = clean_space(norm)
    if not norm:
        raise ValueError("Empty time range")

    lower = norm.lower()
    if "all day" in lower:
        return (0, 0), (23, 59)

    parts = [clean_space(p) for p in re.split(r"\s*-\s*", norm, maxsplit=1)]
    if len(parts) == 1:
        end_h = None
        end_m = None
        end_mer = None
        start_h, start_m, _ = parse_time_token(parts[0], None)
    else:
        end_h, end_m, end_mer = parse_time_token(parts[1], None)
        start_h, start_m, _ = parse_time_token(parts[0], end_mer)

    if end_h is None or end_m is None:
        # Default event duration when end is absent
        end_h = start_h + 2
        end_m = start_m
        if end_h >= 24:
            end_h -= 24

    return (start_h, start_m), (end_h, end_m)


def parse_datetime_from_text(text: str, timezone: ZoneInfo) -> tuple[datetime, datetime] | None:
    # Example: "Sunday, February 8, 2026, 4 – 6:30pm"
    m = re.search(
        rf"(?P<weekday>{WEEKDAYS}),\s+(?P<month>[A-Za-z]+)\s+(?P<day>\d{{1,2}}),\s*(?P<year>\d{{4}}),\s*(?P<times>[^\n]+)",
        text,
        flags=re.IGNORECASE,
    )
    if not m:
        return None

    year = int(m.group("year"))
    month = month_name_to_int(m.group("month"))
    day = int(m.group("day"))
    start_hm, end_hm = parse_time_range(m.group("times"))

    start_dt = datetime(year, month, day, start_hm[0], start_hm[1], tzinfo=timezone)
    end_dt = datetime(year, month, day, end_hm[0], end_hm[1], tzinfo=timezone)
    if end_dt <= start_dt:
        end_dt = end_dt + timedelta(days=1)
    return start_dt, end_dt


def parse_category_date(category_text: str) -> datetime | None:
    # Example category: "2026/02/12 (Thu)"
    m = re.match(r"^\s*(\d{4})/(\d{2})/(\d{2})", category_text or "")
    if not m:
        return None
    return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))


def extract_event_id(guid: str, link: str, title: str, start_dt: datetime) -> str:
    guid = (guid or "").strip()
    if guid:
        m = re.search(r"(\d+)$", guid)
        if m:
            return f"trumba-{m.group(1)}"

    if link:
        parsed = urlparse(link)
        event_ids = parse_qs(parsed.query).get("eventid", [])
        if event_ids and event_ids[0].strip():
            return f"trumba-{event_ids[0].strip()}"

    slug = re.sub(r"[^a-z0-9]+", "-", (title or "").lower()).strip("-")
    if not slug:
        slug = "event"
    return f"trumba-{start_dt.strftime('%Y%m%d%H%M')}-{slug[:40]}"


def normalize_url(value: str | None) -> str | None:
    if not value:
        return None
    text = value.strip()
    if not text:
        return None
    if text.startswith("http://") or text.startswith("https://"):
        return text
    if text.startswith("www."):
        return f"https://{text}"
    return None


def infer_venue_name(first_line: str, fields: dict[str, str]) -> str:
    for key in ("venue", "other location", "event location"):
        value = fields.get(key)
        if value:
            return clean_space(value)

    # First line often looks like: "Golden Era, 309 Broad St., Nevada City, CA"
    line = clean_space(first_line)
    if not line:
        return "Unknown venue"
    if re.match(r"^\d", line):
        return "Unknown venue"
    if "," in line:
        head = clean_space(line.split(",", 1)[0])
        if head:
            return head
    return line


def infer_city(text: str, fields: dict[str, str]) -> str | None:
    for key in ("city/area", "city / area"):
        value = fields.get(key)
        if value:
            return clean_space(value)

    for line in text.splitlines():
        # Format: "Truckee, CA 96161"
        m_line = re.match(r"^\s*([A-Za-z][A-Za-z\s.'-]+),\s*CA(?:\s+\d{5})?\s*$", line)
        if m_line:
            return clean_space(m_line.group(1))

        # Format: "Golden Era, 309 Broad St., Nevada City, CA 95959"
        if "CA" in line and "," in line:
            parts = [clean_space(part) for part in line.split(",")]
            for idx, part in enumerate(parts):
                if part.startswith("CA") and idx > 0:
                    candidate = parts[idx - 1]
                    if candidate and not re.search(r"\d", candidate):
                        return candidate
    return None


def infer_tags(fields: dict[str, str]) -> list[str]:
    raw = fields.get("type of event") or fields.get("type of events")
    if not raw:
        return []
    tags = [clean_space(part) for part in raw.split(",")]
    return [tag for tag in tags if tag]


def parse_feed(xml_text: str, timezone_name: str, source_ref: str, window_days: int) -> list[dict[str, Any]]:
    tz = ZoneInfo(timezone_name)
    now = datetime.now(tz)
    window_end = now + timedelta(days=window_days)

    try:
        root = ET.fromstring(xml_text.lstrip("\ufeff"))
    except ET.ParseError as exc:
        fail(f"Invalid XML from feed: {exc}")

    items = root.findall("./channel/item")
    events: list[dict[str, Any]] = []
    seen_ids: dict[str, int] = {}

    for item in items:
        title = clean_space(item.findtext("title", default=""))
        description_html = item.findtext("description", default="")
        link = clean_space(item.findtext("link", default=""))
        guid = clean_space(item.findtext("guid", default=""))
        category = clean_space(item.findtext("category", default=""))
        weblink = clean_space(item.findtext(f"{{{XTRUMBA_NS}}}weblink", default=""))

        if not title:
            continue

        plain_text = html_to_text(description_html)
        fields = parse_labeled_fields(description_html)
        plain_fields = parse_plain_fields(plain_text)
        # Plain fields fill holes left by bold-tag parsing
        for key, value in plain_fields.items():
            fields.setdefault(key, value)

        parsed_dt = None
        try:
            parsed_dt = parse_datetime_from_text(plain_text, tz)
        except Exception:
            parsed_dt = None

        if parsed_dt is None:
            cat_date = parse_category_date(category)
            if cat_date is None:
                continue
            # Fallback when time cannot be parsed
            start_dt = datetime(cat_date.year, cat_date.month, cat_date.day, 12, 0, tzinfo=tz)
            end_dt = start_dt + timedelta(hours=2)
        else:
            start_dt, end_dt = parsed_dt

        if start_dt < now or start_dt > window_end:
            continue

        lines = [line for line in plain_text.splitlines() if line]
        first_line = lines[0] if lines else ""
        venue_name = infer_venue_name(first_line, fields)
        venue_city = infer_city(plain_text, fields)
        ticket_url = normalize_url(weblink) or normalize_url(link)
        tags = infer_tags(fields)

        event_id = extract_event_id(guid, link, title, start_dt)
        count = seen_ids.get(event_id, 0)
        seen_ids[event_id] = count + 1
        if count > 0:
            event_id = f"{event_id}-{count + 1}"

        event: dict[str, Any] = {
            "event_id": event_id,
            "title": title,
            "start_iso": start_dt.isoformat(timespec="seconds"),
            "end_iso": end_dt.isoformat(timespec="seconds"),
            "timezone": timezone_name,
            "venue_name": venue_name,
            "source_type": "feed",
            "source_ref": source_ref,
            "last_verified_at": now.isoformat(timespec="seconds"),
        }
        if venue_city:
            event["venue_city"] = venue_city
        if ticket_url:
            event["ticket_url"] = ticket_url
        if tags:
            event["tags"] = tags

        events.append(event)

    events.sort(key=lambda item: (item["start_iso"], item["event_id"]))
    return events


def main() -> int:
    args = parse_args()

    try:
        response = requests.get(args.rss_url, timeout=args.timeout_seconds)
        response.raise_for_status()
    except requests.RequestException as exc:
        fail(f"Failed to fetch RSS feed: {exc}")

    events = parse_feed(
        xml_text=response.text,
        timezone_name=args.timezone,
        source_ref=args.rss_url,
        window_days=args.window_days,
    )

    args.output_file.parent.mkdir(parents=True, exist_ok=True)
    args.output_file.write_text(json.dumps(events, ensure_ascii=False, indent=2), encoding="utf-8")

    print("[OK] Trumba RSS ingested")
    print(f"  rss_url={args.rss_url}")
    print(f"  output={args.output_file}")
    print(f"  total={len(events)}")
    if events:
        print(f"  first={events[0]['start_iso']} :: {events[0]['title']}")
        print(f"  last={events[-1]['start_iso']} :: {events[-1]['title']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
