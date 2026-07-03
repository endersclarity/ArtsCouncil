# Loop: trail-data-layer

- **Goal:** Match BYLT + OSM trail data to the 233 "Walks & Trails / Needs Location Review" records in `data/places.json`; attach line geometry (sidecar `data/trails.json`), BYLT rich fields, and a representative trailhead coordinate; promote each matched record to `Map-Ready`.
- **Verifier:** `python scripts/verify-trail-data.py` — exits 0 only when: (1) raw pulls present (`scripts/bylt-trails.geojson` ≈342 feats, `scripts/bylt-trailheads.geojson` ≈74, `scripts/osm-trails-raw.json`); (2) `scripts/trail-match-report.json` is internally consistent with `data/places.json`; (3) every record the report marks matched has a trailhead `lat`/`lng`, a `trailRef` into `data/trails.json`, ≥1 BYLT field, and `locationReviewStatus == "Map-Ready"`; (4) matched-and-promoted count ≥ **150** of 233. Reads only on-disk artifacts — never the matcher's transcript or internals.
- **Floor revised 150 → 135** (user-sanctioned 2026-06-13): precise BYLT+OSM tops out at
  135; the ~45 OHV routes need USFS Tahoe NF (separate source). LOOP EXIT: **done**.
- **Max iterations:** 8
- **Stall rule:** 2 consecutive passes with no increase in promoted-trail count and no new commit.
- **Budget:** self-paced, in-session; soft cap 8 passes.
- **Notify:** final message — contract, verifier output, `trail-match-report.json` path, promoted count. (telegram-send if it runs long.)

Notes:
- Target 150 is a conservative floor (OSM alone = 140 by name; BYLT should add coverage). Higher is the aspiration; stall/max-iter bound the chase. On any exit, report the true N.
- Geometry lives in the sidecar so both later UI variants (category-enhance vs dedicated lens) read the same data.
- **Pilot before scale:** first matcher pass attaches only 2 canaries — `Alan Thiesen Trail` (BYLT misspells "Theisen" — fuzzy-match test) and `Hirschman Trail` — then stops for user verification before the full run.
- `places.json` is the canonical 1,351-record file. Writes must be idempotent and reversible (mirror `apply-coord-corrections.py`); keep a corrections log.

---

## Iteration log
<!-- append-only: pass #, attempted, verifier result, delta -->

### Pass 1 — fetch + scripts (2026-06-13)
- Wrote `scripts/fetch-bylt-trails.py`, `scripts/fetch-osm-trails.py`.
- Raw pulls present: `bylt-trails.geojson` (342 feats, Line/MultiLineString, 4 MB),
  `bylt-trailheads.geojson` (74 MultiPoint), `osm-trails-raw.json` (561 named, cached).
- Verifier: N/A (no matcher yet). Delta: +3 raw artifacts, +2 scripts. Continue.

### Pass 2 — matcher + pilot gate (2026-06-13)
- Wrote `match-trails.py` (read-only report), `apply-trail-matches.py` (idempotent+revert),
  `verify-trail-data.py` (independent).
- Pilot canaries PASS: `Alan Thiesen Trail` → BYLT `Alan Theisen Trail` (0.917, line+fields),
  `Hirschman Trail` → exact (1.000).
- Precision bug found+fixed: substring containment boost produced false positives
  (`Bear River Historic Bridge`→`Ridge Trail`, `Gray's Crossing`→`Cross Trail`,
  `Excelsior Trail`→`East Excelsior Point Road`). Now whole-token, ≥2-token containment.
- Coverage after fix: **135/233** matched (131 BYLT w/ line geometry + photo + difficulty,
  4 OSM points). All 135 trailheads in-county. Apply dry-run: would promote 135.
- Gap to 233: 45 OHV/ATV routes (USFS Tahoe NF — separate source per plan), private
  (Ananda/Kenny Ranch → directory-only), same-park sub-trail ambiguity.
- Verifier: not yet run against applied data (apply gated on user nod).
- **Below the 150 floor** — precise BYLT+OSM tops out ~135. Decision surfaced to user:
  apply 135 now (floor→135, USFS as follow-on) vs add USFS first. Delta: +3 scripts,
  report written, places.json UNTOUCHED. Paused at pilot gate.

### Pass 3 — apply + verify (2026-06-13) — LOOP EXIT: DONE
- User chose "apply 135 now." Ran `apply-trail-matches.py`: wrote `data/trails.json`
  (135 trails, 1.5 MB sidecar), promoted 135 records, log → `trail-apply-log.json`.
- map-ready: **875 → 1,010** (Walks & Trails 36 → 171). Beats incumbent's 686 further.
- Verifier `verify-trail-data.py --floor 135`: **RESULT: PASS** (135 promoted, 0 structural bad).
- App loads mutated places.json with no init error; `?debug=data` integrity check:
  "no data problems found". Live map render unconfirmed in preview (WebGL/basemap stall,
  `map.loaded()==false` — environment limit, not data; trail-line render is the next phase).
- Reversible: `python scripts/apply-trail-matches.py --revert`.
- **Open follow-on (not this loop):** USFS Tahoe NF fetch for the ~45 OHV routes;
  abbreviation/typo normalization (MC→Motorcycle, Emmigrant→Emigrant) for a few more.

LOOP CLOSED. Four-exit contract satisfied via `done`. State file kept as the data-layer record.
