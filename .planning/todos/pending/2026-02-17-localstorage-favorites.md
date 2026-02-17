---
created: 2026-02-17T00:00:00.000Z
title: Add localStorage favorites (heart button on places/events)
area: ux
priority: medium
files:
  - .planning/roundtable/01-tourist-advocate.md
  - .planning/roundtable/02-local-advocate.md
  - .planning/roundtable/06-synthesis.md
---

## Problem

Every roundtable advocate identified missing save/bookmark functionality:
- Tourist: "No save or bookmark functionality"
- Local: "No user accounts or saved favorites"
- Synthesizer: "Universal Gap 3: No Way to Save/Bookmark — Low effort, high user value"

Visitors and locals both want to heart venues and see them in a "My List" view. No accounts required.

## Solution

Add a heart/bookmark button to:
1. **Detail panel** — heart icon next to venue name
2. **Event cards** — small heart in card corner
3. **Itinerary stops** — save individual stops

Storage: localStorage (no accounts, no backend). Key: `gvnc-favorites` as JSON array of asset names/IDs.

UI: "My Saved" tab or drawer accessible from nav. Shows list of hearted places with quick links to detail panel.

Bonus: Shareable via URL encoding (like deep link codec) — share your saved places list with a friend.

## References

- Tourist advocate: "No save or bookmark functionality"
- Local advocate: "No saved favorites, no notifications for new venues/events"
- Synthesizer: "Universal Gap 3 — Low effort, high user value"

## Research

Research: .planning/todo-research/navigation-brief.md (Section 2)
