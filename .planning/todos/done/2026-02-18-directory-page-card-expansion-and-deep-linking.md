---
created: 2026-02-18T00:20:14.832Z
title: Directory page card expansion and deep linking
area: design
files:
  - website/cultural-map-redesign-stitch-lab/directory.html
  - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.css
  - website/cultural-map-redesign-stitch-lab/index-maplibre-detail-view.js
---

## Problem

The directory split-pane page (`directory.html`) needs two features for QR code workflows and general usability:

1. **In-place card expansion**: Clicking a venue card should expand it to show full description, hours, address, phone, website, and Google Maps link. Image stays same size. Other cards in the grid row should NOT stretch. Smooth GSAP open/close animation. Click again to toggle closed.

2. **Deep linking via URL params**: `directory.html?place=Miners+Foundry` should open the page with that card pre-expanded and the map zoomed to it. Enables QR code scanning workflows.

3. **Duplicate tooltip fix**: Map markers were showing both a hover tooltip AND a click popup. Now only the hover tooltip fires; the card expansion handles the detail case.

## Solution

**Status: In progress (WIP in working tree)**

Implementation approach:
- `expandCard(asset)` injects `.directory-item-expanded` div into the clicked card
- `collapseCard()` animates removal with GSAP
- Grid gets `align-items: start` via `.has-expanded` class so row siblings don't stretch
- `detailView.buildDetailMetaHTML()` reused from hub's detail-view module for hours/address/meta
- `mapPopup` removed entirely (was causing duplicate tooltips)
- URL params: `?place=Name` and `?cat=Category` with `history.replaceState` sync
- Map zoom level 17 (one intersection visible)
- `h` (hours) field added to directory data loading

Key references:
- Content architecture research: `.planning/todo-research/content-arch-brief.md`
- Related todo: `2026-02-17-category-cards-split-pane-directory.md`
