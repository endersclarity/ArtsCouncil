---
phase: 08-ai-trip-builder
plan: 03
subsystem: api
tags: [gemini, chatbot, itinerary-parser, dream-board, trip-planning, localstorage]

# Dependency graph
requires:
  - phase: 05-ai-concierge
    provides: "api/chat.js serverless function, chat-controller.js parseResponse(), chat-view.js welcome rendering"
  - phase: 08-ai-trip-builder
    provides: "CulturalMapDreamboardModel for getPlaces/getEvents/getItemCount, plan 08-01"
provides:
  - "Trip Planning Mode in Gemini system prompt with {{ITINERARY}} block format specification"
  - "Dream board context injection: dreamBoard array in API request body appended to last user message"
  - "parseItineraryBlock() parser: pipe-delimited -> itinerary-schema-compatible trip object"
  - "buildItineraryChatCard() in-chat itinerary summary rendering with View & Edit CTA"
  - "saveUserTrip() with TripBuilderModel delegation and localStorage fallback"
  - "getDreamBoardPayload() for automatic dream board pre-seeding in API requests"
  - "Trip planning style cards (1-Day, 2-Day, Organize) conditional on dream board count"
  - "?chat=trip&plan=1day|2day|organize deep link support"
affects: [08-04, trip.html]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pipe-delimited {{ITINERARY}} response block format for LLM structured output"
    - "Lenient parser pattern: skip unparseable lines, default missing fields, strip code fences"
    - "Dream board context injection via user message appendix (preserves system prompt cache)"
    - "CSS injection via injectTripCSS() for chat itinerary and trip style card styles"

key-files:
  created: []
  modified:
    - "website/cultural-map-redesign-stitch-lab/api/chat.js"
    - "website/cultural-map-redesign-stitch-lab/index-maplibre-chat-controller.js"
    - "website/cultural-map-redesign-stitch-lab/index-maplibre-chat-view.js"

key-decisions:
  - "Dream board context injected into last user message, not system prompt (preserves Gemini prompt cache at cold start)"
  - "Pipe-delimited ITINERARY format chosen over JSON (LLMs produce malformed JSON ~15% of the time)"
  - "Lenient parser: defaults missing time to 09:00, duration to 60min, skips unparseable lines"
  - "saveUserTrip delegates to TripBuilderModel.saveTrip when available, falls back to direct localStorage"
  - "Trip planning style cards only shown when dream board has >0 items (no empty state noise)"
  - "CSS injected once via injectTripCSS() pattern (same convention as itinerary-view.js)"

patterns-established:
  - "{{ITINERARY|Title|Duration\\nDAY|Label\\nSTOP|Name|Time|Duration|Narrative\\n}} block format"
  - "Trip objects use 'usr-' id prefix to distinguish from curated itineraries"
  - "Dream board payload: array of place/event name strings capped at 50 entries"
  - "Deep link pattern: ?chat=trip&plan=1day|2day|organize for chat auto-open with planning mode"

requirements-completed: [SC-3]

# Metrics
duration: 5min
completed: 2026-02-18
---

# Phase 08 Plan 03: Chatbot Trip Planning Mode Summary

**Gemini trip-planning system prompt with {{ITINERARY}} block parser, dream board context injection, and in-chat style cards for one-click itinerary generation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-18
- **Completed:** 2026-02-18
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Gemini system prompt extended with Trip Planning Mode section: {{ITINERARY}} block format specification, naming rules, pacing guidance, and organization instructions
- Dream board context injection in api/chat.js: dreamBoard array from request body sanitized and appended to last user message (preserves system prompt cache)
- Full {{ITINERARY}} block parser in chat-controller.js: pipe-delimited format parsed into itinerary-schema-compatible trip objects with lenient error handling
- Trip planning style cards in chat welcome: "1-Day Plan", "2-Day Plan", "Just Organize My List" cards shown conditionally when dream board has items
- In-chat itinerary summary card with gold accent border, day/stop breakdown, and "View & Edit on Trip Page" CTA link
- ?chat=trip deep link support for auto-opening chat in trip planning mode with optional plan type dispatch

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend api/chat.js with trip-planning system prompt and dream board context** - `0c9d6d7` (feat)
2. **Task 2: Add ITINERARY parser to chat controller + style cards to chat view** - `0794f77` (feat)

## Files Created/Modified
- `api/chat.js` - Trip Planning Mode system prompt section (~22 lines), dream board context injection (~12 lines) appending sanitized place names to last user message
- `index-maplibre-chat-controller.js` - parseItineraryBlock() parser (~55 lines), buildItineraryChatCard() renderer (~20 lines), saveUserTrip() with TripBuilderModel delegation (~25 lines), getDreamBoardPayload() for API pre-seeding (~15 lines), handleChatDeepLink() for ?chat=trip parameter (~30 lines), parseResponse() extension for {{ITINERARY}} blocks (~17 lines)
- `index-maplibre-chat-view.js` - TRIP_STYLE_CARDS data array, renderTripStyleCards() and wireTripCardActions() functions, injectTripCSS() with styles for .chat-trip-card, .chat-itin-card, .chat-itin-error classes, renderWelcome() updated to conditionally show trip cards

## Decisions Made
- Dream board context injected into last user message (not system prompt) to preserve Gemini prompt cache -- system prompt is built once at cold start as a module-scope constant
- Pipe-delimited {{ITINERARY}} format chosen over JSON blocks because LLMs produce malformed JSON ~15% of the time; pipe-delimited is harder to break
- Parser is lenient by design: missing time defaults to '09:00', missing duration defaults to 60 minutes, unparseable lines are silently skipped
- saveUserTrip() checks for CulturalMapTripBuilderModel.saveTrip first (from plan 08-02), falls back to direct localStorage write with 'ncac-user-trips' key and 20-trip cap
- Trip planning style cards conditionally rendered only when CulturalMapDreamboardModel.getItemCount() > 0 to avoid confusing users with no saved places
- Narrative field parsed with parts.slice(4).join('|') to handle pipes that may appear in narrative text

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Chatbot trip planning mode is fully wired: system prompt, parser, dream board context, style cards
- Plan 08-04 (finalized rendering + share + calendar + polish) can consume saved trips from localStorage
- The parseItineraryBlock function is exported on the public API for testing: CulturalMapChatController.parseItineraryBlock()
- Trip objects saved by this plan match the itinerary schema exactly (verified against 08-RESEARCH.md Pattern 1)

## Self-Check: PASSED

- FOUND: website/cultural-map-redesign-stitch-lab/api/chat.js
- FOUND: website/cultural-map-redesign-stitch-lab/index-maplibre-chat-controller.js
- FOUND: website/cultural-map-redesign-stitch-lab/index-maplibre-chat-view.js
- FOUND: .planning/phases/08-ai-trip-builder/08-03-SUMMARY.md
- FOUND: commit 0c9d6d7 (Task 1)
- FOUND: commit 0794f77 (Task 2)
- VERIFIED: "Trip Planning Mode" in api/chat.js system prompt
- VERIFIED: parseItineraryBlock function in chat-controller.js
- VERIFIED: chat-trip-card CSS and rendering in chat-view.js

---
*Phase: 08-ai-trip-builder*
*Completed: 2026-02-18*
