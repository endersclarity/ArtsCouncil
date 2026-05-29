# CLA-15 — Canonical place dataset: dedup + trust-tier rebuild

Tracker: Linear **CLA-15** (child of **CLA-14** PRD). Decision record: [ADR-0001](../adr/0001-place-dataset-trust-tiers.md).
Sharpened via grill-with-docs, 2026-05-28.

## Goal

Turn `data/places.json` (1,959 rows, duplicate-inflated, trust-mislabeled) into a clean,
deterministic, provenance-honest inventory: one record per place, every normal marker a true
**Map-Ready Place**, Candidates demoted, Directory-Only preserved — produced by a reproducible
transform, not hand edits.

## Inputs (already on disk — do NOT regenerate from the workbook)

- `data/places.json` — the provenance-tagged inventory. Each row has `id`, `name`, `city`,
  `category`, `intent`, `coordinateSource`, `coordinateConfidence`, `locationReviewStatus`,
  `locationCaveat`, `publicMarker`, optional `anchor`/`musePick`/`image`/`description`/`address`/`phone`/`website`.
- `data/anchor_cards.json` — 10 cards keyed by `placeId`; the 6 Primary Anchors must keep matching ids.
- `data/paths.json` — path stops embed `placeId` + `lng`/`lat`; stop coordinates must stay valid after the pass.

## Modules (pure, testable — extract from the render code)

### 1. `dedupePlaces(rows) -> rows`
Collapse by `id`. Merge rule:
- Rank `coordinateConfidence`: `authoritative`(3) > `high`(2) > `medium`(1) > `needs-review`(0).
- Keep the highest-ranked row's coordinate + provenance fields.
- Among equal rank, prefer the row with `anchor`, then `musePick:true`, then a real `image`, then the longest `description`.
- **Union enrichment** across collapsed rows: `musePick` = OR; keep any `anchor`; keep the best `image`; keep first non-empty `address`/`phone`/`website`.
- Deterministic tie-break: by `coordinateDecisionId` ascending, so re-runs are stable.

### 2. `retierTrust(place) -> place`
Re-derive trust from `coordinateSource`, overriding the mislabeled `locationReviewStatus`:
- `diana-workbook-*` | `arcgis-cultural-assets-confident-match` → `locationReviewStatus: "Map-Ready"`, `publicMarker: true`, `coordinateProvenance: "diana"|"arcgis-confident"`, no routine caveat.
- `us-census-geocoder` → `coordinateProvenance: "candidate"`, `publicMarker: true` but `markerTier: "candidate"`, keep `locationCaveat: "Map location not confirmed - estimated"`. **NOT** `"Map-Ready"`.
- `none` → `coordinateProvenance: "none"`, `publicMarker: false`, `locationCaveat: "Map location coming soon"` (Directory-Only).

### 3. `applyScope(place) -> place`
Tag `inGvncScope` = city ∈ {Grass Valley, Nevada City, + Ridge/nearby allowlist}; Truckee and
other out-of-scope cities → `inGvncScope: false`. Do not delete. (First-load visibility +
sampler will filter on this tag; render change is a separate small follow-up, not this issue.)

### 4. `reconcileAnchors(rows, anchorCards) -> rows`
For each of the 6 Primary Anchor `placeId`s, assert the kept record has
`coordinateProvenance ∈ {diana, arcgis-confident}`. Known fixes:
- **Art Works Gallery:** the anchor card points at `art-works-gallery-grass-valley` (census) while
  `art-works-gallery-co-op-grass-valley` carries the Diana coordinate — merge so the anchor uses the Diana coord.
- **The Center for the Arts** (`the-center-for-the-arts-grass-valley`): on census; verify against
  314 W Main St and upgrade to a confident/Diana coordinate (or flag for human verification if no trusted source exists).
- Any anchor still on census after reconciliation → **fail the build** with a clear message; anchors may not ship on suspect coords.

## Output

A Node script `scripts/build-places.mjs` (the app is vanilla JS; keep the toolchain JS) that
reads `places.json`, runs `applyScope ∘ retierTrust` per row then `dedupePlaces` then
`reconcileAnchors`, and writes back `places.json` (write to `places.clean.json` first, diff,
then swap). Pure transforms in `scripts/lib/` imported by both the script and the tests.

## Tests (assert external behavior, not internals)

Fixtures of hand-built rows:
- Duplicate `id` across two sheets, same tier → collapses to one, enrichment unioned.
- Duplicate `id` spanning tiers (census + diana) → keeps the Diana coordinate.
- A `us-census-geocoder` row → ends `markerTier: "candidate"`, NOT `Map-Ready`.
- A `none` row → `publicMarker:false`, "Map location coming soon".
- A Truckee row → `inGvncScope:false`, still present.
- An anchor id on census with a Diana twin → reconciled onto the Diana coordinate.
Prior art: `prototypes/trusted-coordinate-map/build_trusted_data.py` (the parse) — but tests are new.

## Acceptance

- `places.json` has 1,425 unique `id`s, zero duplicate ids.
- `locationReviewStatus: "Map-Ready"` count ≈ 572 (Diana + ArcGIS), not 1,603.
- All 6 Primary Anchors resolve to a Diana/ArcGIS coordinate (build fails otherwise).
- No two records share an identical coordinate unless genuinely co-located.
- `anchor_cards.json` placeIds and `paths.json` stop placeIds still resolve.
- Re-running the script on its own output is a no-op (idempotent).

## Sequencing with sibling issues

1. **CLA-15 (this)** — data contract first. Unblocks the rest.
2. **CLA-16** — render Candidates distinctly using `markerTier`/`coordinateProvenance` from this pass.
3. **CLA-19** — recalibrate constellation density against the de-duplicated data.
4. **CLA-18** — marker hierarchy (anchor rings, drop category icons) on the clean set.
5. **CLA-17** — the `place-density` query-guard bug is independent; can land anytime.

## Out of scope (this issue)

First-load/sampler scope filtering UI, the Candidate marker *visual* (CLA-16), density tuning
(CLA-19), MapTiler basemap. This issue only produces the clean, correctly-tiered dataset and
the build script + tests.

## Phase 0 — RESULTS (executed 2026-05-28)

The verification spike ran (throwaway probe + satellite view). Premises resolved:
- **Geocode cross-check** (GVNC sample, existing census coord vs independent OSM/Nominatim):
  agree **0.00–0.04 mi** where both resolve. Census coords are reproducible address geocodes.
- **Satellite visual** (downtown GV): The Center for the Arts + Art Works Gallery (census) and
  112 W Main + 4th of July Parade (Diana) all land on the correct W Main blocks; North Star
  House (Diana) matches its real location. **No pins "in the bushes."**
- **`none` recovery:** ~50% of GVNC no-coord rows placeable via OSM; rest are PO-box/rural →
  legitimately Directory-Only.

**Verdict — the coordinates are largely trustworthy; the marker mess is duplication +
category-icon clutter, NOT bad coordinates.** Revisions to the approach above:
- **GO** on `dedupePlaces` + `retierTrust` — that's the whole win, low-risk.
- **`recoverAddresses` is DOWNGRADED to optional** — do NOT mass re-geocode the 962 census
  rows (they're fine; kept as visually-distinct Candidates via CLA-16). Only the ~50%-placeable
  `none` rows are worth an optional OSM pass.
- **`reconcileAnchors` softens to a warning**, not a build-fail — the 2 census anchors (The
  Center, Art Works) are correctly placed; merging Art Works onto its Diana twin is cleanup.
- The dedup coordinate-conflict rule (the ~24 divergent dup-ids) STILL stands.

Throwaway audit artifact: `prototypes/_audit/sat.html` (deleted after review).

## IMPLEMENTED (2026-05-28)

Built test-first (`node:test`, 28 tests, all green) under
`website/cultural-map-redesign-stitch-lab/v1-discovery-map/scripts/`:
`lib/dedupe.mjs`, `lib/canonicalize.mjs`, `lib/retier.mjs`, `lib/scope.mjs`,
`lib/anchors.mjs`, `lib/resolutions.mjs`, composed by `lib/pipeline.mjs`
(`rebuildPlaces`) and run by `build-places.mjs`. See `scripts/README.md` for commands.

**Two layers of duplication** (both required — the second was found by the user
mid-build): id-duplicates (same `id` cross-listed across category sheets) AND
**same-place-different-slug** (the slug was derived from the name, so "The Center for
the Arts" vs "Center for the Arts", "McGee's" vs "McGees" became distinct ids). The
second is closed by `canonicalize` — grouping on normalized name+city, guarded by a
~0.5mi co-location check, preserving anchor/path-referenced ids. See **Canonical
Place** in `CONTEXT.md`. Exactly 10 such clusters existed; all collapsed; scan is now 0.

**Applied result** (`places.json`: 1,959 → 1,415 rows; backup at `places.backup.json`):
- Unique places: **1,415**, zero duplicates (id OR slug-variant). Idempotent.
- Map-Ready: **572** (was a blanket 1,603) · Coordinate Candidate: **524** · Directory-Only: **319**.
- Coordinate conflicts: **0** after resolution (1 was flagged: North Star House).
- Anchor warnings (soft, non-blocking): **2** — asif-studios, hirschman's-pond. The
  Center auto-cleared (inherited its Diana slug-twin's coord); Art Works adopted its Diana twin.
- `anchor_cards.json` + `paths.json` placeIds: **0 orphans**.
- App verified via CDP: loads the 1,415-row set, no console errors, no "Unable to load"
  leak; "Center for the Arts" now resolves to a single place record.

**Human resolution applied:** North Star House had three Diana listings; two agreed on
39.1965/-121.0779 and one lonlat row was an outlier the auto tie-break unluckily picked.
Per human review (2026-05-28), the correct location is **12075 Auburn Rd → 39.196523,
-121.077862** (not "Old Auburn Rd"). Recorded in `lib/resolutions.mjs::KNOWN_RESOLUTIONS`;
the conflict flag is cleared and the record is `coordinateProvenance: "human-verified"`.

Note: `markerTier` is now in the data but the app still renders all `publicMarker:true`
places identically — styling Candidates distinctly is **CLA-16** (next).
