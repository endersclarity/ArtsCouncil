# Phase 2: Tier 2 Events - Research

**Researched:** 2026-02-14
**Domain:** Event calendar aggregation, iCal/RSS parsing, fuzzy deduplication, client-side multi-source rendering
**Confidence:** MEDIUM

## Summary

Phase 2 aggregates events from three sources -- Trumba RSS (existing), Nevada County Library LibCal (iCal), and CivicEngage municipal calendars (RSS) -- into a single `events-merged.json` file served alongside the existing `events.json`. The pipeline runs as a GitHub Actions cron job (matching the existing `refresh-hours.yml` pattern), normalizes all events to the existing canonical schema, deduplicates cross-source matches, and tags events with source attribution and family-friendliness.

The client-side changes are scoped: the events model gains a fallback loader (try merged JSON first, fall back to Trumba RSS), the view gains source badges and a family filter chip, and the existing filter/carousel/search modules remain untouched. The architecture already supports multiple event sources -- the `source_type` and `source_ref` fields exist in every event object, and the venue-matching pipeline in `build_event_index.py` is source-agnostic.

**Primary recommendation:** Build two new ingest scripts (`ingest_libcal_ical.py`, `ingest_civicengage_rss.py`) following the exact pattern of `ingest_trumba_rss.py`, a merge/dedup script that combines all three outputs, and a GitHub Actions workflow that runs daily and commits `events-merged.json`. Client changes are minimal -- source badge rendering, one new filter chip, and a two-tier fetch in the events loader.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| icalendar | 6.3.x | Parse LibCal iCal feeds (.ics) | Already installed; mature RFC 5545 parser; handles RRULE, timezones |
| feedparser | 6.0.x | Parse CivicEngage RSS feeds | Already installed; universal RSS/Atom parser |
| requests | 2.32.x | HTTP fetch for all feeds | Already installed; used by existing scripts |
| rapidfuzz | latest | Fuzzy title matching for cross-source dedup | C++ backend, 5-100x faster than fuzzywuzzy; MIT licensed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| python-dateutil | latest | Robust date parsing for RSS date formats | Only if CivicEngage RSS dates don't parse with stdlib |
| zoneinfo (stdlib) | 3.12+ | Timezone handling | Already used in `ingest_trumba_rss.py` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| icalendar | ics-py | ics-py is more Pythonic but less battle-tested; icalendar already installed |
| rapidfuzz | difflib (stdlib) | difflib is slower and less accurate for short strings; rapidfuzz worth the dep |
| GitHub Actions cron | Vercel cron | Vercel Hobby limits to 1/day, needs serverless function; GH Actions already proven in this repo |

**Installation:**
```bash
pip install rapidfuzz
# icalendar, feedparser, requests already in environment
```

**requirements.txt update:**
```
requests>=2.31.0
python-dotenv>=1.0.0
icalendar>=6.0.0
feedparser>=6.0.0
rapidfuzz>=3.0.0
```

## Architecture Patterns

### Recommended Project Structure
```
scripts/events/
  ingest_trumba_rss.py          # EXISTING - Trumba RSS -> events.json
  ingest_libcal_ical.py         # NEW - LibCal iCal -> events-libcal.json
  ingest_civicengage_rss.py     # NEW - CivicEngage RSS -> events-civicengage.json
  merge_events.py               # NEW - Combine + dedup + classify -> events-merged.json
  build_event_index.py          # EXISTING - Venue matching (runs on merged output)
  validate_events.py            # EXISTING - Schema validation
  venue_aliases.json            # EXISTING - Manual venue name mappings
  family_keywords.json          # NEW - Family/kids classification keywords
  reports/                      # EXISTING - Match reports

website/cultural-map-redesign/
  events.json                   # EXISTING - Trumba only (kept as fallback)
  events-merged.json            # NEW - All sources combined
  events.index.json             # EXISTING - Venue match index (rebuilt from merged)
  index-maplibre-events-model.js    # MODIFIED - Add source/family fields to filtering
  index-maplibre-events-view.js     # MODIFIED - Source badges in card HTML
  index-maplibre-events-filter-ui.js # MODIFIED - Family filter chip

.github/workflows/
  refresh-hours.yml             # EXISTING - Weekly hours refresh
  refresh-events.yml            # NEW - Daily event aggregation
```

### Pattern 1: Ingest Script Convention
**What:** Each source gets its own ingest script that outputs the same canonical schema
**When to use:** Always -- one script per source, shared output format
**Example:**
```python
# Each ingest script outputs events in this canonical schema:
{
    "event_id": "libcal-14015157",        # source-prefixed unique ID
    "title": "Stay & Play",
    "start_iso": "2026-01-14T18:00:00-08:00",
    "end_iso": "2026-01-14T19:30:00-08:00",
    "timezone": "America/Los_Angeles",
    "venue_name": "Madelyn Helling Library",
    "venue_city": "Nevada City",
    "source_type": "ical",                 # NEW: "feed" | "ical" | "rss"
    "source_ref": "https://nevadacountyca.libcal.com/...",
    "source_label": "Nevada County Library", # NEW: human-readable source name
    "last_verified_at": "2026-02-14T...",
    "ticket_url": "https://nevadacountyca.libcal.com/event/14015157",
    "tags": ["Children", "Family"],
    "description": "Caregivers and their little ones...",
    "is_family": true                      # NEW: family classifier output
}
```

### Pattern 2: Merge + Dedup Pipeline
**What:** A merge script reads all per-source JSON files, deduplicates, and writes a single merged output
**When to use:** After all ingest scripts run
**Example:**
```python
# merge_events.py pseudocode:
# 1. Load events-trumba.json, events-libcal.json, events-civicengage.json
# 2. For each pair of events across sources:
#    - Normalize titles (lowercase, strip punctuation)
#    - Compare: same date + rapidfuzz.fuzz.token_sort_ratio(title_a, title_b) >= 85
#    - If match: keep the one with richer data, tag with all source_refs
# 3. Tag family events using keyword classifier
# 4. Write events-merged.json
```

### Pattern 3: Client Fallback Loading
**What:** Try loading `events-merged.json` first; if 404 or parse error, fall back to `events.json` + Trumba RSS
**When to use:** In the main data loading Promise.all
**Example:**
```javascript
// In index-maplibre.js data loading:
function loadEvents() {
  return fetch('events-merged.json')
    .then(function(r) { return r.ok ? r.json() : Promise.reject('no merged'); })
    .catch(function() {
      // Fallback to existing Trumba-only events
      return fetch('events.json').then(function(r) { return r.json(); });
    });
}
```

### Anti-Patterns to Avoid
- **Fetching iCal at runtime in the browser:** iCal feeds are not CORS-friendly and parsing is heavy. Always pre-process server-side.
- **Deduplicating in the browser:** Fuzzy matching is CPU-intensive. Do it in the build pipeline, not at page load.
- **Replacing events.json:** Keep the existing Trumba-only file as the fallback. `events-merged.json` is additive.
- **Hardcoding source URLs in client JS:** All source configuration belongs in the pipeline scripts, not the frontend.

## Data Sources - Verified Access

### Source 1: Trumba RSS (EXISTING)
- **URL:** `https://www.trumba.com/calendars/nevada-county-arts-council.rss`
- **Format:** RSS 2.0 with `x-trumba` namespace extensions
- **Status:** Working, 155 events currently in pipeline
- **Confidence:** HIGH - production-proven

### Source 2: Nevada County Library LibCal (NEW)
- **URL:** `https://nevadacountyca.libcal.com/ical_subscribe.php?src=p&cid=20247`
- **Format:** iCalendar (.ics) with VEVENT entries
- **Status:** VERIFIED WORKING - returns valid iCal data with dozens of events (storytimes, book clubs, STEM activities, tech help, conversation groups across all branch locations)
- **Calendar ID:** `20247` (main public events calendar)
- **Confidence:** HIGH - fetched and confirmed iCal data on 2026-02-14
- **Notes:**
  - Events include LOCATION field with branch names (Truckee Library, Madelyn Helling Library, etc.)
  - Events include DESCRIPTION with age ranges and program details
  - Many events are recurring (RRULE present) -- must expand recurrences within the fetch window
  - No authentication required for public calendar subscription

### Source 3: CivicEngage Municipal RSS (NEW)
- **URLs confirmed:**
  - Nevada County (all calendars): `https://nevadacountyca.gov/RSSFeed.aspx?ModID=58&CID=All-calendar.xml`
  - Nevada County Library-specific: `https://nevadacountyca.gov/RSSFeed.aspx?ModID=58&CID=Library-Grass-Valley-45`
  - Nevada County Library Kids: `https://nevadacountyca.gov/RSSFeed.aspx?ModID=58&CID=Library-Kids-Teens-81`
  - Nevada City Events: `https://www.nevadacityca.gov/RSSFeed.aspx?ModID=58&CID=Events-Calendar-24`
- **Format:** RSS 2.0 with `calendarEvent` namespace for structured date/time/location
- **Status:** VERIFIED WORKING - returns RSS with structured event items
- **Confidence:** HIGH - fetched and confirmed RSS data on 2026-02-14
- **Notes:**
  - Nevada County calendar is mostly government meetings (Board of Supervisors, Planning Commission, etc.) -- may have limited cultural value
  - Nevada City Events calendar has municipal events (closures, community events)
  - Library-specific sub-calendars overlap with LibCal -- dedup critical
  - Events include structured fields: date, time, location via custom XML namespace
  - Currently only 11 events in the all-calendars feed (low volume)

### Source Assessment
| Source | Est. Events/Month | Cultural Relevance | Overlap Risk |
|--------|-------------------|-------------------|--------------|
| Trumba | 100-150 | HIGH (arts council curated) | Baseline |
| LibCal | 40-80 | MEDIUM-HIGH (library programs, storytimes, workshops) | LOW with Trumba, but HIGH with CivicEngage library calendars |
| CivicEngage (NC County) | 10-20 | LOW (mostly government meetings) | LOW |
| CivicEngage (NC City) | 5-10 | MEDIUM (community events, closures) | MEDIUM with Trumba |

**Recommendation:** Focus LibCal as the primary Tier 2 source (most cultural events). Include Nevada City CivicEngage events calendar. Skip the Nevada County government calendar (Board of Supervisors meetings are not cultural events). Consider adding a `source_filter` config to easily include/exclude feeds.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| iCal parsing | Custom VEVENT regex parser | `icalendar` library | RRULE expansion, timezone handling, multi-value properties are deceptively complex |
| Recurring event expansion | Manual date math for RRULE | `icalendar` + `dateutil.rrule` | RRULE spec has BYDAY, BYMONTH, EXDATE, UNTIL -- hundreds of edge cases |
| Fuzzy title matching | Levenshtein from scratch | `rapidfuzz.fuzz.token_sort_ratio` | Token sort handles word reordering ("Book Club at Library" vs "Library Book Club") |
| RSS date parsing | strptime patterns | `feedparser.entries[].published_parsed` | feedparser normalizes all RSS date formats automatically |
| Timezone conversion | Manual UTC offset math | `zoneinfo.ZoneInfo` + `datetime` | DST transitions, edge cases at boundaries |

**Key insight:** The existing `ingest_trumba_rss.py` (560 lines) demonstrates how much complexity lurks in event parsing -- venue inference, date parsing, image extraction, description cleanup. LibCal iCal will be simpler (structured fields) but CivicEngage RSS will need similar heuristics.

## Common Pitfalls

### Pitfall 1: RRULE Expansion Without Window Bounds
**What goes wrong:** LibCal events with `RRULE:FREQ=WEEKLY` expand to infinite occurrences
**Why it happens:** iCalendar recurrence rules describe patterns, not finite lists
**How to avoid:** Always pass a date window (now to now+14d) when expanding recurrences. Use `icalendar`'s `recurring_ical_events` or `dateutil.rrule` with `until` parameter.
**Warning signs:** Memory spike or thousands of events from a single VEVENT

### Pitfall 2: Timezone Mismatch Between Sources
**What goes wrong:** Trumba events are in `America/Los_Angeles`, iCal may use UTC or `US/Pacific`
**Why it happens:** Different calendar systems default to different timezone representations
**How to avoid:** Normalize ALL events to `America/Los_Angeles` with explicit offset in ISO strings. The existing schema already stores `timezone` field -- verify it on every event.
**Warning signs:** Events appearing at wrong times (off by 7-8 hours)

### Pitfall 3: Duplicate LibCal + CivicEngage Library Events
**What goes wrong:** Nevada County posts library events on BOTH LibCal AND the CivicEngage Library calendar
**Why it happens:** Separate systems maintained by different staff
**How to avoid:** Dedup cross-source with fuzzy title + same-day matching. Prioritize LibCal version (richer metadata, better descriptions).
**Warning signs:** Same storytime appearing twice with slightly different titles

### Pitfall 4: Stale Merged JSON After Pipeline Failure
**What goes wrong:** Pipeline fails silently, `events-merged.json` serves week-old events
**Why it happens:** GitHub Actions cron failure with no alerting
**How to avoid:** Include `generated_at` timestamp in merged JSON. Client checks age and falls back to Trumba RSS if stale (>48 hours). Pipeline step reports failure count.
**Warning signs:** `generated_at` significantly in the past

### Pitfall 5: Family Keyword False Positives
**What goes wrong:** "Children of the Gold Rush" exhibit tagged as family event
**Why it happens:** Naive keyword matching on "children"
**How to avoid:** Use compound patterns: "for kids", "ages 0-5", "family-friendly", "all ages", "storytime", "children's". Check against negative patterns: "children of", "children in".
**Warning signs:** History lectures and art exhibits appearing in Family filter

### Pitfall 6: Breaking Existing Event Card Rendering
**What goes wrong:** Adding `source_label` or `is_family` fields breaks existing view code
**Why it happens:** View code may not handle undefined fields gracefully
**How to avoid:** All new fields are additive (undefined is fine). Source badge rendering uses `event.source_label ? ... : ''` pattern. Family tag uses `event.is_family === true` strict check.
**Warning signs:** Blank cards, missing badges, JS errors in console

## Code Examples

### iCal Parsing with icalendar
```python
# Source: icalendar docs + verified against LibCal feed
from icalendar import Calendar
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import requests

def fetch_libcal_events(url, tz_name="America/Los_Angeles", window_days=14):
    tz = ZoneInfo(tz_name)
    now = datetime.now(tz)
    window_end = now + timedelta(days=window_days)

    response = requests.get(url, timeout=30)
    response.raise_for_status()
    cal = Calendar.from_ical(response.content)

    events = []
    for component in cal.walk('VEVENT'):
        dtstart = component.get('dtstart').dt
        dtend = component.get('dtend')
        dtend = dtend.dt if dtend else dtstart + timedelta(hours=2)

        # Handle date-only (all-day) vs datetime
        if not hasattr(dtstart, 'hour'):
            dtstart = datetime.combine(dtstart, datetime.min.time(), tzinfo=tz)
            dtend = datetime.combine(dtend, datetime.min.time(), tzinfo=tz)

        # Ensure timezone-aware
        if dtstart.tzinfo is None:
            dtstart = dtstart.replace(tzinfo=tz)
        if dtend.tzinfo is None:
            dtend = dtend.replace(tzinfo=tz)

        # Convert to target timezone
        dtstart = dtstart.astimezone(tz)
        dtend = dtend.astimezone(tz)

        # Window filter
        if dtstart < now or dtstart > window_end:
            continue

        summary = str(component.get('summary', 'Untitled'))
        location = str(component.get('location', ''))
        description = str(component.get('description', ''))
        uid = str(component.get('uid', ''))

        events.append({
            "event_id": f"libcal-{uid}" if uid else f"libcal-{dtstart.strftime('%Y%m%d%H%M')}-{summary[:30]}",
            "title": summary,
            "start_iso": dtstart.isoformat(timespec="seconds"),
            "end_iso": dtend.isoformat(timespec="seconds"),
            "timezone": tz_name,
            "venue_name": location.split(',')[0].strip() if location else "Nevada County Library",
            "venue_city": infer_city_from_location(location),
            "source_type": "ical",
            "source_ref": url,
            "source_label": "Nevada County Library",
            "last_verified_at": now.isoformat(timespec="seconds"),
            "description": description[:500] if description else None,
        })

    events.sort(key=lambda e: (e["start_iso"], e["event_id"]))
    return events
```

### CivicEngage RSS Parsing with feedparser
```python
# Source: feedparser docs + verified CivicEngage RSS structure
import feedparser
from datetime import datetime
from zoneinfo import ZoneInfo

def fetch_civicengage_events(url, source_label, tz_name="America/Los_Angeles", window_days=14):
    tz = ZoneInfo(tz_name)
    now = datetime.now(tz)

    feed = feedparser.parse(url)
    events = []

    for entry in feed.entries:
        title = entry.get('title', '').strip()
        if not title:
            continue

        # CivicEngage includes calendarEvent namespace fields
        # These appear as entry keys with the namespace prefix
        link = entry.get('link', '')
        description = entry.get('summary', '')

        # Parse date from published or custom calendar fields
        published = entry.get('published_parsed')
        if published:
            start_dt = datetime(*published[:6], tzinfo=tz)
        else:
            continue

        event_id = f"civic-{start_dt.strftime('%Y%m%d')}-{title[:30].lower().replace(' ', '-')}"

        events.append({
            "event_id": event_id,
            "title": title,
            "start_iso": start_dt.isoformat(timespec="seconds"),
            "end_iso": (start_dt + timedelta(hours=2)).isoformat(timespec="seconds"),
            "timezone": tz_name,
            "venue_name": "TBD",  # Extract from description or custom fields
            "source_type": "rss",
            "source_ref": url,
            "source_label": source_label,
            "last_verified_at": now.isoformat(timespec="seconds"),
            "ticket_url": link if link else None,
            "description": description[:500] if description else None,
        })

    return events
```

### Fuzzy Dedup Logic
```python
# Source: rapidfuzz docs
from rapidfuzz import fuzz
from datetime import datetime

def normalize_title(title):
    """Lowercase, strip articles, normalize whitespace."""
    t = title.lower().strip()
    for prefix in ('the ', 'a ', 'an '):
        if t.startswith(prefix):
            t = t[len(prefix):]
    return ' '.join(t.split())

def is_duplicate(event_a, event_b, title_threshold=85):
    """Two events are duplicates if same date + similar title."""
    date_a = event_a["start_iso"][:10]  # YYYY-MM-DD
    date_b = event_b["start_iso"][:10]

    if date_a != date_b:
        return False

    title_a = normalize_title(event_a["title"])
    title_b = normalize_title(event_b["title"])

    score = fuzz.token_sort_ratio(title_a, title_b)
    return score >= title_threshold

def dedup_across_sources(all_events, priority=("trumba", "libcal", "civic")):
    """Keep highest-priority source version of duplicate events."""
    # Group by date for efficiency
    by_date = {}
    for event in all_events:
        date_key = event["start_iso"][:10]
        by_date.setdefault(date_key, []).append(event)

    kept = []
    for date_key, day_events in by_date.items():
        used = [False] * len(day_events)
        for i, event_a in enumerate(day_events):
            if used[i]:
                continue
            cluster = [event_a]
            for j in range(i + 1, len(day_events)):
                if used[j]:
                    continue
                if is_duplicate(event_a, day_events[j]):
                    cluster.append(day_events[j])
                    used[j] = True
            used[i] = True
            # Pick best from cluster based on source priority
            cluster.sort(key=lambda e: priority.index(e["event_id"].split("-")[0]) if e["event_id"].split("-")[0] in priority else 99)
            winner = cluster[0]
            # Merge source labels from all duplicates
            all_sources = list(set(e.get("source_label", "") for e in cluster if e.get("source_label")))
            winner["source_labels"] = all_sources
            kept.append(winner)

    kept.sort(key=lambda e: (e["start_iso"], e["event_id"]))
    return kept
```

### Family Keyword Classifier
```python
# Source: domain knowledge from LibCal event descriptions
import re

FAMILY_POSITIVE = [
    r'\bstorytime\b', r'\bstory\s*time\b',
    r'\bfor\s+kids\b', r'\bfor\s+children\b', r'\bfor\s+families\b',
    r'\bfamily[\s-]friendly\b', r'\ball\s+ages\b',
    r'\bages?\s+\d+[\s-]+\d+\b',  # "ages 0-5", "age 3-12"
    r'\bchildren\'?s\s+(program|event|craft|activity)\b',
    r'\bkids?\s+(program|event|craft|activity|club)\b',
    r'\bteen\b', r'\btween\b', r'\bjunior\b',
    r'\blego\b', r'\bcraft\s*time\b', r'\bplay\s*group\b',
    r'\bstay\s*&?\s*play\b',
]

FAMILY_NEGATIVE = [
    r'\bchildren\s+of\b',           # "Children of the Gold Rush"
    r'\bfor\s+adults\s+only\b',
    r'\b21\+\b', r'\b18\+\b',
    r'\bbar\b.*\bnight\b',
]

def classify_family(event):
    """Return True if event is likely family-friendly."""
    text = f"{event.get('title', '')} {event.get('description', '')} {' '.join(event.get('tags', []))}".lower()

    for pattern in FAMILY_NEGATIVE:
        if re.search(pattern, text):
            return False

    for pattern in FAMILY_POSITIVE:
        if re.search(pattern, text):
            return True

    return False
```

### Client Source Badge HTML
```javascript
// Addition to getEventsCardsHTML in index-maplibre-events-view.js
var sourceLabel = event.source_label || '';
var sourceBadge = sourceLabel
  ? '<span class="map-event-badge source">From ' + escapeHTML(sourceLabel) + '</span>'
  : '';
// Insert in card meta section alongside existing badges
```

### Client Family Filter Chip
```html
<!-- Addition to events filter bar in HTML -->
<button class="map-events-chip" type="button" data-event-filter="family">Family & Kids</button>
```

```javascript
// Addition to getFilteredMapEvents in index-maplibre-events-model.js
if (eventDateFilter === 'family') {
  filtered = filtered.filter(function(event) {
    return event.is_family === true;
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Runtime RSS fetch only | Pre-built events.json via cron | Already implemented | Faster load, deterministic venue matching |
| Single source (Trumba) | Multi-source aggregation | This phase | 3x event coverage |
| No family filtering | Keyword classifier + filter chip | This phase | Family-friendly UX |

**Deprecated/outdated:**
- The existing `events.xml` runtime fetch path in the HTML is a legacy reference. The actual data loading uses `events.json` via fetch().

## Recurring Event Handling (RRULE)

LibCal events frequently use RRULE for recurring programs (weekly storytimes, monthly book clubs). The `icalendar` library parses RRULE but does NOT expand occurrences by default.

**Recommended approach:**
```bash
pip install recurring-ical-events
```

The `recurring-ical-events` package (MIT, well-maintained) takes a parsed `icalendar.Calendar` and a date range, returning all event occurrences within that range -- including RRULE expansion, EXDATE exclusions, and RDATE additions.

```python
import recurring_ical_events
# After parsing: cal = Calendar.from_ical(response.content)
events = recurring_ical_events.of(cal).between(start_date, end_date)
```

**Confidence:** MEDIUM -- library exists on PyPI but I have not verified the exact API against current version. Should validate during implementation.

## Open Questions

1. **CivicEngage RSS date parsing**
   - What we know: RSS items have a custom `calendarEvent` namespace with structured date/time fields
   - What's unclear: Exact XML element names within the namespace (need to inspect raw XML more carefully)
   - Recommendation: Parse one feed with feedparser, dump all entry keys to discover the schema

2. **LibCal recurring event volume**
   - What we know: Many library programs are weekly/biweekly recurring events
   - What's unclear: How many distinct VEVENTs vs how many expanded occurrences in a 14-day window
   - Recommendation: Run a test fetch and count. If >200 expanded events, consider limiting to major programs only.

3. **CivicEngage cultural event volume is low**
   - What we know: The "all calendars" RSS returned only 11 items, mostly government meetings
   - What's unclear: Whether Nevada City has more community-oriented events, or if CivicEngage is simply not the right source
   - Recommendation: Proceed with implementation but treat CivicEngage as bonus content, not critical path. The "3x events" goal is primarily achieved by LibCal.

4. **GitHub Actions vs Vercel cron for the pipeline**
   - What we know: Vercel Hobby limits cron to 1/day and requires serverless functions. GitHub Actions already works (refresh-hours.yml pattern).
   - What's unclear: Whether daily is sufficient or if we need more frequent updates
   - Recommendation: Use GitHub Actions daily cron, matching existing pattern. Daily is fine -- events don't change hourly.

5. **LibCal calendar ID stability**
   - What we know: Calendar ID `20247` works now
   - What's unclear: Whether the library might change/add calendar IDs
   - Recommendation: Make the calendar ID(s) configurable via script arguments, not hardcoded

## Sources

### Primary (HIGH confidence)
- LibCal iCal feed verified: `https://nevadacountyca.libcal.com/ical_subscribe.php?src=p&cid=20247` -- fetched 2026-02-14, returns valid VCALENDAR
- CivicEngage RSS feeds verified:
  - `https://nevadacountyca.gov/RSSFeed.aspx?ModID=58&CID=All-calendar.xml` -- fetched 2026-02-14, returns valid RSS 2.0
  - `https://www.nevadacityca.gov/RSSFeed.aspx?ModID=58&CID=Events-Calendar-24` -- fetched 2026-02-14
  - `https://nevadacountyca.gov/rss.aspx` -- full list of available RSS feeds
- Existing codebase: `scripts/events/ingest_trumba_rss.py`, `build_event_index.py` -- canonical event schema and pipeline pattern
- Existing codebase: `website/cultural-map-redesign/index-maplibre-events-*.js` (7 modules) -- client architecture
- GitHub Actions pattern: `.github/workflows/refresh-hours.yml` -- proven cron + commit pattern

### Secondary (MEDIUM confidence)
- [icalendar PyPI](https://pypi.org/project/icalendar/) -- v6.3.x, RFC 5545 support
- [feedparser PyPI](https://pypi.org/project/feedparser/) -- v6.0.x, universal feed parser
- [RapidFuzz GitHub](https://github.com/rapidfuzz/RapidFuzz) -- fuzzy matching, MIT license
- [recurring-ical-events PyPI](https://pypi.org/project/recurring-ical-events/) -- RRULE expansion helper
- [Vercel cron docs](https://vercel.com/docs/cron-jobs) -- Hobby plan limitations confirmed

### Tertiary (LOW confidence)
- LibCal API docs (behind Springshare login) -- could not verify public REST API endpoints
- CivicEngage calendarEvent namespace schema -- inferred from RSS output, not documented

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries installed and verified; existing pipeline pattern proven
- Architecture: HIGH - follows established ingest_trumba_rss.py pattern exactly
- Data source access: HIGH - both LibCal iCal and CivicEngage RSS verified working
- Dedup approach: MEDIUM - rapidfuzz token_sort_ratio at 85 threshold is standard but needs tuning
- Family classifier: MEDIUM - keyword list needs validation against real LibCal event corpus
- RRULE expansion: MEDIUM - recurring-ical-events library not yet tested with this specific feed

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (feeds stable, library versions stable)
