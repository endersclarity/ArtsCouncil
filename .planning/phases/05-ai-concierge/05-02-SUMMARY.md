---
phase: 05-ai-concierge
plan: 02
subsystem: ui
tags: [chat-widget, fab, gsap, responsive, deep-links, muse-citations]

# Dependency graph
requires:
  - phase: 05-ai-concierge
    provides: POST /api/chat serverless endpoint (plan 01)
provides:
  - Floating chat FAB button with slide-up conversation panel
  - Message rendering with [[asset]] deep links and {{MUSE}} citation parsing
  - Full-screen mobile chat overlay at <600px
  - Session-based conversation history with input sanitization
affects: [deployment, phase-04-copy]

# Tech tracking
tech-stack:
  added: []
  patterns: [fab-chat-widget, iife-mvc-triad, gsap-panel-animation, deep-link-response-parsing]

key-files:
  created:
    - website/cultural-map-redesign/index-maplibre-chat-view.js
    - website/cultural-map-redesign/index-maplibre-chat-controller.js
    - website/cultural-map-redesign/index-maplibre-chat-widget.js
  modified:
    - website/cultural-map-redesign/index-maplibre-hero-intent.css
    - website/cultural-map-redesign/index-maplibre-hero-intent.html

key-decisions:
  - "No DOMPurify CDN for V1 — parseResponse generates only known-safe HTML patterns"
  - "Asset clicks use hash deep links (#place=Name) to trigger existing detail panel system"
  - "Conversation history capped at 10 messages (5 turns) to control API token usage"

patterns-established:
  - "Chat MVC triad: view (rendering) -> controller (logic/API) -> widget (UI shell/lifecycle)"
  - "Response parsing: [[Name|pid]] for asset links, {{MUSE|id|quote}} for editorial citations"
  - "FAB pattern: fixed button -> slide-up panel, fullscreen on mobile, Escape to close"

# Metrics
duration: 2min
completed: 2026-02-15
---

# Phase 05 Plan 02: AI Concierge Chat UI Summary

**Floating chat widget with FAB button, conversation panel, [[asset]] deep links to detail panel, {{MUSE}} citation blocks, and full-screen mobile overlay**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-15T22:57:29Z
- **Completed:** 2026-02-15T22:59:56Z
- **Tasks:** 2
- **Files created:** 3 (+ 2 modified)

## Accomplishments
- Three IIFE modules (widget, view, controller) following existing codebase patterns (ES5, window globals)
- Chat controller with fetch to /api/chat, input sanitization (HTML strip, javascript: removal), 500-char limit, session hash via localStorage
- Response parser converts [[Asset Name|pid]] to clickable links that open the map detail panel, and {{MUSE|id|quote}} to styled citation blocks with Heyzine flip-book link
- Full CSS integration using design tokens (--gold, --ink, --cream, Playfair Display) with mobile full-screen overlay at 600px breakpoint

## Task Commits

Each task was committed atomically:

1. **Task 1: Create chat widget, view, and controller JS modules** - `571e378` (feat)
2. **Task 2: Add chat CSS and wire modules into live HTML page** - `388281f` (feat)

## Files Created/Modified
- `website/cultural-map-redesign/index-maplibre-chat-view.js` - Message rendering (user/bot bubbles, typing indicator, welcome, error)
- `website/cultural-map-redesign/index-maplibre-chat-controller.js` - API fetch, response parsing (deep links + MUSE citations), session hash, input sanitization
- `website/cultural-map-redesign/index-maplibre-chat-widget.js` - FAB button injection, panel open/close with GSAP, Escape key, mobile overlay
- `website/cultural-map-redesign/index-maplibre-hero-intent.css` - 210 lines of chat widget CSS (FAB, panel, messages, typing, input, mobile)
- `website/cultural-map-redesign/index-maplibre-hero-intent.html` - 3 script tags + init call added after main app scripts

## Decisions Made
- No DOMPurify for V1: parseResponse only generates anchor tags with data attributes and div/span with class names. User messages escaped. Sufficient for demo.
- Asset clicks use `window.location.hash = '#place=...'` to integrate with existing deep link handler rather than calling detail controller directly — decoupled and works regardless of detail panel implementation
- Conversation history capped at 10 messages to avoid token bloat on Gemini API

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. (API keys from 05-01 are already configured.)

## Next Phase Readiness
- Chat UI is ready for deployment (`vercel --prod` or git push)
- End-to-end flow: FAB click -> panel open -> type question -> POST /api/chat -> render response with asset links and MUSE citations
- Asset deep links integrate with existing detail panel system
- Phase 5 (AI Concierge) is now complete: server infra (05-01) + client UI (05-02)

## Self-Check: PASSED

All 3 created files verified on disk. Both task commits (571e378, 388281f) verified in git log.

---
*Phase: 05-ai-concierge*
*Completed: 2026-02-15*
