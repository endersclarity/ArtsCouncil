---
created: 2026-02-18T00:32:20.565Z
title: Directory map hover tooltips missing on nearby markers
area: ux
files:
  - website/cultural-map-redesign-stitch-lab/directory.html:372-408
  - website/cultural-map-redesign-stitch-lab/index-maplibre-asset-interactions.js
  - website/cultural-map-redesign-stitch-lab/index-maplibre-map-label-controller.js
---

## Problem

After clicking a venue card in the directory page and zooming into its location on the map (zoom 17, single intersection), hovering over nearby markers does **not** show the tooltip popup (name, thumbnail, category badge). The markers are visible but silent — no hover feedback at all.

This breaks the progressive disclosure pattern: the whole point of zooming in is to discover what else is nearby. A user sees a cluster of markers around their selected venue but can't find out what they are without clicking each one (which switches the expanded card). The map becomes a "black box" instead of the explorable surface it should be.

**On the hub page**, hover tooltips work perfectly at all zoom levels — the `assetInteractions.bindAssetInteractions()` module handles `mouseenter`/`mouseleave` on `assets-circle` and `assets-hit` layers, showing a `hoverPopup` with the venue's name, image, category, and city.

## Solution

Likely causes to investigate:

1. **`hoverPopup` not wired correctly** — The directory page creates `hoverPopup` and passes it to both `mapLabelController` and `assetInteractions`, but something may be preventing the hover events from firing (event propagation, layer ordering, or the popup getting removed).

2. **Category filter blocking hover** — When a category is active, `updateMapFilter()` sets a filter on `assets-circle` and `assets-hit`. If filtered-out features still intercept mouse events but don't match, the tooltip may silently fail.

3. **`buildFeatureTooltipHTML` callback** — The directory page provides its own tooltip builder. If it returns empty or errors, the popup won't show.

4. **Smart labels interfering** — `mapLabelController` manages hover state (`hoveredFeatureId`). If the label controller's hover handling conflicts with `assetInteractions`, one may suppress the other.

Debug approach:
- Add `console.log` to the `mouseenter` handler in `assetInteractions` to confirm events fire
- Check if `hoverPopup.setLngLat().setHTML().addTo(map)` is being called
- Compare the directory page's `bindAssetInteractions` config with the hub page's to find the gap
