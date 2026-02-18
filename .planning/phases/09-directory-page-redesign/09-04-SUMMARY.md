---
phase: 09-directory-page-redesign
plan: 04
subsystem: data
tags: [data-quality, geospatial, deep-links, qr-gallery, maplibre]

# Dependency graph
requires:
  - phase: 09-01
    provides: directory foundation rebuilt with editorial palette
provides:
  - Corrected coordinates for Alan Thiesen Trail and Sawtooth Trailhead in data.json
  - Renamed multi-location entries to distinguish Avanguardia Winery, South Pine Cafe, The Pour House by city
  - Stable ?place= deep link for Elixart in QR gallery (replaces fragile ?idx=544)
  - Scope messaging in QR gallery communicating 7 of 25 stops
  - ?place= name-based lookup support added to hub's applyDeepLinkFromLocation
affects: [directory, hub, qr-gallery, data-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "?place= URL parameter for name-based venue deep links in hub (hub already had findVenueByName, now wired to URL)"
    - "Multi-location disambiguation: append (City) suffix to business names with multiple physical locations"

key-files:
  created:
    - website/cultural-map-redesign-stitch-lab/qr-gallery.html (was untracked, now committed)
  modified:
    - website/cultural-map-redesign-stitch-lab/data.json
    - website/cultural-map-redesign-stitch-lab/index-maplibre-core-utils.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre.js

key-decisions:
  - "Multi-location businesses (Avanguardia, South Pine Cafe, The Pour House) renamed with (City) suffix rather than removing one — both locations are distinct physical venues with different addresses, phones, and PIDs"
  - "Alan Thiesen Trail fixed to -121.075, 39.165 (Alta Sierra area, Nevada County) from erroneous Southern CA coords"
  - "Sawtooth Trailhead fixed to -120.154, 39.411 (Stampede Reservoir area near Truckee) from out-of-bounds coords"
  - "?place= support added to hub's parseDeepLinkSearch and applyDeepLinkFromLocation — hub already had findVenueByName(), just needed hookup to URL params"
  - "?place= not serialized back to URL by serializeDeepLinkSearch — hub normalizes URL state to pid/idx after apply"

patterns-established:
  - "Deep link format: ?place=Venue+Name+%26+Suffix (URL-encoded) for name-based venue navigation"
  - "Venue name disambiguation: append (City) when same-name same-category entries represent distinct locations"

requirements-completed: [D1, D2, M16, Min11]

# Metrics
duration: 4min
completed: 2026-02-18
---

# Phase 09 Plan 04: Data Quality & QR Gallery Fixes Summary

**data.json audited and corrected: 2 coordinate fixes, 3 multi-location renames; QR gallery Elixart link migrated from fragile ?idx=544 to stable ?place= deep link with scope messaging added**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-18T03:22:18Z
- **Completed:** 2026-02-18T03:26:09Z
- **Tasks:** 2
- **Files modified:** 4 (data.json, qr-gallery.html, index-maplibre-core-utils.js, index-maplibre.js)

## Accomplishments
- Audited all 687 data.json entries — found and fixed 2 entries with coordinates outside Nevada County bounds
- Eliminated all 3 same-category duplicate name conflicts by appending city suffix to distinguish physical locations
- Fixed fragile Elixart QR gallery link from `?idx=544` to stable `?place=Elixart+Herbal+Lounge+%26+Gallery`
- Added "Featuring 7 of 25 stops" scope messaging to QR gallery with link to full directory
- Added `?place=` name-based deep link support to hub (`applyDeepLinkFromLocation` + `parseDeepLinkSearch`)

## Task Commits

1. **Task 1: Audit and fix data.json coordinates and duplicates** - `dbe9057` (fix)
2. **Task 2: Update QR gallery Elixart link and scope messaging** - `d8b1ff3` (fix)

**Plan metadata:** (to be committed with SUMMARY.md)

## Files Created/Modified
- `website/cultural-map-redesign-stitch-lab/data.json` - 2 coordinate fixes + 6 name renames (3 businesses × 2 locations each)
- `website/cultural-map-redesign-stitch-lab/qr-gallery.html` - Elixart ?idx= → ?place= link, scope messaging, .gallery-scope CSS
- `website/cultural-map-redesign-stitch-lab/index-maplibre-core-utils.js` - Added 'place' to parseDeepLinkSearch scalar params
- `website/cultural-map-redesign-stitch-lab/index-maplibre.js` - Added focusPlace handling in applyDeepLinkFromLocation

## Decisions Made
- Multi-location businesses renamed with (City) suffix rather than removing one entry — Avanguardia Winery (Nevada City/Grass Valley), South Pine Cafe (Nevada City/Grass Valley), The Pour House (Truckee/Grass Valley) are distinct physical venues
- ?place= support added to hub rather than changing QR gallery to link to directory.html — QR gallery intent is to open the hub map and fly to the venue
- Coordinate for Alan Thiesen Trail estimated at -121.075, 39.165 (Alta Sierra centroid) — BYLT trail website confirms Alta Sierra, exact trailhead coords unavailable without live geocoding
- Coordinate for Sawtooth Trailhead estimated at -120.154, 39.411 (Stampede Reservoir area near Truckee) — address "11632 06 Fire Rd, Truckee" maps to National Forest roads north of Truckee

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added ?place= name-based lookup to hub deep link handler**
- **Found during:** Task 2 (QR gallery Elixart link update)
- **Issue:** Plan specified ?place= format for QR gallery link to hub, but hub's applyDeepLinkFromLocation had no ?place= handling — only ?pid= and ?idx=. Since Elixart has pid: null, ?pid= was unavailable and ?idx= was the only option (the fragile link being replaced).
- **Fix:** Added 'place' to parseDeepLinkSearch scalars in core-utils.js; added focusPlace variable and findVenueByName(focusPlace) lookup in applyDeepLinkFromLocation before the ?idx= fallback.
- **Files modified:** index-maplibre-core-utils.js, index-maplibre.js
- **Verification:** findVenueByName() already existed in index-maplibre.js — just needed wiring to URL params
- **Committed in:** d8b1ff3 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical functionality)
**Impact on plan:** The fix was necessary for the ?place= deep link to actually work. Without it, the QR link would open the hub but not navigate to Elixart. No scope creep.

## Issues Encountered
- The plan's `key_links` section described `?place=` as being handled by "hub's parseDeepLinkSearch" — this was aspirational, not actual. The hub's parseDeepLinkSearch did not include 'place' in its scalars list, and applyDeepLinkFromLocation had no focusPlace handling. Auto-fixed per Rule 2.

## Next Phase Readiness
- data.json is clean: 687 entries, all coordinates within Nevada County bounds, no same-category duplicate names
- QR gallery Elixart link is stable and works with hub's ?place= deep link system
- Hub ?place= parameter is now fully supported (name-based venue lookup)
- Plans 09-02 and 09-03 can proceed independently (different files)

---
*Phase: 09-directory-page-redesign*
*Completed: 2026-02-18*
