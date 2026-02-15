# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Drive people to downtowns, local businesses, performance venues, and cultural spaces through an editorial-quality interactive experience that feels like MUSE magazine.
**Current focus:** Phase 2 complete. Ready for Phase 3.

## Current Position

Phase: 2 of 7 (Tier 2 Events) -- COMPLETE
Plan: 3 of 3 executed
Status: Phase 02 complete -- All 3 plans executed: ingest scripts, merge/dedup pipeline, client integration with source badges and family filter.
Last activity: 2026-02-14 -- Wired events-merged.json into client with fallback loading, source badges, Family & Kids filter chip.

Progress: [#####################] 100% (Phase 2)

## Performance Metrics

**Velocity:**
- Total plans completed: 3 (superseded by layout rebuild)
- Average duration: -
- Total execution time: ~3 hours (design exploration + token swap + layout rebuild)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 3 (superseded) | ~3h | ~1h |
| 2 | 3 of 3 | 9min | 3min |

**Recent Trend:**
- Last 5 plans: 01-02 (superseded), 01-03 (expanded to layout rebuild), 02-01 (4min), 02-02 (3min), 02-03 (2min)
- Trend: Data pipeline plans execute quickly when research is thorough

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Phase 1]: Original GSD plans (token swaps) produced no visible change — thrown out in favor of structural layout rebuild
- [Phase 1]: Design direction locked: `mockups/phase1-landscape-mag-overhaul.html` (magazine layout DNA)
- [Phase 1]: Work done on WIP copies only — canonical files untouched until user approves
- [Phase 1]: Layout structure: wrap → dark navy mast → cover-grid (image + TOC) → spread (map + story cards) → notes grid
- [Roadmap]: 7 phases, reordered to prioritize Diana's explicit asks over PRD expansions
- [Roadmap]: MVP = Phases 1-5; Growth = Phases 6-7
- [Roadmap]: Phase 2 (Tier 2 Events) is NOT affected by Phase 1 layout change — event data pipeline is layout-independent
- [Phase 2]: CivicEngage RSS published_parsed is post date, not event date -- must use calendarevent_eventdates field
- [Phase 2]: LibCal event IDs include date suffix to differentiate recurring instances
- [Phase 2]: Only Nevada City Events Calendar in CivicEngage feeds (skip government meetings)
- [Phase 2]: Dual output: events-merged.json (wrapped) for client, events-merged-flat.json (bare array) for build_event_index.py
- [Phase 2]: Dedup thresholds: title>=85, venue>=70 via rapidfuzz; empty venue = match on title alone
- [Phase 2]: Source priority for dedup: Trumba > LibCal > CivicEngage
- [Phase 2]: Source badge hidden for Trumba (default source) to reduce visual noise
- [Phase 2]: Family filter reuses data-event-filter chip mechanism for consistency
- [Phase 2]: 48h staleness threshold for events-merged.json before fallback to Trumba-only

### Pending Todos

- Visual consistency sweep (base CSS conflicts with new magazine layout styles)
- Mobile testing at 375px width
- Copy audit for remaining "cultural asset" language
- Copy WIP files → canonical when approved
- Summaries written: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md

### Blockers/Concerns

- Phase 5 (AI Concierge): Gemini free tier may not cover projected token usage at 500 monthly visitors
- Phase 5 (AI Concierge): data.json needs status/last_verified fields before chatbot can safely recommend venues
- ~~Phase 2 (Events): LibCal API access for Nevada County Library not yet verified~~ RESOLVED: LibCal iCal feed verified, 70 events fetched
- ~~Phase 2 (Events): CivicEngage iCal export assumed but not confirmed for GV/NC municipal sites~~ RESOLVED: CivicEngage RSS verified, low-volume but working

## Session Continuity

Last session: 2026-02-14
Stopped at: Completed 02-03-PLAN.md (client integration). Phase 02 (Tier 2 Events) fully complete. Ready for Phase 03.
Resume file: .planning/phases/02-tier-2-events/02-03-SUMMARY.md
