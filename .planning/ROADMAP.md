# Roadmap: GVNC Cultural District Experience Platform

## Overview

Transform the existing 687-asset cultural map into an editorial-quality experience platform that drives visitors and locals to downtowns, businesses, and cultural spaces.

**Milestone Structure:**

| Milestone | Phases | Purpose |
|-----------|--------|---------|
| **M1: Foundation** | 1, 2, 2.1, 3, 5 | Core content + feature plumbing |
| **M2: Launch Ready** | 01.1, 4, 3.1, 2.2, 6 | Polish, copy, curation, measurement |
| **M3: Measurement** | 6.1 | Deep instrumentation for committee metrics |
| **M4: Intelligence** | 7 | Monthly demand signal reporting |
| **M5: Personalization** | 8 | AI-powered trip planning |
| **M6: Directory Redesign** | 9 | 3/4 | In Progress|  | In Assets? | Events Feed? | Ingestion Strategy |
|-------|-----------|-------------|-------------------|
| Crazy Horse Saloon (230 Commercial, NC) | Yes | iCal via WP Events Calendar | **Tier 1: iCal subscribe** (like KVMR) |
| Golden Era Lounge (309 Broad, NC) | Yes | Squarespace /events | **Tier 2: HTML scraper** |
| Bodhi Hive (420 Providence Mine Rd, NC) | **No** | Squarespace /events | **Tier 2: HTML scraper** + add to data.json |
| The Fern (235 Commercial, NC) | **No** | "Live Schedule" on site + Bandsintown | **Tier 2: HTML scraper or Bandsintown API** + add to data.json |
| Stardust Station (Nevada City) | **No** | Unstructured, Instagram only | **Tier 3: Community submission form** + add to data.json |
| The Unchurch (220 Bresee Way, GV) | **No** | No website, Songkick/Eventsfy only | **Tier 3: Community submission form** + add to data.json |
| Ol' Republic Brewery | Yes (stale) | **Permanently closed**, domain hijacked | **Remove from data.json** |

**Deferred discussion items (surface during /gsd:plan-phase):**
- How to handle Tier 2 venues without iCal (scraping vs Bandsintown API vs agentic browser cron)
- Event categorization/tagging system across all sources (GVDA has tags, KVMR doesn't, new venues need them)
- "Live Music" as a filter dimension vs. dedicated subpage vs. both
- Community submission form: Google Form → Sheet → pipeline, or custom web form?
- Family & Kids filter should be separate dimension from time chips (related todo)

**Absorbs todos:**
- stardust-local-directories (primary)
- gvda-rich-tags (event tagging scope)
- kvmr-no-tags (event tagging scope)
- family-filter-misplaced (filter dimension redesign)

Plans:
- [x] 02.2-01-PLAN.md — Venue data updates (add 4, remove 2) + Crazy Horse iCal and Squarespace JSON ingest scripts (Wave 1)
- [x] 02.2-02-PLAN.md — Event tagging system + merge pipeline extension + community form ingest (Wave 1)
- [x] 02.2-03-PLAN.md — GitHub Actions workflow update + frontend tag filtering (Wave 2)

### Phase 3: Itineraries
**Goal**: Visitors can browse curated 1/2/3-day trip plans with stop-by-stop narratives, see the route on the map, and add stops to their calendar
**Depends on**: Phase 1 (soft — card styling), Phase 2 (soft — expanded events improve context but not required)
**Requirements**: ITIN-01, ITIN-02, ITIN-03, ITIN-04, ITIN-05, ITIN-06, ITIN-07, ITIN-08, ITIN-09, ITIN-10
**Success Criteria** (what must be TRUE):
  1. Three authored itineraries (1-day, 2-day, 3-day) are browsable from the hero section with editorial card layout
  2. Opening an itinerary shows a stop-by-stop detail view with narrative text, business hours, and photos for each stop
  3. The map displays the itinerary route with numbered stop markers when an itinerary is active
  4. Each stop has an "Add to Google Calendar" link that creates a correctly-timed event in Pacific timezone
  5. Navigating to ?itinerary=<id> opens the specific itinerary directly (deep link works)
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — Itinerary data (itineraries.json) + model + calendar utility (Wave 1)
- [x] 03-02-PLAN.md — View, controller, HTML wiring, deep link, mobile swipe + verification (Wave 2)

### Phase 03.1: Content Architecture & Demo Curation (INSERTED)

**Goal:** Define the site's content architecture (hub + 2 sub-pages), curate featured content that demonstrates 5-source aggregation value, implement adaptive map layout, and structure the demo experience for Wednesday Feb 18 committee presentation
**Depends on:** Phase 3
**Plans:** 2/2 plans complete

Plans:
- [x] 03.1-01-PLAN.md — Hub adaptive map layout + curated featured demo content (Wave 1)
- [x] 03.1-02-PLAN.md — Events and Itineraries dedicated sub-pages + hub navigation (Wave 2)

### Phase 4: Copy & Positioning
**Goal**: All user-facing text positions the platform as the Experience Planning Committee's digital tool, emphasizing downtowns, galleries, dining, and performances over nature
**Depends on**: Phase 1 (visual direction established), Phase 3 (itinerary narratives exist to review)
**Requirements**: COPY-01, COPY-02, COPY-03, COPY-04, COPY-05, COPY-06
**Success Criteria** (what must be TRUE):
  1. Hero headlines reference downtowns, galleries, dining, and performances (not rivers, trails, or nature)
  2. Category descriptions and itinerary narratives lead with cultural stops (nature as supporting color only)
  3. MUSE editorial card selection prioritizes business/gallery/dining content
  4. Colophon credits the Experience Planning Committee and positions the platform as their digital tool
  5. Platform name is finalized with Diana/Eliza input and reflected across all surfaces
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Hub page + config.js copy rewrite (hero, categories, colophon, MUSE cards)
- [x] 04-02-PLAN.md — Itinerary + experience narrative rewrite (MUSE voice)
- [x] 04-03-PLAN.md — Sub-pages, chat prompt, platform name decision, consistency sweep

### Phase 5: AI Concierge
**Goal**: Visitors can ask natural-language questions about what to do, see, and eat in Nevada County and get MUSE-grounded answers with clickable asset links
**Depends on**: Phase 2 (hard — event data for recommendations), Phase 3 (hard — itinerary data for recommendations)
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, CHAT-08, CHAT-09, CHAT-10
**Success Criteria** (what must be TRUE):
  1. A chat button in the bottom-right corner opens a conversation panel (full-screen on mobile)
  2. Asking "where should I eat downtown?" returns restaurant recommendations from data.json with clickable names that open the detail panel
  3. Responses cite MUSE magazine when relevant ("Featured in MUSE Issue 3") with attribution links
  4. A privacy notice is visible in the chat widget explaining anonymous query logging
  5. Chatbot responds within 3 seconds and rejects off-topic requests ("write me a Python script") with a polite redirect
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — Knowledge pack build script, Vercel serverless function (Gemini proxy), package.json, Supabase logging (Wave 1)
- [x] 05-02-PLAN.md — Client chat modules (widget/view/controller), CSS, HTML wiring, response parsing with deep links + MUSE citations (Wave 2)

### Phase 6: Analytics Foundation
**Goal**: Every meaningful user interaction is tracked so the committee can see what visitors care about and prove referral value to local businesses
**Depends on**: No hard upstream dependency
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04, ANLYT-05, ANLYT-06, ANLYT-07, ANLYT-08, ANLYT-09, ANLYT-10, ANLYT-11, ANLYT-12, ANLYT-13, ANLYT-14
**Success Criteria** (what must be TRUE):
  1. Umami dashboard shows page views and visitor counts with zero cookie consent UI
  2. Clicking a venue's website/phone/directions link in the detail panel fires a tracked outbound event with UTM parameters
  3. Category filter, Open Now toggle, experience start, event click, search query, editorial card expand, and deep link arrival each appear as distinct events in Umami
  4. Rapid filter toggling does not flood the dashboard (dedup throttle working)
  5. Committee members can access a shared Umami dashboard URL without needing an account
**Plans**: 1 plan

Plans:
- [x] 06-01-PLAN.md — Analytics wrapper module, Umami script tag, instrument all 12+ interaction types, UTM outbound links, dedup throttle, Umami Cloud setup

### Phase 06.1: Deep Analytics Instrumentation (INSERTED)

**Goal:** Add 7 high-value analytics event types (marker clicks, itinerary engagement, event ticket attribution) to reach 23 total tracked interactions, filling remaining gaps for the committee's "clicked through to a business" metric
**Depends on:** Phase 6 (hard — requires analytics wrapper module)
**Success Criteria** (what must be TRUE):
  1. marker:click fires at all 3 entry points (circle click, mobile label, smart labels)
  2. itinerary:start, itinerary:calendar, itinerary:day-tab fire on respective interactions
  3. outbound:event-ticket fires with UTM params on all event ticket links
  4. events:date-filter and events:toggle fire on event page filter interactions
  5. Total tracked event types = 23 across 13 JS modules
**Plans:** 1/1 plans complete

Plans:
- [x] 06.1-01-PLAN.md — Instrument event ticket outbound tracking + UTM tagging, map marker clicks, itinerary system, and event filter interactions (7 new event types)

### Phase 7: Demand Signal Reporting
**Goal**: The committee receives a monthly intelligence report showing what visitors searched for, clicked on, and asked the chatbot -- actionable data no other small-town DMO has
**Depends on**: Phase 5 (hard — Supabase chatbot logs), Phase 6 (hard — Umami event data)
**Requirements**: REPT-01, REPT-02, REPT-03, REPT-04, REPT-05, REPT-06, REPT-07, REPT-08
**Success Criteria** (what must be TRUE):
  1. Running the report script produces a markdown file with top 10 assets by detail opens and outbound clicks
  2. Report includes category filter frequency ranking and zero-result search queries
  3. Report includes chatbot intent distribution (eat/see/do/stay/navigate)
  4. Report is readable as markdown and convertible to PDF for committee meetings
  5. Report can be triggered manually or via scheduled GitHub Action
**Plans**: TBD

**Absorbs todos:**
- analytics-mockup-report (demo preview of Phase 7's reporting capability)
- demo-deep-link-bookmarks (demo script showing features to committee)

Plans:
- [ ] 07-01: Umami Stats API data pull and aggregation script
- [ ] 07-02: Supabase chatbot log aggregation and intent classification
- [ ] 07-03: Report template, markdown/PDF output, and GitHub Actions trigger

### Phase 8: AI Trip Builder
**Goal**: Visitors can collect places and events into a personal dream board, then converse with the AI concierge to organize them into a structured, shareable, calendar-exportable trip plan — the first DMO trip builder where AI is the primary organizer, not drag-and-drop UI
**Depends on**: Phase 5 (hard — chat infrastructure for planning mode), Phase 3 (hard — itinerary view reused for finalized trips)
**Requirements**: Diana's mandatory ask for trip-building capability
**Success Criteria** (what must be TRUE):
  1. A bookmark icon on detail panels, directory cards, event cards, and map popups saves items to a personal dream board (localStorage, no account required)
  2. A dedicated trip page (`trip.html`) shows two zones: unstructured dream board and structured itinerary
  3. A "Plan this trip" CTA opens the AI concierge pre-seeded with dream board items; the chatbot asks preference questions and produces a structured itinerary via {{ITINERARY}} response blocks
  4. The finalized itinerary renders with the same visual treatment as curated itineraries (day tabs, stop cards, map route, calendar export) but distinguished by gold accent and "Built with the Local Concierge" attribution
  5. Users can save multiple named trips and share them via URL encoding
  6. Curated itineraries have a "Make it mine" button that clones stops into the dream board for customization
  7. Dream board items not included in the finalized itinerary persist in a "Still on your radar" zone
**Plans**: 4 plans

**Key decisions (from team brainstorm 2026-02-17):**
- AI chatbot is the PRIMARY organizer — no drag-and-drop builder
- Both places AND events are bookmarkable (events carry date/time context)
- Two entry points: additive (collect → organize) and conversational (ask concierge to plan from scratch)
- {{ITINERARY}} response blocks use pipe-delimited format (not JSON — LLMs break JSON ~15% of the time)
- Dream board context passed in user message (not system prompt) to preserve Gemini prompt cache
- Gold (#c8943e) as "your trip" accent color, gold dashed border on dream board cards
- Chatbot shifts to "knowledgeable friend" register in planning mode (still functional, but collaborative)
- Multiple trips supported from the start (schema supports it, UI shows trip switcher)
- Base64 URL sharing for v1 (~12 stop limit), Supabase-stored trips deferred to v2
- Merges localStorage favorites todo (dream board IS the bookmarking mechanism)

**Absorbs todos:**
- itinerary-show-on-map-ux (fix "Show on Map" UX before reusing itinerary view in plan 08-04)
- vrbo-plan-your-stay (lodging recommendations as trip planning extension)

**Design docs:** `.planning/brainstorm/trip-builder/` (4 docs from brainstorm team)

Plans:
- [x] 08-01-PLAN.md — Dream board model (localStorage CRUD, wishlist schema) + "Add to Trip" bookmark buttons across all surfaces (detail panel, directory cards, events, map popups)
- [x] 08-02-PLAN.md — Trip page (`trip.html`) with two-zone layout, dream board rendering, curated "Make it mine" bridge, multi-trip management UI
- [x] 08-03-PLAN.md — Chatbot itinerary planning mode: Gemini prompt extension, {{ITINERARY}} block format + parser, chat controller integration, dream board context pre-seeding
- [ ] 08-04-PLAN.md — Finalized itinerary rendering (reuse existing view), calendar export, shareable URL encoding, analytics events, polish

## Progress

**Execution Order:**
Actual: 2 -> 2.1 -> 3 -> 5 -> 6 -> 6.1 -> 4 -> 3.1 -> 2.2 -> 01.1
(Phase 1 by Codex outside GSD; decimal phases inserted as urgent needs arose)

**Milestone Boundaries:**
- M1 Foundation (core plumbing): 1, 2, 2.1, 3, 5
- M2 Launch Ready (polish + measurement): 01.1, 4, 3.1, 2.2, 6
- M3 Measurement (deep instrumentation): 6.1
- M4 Intelligence (reporting): 7
- M5 Personalization (trip planning): 8
- M6 Directory Redesign: 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design & Visual Refresh | 0/3 (plans obsolete) | ~60% — Codex built layout | - |
| 01.1. Demo Visual Polish | 3/3 | COMPLETE | 2026-02-17 |
| 2. Tier 2 Events | 3/3 | COMPLETE | 2026-02-14 |
| 02.1. KVMR + GVDA Events | 2/2 | COMPLETE | 2026-02-15 |
| 02.2. Live Music & Venue Events | 3/3 | COMPLETE | 2026-02-17 |
| 3. Itineraries | 2/2 | COMPLETE | 2026-02-15 |
| 03.1. Content Architecture | 2/2 | COMPLETE | 2026-02-17 |
| 4. Copy & Positioning | 3/3 | COMPLETE | 2026-02-16 |
| 5. AI Concierge | 2/2 | COMPLETE | 2026-02-15 |
| 6. Analytics Foundation | 1/1 | COMPLETE | 2026-02-16 |
| 06.1. Deep Analytics | 1/1 | COMPLETE | 2026-02-16 |
| 7. Demand Signal Reporting | 0/3 | Not started | - |
| 8. AI Trip Builder | 3/4 | IN PROGRESS | - |
| 9. Directory Page Redesign | 0/4 | PLANNED | - |

### Phase 9: Directory Page Redesign

**Goal:** The directory page (directory.html) matches the hub's editorial aesthetic, has fully working hours/events features, handles all interaction edge cases gracefully, fixes data quality issues, and provides a polished split-pane browse experience on desktop and mobile with robust deep linking and QR code gallery support
**Depends on:** Phase 01.1 (hard — hub header/nav markup to replicate), Phase 2 (hard — events data for card badges), Phase 3 (soft — hours utils already available)
**Requirements:** 32-item consolidated audit from 3 sources: ROADMAP 26-item review + 5 absorbed todos + 6 QR journey audit findings (auditor team, 2026-02-18) — see below

**Consolidated Audit Summary (2026-02-18, 32 issues):**

**Critical Issues (5 — blocks all other work):**
- C1: Header doesn't match hub — uses old dark `.brand`/`.stitch-top-nav` instead of new `.mast-inner` cream/blur
- C2: Nav hidden on mobile (<1080px) — no hamburger, users trapped
- C3: Dark sidebar (`#1f2937` Tailwind charcoal) clashes with editorial cream/ink/gold
- C4: Hours stubbed to "unknown" — `getHoursState()` always returns 'unknown'
- C5: Events stubbed to 0 — `getEventCountForAsset14d()` always returns 0

**Major Issues (16 — core features + UX gaps):**
- M1: Expanded card destroyed on search/filter re-render (innerHTML nuke) — detail state lost during filter updates
- M2: No browser back/forward (replaceState only, no popstate) — browser history broken
- M3: No empty state for zero search results — users see blank list without feedback
- M4: Missing `.hours-pill` base CSS (renders as plain text)
- M5: Category grid too dense (3-col in half-width pane) — mobile legibility poor
- M6: Skeletal footer (just copyright line) — missing footer content
- M7: Missing Archivo font in Google Fonts link — typography incomplete
- M8: Mobile map 50vh with no collapse toggle — can't maximize list space
- M9: No sort options for venue lists — hard to browse at scale
- M10: No list-map hover sync (panes feel disconnected) — marker/card highlighting missing
- M11: Pagination lacks progress ("Show more" with no count) — users don't know scope
- M12: **[NEW]** Deep link loading state — no spinner/toast when ?pid= or ?place= present on slow mobile
- M13: **[NEW]** Silent deep link failure — if findVenueByPid() returns null, no error message or analytics
- M14: **[NEW]** popstate handler drops deep links — browser back/forward before map load silently fails
- M15: **[NEW]** No "back to trail" breadcrumb — detail panel lacks context/navigation back
- M16: **[NEW]** Gallery shows 7/25 QR codes with no scope messaging — committee confusion on coverage

**Minor Issues (11 — polish + a11y + data quality):**
- Min1: **[NEW]** ?idx=544 fragility — Elixart uses raw array index instead of stable pid (if data re-sorted, points to wrong venue)
- Min2: Silent deep link failure (category/fuzzy match edge cases)
- Min3: City filter threshold not defined
- Min4: No sticky header on scroll — search/category pills scroll out of view
- Min5: No keyboard a11y (tab order, focus trap, search submit)
- Min6: Fallback ID mismatch (deep link parameter names inconsistent: `?pid=` vs `?idx=` vs `?place=`)
- Min7: Deep link timing (race condition on map load)
- Min8: Inline tooltip styles (hoverPopup not using editorial tokens)
- Min9: Search focus ring missing (a11y)
- Min10: Expanded card contrast (text readability in detail panel may fail WCAG AA)
- Min11: Deduplicate same-category entries in data.json (3 duplicates visible: Avanguardia Winery, South Pine Cafe, The Pour House)

**Data Quality Issues (2 — visible in directory):**
- D1: Fix 3 assets with incorrect map coordinates (Alan Thiesen Trail, Sawtooth Trailhead, Coburn Music render in wrong locations)
- D2: Deduplicate same-category entries in data.json (Min11 dup) — 3 duplicates in Eat/Drink/Stay category

**Success Criteria** (what must be TRUE):
  1. Directory header matches hub's `.mast-inner` structure (cream/blur, sticky, hamburger on mobile) — **C1, C2**
  2. Sidebar/list uses editorial color tokens (`--cream`, `--ink`, `--gold`) — not Tailwind charcoal — **C3**
  3. Hours status is real (calls `hoursUtils.getHoursState()`) with "Open Now" toggle filter — **C4**
  4. Event counts are real (from merged events data) with event badges on cards — **C5**
  5. Expanded cards survive search/filter re-renders without content flash — **M1**
  6. Browser back/forward works through category → card → back navigation — **M2**
  7. Zero-results search shows "No results found" message — **M3**
  8. Mobile users can navigate to all pages (hamburger or visible nav) — **C2**
  9. Mobile map pane is collapsible to maximize list browsing space — **M8**
  10. "Show more" displays remaining count (e.g., "Show 97 more") — **M11**
  11. Deep links (?pid=, ?place=) load with visual feedback (spinner/toast) and fail gracefully with error message — **M12, M13**
  12. Browser back/forward works for deep links even if map not yet loaded — **M14**
  13. List-map hover sync: hovering card highlights marker, hovering marker highlights card — **M10**
  14. QR gallery section displays scope messaging (7/25 featured, with explanation) — **M16**
  15. Data quality: 3 bad coordinates fixed, 3 duplicate entries deduplicated, consistent stable ID system (pid only, no idx) — **D1, D2, Min1**

**Absorbs todos:**
- category-cards-split-pane-directory (this IS the directory redesign)
- directory-map-hover-tooltips-missing-on-nearby-markers (M10)
- directory-page-card-expansion-and-deep-linking (M1, M2, M12-M15)
- deduplicate-same-category-entries-in-data-json (D2, Min11)
- fix-3-assets-with-incorrect-map-coordinates (D1)

**Proposed Plan Breakdown (4 sub-phases):**

- [ ] 09-01-PLAN.md — **Foundation (C1-C5, M4, M7):** Header/nav visual match, color tokens audit, hours wiring, events wiring, CSS base styles. *Priority: unblocks all other work*
- [ ] 09-02-PLAN.md — **Deep Link System (M1, M2, M12-M15, Min1, Min6, Min7):** Robust deep link loading/error handling, back/forward history, stable pid system (remove idx fragility), breadcrumb navigation
- [ ] 09-03-PLAN.md — **Interactions + Hover Sync (M10, M11, M3, M5, M6, M8, M9, Min2-Min5, Min8-Min10):** List-map sync, pagination, empty state, sort/filter UX, mobile collapse, footer content, sticky header, a11y fixes, tooltip tokens
- [ ] 09-04-PLAN.md — **Data Fixes + QR Integration (D1, D2, M16, Min11):** Coordinate corrections (3), deduplication (3), QR gallery scope messaging, final polish + verification

**Notes:**
- **NEW issues (6 from QR journey audit):** M12, M13, M14, M15, M16, Min1 — arose from beta testing deep links via QR codes; essential for committee gallery workflow
- **Execution order**: Follow priority path 09-01 → 09-02 → 09-03 → 09-04 (foundation must complete before interactions, deep links before interactions to avoid state mess)
- **Staffing**: Critical issues (C1-C5) estimated 8-12 hours; major issues another 16-20 hours; minor + data ~8 hours total. Roughly 2-3 days full-time or 1.5 weeks part-time.

**Plans:** 3/4 plans executed

Plans:
- [ ] 09-01-PLAN.md — Foundation: header/nav match, sidebar colors, hours/events wiring, CSS base (Wave 1)
- [ ] 09-02-PLAN.md — Deep link system: card re-render fix, pushState/popstate, loading/error states, breadcrumbs (Wave 2)
- [ ] 09-03-PLAN.md — Interactions: empty state, sort, hover sync, mobile map toggle, footer, keyboard a11y (Wave 3)
- [ ] 09-04-PLAN.md — Data fixes + QR: coordinate audit, deduplication, Elixart ?place= link, scope messaging (Wave 2, parallel with 09-02)
