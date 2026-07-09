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

- Pass 1 (2026-07-03): targets 1-2. Retired text-transform:uppercase on
  outing-browse-title, section-label, selected-place-close, trail-facts dt,
  trail-control-label, anchor-context-chips span, review-search-label,
  directory-record-meta dt, seen-in-muse-item small, anchor-card-meta strong,
  detail-location, event-feature-venue, drift-bar-label (tracking trimmed to
  match). Kept as sanctioned marks: site-nav, alpha-pill, kickers/eyebrows
  (intro kicker, marker-preview-kicker, detail-eyebrow, place-feature-flag),
  badges (place-list-badge, image-proof-label, placeholder-label,
  anchor-demo-badge), rail-card-tab poster tab, mobile map town labels.
  Italics: surprise em + description-provenance -> upright; new
  seen-in-muse-item em rule (story cue was default italic); path-stop/event
  list em already normal. Verified live via chrome rig (computed styles:
  tt=none on all retired selectors, Close/chips/meta confirmed in an open
  detail card); both contract tests green. Commit d49f077, pushed,
  token cla-91-register. Delta: register violations cleared per grep;
  re-critique deferred until after pass 2.

- Pass 2 (2026-07-03): targets 3-4. Twin event counts reconciled by labeling
  units: mood-row Events count renders "74 venues" (places hosting events)
  vs Events tab "48 upcoming events" — different units now self-explanatory.
  Hairline consistency: 3 ad-hoc color-mix ink hairlines (event-list +
  trail-list row dividers, mobile nav border) -> var(--line). Measure/rag
  found already handled (text-wrap balance/pretty rules exist from county
  polish). Verified live ("Events | 74 venues" rendered, no JS errors);
  contract tests green. Commit c49530e, pushed, token cla-92-taste2.
  Next: fresh re-critique decides exit.

- Pass 3 (2026-07-03) — EXIT: DONE. Fresh critic scored **35/40** (baseline
  32), **0 P0, 0 P1, zero brand-register violations** — computed-style sweep
  found uppercase only on sanctioned chrome (nav, alpha pill, Start-here
  flag, route kicker, category badge), zero italics anywhere, UI dates
  guide-perfect. Critique at
  .impeccable/critique/2026-07-03__design-taste-rescore.md. Verified-fixed
  from prior backlog: Tonight→Today, trails/route-stop URL sync, selection
  sync, filter-clear hatch copy, collision cluster. Remaining P2s handed to
  owner via the critique: Events topline "49 upcoming events" vs list
  "22 · 49 dates" (occurrences vs series), search doesn't filter map dots
  while claiming "…on the map", Makers route blurb reads as ad copy.
  Rail/Drift motion unjudgeable in the rig this round (rig artifact, prior
  verification carries). Score arc: 32 → 35/40. Commits: d49f077, c49530e.
