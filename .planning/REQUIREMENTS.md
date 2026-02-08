# Requirements: "Happening Now" Feature

**Defined:** 2026-02-07
**Core Value:** Enable spontaneous cultural engagement by making it effortless to discover what's open and what's happening at this moment

## v1 Requirements

### Data Pipeline
- [ ] **DATA-01**: Fetch hours of operation from Google Places API for all 687 assets (one-time script)
- [ ] **DATA-02**: Store hours data in data.json with compact format (`h` field for hours string, `pid` field for place ID)
- [ ] **DATA-03**: Set up GitHub Actions workflow for future data updates
- [ ] **DATA-04**: Implement API key security (GitHub Secrets, HTTP referrer restrictions)
- [ ] **DATA-05**: Handle API rate limits (150ms delays, exponential backoff, viewport-based fetching)

### Hours Logic
- [ ] **HOURS-01**: Implement client-side hours parsing using Luxon library
- [ ] **HOURS-02**: Calculate open/closed status based on current time and Pacific timezone
- [ ] **HOURS-03**: Handle edge cases (24-hour venues, irregular hours, missing data, holidays)
- [ ] **HOURS-04**: Graceful failure for venues without hours data (no badge, no error)

### UI - MapLibre Version
- [ ] **UI-01**: Add "Open Now" filter toggle button to map controls
- [ ] **UI-02**: Display "Open Now" badge on markers when filter is active (circle layer styling)
- [ ] **UI-03**: Filter GeoJSON layer to show only open venues when toggle is enabled
- [ ] **UI-04**: Show hours of operation in marker popups
- [ ] **UI-05**: Show hours of operation in detail panel (sidebar)
- [ ] **UI-06**: Mobile-responsive hours display (compact format on small screens)

### Code Quality
- [ ] **CODE-01**: Extract shared hours parsing logic into reusable module
- [ ] **CODE-02**: Add error handling for API failures, malformed data, timezone issues
- [ ] **CODE-03**: Implement API caching compliance (30-day TTL for Google Places data)
- [ ] **CODE-04**: Add mobile performance optimization (marker clustering if needed)

## v2 Requirements

### Event Data Pipeline
- **EVENT-01**: Research event sourcing strategy (Eventbrite API vs Google Calendar vs manual curation)
- **EVENT-02**: Implement daily event fetch via GitHub Actions cron job
- **EVENT-03**: Create events.json data structure (asset → events mapping)
- **EVENT-04**: Automatic event expiry (filter out past events)
- **EVENT-05**: Event deduplication strategy (if using multiple sources)

### Event UI
- **EVENT-06**: Add "Events Today" filter toggle button
- **EVENT-07**: Display event count badge on venues with events
- **EVENT-08**: Show event cards in detail panel (title, date, time, link)
- **EVENT-09**: Sort events by start time (starting soon first)
- **EVENT-10**: Mobile-responsive event display

## Out of Scope

| Feature | Reason |
|---------|--------|
| Leaflet version (index.html) | User: "let's hold off on leaflet, it's kind of a mess right now and needs so much of an overhaul there's not much of a point in the incremental upkeep". MapLibre (index-maplibre.html) is the flagship version. |
| Venue submission form for corrections | Deferred to v2+. User stated "if people don't have it listed correctly on Google Places, we're not going to go out of our way to correct information" |
| Real-time hours updates | One-time fetch is sufficient. Hours don't change frequently enough to justify daily API calls |
| Event notifications or alerts | Not part of spontaneous discovery use case. Adds complexity without clear user value |
| User accounts or saved favorites | Static site architecture, adds complexity |
| Mobile app (native iOS/Android) | Web-responsive only. Mobile app out of scope |
| Multi-source event aggregation | Deferred to v3+ (Phase 3 per research). High complexity, marginal value. Only pursue if Phase 2 shows insufficient coverage |
| Social features (check-ins, reviews) | Out of scope per brainstorming session. May revisit in future |

## Traceability

Mapping will be populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (empty until roadmap created) | | |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: (pending roadmap)
- Unmapped: (pending roadmap)

---
*Requirements defined: 2026-02-07*
*Last updated: 2026-02-07 after initial definition*
