# Roadmap: GVNC Cultural District Experience Platform

## Overview

Transform the existing 687-asset cultural map into an editorial-quality experience platform that drives visitors and locals to downtowns, businesses, and cultural spaces. Seven phases deliver the platform in two tiers: MVP (Phases 1-5) delivers everything Diana Arbex explicitly asked for -- MUSE visual aesthetic, expanded event coverage, itineraries, downtown-forward positioning, and AI concierge for the Feb 18 demo topic; Growth (Phases 6-7) adds analytics instrumentation and demand signal reporting that the committee will want once the platform has traffic. Tier 2 Events is pulled early (Phase 2) so that expanded content improves every downstream feature -- better itinerary context, better AI answers, better copy decisions.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [~] **Phase 1: Design & Visual Refresh** - Lock visual direction and ship MUSE-adjacent aesthetic across all surfaces *(~60% — layout shipped by Codex, map broken)*
- [x] **Phase 2: Tier 2 Events** - Triple event coverage by aggregating LibCal and CivicEngage feeds alongside Trumba
- [x] **Phase 02.1: KVMR + GVDA Event Source Ingestion** - Add KVMR iCal and GVDA Trumba JSON feeds to close event coverage gaps before Wednesday demo
- [x] **Phase 3: Itineraries** - Authored multi-day trip plans that visitors can browse, follow on the map, and export to calendar
- [ ] **Phase 4: Copy & Positioning** - Reframe all text to drive visitors downtown, not into the woods
- [ ] **Phase 5: AI Concierge** - Gemini-powered chatbot that answers "what should I do tonight?" grounded in MUSE content
- [ ] **Phase 6: Analytics Foundation** - Instrument every meaningful interaction so the committee can prove referral value
- [ ] **Phase 7: Demand Signal Reporting** - Monthly intelligence reports the committee can use to make data-driven decisions

## Phase Details

### Phase 1: Design & Visual Refresh
**Goal**: The platform looks and feels like a polished MUSE-inspired travel publication, not a government listings site
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06, DSGN-07
**Success Criteria** (what must be TRUE):
  1. A single visual direction is chosen and documented (brainstorm complete, not open-ended)
  2. Typography, color palette, and card styling are consistent across hero, directory, events, and editorial sections
  3. Hero section reads as intentional editorial layout, not a default landing page
  4. Mobile layout is functional and readable at 375px width without horizontal scroll or overlapping elements
  5. All visible UI copy references visitor experiences and local businesses (no internal language like "cultural assets" or nature-forward framing)
**Plans**: 3 plans

Plans:
- [~] 01-01-PLAN.md — Replace :root design tokens *(OBSOLETE — Codex rebuilt CSS from scratch)*
- [~] 01-02-PLAN.md — Apply editorial card tokens *(OBSOLETE — Codex rebuilt CSS from scratch)*
- [~] 01-03-PLAN.md — Layout rebuild + copy reframing *(Codex built magazine layout; map broken, mobile untested)*

**NOTE**: Original plans were conservative token swaps that produced no visible change. Codex (OpenAI) independently built a magazine-style layout rebuild. GSD plans are obsolete. See `01-03-SUMMARY.md` for completion assessment and known issues. Phase 1 remaining work: fix map rendering bug, add 4 missing DOM IDs, mobile test, copy audit.

### Phase 2: Tier 2 Events
**Goal**: The events section shows 3x more events by aggregating library and municipal calendars alongside Trumba, with source attribution and family filtering
**Depends on**: Phase 1 (event card styling established)
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

### Phase 3: Itineraries
**Goal**: Visitors can browse curated 1/2/3-day trip plans with stop-by-stop narratives, see the route on the map, and add stops to their calendar
**Depends on**: Phase 1 (card styling for itinerary cards); can reference expanded event data from Phase 2
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
**Plans**: TBD

Plans:
- [ ] 04-01: Hero and category copy rewrite (downtown-forward positioning)
- [ ] 04-02: Itinerary narrative and editorial card content audit
- [ ] 04-03: Colophon, platform name finalization, and full copy sweep

### Phase 5: AI Concierge
**Goal**: Visitors can ask natural-language questions about what to do, see, and eat in Nevada County and get MUSE-grounded answers with clickable asset links
**Depends on**: Phase 2 (event data for recommendations), Phase 3 (itinerary data for recommendations)
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, CHAT-08, CHAT-09, CHAT-10
**Success Criteria** (what must be TRUE):
  1. A chat button in the bottom-right corner opens a conversation panel (full-screen on mobile)
  2. Asking "where should I eat downtown?" returns restaurant recommendations from data.json with clickable names that open the detail panel
  3. Responses cite MUSE magazine when relevant ("Featured in MUSE Issue 3") with attribution links
  4. A privacy notice is visible in the chat widget explaining anonymous query logging
  5. Chatbot responds within 3 seconds and rejects off-topic requests ("write me a Python script") with a polite redirect
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md — Knowledge pack build script, Vercel serverless function (Gemini proxy), package.json, Supabase logging (Wave 1)
- [ ] 05-02-PLAN.md — Client chat modules (widget/view/controller), CSS, HTML wiring, response parsing with deep links + MUSE citations (Wave 2)

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
- [ ] 06-01-PLAN.md — Analytics wrapper module, Umami script tag, instrument all 12+ interaction types, UTM outbound links, dedup throttle, Umami Cloud setup

### Phase 7: Demand Signal Reporting
**Goal**: The committee receives a monthly intelligence report showing what visitors searched for, clicked on, and asked the chatbot -- actionable data no other small-town DMO has
**Depends on**: Phase 5 (Supabase chatbot logs), Phase 6 (Umami data)
**Requirements**: REPT-01, REPT-02, REPT-03, REPT-04, REPT-05, REPT-06, REPT-07, REPT-08
**Success Criteria** (what must be TRUE):
  1. Running the report script produces a markdown file with top 10 assets by detail opens and outbound clicks
  2. Report includes category filter frequency ranking and zero-result search queries
  3. Report includes chatbot intent distribution (eat/see/do/stay/navigate)
  4. Report is readable as markdown and convertible to PDF for committee meetings
  5. Report can be triggered manually or via scheduled GitHub Action
**Plans**: TBD

Plans:
- [ ] 07-01: Umami Stats API data pull and aggregation script
- [ ] 07-02: Supabase chatbot log aggregation and intent classification
- [ ] 07-03: Report template, markdown/PDF output, and GitHub Actions trigger

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 2.1 -> 3 -> 5 -> 4 -> 6 -> 7
(Phase 4 moved after 5 — copy polish happens after all features exist)

**Milestone Boundaries:**
- MVP (delivers Diana's asks + comprehensive content): Phases 1-5, then 4 as final polish
- Growth (committee value-adds): Phases 6-7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design & Visual Refresh | 0/3 (plans obsolete) | ~60% — Codex built layout, map broken, mobile untested | - |
| 2. Tier 2 Events | 3/3 | COMPLETE — pipeline + client integration shipped | 2026-02-14 |
| 02.1. KVMR + GVDA Events | 2/2 | COMPLETE — 5-source pipeline, 176 events (+47%) | 2026-02-15 |
| 3. Itineraries | 2/2 | COMPLETE — 3 itineraries, hero cards, detail overlay, map routes, calendar, deep link | 2026-02-15 |
| 4. Copy & Positioning | 0/3 | Not started | - |
| 5. AI Concierge | 0/3 | Not started | - |
| 6. Analytics Foundation | 0/3 | Not started | - |
| 7. Demand Signal Reporting | 0/3 | Not started | - |
