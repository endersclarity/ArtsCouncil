---
phase: 04-copy-positioning
plan: 03
subsystem: copy
tags: [voice, copy, chatbot, events, itineraries, consistency-sweep]

# Dependency graph
requires:
  - phase: 04-01
    provides: Hub page MUSE voice, category renames, terminology fixes
  - phase: 04-02
    provides: Itinerary & experience narrative rewrites in MUSE voice
provides:
  - MUSE-voiced events and itineraries sub-pages with real SEO title tags
  - Chatbot functional register (knowledgeable local, not editorial)
  - Platform name decision document for committee
  - Zero anti-pattern consistency verification across all 7 target files
affects: [05-ai-concierge, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns: [functional-register-chatbot, name-first-responses]

key-files:
  created:
    - .planning/phases/04-copy-positioning/writers-room/platform-name-decision.md
  modified:
    - website/cultural-map-redesign-stitch-lab/events.html
    - website/cultural-map-redesign-stitch-lab/itineraries.html
    - website/cultural-map-redesign-stitch-lab/api/chat.js

key-decisions:
  - "Chatbot uses functional register (knowledgeable local) not editorial register (MUSE feature article)"
  - "Platform name deferred to Diana/Eliza for Wednesday committee meeting"
  - "Asset descriptions in chat-knowledge-pack.json preserved as-is from source data (not copy we author)"

patterns-established:
  - "Chatbot voice: direct, second-person, name-first, concise. No narrative arcs or em-dash color."
  - "Sub-page mast branding matches hub page (Explore Nevada County)"

# Metrics
duration: 3min
completed: 2026-02-16
---

# Phase 04 Plan 03: Sub-page Copy, Chatbot Voice & Consistency Sweep Summary

**Events/itineraries sub-pages rewritten with MUSE vocabulary and real SEO tags; chatbot voice set to functional register (knowledgeable local, not editorial); platform name deferred to committee; zero anti-patterns across all 7 target files.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-16T12:31:43Z
- **Completed:** 2026-02-16T12:34:48Z
- **Tasks:** 3
- **Files modified:** 4 (3 code + 1 docs)

## Accomplishments

- Events page: real SEO title tag, MUSE vocabulary subtitle, zero "cultural asset" instances
- Itineraries page: real SEO title tag, culture-forward subtitle, geographic context line
- Chatbot system prompt rewritten to functional register per editor's assessment Section 7
- Platform name options documented for Diana/Eliza decision at Wednesday meeting
- Full consistency sweep: zero anti-patterns across all 7 target files

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite sub-page copy and chat concierge personality** - `5fd5f37` (feat)
2. **Task 2: Platform name finalization** - `b10264f` (docs)
3. **Task 3: Full consistency sweep** - No commit (zero fixes needed; plans 01 and 02 already cleaned all anti-patterns)

## Files Created/Modified

- `website/cultural-map-redesign-stitch-lab/events.html` - MUSE-voiced subtitle, real SEO title tag
- `website/cultural-map-redesign-stitch-lab/itineraries.html` - Culture-forward subtitle, real SEO title tag, geographic context
- `website/cultural-map-redesign-stitch-lab/api/chat.js` - Chatbot system prompt rewritten to functional register
- `.planning/phases/04-copy-positioning/writers-room/platform-name-decision.md` - Platform name options for committee

## Decisions Made

1. **Chatbot functional register:** The editor settled that the chatbot should sound like a knowledgeable local giving quick recs, NOT like a MUSE feature article. Direct, second-person, name-first, concise. No narrative arcs, no em-dash color.
2. **Platform name deferred:** User selected "defer" option. Current name ("Explore Nevada County") kept as-is. Options document created for Diana/Eliza to decide at Wednesday committee meeting.
3. **Source data descriptions preserved:** 3 instances of "nestled in" in chat-knowledge-pack.json asset descriptions come from ArcGIS source data, not authored copy. Out of scope per plan's "Do NOT touch" rules.

## Deviations from Plan

None - plan executed exactly as written. Task 3 sweep found zero anti-patterns in the 7 target files because plans 01 and 02 had already cleaned everything.

## Consistency Sweep Results (Task 3)

All checks passed across the 7 target files:

| Check | Pattern | Result |
|-------|---------|--------|
| 1 | "cultural asset" | 0 matches |
| 2 | hidden gem / best-kept secret / off the beaten path | 0 matches |
| 3 | nestled in / tucked away / charming little | 0 in authored copy (3 in source data descriptions - out of scope) |
| 4 | settle into / wind down with / stretch your legs | 0 matches |
| 5 | visitors will / tourists can / travelers should | 0 matches |
| 6 | Culture Discovery 2026 | 0 matches in target files |
| 7 | Frontend Design Pass | 0 matches in target files |
| 8 | Cultural District count | Hub: cover tag + colophon + MUSE quotes (correct). Sub-pages: 0 (correct). |
| 9 | Platform name consistency | "Explore Nevada County" on all 3 mast h1 elements |
| 10 | Colophon | "Created by the Experience Planning Committee" (correct) |
| 11 | JSON validity | itineraries.json, experiences.json, chat-knowledge-pack.json all valid |
| 12 | Chatbot register | Functional (confirmed in api/chat.js) |

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 04 (Copy & Positioning) is now COMPLETE. All 3 plans executed.
- All 7 target files use MUSE-derived voice with correct register per surface
- Platform name decision pending Diana/Eliza at Wednesday meeting (documented)
- Ready for final deployment review before Wednesday committee presentation

## Self-Check: PASSED

- FOUND: .planning/phases/04-copy-positioning/04-03-SUMMARY.md
- FOUND: .planning/phases/04-copy-positioning/writers-room/platform-name-decision.md
- FOUND: commit 5fd5f37 (Task 1)
- FOUND: commit b10264f (Task 2)

---
*Phase: 04-copy-positioning*
*Completed: 2026-02-16*
