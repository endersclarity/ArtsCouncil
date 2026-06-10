# V1 Discovery Map Alpha Artifact

Status: current stitch-lab target of truth for V1 Discovery Map review

This folder is the current working artifact for V1 Discovery Map review. Agents should open, test, and modify this target unless the user explicitly asks for an older stitch-lab variant or the protected canonical project.

## Purpose

- Prove the V1 product shape in working code: NCAC-feeling shell, map-first opening, compact panel, Places / Events / Paths modes.
- Generate inspectable V1 data outputs from the Diana workbook, Arts Hub V2 coordinate reference, image references, and current Trumba RSS.
- Preserve decision and data-gap artifacts for stakeholder review and future design work.

## What This Is Not

- Not the protected canonical deployment.
- Not a deployed/public launch.
- Not an Arts Hub continuation.
- Not a reason to edit the older `index-maplibre-*` stitch-lab variants by default.

## Useful Outputs

- `data/places.json`: visible map-ready places.
- `data/coordinate_sanity_pass.json`: auditable coordinate decisions generated
  from Diana Workbook first, ArcGIS confident fallbacks second, and optional
  free US Census Geocoder matches.
- `data/coordinate_sanity_markers.geojson`: map-ready rows only; rows marked
  `Needs Location Review` are intentionally held out of this marker layer.
- `data/events.json`: current mapped event layer from live Trumba RSS.
- `data/paths.json`: three curated mapped path concepts.
- `docs/DATA-GAPS.md`: records and issues held out of the visible alpha.

## Coordinate Regeneration

```bash
python3 scripts/build-v1-coordinate-sanity-pass.py --run-census
```

The pass preserves Diana Workbook coordinates as authoritative, accepts ArcGIS
coordinates only through unique normalized name + city matches with no
address-number contradiction, and records Census matches as medium-confidence
street interpolation. `reports/v1-coordinate-sanity-pass-summary.json` reports
counts for Diana, ArcGIS, Census, rejected/low-confidence, and Needs Location
Review rows.

## Data Health Check

```bash
python scripts/audit-everything.py          # fast report, no network
python scripts/audit-everything.py --probe  # also probe image + website URLs (~2 min)
```

Prints a one-page report: marker/tier counts, coordinate bbox sanity, image
inventory (self-hosted vs. expiring Google links, with a dead-link probe),
website link rot, description provenance, and events freshness. Read-only.
Run it monthly, or whenever data changes; it names the deep-dive script to run
for anything it flags (image-audit.py, website-audit.py, audit-coords-census.py,
audit-coords-parcel.py, og-image-fullsweep.py).

## Recommended Next Use

Use this as source material for OpenDesign / Claude Design:

- Keep the information architecture and interaction proof if useful.
- Rework the visual treatment freely against the live NCAC site and Diana brand guide.
- Treat the data scripts and generated JSON as implementation reference, not design constraint.
