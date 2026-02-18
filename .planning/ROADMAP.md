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
| **M6: Directory Redesign** | 9 | Directory page rebuild from 26-item audit |

**Note on execution history:** Phases 1-6.1 were delivered deadline-driven (Feb 18 committee demo), not dependency-driven. Five decimal phases (01.1, 02.1, 02.2, 03.1, 06.1) were inserted as urgent needs arose. Going forward, enforce dependency order to avoid rework.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [~] **Phase 1: Design & Visual Refresh** - Lock visual direction and ship MUSE-adjacent aesthetic across all surfaces *(~60% — layout shipped by Codex, map broken)*
- [x] **Phase 01.1: Demo Visual Polish** - INSERTED: Ship visual polish for Wed Feb 18 committee demo — hero overhaul, hybrid nav, AI style cards, email capture, editorial deep links. Informed by design discussion + 4-agent analysis team (UX, Tech Feasibility, Competitive Gap, Demo Strategy). See `.planning/DESIGN-SPEC.md` + `.planning/analysis/PRIORITIZED-ACTION-PLAN.md`
- [x] **Phase 2: Tier 2 Events** - Triple event coverage by aggregating LibCal and CivicEngage feeds alongside Trumba
- [x] **Phase 02.1: KVMR + GVDA Event Source Ingestion** - Add KVMR iCal and GVDA Trumba JSON feeds to close event coverage gaps before Wednesday demo
- [x] **Phase 02.2: Live Music & Venue Event Ingestion** - INSERTED: Add missing live music venues to asset data, ingest venue-owned event feeds (Crazy Horse iCal, Squarespace scrapers), create Live Music category/tag system, scope community submission form and dedicated Live Music subpage (completed 2026-02-17)
- [x] **Phase 3: Itineraries** - Authored multi-day trip plans that visitors can browse, follow on the map, and export to calendar
- [x] **Phase 03.1: Content Architecture & Demo Curation** - INSERTED: Hub adaptive map layout, curated featured demo content, Events + Itineraries sub-pages
- [x] **Phase 4: Copy & Positioning** - Reframe all text to drive visitors downtown, not into the woods
- [x] **Phase 5: AI Concierge** - Gemini-powered chatbot that answers "what should I do tonight?" grounded in MUSE content
- [x] **Phase 6: Analytics Foundation** - Instrument every meaningful interaction so the committee can prove referral value
- [x] **Phase 06.1: Deep Analytics Instrumentation** - INSERTED: 7 additional event types for marker clicks, itinerary engagement, event ticket attribution
- [ ] **Phase 7: Demand Signal Reporting** - Monthly intelligence reports the committee can use to make data-driven decisions
- [ ] **Phase 8: AI Trip Builder** - Dream board + AI-powered itinerary planning: users collect places and events, converse with the concierge to organize them into structured trip plans
- [ ] **Phase 9: Directory Page Redesign** - Rebuild directory page to match hub editorial aesthetic, wire stubbed features (hours, events), fix interaction bugs, improve mobile UX

## Phase Details

### Phase 1: Design & Visual Refresh
**Goal**: The platform looks and feels like a polished MUSE-inspired travel publication, not a government listings site
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06, DSGN-07
**Success Criteria** (revised to reflect Codex reality):
  1. Magazine-style layout exists with editorial typography, cream/ink color palette, and MUSE-inspired aesthetic ✅ (Codex built layout, commit `b2d7e48`)
  2. Map renders correctly with 3D terrain and all 687 markers ✅ (fixed in commit `48a9486`)
  3. Hero section reads as intentional editorial layout ✅ (rebuilt in Phase 01.1)
  4. Mobile layout functional at 375px — PARTIAL (not fully tested, known issues in Phase 01.1)
  5. Copy references visitor experiences, not "cultural assets" ✅ (completed in Phase 4)
**Plans**: 3 plans (ALL OBSOLETE — Codex rebuilt from scratch)

Plans:
- [~] 01-01-PLAN.md — Replace :root design tokens *(OBSOLETE)*
- [~] 01-02-PLAN.md — Apply editorial card tokens *(OBSOLETE)*
- [~] 01-03-PLAN.md — Layout rebuild + copy reframing *(OBSOLETE)*

**NOTE**: Original GSD plans were conservative token swaps that produced no visible change. Codex (OpenAI) independently built a magazine-style layout rebuild. Remaining Phase 1 gaps (mobile, copy) were closed by Phases 01.1 and 4. See `01-03-SUMMARY.md` for completion assessment.

### Phase 01.1: Demo Visual Polish (INSERTED)

**Goal:** Ship visual polish for Wed Feb 18 committee demo — hero overhaul, hybrid nav, AI style cards (in-chat only), email capture, community photo grid, editorial deep links
**Depends on:** Phase 1 (~60% complete — magazine layout exists)
**Requirements:** DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06
**Success Criteria** (what must be TRUE):
  1. Hero section reads as magazine cover (photo carousel + editorial typography + brand mark)
  2. Top bar is clean and minimal (brand mark + expandable search + nav links on desktop, hamburger on mobile)
  3. AI Concierge has style cards inside chat panel for friction-free demo
  4. Email capture form exists in footer with Google Sheet backend
  5. Community photo grid shows UGC potential near footer
  6. Committee member can load the URL and immediately understand this is a tourism platform
**Plans**: 3 plans

Plans:
- [x] 01.1-01-PLAN.md — Hero visual overhaul + clean top bar (Wave 1)
- [x] 01.1-02-PLAN.md — AI Concierge style cards + editorial deep links (Wave 2)
- [x] 01.1-03-PLAN.md — Footer features (email capture, photo grid) + layout polish + verification (Wave 3)

### Phase 2: Tier 2 Events
**Goal**: The events section shows 3x more events by aggregating library and municipal calendars alongside Trumba, with source attribution and family filtering
**Depends on**: Phase 1 (soft — event card styling established, but can ship independently)
**Requirements**: EVNT-01, EVNT-02, EVNT-03, EVNT-04, EVNT-05, EVNT-06, EVNT-07, EVNT-08, EVNT-09
**Success Criteria** (what must be TRUE):
  1. Events from LibCal and CivicEngage appear alongside Trumba events in the carousel and list views
  2. Each event card shows a source attribution badge ("From Nevada County Library", "From City of Grass Valley")
  3. Duplicate events (same title + date + venue across sources) appear only once
  4. A "Family & Kids" filter chip narrows the event list to family-friendly events
  5. If the merged JSON is unavailable, events gracefully fall back to Trumba RSS (no blank section)
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — LibCal iCal and CivicEngage RSS ingest scripts (Wave 1)
- [x] 02-02-PLAN.md — Merge/dedup pipeline, family classifier, and GitHub Actions cron (Wave 2)
- [x] 02-03-PLAN.md — Client integration: source badges, family filter chip, fallback loading (Wave 3)

### Phase 02.1: KVMR + GVDA Event Source Ingestion (INSERTED)

**Goal:** Add KVMR community radio iCal and GVDA Trumba JSON as 4th and 5th event sources, closing coverage gaps (Mardi Gras, downtown events) before the Wednesday Feb 18 committee demo
**Depends on:** Phase 2
**Plans:** 2 plans

Plans:
- [x] 02.1-01-PLAN.md — KVMR iCal and GVDA Trumba JSON ingest scripts (Wave 1)
- [x] 02.1-02-PLAN.md — Merge pipeline extension and GitHub Actions workflow update (Wave 2)

### Phase 02.2: Live Music & Venue Event Ingestion (INSERTED)

**Goal:** Surface Nevada County's live music scene by adding missing venues to the asset map, ingesting venue-owned event feeds as sources 6-9, creating a "Live Music" event tag/category system, and scoping a community submission form for venues without structured calendars. Potential dedicated Live Music subpage.
**Depends on:** Phase 02.1
**Plans:** 3/3 plans complete

**Research completed (Perplexity, 2026-02-17):**

| Venue | In Assets? | Events Feed? | Ingestion Strategy |
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
- [ ] 08-02-PLAN.md — Trip page (`trip.html`) with two-zone layout, dream board rendering, curated "Make it mine" bridge, multi-trip management UI
- [ ] 08-03-PLAN.md — Chatbot itinerary planning mode: Gemini prompt extension, {{ITINERARY}} block format + parser, chat controller integration, dream board context pre-seeding
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
| 8. AI Trip Builder | 1/4 | IN PROGRESS | - |
| 9. Directory Page Redesign | 0/TBD | Not planned | - |

### Phase 9: Directory Page Redesign

**Goal:** The directory page (directory.html) matches the hub's editorial aesthetic, has working hours/events features, handles all interaction edge cases gracefully, and provides a polished split-pane browse experience on desktop and mobile
**Depends on:** Phase 01.1 (hard — hub header/nav markup to replicate), Phase 2 (hard — events data for card badges), Phase 3 (soft — hours utils already available)
**Requirements:** 26-item audit from 3-agent team review (UX, Visual Design, Functional QA) — see below

**Audit Summary (2026-02-17):**

Critical (5):
1. Header doesn't match hub — uses old dark `.brand`/`.stitch-top-nav` instead of new `.mast-inner` cream/blur
2. Nav hidden on mobile (<1080px) — no hamburger, users trapped
3. Dark sidebar (`#1f2937` Tailwind charcoal) clashes with editorial cream/ink/gold
4. Hours stubbed to "unknown" — `getHoursState()` always returns 'unknown'
5. Events stubbed to 0 — `getEventCountForAsset14d()` always returns 0

Major (11):
6. Expanded card destroyed on search/filter re-render (innerHTML nuke)
7. No browser back/forward (replaceState only, no popstate)
8. No empty state for zero search results
9. Missing `.hours-pill` base CSS (renders as plain text)
10. Category grid too dense (3-col in half-width pane)
11. Skeletal footer (just copyright line)
12. Missing Archivo font in Google Fonts link
13. Mobile map 50vh with no collapse toggle
14. No sort options for venue lists
15. No list-map hover sync (panes feel disconnected)
16. Pagination lacks progress ("Show more" with no count)

Minor (10):
17-26. Silent deep link failure, ambiguous search scope, city filter threshold, no sticky header, no keyboard a11y, fallback ID mismatch, deep link timing, inline tooltip styles, search focus ring, expanded card contrast

**Success Criteria** (what must be TRUE):
  1. Directory header matches hub's `.mast-inner` structure (cream/blur, sticky, hamburger on mobile)
  2. Sidebar/list uses editorial color tokens (`--cream`, `--ink`, `--gold`) — not Tailwind charcoal
  3. Hours status is real (calls `hoursUtils.getHoursState()`) with "Open Now" toggle filter
  4. Event counts are real (from merged events data) with event badges on cards
  5. Expanded cards survive search/filter re-renders without content flash
  6. Browser back/forward works through category → card → back navigation
  7. Zero-results search shows "No results found" message
  8. Mobile users can navigate to all pages (hamburger or visible nav)
  9. Mobile map pane is collapsible to maximize list browsing space
  10. "Show more" displays remaining count (e.g., "Show 97 more")

**Absorbs todos:**
- category-cards-split-pane-directory (this IS the directory redesign concept)
- directory-map-hover-tooltips-missing-on-nearby-markers (directory-specific map bug)
- directory-page-card-expansion-and-deep-linking (directory interaction feature)
- deduplicate-same-category-entries-in-data-json (data quality: 3 duplicate assets visible in directory)
- fix-3-assets-with-incorrect-map-coordinates (data quality: 3 coordinate anomalies visible on directory map)

**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 9 to break down)
