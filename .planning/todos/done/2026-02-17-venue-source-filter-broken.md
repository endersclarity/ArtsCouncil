---
created: 2026-02-17T00:00:00.000Z
title: "Bug: Golden Era & Bodhi Hive event filters return nothing"
area: events
files:
  - website/cultural-map-redesign-stitch-lab/index-maplibre-events-filter-ui.js
  - website/cultural-map-redesign-stitch-lab/index-maplibre-events-model.js
---

## Problem

The "By Source" dropdown in the events filter has venue entries (Golden Era, Bodhi Hive, Crazy Horse) that filter on `source_type`. But `source_type` is the **ingestion method** (feed, ical, squarespace, json), not a venue identity slug.

- `source:goldenera` looks for `source_type === "goldenera"` → actual value is `"squarespace"` → **0 results**
- `source:bodhihive` looks for `source_type === "bodhihive"` → actual value is `"squarespace"` → **0 results**
- `source:crazyhorse` → works by coincidence (`source_type` happens to be `"crazyhorse"`)

Events DO exist: Golden Era has 7, Bodhi Hive has 1, Crazy Horse has 12.

## Fix

Either:
1. Filter by `source_label` instead of `source_type` (e.g., match "Golden Era Lounge")
2. Add a `source` slug field to events in the merge pipeline (e.g., `"goldenera"`)

## Also

Venues-as-sources mixed with aggregator-sources (KVMR, GVDA) in same dropdown optgroup is conceptually confusing. Consider separating "By Venue" from "By Source" or rethinking the filter UX.
