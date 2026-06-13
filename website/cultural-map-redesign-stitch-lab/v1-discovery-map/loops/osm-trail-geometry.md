# Loop: osm-trail-geometry

- **Goal:** Trail lines source OSM line geometry where OSM names the trail with HIGH confidence
  (score ≥ 0.92, BYLT rich meta retained); both trail UIs (`trail-ui-category`, `trail-ui-lens`)
  show the OSM path network as a faint, always-on context layer by restyling the basemap's
  existing `transportation` path layers (no new data).
- **Verifier (deterministic):** `python scripts/verify-trail-data.py --floor 135` PASSES, AND
  `scripts/trail-match-report.json` reports ≥ `OSM_FLOOR` entries with `geom_source=="osm"` line
  geometry (`OSM_FLOOR` fixed after the pilot = honest first count − margin), AND `node --check
  app.js` passes in BOTH worktrees, AND grep finds the marker `osm-path-context` in BOTH worktree
  `app.js`, AND servers 4174/4175 return 200.
- **Max iterations:** 8
- **Stall rule:** 2 consecutive passes with no rise in OSM-line count and no new commit.
- **Budget:** self-paced, in-session.
- **Notify:** final message with osm-line / bylt-line counts + both worktree URLs.

## Pilot (gates the loop)
Pass 1 re-pulls OSM with `out geom` + re-matches and reports the OSM-line vertex count vs the BYLT
stub for named canaries (Hirschman / Round Mountain / South Yuba), BEFORE regenerating the full
sidecar or touching places.json. User eyeballs that OSM lines are fuller than BYLT stubs.
Coyote View Loop will NOT improve (unnamed in OSM) — expected, mitigated by the context layer.

## Non-goals (deferred)
Spatial snapping for unnamed trails; USFS Tahoe NF OHV (~45); BYLT licensing OK.

## Iteration log

### Pass 1 — DATA (PASS, pilot gate cleared)
- Re-pulled OSM with `out geom` + User-Agent: **2833 named ways with geometry** (was 561
  centroid-only). `fetch-osm-trails.py` now requests geometry and treats a centroid-only cache
  as stale.
- Rewrote `match-trails.py`: builds OSM LineStrings; **length-based "fuller line wins"** selection
  (OSM line only at name score ≥ 0.92, else BYLT), BYLT rich meta always retained; records
  `geom_source`/`geom_ref` split from meta `source`/`ref`. Fixed a sub-threshold BYLT-line leak
  (`bylt_has_line` now gated on `bylt_ok`).
- `apply-trail-matches.py`: consumes `geom_source`/`geom_ref`, `osm_line_by_id()` replaces the dead
  `center`-reading `osm_point_by_id()`; sidecar records `geomSource` (ODbL provenance).
- `verify-trail-data.py`: prints geom-source counts, asserts OSM-line ≥ `OSM_LINE_FLOOR` (30).
- **Result:** matched **159/233** (was 135). Geometry: **OSM-line 36** (17 stub-fixes e.g. Missouri
  Bar 2.19→3.71 km, Round Lake 2.09→3.47 km; 19 new trails BYLT lacks e.g. Coldstream 3.36 km) +
  BYLT-line 114 + point 9. map-ready **1034**. Pilot canaries (South Yuba / Hirschman / Round
  Mountain) correctly KEEP BYLT (fuller). Coyote View Loop stays its BYLT 0.23 km stub (OSM unnamed)
  — expected; context layer (Part 2) is its mitigation. `verify-trail-data.py` → PASS.
- OSM_FLOOR fixed at 30 (contract's optimistic 40 corrected to the honest 36 − margin).
- Committed on `trail-data-base` as **a3b343c** (with a plain-language changelog entry).

### Pass 2 — UI context layer (PASS)
- Merged `trail-data-base` (a3b343c) into both worktrees (clean, no conflicts; also brought MUSE).
- Added the always-on context layer by restyling the Liberty basemap's own `transportation`
  path/track layers (no new data): dashed `[2,2]`, zoom-gated opacity (0 below z10.5 → 0.55 by
  z15) and width, kept under the place dots and the selected `trail-line`. Marker `osm-path-context`.
  Identical edit in both worktrees (Structure A app.js ~L2872, Structure B ~L3048).
- Committed: **trail-ui-category aa4b294**, **trail-ui-lens 0f07524** (SKIP_CHANGELOG — comparison
  candidates; the changelog entry lands with the eventual structure-pick merge).

### EXIT: done (verifier passes)
- `verify-trail-data.py` PASS · OSM-line 36 ≥ floor 30 · `node --check` OK both worktrees ·
  `osm-path-context` present in both · servers 4174/4175 → 200, serving the updated app.js + the
  159-trail / 36-OSM-geom `data/trails.json`.
- NOT deterministically verifiable here (WebGL stalls in the in-tool preview): the actual map
  PAINT — fuller red lines + the faint dashed network. User confirms in real Chrome at the URLs.
- Still OPEN (user's call, not the loop's): pick Structure A vs B; the winner merges to master and
  carries the changelog entry. Deferred as before: spatial snapping, USFS OHV (~45), BYLT licensing.
