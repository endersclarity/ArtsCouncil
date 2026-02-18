---
created: 2026-02-18T08:45:00.000Z
title: Trip page & concierge overhaul — redesign, fix dream board, polish UX
area: product
files:
  - website/cultural-map-redesign-stitch-lab/trip.html
  - website/cultural-map-redesign-stitch-lab/index-maplibre-chat-widget.js
  - website/cultural-map-redesign-stitch-lab/index-maplibre-chat-view.js
  - website/cultural-map-redesign-stitch-lab/index-maplibre-chat-controller.js
  - website/cultural-map-redesign-stitch-lab/index-maplibre-dreamboard-model.js
  - website/cultural-map-redesign-stitch-lab/index-maplibre-dreamboard-view.js
  - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html
---

## Problem

### trip.html — Visually bland and functionally confusing

The trip page exists and has the functional plumbing from Phase 8, but it:
- Looks like a wireframe — totally disconnected from the hub's editorial aesthetic
- Is missing the uniform top nav (Explore Nevada County · Events · Itineraries · Directory · Map · MUSE · QR Demo · My Trip · search · hamburger)
- Needs a full Stitch redesign to feel like part of the same product

### "Start exploring" CTA — Wrong behavior

The "Start exploring" button on trip.html returns the user to the top of the main homepage. That's not the intent. The purpose of this button isn't clear — needs rethinking. Possible correct behaviors: scroll to the map section, open the directory, or open the concierge with a planning prompt.

### AI concierge style cards — Cheap and bulky

After clicking "Start exploring," the main page shows AI concierge style cards (e.g., "Plan a family friendly day in Nevada County with kids"). These cards:
- Are large, blocky, and cheap-looking — dominate the entire viewport
- Need a visual rework to feel more editorial and less like a survey widget

### Concierge loading — No feedback

While the concierge is processing a request, there is no loading animation. Need animated dots or a typing indicator to show work is in progress.

### Itinerary output — Too compact

The concierge response ("Family Fun in the Foothills · One Day · Five Stops · Day One: Gold Mines and Steam Engines · 5 stops") is extremely terse. The concierge should be more conversational and expansive — actually speak to the stops, give context, feel like a knowledgeable local friend describing a day, not a bullet list.

### Dream board — Places not saving

Clicking "Save to Trip" in the detail panel (e.g., Columbia Hill Schoolhouse via a cultural corridor) does NOT persist to the dream board on trip.html. This may be a data-type issue — events may save correctly but venue/place saves are broken. The localStorage key `ncac-dreamboard` should store both places and events.

### Dream board empty state — No guidance

When the dream board is empty, it says "Save places and events you love while exploring and they'll appear here" but doesn't communicate WHERE on the site the bookmark icon can be found. Users exploring the map or reading about corridors don't know to look for the + bookmark icon on detail panels.

### "My Trip" vs named trip — Confusing

In the trip selector, the default "My Trip" label coexists with AI-generated named trips (e.g., "Family in the Foothills"). The distinction is not clear. "My Trip" appears to be empty/placeholder while the named trip holds actual content. The naming and hierarchy needs to be simplified.

### "View and edit on trip page" — Works but lacks context

After the concierge generates an itinerary, clicking "View and edit on trip page" successfully imports the itinerary. This flow is correct. But without context about what just happened, it feels disconnected — users don't know the itinerary appeared there.

## Solution

1. **Stitch redesign pass on trip.html** — uniform top nav, editorial aesthetic, cream/ink/gold palette, proper section hierarchy
2. **Fix "Start exploring" behavior** — rethink intent; probably should open concierge pre-seeded with a planning prompt or navigate to the map
3. **Rework style cards** — reduce size, make editorial, remove bulky button treatment
4. **Add loading animation** — typing dots in concierge while awaiting response
5. **Loosen itinerary output** — update system prompt or post-processing to encourage more conversational, expanded itinerary descriptions
6. **Fix dream board place persistence** — debug `ncac-dreamboard` localStorage write when saving venues/places (not just events) from detail panel
7. **Improve empty state guidance** — add a visual cue or inline tip pointing users to the bookmark icon on detail panels and directory cards
8. **Clarify trip naming** — consolidate "My Trip" concept with named trips; remove confusing dual-label UI
