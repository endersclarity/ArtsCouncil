---
phase: 03-itineraries
plan: 02
subsystem: ui
tags: [itineraries, view, controller, deep-link, mobile, gsap, corridor-map]

# Dependency graph
requires:
  - phase: 03-itineraries plan 01
    provides: "itineraries.json, itinerary-model.js, itinerary-calendar.js"
  - phase: corridor-map.js
    provides: "Route rendering, stop markers, animated route drawing"
provides:
  - "CulturalMapItineraryView: hero cards, detail overlay, stop cards with calendar links, mobile scroll-snap"
  - "CulturalMapItineraryController: activation lifecycle, map integration, deep link, mutual exclusion"
  - "Deep link support via ?itinerary=<id>"
affects: [index-maplibre-hero-intent.html, core-utils.js, index-maplibre.js, experience-controller.js]

# Tech tracking
tech-stack:
  added: []
  patterns: ["CSS injected via JS IIFE on first call", "GSAP fade+slide for overlay animation", "Corridor-map reuse for itinerary route rendering", "Mutual exclusion between experiences and itineraries"]

key-files:
  created:
    - website/cultural-map-redesign/index-maplibre-itinerary-view.js
    - website/cultural-map-redesign/index-maplibre-itinerary-controller.js
  modified:
    - website/cultural-map-redesign/index-maplibre-hero-intent.html
    - website/cultural-map-redesign/index-maplibre-core-utils.js
    - website/cultural-map-redesign/index-maplibre.js
    - website/cultural-map-redesign/index-maplibre-experience-controller.js

key-decisions:
  - "Reuse corridor-map.js for itinerary route rendering — no duplicate map layer code"
  - "CSS injected into <head> from view IIFE rather than separate CSS file"
  - "Day tab switching via display:none/block toggling on day content divs"
  - "Mutual exclusion: each controller deactivates the other on activation"

patterns-established:
  - "Overlay pattern: fixed fullscreen modal with GSAP animation and backdrop click-to-close"
  - "Hero card pattern: data-itinerary-id attribute for delegated click handling"
  - "Mobile scroll-snap: flex container with 85vw cards and scroll-snap-type: x mandatory"

# Metrics
duration: 7min
completed: 2026-02-15
---

# Phase 3 Plan 2: Itinerary View + Controller + Wiring Summary

**Full interactive itinerary system with hero cards, detail overlay, map routes, calendar export, deep linking, and mobile swipe — wired into existing app with experience/itinerary mutual exclusion**

## Performance

- **Duration:** ~7 min
- **Completed:** 2026-02-15
- **Tasks:** 3 (2 auto + 1 human-verify)
- **Files created:** 2
- **Files modified:** 4

## Accomplishments

- Itinerary view module: hero cards with editorial styling, detail overlay with day tabs, stop cards with time ranges/narratives/tips, Add to Calendar buttons, mobile scroll-snap layout
- Itinerary controller: activation lifecycle with GSAP animations, map route via corridor-map reuse, deactivation cleanup, deep link state management
- HTML wiring: 4 script tags, hero cards container, overlay container
- Deep link: `?itinerary=perfect-day` opens itinerary on page load
- Mutual exclusion: activating itinerary deactivates experience and vice versa
- Zero console errors on fresh load

## Task Commits

1. **Task 1: Create view and controller modules** - `f68a827` (feat)
2. **Task 2: Wire into HTML, deep link, main app** - `54efa9f` (feat)
3. **Task 3: Browser verification** - verified via agent-browser + fix `39a3bcd`

## Files Created/Modified

- `website/cultural-map-redesign/index-maplibre-itinerary-view.js` — Hero cards HTML, detail overlay, stop cards with calendar links, CSS injection, mobile scroll-snap
- `website/cultural-map-redesign/index-maplibre-itinerary-controller.js` — Activation lifecycle, map integration, GSAP animations, deep link, mutual exclusion
- `website/cultural-map-redesign/index-maplibre-hero-intent.html` — 4 script tags + containers
- `website/cultural-map-redesign/index-maplibre-core-utils.js` — 'itinerary' added to deep link scalars
- `website/cultural-map-redesign/index-maplibre.js` — fetch itineraries.json, init, deep link handling
- `website/cultural-map-redesign/index-maplibre-experience-controller.js` — Mutual exclusion guard

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Itinerary→experience deactivation was no-op**
- **Found during:** Browser verification (Task 3)
- **Issue:** The itinerary controller had a typeof guard for CulturalMapExperienceController but the body was an empty comment — activating an itinerary wouldn't deactivate an active experience
- **Fix:** Added actual call to `window.CulturalMapExperienceController.deactivateExperience()`
- **Committed in:** 39a3bcd

---

**Total deviations:** 1 auto-fixed (mutual exclusion bug)
**Impact on plan:** Essential — without this fix, both itinerary and experience routes could render simultaneously

## Browser Verification Results

| # | Check | Result |
|---|-------|--------|
| 1 | Hero cards (3 itineraries) | PASS |
| 2 | Detail overlay with stops | PASS |
| 3 | Calendar links (Google Calendar) | PASS |
| 4 | Map route activation | PASS |
| 5 | Close/conflict resolution | PASS (after fix) |
| 6 | Deep link ?itinerary=perfect-day | PASS |
| 7 | Multi-day tab switching | PASS |
| 8 | Mobile scroll-snap CSS | PASS |
| - | Console errors on load | PASS (zero) |

## Self-Check: PASSED

- [x] website/cultural-map-redesign/index-maplibre-itinerary-view.js exists
- [x] website/cultural-map-redesign/index-maplibre-itinerary-controller.js exists
- [x] Commit f68a827 exists (Task 1)
- [x] Commit 54efa9f exists (Task 2)
- [x] Commit 39a3bcd exists (fix)

---
*Phase: 03-itineraries*
*Completed: 2026-02-15*
