---
phase: 07-demand-signal-reporting
plan: 02
subsystem: analytics
tags: [umami-api, supabase-api, intent-classification, venue-attribution, demand-signals, github-actions, reporting-pipeline]

# Dependency graph
requires:
  - phase: 06-analytics-foundation
    provides: Umami Cloud analytics with track() wrapper
  - phase: 06.1-deep-analytics-instrumentation
    provides: 23 event types across 13 JS modules
  - phase: 07-01
    provides: session_hash on all events, chat/explore analytics events
provides:
  - demand-signal-pull.mjs CLI tool querying Umami Cloud API + Supabase REST
  - 7-type intent classification (tonight_planner, trip_researcher, art_seeker, family_planner, event_hunter, local_explorer, casual_browser)
  - 4-tier business referral attribution scoring (outbound clicks -> detail opens -> marker clicks -> chat recs)
  - Chatbot micro-intent classification (8 categories via keyword patterns)
  - [[Venue|pid]] regex extraction from chat response_text for AI referral attribution
  - GitHub Actions monthly cron + manual workflow_dispatch for automated reporting
  - Unified JSON output matching PIPELINE-ARCHITECTURE.md schema
affects: [07-03-PLAN, committee-reporting, demand-signal-reports]

# Tech tracking
tech-stack:
  added: []
  patterns: [ES module CLI with native fetch, manual arg parsing (zero deps), Umami Cloud REST API bearer auth, Supabase PostgREST duplicate-key query params]

key-files:
  created:
    - scripts/demand-signal-pull.mjs
    - .github/workflows/demand-signal-report.yml
    - reports/.gitkeep
  modified: []

key-decisions:
  - "Zero npm dependencies -- uses Node.js native fetch (18+) and --env-file flag for env loading"
  - "Supabase duplicate created_at query params built via manual string concatenation (URLSearchParams would overwrite)"
  - "Intent clusters classify signal patterns per period (not individual visitors) due to Umami Cloud session ID limitation"
  - "Venue attribution top 20 cap to keep committee reports focused"
  - "Chat recommendation extraction via [[Venue|pid]] regex with per-response dedup"
  - "Umami 401 exits with actionable refresh instructions (localStorage extraction command)"

patterns-established:
  - "CLI script pattern: node --env-file=.env scripts/name.mjs --flag value (zero deps, manual arg parsing)"
  - "API error handling: 401 = auth gate with user instructions, other errors = throw with status + body"
  - "Demand signal output schema: meta + overview + page_views + events + chat_logs + derived (intent_clusters + venue_attribution + demand_signals)"

requirements-completed: [REPT-01, REPT-02, REPT-03, REPT-04, REPT-05, REPT-06, REPT-08]

# Metrics
duration: 12min
completed: 2026-02-18
---

# Phase 07 Plan 02: Demand Signal Pipeline Summary

**Automated data pull script querying Umami Cloud + Supabase APIs with 7-type intent classification, 4-tier venue attribution scoring, and GitHub Actions monthly automation**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-18T05:12:50Z
- **Completed:** 2026-02-18T05:25:00Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- Created `scripts/demand-signal-pull.mjs` -- fully functional CLI pipeline that queries Umami Cloud API (5 endpoint types: stats, event metrics, property discovery, property values, page views) and Supabase REST API (chat_logs with date range filtering)
- Implemented 7-type intent classification decision tree producing confidence levels (HIGH/MODERATE/LOW) with evidence arrays and estimated visitor counts
- Implemented 4-tier business referral attribution scoring: outbound ticket clicks (100pts), website clicks (40pts), detail opens (10pts), marker clicks (5pts), chat recommendations (5pts), chat click-throughs (30pts)
- Chatbot micro-intent classification via 8 keyword pattern categories (dining, lodging, outdoor, arts, same_day, future_trip, family, live_music)
- Chat recommendation extraction via `[[Venue|pid]]` regex from response_text with per-response deduplication
- Created GitHub Actions workflow with monthly cron (1st of month, 9am UTC) + manual workflow_dispatch, auto-commits to reports/ directory
- Zero npm dependencies -- native fetch only, manual CLI arg parsing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create demand-signal-pull.mjs with Umami + Supabase API calls and derived analytics** - `2d035eb` (feat)
2. **Task 2: Create GitHub Actions workflow for monthly automated report generation** - `d2c8e23` (chore)

## Files Created/Modified
- `scripts/demand-signal-pull.mjs` - CLI pipeline script (474 lines): Umami API integration, Supabase chat log fetch, intent classification, venue attribution scoring, demand signals summary, unified JSON output
- `.github/workflows/demand-signal-report.yml` - Monthly cron + manual trigger workflow with 4 secrets, auto-commit to reports/
- `reports/.gitkeep` - Placeholder for reports output directory

## Decisions Made
- Zero npm dependencies: native fetch (Node 18+) + --env-file flag for env loading. Matches project convention of minimal tooling.
- Supabase duplicate query param keys (two created_at filters) built via manual string concatenation rather than URLSearchParams (which would overwrite the first key). This is a PostgREST idiom.
- Intent clusters classify aggregate signal patterns per period, not individual visitors, because Umami Cloud API does not expose per-session event streams. Documented in output.
- Venue attribution capped at top 20 results -- committee reports need a focused ranked list, not exhaustive dump.
- Chat recommendation extraction deduplicates within each response (a venue mentioned 3x in one response counts as 1 recommendation for that response).
- 401 error handling provides the exact localStorage extraction command needed to refresh the token.

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

**UMAMI_BEARER_TOKEN not in .env:** The token is not stored in the project's .env file (only a comment placeholder exists). This is expected behavior per the PIPELINE-ARCHITECTURE.md -- the token expires quarterly and must be refreshed via browser login. The script correctly detects the missing token and exits with actionable instructions. Full end-to-end testing with live Umami data requires the user to first obtain a token.

**Supabase integration verified independently:** Successfully fetched 5 chat log entries from Supabase to confirm the REST API integration works. The Umami API calls were verified to produce correct 401 handling with invalid tokens, confirming the error path works.

## User Setup Required

To run the pipeline end-to-end, the user must:

1. **Get Umami bearer token:**
   - Log into https://cloud.umami.is
   - Open browser console
   - Run: `JSON.parse(localStorage.getItem("umami.auth")).token`
   - Add to `.env`: `UMAMI_BEARER_TOKEN=<token>`

2. **For GitHub Actions automation:**
   - Add 4 secrets in repo Settings -> Secrets:
     - `UMAMI_WEBSITE_ID` (from .env)
     - `UMAMI_BEARER_TOKEN` (from step 1)
     - `SUPABASE_URL` (from .env)
     - `SUPABASE_SECRET_KEY` (from .env)

3. **Run locally:**
   ```bash
   node --env-file=.env scripts/demand-signal-pull.mjs --from 2026-02-01 --to 2026-02-18 --out reports/test.json --verbose
   ```

## Next Phase Readiness
- Pipeline script produces the unified JSON that 07-03 (report template) will consume
- Output schema matches PIPELINE-ARCHITECTURE.md Section 1.3 exactly
- GitHub Actions workflow ready for activation once secrets are configured
- 07-03 can proceed immediately: the `derived` section provides all data needed for committee report rendering

---
## Self-Check: PASSED

- FOUND: .planning/phases/07-demand-signal-reporting/07-02-SUMMARY.md
- FOUND: scripts/demand-signal-pull.mjs (474 lines)
- FOUND: .github/workflows/demand-signal-report.yml
- FOUND: reports/.gitkeep
- FOUND: 2d035eb (Task 1 commit)
- FOUND: d2c8e23 (Task 2 commit)
- VERIFIED: 20/20 content checks passed (Umami API, Supabase API, intent classification, attribution scoring, workflow YAML, secrets)
- VERIFIED: Supabase chat_logs fetch returns 5 entries (confirmed working)
- VERIFIED: 401 error handling exits with actionable refresh instructions

---
*Phase: 07-demand-signal-reporting*
*Plan: 02*
*Completed: 2026-02-18*
