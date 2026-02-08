# Feature Proposals: Nevada County Cultural Map

**Date:** 2026-02-08
**Author:** Feature Strategist (cultural-map-analysis team)
**Context:** Based on gap analysis (Task #1), user stories (Task #2), and content audit (Task #4)

---

## Executive Summary

This document proposes **8 high-value features** to bridge the gap between the current map's strengths (cinematic storytelling, curated experiences) and its critical weakness (real-time discovery). The proposals prioritize the core value of **"spontaneous cultural engagement"** while respecting technical constraints (single HTML file, no backend, static deployment).

**Key insight:** The map currently excels at answering "What cultural story can I experience?" but fails at "What can I visit right now?" These proposals add the discovery layer without undermining the existing narrative strength.

**Prioritization approach:**
- **Quick Wins (LOW complexity, HIGH value):** Features 1-4 — Implement in Phase 1 (2-4 weeks)
- **Long-term Investments (MEDIUM-HIGH complexity, HIGH value):** Features 5-8 — Phase 2+ (2-3 months)

---

## Feature #1: Smart "Open Now" Filter with Category Awareness

### Description
A prominent filter button that dims closed venues while applying intelligent fallback logic for venue types where "open/closed" is meaningless (trails, public art, monuments). Unlike Google Maps' hidden filter, this is always visible in the filter pill row.

### User Value
**Solves Story 1.1, 1.4, 2.2** — Weekend visitors waste time driving to closed venues. Local residents can't find evening entertainment. This single feature transforms the map from "what exists" to "what I can visit right now."

**Expected impact:** 30-40% of mobile users will activate this filter (based on Google Maps usage patterns). Reduces bounce rate for time-sensitive discovery sessions.

### Complexity: LOW
- **Technical approach:**
  - Extend existing category pill UI with new "Open Now" toggle button
  - Client-side `isOpenNow()` function using hours data from `hours.json` (pre-generated via Google Places API cron)
  - On activation: iterate through 685 markers, set opacity to 0.4 for closed venues
  - Graceful failure: venues without hours remain at full opacity (don't hide them)

- **Implementation time:** 3-4 days
  - 1 day: `hours.json` generation script (Python + Google Places API)
  - 1 day: Client-side filter logic + marker opacity toggle
  - 1 day: UI polish + mobile testing
  - 0.5 days: Category-aware placeholder text ("Accessible 24/7" for public art vs "Hours unavailable" for galleries)

### Technical Constraints
- **No real-time API calls:** Hours data must be pre-generated and cached. Static JSON refresh via GitHub Actions cron (daily at 3am).
- **Google Places API quota:** 685 venues × 1 Place Details request/day = 685 requests. Well within free tier (but need API key).
- **Time zone handling:** All venues in PST/PDT. Use browser's `Intl.DateTimeFormat` for client-side current-time calculation.

### Trade-offs
**✅ Pros:**
- High impact for minimal complexity
- Leverages existing marker/tooltip infrastructure
- Validates spontaneous discovery value prop before investing in events or trip planning

**⚠️ Cons:**
- Hours data quality depends on Google (42% of venues lack hours per content audit)
- Requires daily cron job (GitHub Actions setup, monitoring)
- Historic landmarks and trails (45% of venues) won't benefit from filter (but won't break either)

### Risk Mitigation
- **Risk:** Inaccurate hours → user arrives at "open" venue that's closed → trust erosion
  **Mitigation:** Add "Last verified: 2 days ago" indicator. Link to "Suggest an edit" on Google Maps.

- **Risk:** Users filter to "Open Now" and see only 30% of venues, think map is broken
  **Mitigation:** Counter badge showing "248 open right now" next to filter button. Clear visual feedback.

---

## Feature #2: Proximity-Based "Near Me" Filter

### Description
A location-aware filter that sorts venues by distance from user's GPS position and optionally filters to a radius (e.g., "within 5 miles"). Integrates with existing category filters for combined queries like "galleries near me."

### User Value
**Solves Story 1.2, 1.4, 2.4** — Visitors in downtown Grass Valley want walking-distance galleries. Parents want family-friendly venues nearby. Nevada County is 974 sq mi — showing all 685 venues at once is overwhelming.

**Expected impact:** 40-50% of mobile users grant location access (industry standard). Reduces cognitive load by surfacing 10-20 nearby venues instead of 685 countywide.

### Complexity: LOW-MEDIUM
- **Technical approach:**
  - Browser Geolocation API (`navigator.geolocation.getCurrentPosition`)
  - Haversine formula for distance calculation (client-side, no API needed)
  - New "Near Me" pill button (triggers location prompt, then sorts directory list)
  - Optional: Add radius slider (1/5/10 mile) in filter panel
  - Display distance in tooltips ("0.3 mi away") and detail panel

- **Implementation time:** 3-4 days
  - 1 day: Geolocation integration + distance calculations
  - 1 day: UI for "Near Me" pill + distance display
  - 1 day: Mobile UX testing + permission handling
  - 0.5 days: Combine with category filters (e.g., "Open galleries near me")

### Technical Constraints
- **No backend:** All calculations happen client-side. Fast for 685 venues (sort completes in <50ms).
- **Permission friction:** iOS Safari requires HTTPS + user gesture to prompt location. Works fine on Vercel deployment.
- **Accuracy:** GPS accurate to 10-50m in urban areas, 50-500m in rural areas. Good enough for "nearby" use case.

### Trade-offs
**✅ Pros:**
- Universal mobile UX pattern (users expect "near me" on maps)
- Combines cleanly with existing filters (category + open/closed + proximity = powerful multi-dimensional discovery)
- Zero API costs, zero backend

**⚠️ Cons:**
- 40-50% of users will deny location permission (show fallback UI: "Enable location to find nearby venues")
- Rural areas (eastern Nevada County) may have only 2-3 venues within 10 miles (not a rich "near me" experience)
- Distance calculations don't account for road network (straight-line distance, not driving distance)

### Risk Mitigation
- **Risk:** User denies location, sees empty "Near Me" state
  **Mitigation:** Fallback to city-based filtering ("Search by city: Nevada City, Grass Valley, Truckee")

- **Risk:** User is far from any venues (e.g., camping in Tahoe National Forest)
  **Mitigation:** Expand radius automatically ("No venues within 5 miles. Showing venues within 20 miles.")

---

## Feature #3: Deep Linking with URL Params

### Description
Support URL parameters to auto-activate specific assets, experiences, or filter states. Enables direct sharing ("check out this gallery") and external linking (Arts Council can link to specific venues from social media).

### User Value
**Solves Story 1.5, 2.3, 3.3** — Users discover a great trail, want to text the link to a friend. Tour operators embed routes on their business websites. Arts Council promotes individual venues in newsletters.

**Expected impact:** Increases return visits (bookmarking specific venues) and social virality (shareable links with previews).

### Complexity: LOW
- **Technical approach:**
  - Parse URL params on page load: `?asset=north-star-house`, `?experience=gold-rush`, `?filters=galleries,open-now`
  - On `?asset=X`: fly to asset, open detail panel, pulse marker
  - On `?experience=Y`: auto-activate curated experience (dim+highlight, route line, info panel)
  - On `?filters=A,B`: apply category filters and open/closed state
  - Update URL on user actions (filter activation, experience activation) using `history.pushState` (no page reload)

- **Implementation time:** 2-3 days
  - 1 day: URL param parsing + routing logic
  - 1 day: Update URL on user actions (bidirectional sync)
  - 0.5 days: Open Graph meta tags for rich link previews (title, description, image)

### Technical Constraints
- **Single HTML file:** URL params must route to the same HTML file (no `/asset/123` paths). Use query params only.
- **State management:** Avoid URL getting too complex (max 1-2 params: `?asset=X&experience=Y`, not 10 params).

### Trade-offs
**✅ Pros:**
- Zero complexity increase (just parsing and routing logic)
- Unlocks social sharing and external linking
- Improves SEO (each asset/experience gets a unique URL for search engines)

**⚠️ Cons:**
- URL bar clutter (long URLs like `?asset=north-star-house&filters=galleries,museums&zoom=14`)
- Need to handle invalid params gracefully (`?asset=typo-name` → fallback to default view)

### Risk Mitigation
- **Risk:** User shares URL with stale filter state, confuses recipient
  **Mitigation:** Only persist "intentional" params (asset, experience), not ephemeral state (pan/zoom, scroll position)

- **Risk:** SEO dilution (hundreds of `?asset=X` URLs indexed by Google)
  **Mitigation:** Add canonical URL tag pointing to homepage. Use `?asset` for UX, not SEO.

---

## Feature #4: Basic Search with Autocomplete

### Description
A search input (top-right toolbar) with fuzzy matching and autocomplete suggestions. Searches across venue names, categories, and cities. On selection, flies to venue and opens detail panel.

### User Value
**Solves Story 1.5, 2.1** — Visitors heard about "The Center for the Arts" but can't find it among 685 venues. Locals want to quickly jump to a specific venue without scanning the map.

**Expected impact:** 10-15% of users will use search (minority feature, but critical for power users and mobile where browsing is harder).

### Complexity: LOW-MEDIUM
- **Technical approach:**
  - Client-side search using Fuse.js (lightweight fuzzy-search library, 12KB gzipped)
  - Index venue names, categories, cities, and keywords from descriptions
  - Autocomplete dropdown appears after 2 characters typed
  - On selection: `map.flyTo(venue.coordinates, zoom: 16)` + pulse marker + open detail panel
  - Search history in localStorage (last 5 searches) for quick re-access

- **Implementation time:** 3-4 days
  - 1 day: Fuse.js integration + search index setup
  - 1 day: Autocomplete UI + keyboard navigation (Arrow keys, Enter to select)
  - 1 day: Mobile UX (full-width search input, slide-in animation)
  - 0.5 days: Search history + recent searches UI

### Technical Constraints
- **No backend:** All search happens client-side. Fuse.js is fast for 685 venues (<10ms response time).
- **Bundle size:** Fuse.js adds 12KB gzipped. Acceptable for search UX benefit.

### Trade-offs
**✅ Pros:**
- Essential UX pattern (users expect search on data-heavy sites)
- Works well on mobile (typing is easier than panning/zooming)
- Complements filters (filters = browsing, search = goal-oriented)

**⚠️ Cons:**
- Adds JS bundle size (12KB = ~2-3% increase)
- Requires design work (search UI, autocomplete dropdown, empty states)
- Power users will discover limitations (can't search by "open now", only by name/category)

### Risk Mitigation
- **Risk:** Users search for phrases not in the data ("art classes", "live music tonight")
  **Mitigation:** Show "no results" state with suggestions: "Try searching by venue name or category"

- **Risk:** Search autocomplete covers map on mobile
  **Mitigation:** Slide search results from top, dim map background slightly (focus on search)

---

## Feature #5: Events Layer with "Happening Today" Filter

### Description
Integrate event data (performances, gallery openings, workshops, festivals) as a separate data layer. Add "Events Today" filter pill that shows only venues with events scheduled for today. Event cards appear in the detail panel below venue info.

### User Value
**Solves Story 1.4, 2.2, 3.2** — Local residents want to know "what's happening this weekend." Weekend visitors want live music tonight. Tour operators need to check if stops on their route have special events.

**Expected impact:** High user demand (qualitative feedback from Arts Council: "Where are the events?"). Differentiates map from static listings (Google Maps has events, but not map-integrated).

### Complexity: MEDIUM-HIGH
- **Technical approach:**
  - **Phase 1:** Manual curation via `events.json` (Arts Council staff add events monthly)
  - **Phase 2:** Automated scraping of Trumba RSS/iCal feeds (Nevada County venues use Trumba)
  - **Phase 3:** Eventbrite API integration (requires API key, rate limits)
  - Event schema: `{ venue_id, title, start_datetime, end_datetime, description, ticket_url }`
  - Client-side time filtering: show events where `start <= now <= end` (happening now) or `start_date == today` (happening today)
  - New "Events Today" pill + event count badge ("12 events today")
  - Detail panel shows event cards: title, time, "Get Tickets" CTA

- **Implementation time:** 8-10 days
  - 2 days: Event data schema + `events.json` structure
  - 2 days: Trumba RSS parser (Python script, GitHub Actions cron)
  - 2 days: Client-side event filtering + UI (pill, cards, badges)
  - 2 days: Mobile UX + event detail modal
  - 2 days: Testing + edge cases (multi-day events, all-day events, recurring events)

### Technical Constraints
- **No backend:** Events must be pre-fetched and cached in static JSON (like hours). GitHub Actions cron runs daily.
- **Data freshness:** Events change more frequently than hours (new events added, canceled, rescheduled). Daily refresh may not be enough for last-minute changes.
- **Event data sourcing:** Not all 685 venues publish events. Focus on categories where events are common (performance spaces, galleries, festivals). Accept 80/20 coverage.

### Trade-offs
**✅ Pros:**
- High user value (turns map into "what's happening" discovery tool, not just "what exists")
- Differentiates from Google Maps (Google's event integration is weak/buried)
- Supports Arts Council's mission (promote cultural programming, not just venues)

**⚠️ Cons:**
- High maintenance burden (events change daily, need monitoring and moderation)
- Data sourcing is hard (Trumba scraping is brittle, Eventbrite API has rate limits, manual curation doesn't scale)
- Scope creep risk (events → ticketing → bookings → anti-feature territory)

### Risk Mitigation
- **Risk:** Event data goes stale (canceled event still shown)
  **Mitigation:** Show "Last updated: today at 3am" on Events filter. Link to venue website for latest info.

- **Risk:** Users expect to book tickets from the map
  **Mitigation:** Event cards link to external ticketing (Eventbrite, venue website). Map is discovery, not booking.

- **Risk:** Trumba scraping breaks (RSS feed format changes)
  **Mitigation:** Fallback to manual curation. Arts Council submits events via Google Form → weekly CSV import.

---

## Feature #6: User Favorites with "My Day" Trip Planner

### Description
Allow users to bookmark venues into a "My Day" list (stored in localStorage). List shows saved venues with open/closed status, distance from current location, and estimated visit duration. Users can reorder stops and export as a custom route.

### User Value
**Solves Story 1.4, 2.3, 3.1** — Visitors plan a multi-venue day trip. Tour operators build custom routes for clients. Local residents curate "my favorite spots" lists to share with friends.

**Expected impact:** 15-20% of users will save at least one venue (engagement metric). Increases return visits (users come back to check their saved list).

### Complexity: MEDIUM
- **Technical approach:**
  - "Save to My Day" button in detail panel (heart icon, toggles on/off)
  - Favorites stored in `localStorage` (persists until browser cache cleared)
  - "My Day" panel (slide-in from right, shows list of saved venues)
  - For each saved venue: name, category, open/closed status, distance from user, "Remove" button
  - Reorder via drag-and-drop (touch-friendly on mobile)
  - "Export as Route" button → generates route line connecting stops in order (like curated experiences)
  - Optional: "Share My Day" → generates shareable URL with `?myDay=venue1,venue2,venue3`

- **Implementation time:** 5-6 days
  - 1 day: localStorage persistence + save/remove logic
  - 2 days: "My Day" panel UI + list rendering
  - 1 day: Drag-and-drop reordering (use SortableJS library, 15KB gzipped)
  - 1 day: Route generation (draw line between stops, like experiences)
  - 1 day: Mobile UX testing + share URL

### Technical Constraints
- **localStorage limits:** 5-10MB per domain. Storing 20 venues = ~10KB. No limit concerns.
- **No sync across devices:** Favorites tied to single browser/device. User clears cache → favorites lost. (Could upgrade to account-based sync in future, but requires backend.)

### Trade-offs
**✅ Pros:**
- Increases engagement (users return to check saved list)
- Enables trip planning without external tools (users don't need Google Maps "Saved Places")
- Minimal complexity (localStorage is simple, no auth required)

**⚠️ Cons:**
- Lost on cache clear (user frustration)
- No sync across devices (user bookmarks on phone, expects to see on desktop)
- Reordering UX is complex on mobile (drag-and-drop with touch can be finicky)

### Risk Mitigation
- **Risk:** User saves 10 venues, clears cache, loses favorites → frustration
  **Mitigation:** Add "Export favorites as URL" (encode venue IDs in shareable link, user can bookmark that)

- **Risk:** User expects trip planner to calculate optimal route (traveling salesman problem)
  **Mitigation:** Don't optimize. Just connect stops in user's chosen order. Add note: "Reorder stops to plan your route."

---

## Feature #7: Accessibility Metadata with Filters

### Description
Add structured accessibility fields to venue data: wheelchair access (yes/no/partial), parking info, sensory environment (noise level, lighting), accessible restrooms. Add "Accessible Venues" and "Sensory-Friendly" filter pills. Detail panel shows accessibility section with icons and text.

### User Value
**Solves Story 5.1, 5.2, 5.4** — Wheelchair users avoid venues with stairs. Parents of autistic children find low-stimulation venues. Visitors with mobility needs plan trips confidently.

**Expected impact:** High social value (inclusion), moderate usage (10-15% of users filter by accessibility). Positions map as best-in-class for accessible tourism (most cultural maps ignore this entirely).

### Complexity: MEDIUM-HIGH
- **Technical approach:**
  - Extend venue data schema: `{ accessible_entrance, accessible_parking, accessible_restroom, noise_level, lighting, sensory_friendly }`
  - Data collection: Google Places API `wheelchair_accessible_entrance` field + manual survey (Arts Council contacts venues)
  - New filter pills: "Accessible Venues" (requires all 3 accessibility fields = true), "Sensory-Friendly" (noise ≤ moderate, quiet spaces available)
  - Detail panel: collapsible "Accessibility" section with icons (wheelchair, parking, restroom, ear icon for noise, lightbulb for lighting)
  - Mobile: Accessibility section collapsed by default, expands on tap

- **Implementation time:** 7-10 days (data collection is the blocker)
  - 3-4 days: Data collection (Google Places API + manual survey of 100-200 priority venues)
  - 2 days: Schema extension + data pipeline (add fields to `data.json`)
  - 2 days: UI for filters + detail panel accessibility section
  - 1 day: Mobile UX + icons
  - 1 day: User reporting feature ("Report accessibility issue" button per Story 5.3)

### Technical Constraints
- **Data collection bottleneck:** Google Places API only provides `wheelchair_accessible_entrance` (boolean). Parking, restrooms, sensory environment require manual input.
- **Incomplete data:** Not all 685 venues will respond to accessibility survey. Accept 30-40% coverage initially, grow over time.

### Trade-offs
**✅ Pros:**
- High social impact (makes map usable for users with disabilities)
- Differentiates from Google Maps (Google has minimal accessibility data, no sensory environment info)
- Low technical complexity once data is collected

**⚠️ Cons:**
- High data collection cost (manual survey of venues)
- Incomplete data creates "accessibility filter shows only 150 venues" problem (users may think other venues are inaccessible when they're just unknown)
- Maintenance burden (venues renovate, accessibility changes)

### Risk Mitigation
- **Risk:** Incomplete data creates false negatives ("Accessible" filter hides venues that are accessible but lack data)
  **Mitigation:** Separate "Unknown" state. Venues without data show "Accessibility info not available" (don't exclude them from filter results)

- **Risk:** User reports incorrect accessibility info (e.g., says venue is accessible when it's not)
  **Mitigation:** Moderation queue for user-submitted reports. Arts Council reviews before updating venue data.

---

## Feature #8: Data Export for Researchers

### Description
Add "Download Data" button that exports all venue data (or filtered subset) as GeoJSON, CSV, or KML. Includes full attribute table, metadata, provenance, and citation guidance. Enables academic research, GIS analysis, and third-party integrations.

### User Value
**Solves Story 6.2, 6.5** — Researchers export data for spatial analysis in QGIS. Historians analyze cultural heritage patterns. Developers integrate Nevada County venues into regional tourism apps.

**Expected impact:** Low usage (5-10 downloads/month), but high strategic value. Open data aligns with Arts Council's mission (public resource). Builds goodwill with academic community.

### Complexity: LOW-MEDIUM
- **Technical approach:**
  - "Download Data" button in top toolbar (icon: download arrow)
  - Modal with export options: format (GeoJSON/CSV/KML), scope (all venues or current filter), fields (all or selected)
  - Client-side data generation using `data.json` (no server-side processing)
  - GeoJSON: native format (just serialize filtered `data.json`)
  - CSV: flatten GeoJSON properties + lat/lng columns
  - KML: convert GeoJSON to KML XML (use `tokml` library, 5KB)
  - Include metadata: last updated date, source attribution, Creative Commons license (CC BY 4.0), citation formats (APA, MLA)
  - Auto-generate filename: `nevada-county-cultural-venues-2026-02-08.geojson`

- **Implementation time:** 3-4 days
  - 1 day: Export modal UI + format selection
  - 1 day: GeoJSON/CSV export logic
  - 1 day: KML export (using `tokml` library)
  - 0.5 days: Metadata + citation templates

### Technical Constraints
- **Client-side generation:** All export happens in browser (no server). Fast for 685 venues (<500ms).
- **File size:** GeoJSON export = ~400KB (compressed). CSV = ~300KB. KML = ~500KB. All within browser download limits.

### Trade-offs
**✅ Pros:**
- Zero complexity (just data serialization)
- High strategic value (open data, academic partnerships)
- Enables third-party innovation (developers can build on top of Nevada County data)

**⚠️ Cons:**
- Low usage (minority feature for researchers)
- Data exports can go stale (user downloads in Feb 2026, uses in June 2026 when venues have changed)
- Potential for misuse (commercial reuse, derivative works without attribution)

### Risk Mitigation
- **Risk:** Users export data and don't attribute Arts Council
  **Mitigation:** Embed attribution in exported file (CSV includes "Source: Nevada County Arts Council" column, GeoJSON has metadata property)

- **Risk:** Exported data goes stale, user doesn't realize
  **Mitigation:** Include "Last updated: 2026-02-08" in filename and metadata. Add disclaimer: "Data subject to change. Check [website] for latest."

---

## Prioritization Summary

### Quick Wins (Implement First)

| Feature | Value | Complexity | Implementation Time | Why Now? |
|---------|-------|------------|---------------------|----------|
| #1: Smart "Open Now" Filter | HIGH | LOW | 3-4 days | Core gap. Validates spontaneous discovery value prop. Blocks Phase 1 launch. |
| #2: "Near Me" Proximity Filter | HIGH | LOW-MEDIUM | 3-4 days | Universal mobile pattern. Reduces cognitive load (685 → 20 venues). Works with "Open Now" for powerful combo. |
| #3: Deep Linking with URL Params | MEDIUM-HIGH | LOW | 2-3 days | Unlocks sharing and external linking. Low complexity. High strategic value. |
| #4: Search with Autocomplete | MEDIUM | LOW-MEDIUM | 3-4 days | Essential for power users and mobile. Complements filters. Low complexity. |

**Total Quick Wins time:** 11-15 days (2-3 weeks)

### Long-term Investments (Phase 2+)

| Feature | Value | Complexity | Implementation Time | Why Defer? |
|---------|-------|------------|---------------------|------------|
| #5: Events Layer | HIGH | MEDIUM-HIGH | 8-10 days | High maintenance burden. Requires event data source decision. Validate "Open Now" first. |
| #6: "My Day" Trip Planner | MEDIUM-HIGH | MEDIUM | 5-6 days | Engagement feature. Not critical for launch. Benefits from "Open Now" + "Near Me" being live first. |
| #7: Accessibility Filters | MEDIUM | MEDIUM-HIGH | 7-10 days | Data collection bottleneck (manual survey). High social value, but requires Arts Council coordination. |
| #8: Data Export for Researchers | LOW | LOW-MEDIUM | 3-4 days | Low usage. Strategic value. Can add anytime (not time-sensitive). |

**Total Long-term time:** 23-30 days (4-6 weeks)

---

## Feature Interactions and Dependencies

### Positive Synergies

1. **"Open Now" + "Near Me" + Category Filters** = Powerful multi-dimensional discovery
   Example: "Show open galleries within 5 miles" — this is the killer UX for spontaneous discovery.

2. **Deep Linking + Curated Experiences** = Shareable themed routes
   Example: Arts Council tweets link to Gold Rush Heritage Trail, users click and see auto-activated experience.

3. **"My Day" + "Open Now"** = Real-time trip planning
   Example: User saves 5 venues, "My Day" panel shows which ones are currently open, reorder to visit open ones first.

4. **Events Layer + "Near Me"** = Hyperlocal "what's happening"
   Example: User in downtown Nevada City sees "2 events within 1 mile tonight."

### Potential Conflicts

1. **Too many filters → UI clutter**
   - Current: 10 category pills
   - Add: "Open Now", "Near Me", "Events Today", "Accessible Venues", "Sensory-Friendly" = 15 buttons
   - **Mitigation:** Collapse less-used filters into "More Filters" dropdown on mobile. Desktop can show all.

2. **"Open Now" + Events → Confusing definition of "open"**
   - Is a theater "open" if it has a show tonight (8pm) but ticket office is closed (5pm)?
   - **Mitigation:** Separate "Venues Open Now" and "Events Happening Today" as distinct concepts (separate pills, not combined).

3. **"My Day" + Curated Experiences → Competing paradigms**
   - User-generated route (My Day) vs editorial route (Gold Rush Trail) serve similar goals.
   - **Mitigation:** Position "My Day" as trip planner, curated experiences as discovery tool. Different use cases.

---

## Recommendations for Phase 1 Roadmap

### Must Have (Block Launch)
1. **Smart "Open Now" Filter** — Core value prop. Without this, map is static listing.

### Should Have (Launch with)
2. **"Near Me" Proximity Filter** — Universal mobile pattern. Expected by users.
3. **Deep Linking** — Unlocks sharing and promotion. Low complexity.

### Could Have (Polish)
4. **Search with Autocomplete** — Nice-to-have. Power users will miss it, but not launch-blocking.

### Won't Have (Phase 2+)
5-8. **Events, My Day, Accessibility, Data Export** — Defer to validate core discovery value prop first.

### Validation Metrics for Phase 1
After launching Quick Wins (#1-4), measure:
- **"Open Now" filter usage:** Target >30% of mobile users
- **"Near Me" permission grant rate:** Target >40%
- **Deep link shares:** Track URL param usage (how many users land on `?asset=X`)
- **Search usage:** Target >10% of sessions
- **Bounce rate:** Compare filtered vs unfiltered sessions (expect 20-30% reduction)

**Trigger for Phase 2:** If "Open Now" usage >30% AND user feedback requests events → prioritize Feature #5 (Events Layer) next.

---

## Trade-offs and Constraints

### Technical Constraints Summary

| Constraint | Impact | Workarounds |
|------------|--------|-------------|
| **Single HTML file, no backend** | All features must be client-side or pre-generated static data | GitHub Actions cron for daily data refresh (hours, events) |
| **Static site deployment (Vercel)** | Can't do real-time API calls from browser (CORS, API key exposure) | Pre-fetch data server-side, serve as static JSON |
| **No user authentication** | Can't sync favorites across devices, no personalized recommendations | Use localStorage for device-local state, offer URL export for sharing |
| **Google Places API rate limits** | 685 venues × 1 request/day = close to free tier limit | Cache aggressively, only refresh hours data daily (not per page load) |
| **Maintenance burden** | Arts Council staff are volunteers, limited capacity | Automate where possible (GitHub Actions), design for graceful degradation (missing data doesn't break UI) |

### Design Principles for Feature Selection

1. **Spontaneous discovery > comprehensive information**
   Prioritize "what can I visit now?" over "tell me everything about this venue." The map is a discovery layer, not a venue encyclopedia.

2. **Progressive enhancement > feature parity**
   Match Google Maps on table stakes ("Open Now"), then differentiate with cultural-specific features (curated experiences, accessibility). Don't try to beat Google at everything.

3. **Graceful degradation > perfect data**
   Accept that 42% of venues lack hours, not all events will be captured. Design UI to handle missing data without breaking.

4. **Low-touch maintenance > high-touch moderation**
   Avoid features requiring daily human intervention (user-submitted content, manual event entry). Automate or defer.

5. **Mobile-first > desktop-first**
   70%+ of spontaneous discovery happens on mobile. Design filters, panels, and interactions for thumb-friendly touch targets (44px minimum).

---

## Next Steps

1. **Validate priorities with team lead** — Confirm Quick Wins (#1-4) align with Phase 1 roadmap
2. **Technical feasibility check** — Test Google Places API rate limits, localStorage size, Fuse.js bundle size
3. **Create detailed implementation plan** — Break Quick Wins into tasks, assign effort estimates
4. **User testing (optional)** — Show wireframes of "Open Now" filter to 3-5 users, validate mental model
5. **Coordinate with Arts Council** — Confirm daily cron job setup, API key provisioning, event data source

---

**Document Complete**
**Status:** Ready for review by team lead
**Next Task:** Integrate into Phase 1 roadmap (Task #5)
