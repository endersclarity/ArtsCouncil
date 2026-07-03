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
