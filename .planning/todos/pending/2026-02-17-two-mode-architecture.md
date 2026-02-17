---
created: 2026-02-17T00:00:00.000Z
title: Two-mode architecture (visitor mode vs local mode)
area: architecture
priority: low
files:
  - .planning/roundtable/02-local-advocate.md
  - .planning/roundtable/06-synthesis.md
  - .planning/roundtable/01-tourist-advocate.md
---

## Problem

The roundtable's core tension: the platform tries to serve both tourists and locals with one UX and satisfies neither fully. Tourist wants itineraries and trip planning. Local wants fast events and "what's happening tonight." The synthesizer's resolution: two-mode architecture.

## Solution

**Visitor Mode (default for new users):**
- Hero carousel, itineraries, MUSE editorial, Cultural Corridors, chatbot
- "Explore Nevada County" framing
- Full editorial experience

**Local Mode (opt-in):**
- Events-first layout, "Tonight" filter, saved favorites, neighborhood defaults
- No tourism content (no "Explore" language, no itineraries in hero)
- Fast utility-first interface

**Implementation:**
- Detect return visitors (3+ visits via localStorage counter) and offer "Switch to Local Mode" prompt
- `/local` URL path with simplified layout
- User preference stored in localStorage (no accounts required)
- Copy audit: remove "Explore Nevada County" and "plan your trip" language from local mode

**Timeline:** Phase 5 (2027). This is a strategic architecture decision, not a quick fix.

## References

- Synthesizer Tension 1: "Tourist vs. Local — Two-mode architecture"
- Local advocate: "Separate visitor content from local utility. Create a /local mode."
- Tourist advocate: "Feels built for the committee, not tourists"
