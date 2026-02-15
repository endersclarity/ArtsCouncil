---
phase: 02-tier-2-events
plan: 01
subsystem: data-pipeline
tags: [icalendar, feedparser, recurring-ical-events, rapidfuzz, python, event-ingest]

# Dependency graph
requires: []
provides:
  - "LibCal iCal ingest script (events-libcal.json)"
  - "CivicEngage RSS ingest script (events-civicengage.json)"
  - "Canonical event schema with source_type, source_label, is_family fields"
  - "Updated requirements.txt with all Tier 2 dependencies"
affects: [02-tier-2-events-plan-02, 02-tier-2-events-plan-03]

# Tech tracking
tech-stack:
  added: [icalendar, feedparser, rapidfuzz, recurring-ical-events]
  patterns: [per-source ingest script, canonical event schema, generated_at wrapper]

key-files:
  created:
    - scripts/events/ingest_libcal_ical.py
    - scripts/events/ingest_civicengage_rss.py
  modified:
    - scripts/requirements.txt

key-decisions:
  - "CivicEngage: prefer calendarevent_eventdates over published_parsed for event date"
  - "LibCal: include date in event_id to differentiate recurring instances"
  - "Skip Nevada County government calendar (Board of Supervisors meetings not cultural)"

patterns-established:
  - "Ingest script convention: argparse CLI, canonical schema output, generated_at wrapper"
  - "Event ID format: source-prefix + identifier + date (e.g., libcal-UID-YYYYMMDD)"

# Metrics
duration: 4min
completed: 2026-02-14
---

# Phase 02 Plan 01: Tier 2 Event Ingest Scripts Summary

**LibCal iCal and CivicEngage RSS ingest scripts producing canonical event JSON with RRULE expansion and CivicEngage namespace parsing**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-15T07:14:17Z
- **Completed:** 2026-02-15T07:18:35Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- LibCal iCal ingest script fetches 70 events from Nevada County Library calendar with RRULE expansion support
- CivicEngage RSS ingest script parses custom calendarEvent namespace fields (eventdates, eventtimes, location)
- Both scripts output identical canonical schema matching ingest_trumba_rss.py conventions
- All events include source_type, source_ref, source_label, and is_family fields for merge pipeline

## Task Commits

Each task was committed atomically:

1. **Task 1: LibCal iCal ingest script with RRULE expansion** - `7ce2bac` (feat)
2. **Task 2: CivicEngage RSS ingest script** - `0a09f3b` (feat)

## Files Created/Modified
- `scripts/events/ingest_libcal_ical.py` - LibCal iCal feed parser with recurring event expansion via recurring-ical-events library
- `scripts/events/ingest_civicengage_rss.py` - CivicEngage municipal RSS parser with custom calendarEvent namespace support
- `scripts/requirements.txt` - Added icalendar, feedparser, rapidfuzz, recurring-ical-events dependencies

## Decisions Made
- CivicEngage RSS `published_parsed` is the RSS post date (often weeks before event), not the event date. Must use `calendarevent_eventdates` field instead.
- LibCal event IDs include the date suffix (e.g., `libcal-UID-20260216`) to differentiate recurring event instances with the same UID.
- Only Nevada City Events Calendar included in CivicEngage feeds. Nevada County government calendar skipped per research recommendation (Board of Supervisors meetings are not cultural events).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CivicEngage date parsing used RSS post date instead of event date**
- **Found during:** Task 2 (CivicEngage RSS ingest)
- **Issue:** Script used `published_parsed` (Jan 13 post date) instead of `calendarevent_eventdates` (Feb 16 event date), causing events to be filtered out as "outside window"
- **Fix:** Reordered date parsing strategies to check CivicEngage `calendarevent_eventdates` first, then custom namespace fields, then `published_parsed` as last resort
- **Files modified:** scripts/events/ingest_civicengage_rss.py
- **Verification:** Script now finds 1 event (Presidents Day, Feb 16) that was previously missed
- **Committed in:** 0a09f3b (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Fix was essential for correctness -- without it, CivicEngage would always return 0 events due to post dates being outside the window.

## Issues Encountered
None beyond the deviation noted above.

## User Setup Required
None - no external service configuration required. Both feeds are publicly accessible without authentication.

## Next Phase Readiness
- Two per-source JSON files ready for merge pipeline (Plan 02)
- Canonical schema includes all fields needed for dedup (event_id prefix, start_iso, title)
- is_family placeholder set to false -- Plan 02 merge script will handle classification
- requirements.txt includes rapidfuzz dependency needed for Plan 02 fuzzy dedup

---
*Phase: 02-tier-2-events*
*Completed: 2026-02-14*
