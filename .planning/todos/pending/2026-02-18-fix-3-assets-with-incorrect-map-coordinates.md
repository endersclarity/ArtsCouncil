---
created: 2026-02-18T00:20:14.832Z
title: Fix 3 assets with incorrect map coordinates
area: data
files:
  - website/cultural-map-redesign-stitch-lab/data.json
---

## Problem

3 out of 687 assets in `data.json` have geographically incorrect coordinates. They render as markers in completely wrong locations on the map:

| Idx | Name | Current x (lon) | Current y (lat) | Actual Location |
|-----|------|-----------------|-----------------|-----------------|
| 631 | Alan Thiesen Trail | -118.55 | 35.73 | Southern CA near Fresno (should be Nevada County) |
| 668 | Sawtooth Trailhead | -122.63 | 38.01 | Pacific Ocean west of CA coast |
| 99  | Coburn Music | -120.21 | 39.64 | Slightly north of county boundary |

All other 684 assets have valid coordinates. The 169 Truckee-area assets (-120.14 to -120.38) are legitimate eastern Nevada County locations.

## Solution

1. Look up correct coordinates for each asset via Google Maps or the original ArcGIS source
2. Update `data.json` entries at the 3 indices
3. Rebuild `data.json` in the stitch-lab copy if needed
4. Verify markers appear in correct locations on the map

Reference: Original ArcGIS REST endpoint for cross-checking:
```
https://services9.arcgis.com/dunJqHWsrgVVzHCy/arcgis/rest/services/{LAYER_NAME}/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson
```

---

## Roundtable Findings (2026-02-18)

See `.planning/EXECUTION-ORDER.md` for full ranked stack. This is Tier 1 (do today).

### Verify status before executing

STATE.md Phase 9-04 decisions may have already fixed Alan Thiesen Trail (idx 631) and Sawtooth Trailhead (idx 668). Check current `x` and `y` values in `data.json` before doing any work. If they're in Nevada County range (-120.0 to -121.0, 39.0 to 39.5), they're already fixed. Coburn Music (-120.21, 39.64) is the most likely to still need correction.

### Check experiences.json before shipping

Before updating or removing any coordinate entry, verify none of the 3 assets appear in `experiences.json`. If an asset is a stop in a curated route, coordinate changes must not break its stop reference.

### Dedup todo closed as invalid

The companion dedup todo (`2026-02-17-deduplicate-same-category-entries-in-data-json.md`) has been **closed as invalid** — those "duplicates" are multi-location businesses (Avanguardia Winery tasting room + winery, South Pine Cafe Nevada City + Grass Valley, The Pour House Truckee + Grass Valley). Avanguardia appears twice in `experiences.json` as intentional separate stops in a curated route. Do not delete them.

### Safe to edit

Data.json is read at runtime; no modules reference entries by array index. Coordinate changes are safe. Entry count changes are also safe — modules iterate generically.
