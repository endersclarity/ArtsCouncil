# Plan — prompting guides + GSAP into the discovery map

Date: 2026-06-13. Source: YouTube `HqD5a2Cae60` (harness/skills walkthrough), transcript
saved at `transcripts/HqD5a2Cae60-transcript.txt`. Mirrors the Claude Code task list
(tasks #1–#4) so it survives a session restart. Update both together.

## The two concepts being ingested

**Prompting guide.** Each model release ships a guide for driving that model. Moves worth
keeping: effort is the main lever (max for animation work, fewer retries); ask for design
alternatives first (Opus 4.8 guide named the default-style bias; Fable 5 dropped the note
but still drifts ~2/3 of the time, so the older guide still earns its keep); make
verification explicit (sub-agent checks output against the brand file); give product context
(AGENTS.md/CLAUDE.md). Workflow: paste an existing design prompt + the new model's guide
into Claude, ask for a rewritten skill. Refreshes a stale skill in one step.

**GSAP (GreenSock Animation Platform).** JS animation library. CSS animates one property at
a time; GSAP sequences whole timelines, drives SVG/canvas, reverses and interrupts cleanly,
and ties motion to scroll via ScrollTrigger. Free in full since the Webflow acquisition
(ScrollTrigger, SplitText, all former paid plugins). Rule from the video: GSAP belongs on
**marketing** UI; keep **functional** UI quiet — and the map is functional UI.

## Ground truth (this repo)

- Main app: `index.html` + `app.js` + `styles.css`. Map is MapLibre GL (`unpkg`).
- Animations today: CSS only (`@keyframes`/`transition:` in `styles.css`). No GSAP loaded.
- Seed for motion: `fable-drift.html` (the "flight feel + Drift mode" experiment; memory says
  mine it, never present as direction B; time-of-day dial stays parked).
- Brand source of truth (our `design.md`): NCAC-V1-BRAND.md / DESIGN.md.
- Installed skills that map directly: `scroll-storyteller` (GSAP + Anthropic design language),
  `frontend-design`, `design-taste-frontend`, `impeccable`.
- Scope guard: assets map only. Keep GSAP off the MapLibre interaction itself.

## Workstreams (do in order, one at a time)

### Task #1 — Refresh a design skill with the current prompting guide  · DONE
Cheapest, and the actual lesson of the video; do first. Take an existing design skill prompt
+ the current model's prompting guide (Fable 5, plus Opus 4.8 for the alternatives-first and
explicit-verification moves), produce a rewritten skill tuned to the model. Bake in: effort
guidance (max for animation), sub-agent verification against NCAC-V1-BRAND.md / DESIGN.md,
product context from AGENTS.md/CLAUDE.md.

### Task #2 — GSAP rail "Happening Now" poster + story-card reveals  · DONE (shipped to master bb93d38 / cla-86-gsap)
Add GSAP to the marketing surface only. Replace CSS fades on the rail poster and MUSE
story-card entrances with one sequenced timeline, mining the postcard motion the video
praised and the flight feel in `fable-drift.html`. One contained moment to feel the
difference against the CSS in `styles.css`. GSAP stays off MapLibre. Use max effort.

### Task #3 — GSAP "Drift mode" cinematic tour  · pending
GSAP timeline that flies between assets as a cinematic, opt-in tour, seeded from
`fable-drift.html`. Must not degrade the functional discovery-map interaction. Within scope.

### Task #4 — scroll-storyteller "story of the corridor" page  · pending
Standalone marketing page via the `scroll-storyteller` skill. Never touches the functional
map. Brand language from NCAC-V1-BRAND.md / DESIGN.md for visual consistency. Lowest
priority; after #1 and at least one GSAP prototype land.

## Status log

- 2026-06-13: plan + tasks created. All four pending. Recommended start: #1.
- 2026-06-13: #1 in progress. Wrote `docs/design-prompting-guide.md` — distilled Fable 5 / Opus 4.8
  design rules (effort lever, propose-4-directions, anti-slop, house-style warning, verification,
  NCAC bindings) + a ready-to-paste design preamble. Open fork: wire the preamble into AGENTS.md
  (project-local refresh) vs. rewrite a global design skill with it.
- 2026-06-13: #1 DONE. User chose "rewrite a global skill." Created global skill
  `~/.claude/skills/frontend-design-tuned/SKILL.md` — a model-tuned rewrite of the plugin
  `frontend-design` skill (left intact; plugin updates would clobber an in-place edit). Adds
  propose-4-directions-first, house-style warning, literal-instruction note, CSS-vs-GSAP motion
  split, effort guidance, and brand-file verification. Invoke via `/frontend-design-tuned`.
  Next: #2 (GSAP rail "Happening Now" poster + story-card reveals).
- 2026-06-13: #2 BUILT. Owner picked the "Poster paste-up" motion (cards rise + scale from 0.94
  with a `back.out(1.4)` snap; the red brand frame inks crisp last). Loaded GSAP 3.12.7 via unpkg
  `<script>` in `index.html` (marketing motion only; map stays CSS-quiet); bumped `app.js?v=` to
  `cla-85-gsap`. Added `gsapMotionOn()` (gates on `window.gsap` + not reduced-motion; both fall
  through to static CSS — never a blank card), `animateRailEntrance()` (called at the end of
  `renderDiscoveryRail` — fires on first load + chip switch, not on Rail Follow), and a quieter
  `animateStoryReveal()` wired into `renderStoryList` (`.story-row`) and `renderStory`
  (hero/title/issue/link/place rows). Verified in the preview: GSAP loads, no console/network
  errors, tween sets opacity 0 + inline `translate/scale`, progresses, settles to opacity 1 with
  `clearProps` handing transform back to CSS; frame inks pale→`rgb(255,37,0)`. NOT yet observable
  live in the preview — the 0-fps hidden preview tab never fires MapLibre `load`, so the real
  first-load render path can't run there (the AGENTS.md "verify in real Chrome" case). Pending:
  live-motion glance in a visible browser, then commit (needs a `data/changelog.json` entry).
- 2026-06-13: #2 SHIPPED to master. Owner confirmed the motion live ("subtle, it's good"). Committed
  to the (stale) `trail-data-base` as 8ea488f, then found the branch was 6 behind `origin/master`
  (the Trails-lens "Structure B" + OSM + MUSE merges had already landed). Rebased onto `origin/master`:
  `app.js` auto-merged clean (hooks intact, single copies), only the `index.html` cache token clashed —
  resolved by unifying all three assets to `cla-86-gsap`. Re-verified the rebased build (no console
  errors, GSAP loads, Trails tab present). FF-pushed `trail-data-base:master` (9c40a15..bb93d38),
  fast-forwarded local master, deleted `trail-data-base` (was local-only). Tasks #3 (Drift tour) and
  #4 (scroll-story page) remain.
- 2026-07-02: audit after a 3-week gap. Master unchanged since bb93d38. Found
  `story-of-the-corridor.html` (2026-06-13, 757 lines, complete document, no TODOs) —
  an untracked, unreviewed Task #4 draft that never got a status entry here; needs
  owner review, then commit or kill. Task #3 still pending; its seed matured: the
  cinematic camera grammar (soar/dive flights, card dealt on touchdown, orbital hold)
  was built into `fable-drift.html` on 2026-06-11 and judged 14/14 + J 4/4/5 by the
  drift-polish loop (loops/archive/). Data note: `data/events.json` (refreshed
  2026-06-13) is now fully in the past — pages truthfully show "0 happenings".
  Closed trail loops archived to loops/archive/.
