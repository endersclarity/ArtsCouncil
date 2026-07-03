# Loop: drift-polish

- Goal: `fable-drift.html` passes every item in `loops/drift-polish.spec.md` — all 14
  deterministic checks and all 3 judged scores ≥ 4 — per an independent verifier.
- Verifier: fresh general-purpose subagent that reads ONLY the spec + the artifact
  (source + live page at http://localhost:4173/fable-drift.html?motion=1), never this
  loop's worker transcript. It writes `loops/drift-polish.verdict.json`.
- Max iterations: 6
- Stall rule: 2 consecutive passes with no verdict delta (same failing items, same scores).
- Budget: self-paced /loop in-session; one coherent fix batch per pass.
- Notify: final chat message with the last verdict JSON + what changed per pass
  (no telegram tool available in this session).

## Iteration log
(append-only: pass #, attempted, verifier result, delta)

### Pass 1 — 2026-06-11
- Attempted: initial build (pre-loop) verified as-is.
- Verifier: FAIL — 11/14 deterministic, J1=4 J2=4 J3=5 (all pass).
  Failing: D3 (dot-click/HUD pauses are silent, no wheel toast), D4 (dial never
  refilters anchor-dots/anchor-labels; Night still shows gallery anchors),
  D13 (#000000 hover circle-color off-palette, lines 485/496).
- Verifier tooling notes to pass forward: hidden preview window pauses rAF and
  stalls MapLibre style load — shim rAF onto setTimeout and re-trigger source
  load; preview reports prefers-reduced-motion so CSS animations are suppressed
  even with ?motion=1; screenshots time out (hidden WebGL) — use evals only.
- Delta vs prior: first verdict (baseline).

### Pass 2 — 2026-06-11
- Attempted: fix batch for the three failures — (D3) dot-click and HUD pauses now
  call loud pause() so the "You have the wheel" toast fires whenever a running
  broadcast is interrupted; (D4) syncDialFilter now composes the daypart filter
  into anchor-dots AND anchor-labels; (D13) removed off-palette #000000 hover
  color, hover keeps its radius bump in canonical ink. Bonus: play() rebuilds
  the broadcast pool after a single-place focus (no one-song loop on resume).
- Verifier: PASS — 14/14 deterministic, J1=4 J2=4 J3=5. Fresh agent, live-driven
  (real WheelEvent/MouseEvent/KeyboardEvent), motion=1 and motion=0, 800px and
  375px layouts, full source palette sweep. Verdict: drift-polish.verdict.json.
- Delta vs prior: D3/D4/D13 flipped to pass; no regressions; J unchanged (J3=5).

## Outcome
EXIT: DONE on pass 2 of 6 — verifier passed. State archived to loops/archive/.
