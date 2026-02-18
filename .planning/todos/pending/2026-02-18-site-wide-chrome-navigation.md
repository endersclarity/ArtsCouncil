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

---

## Roundtable Findings (2026-02-18)

See `.planning/EXECUTION-ORDER.md` for full ranked stack. Execution split across Tier 1 and opportunistic.

### Sticky nav — 15 minute fix (Tier 1)

Root cause: `position:sticky` failing inside a CSS grid row context. This is a known browser quirk — sticky only works when no ancestor has `overflow: hidden` or when the element is inside a flex/grid container that clips it. Check the nav's parent elements for `overflow` settings or grid row height constraints.

**This is a 15-minute isolated CSS fix.** Not a 2-3 hour project.

### Sub-page nav — 2 HTML blocks + 1 script (Tier 1, same session)

Tech-lead confirmed the recipe: copy 2 HTML blocks (the `.mast` element + the hamburger overlay) and include 1 script tag (the nav/hamburger JS) into each of the 4 sub-pages. ~15 minutes per page, ~1 hour total. Do this in the same session as the map quick wins.

### CSS token conflicts — opportunistic, NOT a scheduled task

Design-lead confirmed blast radius is near zero — every `var(--gold)` and `var(--cream)` consumer has a fallback value. The conflicts are cosmetic and section-local. Fix opportunistically the next time you're editing the stitch CSS. Do NOT schedule as a standalone task — it doesn't warrant its own session.

### Footer consistency

Scope TBD — defer until after sticky nav and sub-page nav are shipped. Assess what's actually needed once the nav shell is consistent.
