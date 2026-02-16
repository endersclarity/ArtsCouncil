# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Drive people to downtowns, local businesses, performance venues, and cultural spaces through an editorial-quality interactive experience that feels like MUSE magazine.
**Current focus:** Phase 6 (Analytics Foundation) COMPLETE (1/1 plan). Phase 4 (Copy) is final polish. Deadline Wed Feb 18.

## Current Position

Phase: 06 (Analytics Foundation) -- COMPLETE
Plan: 1 of 1 complete
Status: Umami Cloud analytics live — wrapper module, 15+ tracked interactions, UTM-tagged outbound links, committee Share URL dashboard.
Last activity: 2026-02-15 -- Completed 06-01-PLAN.md (analytics foundation).

Progress: [████████████████░░░░] ~80% overall

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

### Phase 3: Itineraries (100%)
- 2/2 plans complete
- itineraries.json: 3 curated trip plans (1-day/7 stops, 2-day/13 stops, 3-day/20 stops)
- itinerary-model.js: stop resolution by exact name match, day grouping, map coord extraction
- itinerary-calendar.js: Google Calendar URL generation with Pacific timezone
- itinerary-view.js: hero cards, detail overlay with day tabs, stop cards, mobile scroll-snap
- itinerary-controller.js: activation lifecycle, map route via corridor-map, GSAP animations, deep link
- All 40 stops validated against data.json — zero unresolved references
- Deep link: ?itinerary=perfect-day
- Mutual exclusion with experience/corridor system
- Browser verified: all 9 checks pass, zero console errors

### Phase 5: AI Concierge (100%)
- 2/2 plans complete (05-01: server infra, 05-02: chat UI)
- chat-knowledge-pack.json: 191KB compressed corpus (685 assets, 6 editorials, 3 itineraries, 176 events)
- /api/chat Vercel Serverless Function: Gemini 2.0 Flash proxy with tourism-only system prompt
- Input sanitization, Supabase logging, session-based rate limiting
- package.json with @google/generative-ai + @supabase/supabase-js
- CORS headers in vercel.json for /api/* routes
- Chat widget: FAB button (gold, bottom-right), slide-up panel with GSAP, full-screen mobile overlay
- Chat view: message bubbles, typing indicator, welcome message, error states
- Chat controller: /api/chat fetch, [[asset]] deep links to detail panel, {{MUSE}} citation blocks, session hash, input sanitization
- 3 IIFE modules wired into HTML in dependency order (view -> controller -> widget)

### Phase 6: Analytics Foundation (100%)
- 1/1 plan complete
- CulturalMapAnalytics IIFE wrapper: track() with 500ms dedup throttle, tagOutboundUrl() with UTM injection
- 15+ interaction types instrumented across 6 modules (bindings, detail-controller, detail-view, explore-controller, experience-controller, index-maplibre.js)
- Umami Cloud Hobby plan (privacy-first, no cookies, GDPR-compliant)
- Website ID: 14ecf234-cd96-4e6c-91c2-cc27babc095d
- Share URL: https://cloud.umami.is/share/875bmvTJ7Hd2oLAx (committee access, no login needed)
- Custom events confirmed in dashboard: category:filter, toggle:open-now, toggle:events-14d
- Deployed to Vercel stitch-lab

## Performance Metrics

**Velocity:**
- Total plans completed: 10 (Phase 2: 3, Phase 2.1: 2, Phase 3: 2, Phase 5: 2, Phase 6: 1 — Phase 1 plans obsolete)
- Average duration: 3.5min per plan

**By Phase:**

| Phase | Plans | Total | Avg/Plan | Agent |
|-------|-------|-------|----------|-------|
| 1 | 0/3 (obsolete) | N/A | N/A | Codex (OpenAI) built layout outside GSD |
| 2 | 3/3 | 9min | 3min | Claude Code via GSD |
| 2.1 | 2/2 | 5min | 2.5min | Claude Code via GSD |
| 3 | 2/2 | 12min | 6min | Claude Code via GSD |
| 5 | 2/2 | 6min | 3min | Claude Code via GSD |
| 6 | 1/1 | 15min | 15min | Claude Code via GSD |

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
- [Phase 3]: Itinerary routes reuse corridor-map.js (no duplicate rendering code)
- [Phase 3]: CSS injected from view IIFE rather than separate CSS file
- [Phase 3]: Mutual exclusion: each controller (experience/itinerary) deactivates the other on activation
- [Phase 5]: Gemini 2.0 Flash (not 3.0) — model name matches current SDK availability
- [Phase 5]: Asset descriptions truncated to 40 chars (not 80) to keep knowledge pack under 200KB
- [Phase 5]: MUSE editorials compressed (summary fields only, body dropped) for token budget
- [Phase 5]: Website URLs dropped from asset compression for size budget
- [Phase 5]: No DOMPurify for V1 — parseResponse generates only known-safe HTML patterns
- [Phase 5]: Asset clicks use hash deep links (#place=Name) to trigger existing detail panel
- [Phase 5]: Conversation history capped at 10 messages (5 turns) to control API token usage
- [Phase 6]: Umami Cloud Hobby plan — privacy-first, no cookies, no consent banner needed
- [Phase 6]: Provider-agnostic wrapper (CulturalMapAnalytics) — never call umami.track() directly
- [Phase 6]: Event naming: kebab-case feature:action (category:filter, detail:open, outbound:website)
- [Phase 6]: 500ms dedup throttle on all events, 800ms debounce on search tracking
- [Phase 6]: UTM params: utm_source=exploregvnc, utm_medium=referral on all outbound links
- [Phase 6]: No chat tracking in Umami — stays in Supabase chat_logs only
- [Phase 6]: Share URL for committee: https://cloud.umami.is/share/875bmvTJ7Hd2oLAx

### Roadmap Evolution

- Phase 02.1 inserted after Phase 2: KVMR + GVDA Event Source Ingestion (URGENT) — Mardi Gras and other major events missing from all 3 existing sources. KVMR iCal + GVDA Trumba JSON add broadest community coverage before Wed demo.
- Phase 06.1 inserted after Phase 6: Deep Analytics Instrumentation (URGENT) — Phase 6 covers basic interaction tracking but misses scroll depth, marker clicks, detail dwell time, itinerary engagement, and outbound click attribution. Adding these before Wednesday demo so first real traffic produces a rich story.

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
- **Itinerary "Show on Map" UX is broken:** Clicking "Show on Map" zooms the map behind the modal — user has to close the modal to see where it pointed, and even then it's not obvious. Needs: modal should collapse/minimize to reveal the map zoom, and the asset's detail side-panel should open with full bio info for the selected stop. The flow should be: click "Show on Map" → modal collapses → map zooms to stop → detail panel slides in with asset info.
- **In-house trip builder / personal calendar (BRAINSTORM):** Let visitors build their own itinerary using our UI — pick stops, set times, arrange days. Then export the whole batch to Google Calendar (or other) in one action. Strong preference to avoid requiring sign-in/accounts. Possible approaches: localStorage-only (no account needed, persists per device), shareable URL encoding (trip plan encoded in query string), or cookie-based session. Needs design thinking on UX and whether accountless persistence is sufficient.

### Blockers/Concerns

- ~~MAP DOES NOT RENDER~~ RESOLVED (commit `48a9486`)
- **Wednesday Feb 18 deadline** — Committee presentation at Gold Miners Inn, 12:00-1:30 PM. Must have working map + events.
- ~~Event coverage gaps~~ RESOLVED (Phase 2.1 adds KVMR + GVDA, 176 total events)
- Phase 5 (AI Concierge): Gemini free tier may not cover projected token usage
- Phase 5 (AI Concierge): data.json needs status/last_verified fields

## Session Continuity

Last session: 2026-02-15
Stopped at: Completed 06-01-PLAN.md (analytics foundation). Phase 6 fully complete.
Resume file: N/A — Phase 6 complete. Next: Phase 4 (Copy) or deployment.
