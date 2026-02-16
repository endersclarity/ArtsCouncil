---
phase: 04-copy-positioning
plan: 02
subsystem: content
tags: [copy, muse-voice, itineraries, experiences, editorial, json]

# Dependency graph
requires:
  - phase: 03
    provides: "itineraries.json with 3 curated trip plans and 40 stops"
  - phase: 04-research
    provides: "MUSE voice extraction rules, banned phrases list, register guidelines"
provides:
  - "MUSE-voice itinerary narratives (3 itineraries, 21 stops, 21 tips)"
  - "MUSE-voice experience/corridor descriptions (10 experiences, ~80 stop notes, ~70 connectors)"
affects: [04-03, chat-knowledge-pack]

# Tech tracking
tech-stack:
  added: []
  patterns: ["place-first naming in all editorial JSON", "two-register copy (editorial narratives, functional tips)", "directional connectors replacing generic transitions"]

key-files:
  created: []
  modified:
    - "website/cultural-map-redesign-stitch-lab/itineraries.json"
    - "website/cultural-map-redesign-stitch-lab/experiences.json"

key-decisions:
  - "Itinerary titles rewritten culture-forward: 'Galleries, Gold Mines & Stage Lights' not 'Arts & Nature: A Perfect Day'"
  - "Nature experience retitled 'State Parks & Trail Networks' with mining-history-forward framing"
  - "Connectors use street names and directional cues instead of generic scenic filler"
  - "Subtitles use venue-to-venue ranges for specificity (e.g., 'Empire Mine to Malakoff Diggins')"

patterns-established:
  - "Place-first pattern: every narrative and note leads with the proper venue name in the first 5 words"
  - "Functional tips: no narrative language, no banned transitions, actionable and specific"
  - "Directional connectors: street names, compass directions, physical landmarks"
  - "Short punchy closers: final sentences of descriptions are declarative and short"

# Metrics
duration: 6min
completed: 2026-02-16
---

# Phase 04 Plan 02: Itinerary & Experience Narrative Rewrite Summary

**Full MUSE-voice rewrite of itineraries.json (3 itineraries, 21 stops) and experiences.json (10 experiences/corridors, ~80 stop notes) with place-first naming, second-person address, earned adjectives, and zero tourism cliches**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-16T16:34:41Z
- **Completed:** 2026-02-16T16:40:33Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Rewrote all 3 itinerary titles, subtitles, and descriptions to lead with cultural venues (not nature)
- Rewrote 21 stop narratives with place-first pattern, second-person address, sensory hooks, and em-dash color
- Converted 21 tips to clean functional register (actionable, no narrative language)
- Rewrote 10 experience/corridor titles, subtitles, and descriptions with specificity test applied
- Rewrote ~80 stop notes with place-first pattern and street addresses
- Replaced ~70 connectors with directional/physical transitions (street names, not scenic filler)
- Zero banned phrases remain (hidden gem, must-see, settle into, wind down, etc.)
- Every narrative passes the specificity test -- none could describe a generic American town

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite itineraries.json** - `23f64b7` (feat)
2. **Task 2: Rewrite experiences.json** - `e324fcd` (feat)

## Files Created/Modified
- `website/cultural-map-redesign-stitch-lab/itineraries.json` - 3 itineraries with MUSE-voice narratives, culture-forward titles, functional tips
- `website/cultural-map-redesign-stitch-lab/experiences.json` - 10 experiences/corridors with MUSE-voice descriptions, place-first stop notes, directional connectors

## Decisions Made
- Itinerary 1 title changed from "Arts & Nature: A Perfect Day" to "Galleries, Gold Mines & Stage Lights" (culture-forward, specific)
- Itinerary 2 title changed from "The Full Nevada County Experience" to "Twin Cities: Grass Valley & Nevada City" (names the towns, removes generic "experience")
- Itinerary 3 title changed from "Deep Dive: Art, History & Wine" to "Art, History & Sierra Foothill Wine" (anchors to the specific region)
- Nature experience retitled from "Nature & Trails Explorer" to "State Parks & Trail Networks" (mining-history-forward, not generic nature)
- Experience subtitles now use venue-to-venue ranges for immediate specificity
- Connectors rewritten with street names (Spring Street, Broad Street, Mill Street, Idaho Maryland Road) instead of generic transitions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Itinerary and experience narratives are complete in MUSE voice
- Plan 01 (hub page copy) and Plan 03 (config, chat prompt, utility labels) remain
- chat-knowledge-pack.json will need rebuilding after all copy plans complete (it contains itinerary/experience summaries)

---
*Phase: 04-copy-positioning*
*Completed: 2026-02-16*
