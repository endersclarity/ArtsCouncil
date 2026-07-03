# Outstanding work — consolidated 2026-07-03

State snapshot after the county-polish loop exited DONE (32/40, 0 P0/P1; log:
loops/archive/county-polish.md; final critique:
.impeccable/critique/2026-07-02__county-polish-rescore3.md). Everything still
open lives here so a fresh session can pick up without the transcript.

## In flight NOW (this session)

**P2 sweep** (owner-approved 2026-07-03, same push-as-you-go rules as the
county-polish loop): one batch, verify in the hidden-Chrome rig, one commit.
1. "Tonight" kicker on daytime events → "Today" when the event ends before
   ~5pm (eventWhenLine + rail `when` + is-tonight class check).
2. Trails missing from URL sync (mode rewrites to places, no trail param) —
   review-state.js mode whitelist + applyInitialReviewState restore.
3. Drawer top-right collision cluster: "‹ ALL ROUTES" clips long route
   titles; trail titles run under CLOSE; County view chip (z9) floats over
   open cards — CSS clearance fixes.
4. Search escape hatch "Show N more matches outside your filters" silently
   deletes the active chip — make the label say it clears filters.
5. Map-diamond event pick leaves a stale highlight in the events list —
   showEvent should re-render the list in events mode.
6. Route-stop tap desync (tab flips Places while URL says paths) — keep the
   Paths tab lit for stop cards opened inside paths mode.

## Owner-court (not agent work)

- **Drift motion judgment** — owner will watch it himself in a visible
  window (smoothness, orbit ~1.2°/s, stop pacing). Hidden rig cannot.
- **Corridor page linking** — phantom session task_a1561047 may land a link;
  otherwise it stays share-only by choice.
- Remaining rescore3 P3s: two event counts (mood row vs tab), path stop
  markers stacking at route-fit zoom, Drift chip unexplained until pressed,
  all-caps microlabels vs brand no-all-caps rule, italics register.

## Phantom sessions (merge-marshal loop, loops/merge-marshal.md, still ARMED)

- task_53b81ae7 photo-refresh job (~618/883 dead images) — OUT
- task_a1561047 corridor-page link (collision watch: index.html/app.js/css) — OUT
- task_bf00a1ff descriptions pilot (proposal-only; sweep needs owner OK) — OUT
- task_8070959d dead-website fixes (website fields only) — OUT
- task_40ea3890 contract-test repair — LANDED 1f9fe2c + integrated (marshal
  pass 1); a duplicate session may have been started 2026-07-03 — it should
  find tests green and no-op; if it pushes anything, review before merge.
- Marshal rules: verify each declared file scope, node --check + JSON parse +
  rig smoke after merge, both contract tests must stay green
  (node tests/test_v1_*.js from C:\Users\ender\Projects\CulturalAssetMap\app).

## Data flags (owner/data-owner court — do NOT auto-fix; sources:
rescore3 critique + .planning/data-flags-2026-07-02.md)

- Duplicate venue records "Nevada Theater" / "Nevada Theatre" (same 401 Broad
  St landmark, two dots).
- "The Lyric Rose Rose Theatre Company" malformed name; "Calanan Park --"
  double-hyphen gloss in name field.
- Stale June-20 reception prose inside a Trumba event description.
- 441 boilerplate descriptions (Walks & Trails heaviest) — suppressed in UI,
  real fix is task_bf00a1ff's pilot.
- ~618/883 dead remote photos — task_53b81ae7's job.
- Trail surface/use dirty values ("Natural Eath" ×3, case twins, combo
  strings) — canonicalized in UI; source data still dirty.

## Environment facts a fresh session needs

- Server: `python -m http.server 4180` in the repo dir (dies with session).
- Cache: bump `?v=` tokens in index.html after ANY app.js/styles.css edit
  (currently cla-88-pass7); python http.server never 304s.
- Hidden-tab rig recipe + gotchas: loops/archive/county-polish.md (pass 0)
  and the handoff at C:\Users\ender\AppData\Local\Temp\handoff-county-polish-2026-07-02.md.
  NEW gotcha: queryRenderedFeatures on SYMBOL layers stalls after setData in
  a throttled tab until a camera nudge — do not trust it (cost us a false P1).
- Nightly cron pushes data refreshes to origin/master — clean-tree
  `git pull --rebase` before commit; pre-commit hook wants a
  data/changelog.json entry; trailer "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>".
