---
phase: 03-itineraries
plan: 01
subsystem: data
tags: [json, itineraries, calendar, google-calendar, iife, vanilla-js]

# Dependency graph
requires:
  - phase: data.json
    provides: "687 cultural assets with name/location/category fields"
provides:
  - "itineraries.json with 3 authored itineraries (1-day, 2-day, 3-day) and 40 validated stops"
  - "CulturalMapItineraryModel: stop resolution, lookup, day grouping, map coord extraction"
  - "CulturalMapItineraryCalendar: Google Calendar URL generation with Pacific timezone"
affects: [03-itineraries plan 02, itinerary-view, itinerary-controller, deep-link]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Exact case-insensitive name match for stop resolution (not fuzzy .includes())", "Google Calendar URL with ctz parameter for timezone-aware local time", "ES5 IIFE module with window.CulturalMap* namespace"]

key-files:
  created:
    - website/cultural-map-redesign/itineraries.json
    - website/cultural-map-redesign/index-maplibre-itinerary-model.js
    - website/cultural-map-redesign/index-maplibre-itinerary-calendar.js

key-decisions:
  - "Used exact asset names from data.json (including unicode smart quotes) to avoid fuzzy match ambiguity"
  - "Google Calendar URL uses ctz=America/Los_Angeles with local time format (no Z suffix)"
  - "getNextSaturday() as default calendar date for evergreen itineraries"
  - "Unresolved stops are skipped with console.warn, not thrown errors"

patterns-established:
  - "Itinerary schema: id, title, subtitle, duration, season, heroImage, description, theme{accent,routeColor,background}, days[]{label, stops[]}"
  - "Stop schema: asset (exact data.json name), time (HH:MM 24h), duration (minutes), narrative, tip"
  - "flattenStopsForMap returns {lng, lat, name, stopNumber} matching corridor-map expected shape"

# Metrics
duration: 5min
completed: 2026-02-15
---

# Phase 3 Plan 1: Itinerary Data Layer Summary

**3 authored itineraries (40 stops) with model module for stop resolution and Google Calendar URL builder using exact data.json name matching**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-15T19:11:07Z
- **Completed:** 2026-02-15T19:16:06Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments

- Authored 3 curated itineraries: "Arts & Nature: A Perfect Day" (1-day, 7 stops), "The Full Nevada County Experience" (2-day, 13 stops), "Deep Dive: Art, History & Wine" (3-day, 20 stops)
- All 40 stop.asset values validated against data.json with zero unresolved references
- Itinerary model module with 5 exported functions for stop resolution, lookup, and map data extraction
- Calendar module generates well-formed Google Calendar URLs with Pacific timezone support

## Task Commits

1. **Task 1: Author itineraries.json** - `eaf7381` (feat)
2. **Task 2: Create model and calendar modules** - `2f830bc` (feat)

## Files Created/Modified

- `website/cultural-map-redesign/itineraries.json` - 3 curated itineraries with editorial narratives and practical tips
- `website/cultural-map-redesign/index-maplibre-itinerary-model.js` - Stop resolution, itinerary lookup, day grouping, map coord extraction
- `website/cultural-map-redesign/index-maplibre-itinerary-calendar.js` - Google Calendar URL generation per stop with Pacific timezone

## Decisions Made

- Used exact asset names from data.json including unicode smart quotes (U+2019) for apostrophes in "Ol' Republic Brewery" and "Tofanelli's Gold Country Bistro" to ensure case-insensitive exact match works
- Google Calendar URLs use `ctz=America/Los_Angeles` with local time format (no Z suffix) per Google Calendar API convention
- `getNextSaturday()` returns next Saturday as default date for evergreen itinerary calendar exports
- Unresolved stops skip silently (console.warn) rather than throwing, keeping the resolved array usable even with partial data

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed asset name mismatches from plan suggestions**
- **Found during:** Task 1 (authoring itineraries.json)
- **Issue:** Plan suggested "Empire Mine State Historic Park" but data.json has "Empire Mine". Plan suggested "North Star Mining Museum" but data.json has "North Star Power House & Pelton Wheel Museum". Smart quotes in data.json (U+2019) differ from ASCII apostrophes.
- **Fix:** Cross-referenced every asset name against data.json before writing. Used exact names including unicode characters.
- **Files modified:** website/cultural-map-redesign/itineraries.json
- **Verification:** Node.js validation script confirmed 0 unresolved stops across all 40 references
- **Committed in:** eaf7381

---

**Total deviations:** 1 auto-fixed (1 bug - incorrect asset names in plan)
**Impact on plan:** Essential for correctness. Without exact name matching, stops would fail to resolve.

## Issues Encountered

None beyond the asset name corrections documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 3 data files (itineraries.json, model, calendar) are standalone with no DOM/map dependencies
- Plan 02 can immediately consume these for view/controller/deep-link integration
- The flattenStopsForMap output matches the shape corridor-map.js expects for route rendering
- Calendar URLs are ready to wire into "Add to Calendar" buttons in the itinerary detail view

## Self-Check: PASSED

- [x] website/cultural-map-redesign/itineraries.json exists
- [x] website/cultural-map-redesign/index-maplibre-itinerary-model.js exists
- [x] website/cultural-map-redesign/index-maplibre-itinerary-calendar.js exists
- [x] Commit eaf7381 exists (Task 1)
- [x] Commit 2f830bc exists (Task 2)

---
*Phase: 03-itineraries*
*Completed: 2026-02-15*
