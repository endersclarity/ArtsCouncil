---
created: 2026-02-18T08:45:00.000Z
title: Site-wide chrome & navigation consistency
area: design
files:
  - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html
  - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.css
  - website/cultural-map-redesign-stitch-lab/events.html
  - website/cultural-map-redesign-stitch-lab/itineraries.html
  - website/cultural-map-redesign-stitch-lab/directory.html
  - website/cultural-map-redesign-stitch-lab/trip.html
---

## Problem

The top nav (Explore Nevada County · Events · Itineraries · Directory · Map · MUSE · QR Demo · My Trip · search magnifying glass · hamburger) vanishes past a scroll breakpoint on the main page — somewhere around the MUSE section, it completely disappears. This needs to be sticky at all times.

None of the sub-pages (events.html, itineraries.html, directory.html, trip.html) carry the uniform top nav. A visitor navigating from the hub experiences a jarring visual downgrade — it looks like a different product.

The bottom footer on the main page does not mirror the top nav in content or structure. The tech attribution line ("Editorial content adapted from MUSE, built with MapLibre GL JS, Turf.js, GSAP") currently appears in a stats bar near the map — if it belongs anywhere it's in the footer, but it's probably not necessary at all.

CSS tokens also conflict: old base styles from before the Codex magazine layout pass clash with the new editorial aesthetic (`--cream`, `--ink`, `--gold` palette) in inconsistent ways across sections.

## Solution

- Fix sticky nav behavior so it remains visible at all scroll depths on the main page
- Apply the uniform top nav (`.mast-inner` structure: brand mark, nav links, search, hamburger, My Trip badge) to every sub-page as a consistent header shell
- Update the footer on the main page to mirror the top nav in links and brand presence (inspired by what was built in the colophon update — rich footer with nav links, brand, address)
- Remove or relocate the MapLibre/Turf.js/GSAP tech attribution line — if kept at all, footer only
- Audit CSS custom property conflicts between legacy base styles and magazine layout tokens; resolve in favor of magazine direction

## Absorbs

- `2026-02-18-sub-page-visual-polish-pass.md` — uniform nav + editorial shell on all sub-pages is the same scope
- `2026-02-16-visual-consistency-sweep.md` — CSS token conflicts between old base and Codex magazine layout
