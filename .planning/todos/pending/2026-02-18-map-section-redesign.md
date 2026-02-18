---
created: 2026-02-18T08:45:00.000Z
title: Map section redesign — clean up, integrate routes, fix legend
area: design
files:
  - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html
  - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.css
  - website/cultural-map-redesign-stitch-lab/index-maplibre-map-render-controller.js
  - website/cultural-map-redesign-stitch-lab/index-maplibre-bindings.js
---

## Problem

The map section has accumulated several visual and UX problems:

1. **"687 places" text** — appears prominently in the top-center of the interactive map header. Any reference to a specific place count should be removed. It's a dated metric that means nothing to a first-time visitor.

2. **Expand map button does nothing** — wired but non-functional. The map is already quite large. Options: (a) start the map smaller by default and let expand reveal current size, or (b) remove the button entirely.

3. **Bottom stats bar** — beneath the map, a bar reads "687 places across Nevada County · Editorial content adapted from MUSE · Built with MapLibre GL JS, Turf.js, GSAP." Remove entirely or consolidate into footer. No visitor needs to see this.

4. **Routes & Experiences section beneath the map** — visually disconnected. The curated routes (Highway 40/20/49 corridors) and themed experiences feel like an orphaned UI pattern that doesn't belong as a separate horizontal section beneath the map. Options: (a) absorb into the map's filter/legend overlay so users discover routes in context, or (b) compact/eliminate the section and link to experiences through the map interaction itself.

5. **Legend missing SVG markers** — the map legend shows category labels without the actual colored SVG marker icons used on the map. It should display the real markers so users know what they're looking at.

6. **Homepage section hierarchy** — the map section (a "tool") currently appears before the editorial "pitch" content. Visitor-first hierarchy should be: hero → pitch/editorial → quick CTAs → map. This is a scroll-order change, not new content.

7. **Directory map hover tooltips** — at zoom 17 in directory.html, hovering nearby markers shows no tooltip. The hub page's `assetInteractions.bindAssetInteractions()` handles this correctly via `mouseenter`/`mouseleave` on `assets-circle` and `assets-hit` layers. Something is broken in the directory page wiring.

## Solution

- Remove "687 places" and all place count references from the map section header
- Decide on expand button fate: either wire it to grow map from a smaller default, or remove
- Remove the bottom stats bar entirely; if tech attribution is kept anywhere, footer only
- Redesign or eliminate the Routes/Experiences section beneath the map — investigate integrating corridor/experience selection into the map legend/filter overlay
- Update the legend to show actual SVG marker icons matching the map layer symbols
- Reorder homepage sections: pitch/editorial before map (CSS/HTML reorder, no new content)
- Debug directory.html map hover tooltip wiring vs hub page implementation

## Notes

This section likely needs a Stitch redesign pass once the scope of changes is clear. Run that after the functional decisions are made (what stays, what goes, what moves).

## Absorbs

- `2026-02-17-homepage-section-reorder.md` — pitch-before-tools reorder is about the map section's position
- `2026-02-18-directory-map-hover-tooltips-missing-on-nearby-markers.md` — map UX fix, covered in same pass
