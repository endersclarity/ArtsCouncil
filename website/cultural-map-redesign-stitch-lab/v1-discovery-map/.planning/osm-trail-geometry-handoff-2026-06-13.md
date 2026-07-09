# Handoff — OSM trail geometry + always-on path-network context

Written 2026-06-13 for a post-compact session that will run this via **/loopify**.
Everything needed is here; do not re-research. Decisions are settled.

## The one-line goal
Make the trail LINES accurate by sourcing geometry from **OpenStreetMap** (the same data
already drawing the basemap's dashed paths) instead of BYLT's stubs, and show the **whole OSM
path network as a faint, always-on context layer** so trails visibly continue. Keep BYLT's
rich meta (difficulty/length/photo). This is the user-approved "recommended path."

## Why (the finding that triggered this)
On `localhost:4175` the user selected "Coyote View Loop Trail." Our red line was an **8-vertex,
0.15 mi BYLT stub**, while the basemap showed a long dashed path continuing to North Bloomfield Rd.

Diagnosis (verified this session):
- The **dashed lines are OpenStreetMap** `highway=path/footway/track`, baked into the OpenFreeMap
  "liberty" basemap tiles (`tiles.openfreemap.org`). Free, public, **ODbL**. Far more complete
  than BYLT. A 1.5 km box around Coyote View held **31 OSM ways, 1,606 vertices**.
- **We threw OSM geometry away.** `scripts/fetch-osm-trails.py` used `out ... center;`, keeping
  only a centroid POINT per way. That is why OSM never contributed lines and BYLT (stubs) did.
- **The catch — naming.** A countywide OSM name search for "Coyote View" returns **0**. The
  geometry exists but is unnamed (23 of those 31 ways) or filed under a bigger trail
  (`Round Mountain Trail`, `South Yuba Trail`). Only BYLT carries the local name "Coyote View Loop."

So: OSM solves *geometry*; BYLT solves *naming + meta*. The two must be blended.

## Scope decision (what this loop DOES and does NOT do)
- DOES: re-pull OSM with full geometry; prefer OSM line geometry for trails OSM names with HIGH
  confidence (keep BYLT meta); add an always-on faint OSM path-network context layer to both
  trail UIs.
- DOES NOT (explicitly deferred): **spatial snapping** (tracing the OSM path through a BYLT
  trailhead to recover geometry for trails OSM doesn't name, e.g. Coyote View Loop). The user
  chose "OSM geom + path context," NOT the spatial-snapping option. Coyote-View-type cases stay a
  BYLT stub for the highlighted line; the always-on context layer is their visual mitigation.
- ALSO DEFERRED (pre-existing follow-ons): USFS Tahoe NF for the ~45 OHV routes; BYLT licensing OK.

## Current state (git + servers)
- Repo root: `C:\Users\ender\Projects\CulturalAssetMap\app` (a monorepo). Site dir:
  `website/cultural-map-redesign-stitch-lab/v1-discovery-map` (relative to root).
- Branches:
  - `master` @ 3eb7297 — untouched.
  - `trail-data-base` @ 29d48f0 — submission form + BYLT/OSM trail **data layer** (the main
    checkout at repo root is on this branch). Shared baseline for the worktrees.
  - `trail-ui-category` @ 4a46e59 — **Structure A** (trails inside the Walks & Trails / "Outdoors"
    filter; no new mode). Worktree: `C:\Users\ender\Projects\CulturalAssetMap\cultural-map-worktrees\trail-ui-category`.
  - `trail-ui-lens` @ 63a4b8e — **Structure B** (dedicated "Trails" mode tab + filter/sort + list).
    Worktree: `C:\Users\ender\Projects\CulturalAssetMap\cultural-map-worktrees\trail-ui-lens`.
- Both UIs share an identical "trail core" (see below). The structure pick (A vs B) is still
  OPEN — the user is comparing them; this loop must not break either.
- Servers (my background `python -m http.server`; may not survive compaction — restart if down):
  - A: `python -m http.server 4174 --directory "<category worktree>/website/cultural-map-redesign-stitch-lab/v1-discovery-map"`
  - B: `python -m http.server 4175 --directory "<lens worktree>/website/cultural-map-redesign-stitch-lab/v1-discovery-map"`
- The in-tool browser preview CANNOT render MapLibre here (WebGL stalls → map shows "Loading…").
  DOM (lists, panels, detail cards) IS verifiable; the map paint needs the user's real Chrome.

## Data shapes (already in the committed data on trail-data-base)
`data/trails.json` (geometry sidecar): `{ "type":"trail-geometry-sidecar",
  "trails": { "<placeId>": { "geometry": <GeoJSON>, "trailhead":[lng,lat], "source":"bylt"|"osm",
  "matchedName":..., "hasLine":bool } } }`
Each promoted place (category "Walks & Trails", `locationReviewStatus:"Map-Ready"`) carries
`trailRef` (= place id) and `trail` (difficulty, length_txt, length_mi, surface, uses, permitted,
url, photo, altitude, manager, blurb, source, matchedName). 135 promoted (131 hasLine), map-ready 1,010.

## The "trail core" already in BOTH worktree app.js (do not rebuild; extend)
`flattenTrailCoords`, `trailFor(place)`, `drawSelectedTrail(place)`, `clearTrailLine()`,
`fitTrail(place)`, `renderTrailFacts(place)`; `trail-lines` source + `trail-line-casing` /
`trail-line` layers (added in `addMapLayers`, `beforeId: "place-density"`); selection wired in
`showPlace`. `DATA.trails="data/trails.json"`; loaded into `state.trails` in `init()`.

---

# Implementation plan

## Part 1 — OSM full geometry (DATA layer, on `trail-data-base`)
Work in `C:\Users\ender\Projects\CulturalAssetMap\app\...\v1-discovery-map\scripts\`.

1. **`fetch-osm-trails.py`**: change the Overpass query from `out tags center;` to
   `out tags geom;` (or add a `--geom` flag and run it). **GOTCHA:** Overpass returned HTTP
   403/406 today for requests without a real User-Agent — add
   `headers={"User-Agent": "NCAC-cultural-map/1.0"}` to the `urllib.request.Request`. Re-fetch
   with `--force` (the cached `osm-trails-raw.json` has centroids only). Optionally also pull
   `rel[route~"hiking|foot"]` for named multi-segment trails. Each way now has a `geometry`
   array of `{lat,lon}`.

2. **`match-trails.py`**: in the OSM branch, build a LineString from the way's `geometry`
   (`[[lon,lat],...]`) instead of a Point from `center`. Change the geometry-source rule:
   - Compute best BYLT match (existing) and best OSM match (existing, whole-token fuzzy).
   - **Geometry** = OSM line IF the OSM name match is HIGH confidence (score ≥ **0.92**, i.e.
     near-exact — keeps precision; do NOT lower this or false positives return) AND the OSM way
     has ≥2 vertices; ELSE BYLT line (if BYLT matched); ELSE OSM point / BYLT point.
   - **Meta** (`trail` object fields) = BYLT's whenever BYLT matched, regardless of geometry
     source (OSM lacks difficulty/length/photo). Record both `geomSource` and `metaSource` in
     the report for transparency.
   - Emit a summary line: counts of geometry by source (osm-line / bylt-line / point).

3. **`apply-trail-matches.py`**: no structural change; re-run to regenerate `data/trails.json`
   (idempotent; `--revert` restores). Confirm `data/places.json` trail meta unchanged.

4. **`verify-trail-data.py`**: must still PASS (`--floor 135`). Extend it to also assert the
   report's `geomSource` counts are self-consistent and print "OSM-line: N / BYLT-line: M".

5. Commit on `trail-data-base` (this changes data + scripts, not the live app.js, so the
   changelog hook may not fire; if it does and this is data-only, `SKIP_CHANGELOG=1` is fine).

## Part 2 — Always-on OSM path-network context (shared trail-core UI, BOTH worktrees)
The basemap tiles ALREADY contain the full OSM path network. **Restyle the basemap's existing
path layers** to read as faint trail context — no new data, no overlay.

- The app retints the Liberty basemap in `warmStyleObject` / `applyWarmBasemap` (it iterates the
  style's layer list by id pattern). At runtime, inspect the fetched style object to find the
  path layers: Liberty puts them in the **`transportation` source-layer** with `class` in
  `path`/`track`/`footway` (layer ids often like `highway-path`, `highway-minor`...). Log the
  style's layer ids once to confirm, then target the path-class layers.
- For those layers, raise visibility at trail zoom (≈ z11+): a subtle brand-tinted dashed line
  (e.g. `--ncac-red` at low opacity, or a warm gray), slightly heavier than default, so the
  network reads as "trails" without overpowering roads. Keep it BELOW `place-density` and the
  `trail-line` highlight. Gate by zoom so the county view isn't a web of dashes.
- FALLBACK if restyling tile layers proves awkward: add a faint geojson overlay from a
  county-wide OSM path pull (the Part-1 `out geom` data, all ways not just matched). Heavier;
  prefer the restyle.
- This is identical code in both worktrees. After Part 1 commits on `trail-data-base`,
  `git merge trail-data-base` into each worktree branch to inherit the new `data/trails.json`
  + scripts, THEN add the context-layer code to each worktree's `app.js` (same edit both),
  and commit each (`SKIP_CHANGELOG=1` — internal comparison candidates, changelog at final merge).

---

# Suggested /loopify contract
- **Goal:** trail lines source OSM geometry where OSM names the trail (BYLT meta retained), and
  both trail UIs show the OSM path network as faint always-on context.
- **Verifier** (deterministic parts; command, independent of the worker):
  `python scripts/verify-trail-data.py --floor 135` PASSES, AND a check that
  `scripts/trail-match-report.json` reports ≥ **40** trails with `geomSource=="osm"` line geometry
  (re-measure after the geom re-pull; set the floor to the honest first-run number minus a margin),
  AND `node --check app.js` passes in BOTH worktrees, AND grep confirms the path-context layer code
  (a stable marker string/comment you add, e.g. `osm-path-context`) in both worktree app.js, AND
  both servers (4174/4175) return 200.
- **Max iterations:** 8. **Stall:** 2 passes with no rise in OSM-line count and no new commit.
- **Pilot:** first pass re-pulls OSM geom + re-matches and reports the OSM-line count for 2-3
  named canaries (pick trails OSM names — e.g. `Hirschman Trail`, `Round Mountain Trail`,
  `South Yuba Trail`) BEFORE regenerating the full sidecar; user eyeballs that the OSM line is
  fuller than the BYLT stub. Coyote View Loop will NOT improve (unnamed in OSM) — that's expected.
- **Notify on exit** with the OSM-line/BYLT-line counts and both URLs.
- Honest note for the loop: the map RENDER (the actual fuller lines + faint network) is not
  deterministically verifiable here (WebGL stalls); the verifier covers data + syntax + presence,
  and the user confirms the visual at 4174/4175.

# Pointers
- Plan: `.planning/gap-closure-plan-2026-06-12.md`. Prior data-layer loop: `loops/trail-data-layer.md`.
- Memory: `~/.claude/projects/C--Users-ender-Projects-CulturalAssetMap-app/memory/trails-data-sources.md`.
- Don't re-derive the sources or the Coyote View finding — they're settled above.
