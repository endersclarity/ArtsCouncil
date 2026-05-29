# Data build scripts

Deterministic, dependency-free transforms over the V1 Discovery Map data.
Plain Node (ESM `.mjs`), tested with `node:test`. No `npm install` needed.

## CLA-15 — canonical place dataset

`build-places.mjs` turns the raw, duplicate-inflated, trust-mislabeled
`data/places.json` into a clean, deduped, provenance-honest inventory.

```bash
# dry run — writes data/places.clean.json and prints a report (no overwrite)
node scripts/build-places.mjs

# apply — backs up to data/places.backup.json, then overwrites data/places.json
node scripts/build-places.mjs --apply
```

The pipeline (`lib/pipeline.mjs` → `rebuildPlaces`) composes five pure modules:

| Module | Responsibility |
|---|---|
| `lib/dedupe.mjs`      | Collapse duplicate listings (same `id`) → one record; union enrichment; keep the highest-confidence coordinate; flag genuine same-tier coordinate conflicts. Exports `mergePlaceGroup` (reused by canonicalize). |
| `lib/canonicalize.mjs`| Collapse same-place-different-slug records ("The Center for the Arts" vs "Center for the Arts", "McGee's" vs "McGees") by normalized name+city. Co-location-guarded (~0.5mi) so distinct same-named places don't over-merge; preserves anchor/path-referenced ids as the survivor. |
| `lib/retier.mjs`      | Derive an honest trust tier from `coordinateSource`: Diana/ArcGIS → Map-Ready, census → Coordinate Candidate, none → Directory-Only. Overrides the dataset's blanket "Map-Ready" mislabel. |
| `lib/scope.mjs`       | Tag `inGvncScope` (Grass Valley / Nevada City + ridge towns). Never deletes out-of-area places. |
| `lib/anchors.mjs`     | Adopt a trusted twin's coordinate onto an anchor (e.g. Art Works Gallery); warn (do not fail) for anchors still on a candidate/none coordinate. |
| `lib/resolutions.mjs` | Apply human-reviewed coordinate-conflict resolutions (e.g. North Star House) and clear the conflict flag. Runs last so a human decision wins. |

### Output fields added/changed per place
- `markerTier`: `map-ready` | `candidate` | `directory-only` (consumed by CLA-16)
- `coordinateProvenance`: `diana` | `arcgis-confident` | `candidate` | `none` | `human-verified`
- `locationReviewStatus`: re-derived (census is no longer "Map-Ready")
- `inGvncScope`: boolean
- `coordinateConflict`: `true` only on unresolved same-tier conflicts (currently none)

## Diagnostics

`scan-name-dupes.mjs` reports any same-place-different-slug clusters remaining in
`data/places.json` (regression check for the canonicalize pass — should print 0):

```bash
node scripts/scan-name-dupes.mjs
```

## Tests

```bash
node --test scripts/lib/*.test.mjs
```

(Use the glob form; bare `node --test scripts/lib/` has a directory-resolution
quirk on this Node/Windows build.)
