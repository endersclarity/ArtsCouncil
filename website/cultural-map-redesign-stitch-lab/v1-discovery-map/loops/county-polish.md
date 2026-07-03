# Loop: county-polish

- Goal: the main discovery-map surface (index.html + app.js + styles.css at
  http://localhost:4173/index.html) scores >= 30/40 on a fresh independent
  critique with ZERO P0s and ZERO P1s, every fix committed with a changelog
  entry. (Baseline for scale: 2026-06-12 critique scored 21/40 with 3 P0s.)
- Verifier: fresh critique agent per re-score — reads ONLY the brand/design
  sources (docs/brand/NCAC-V1-BRAND.md canonical, DESIGN.md, PRODUCT.md) and
  the LIVE page in real Chrome (agent-browser / claude-in-chrome, desktop
  ~1440 AND mobile ~390, console + screenshots), never the worker's
  transcript. Writes a scored critique with ranked P0/P1/P2 backlog to
  .impeccable/critique/. Same 10-heuristic /40 scale as the 2026-06-12
  baseline so scores are comparable.
- Worker pass: `git pull --rebase origin master` (nightly events cron) ->
  fix the top 1-3 open backlog items as one coherent batch -> verify that
  specific fix live in real Chrome -> commit with changelog entry (pre-commit
  hook enforces). Re-critique after every ~3 fix passes or when the backlog
  empties; the re-critique is what can exit the loop.
- Pass 0 (before any critique): live-verify Drift mode (cla-87, uncommitted)
  in real Chrome — flight, touchdown card, orbit, wheel-take, Esc, reduced
  motion N/A in-browser. Sound -> commit it. Broken -> it becomes backlog
  item #1.
- Max iterations: 12 worker passes.
- Stall rule: 2 consecutive re-critiques with no score improvement, or 2
  worker passes producing no commit.
- Budget: self-paced in-session (ScheduleWakeup between passes); wall-clock
  soft cap: one working day.
- Scope guards (binding, from owner rulings): assets map only; canonical
  brand tokens (#ff2500 red, functional palette fixed); one red framing
  device; no marker rainbow / icon soup / legend inflation; GSAP on marketing
  surfaces only, map camera stays MapLibre; no data/places.json content
  rewrites (data fixes get flagged, not made); marker-hierarchy contract is
  the regression tripwire; reduced-motion alternatives mandatory.
- Push policy: OWNER AUTHORIZED 2026-07-02 — push each commit to origin/master
  right after `pull --rebase`.
- Notify: final message — contract, baseline vs exit score, commit list,
  last critique path, screenshots. State file archived on exit.

## Iteration log
(append-only: pass #, attempted, verifier result, delta)

### Pass 0 — 2026-07-02
- Attempted: live-verify Drift mode in real Chrome (hidden-tab rig: rAF shim +
  frame abort + style retrigger + repaint pump; contract seam ?contract= for
  the map handle). Verified: boot guard, 42-stop pool (anchors lead, reshuffles
  per start), soar/dive flight lands pitch ~46 / z15.5, real card + drawer +
  URL sync on touchdown, auto-advance (stops 1→5 unattended), wheel-take pause
  ("you have the wheel", glyph ▶), resume, Esc end + camera flatten + rail
  return, ZERO console errors. Unverifiable while tab throttled: orbit rate,
  motion smoothness — carried to the next visible-window pass. Hardening found
  and fixed: settle fallback so a stalled GSAP ticker never strands the bar;
  cache tokens bumped to cla-87-drift2 (python http.server never 304s; token
  bump is the only reliable bust).
- Result: Drift committed a03719c and PUSHED with the two audit commits
  (7b83a2a, b0d2a40); origin/master = a03719c.
- Next: Pass 1 = fresh critique agent scores the surface, builds the backlog.

### Pass 1 — 2026-07-02 (critique + first fix batch)
- Verifier result: fresh critique landed at
  .impeccable/critique/2026-07-02__county-polish-pass1.md — **26/40**
  (baseline 21/40), 1 P0 + 4 P1s. Caveats: motion/orbit, basemap tint, and
  mobile 390px unjudged (hidden tab).
- Merged backlog (critique + .planning/a11y-audit-2026-07-02.md A0/A1s):
  1. [P0] trail cards ship pipeline copy (caveat-over-route, alpha-review
     boilerplate, photo-not-sourced block) — **FIXED this pass**
  2. [P1] trail filters expose dirty data, silent-exclusion — **FIXED this pass**
  3. [P1] trails mode first paint = empty map
  4. [P1] stranded viewport, no county-reset affordance
  5. [P1] drift bar occluded by drawer at short viewports
  6. [A0] drawer close destroys focus (app.js closeSelectionDrawer)
  7. [A0] mode-tabs tablist wraps role-less buttons (index.html:66 + syncModeTabs)
  8. [A1] rail re-render drops focus; [A1] no Escape-to-close drawer;
     [A1] red-on-white 3.81:1 (.trail-facts dt, .featured-muse-badge-link);
     [A1] drift bar live-region announces twice per stop
  9. [P2s] tab/panel/mode 3-way disagreement; ISO dates + recurrence flood in
     events list; stale search compounds with filters; one static legend for
     all modes; trails missing from URL sync. [P3 batch] per critique.
- Attempted (batch 1 = items 1-2, display-only per no-data-rewrite guard):
  visitorDescription()/isPipelineBoilerplate() suppress alpha-review copy on
  cards + rail; renderLocationCaveat suppressed when trailFor(place).hasLine;
  renderImage skips the placeholder figure for trail places; trailTokens()
  canonicalizes surface/use combo strings + "Natural Eath" typo for options,
  matching, and card display. Tokens bumped cla-88-pass1.
- Verified live (real-Chrome rig, tab 646762187): surface options collapsed
  6→3 clean values, use options 4 clean; Hiking filter = 117/159 (combo
  strings now included); Alan Thiesen Trail card: no coming-soon, no
  alpha-review, no photo block, route line drawn (6 features), facts show
  "Natural Earth / Hiking, Biking"; non-trail regression (NCAC card):
  description + image block intact; no eval-visible errors; node --check ok.
- Note: BOTH app-level contract tests (tests/test_v1_coordinate_caveat_contract.js,
  test_v1_public_beta_copy_contract.js) fail on PRISTINE master — data-fixture
  drift, pre-existing, not this loop's doing. Spawned owner chip task_40ea3890
  to repair.
- Next: batch 2 = items 3-4 (trails first paint + county reset).

### Pass 2 — 2026-07-02 (fix batch 2: backlog items 3-4)
- Attempted: (a) Trails-lens network layer — trail-lines source now carries ALL
  filtered trails as quiet ink lines (per-feature `selected` flag keeps the one
  red framing device for the pick; white casing selected-only), synced through
  setSourceData/clearTrailLine so filters, selection, and mode exits all agree.
  (b) County-view reset chip (#county-reset, top-right map overlay, brand chip
  register, hidden while drifting, 44px coarse target) → eases to the initial
  county view, pitch/bearing flattened.
- Verified live (rig, tab 646762187): trails first paint = 150 line features
  drawn (9 of 159 are trailhead-only); select Thiesen → 150 features / exactly
  1 selected, camera z16; County view click → camera exactly home (-121.04,
  39.24, z10.7, pitch 0); back to Places → 0 features (network cleared);
  screenshot shows network + chip + clean filters at first paint. node --check
  clean. Tokens cla-88-pass2.
- Next: batch 3 = drift-bar occlusion (P1-5) + drawer focus/Escape (A0-1,
  A1-2) + tabs ARIA (A0-2).

### Pass 3 — 2026-07-02 (fix batch 3: P1-5 + A0-1 + A0-2 + A1-2)
- Attempted: (a) drift-bar z-index 7→9 + `body.drifting .selection-drawer
  { max-height: calc(100% - 88px) }` — the tour's controls always win the
  bottom band. (b) Drawer focus continuity: captureDrawerOpener() at the TOP
  of showPlace/showEvent (list re-renders destroy the opener before
  openSelectionDrawer runs — found live), restore on close with re-find by
  data identity (data-place / data-trail-place / data-rail-index) and
  .mode-tab.active landmark fallback. (c) Escape closes the open drawer
  (drift Esc keeps priority; Escape inside text controls keeps native
  meaning). (d) mode-tabs: role tablist→group + aria-pressed synced in
  syncModeTabs.
- Verified live (rig): Miners Foundry row focus → open → Esc → drawer closed
  AND focus back on the same rebuilt row; Escape in the search box does NOT
  close the drawer; aria-pressed follows mode clicks (places:false
  events:true …); bar z=9 and drawer max-height calc(100%-88px) under
  body.drifting. Two test-rig false alarms diagnosed, not product bugs:
  starting-view #places-list is display:none (invisible rows refuse focus)
  and location.href reuses cached app.js (token bump required). Tokens
  cla-88-pass3c. node --check clean.
- Remaining backlog: A1-3 contrast (trail-facts dt, muse-badge-link), A1-4
  drift live-region spam, A1-1 rail re-render focus, P2 batch (tab/panel
  disagreement, ISO dates + recurrence flood, stale search, static legend,
  trails URL sync), P3 batch.
- Next: batch 4 = A1 trio, then RE-CRITIQUE (3 fix passes done).

### Pass 4 — 2026-07-02 (fix batch 4: A1-3 + A1-4 + A1-1)
- Attempted: (a) `--ncac-red-text: #d61f00` (5.18:1 on white, computed) for
  .trail-facts dt + .featured-muse-badge-link; decorative #ff2500 untouched.
  (b) Drift live-region: aria-live off the bar; new sr-only
  #drift-bar-announce (polite + atomic) written once per stop on arrival
  only. (c) renderDiscoveryRail preserves keyboard focus across the innerHTML
  swap (re-find by data-rail-index, first-card/track fallback). Added .sr-only
  utility.
- Verified live (rig): --ncac-red-text resolves #d61f00; rail focus survives
  chip switch (stayed on a card, not body); drift start → announce reads
  "Now at Center for the Arts, stop 1 of 42" exactly once on arrival; bar has
  NO aria-live; Esc exit clean. node --check ok. Tokens cla-88-pass4.
- MERGE-MARSHAL note: task_40ea3890 landed 1f9fe2c (contract tests repaired,
  both PASS on master now); changelog rebase conflict resolved keeping both
  entries (see loops/merge-marshal.md pass 1).
- Backlog now: P2 batch + P3 batch only (no known P0/P1-class items open).
- Next: RE-CRITIQUE (fresh agent, same brief/scale) — this decides the exit.

### Pass 5 — 2026-07-02 (re-critique verdict)
- Verifier result: fresh critic (county-critic-2) scored **31/40** (26 pass 1,
  21 June baseline) — .impeccable/critique/2026-07-02__county-polish-rescore.md.
  **0 P0, 2 P1.** All five pass-1 P0/P1s confirmed fixed live; zero console
  errors. Score gate (>=30) MET; zero-P1 gate NOT met.
- New P1s: (1) recurring event floods rail (4/19 cards) + events list (5+
  consecutive rows) — needs recurrence collapse on both surfaces; (2) search
  silently ANDs with active mood chips — "theatre" + Art chip hides the
  Nevada Theatre (3 shown vs 8 unfiltered) with no cue.
- P2s noted for later/backlog: back-button overlaps card titles; "Presented
  by NCAC" stamped on third-party Trumba events (misattribution); ISO dates
  in events list; trails URL sync; paths stop-tap tab flip. Data flags routed
  to the data owner in the critique.
- Next: pass 6 = fix both P1s, verify, then final re-critique.

### Pass 6 — 2026-07-02 (fix batch: the two remaining P1s)
- Attempted: (a) recurrence collapse — rail dedupes events by title+venue in
  BOTH batches of buildRailItems (first fix missed the second
  `events.slice(4,8)` — caught live), card date line carries "· N dates";
  events list groups series to one row (first upcoming date leads, "· N
  dates" in the venue line), header reads "Events (22 · 48 dates)", list
  dates now shortEventDate ("Jul 2") not raw ISO (P2 folded in).
  (b) search × chips: renderPlacesList counts query matches the active
  chips exclude and renders "Show N more matches outside your filters"
  (clears chips, keeps query) in both the results and empty states.
- Verified live (rig): rail 19 cards ZERO duplicate titles; events list 22
  grouped rows zero dupes; "theatre" + Art chip = 3 shown + hint "Show 5
  more matches" → click → 8 shown incl. Nevada Theatre (critic's exact
  repro); node --check ok. Tokens cla-88-pass6b.
- Next: final re-critique (fresh agent) — decides done.
