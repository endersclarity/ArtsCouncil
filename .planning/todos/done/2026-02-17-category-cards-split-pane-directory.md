---
created: 2026-02-17T00:00:00.000Z
title: Category hero cards → split-pane directory explorer
area: design
files: []
---

## Problem

The four category hero cards (Atmosphere, Commerce, Culture, Community) are dead-ends. They look great but clicking them does nothing. They're supposed to be entry points into the cultural assets of Nevada County, grouped by theme.

## Vision

Clicking a category card takes you to a **50/50 split-pane directory view**:

### Left side: Asset directory list
- Filtered to that category's assets (e.g., Commerce → Eat/Drink/Stay venues)
- Scrollable list of venues/places
- **Clicking an asset expands it inline** (accordion-style) to show:
  - Description, business hours, upcoming events
  - Same info that currently lives in the slide-in detail panel
  - Google Maps link, website, phone
- Only one expanded at a time (clicking another collapses the previous)

### Right side: Interactive map (sticky)
- When you click an asset on the left, the map **zooms/flies to that location**
- Shows the asset's marker highlighted
- Map stays interactive — user can still filter categories to reduce noise
- Example flow: click Crazy Horse in the list → map zooms there → filter to Eat/Drink/Stay to see nearby bars → plan a bar crawl

### Interaction model
- Category cards are entry points with pre-applied filters
- Left list + right map stay synced (click either side, other responds)
- Filters available on both sides to narrow down (category pills on map, search on list)
- Mobile: stacks vertically (list on top, map below) or tabs between list/map views

## Existing plumbing to reuse
- `index-maplibre-explore-*.js` modules already have the asset directory list with search + pagination
- `index-maplibre-detail-*.js` modules have all the venue detail rendering (hours, events, description)
- Map flyTo + marker highlighting already works from the detail panel flow
- Category filtering already exists via pills
- The Phase 3.1 scroll-observer split layout (content column + sticky map) is a precedent

## Scope note
This is likely a full GSD phase, not a quick fix. It's a new page layout / navigation pattern that bridges the editorial hero with the interactive map experience.

## Research

Research: .planning/todo-research/content-arch-brief.md (Section 1)
