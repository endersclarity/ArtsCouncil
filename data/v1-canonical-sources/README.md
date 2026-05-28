# V1 Canonical Sources

This folder collects the named source artifacts for V1 Discovery Map data work.
It exists to stop future work from pulling coordinates or place identity from
unlabeled legacy files.

## Trusted Source Artifacts

### Diana Workbook

Files:

- `diana-workbook.xlsx`
- `diana-workbook.numbers`

Original locations:

- `docs/source-artifacts/Cultural Assets - data engineering.xlsx`
- `docs/source-artifacts/Cultural Assets - data engineering.numbers`

Use for:

- Place identity
- Source descriptions
- Public contact fields where appropriate
- Diana-provided coordinates where present

Do not assume every row has coordinates.

### ArcGIS Cultural Asset Export

Files:

- `arcgis-cultural-assets.geojson`
- `arcgis-cultural-assets.csv`

Original locations:

- `data/cultural-asset-map/all_cultural_assets.geojson`
- `data/cultural-asset-map/all_cultural_assets.csv`

Use for:

- Coordinate fallback when matched confidently to a Diana Workbook row
- Reference against the older Arts Council ArcGIS cultural asset map

Do not use as the full V1 identity source when the Diana Workbook has newer or
broader place coverage.

## Quarantined Reference

### Arts Hub Coordinate Bridge

File:

- `DO-NOT-TRUST-arts-hub-coordinate-bridge.json`

Original location:

- `website/arts-hub-v2/data/cultural-assets.json`

Use for:

- Investigation only
- Historical comparison

Do not use for public V1 markers by default. This file is derived, mixed, and
not trusted as canonical coordinate data.

## Current Trust Rule

Public map markers should come from:

1. Diana Workbook coordinates where present.
2. ArcGIS Cultural Asset Export coordinates when matched confidently to Diana
   Workbook rows by normalized name and city.
3. US Census Geocoder coordinates only when the free batch pass produces a
   Nevada County street-address match. Treat these as medium-confidence
   MAF/TIGER address-range interpolations, not storefront/building certainty.
4. Manual verification for primary anchors and routes when needed.

Do not use the Arts Hub Coordinate Bridge as the default coordinate fallback.

## Coordinate Sanity Pass

Regenerate the auditable coordinate pass with:

```bash
python3 scripts/build-v1-coordinate-sanity-pass.py --run-census
```

Outputs:

- `website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/coordinate_sanity_pass.json`
- `website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/coordinate_sanity_markers.geojson`
- `reports/v1-coordinate-sanity-pass-summary.json`
- `reports/v1-census-geocoder-candidates.csv`

The generator reads only the Diana Workbook and ArcGIS Cultural Asset Export
from this folder. It does not read the quarantined Arts Hub Coordinate Bridge.
Rows without trusted coordinates remain `Needs Location Review` and are excluded
from the map-ready GeoJSON.
