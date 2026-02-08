#!/usr/bin/env python3
"""
Validate structure and baseline integrity of cultural-map hours data.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


DEFAULT_DATA_FILE = Path("website/cultural-map-redesign/data.json")
DEFAULT_MIN_RECORDS = 680


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Verify hours data structure.")
    parser.add_argument(
        "--data-file",
        type=Path,
        default=DEFAULT_DATA_FILE,
        help=f"Path to data JSON file (default: {DEFAULT_DATA_FILE})",
    )
    parser.add_argument(
        "--min-records",
        type=int,
        default=DEFAULT_MIN_RECORDS,
        help=f"Minimum acceptable number of records (default: {DEFAULT_MIN_RECORDS})",
    )
    return parser.parse_args()


def fail(message: str) -> None:
    print(f"[X] {message}")
    sys.exit(1)


def main() -> int:
    args = parse_args()

    if not args.data_file.exists():
        fail(f"Data file not found: {args.data_file}")

    try:
        raw = args.data_file.read_text(encoding="utf-8")
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {args.data_file}: {exc}")

    if not isinstance(data, list):
        fail("Top-level JSON structure must be a list of venue objects")

    total = len(data)
    if total < args.min_records:
        fail(f"Record count below floor: {total} < {args.min_records}")

    missing_pid_key = 0
    missing_h_key = 0
    bad_pid_type = 0
    bad_h_type = 0
    bad_h_item_type = 0
    with_pid = 0
    with_hours = 0

    for idx, venue in enumerate(data):
        if not isinstance(venue, dict):
            fail(f"Record at index {idx} is not an object")

        if "pid" not in venue:
            missing_pid_key += 1
        else:
            pid = venue["pid"]
            if pid is not None and not isinstance(pid, str):
                bad_pid_type += 1
            if isinstance(pid, str):
                with_pid += 1

        if "h" not in venue:
            missing_h_key += 1
        else:
            hours = venue["h"]
            if hours is None:
                pass
            elif isinstance(hours, list):
                if not all(isinstance(item, str) for item in hours):
                    bad_h_item_type += 1
                if len(hours) > 0:
                    with_hours += 1
            else:
                bad_h_type += 1

    if missing_pid_key > 0:
        fail(f"Missing 'pid' key in {missing_pid_key} records")
    if missing_h_key > 0:
        fail(f"Missing 'h' key in {missing_h_key} records")
    if bad_pid_type > 0:
        fail(f"Invalid pid type in {bad_pid_type} records (expected string or null)")
    if bad_h_type > 0:
        fail(f"Invalid h type in {bad_h_type} records (expected list or null)")
    if bad_h_item_type > 0:
        fail(f"Invalid hour-entry types in {bad_h_item_type} records")

    print("[OK] Hours data verification passed")
    print(f"  total={total}")
    print(f"  with_pid={with_pid}")
    print(f"  with_hours={with_hours}")
    print(f"  without_hours={total - with_hours}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
