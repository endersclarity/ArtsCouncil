---
phase: 06-analytics-foundation
plan: 01
subsystem: analytics
tags: [umami, analytics, tracking, utm, privacy-first]

# Dependency graph
requires:
  - phase: 05-ai-concierge
    provides: "Deployed stitch-lab site with all interactive features to instrument"
provides:
  - "CulturalMapAnalytics wrapper module (track + tagOutboundUrl)"
  - "Umami Cloud dashboard with Share URL for committee"
  - "15+ tracked interaction types across 6 modules"
  - "UTM-tagged outbound links for referral attribution"
affects: [07-copy-positioning, future-analytics-expansion]

# Tech tracking
tech-stack:
  added: [umami-cloud, umami-script-js]
  patterns: [provider-agnostic-analytics-wrapper, dedup-throttle, utm-tagging]

key-files:
  created:
    - website/cultural-map-redesign-stitch-lab/index-maplibre-analytics.js
  modified:
    - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html
    - website/cultural-map-redesign-stitch-lab/index-maplibre-bindings.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre-detail-controller.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre-detail-view.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre-explore-controller.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre-experience-controller.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre.js

key-decisions:
  - "Umami Cloud Hobby plan (free, privacy-first, no cookie consent needed)"
  - "Provider-agnostic wrapper so analytics provider can be swapped without touching call sites"
  - "500ms dedup throttle prevents event flooding from rapid toggling"
  - "800ms debounce on search tracking (fires only after user stops typing)"
  - "UTM params: utm_source=exploregvnc, utm_medium=referral for outbound attribution"
  - "No chat tracking — stays in Supabase only per locked Phase 5 decision"
  - "No scroll/hover/pan/zoom tracking — preserves 100k/mo event budget"

patterns-established:
  - "Analytics wrapper: all tracking goes through CulturalMapAnalytics.track(), never call umami.track() directly"
  - "Event naming: kebab-case feature:action pattern (category:filter, detail:open, outbound:website)"
  - "Graceful degradation: if window.umami undefined (ad blocker), all tracking calls no-op silently"
  - "UTM tagging: outbound links get utm_source=exploregvnc via tagOutboundUrl() helper"

# Metrics
duration: 15min
completed: 2026-02-15
---

# Phase 6 Plan 1: Analytics Foundation Summary

**Umami Cloud analytics with provider-agnostic wrapper, 15+ tracked interaction types, UTM-tagged outbound links, and committee-accessible Share URL dashboard**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-02-15
- **Completed:** 2026-02-15
- **Tasks:** 3/3
- **Files modified:** 8

## Accomplishments
- Created CulturalMapAnalytics IIFE module with track() (500ms dedup throttle) and tagOutboundUrl() (UTM injection)
- Instrumented 15+ interaction types across 6 existing modules: category filters, toggles, detail panel, experiences, search, outbound links, deep links, editorial expands
- Umami Cloud account live with website ID 14ecf234-cd96-4e6c-91c2-cc27babc095d, Share URL enabled for committee access
- Custom events (category:filter, toggle:open-now, toggle:events-14d) confirmed appearing in Umami dashboard after Vercel deploy

## Task Commits

Each task was committed atomically:

1. **Task 1: Create analytics wrapper module and wire into HTML** - `4ad4baa` (feat)
2. **Task 2: Instrument all interaction tracking across existing modules** - `9563505` (feat)
3. **Task 3: Create Umami Cloud account and configure dashboard** - completed as human-action checkpoint (Umami account created, website ID wired, deployed, verified)

## Files Created/Modified
- `website/cultural-map-redesign-stitch-lab/index-maplibre-analytics.js` - New IIFE module: CulturalMapAnalytics with track() dedup wrapper and tagOutboundUrl() UTM helper
- `website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html` - Umami script tag in head (website ID + data-domains), analytics module in script load order
- `website/cultural-map-redesign-stitch-lab/index-maplibre-bindings.js` - Tracking: category:filter, category:clear, toggle:open-now, toggle:events-14d, event:click, editorial:expand
- `website/cultural-map-redesign-stitch-lab/index-maplibre-detail-controller.js` - Tracking: detail:open with category/name/city
- `website/cultural-map-redesign-stitch-lab/index-maplibre-detail-view.js` - UTM tagging on outbound links, tracking: outbound:website, outbound:phone, outbound:directions
- `website/cultural-map-redesign-stitch-lab/index-maplibre-explore-controller.js` - Tracking: search:query, search:zero with 800ms debounce
- `website/cultural-map-redesign-stitch-lab/index-maplibre-experience-controller.js` - Tracking: experience:start, experience:tour with slug/title/type
- `website/cultural-map-redesign-stitch-lab/index-maplibre.js` - Tracking: deeplink:arrive with param type and value

## Decisions Made
- **Umami Cloud Hobby plan:** Free tier, privacy-first (no cookies, no consent banner needed), GDPR-compliant by design
- **Website ID:** 14ecf234-cd96-4e6c-91c2-cc27babc095d (data-domains restricts to stitch-lab.vercel.app only)
- **Share URL:** https://cloud.umami.is/share/875bmvTJ7Hd2oLAx — committee can view analytics without Umami account
- **Event taxonomy (15 types):** category:filter, category:clear, toggle:open-now, toggle:events-14d, detail:open, experience:start, experience:tour, event:click, editorial:expand, search:query, search:zero, outbound:website, outbound:phone, outbound:directions, deeplink:arrive
- **No chat tracking:** Chat queries stay in Supabase chat_logs only (locked Phase 5 decision)
- **UTM params:** utm_source=exploregvnc, utm_medium=referral on all outbound links for referral attribution to local businesses

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Umami Cloud account and dashboard configuration were completed as part of Task 3 (human-action checkpoint):
- Account created at umami.is (Hobby plan)
- Site "Explore Nevada County" configured with domain cultural-map-redesign-stitch-lab.vercel.app
- Website ID wired into HTML
- Share URL enabled with Overview, Events, and UTM views
- Deployed to Vercel and verified custom events appearing in dashboard

## Next Phase Readiness
- Analytics foundation is live and collecting data from deployed stitch-lab site
- Committee can access dashboard via Share URL without needing an Umami account
- When canonical site is deployed, update data-website-id and data-domains to match production domain
- Future: can add funnel analysis, conversion goals, or additional event types without changing the wrapper pattern

---
*Phase: 06-analytics-foundation*
*Completed: 2026-02-15*
