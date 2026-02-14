# Roadmap: GVNC Cultural District Experience Platform

## Overview

Transform the existing 687-asset cultural map into an editorial-quality experience platform that drives visitors and locals to downtowns, businesses, and cultural spaces. Seven phases deliver the platform in two tiers: MVP (Phases 1-5) delivers everything Diana Arbex explicitly asked for -- MUSE visual aesthetic, expanded event coverage, itineraries, downtown-forward positioning, and AI concierge for the Feb 18 demo topic; Growth (Phases 6-7) adds analytics instrumentation and demand signal reporting that the committee will want once the platform has traffic. Tier 2 Events is pulled early (Phase 2) so that expanded content improves every downstream feature -- better itinerary context, better AI answers, better copy decisions.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Design & Visual Refresh** - Lock visual direction and ship MUSE-adjacent aesthetic across all surfaces
- [ ] **Phase 2: Tier 2 Events** - Triple event coverage by aggregating LibCal and CivicEngage feeds alongside Trumba
- [ ] **Phase 3: Itineraries** - Authored multi-day trip plans that visitors can browse, follow on the map, and export to calendar
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
- [ ] 01-01-PLAN.md — Replace :root design tokens (palette, shadows, card tokens) and sync category colors
- [ ] 01-02-PLAN.md — Apply editorial card tokens and hero refinement across all CSS sections
- [ ] 01-03-PLAN.md — Mobile responsive polish (375/390/768px) and copy reframing pass

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
**Plans**: TBD

Plans:
- [ ] 02-01: iCal fetch cron scripts for LibCal and CivicEngage feeds
- [ ] 02-02: Dedup logic, family classifier, and events-merged.json pipeline
- [ ] 02-03: Client integration (source badges, family filter chip, fallback logic)

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
**Plans**: TBD

Plans:
- [ ] 03-01: Itinerary data schema and 3 authored itineraries (content authoring)
- [ ] 03-02: Itinerary model, view, and controller modules (MVC)
- [ ] 03-03: Map route rendering, calendar export, deep linking, and mobile swipe view

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
**Plans**: TBD

Plans:
- [ ] 05-01: Chat widget UI (FAB, panel, mobile overlay)
- [ ] 05-02: Vercel edge function proxy with Gemini API, system prompt, and Supabase logging
- [ ] 05-03: Response parsing (deep links, MUSE citations), input sanitization, and rate limiting

### Phase 6: Analytics Foundation
**Goal**: Every meaningful user interaction is tracked so the committee can see what visitors care about and prove referral value to local businesses
**Depends on**: No hard upstream dependency
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04, ANLYT-05, ANLYT-06, ANLYT-07, ANLYT-08, ANLYT-09, ANLYT-10, ANLYT-11, ANLYT-12, ANLYT-13, ANLYT-14
**Success Criteria** (what must be TRUE):
  1. Plausible dashboard shows page views and visitor counts with zero cookie consent UI
  2. Clicking a venue's website/phone/directions link in the detail panel fires a tracked outbound event with UTM parameters
  3. Category filter, Open Now toggle, experience start, event click, search query, editorial card expand, and deep link arrival each appear as distinct events in Plausible
  4. Rapid filter toggling does not flood the dashboard (dedup throttle working)
  5. Committee members can access a shared Plausible dashboard URL without needing an account
**Plans**: TBD

Plans:
- [ ] 06-01: Plausible script integration and provider-agnostic analytics module
- [ ] 06-02: Instrument all 12 interaction types with 3-tier event taxonomy
- [ ] 06-03: UTM outbound links, dedup throttle, and shared dashboard setup

### Phase 7: Demand Signal Reporting
**Goal**: The committee receives a monthly intelligence report showing what visitors searched for, clicked on, and asked the chatbot -- actionable data no other small-town DMO has
**Depends on**: Phase 5 (Supabase chatbot logs), Phase 6 (Plausible data)
**Requirements**: REPT-01, REPT-02, REPT-03, REPT-04, REPT-05, REPT-06, REPT-07, REPT-08
**Success Criteria** (what must be TRUE):
  1. Running the report script produces a markdown file with top 10 assets by detail opens and outbound clicks
  2. Report includes category filter frequency ranking and zero-result search queries
  3. Report includes chatbot intent distribution (eat/see/do/stay/navigate)
  4. Report is readable as markdown and convertible to PDF for committee meetings
  5. Report can be triggered manually or via scheduled GitHub Action
**Plans**: TBD

Plans:
- [ ] 07-01: Plausible Stats API data pull and aggregation script
- [ ] 07-02: Supabase chatbot log aggregation and intent classification
- [ ] 07-03: Report template, markdown/PDF output, and GitHub Actions trigger

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

**Milestone Boundaries:**
- MVP (delivers Diana's asks + comprehensive content): Phases 1-5
- Growth (committee value-adds): Phases 6-7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design & Visual Refresh | 0/3 | Not started | - |
| 2. Tier 2 Events | 0/3 | Not started | - |
| 3. Itineraries | 0/3 | Not started | - |
| 4. Copy & Positioning | 0/3 | Not started | - |
| 5. AI Concierge | 0/3 | Not started | - |
| 6. Analytics Foundation | 0/3 | Not started | - |
| 7. Demand Signal Reporting | 0/3 | Not started | - |
