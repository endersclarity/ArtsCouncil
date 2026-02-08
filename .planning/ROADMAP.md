# Roadmap: "Happening Now" Feature

## Overview

This roadmap delivers real-time discovery capabilities to the Nevada County Arts Council cultural map. Over four phases, we'll build a data pipeline that fetches hours of operation from Google Places API, implement client-side logic to calculate open/closed status, integrate "Open Now" filtering into the MapLibre map UI, and harden the system for production with error handling and performance optimization. The result: visitors can effortlessly find what's open right now across 687 cultural assets.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Data Pipeline Setup** - Fetch and store hours data with API security and automation
- [ ] **Phase 2: Hours Logic Implementation** - Client-side open/closed calculation with timezone awareness
- [ ] **Phase 3: Map UI Integration** - "Open Now" filter and hours display in MapLibre interface
- [ ] **Phase 4: Production Hardening** - Shared modules, error handling, caching compliance, performance

## Phase Details

### Phase 1: Data Pipeline Setup
**Goal**: Hours of operation data is fetched, stored, and automatically refreshed with secure API access

**Depends on**: Nothing (first phase)

**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05

**Success Criteria** (what must be TRUE):
  1. Script successfully fetches hours data from Google Places API for all 687 assets
  2. Hours data (`h` field) and place IDs (`pid` field) are stored in data.json in compact format
  3. GitHub Actions workflow runs automatically to refresh data on schedule
  4. API keys are secured via GitHub Secrets and HTTP referrer restrictions
  5. Rate limiting is handled gracefully with delays and exponential backoff

**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Create fetch-hours.py script with API integration and rate limiting
- [ ] 01-02-PLAN.md — Run script to populate data.json and set up GitHub Actions workflow

### Phase 2: Hours Logic Implementation
**Goal**: Client-side logic accurately determines if a venue is open right now

**Depends on**: Phase 1 (needs hours data in data.json)

**Requirements**: HOURS-01, HOURS-02, HOURS-03, HOURS-04

**Success Criteria** (what must be TRUE):
  1. Hours parsing works correctly using Luxon library with Pacific timezone
  2. Open/closed status is calculated accurately based on current time
  3. Edge cases work correctly (24-hour venues, irregular hours, missing data, holidays)
  4. Venues without hours data fail gracefully (no badge displayed, no errors logged)

**Plans**: TBD

Plans:
- [ ] 02-01: TBD during planning

### Phase 3: Map UI Integration
**Goal**: Users can filter the map to show only open venues and see hours in venue details

**Depends on**: Phase 2 (needs hours calculation logic)

**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06

**Success Criteria** (what must be TRUE):
  1. "Open Now" filter toggle button appears in map controls and works correctly
  2. Open venues display visual badge when filter is active
  3. Map filters GeoJSON layer to show only open venues when toggle is enabled
  4. Hours of operation display in marker popups when user clicks a venue
  5. Hours of operation display in detail panel (sidebar) when venue is selected
  6. Hours display is mobile-responsive with compact format on small screens

**Plans**: TBD

Plans:
- [ ] 03-01: TBD during planning

### Phase 4: Production Hardening
**Goal**: System is production-ready with maintainable code, robust error handling, and optimal performance

**Depends on**: Phase 3 (all features working before optimization)

**Requirements**: CODE-01, CODE-02, CODE-03, CODE-04

**Success Criteria** (what must be TRUE):
  1. Shared hours parsing logic is extracted into reusable module (prevents code duplication)
  2. Error handling covers API failures, malformed data, timezone issues without crashing
  3. Google Places API caching compliance is implemented (30-day TTL, no permanent storage)
  4. Mobile performance is optimized (marker clustering if needed, tested on 3G)

**Plans**: TBD

Plans:
- [ ] 04-01: TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Pipeline Setup | 0/2 | Not started | - |
| 2. Hours Logic Implementation | 0/TBD | Not started | - |
| 3. Map UI Integration | 0/TBD | Not started | - |
| 4. Production Hardening | 0/TBD | Not started | - |
