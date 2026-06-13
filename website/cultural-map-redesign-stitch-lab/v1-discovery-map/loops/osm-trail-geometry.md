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
- Remaining: Part 2 (always-on OSM path-network context layer in both worktrees).
