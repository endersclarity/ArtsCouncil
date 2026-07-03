# Loop: design-taste

- Goal: the main map surface (index.html + app.js + styles.css at
  http://localhost:4180/index.html) carries ZERO brand-register violations and
  scores >= 33/40 on a fresh critique with zero P0/P1 — a /design-taste-frontend
  craft pass, CSS/copy only, no behavior changes, no motion changes, no
  data changes. (Baseline: 32/40, rescore3 2026-07-02.)
- Known targets (from four independent critiques, start here):
  1. All-caps microlabels vs the brand no-all-caps rule: "WHAT ARE YOU IN THE
     MOOD FOR?" (outing-browse-title), "BEFORE OR AFTER", trail-facts dt
     text-transform uppercase, CLOSE button, tag chips — retire text-transform
     where the brand voice wants sentence case; keep weight/size for hierarchy.
  2. Italics register: italics are for major works only — business
     self-descriptions and list metadata lose them (hidden-gems <em>, event
     list <em>, path stop <em> etc. — restyle, keep semantics).
  3. The two unexplained event counts (mood row "Events 74" vs Events tab
     "48 upcoming") — reconcile or label so they explain themselves.
  4. Micro-typography: measure/rag on panel copy, spacing rhythm between
     panel sections, hairline consistency, focus-ring register — small,
     confident moves only; the surface's calm is its strength.
- Verifier: fresh critique agent per re-score (same brief as
  loops/archive/county-polish.md: brand sources NCAC-V1-BRAND.md + live page
  in real Chrome via the hidden-tab rig, 10-heuristic /40 scale, writes to
  .impeccable/critique/). PLUS a register grep: no text-transform: uppercase
  on visitor-facing copy outside sanctioned marks, no <em> on non-work text.
- Worker pass: fix 1-2 targets -> bump ?v= tokens (currently
  cla-90-corridor-nav) -> verify live in the rig -> clean-tree
  `git pull --rebase origin master` -> commit with data/changelog.json entry
  -> push (owner authorized push-as-you-go 2026-07-03, "I trust you ... go
  nuts", everything revertible per-commit).
- Max iterations: 6 worker passes.
- Stall rule: 2 consecutive re-critiques with no score improvement, or 2
  worker passes producing no commit.
- Budget: self-paced in-session; soft cap half a working day.
- Scope guards (binding): brand tokens fixed (#ff2500 + --ncac-red-text
  ramp, ink/paper, Polymath); one red framing device; NO new motion
  (gsap-core explicitly declined for the map — owner ruling 2026-07-03);
  no data/places.json rewrites; marker-hierarchy contract is the tripwire;
  contract tests must stay green (node tests/test_v1_*.js from
  C:\Users\ender\Projects\CulturalAssetMap\app).
- Rig caveat (hard-won): queryRenderedFeatures on SYMBOL layers stalls in
  the throttled tab until a camera nudge — never trust it; full recipe in
  loops/archive/county-polish.md.
- Notify: final message — baseline vs exit score, commit list, critique
  path. Archive this file to loops/archive/ on exit.

## Iteration log
(append-only: pass #, attempted, verifier result, delta)
