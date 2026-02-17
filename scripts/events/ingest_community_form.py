#!/usr/bin/env python3
"""
Ingest community-submitted events from a Google Sheet linked to a Google Form.

Reads approved rows from the sheet and outputs events-community.json
for consumption by merge_events.py.

Requires:
  - gspread + google-auth (pip install gspread google-auth)
  - Google service account JSON credentials with Sheets API access
  - The Google Sheet shared with the service account email (read-only)
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

DEFAULT_OUTPUT = Path("website/cultural-map-redesign-stitch-lab/events-community.json")
DEFAULT_TZ = "America/Los_Angeles"

# Map Google Form "Event Type" checkbox values to tag slugs
EVENT_TYPE_TO_SLUG = {
    "live music": "live-music",
    "family & kids": "family-kids",
    "arts & gallery": "arts-gallery",
    "community": "community",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Ingest community-submitted events from Google Sheets."
    )
    parser.add_argument(
        "--sheet-id",
        required=True,
        help="Google Sheet ID (from the sheet URL)",
    )
    parser.add_argument(
        "--credentials-file",
        type=Path,
        default=None,
        help="Path to Google service account JSON key file",
    )
    parser.add_argument(
        "--credentials-json",
        default=None,
        help="Raw JSON string of service account credentials (for CI secrets)",
    )
    parser.add_argument(
        "--output-file",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Output JSON file (default: {DEFAULT_OUTPUT})",
    )
    return parser.parse_args()


def slugify(text: str) -> str:
    """Convert text to a URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:60]


def parse_datetime(date_str: str, time_str: str, tz: ZoneInfo) -> str | None:
    """Parse date + time strings into ISO 8601 format."""
    if not date_str:
        return None

    # Try common date formats
    date_obj = None
    for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%m-%d-%Y", "%B %d, %Y", "%b %d, %Y"):
        try:
            date_obj = datetime.strptime(date_str.strip(), fmt)
            break
        except ValueError:
            continue

    if date_obj is None:
        print(f"[WARN] Could not parse date: '{date_str}'", file=sys.stderr)
        return None

    # Parse time
    hour, minute = 19, 0  # default 7 PM
    if time_str and time_str.strip():
        time_str = time_str.strip().upper()
        for tfmt in ("%I:%M %p", "%H:%M", "%I:%M%p", "%I %p", "%I%p"):
            try:
                t = datetime.strptime(time_str, tfmt)
                hour, minute = t.hour, t.minute
                break
            except ValueError:
                continue

    dt = date_obj.replace(hour=hour, minute=minute, tzinfo=tz)
    return dt.isoformat(timespec="seconds")


def map_event_types(type_string: str) -> list[str]:
    """Map comma-separated Event Type checkbox values to tag slugs."""
    if not type_string:
        return []
    tags = []
    for part in type_string.split(","):
        part = part.strip().lower()
        slug = EVENT_TYPE_TO_SLUG.get(part)
        if slug:
            tags.append(slug)
    return tags


def connect_to_sheet(args: argparse.Namespace):
    """Authenticate and open the Google Sheet. Returns worksheet or None."""
    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError:
        print(
            "[WARN] gspread/google-auth not installed. "
            "Install with: pip install gspread google-auth",
            file=sys.stderr,
        )
        return None

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
    ]

    creds = None

    if args.credentials_json:
        try:
            info = json.loads(args.credentials_json)
            creds = Credentials.from_service_account_info(info, scopes=scopes)
        except (json.JSONDecodeError, Exception) as exc:
            print(f"[WARN] Failed to parse credentials JSON: {exc}", file=sys.stderr)
            return None
    elif args.credentials_file and args.credentials_file.exists():
        try:
            creds = Credentials.from_service_account_file(
                str(args.credentials_file), scopes=scopes
            )
        except Exception as exc:
            print(f"[WARN] Failed to load credentials file: {exc}", file=sys.stderr)
            return None
    else:
        print(
            "[WARN] No credentials provided. Use --credentials-file or --credentials-json. "
            "Outputting empty events array.",
            file=sys.stderr,
        )
        return None

    try:
        client = gspread.authorize(creds)
        sheet = client.open_by_key(args.sheet_id)
        return sheet.sheet1
    except Exception as exc:
        print(f"[WARN] Failed to open Google Sheet: {exc}", file=sys.stderr)
        return None


def process_rows(rows: list[dict[str, Any]], tz: ZoneInfo) -> list[dict[str, Any]]:
    """Convert approved sheet rows to event JSON objects."""
    events = []
    for i, row in enumerate(rows, start=2):  # Row 1 is header
        # Check status column (case-insensitive)
        status = str(row.get("status", "") or "").strip().lower()
        if status != "approved":
            continue

        title = str(row.get("Event Name", "") or "").strip()
        if not title:
            continue

        date_str = str(row.get("Date", "") or "").strip()
        start_time = str(row.get("Start Time", "") or "").strip()
        end_time = str(row.get("End Time", "") or "").strip()

        start_iso = parse_datetime(date_str, start_time, tz)
        if not start_iso:
            print(f"[WARN] Skipping row {i}: could not parse date/time", file=sys.stderr)
            continue

        # End time: parse or default to start + 3 hours
        end_iso = None
        if end_time:
            end_iso = parse_datetime(date_str, end_time, tz)
        if not end_iso and start_iso:
            try:
                start_dt = datetime.fromisoformat(start_iso)
                end_dt = start_dt + timedelta(hours=3)
                end_iso = end_dt.isoformat(timespec="seconds")
            except (ValueError, TypeError):
                pass

        # Venue
        venue = str(row.get("Venue", "") or "").strip()
        other_venue = str(row.get("Other Venue", "") or "").strip()
        if other_venue:
            venue = other_venue

        # Event type tags
        event_type_str = str(row.get("Event Type", "") or "").strip()
        event_tags = map_event_types(event_type_str)

        # Build event ID
        event_id = f"community-{slugify(title)}-{date_str.replace('/', '-')}"

        event: dict[str, Any] = {
            "event_id": event_id,
            "title": title,
            "start_iso": start_iso,
            "source_type": "community",
            "source_label": "Community Submission",
            "event_tags": event_tags,
            "tag_confidence": "manual",
        }

        if end_iso:
            event["end_iso"] = end_iso
        if venue:
            event["venue_name"] = venue

        # Optional fields
        description = str(row.get("Description", "") or "").strip()
        if description:
            event["description"] = description
        ticket_url = str(row.get("Ticket URL", "") or "").strip()
        if ticket_url:
            event["ticket_url"] = ticket_url
        image_url = str(row.get("Image URL", "") or "").strip()
        if image_url:
            event["image_url"] = image_url

        # Recurring info (informational only)
        recurring = str(row.get("Recurring", "") or "").strip()
        if recurring and recurring.lower() != "one-time":
            event["recurring"] = recurring.lower()

        events.append(event)

    return events


def main() -> int:
    args = parse_args()
    tz = ZoneInfo(DEFAULT_TZ)

    worksheet = connect_to_sheet(args)

    if worksheet is None:
        # Output empty array for pipeline stability
        args.output_file.parent.mkdir(parents=True, exist_ok=True)
        args.output_file.write_text("[]", encoding="utf-8")
        print(f"[OK] Wrote empty events array to {args.output_file}", file=sys.stderr)
        return 0

    try:
        rows = worksheet.get_all_records()
    except Exception as exc:
        print(f"[WARN] Failed to read sheet rows: {exc}", file=sys.stderr)
        args.output_file.parent.mkdir(parents=True, exist_ok=True)
        args.output_file.write_text("[]", encoding="utf-8")
        return 0

    events = process_rows(rows, tz)

    args.output_file.parent.mkdir(parents=True, exist_ok=True)
    args.output_file.write_text(
        json.dumps(events, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"\n[OK] Community events ingested", file=sys.stderr)
    print(f"  total_rows={len(rows)}", file=sys.stderr)
    print(f"  approved_events={len(events)}", file=sys.stderr)
    print(f"  output={args.output_file}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
