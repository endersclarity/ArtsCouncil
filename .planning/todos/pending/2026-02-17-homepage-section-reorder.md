---
created: 2026-02-17T00:00:00.000Z
title: Reorder homepage sections (pitch first, tools second)
area: design
priority: medium
files:
  - .planning/roundtable/01-tourist-advocate.md
  - .planning/roundtable/06-synthesis.md
  - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html
---

## Problem

Tourist advocate identified a hierarchy problem: "Homepage leads with tools (hero carousel, map) instead of pitch (District Spread). Should reorder: pitch -> actionable links -> tools."

First-time visitors need to understand WHAT this is before they interact with HOW it works. Currently the hero carousel and filter pills dominate the first screen. The editorial "why Nevada County is amazing" content is buried below.

## Solution

Reorder HTML sections so the scroll flow is:
1. **Hero** — Magazine cover feeling (already exists, keep it)
2. **Pitch / District Spread** — "This is Nevada County's cultural district. Here's why it's worth your time." Brief editorial hook.
3. **Quick action links** — "What's Open Now" / "Tonight's Events" / "Plan a Trip" — CTAs that serve both locals and tourists
4. **Map + filters** — Interactive exploration
5. **Featured picks / Events** — Content discovery
6. **MUSE editorial** — Deeper storytelling
7. **Footer** — Colophon, credits

This is a CSS/HTML reorder, not new code. The content exists — it just needs a better scroll hierarchy.

## References

- Tourist advocate: "Homepage hierarchy is wrong — leads with tools instead of pitch"
- Tourist advocate: "Feels built for the committee, not tourists — too many features, not enough focus"
- Synthesizer: "Both sides win: tourists get editorial experience, locals get fast utility"

## Research

Research: .planning/todo-research/navigation-brief.md (Section 3)
