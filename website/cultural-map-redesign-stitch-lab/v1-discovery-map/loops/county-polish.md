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
