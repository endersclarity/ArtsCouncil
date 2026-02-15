# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Drive people to downtowns, local businesses, performance venues, and cultural spaces through an editorial-quality interactive experience that feels like MUSE magazine.
**Current focus:** Phase 1 incomplete (map broken). Phase 2 complete. Deadline Wed Feb 18.

## Current Position

Phase: 1 of 7 (Design & Visual Refresh) -- INCOMPLETE (~60%)
Plan: Original plans OBSOLETE (Codex built layout independently)
Status: Magazine layout shipped to Vercel but map doesn't render. Phase 2 data pipeline complete.
Last activity: 2026-02-15 -- Reconciled Phase 1 state to reflect reality (Codex vs GSD).

Progress: [██████░░░░░░░░░░░░░░] ~29% overall

## What's Actually Shipped

### Phase 1: Design & Visual Refresh (~60%)
- Magazine-style layout built by **Codex (OpenAI)**, not GSD plans
- GSD plans (01-01, 01-02, 01-03) were token swaps that produced no visible change — OBSOLETE
- Codex's WIP promoted to canonical in commit `b2d7e48`
- **BLOCKER: Map does not render** — MapLibre canvas never creates, `initMapLibre()` silently fails
- **BLOCKER: 4 missing DOM IDs** — `mapAddons`, `mapGuides`, `corridorAddon`, `experienceAddon`
- Mobile not tested, copy audit incomplete

### Phase 2: Tier 2 Events (100%)
- 3/3 plans executed through GSD pipeline
- LibCal (70 events) + CivicEngage (1 event) + Trumba (49 events) = 120 merged events
- Fuzzy dedup, family classification (26 tagged), source badges, fallback loading
- GitHub Actions daily cron on master
- 17 gate tests passing

## Performance Metrics

**Velocity:**
- Total plans completed: 3 (Phase 2 only — Phase 1 plans obsolete)
- Average duration: 3min per plan (Phase 2)

**By Phase:**

| Phase | Plans | Total | Avg/Plan | Agent |
|-------|-------|-------|----------|-------|
| 1 | 0/3 (obsolete) | N/A | N/A | Codex (OpenAI) built layout outside GSD |
| 2 | 3/3 | 9min | 3min | Claude Code via GSD |

## Accumulated Context

### Decisions

Recent decisions affecting current work:

- [Phase 1]: GSD plans (token swaps) abandoned — Codex built magazine layout from scratch
- [Phase 1]: Design direction: `mockups/phase1-landscape-mag-overhaul.html` (magazine DNA)
- [Phase 1]: Codex's WIP promoted to canonical (commit `b2d7e48`) — backups exist as `*.BACKUP-pre-phase1.*`
- [Phase 1]: Map rendering bug is pre-existing — affects ALL HTML variants, not just Codex's layout
- [Phase 2]: All decisions preserved (see 02-VERIFICATION.md)
- [Roadmap]: Phase 1 state reconciled 2026-02-15 — summaries rewritten to reflect Codex as actual executor

### Pending Todos

- **FIX MAP RENDERING BUG** (BLOCKER for everything)
- Add 4 missing DOM IDs to Codex's HTML (`mapAddons`, `mapGuides`, `corridorAddon`, `experienceAddon`)
- Mobile testing at 375px
- Copy audit for remaining "cultural asset" language
- Visual consistency sweep (base CSS conflicts with magazine layout)

### Blockers/Concerns

- **MAP DOES NOT RENDER** — MapLibre canvas never creates. Pre-existing bug (affects all HTML variants). Codex investigating.
- **Wednesday Feb 18 deadline** — Committee presentation at Gold Miners Inn, 12:00-1:30 PM. Must have working map + events.
- Phase 5 (AI Concierge): Gemini free tier may not cover projected token usage
- Phase 5 (AI Concierge): data.json needs status/last_verified fields

## Session Continuity

Last session: 2026-02-15
Stopped at: Reconciled Phase 1 state. Map bug is the critical blocker. Codex investigating.
Resume file: .planning/phases/01-design-visual-refresh/01-03-SUMMARY.md
