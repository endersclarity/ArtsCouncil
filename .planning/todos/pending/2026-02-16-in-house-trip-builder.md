---
created: 2026-02-16T00:00:00.000Z
title: In-house trip builder / personal calendar
area: brainstorm
priority: high
files: []
---

## Problem

Visitors can browse curated itineraries but can't build their own. No way to pick stops, set times, arrange days, and export the whole batch to Google Calendar in one action. This is a **mandatory ask from Diana** — the committee wants trip-building capability.

## Context: MindTrip Comparison

MindTrip offers AI-generated personalized itineraries from natural language prompts ("3-day family trip with kids under 5"). Ours are currently hand-authored. The gap is:
- **MindTrip**: Dynamic, AI-generated, real-time collaboration, shareable, booking-ready
- **Us**: Static curated routes + AI concierge that can suggest plans via chat

### Engagement Reality Check (Perplexity research 2026-02-17)
- **5-15% of visitors** will engage with trip-building features (industry data)
- **80-90%+ still browse traditionally** (nav, search, Google)
- See Monterey + MindTrip: only 5% engagement rate increase, 7% session duration increase
- 68% of users find chatbots "rarely or never helpful"
- AI trip planners are an **enhancement layer**, not a traffic driver
- The map, events, and editorial content serve the vast majority of visitors

### Implication
Worth building because Diana wants it and it does convert browsers into planners — but set expectations accordingly. Don't over-invest at the expense of core content features.

## Solution

Build a trip builder UI. Strong preference to avoid requiring sign-in/accounts. Possible approaches:

1. **localStorage-only** — no account needed, persists per device
2. **Shareable URL encoding** — trip plan encoded in query string (like our deeplink codec)
3. **Cookie-based session**
4. **AI-assisted**: Extend chat concierge to output structured itinerary JSON that auto-populates the trip builder

### MVP scope
- "Add to my trip" button on asset detail panels and event cards
- Trip sidebar/drawer showing selected stops grouped by day
- Drag to reorder, assign to days
- Export to Google Calendar (one-click)
- Share via URL (encoded trip state)

### Stretch
- AI concierge generates trip → auto-populates builder
- PDF export with map snapshots
- Collaborative editing (MindTrip-style, low priority)

## Related
- `.planning/todos/pending/2026-02-17-mindtrip-gap-analysis.md` — competitive feature comparison
- `.planning/todos/pending/2026-02-16-vrbo-plan-your-stay.md` — lodging integration (pairs with trip builder)

## Research

Research: .planning/todo-research/content-arch-brief.md (Section 2)
