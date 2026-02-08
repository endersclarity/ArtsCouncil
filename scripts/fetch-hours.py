#!/usr/bin/env python3
"""
Fetch hours of operation from Google Places API (New) for cultural assets.

This script:
1. Loads existing data.json (687 cultural assets)
2. For each asset:
   - Resolves Place ID using Text Search API (name + address + city)
   - Fetches opening hours using Place Details API (regularOpeningHours)
3. Adds `h` (hours array) and `pid` (Place ID) fields to each asset
4. Writes updated data back to data.json

Rate limiting: 150ms delays with 0-50ms jitter, exponential backoff for 429 errors
Edge cases: Handles missing addresses, no Place ID found, no hours data
"""

import json
import os
import sys
import time
import random
from pathlib import Path
from typing import Optional, Dict, List, Any

try:
    import requests
    from dotenv import load_dotenv
except ImportError:
    print("Error: Missing dependencies. Install with:")
    print("  pip install requests python-dotenv")
    sys.exit(1)

# Load environment variables from .env file
load_dotenv()

# Configuration
API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
BASE_URL = "https://places.googleapis.com/v1"
DATA_FILE = Path(__file__).parent.parent / "website" / "cultural-map-redesign" / "data.json"

# Rate limiting configuration
BASE_DELAY_MS = 150  # Base delay between requests
MAX_JITTER_MS = 50   # Maximum random jitter (0-50ms)
INITIAL_BACKOFF_MS = 100  # Start backoff at 100ms
MAX_BACKOFF_S = 5.0  # Maximum backoff delay
MAX_RETRIES = 5      # Maximum retry attempts for 429 errors


def find_place_id(name: str, address: Optional[str], city: str) -> Optional[str]:
    """
    Find Place ID using Text Search API.

    Args:
        name: Venue name
        address: Street address (can be None for trails/monuments)
        city: City name

    Returns:
        Place ID string or None if not found
    """
    if not API_KEY:
        raise ValueError("GOOGLE_PLACES_API_KEY environment variable not set")

    # Skip if no address (trails, monuments)
    if not address or address.strip() == "":
        return None

    # Construct search query
    query = f"{name}, {address}, {city}, CA"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName"
    }

    payload = {"textQuery": query}

    try:
        response = requests.post(
            f"{BASE_URL}/places:searchText",
            headers=headers,
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        data = response.json()

        if "places" in data and len(data["places"]) > 0:
            return data["places"][0]["id"]

        return None

    except requests.exceptions.RequestException as e:
        print(f"  Error searching for Place ID: {e}")
        return None


def fetch_hours(place_id: str) -> Optional[List[str]]:
    """
    Fetch opening hours using Place Details API.

    Args:
        place_id: Google Place ID

    Returns:
        Array of weekday description strings or None if not available
    """
    if not API_KEY:
        raise ValueError("GOOGLE_PLACES_API_KEY environment variable not set")

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "regularOpeningHours"
    }

    try:
        response = requests.get(
            f"{BASE_URL}/places/{place_id}",
            headers=headers,
            timeout=10
        )
        response.raise_for_status()
        data = response.json()

        # Extract weekdayDescriptions array
        hours_data = data.get("regularOpeningHours", {})
        if "weekdayDescriptions" in hours_data:
            return hours_data["weekdayDescriptions"]

        return None

    except requests.exceptions.RequestException as e:
        print(f"  Error fetching hours: {e}")
        return None


def process_venue(venue: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process a single venue: find Place ID and fetch hours.

    Args:
        venue: Asset object with keys: n (name), a (address), c (city), etc.

    Returns:
        Updated venue object with pid and h fields added
    """
    name = venue.get("n", "Unknown")
    address = venue.get("a", "")
    city = venue.get("c", "")

    # Step 1: Find Place ID
    place_id = find_place_id(name, address, city)

    if not place_id:
        # No Place ID found - trails, monuments, closed businesses, or not in Google
        venue["pid"] = None
        venue["h"] = None
        print(f"  [!] No Place ID found")
        return venue

    venue["pid"] = place_id
    print(f"  [OK] Place ID: {place_id}")

    # Step 2: Fetch hours
    hours = fetch_hours(place_id)

    if hours:
        venue["h"] = hours
        print(f"  [OK] Hours: {len(hours)} days")
    else:
        venue["h"] = None
        print(f"  [!] No hours data")

    return venue


def process_venues_with_backoff(venues: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Process all venues with rate limiting and retry logic.

    Args:
        venues: List of venue objects

    Returns:
        List of updated venue objects with hours data
    """
    results = []
    total = len(venues)

    print(f"\nProcessing {total} venues...")
    print(f"Rate limiting: {BASE_DELAY_MS}ms base delay + {MAX_JITTER_MS}ms jitter")
    print(f"Retries: {MAX_RETRIES} attempts with exponential backoff\n")

    for i, venue in enumerate(venues, 1):
        name = venue.get("n", "Unknown")
        print(f"[{i}/{total}] {name}")

        retries = 0
        backoff = INITIAL_BACKOFF_MS / 1000.0  # Convert to seconds

        while retries < MAX_RETRIES:
            try:
                # Process venue
                result = process_venue(venue)
                results.append(result)

                # Log progress every 50 venues
                if i % 50 == 0:
                    print(f"\n--- Progress: {i}/{total} venues processed ({i/total*100:.1f}%) ---\n")

                # Rate limiting: base delay + jitter
                jitter = random.uniform(0, MAX_JITTER_MS / 1000.0)
                delay = (BASE_DELAY_MS / 1000.0) + jitter
                time.sleep(delay)

                break  # Success, move to next venue

            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:
                    # Rate limit error - retry with exponential backoff
                    retries += 1
                    print(f"  [!] Rate limited (429). Retry {retries}/{MAX_RETRIES} after {backoff:.2f}s")
                    time.sleep(backoff)
                    backoff = min(backoff * 2, MAX_BACKOFF_S)
                else:
                    # Non-rate-limit error - log and skip
                    print(f"  [X] HTTP error {e.response.status_code}: {e}")
                    venue["pid"] = None
                    venue["h"] = None
                    results.append(venue)
                    break

            except Exception as e:
                # Unexpected error - log and skip
                print(f"  [X] Unexpected error: {e}")
                venue["pid"] = None
                venue["h"] = None
                results.append(venue)
                break

        if retries >= MAX_RETRIES:
            # Max retries exceeded - skip this venue
            print(f"  [X] Max retries exceeded, skipping")
            venue["pid"] = None
            venue["h"] = None
            results.append(venue)

    print(f"\n[OK] Completed processing {total} venues\n")
    return results


def test_api_key() -> bool:
    """
    Test if API key is valid by making a simple request.

    Returns:
        True if API key works, False otherwise
    """
    if not API_KEY:
        print("[X] GOOGLE_PLACES_API_KEY environment variable not set")
        return False

    print("Testing API key...")

    # Test with a known place (North Star House)
    test_place_id = find_place_id("North Star House", "109 Harris Street", "Grass Valley")

    if test_place_id:
        print(f"[OK] API key valid (test Place ID: {test_place_id})")
        return True
    else:
        print("[X] API key test failed (could not find test venue)")
        return False


def main():
    """Main execution function."""

    # Handle --test-api flag
    if len(sys.argv) > 1 and sys.argv[1] == "--test-api":
        success = test_api_key()
        sys.exit(0 if success else 1)

    # Check API key
    if not API_KEY:
        print("\n[X] Error: GOOGLE_PLACES_API_KEY environment variable not set")
        print("\nTo configure:")
        print("  1. Copy .env.example to .env")
        print("  2. Add your Google Places API key to .env")
        print("  3. Run: python scripts/fetch-hours.py\n")
        sys.exit(1)

    # Load existing data.json
    print(f"Loading data from: {DATA_FILE}")

    if not DATA_FILE.exists():
        print(f"\n[X] Error: {DATA_FILE} not found")
        sys.exit(1)

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            venues = json.load(f)
    except json.JSONDecodeError as e:
        print(f"\n[X] Error: Invalid JSON in {DATA_FILE}: {e}")
        sys.exit(1)

    print(f"[OK] Loaded {len(venues)} venues\n")

    # Process venues with rate limiting
    updated_venues = process_venues_with_backoff(venues)

    # Count results
    with_hours = sum(1 for v in updated_venues if v.get("h") is not None)
    with_place_id = sum(1 for v in updated_venues if v.get("pid") is not None)

    print(f"Results:")
    print(f"  Total venues: {len(updated_venues)}")
    print(f"  With Place ID: {with_place_id} ({with_place_id/len(updated_venues)*100:.1f}%)")
    print(f"  With hours: {with_hours} ({with_hours/len(updated_venues)*100:.1f}%)")
    print(f"  Without hours: {len(updated_venues) - with_hours}")

    # Write updated data back to data.json
    print(f"\nWriting updated data to: {DATA_FILE}")

    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(updated_venues, f, ensure_ascii=False, separators=(',', ':'))
        print("[OK] Data file updated successfully\n")
    except Exception as e:
        print(f"\n[X] Error writing data file: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
