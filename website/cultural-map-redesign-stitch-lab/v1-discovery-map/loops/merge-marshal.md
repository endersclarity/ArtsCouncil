# Loop: merge-marshal

Self-created 2026-07-02 on owner's open mandate ("create yourself a goal or a
loop"). Reason: FIVE concurrent writers now touch this repo — this session's
county-polish loop plus four owner-launched worktree sessions — and the repo's
history says unmarshalled parallel writers clobber each other.

- Goal: each of the four spawned sessions ends with its work either reconciled
  into origin/master (reviewed, verified, changelog intact) or explicitly
  rejected with a written reason — and zero cross-session clobbering of
  index.html / app.js / styles.css / data/*.json.
  - task_53b81ae7 — Google Places photo-refresh job (data/places.json images)
  - task_a1561047 — corridor-page link on the map (index.html/app.js/styles.css
    — COLLISION RISK with county-polish fix passes; reconcile by rebase, mine
    lands first if simultaneous)
  - task_bf00a1ff — boilerplate descriptions pilot (proposal-only; sweep needs
    owner approval — do NOT merge a sweep without it)
  - task_8070959d — dead-website fixes (data/places.json website fields only)
- Verifier (per integration, never self-graded by the merging pass): node
  --check app.js + python -c json.load on touched data files + live smoke of
  index.html via the hidden-Chrome rig (boot, mode tabs, drawer, rail, Drift
  chip present) + diff inspection that each branch touched ONLY its declared
  files.
- Trigger: task-end notifications re-invoke this session; no polling.
- Max iterations: 8 integration passes.
- Stall rule: 2 consecutive passes with nothing integrable (all sessions still
  running or all remaining work rejected).
- Budget: rides county-polish's soft cap (one working day); push authority
  inherited from the county-polish owner authorization (2026-07-02).
- Notify: final message — per-task disposition table + commit list. Archive
  this file to loops/archive/ on exit.

## Iteration log
(append-only: pass #, task integrated, verifier result, delta)

### Pass 1 — 2026-07-02: task_40ea3890 (contract-test repair) INTEGRATED
- The chip session pushed 1f9fe2c to origin/master on its own (repo write
  access from its worktree): repaired both contract-test fixtures + re-pointed
  3 post-dedupe MUSE sampler ids; declared file scope respected (tests/,
  data fixtures, changelog).
- Reconciliation: its changelog entry conflicted with county-polish pass 3's
  on rebase — resolved keeping both (mine newest-first).
- Verified: `node tests/test_v1_coordinate_caveat_contract.js` and
  `test_v1_public_beta_copy_contract.js` both PASS on master 576093b; JSON
  valid. Disposition: integrated, no follow-up.
- Still out: task_53b81ae7 (photos), task_a1561047 (corridor link — collision
  watch on index.html/app.js/styles.css), task_bf00a1ff (descriptions pilot,
  proposal-only), task_8070959d (dead websites).
