# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Drive people to downtowns, local businesses, performance venues, and cultural spaces through an editorial-quality interactive experience that feels like MUSE magazine.
**Current focus:** Phase 3 (Itineraries) in progress. Plan 1 of 2 complete. Deadline Wed Feb 18.

## Current Position

Phase: 03 (Itineraries)
Plan: 1 of 2 complete
Status: Itinerary data layer complete (3 itineraries, model, calendar). Plan 02 (view/controller) next.
Last activity: 2026-02-15 -- Completed 03-01-PLAN.md (itinerary data layer).

Progress: [████████░░░░░░░░░░░░] ~40% overall

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

### Phase 3: Itineraries (Plan 1/2 complete)
- itineraries.json: 3 curated trip plans (1-day/7 stops, 2-day/13 stops, 3-day/20 stops)
- itinerary-model.js: stop resolution by exact name match, day grouping, map coord extraction
- itinerary-calendar.js: Google Calendar URL generation with Pacific timezone
- All 40 stops validated against data.json — zero unresolved references

## Performance Metrics

**Velocity:**
- Total plans completed: 6 (Phase 2: 3, Phase 2.1: 2, Phase 3: 1 — Phase 1 plans obsolete)
- Average duration: 3min per plan

**By Phase:**

| Phase | Plans | Total | Avg/Plan | Agent |
|-------|-------|-------|----------|-------|
| 1 | 0/3 (obsolete) | N/A | N/A | Codex (OpenAI) built layout outside GSD |
| 2 | 3/3 | 9min | 3min | Claude Code via GSD |
| 2.1 | 2/2 | 5min | 2.5min | Claude Code via GSD |
| 3 | 1/2 | 5min | 5min | Claude Code via GSD |

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
- [Phase 3]: Itinerary stops use exact case-insensitive name match (not fuzzy .includes()) against data.json
- [Phase 3]: Google Calendar URLs use ctz=America/Los_Angeles with local time (no Z suffix)
- [Phase 3]: Smart quotes (U+2019) in data.json asset names must be preserved in itineraries.json

### Roadmap Evolution

- Phase 02.1 inserted after Phase 2: KVMR + GVDA Event Source Ingestion (URGENT) — Mardi Gras and other major events missing from all 3 existing sources. KVMR iCal + GVDA Trumba JSON add broadest community coverage before Wed demo.

### Pending Todos

- ~~FIX MAP RENDERING BUG~~ RESOLVED (commit `48a9486` — module contract drift)
- ~~Add 4 missing DOM IDs~~ RESOLVED (same commit)
- ~~Mobile testing at 375px~~ DEFERRED — design still iterating, testing now would test throwaway layouts. Revisit after design direction stabilizes.
- ~~Copy audit for remaining "cultural asset" language~~ REMOVED — this is Phase 4 (Copy & Positioning) scope, not a standalone todo.
- Visual consistency sweep (base CSS conflicts with magazine layout)
- **Event images:** 100 events (all KVMR + all LibCal) have no images — placeholder cards. Need fallback image strategy or page scraping.
- **Family & Kids filter is misplaced:** Currently a time-filter chip alongside All/Today/Weekend/2 Weeks. Should be a separate dimension (checkbox or category dropdown option) so users can combine "family + this weekend."
- **GVDA rich tags not surfaced:** GVDA events have tags like Music/Concert, Children/Family, Beer/Wine/Food but the category dropdown only shows asset layer categories. Event tags should map to or extend the dropdown.
- **KVMR events have no tags:** iCal feed has no category metadata. Relies on weak keyword inference from titles. May need manual tagging or better inference rules.
- **Stardust Station + local creative directories:** Reach out about API or submission form. If their content exists online in a directory, it should be on the Arts Council page. Also get local creative feedback on coverage gaps.

### Blockers/Concerns

- ~~MAP DOES NOT RENDER~~ RESOLVED (commit `48a9486`)
- **Wednesday Feb 18 deadline** — Committee presentation at Gold Miners Inn, 12:00-1:30 PM. Must have working map + events.
- ~~Event coverage gaps~~ RESOLVED (Phase 2.1 adds KVMR + GVDA, 176 total events)
- Phase 5 (AI Concierge): Gemini free tier may not cover projected token usage
- Phase 5 (AI Concierge): data.json needs status/last_verified fields

## Session Continuity

Last session: 2026-02-15
Stopped at: Completed 03-01-PLAN.md (itinerary data layer). Plan 02 (view/controller) next.
Resume file: .planning/phases/03-itineraries/03-01-SUMMARY.md
