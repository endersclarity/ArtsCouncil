# "Happening Now" Feature

## What This Is

A real-time discovery layer for the Nevada County Arts Council cultural map that helps visitors find what's open right now and what events are happening today. Solves "what can I do right now?" for both tourists and locals by surfacing current opportunities across 687 cultural assets.

## Core Value

Enable spontaneous cultural engagement by making it effortless to discover what's open and what's happening at this moment.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Phase 1: "Open Now" Filter**
- [ ] Fetch hours of operation from Google Places API for all 687 assets (one-time)
- [ ] Add hours data (`h`) and place ID (`pid`) fields to data.json
- [ ] Implement client-side hours parsing and open/closed calculation
- [ ] Add "Open Now" filter button to MapLibre map UI
- [ ] Display "Open Now" badge on venue markers when filter is active
- [ ] Show hours of operation in marker popups and detail panel
- [ ] MapLibre GL JS (index-maplibre.html) only — Leaflet version deferred

**Phase 2: "Events Today" Filter**
- [ ] Create events.json data structure (asset → events mapping)
- [ ] Implement daily event fetch via cron job/GitHub Action
- [ ] Add "Events Today" filter button to MapLibre map UI
- [ ] Display event information in marker popups and detail panel
- [ ] Show event count badge on venues with events today

### Out of Scope

- Venue submission form for corrections — deferred to v2, user said "if people don't have it listed correctly on Google Places, we're not going to go out of our way to correct information"
- Real-time hours updates — one-time fetch is sufficient, hours don't change frequently
- Event notifications or alerts
- User accounts or saved favorites
- Mobile app (web-responsive only)

## Context

**Existing Cultural Map:**
- 687 cultural assets across 10 categories (museums, galleries, venues, trails, historic sites)
- Single-page application with data.json (compact format: single-letter keys)
- Dual implementation: Leaflet (simple 2D) and MapLibre GL JS (3D terrain, cinematic camera)
- Deployed to Vercel as static site
- No build system — vanilla HTML/CSS/JS

**Data Strategy:**
- Google Places API key already exists (used in google-tools skill, previously for image scraping)
- Hours fetching: ONE-TIME script run, not daily refresh
- Event fetching: DAILY refresh via automated job
- If data is wrong, venues need to update their own Google Places listings (not our job to manually fix)

**"Happening Now" came from brainstorming session:**
- User selected it as #1 priority from 5 problem spaces
- Aligns with Culture Forward Plan "Activation & Engagement" pillar
- Quick win with high impact for both tourists and locals

## Constraints

- **Tech stack**: Vanilla JS, no build system — maintain single-file HTML architecture
- **MapLibre only**: Build for MapLibre GL JS (index-maplibre.html) only. Leaflet version needs overhaul, skip incremental updates.
- **Google Places API limits**: Free tier has rate limits, need smart caching and one-time fetch strategy
- **Static deployment**: No backend server, all logic client-side except for cron jobs
- **Data size**: Keep data.json compact (currently uses single-letter keys), hours data must not bloat file significantly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MapLibre only, skip Leaflet | User: "leaflet is kind of a mess right now and needs so much of an overhaul there's not much of a point in the incremental upkeep". Focus on flagship version. | — Pending |
| Hours stored in data.json, not separate file | Keeps data loading simple (one fetch), hours rarely change | — Pending |
| One-time hours fetch, not daily refresh | Hours don't change often enough to justify daily API calls and complexity | — Pending |
| Daily event refresh via GitHub Action | Events change frequently, need current data, GitHub Actions are free and reliable | — Pending |
| Client-side hours parsing | No backend available, static site architecture requires client-side logic | — Pending |
| Server-side event fetching | Keeps API keys secret, avoids rate limits, enables daily automation | — Pending |
| Graceful fallback for missing hours | Not all assets have hours (trails, monuments) — no badge if hours unavailable | — Pending |

---
*Last updated: 2026-02-07 after initialization*
