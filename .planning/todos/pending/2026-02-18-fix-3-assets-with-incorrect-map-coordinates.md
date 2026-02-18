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
