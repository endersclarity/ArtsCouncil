---
created: 2026-02-18T06:54:46.060Z
title: Sub-page visual polish pass — bring events, itineraries, directory, and trip pages up to hub standard
area: design
files:
  - website/cultural-map-redesign-stitch-lab/events.html
  - website/cultural-map-redesign-stitch-lab/itineraries.html
  - website/cultural-map-redesign-stitch-lab/directory.html
  - website/cultural-map-redesign-stitch-lab/trip.html
---

## Problem

The hub (`index-maplibre-hero-intent-stitch-frontend-design-pass.html`) received a full Stitch-lab design pass in Phase 01.1 — editorial masthead, hero carousel, magazine typography hierarchy, gold/cream/ink palette, sticky nav, consistent spacing. The sub-pages were built functionally but never got this treatment.

Currently:
- `events.html` — raw layout, no editorial header, doesn't feel like the same product
- `itineraries.html` — plain card grid, minimal styling, orphaned from the hub aesthetic
- `directory.html` — got a Phase 9 functional redesign but still lacks the editorial masthead/header treatment of the hub
- `trip.html` — functional trip builder but visually disconnected from the hub

All four pages look like a different (worse) product compared to the hub. A visitor who navigates from the hub to events.html experiences a jarring visual downgrade.

## Solution

Run a Stitch-lab design pass on each sub-page focused on:
- Consistent sticky masthead/nav matching the hub (brand mark, nav links, hamburger, My Trip badge)
- Editorial section header with page-specific hero treatment (not a full carousel — a simpler editorial banner)
- Typography hierarchy matching hub: Playfair Display headings, DM Sans body, gold accent colors
- Consistent color palette: cream background, ink text, gold accents, category colors
- Footer matching the hub

This is a design/visual pass, not a functional rebuild. The functionality on these pages is solid — they just need the aesthetic shell to match.

Priority order: events.html (highest traffic), itineraries.html, trip.html, directory.html (already partially addressed in Phase 9).
