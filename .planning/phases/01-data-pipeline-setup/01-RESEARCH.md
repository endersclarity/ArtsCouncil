# Phase 1: Data Pipeline Setup - Research

**Researched:** 2026-02-08
**Domain:** Google Places API, GitHub Actions automation, data pipeline architecture
**Confidence:** HIGH

## Summary

Phase 1 establishes a data pipeline to fetch hours of operation for 687 cultural assets using Google Places API (New), store them in the existing data.json file, and set up automated refresh via GitHub Actions.

The standard approach uses Google's new Places API (the legacy API can no longer be enabled) with a two-step process: (1) Text Search to resolve Place IDs from name/address, (2) Place Details to fetch opening hours. The opening_hours fields (`regularOpeningHours`, `currentOpeningHours`) are part of the Enterprise SKU tier, costing $20 per 1,000 requests after the first 1,000 free requests per month.

For 687 assets, the one-time cost is approximately $13.60 (after 1,000 free tier). Rate limiting requires 150ms delays between requests (avoid synchronized bursts) with exponential backoff for failures. GitHub Actions workflows can run on a schedule and auto-commit updated data using `stefanzweifel/git-auto-commit-action@v5`.

**Primary recommendation:** Use Google Places API (New) with Python script for data fetching, store hours in compact format in data.json, and set up GitHub Actions with weekly cron schedule for future updates.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Google Places API (New) | v1 | Fetch place hours, IDs, metadata | Current version, legacy API disabled for new projects |
| Python requests | 2.31+ | HTTP client for API calls | Industry standard, built-in retry support, simple API |
| GitHub Actions | v3/v4 | CI/CD automation, cron scheduling | Free for public repos, native git integration |
| Node.js | 18+ LTS | Runtime for client-side hours parsing | Already used in project, CDN-friendly for Luxon |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Luxon | 3.7.2 | Client-side date/time parsing | Pacific timezone hours logic (Phase 2) |
| stefanzweifel/git-auto-commit-action | v5 | Auto-commit changed files in workflows | GitHub Actions data refresh automation |
| python-dotenv | 1.0+ | Environment variable loading for local dev | Testing scripts locally before GitHub Actions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Places API (New) | Places API (Legacy) | Legacy can't be enabled for new projects, deprecated |
| Python script | Node.js script | Python already used in google-tools skill, requests library simpler than axios |
| GitHub Actions | Vercel cron jobs | Vercel cron requires Vercel Pro ($20/mo), GitHub Actions free |
| Luxon | date-fns, Moment.js | Moment.js deprecated, date-fns doesn't handle timezones as well |

**Installation:**

For data fetching script (Python):
```bash
pip install requests python-dotenv
```

For client-side hours parsing (Phase 2, loaded via CDN):
```html
<script src="https://cdn.jsdelivr.net/npm/luxon@3.7.2/build/global/luxon.min.js"></script>
```

## Architecture Patterns

### Recommended Project Structure
```
ArtsCouncil/
├── scripts/
│   └── fetch-hours.py          # One-time/scheduled hours fetch
├── .github/
│   └── workflows/
│       └── refresh-hours.yml   # Weekly cron job
├── website/cultural-map-redesign/
│   ├── data.json               # Cultural assets with hours (`h`, `pid` fields)
│   └── index-maplibre.html     # Client-side hours parsing (Phase 2)
└── .planning/
    └── phases/01-data-pipeline-setup/
```

### Pattern 1: Two-Step Place Resolution
**What:** Resolve Place ID from name/address, then fetch hours using Place ID
**When to use:** When you have venue name/address but not Place ID (initial fetch)
**Example:**
```python
# Source: https://developers.google.com/maps/documentation/places/web-service/text-search
import requests

API_KEY = "your_key"
BASE_URL = "https://places.googleapis.com/v1"

# Step 1: Text Search to find Place ID
def find_place_id(name, address, city):
    """Search for place by name and address to get Place ID."""
    query = f"{name}, {address}, {city}, CA"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName"
    }
    payload = {"textQuery": query}

    response = requests.post(f"{BASE_URL}/places:searchText",
                             headers=headers, json=payload)
    data = response.json()

    if "places" in data and len(data["places"]) > 0:
        return data["places"][0]["id"]
    return None

# Step 2: Place Details to fetch hours
def fetch_hours(place_id):
    """Fetch opening hours for a Place ID."""
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "regularOpeningHours"
    }

    response = requests.get(f"{BASE_URL}/places/{place_id}", headers=headers)
    data = response.json()

    return data.get("regularOpeningHours", {})
```

### Pattern 2: Rate-Limited Batch Processing
**What:** Process 687 venues with delays and exponential backoff
**When to use:** Bulk API operations to avoid rate limits and DDoS detection
**Example:**
```python
# Source: https://developers.google.com/maps/documentation/places/web-service/web-services-best-practices
import time
import random

def process_venues_with_backoff(venues, process_fn, delay_ms=150):
    """Process venues with rate limiting and retry logic."""
    results = []

    for i, venue in enumerate(venues):
        retries = 0
        max_retries = 5
        backoff = 0.1  # Start with 100ms

        while retries < max_retries:
            try:
                result = process_fn(venue)
                results.append(result)

                # Add base delay between requests (avoid synchronized bursts)
                # Add jitter to prevent thundering herd
                jitter = random.uniform(0, 0.05)  # 0-50ms jitter
                time.sleep((delay_ms / 1000) + jitter)
                break

            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:  # Rate limit
                    retries += 1
                    time.sleep(backoff)
                    backoff = min(backoff * 2, 5.0)  # Max 5 sec
                else:
                    # Non-rate-limit error, log and skip
                    results.append({"error": str(e), "venue": venue})
                    break

    return results
```

### Pattern 3: GitHub Actions Scheduled Data Refresh
**What:** Weekly cron job to refresh hours data and auto-commit changes
**When to use:** Automated data updates without manual intervention
**Example:**
```yaml
# Source: https://github.com/stefanzweifel/git-auto-commit-action
name: Refresh Hours Data

on:
  schedule:
    - cron: '0 8 * * 1'  # Every Monday at 8 AM UTC (midnight PT)
  workflow_dispatch:  # Manual trigger

jobs:
  refresh-hours:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # Required for git-auto-commit-action

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install requests python-dotenv

      - name: Fetch hours data
        env:
          GOOGLE_PLACES_API_KEY: ${{ secrets.GOOGLE_PLACES_API_KEY }}
        run: |
          python scripts/fetch-hours.py

      - name: Commit updated data
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: refresh hours data (automated)"
          file_pattern: "website/cultural-map-redesign/data.json"
```

### Anti-Patterns to Avoid
- **Synchronized requests**: Don't loop through all 687 venues without delays. Google's DDoS detection will block you.
- **Missing field masks**: Always specify `X-Goog-FieldMask` header. Without it, you get an error, and wildcard `*` is expensive.
- **Legacy API usage**: Places API (Legacy) can't be enabled for new projects. Don't use `/maps/api/place/details/json` endpoints.
- **Hardcoded API keys**: Never commit API keys to git. Use GitHub Secrets and HTTP referrer restrictions.
- **Ignoring 429 errors**: Implement exponential backoff. Simple retries will get you rate-limited again immediately.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date/time parsing in browser | Custom regex for "Mon-Fri 9am-5pm" | Luxon with Pacific timezone | Edge cases: DST transitions, 24-hour format, irregular hours, "Closed", special holidays |
| GitHub Actions auto-commit | Custom git commands in workflow | stefanzweifel/git-auto-commit-action@v5 | Handles edge cases: nothing changed, merge conflicts, permissions, commit signing |
| API retry logic | Simple `for` loop with `time.sleep()` | Exponential backoff with jitter | Prevents thundering herd problem, respects rate limits, avoids synchronized bursts |
| Place ID lookup caching | Custom JSON file with name → Place ID | Google's Place ID is stable (store in data.json) | Place IDs rarely change, one-time lookup sufficient, no need for separate cache file |

**Key insight:** Hours of operation parsing has more complexity than it appears. "Open 24 hours", "Closed", "Mon-Fri 9-5, Sat 10-3, Sun Closed", holiday hours, DST transitions, and irregular schedules require robust parsing. Luxon handles this with timezone-aware logic, while hand-rolled regex will break on edge cases.

## Common Pitfalls

### Pitfall 1: Cost Explosion from Wrong SKU Tier
**What goes wrong:** Requesting `regularOpeningHours` triggers Enterprise SKU ($20/1k after free tier). If you also request fields from Enterprise + Atmosphere tier (like `accessibilityOptions`), you get billed at the highest tier.
**Why it happens:** Google bills at the **highest SKU applicable** to your request. Adding one field from a higher tier increases cost for the entire request.
**How to avoid:** Only request fields you need. For hours, use `regularOpeningHours` only (Enterprise tier). Check [field pricing](https://developers.google.com/maps/documentation/places/web-service/data-fields) before adding fields.
**Warning signs:** API bill higher than expected, multiple SKU charges for single request.

### Pitfall 2: Place ID Resolution Failures
**What goes wrong:** Text Search returns wrong place or no results for 20-30% of venues (different business names, moved locations, closed businesses).
**Why it happens:** Google Places data is crowdsourced. Business names in your data may differ from Google's records ("North Star Historic Conservancy" vs "North Star House Museum").
**How to avoid:**
- Log failed Place ID resolutions for manual review
- Use address as primary search key, not name
- Accept that some venues won't have hours (trails, monuments, closed businesses)
- Implement graceful fallback: if Place ID not found, store `null` for `pid` and `h` fields
**Warning signs:** High percentage of "no results" (>30%), hours data for wrong venues.

### Pitfall 3: GitHub Actions Rate Limits on Free Tier
**What goes wrong:** Workflow times out or gets rate-limited when processing 687 venues in one run.
**Why it happens:** GitHub Actions free tier has 2,000 minutes/month limit for private repos. Public repos have unlimited minutes, but 6-hour job timeout.
**How to avoid:**
- Use public repo (unlimited minutes)
- Process venues in batches with checkpoints (save progress, resume on failure)
- Add `timeout-minutes: 60` to job config (fail fast if stuck)
- Use `workflow_dispatch` for manual testing before enabling cron
**Warning signs:** Workflow runs >30 minutes for 687 venues, timeout errors.

### Pitfall 4: Stale Hours Data in Client
**What goes wrong:** Website shows "Open Now" for a venue that's actually closed because hours data is 1 week old and business changed hours.
**Why it happens:** One-time fetch means hours can drift over time. No real-time validation.
**How to avoid:**
- Set user expectation: add disclaimer "Hours provided by Google Places, may not reflect recent changes"
- Refresh hours weekly via GitHub Actions cron (Monday mornings before weekend tourism)
- Phase 2 client logic should handle missing/null hours gracefully
- Consider 30-day cache compliance: Google Terms require refreshing Place Details data every 30 days
**Warning signs:** User reports of incorrect "Open Now" status, complaints about stale hours.

### Pitfall 5: Data.json Size Bloat
**What goes wrong:** Adding hours data increases data.json from 280KB to 400KB+, slowing page load.
**Why it happens:** `regularOpeningHours` response includes verbose JSON structure (`weekdayDescriptions` array with 7 strings like "Monday: 9:00 AM - 5:00 PM").
**How to avoid:**
- Store only `weekdayDescriptions` array (compact format, human-readable)
- Don't store full `regularOpeningHours` object (includes redundant `periods` array with structured data)
- Compress format in data.json: use single-letter keys (`h` for hours, `pid` for place_id)
- Estimated size: 687 venues × ~150 bytes per hours string = ~100KB increase (acceptable)
**Warning signs:** data.json >500KB, slower page load on mobile.

## Code Examples

Verified patterns from official sources:

### Compact Hours Format for data.json
```javascript
// Source: Existing data.json structure (single-letter keys)
{
  "n": "1849 Brewing Company",
  "a": "468 Sutton Wy",
  "c": "Grass Valley",
  "l": "Eat, Drink & Stay",
  "x": -121.036218982724,
  "y": 39.2324595163263,
  "pid": "ChIJXxxxx",  // NEW: Place ID from Text Search
  "h": [               // NEW: Hours array from regularOpeningHours.weekdayDescriptions
    "Monday: 11:00 AM – 9:00 PM",
    "Tuesday: 11:00 AM – 9:00 PM",
    "Wednesday: 11:00 AM – 9:00 PM",
    "Thursday: 11:00 AM – 9:00 PM",
    "Friday: 11:00 AM – 10:00 PM",
    "Saturday: 11:00 AM – 10:00 PM",
    "Sunday: 11:00 AM – 9:00 PM"
  ]
}
```

### Handling Missing/Null Hours (Graceful Fallback)
```python
# Source: https://developers.google.com/maps/documentation/places/web-service/place-details
def fetch_and_store_hours(venue):
    """Fetch hours for venue with graceful fallback."""
    place_id = find_place_id(venue["n"], venue["a"], venue["c"])

    if not place_id:
        # No Place ID found - trails, monuments, closed businesses
        venue["pid"] = None
        venue["h"] = None
        return venue

    venue["pid"] = place_id

    try:
        hours_data = fetch_hours(place_id)
        if hours_data and "weekdayDescriptions" in hours_data:
            venue["h"] = hours_data["weekdayDescriptions"]
        else:
            # Place exists but has no hours (24/7 or irregular)
            venue["h"] = None
    except Exception as e:
        # API error - log and continue
        print(f"Error fetching hours for {venue['n']}: {e}")
        venue["h"] = None

    return venue
```

### Client-Side Hours Parsing with Luxon (Phase 2)
```javascript
// Source: https://moment.github.io/luxon/api-docs/index.html
// Load via CDN: <script src="https://cdn.jsdelivr.net/npm/luxon@3.7.2/build/global/luxon.min.js"></script>

function isOpenNow(hoursArray) {
  if (!hoursArray || hoursArray.length !== 7) {
    return null;  // No hours data or invalid format
  }

  // Get current time in Pacific timezone
  const now = luxon.DateTime.now().setZone("America/Los_Angeles");
  const dayOfWeek = now.weekday % 7;  // Luxon: Mon=1, Sun=7; Google: Sun=0, Sat=6
  const todayHours = hoursArray[dayOfWeek];

  // Parse hours string: "Monday: 11:00 AM – 9:00 PM"
  const match = todayHours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/);
  if (!match) {
    // Handle "Closed" or "Open 24 hours"
    if (todayHours.includes("Closed")) return false;
    if (todayHours.includes("Open 24 hours")) return true;
    return null;  // Unparseable format
  }

  // Convert to 24-hour time
  let [_, openHr, openMin, openPeriod, closeHr, closeMin, closePeriod] = match;
  openHr = parseInt(openHr) + (openPeriod === "PM" && openHr !== "12" ? 12 : 0);
  closeHr = parseInt(closeHr) + (closePeriod === "PM" && closeHr !== "12" ? 12 : 0);

  const openTime = now.set({ hour: openHr, minute: parseInt(openMin), second: 0 });
  const closeTime = now.set({ hour: closeHr, minute: parseInt(closeMin), second: 0 });

  return now >= openTime && now <= closeTime;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Places API (Legacy) | Places API (New) | 2024 | Legacy can't be enabled for new projects, new API has better hours data (`currentOpeningHours` with special hours) |
| Moment.js for dates | Luxon | 2020 | Moment.js in maintenance mode, Luxon is modern, immutable, smaller bundle |
| Manual git commits in workflows | git-auto-commit-action | 2021 | Handles edge cases (no changes, permissions), widely adopted (100k+ uses) |
| `/maps/api/place/details/json` (GET with query params) | `/places/v1/places/{id}` (GET with headers) | 2024 | New API uses headers for auth (`X-Goog-Api-Key`) and field mask, cleaner design |

**Deprecated/outdated:**
- **Places API (Legacy)**: Can't be enabled for new projects. Migrate to Places API (New).
- **`opening_hours.open_now` field**: Deprecated in legacy API. Use `currentOpeningHours` in new API.
- **Moment.js**: In maintenance mode since 2020. Use Luxon or date-fns instead.

## Open Questions

Things that couldn't be fully resolved:

1. **Nevada County venue data quality on Google Places**
   - What we know: Text Search works for major venues (breweries, museums), may fail for small galleries or rural locations
   - What's unclear: Success rate for 687 Nevada County venues specifically (STATE.md mentions need for validation)
   - Recommendation: Run pilot fetch on 50-100 venues, measure Place ID resolution rate, manually review failures

2. **Actual API rate limits per minute**
   - What we know: Google docs say "rate limit per minute is per API method per project" but don't specify the number
   - What's unclear: Exact requests/minute limit for free tier vs paid tier
   - Recommendation: Use 150ms delays (400 req/min theoretical) with exponential backoff. Monitor for 429 errors in pilot run.

3. **GitHub Actions cron reliability**
   - What we know: Cron schedules can be delayed up to 15 minutes under high load on GitHub's infrastructure
   - What's unclear: How often delays occur for weekly Monday morning jobs
   - Recommendation: Use `workflow_dispatch` for manual testing, accept that cron may run 8:00-8:15 AM UTC (not critical for weekly refresh)

4. **30-day cache compliance enforcement**
   - What we know: Google Terms of Service require refreshing Place Details data every 30 days
   - What's unclear: Whether this is technically enforced (API blocks old data) or just contractual
   - Recommendation: Set GitHub Actions cron to weekly (safer than 30-day), monitor for API errors

## Sources

### Primary (HIGH confidence)
- [Google Places API Place Details (New)](https://developers.google.com/maps/documentation/places/web-service/place-details) - API request format, field masks, authentication
- [Google Places API Data Fields](https://developers.google.com/maps/documentation/places/web-service/data-fields) - Pricing tiers, opening hours fields, SKU categories
- [Google Places API Usage and Billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing) - Pricing ($20/1k for Enterprise SKU), rate limits
- [Google Maps Platform Pricing](https://developers.google.com/maps/billing-and-pricing/pricing) - Exact costs per 1,000 requests, free tier details (1,000 free)
- [GitHub Actions Workflow Syntax](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions) - Cron schedule syntax, job configuration
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/concepts/security/secrets) - Secret management, environment variables, security best practices
- [stefanzweifel/git-auto-commit-action](https://github.com/stefanzweifel/git-auto-commit-action) - Auto-commit workflow action, permissions setup
- [Luxon Documentation](https://moment.github.io/luxon/api-docs/index.html) - Timezone handling, date parsing, Pacific time

### Secondary (MEDIUM confidence)
- [Google Places API Best Practices](https://developers.google.com/maps/documentation/places/web-service/web-services-best-practices) - Exponential backoff, rate limiting, avoiding synchronized requests
- [Places API Text Search (New)](https://developers.google.com/maps/documentation/places/web-service/text-search) - Place ID lookup by name/address
- [How to Handle Time Zones using Luxon](https://www.thisdot.co/blog/how-to-handle-time-zones-using-datetime-and-luxon) - Pacific timezone setup, best practices
- [How to Handle API Rate Limits (2026 Guide)](https://apistatuscheck.com/blog/how-to-handle-api-rate-limits) - Exponential backoff patterns, jitter, throttling

### Tertiary (LOW confidence)
- [SafeGraph: Google Places API Pricing Guide](https://www.safegraph.com/guides/google-places-api-pricing) - Third-party cost breakdown (2026), not authoritative
- [Radar: Google Maps API Cost Comparison](https://radar.com/blog/google-maps-api-cost) - General pricing trends, not specific to Places API hours fetch

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Google official docs, GitHub official docs, verified library versions
- Architecture: HIGH - Official code examples from Google and GitHub, established patterns from docs
- Pitfalls: MEDIUM - Based on best practices docs and common issues mentioned in Google forums, not tested on Nevada County data specifically
- Cost estimate: HIGH - Official Google pricing table ($20/1k for Enterprise SKU, 1,000 free/month)
- Rate limits: MEDIUM - Google docs confirm per-method rate limiting but don't specify exact numbers

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days - stable APIs, but pricing can change)
