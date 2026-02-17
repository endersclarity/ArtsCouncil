# Requirements: GVNC Cultural District Experience Platform

**Defined:** 2026-02-14
**Core Value:** Drive people to downtowns, local businesses, performance venues, and cultural spaces through an editorial-quality interactive experience that feels like MUSE magazine.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases. MVP (Phases 1-5) delivers Diana's explicit asks plus comprehensive content first, Growth (Phases 6-7) adds committee value-adds.

### Design & Visual Refresh (Epic 1 -- MVP)

- [x] **DSGN-01**: Brainstorming session to lock in one visual direction (clean, bold, MUSE-adjacent -- not a magazine interaction model)
- [x] **DSGN-02**: Typography refresh (Playfair Display headings, DM Sans body, polished spacing)
- [x] **DSGN-03**: Color palette updated to clean, bright tones that could belong in a MUSE page
- [x] **DSGN-04**: Consistent card styling across itineraries, events, directory, and editorial content
- [x] **DSGN-05**: Hero section that looks polished and intentional (not over-designed)
- [x] **DSGN-06**: Mobile layout works well (functional responsive, not fancy magazine UX)
- [ ] **DSGN-07**: All UI copy reframed around visitor experience and local economy (not nature, not internal language)

### Tier 2 Events (Epic 2 -- MVP)

- [ ] **EVNT-01**: Cron script fetches LibCal iCal feed daily and parses to normalized JSON
- [ ] **EVNT-02**: Cron script fetches CivicEngage iCal feed daily and parses to normalized JSON
- [ ] **EVNT-03**: Dedup logic matches events across sources by title + date + venue (fuzzy)
- [ ] **EVNT-04**: Each event tagged with source attribution (trumba / libcal / civicengage)
- [ ] **EVNT-05**: Family/kids keyword classifier flags events for family filter
- [ ] **EVNT-06**: events-merged.json output served as static file alongside events.xml
- [ ] **EVNT-07**: Events model loads merged JSON when available, falls back to Trumba RSS
- [ ] **EVNT-08**: Event cards display source attribution badge ("From Nevada County Library")
- [ ] **EVNT-09**: "Family & Kids" filter chip available in events view

### Itineraries (Epic 3 -- MVP)

- [ ] **ITIN-01**: itineraries.json schema defined with id, title, duration (1/2/3-day), theme, season, stops with asset references
- [ ] **ITIN-02**: "Arts & Nature: A Perfect Day" 1-day itinerary authored with narrative per stop
- [ ] **ITIN-03**: "The Full Nevada County Experience" 2-day itinerary authored with narrative per stop
- [ ] **ITIN-04**: "Deep Dive: Art, History & Wine" 3-day itinerary authored with narrative per stop
- [ ] **ITIN-05**: Itinerary cards displayed in hero section with MUSE-style editorial layout
- [ ] **ITIN-06**: Itinerary detail view shows stop-by-stop layout with narrative, hours, photos, and map integration
- [ ] **ITIN-07**: Each itinerary stop has "Add to Google Calendar" export link (Google Calendar URL or .ics)
- [ ] **ITIN-08**: Map shows itinerary route with stop markers when itinerary is active
- [ ] **ITIN-09**: Deep linking via ?itinerary=<id> URL parameter opens specific itinerary
- [ ] **ITIN-10**: Mobile itinerary view is swipeable stop-by-stop

### Copy & Positioning (Epic 4 -- MVP)

- [ ] **COPY-01**: Hero section headlines emphasize downtowns, galleries, dining, performances (not nature)
- [ ] **COPY-02**: Category descriptions rewritten to remove nature-forward framing
- [ ] **COPY-03**: Itinerary narratives lead with cultural stops, trails/nature as supporting color
- [ ] **COPY-04**: MUSE editorial card selection prioritizes business/gallery/dining content over nature
- [ ] **COPY-05**: Colophon positions platform as Experience Planning Committee's digital tool
- [ ] **COPY-06**: Platform name finalized with Diana/Eliza input

### AI Concierge (Epic 5 -- MVP)

- [ ] **CHAT-01**: Floating chat button (bottom-right) opens slide-up chat panel
- [ ] **CHAT-02**: Gemini API integration via Vercel edge function (API key server-side only)
- [ ] **CHAT-03**: System prompt includes data.json assets + itineraries.json + muse_editorials.json + condensed MUSE OCR
- [ ] **CHAT-04**: Chat responses include clickable asset names that trigger openDetail() via deep link
- [ ] **CHAT-05**: MUSE citations formatted in responses ("Featured in MUSE Issue 3" with Heyzine link)
- [ ] **CHAT-06**: Supabase query log stores anonymous session hash, query text, intent classification, assets referenced
- [ ] **CHAT-07**: Privacy notice displayed in chat widget ("Queries are logged anonymously to improve local services")
- [ ] **CHAT-08**: Mobile chat displays as full-screen overlay
- [ ] **CHAT-09**: Chatbot responds within 3 seconds
- [ ] **CHAT-10**: Query input sanitized (strip HTML/script tags) before logging and API submission

### Analytics (Epic 6 -- Growth)

- [ ] **ANLYT-01**: Plausible Analytics script loads on all pages with zero cookie banner
- [ ] **ANLYT-02**: Provider-agnostic analytics module (index-maplibre-analytics.js) wraps all tracking calls
- [ ] **ANLYT-03**: Category filter interactions tracked with category name as property
- [ ] **ANLYT-04**: Marker click and detail panel open tracked with asset name and category
- [ ] **ANLYT-05**: Open Now toggle tracked
- [ ] **ANLYT-06**: Experience/corridor engagement tracked with route name
- [ ] **ANLYT-07**: Events interactions tracked (tab view, event click, date filter change)
- [ ] **ANLYT-08**: Search queries tracked with zero-result flag for demand signals
- [ ] **ANLYT-09**: MUSE editorial card expand tracked with card title
- [ ] **ANLYT-10**: Outbound clicks tracked with UTM parameters (utm_source=gvnc-cultural-map, utm_medium=referral, utm_campaign={context})
- [ ] **ANLYT-11**: Phone click and Google Maps click tracked per venue
- [ ] **ANLYT-12**: Deep link arrivals tracked with param type (?pid, ?muse, ?itinerary)
- [ ] **ANLYT-13**: 500ms dedup throttle prevents event flooding from rapid filter toggling
- [ ] **ANLYT-14**: Shared Plausible dashboard link configured for committee access

### Demand Signal Reporting (Epic 7 -- Growth)

- [ ] **REPT-01**: Monthly report script pulls Plausible data via Stats API
- [ ] **REPT-02**: Monthly report script pulls Supabase chatbot query logs
- [ ] **REPT-03**: Report includes top 10 assets by detail opens and outbound clicks
- [ ] **REPT-04**: Report includes category filter frequency ranking
- [ ] **REPT-05**: Report includes zero-result search queries (demand signal data)
- [ ] **REPT-06**: Report includes chatbot intent distribution (eat/see/do/stay/navigate)
- [ ] **REPT-07**: Report output as markdown convertible to PDF for committee meetings
- [ ] **REPT-08**: Report runnable via GitHub Actions or manual trigger

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Community Engagement

- **COMM-01**: Community event submission form integrated with Arts Council workflow
- **COMM-02**: QR code venue program for physical-to-digital tracking

### Technical Scale

- **TECH-01**: Supabase pgvector RAG upgrade when context stuffing hits limits
- **TECH-02**: Tier 3 event sources (social-only venues via scraping or MOUs)
- **TECH-03**: Google Sheets to JSON CMS pipeline for Arts Council staff authoring
- **TECH-04**: Digital kiosk mode for visitor centers

### Accessibility & Reach

- **ACCSS-01**: Bilingual support (Spanish) via language toggle or mirrored site
- **ACCSS-02**: Offline support via service worker
- **ACCSS-03**: Youth/Gen Z content strategy

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts / authentication | No PII, public read-only site. Disproportionate complexity. |
| Native mobile app | Web-first. Mobile browser experience sufficient for v1. |
| Booking integration | Outbound links + UTM tracking provide 80% of funnel value without infrastructure. |
| User-created itineraries | Author-only for now. Single developer maintains JSON files. |
| Drag-to-reorder itinerary stops | Over-engineering for authored content. |
| Real-time chat / multi-turn memory | Keep chatbot simple. Session-only context. |
| Formal WCAG 2.1 AA certification | Baseline accessibility yes. Formal audit disproportionate for volunteer project. |
| Custom analytics visualizations | Plausible dashboard + markdown reports sufficient. |
| AI-generated narrative summaries | Vision tier. Manual report writing first. |
| Proactive chatbot suggestions | Adds complexity without proven demand. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSGN-01 | Phase 1 | Complete |
| DSGN-02 | Phase 1 | Complete |
| DSGN-03 | Phase 1 | Complete |
| DSGN-04 | Phase 1 | Complete |
| DSGN-05 | Phase 1 | Complete |
| DSGN-06 | Phase 1 | Complete |
| DSGN-07 | Phase 1 | Pending |
| EVNT-01 | Phase 2 | Pending |
| EVNT-02 | Phase 2 | Pending |
| EVNT-03 | Phase 2 | Pending |
| EVNT-04 | Phase 2 | Pending |
| EVNT-05 | Phase 2 | Pending |
| EVNT-06 | Phase 2 | Pending |
| EVNT-07 | Phase 2 | Pending |
| EVNT-08 | Phase 2 | Pending |
| EVNT-09 | Phase 2 | Pending |
| ITIN-01 | Phase 3 | Pending |
| ITIN-02 | Phase 3 | Pending |
| ITIN-03 | Phase 3 | Pending |
| ITIN-04 | Phase 3 | Pending |
| ITIN-05 | Phase 3 | Pending |
| ITIN-06 | Phase 3 | Pending |
| ITIN-07 | Phase 3 | Pending |
| ITIN-08 | Phase 3 | Pending |
| ITIN-09 | Phase 3 | Pending |
| ITIN-10 | Phase 3 | Pending |
| COPY-01 | Phase 4 | Pending |
| COPY-02 | Phase 4 | Pending |
| COPY-03 | Phase 4 | Pending |
| COPY-04 | Phase 4 | Pending |
| COPY-05 | Phase 4 | Pending |
| COPY-06 | Phase 4 | Pending |
| CHAT-01 | Phase 5 | Pending |
| CHAT-02 | Phase 5 | Pending |
| CHAT-03 | Phase 5 | Pending |
| CHAT-04 | Phase 5 | Pending |
| CHAT-05 | Phase 5 | Pending |
| CHAT-06 | Phase 5 | Pending |
| CHAT-07 | Phase 5 | Pending |
| CHAT-08 | Phase 5 | Pending |
| CHAT-09 | Phase 5 | Pending |
| CHAT-10 | Phase 5 | Pending |
| ANLYT-01 | Phase 6 | Pending |
| ANLYT-02 | Phase 6 | Pending |
| ANLYT-03 | Phase 6 | Pending |
| ANLYT-04 | Phase 6 | Pending |
| ANLYT-05 | Phase 6 | Pending |
| ANLYT-06 | Phase 6 | Pending |
| ANLYT-07 | Phase 6 | Pending |
| ANLYT-08 | Phase 6 | Pending |
| ANLYT-09 | Phase 6 | Pending |
| ANLYT-10 | Phase 6 | Pending |
| ANLYT-11 | Phase 6 | Pending |
| ANLYT-12 | Phase 6 | Pending |
| ANLYT-13 | Phase 6 | Pending |
| ANLYT-14 | Phase 6 | Pending |
| REPT-01 | Phase 7 | Pending |
| REPT-02 | Phase 7 | Pending |
| REPT-03 | Phase 7 | Pending |
| REPT-04 | Phase 7 | Pending |
| REPT-05 | Phase 7 | Pending |
| REPT-06 | Phase 7 | Pending |
| REPT-07 | Phase 7 | Pending |
| REPT-08 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 60 total
- Mapped to phases: 60
- Unmapped: 0

---
*Requirements defined: 2026-02-14*
*Last updated: 2026-02-14 after roadmap revision (Tier 2 Events moved to Phase 2, content-first strategy)*
