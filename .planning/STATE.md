# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Drive people to downtowns, local businesses, performance venues, and cultural spaces through an editorial-quality interactive experience that feels like MUSE magazine.
**Current focus:** Phase 2.1 COMPLETE (2/2 plans done). Phase 2 complete. Deadline Wed Feb 18.

## Current Position

Phase: 02.1 (KVMR + GVDA Event Source Ingestion) -- COMPLETE
Plan: 2 of 2 complete
Status: All 5 event sources ingested, merged (176 events), and automated in CI. Phase 2.1 done.
Last activity: 2026-02-15 -- Completed 02.1 Plan 02 (merge pipeline + GitHub Actions).

Progress: [███████░░░░░░░░░░░░░] ~36% overall

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

### Phase 2.1: KVMR + GVDA Event Source Ingestion (100%)
- 2/2 plans complete
- KVMR iCal ingest: 29 events, NC city whitelist filtering, kvmr- prefixed IDs
- GVDA Trumba JSON ingest: 44 events, HTML location stripping, gvda- prefixed IDs
- 5-source merge pipeline: 176 total events (was 120), 19 GVDA/Trumba duplicates removed
- GitHub Actions daily cron updated with all 5 ingest steps
- Priority order: trumba > gvda > libcal > kvmr > civicengage

## Performance Metrics

**Velocity:**
- Total plans completed: 5 (Phase 2: 3, Phase 2.1: 2 — Phase 1 plans obsolete)
- Average duration: 3min per plan

**By Phase:**

| Phase | Plans | Total | Avg/Plan | Agent |
|-------|-------|-------|----------|-------|
| 1 | 0/3 (obsolete) | N/A | N/A | Codex (OpenAI) built layout outside GSD |
| 2 | 3/3 | 9min | 3min | Claude Code via GSD |
| 2.1 | 2/2 | 5min | 2.5min | Claude Code via GSD |

## Accumulated Context

### Decisions

Recent decisions affecting current work:

- [Phase 1]: GSD plans (token swaps) abandoned — Codex built magazine layout from scratch
- [Phase 1]: Design direction: `mockups/phase1-landscape-mag-overhaul.html` (magazine DNA)
- [Phase 1]: Codex's WIP promoted to canonical (commit `b2d7e48`) — backups exist as `*.BACKUP-pre-phase1.*`
- [Phase 1]: Map rendering bug is pre-existing — affects ALL HTML variants, not just Codex's layout
- [Phase 2]: All decisions preserved (see 02-VERIFICATION.md)
- [Roadmap]: Phase 1 state reconciled 2026-02-15 — summaries rewritten to reflect Codex as actual executor
- [Phase 2.1]: KVMR events with unknown city kept (benefit of the doubt for local events)
- [Phase 2.1]: GVDA datetimes use ZoneInfo directly rather than parsing offset string
- [Phase 2.1]: GVDA eventImage is a dict {url, alt, size}, not a string URL
- [Phase 2.1]: Source priority: trumba > gvda > libcal > kvmr > civicengage (Arts Council always wins dedup)
- [Phase 2.1]: KVMR and GVDA are supplementary sources (continue-on-error in CI)

### Roadmap Evolution

- Phase 02.1 inserted after Phase 2: KVMR + GVDA Event Source Ingestion (URGENT) — Mardi Gras and other major events missing from all 3 existing sources. KVMR iCal + GVDA Trumba JSON add broadest community coverage before Wed demo.

### Pending Todos

- ~~FIX MAP RENDERING BUG~~ RESOLVED (commit `48a9486` — module contract drift)
- ~~Add 4 missing DOM IDs~~ RESOLVED (same commit)
- Mobile testing at 375px
- Copy audit for remaining "cultural asset" language
- Visual consistency sweep (base CSS conflicts with magazine layout)

### Blockers/Concerns

- ~~MAP DOES NOT RENDER~~ RESOLVED (commit `48a9486`)
- **Wednesday Feb 18 deadline** — Committee presentation at Gold Miners Inn, 12:00-1:30 PM. Must have working map + events.
- ~~Event coverage gaps~~ RESOLVED (Phase 2.1 adds KVMR + GVDA, 176 total events)
- Phase 5 (AI Concierge): Gemini free tier may not cover projected token usage
- Phase 5 (AI Concierge): data.json needs status/last_verified fields

## Session Continuity

Last session: 2026-02-15
Stopped at: Completed 02.1-02-PLAN.md (merge pipeline + GitHub Actions). Phase 2.1 fully complete.
Resume file: .planning/phases/02.1-kvmr-gvda-event-source-ingestion/02.1-02-SUMMARY.md
