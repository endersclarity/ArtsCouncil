---
phase: 07-demand-signal-reporting
verified: 2026-02-17T00:00:00Z
status: gaps_found
score: 7/8 requirements verified
re_verification: false
gaps:
  - truth: "Report output is markdown convertible to PDF for committee meetings (REPT-07)"
    status: partial
    reason: "REQUIREMENTS.md marks REPT-07 as incomplete ([ ]). Markdown file exists and is well-formed, but no PDF conversion was tested or documented. The generate-demand-report.mjs script produces valid markdown that is technically convertible, but the requirement has not been signed off as complete."
    artifacts:
      - path: "reports/2026-02-demand-report.md"
        issue: "File is valid markdown (170 lines) but PDF conversion step was listed as optional and not completed during 07-03 checkpoint"
    missing:
      - "Either: mark REPT-07 complete in REQUIREMENTS.md after human confirmation that the markdown renders acceptably as PDF, OR run pandoc conversion and verify output quality"
  - truth: "Report's Technical Notes section accurately reflects instrumentation state"
    status: partial
    reason: "The generated report (line 164) states 'Chatbot deep link clicks: Not yet instrumented' even though chat:deeplink-click IS instrumented in the codebase as of 07-01. The hasChatDeeplink check in generate-demand-report.mjs tests whether the event appears in pipeline event summary data -- no clicks occurred in Feb so the check returns false and generates a misleading gap statement."
    artifacts:
      - path: "scripts/generate-demand-report.mjs"
        issue: "hasChatDeeplink check at line 406 detects event presence in data not in codebase, generating false 'not instrumented' message when zero clicks happened"
      - path: "reports/2026-02-demand-report.md"
        issue: "Line 164 says 'Not yet instrumented' which contradicts actual instrumentation state"
    missing:
      - "Fix hasChatDeeplink detection: check eventsSummary OR use a static flag/comment that the event is instrumented but may not appear if no clicks occurred during the period"
human_verification:
  - test: "Open reports/2026-02-demand-report.md and run through pandoc or a markdown-to-PDF converter"
    expected: "Report renders as a professional PDF suitable for committee distribution, with tables aligned and sections clearly separated"
    why_human: "PDF visual quality cannot be verified programmatically"
  - test: "Click a chatbot deep link ([[Venue Name|pid]] style link in chat panel) on the stitch-lab deployment"
    expected: "Umami dashboard shows a chat:deeplink-click event appears in event metrics"
    why_human: "Requires live browser interaction with deployed site; instrumentation fires on real user gesture"
---

# Phase 7: Demand Signal Reporting — Verification Report

**Phase Goal:** The committee receives a monthly intelligence report showing what visitors searched for, clicked on, and asked the chatbot — actionable data no other small-town DMO has
**Verified:** 2026-02-17
**Status:** gaps_found (7/8 requirements verified; 1 pending sign-off, 1 report accuracy issue)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | session_hash injected into every analytics event via centralized track() wrapper | VERIFIED | `Object.assign({ session_hash: _getSessionHash() }, data)` at analytics.js:79; `_getSessionHash()` at analytics.js:54 uses sessionStorage |
| 2 | Chatbot deep link clicks fire `chat:deeplink-click` with venue+pid | VERIFIED | chat-view.js:248 fires analytics.track('chat:deeplink-click', {venue, pid}) in existing click handler for .chat-asset-link |
| 3 | Chat panel open/close fires `chat:open` and `chat:close` | VERIFIED | chat-widget.js:89 and chat-widget.js:119 |
| 4 | Directory search fires `explore:search` with query+results_count | VERIFIED | explore-controller.js:193 fires analytics.track('explore:search', {query, results_count}) |
| 5 | `scripts/demand-signal-pull.mjs` queries Umami+Supabase and produces unified JSON with all required sections | VERIFIED | 788-line script; pipeline JSON at reports/2026-02-demand-signals.json contains meta, overview, page_views, events, chat_logs, derived |
| 6 | Intent classification produces clusters with confidence levels and evidence | VERIFIED | derived.intent_clusters in pipeline JSON: trip_researcher (HIGH), tonight_planner (HIGH), casual_browser (LOW) with evidence arrays |
| 7 | GitHub Actions workflow triggers monthly and manually | VERIFIED | .github/workflows/demand-signal-report.yml has `schedule: '0 9 1 * *'` and `workflow_dispatch`; all 4 secrets referenced |
| 8 | Committee markdown report fills all sections from pipeline JSON | VERIFIED | reports/2026-02-demand-report.md (170 lines) has Executive Summary, Key Metrics, Category Ranking, Top Venues, Zero-Result Searches, Business Engagement, AI Concierge Insights, Intent Clusters, Traffic Breakdown, Feature Usage |
| 9 | Venue attribution ranks by 4-tier weighted formula | VERIFIED | scoreVenueAttribution() in demand-signal-pull.mjs:417; scoring formula: ticket_clicks*100 + website_clicks*40 + detail_opens*10 + marker_clicks*5 + chat_recs*5 + chat_clickthroughs*30; results sorted DESC |
| 10 | Report's instrumentation status notes are accurate | FAILED | Line 164 of 2026-02-demand-report.md says "Not yet instrumented" for chat:deeplink-click — contradicts actual code state; hasChatDeeplink detects data not code |
| 11 | REPT-07: Markdown report is confirmed convertible to PDF | PARTIAL | Markdown is valid and well-structured; REQUIREMENTS.md marks REPT-07 as `[ ]` incomplete; PDF conversion was not tested during 07-03 checkpoint |

**Score:** 9/11 truths verified (2 partial/failed)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `website/cultural-map-redesign-stitch-lab/index-maplibre-analytics.js` | session_hash injection + _getSessionHash + getSessionHash public API | VERIFIED | All three present: _getSessionHash() at line 54, Object.assign injection at line 79, getSessionHash on public API at line 104 |
| `website/cultural-map-redesign-stitch-lab/index-maplibre-chat-widget.js` | chat:open and chat:close events | VERIFIED | Lines 89 and 119 |
| `website/cultural-map-redesign-stitch-lab/index-maplibre-chat-view.js` | chat:deeplink-click (plan said chat-controller.js, actual is chat-view.js) | VERIFIED | Line 248; documented deviation in 07-01-SUMMARY.md |
| `website/cultural-map-redesign-stitch-lab/index-maplibre-chat-controller.js` | chat:query-sent | VERIFIED | Line 306 |
| `website/cultural-map-redesign-stitch-lab/index-maplibre-explore-controller.js` | explore:search + explore:card-expand | VERIFIED | Lines 193 and 231 |
| `website/cultural-map-redesign-stitch-lab/index-maplibre.js` | session:start + page:section-visibility | VERIFIED | Lines 339 and 349 |
| `scripts/demand-signal-pull.mjs` | Full pipeline: Umami+Supabase pull, intent classification, attribution scoring | VERIFIED | 788 lines; all 7 pipeline sections implemented; zero npm dependencies; native fetch only |
| `.github/workflows/demand-signal-report.yml` | Monthly cron + workflow_dispatch + 4 secrets | VERIFIED | All present; timeout-minutes: 10; permissions: contents: write; token refresh instructions in comments |
| `reports/.gitkeep` | Reports directory placeholder | VERIFIED | Exists |
| `scripts/generate-demand-report.mjs` | JSON-to-markdown report generator | VERIFIED | 241 lines; all report sections; graceful fallbacks for missing data |
| `reports/2026-02-demand-signals.json` | First real pipeline output with live Umami+Supabase data | VERIFIED | 18KB; 5 visitors, 73 events, 18 venues scored, 3 intent clusters from live data |
| `reports/2026-02-demand-report.md` | First real committee report | VERIFIED | 170 lines; all required sections with real data; valid markdown |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `index-maplibre-analytics.js` track() | window.umami.track | Object.assign injects session_hash on every call | WIRED | Pattern `session_hash.*_getSessionHash` confirmed at analytics.js:79 |
| `index-maplibre-chat-view.js` | CulturalMapAnalytics.track | Event delegation on .chat-asset-link click | WIRED | analytics.track('chat:deeplink-click', ...) at chat-view.js:248 |
| `scripts/demand-signal-pull.mjs` | Umami Cloud API | fetch() with Bearer token to /analytics/us/api/ | WIRED | umamiGet() helper at line 88; base URL `cloud.umami.is/analytics/us/api` confirmed |
| `scripts/demand-signal-pull.mjs` | Supabase REST API | fetch() with SUPABASE_SECRET_KEY to /rest/v1/chat_logs | WIRED | fetchChatLogs() at line 170; manual query string construction for duplicate-key params |
| `.github/workflows/demand-signal-report.yml` | scripts/demand-signal-pull.mjs | node scripts/demand-signal-pull.mjs --from/--to/--out | WIRED | Line 60 of workflow; uses GITHUB_OUTPUT for date interpolation |
| `scripts/generate-demand-report.mjs` | reports/*-demand-signals.json | reads via --input flag with fs.readFileSync | WIRED | Line 41; --input CLI arg confirmed |
| `scripts/generate-demand-report.mjs` | COMMITTEE-REPORT-TEMPLATE.md structure | template sections define markdown output | WIRED | All 9 committee sections rendered: Executive Summary, Key Metrics, Demand Signals, Business Engagement, AI Concierge, Intent Clusters, Traffic, Feature Usage, Technical Notes |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| REPT-01 | 07-02-PLAN | Monthly report script pulls analytics provider data via Stats API | SATISFIED | demand-signal-pull.mjs queries Umami Cloud API (Stats, Event Metrics, Property Breakdowns, Page Views); REQUIREMENTS.md says "Plausible" but team switched to Umami in Phase 6 — marked [x] complete in REQUIREMENTS.md |
| REPT-02 | 07-02-PLAN | Monthly report script pulls Supabase chatbot query logs | SATISFIED | fetchChatLogs() at demand-signal-pull.mjs:170; confirmed pulling real data (5 entries in Feb report) |
| REPT-03 | 07-02-PLAN, 07-03-PLAN | Report includes top 10 assets by detail opens and outbound clicks | SATISFIED | reports/2026-02-demand-report.md lines 39-52 show Top Venues table with Detail Opens + Outbound Clicks + Score columns for top 10 venues |
| REPT-04 | 07-02-PLAN, 07-03-PLAN | Report includes category filter frequency ranking | SATISFIED | lines 30-38 of report show Category Interest Ranking table with 5 categories ranked by filter count |
| REPT-05 | 07-01-PLAN, 07-02-PLAN, 07-03-PLAN | Report includes zero-result search queries (demand signal data) | SATISFIED | lines 54-56 show Zero-Result Searches section; shows "No zero-result searches" when none exist; buildDemandSignals() collects from search:zero.query property values |
| REPT-06 | 07-02-PLAN, 07-03-PLAN | Report includes chatbot intent distribution (eat/see/do/stay/navigate) | SATISFIED | lines 87-93 show Intent Distribution table with dining (50%), lodging (25%), same_day (25%) from live data; 8 micro-intent categories via keyword patterns |
| REPT-07 | 07-03-PLAN | Report output as markdown convertible to PDF for committee meetings | PENDING | REQUIREMENTS.md marks as `[ ]` incomplete; report IS valid markdown (170 lines, proper tables, render-ready); PDF conversion was optional in 07-03 and not tested; requires human sign-off |
| REPT-08 | 07-02-PLAN | Report runnable via GitHub Actions or manual trigger | SATISFIED | .github/workflows/demand-signal-report.yml has both `schedule: '0 9 1 * *'` (monthly cron) and `workflow_dispatch` (manual trigger) |

**Orphaned requirements check:** All REPT-01 through REPT-08 appear in plan frontmatter. No orphaned requirements found.

**REPT-01 note:** REQUIREMENTS.md text says "Plausible" but implementation uses Umami. This is a known tech stack drift from Phase 6 (Umami replaced Plausible). The requirement is marked `[x]` complete in REQUIREMENTS.md, indicating the team accepted the implementation as satisfying the spirit of the requirement.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `reports/2026-02-demand-report.md` | 164 | `"Not yet instrumented"` message for chat:deeplink-click, which IS instrumented | Warning | Misleads committee about instrumentation completeness; the event simply had zero fires in Feb data period |
| `scripts/generate-demand-report.mjs` | 406 | `hasChatDeeplink` detects event in data, not event in codebase | Warning | Report auto-generates a false gap statement when no clicks occurred; creates misleading Technical Notes |
| `reports/2026-02-demand-report.md` | 22 | `Avg Visit Duration: 0.0 min` | Info | Known issue (avg_duration_ms=180ms → 0.0 min after division); Umami Cloud totaltime field may use different units on free tier |
| `reports/2026-02-demand-signals.json` | all venue entries | Venue names include full addresses (e.g., "Odd Fellows Hall, 212 Spring Street, Nevada City CA 95959") | Info | Data normalization issue — Umami stores the full string from detail:open.name property; reduces committee report readability |

---

## Human Verification Required

### 1. REPT-07: PDF Conversion Quality

**Test:** Open `reports/2026-02-demand-report.md` and convert to PDF using pandoc or VS Code PDF export. Review the output.
**Expected:** Tables align correctly, all 9 sections are clearly separated, venue names readable, executive summary fits within the first page, suitable for printing or digital distribution to committee members.
**Why human:** PDF visual quality and layout suitability for committee context cannot be verified programmatically.

### 2. Live chat:deeplink-click Instrumentation Smoke Test

**Test:** Open the stitch-lab deployment, open the chat panel, ask "Where should I eat tonight?", then click one of the `[[Venue|pid]]` venue links in the response.
**Expected:** Umami dashboard shows a `chat:deeplink-click` event with `venue` and `pid` properties.
**Why human:** Instrumentation fires on real user gesture in a live browser; cannot be verified by reading code alone.

---

## Gaps Summary

Two gaps block a clean pass:

**Gap 1 — REPT-07 pending sign-off (blockers: none, just needs confirmation)**
The `reports/2026-02-demand-report.md` is valid, well-structured markdown (170 lines, 9 sections, proper tables). The plan's 07-03 checkpoint task listed PDF conversion as optional ("If Pandoc is installed") and human approval was granted for "report quality" but the REQUIREMENTS.md checkbox for REPT-07 remains unchecked. This is a bookkeeping gap: either run the pandoc conversion and mark it complete, or explicitly accept the markdown form as satisfying REPT-07 and update REQUIREMENTS.md.

**Gap 2 — Misleading "not instrumented" message in generated report (code issue)**
`generate-demand-report.mjs` line 406 checks `eventsSummary.some(e => e.name === 'chat:deeplink-click')` to determine whether to print "Now tracked" or "Not yet instrumented." In February, no visitor clicked a chatbot deep link, so the event never appeared in the Umami event summary, and the report incorrectly states the feature is not instrumented. This will self-heal once any click fires, but until then every report for a low-traffic period will print the wrong status. The fix is minor: check for the event in a hardcoded list of instrumented events, or change the message to "No clicks recorded this period (instrumentation present)".

These two gaps are both minor. The core phase goal — automated monthly intelligence report pipeline — is fully delivered and operational with real data.

---

## Verification Evidence Summary

- `scripts/demand-signal-pull.mjs` — 788 lines, fully substantive, zero npm dependencies, verified against Umami Cloud + Supabase with live data
- `scripts/generate-demand-report.mjs` — 241 lines, all 9 committee sections rendered from JSON
- `reports/2026-02-demand-signals.json` — real February 2026 data: 5 visitors, 95 pageviews, 73 events, 18 venues scored
- `reports/2026-02-demand-report.md` — 170 lines, professional committee format, real intent clusters + venue rankings
- `.github/workflows/demand-signal-report.yml` — monthly cron + manual trigger, token refresh docs in YAML comments
- Analytics instrumentation: 52 track() calls across 14 JS modules confirmed by 07-01-SUMMARY.md self-check
- Session hash: Object.assign injection confirmed at index-maplibre-analytics.js:79
- All 8 new event types (session:start, page:section-visibility, chat:open, chat:close, chat:query-sent, chat:deeplink-click, explore:search, explore:card-expand) confirmed in codebase via grep

---

_Verified: 2026-02-17_
_Verifier: Claude (gsd-verifier)_
