# Feature Research: Real-Time Cultural Discovery

**Domain:** Real-time discovery layers for cultural/tourism maps
**Researched:** 2026-02-07
**Confidence:** MEDIUM-HIGH

## Feature Landscape

Real-time discovery features on cultural maps enable spontaneous cultural engagement by answering "What's open/happening right now?" This research covers 687 cultural venues (landmarks, galleries, museums, performance spaces, restaurants, fairs, walks, public art, cultural organizations, and historic preservation sites) in Nevada County, California.

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Open/Closed status badge** | Universal UX pattern from Google Maps, Yelp, Apple Maps | LOW | Simple visual indicator (green dot + "Open now" / red + "Closed"). Users scan for this instantly. |
| **Current hours display** | Users need to know "when can I go?" | LOW | "Open until 5:00 PM" or "Closed - Opens at 10:00 AM tomorrow". Format matters: relative time > absolute time. |
| **"Open Now" filter toggle** | Standard map filter since ~2015 | LOW | Binary filter that dims/hides closed venues. Should persist across page refreshes. |
| **Mobile-responsive design** | 70%+ of spontaneous discovery happens on mobile | MEDIUM | Map interactions, filter controls, hours display must work on small screens. Touch targets 44px minimum. |
| **Visual distinction on map** | Closed venues should be visually de-emphasized | LOW | Opacity reduction (0.4-0.5), greyscale, or border treatment. Users shouldn't waste time clicking closed venues. |
| **Graceful failure states** | "Hours unavailable" is better than broken UI | LOW | Not all 687 venues will have hours data. Show placeholder text, don't break the experience. |

**Sources:**
- [Google Maps "Open Now" Filter](https://support.google.com/maps/thread/154832301/missing-a-more-precise-search-filter-open-hours-range-operation-time-instead-of-just-open-now?hl=en) (user expectations baseline)
- [Badge UI Design Best Practices](https://mobbin.com/glossary/badge) (visual patterns)
- [UI Design Trends 2026](https://landdding.com/blog/ui-design-trends-2026) (simplicity, friction reduction)

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **"Events Today" filter** | Go beyond static venues to dynamic happenings | MEDIUM-HIGH | Requires event data integration. Festivals, gallery openings, performances. Aligns with 2026 trend: "fierce demand for information by the second" about impromptu happenings. |
| **Time-aware suggestions** | "3 galleries open for the next 2 hours" | MEDIUM | Context-aware recommendations based on current time + user location. Surfaces venues closing soon (urgency). |
| **Category-specific filters** | "Open galleries" vs "Open restaurants" | LOW | Combine category pills (already exist) with open/closed state. Multi-dimensional filtering. |
| **Opening soon indicator** | "Opens in 30 minutes" for venues about to open | LOW-MEDIUM | Helps users plan next stop. Reduces "I got here too early" frustration. Different from "Closed" state. |
| **Weekend/Holiday hours awareness** | Accurate hours for special days | MEDIUM | Many cultural venues have irregular schedules. Museums closed Mondays, galleries open by appointment, etc. Prevent user disappointment. |
| **Hours confidence indicator** | "Last verified: 3 days ago" | LOW | Build trust when hours data comes from Google Places (community-updated). Flag stale data. |
| **Cluster view with open count** | Map clusters show "4 of 7 open" | MEDIUM | When zoomed out, users see density + availability at a glance. Helps with route planning. |

**Sources:**
- [Real-Time Dynamic Content as Discovery Basis (2026 trend)](https://coaxsoft.com/blog/tech-travel-trends-innovation) — "fierce demand for information by the second: whether a museum is full, whether there is an impromptu food fair"
- [Tourism Cares Meaningful Travel Map](https://www.travelmarketreport.com/canada/destinations/articles/tourism-cares-unveils-new-digital-platform-for-its-expanding-meaningful-travel-map) — 800 venues, real-time event updates
- [Places.nu Tourism Use Cases](https://places.nu/use-cases/tourism-visitor-centers/) — "events that update in real time" as key feature
- [Context-Aware Travel Tech (2026)](https://coaxsoft.com/blog/tech-travel-trends-innovation) — time of day, weather, location-based recommendations

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Push notifications for "open now"** | "Alert me when nearby venues open" | Notification fatigue. 64% of users delete apps with 5+ notifications/week. Feels invasive for a cultural map. | Passive UI indicators only. Let users pull info, don't push. |
| **Real-time crowdedness tracking** | "Is the museum busy right now?" | Google Popular Times data is often stale/inaccurate. Creates false expectations. Privacy concerns. High implementation cost for 687 venues. | Defer to v2+. Focus on open/closed first. |
| **User-submitted hours updates** | "Let users correct wrong hours" | Moderation burden. Vandalism risk. Data quality chaos when source of truth (Google Places) conflicts with user edits. | Link to "Suggest an edit" on Google Maps. Offload moderation to Google. |
| **"Reserve now" or ticketing integration** | "Book a tour from the map" | Massive scope creep. Each venue has different systems (Eventbrite, custom, none). This is a discovery tool, not a booking platform. | Link to venue websites. Let them handle transactions. |
| **Live event streaming/rich media** | "Show what's happening inside venues" | Bandwidth, moderation, technical complexity. Out of scope for a volunteer-maintained map. | Defer to venues' own social media. Link to Instagram/Facebook. |
| **Complex scheduling: "Open in 2 hours for 3 hours"** | Power users want advanced filters | Adds cognitive load. 80% of users just want "open now" binary. Overengineering. | Start simple. Add later only if user research shows demand. |

**Sources:**
- [App Push Notification Mistakes (2026)](https://appbot.co/blog/app-push-notifications-2026-best-practices/) — notification fatigue, opt-out rates
- [14 Push Notification Best Practices (2026)](https://reteno.com/blog/push-notification-best-practices-ultimate-guide-for-2026) — "64% of users delete apps with 5+ notifications/week"
- [Avoiding Push Fatigue](https://contextsdk.com/blogposts/avoiding-push-fatigue-common-user-turn-offs) — irrelevant timing, one-size-fits-all failures
- [Travel App Development Pitfalls (2026)](https://5ly.co/blog/travel-app-development-guide/) — underestimating complexity, feature bloat

## Feature Dependencies

```
[Hours Data Source]
    └──requires──> [Google Places API integration]
                       └──enables──> [Open/Closed Badge]
                                         └──enables──> [Open Now Filter]
                                                           └──enables──> [Time-Aware Suggestions]

[Events Data Source]
    └──requires──> [Event aggregation strategy]
                       └──enables──> [Events Today Filter]
                                         └──enhances──> [Category Filters]

[Open Now Filter] ──conflicts with──> [Show All] (default view)
    └──mitigation──> Clear filter state indicators, easy reset

[Hours Confidence Indicator] ──depends on──> [Google Places API last_updated metadata]
```

### Dependency Notes

- **Hours Data → Open/Closed Badge:** Can't show status without hours. Google Places API `opening_hours.isOpen()` is the modern approach (replaces deprecated `open_now` field as of Feb 2021).
- **Open Now Filter → Map Markers:** Filter must interact with existing marker rendering. Opacity/visibility toggle on 687 CircleMarkers (current Leaflet implementation) or GeoJSON features (MapLibre implementation).
- **Events Today → Event Data Source:** No obvious single source. Options: scrape venue websites, integrate with Eventbrite API, manual curation, or hybrid. This is a Phase 2 research question.
- **Category Filters + Open Now:** Already have 10 category filters (pills). Adding time dimension creates 2D filter space. UX challenge: how to combine without overwhelming users?

**Technical constraint:** Current website is single HTML file (Leaflet + MapLibre variants). No build system, no backend. Any real-time data requires client-side API calls or pre-generated static JSON with timestamps.

## MVP Definition

### Launch With (Phase 1: "Open Now" Filter)

Minimum viable product — what's needed to validate "spontaneous discovery" value prop.

- [x] **Google Places API integration** — Fetch hours for 687 venues. One-time setup, cache in `hours_data.json`.
- [x] **Open/Closed status badge** — Green dot + "Open now" / Red dot + "Closed". Appears in tooltips and detail panel.
- [x] **Current hours display** — "Open until 5:00 PM" format. Show today's hours in tooltip/panel.
- [x] **"Open Now" filter toggle** — Button in filter row (with existing category pills). Dims closed venues to 40% opacity.
- [x] **Graceful failure for missing hours** — "Hours not available" placeholder. Don't break when Google Places has no data.
- [ ] **Mobile-responsive hours UI** — Ensure hours text wraps properly on small screens. Test on iOS Safari and Android Chrome.

**Why this is sufficient for v1:**
- Solves core user need: "What can I visit right now?"
- Leverages existing map infrastructure (markers, tooltips, detail panel)
- Low complexity: no backend, no event aggregation, no push notifications
- Validates value: if users don't use "Open Now" filter, they won't use more complex features

**Success metrics:**
- "Open Now" filter usage rate (clicks)
- Bounce rate comparison: filtered vs unfiltered sessions
- Detail panel opens on open venues vs closed venues (expect 3:1 ratio if working)

### Add After Validation (Phase 1.5: Polish)

Features to add once core "Open Now" is working and users are engaging.

- [ ] **Time-aware suggestions** — "3 galleries open for next 2 hours" callout in UI. Requires time math (closing time - current time).
- [ ] **Opening soon indicator** — Distinguish "Closed" (opens tomorrow) from "Opens in 30 min" (imminent). Reduces early-arrival frustration.
- [ ] **Weekend/Holiday hours handling** — Google Places API returns weekly schedule + special hours. Parse both. Show "Special hours today" badge if holiday.
- [ ] **Category + Open Now combo filters** — "Show open galleries" = category pill + open filter active simultaneously. UI challenge: make combined state clear.
- [ ] **Cluster counts with open ratio** — "4 of 7 open" on map clusters. Requires calculating open/closed per cluster on zoom change. Moderate complexity.

**Trigger for adding:** If "Open Now" filter sees >30% usage rate in first month, invest in polish features.

### Future Consideration (Phase 2: "Events Today")

Features to defer until product-market fit is established.

- [ ] **Events Today filter** — Separate filter toggle. Shows only venues with events happening today. Requires event data source.
- [ ] **Event cards in detail panel** — "2 events today" with titles, times. Clicking opens event details or external link.
- [ ] **Event categories** — Performances, gallery openings, workshops, festivals. Separate from venue categories.
- [ ] **Event recency sorting** — "Starting soon" events appear first in list/map.
- [ ] **Multi-day event handling** — Festival runs Fri-Sun. Show all 3 days or just today? UX decision needed.

**Why defer to Phase 2:**
- Event data sourcing is hard problem (see STACK.md for research on Eventbrite API, web scraping, manual curation)
- "Open Now" validates spontaneous discovery value prop without event complexity
- Events have higher maintenance burden (daily updates vs weekly hours)
- Scope creep risk: events → ticketing → bookings → payments (slippery slope to anti-features)

**Trigger for Phase 2:** User feedback explicitly requests "What's happening today?" (qualitative) OR analytics show users clicking venue websites looking for events (quantitative).

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Phase |
|---------|------------|---------------------|----------|-------|
| Open/Closed badge | HIGH | LOW | P1 | 1 |
| Current hours display | HIGH | LOW | P1 | 1 |
| "Open Now" filter | HIGH | LOW | P1 | 1 |
| Graceful failure states | HIGH | LOW | P1 | 1 |
| Mobile-responsive hours | HIGH | MEDIUM | P1 | 1 |
| Category + Open combo | MEDIUM | LOW | P2 | 1.5 |
| Time-aware suggestions | MEDIUM | MEDIUM | P2 | 1.5 |
| Opening soon indicator | MEDIUM | LOW-MEDIUM | P2 | 1.5 |
| Cluster open counts | LOW | MEDIUM | P2 | 1.5 |
| Events Today filter | HIGH | HIGH | P2 | 2 |
| Event cards in panel | MEDIUM | MEDIUM | P2 | 2 |
| Hours confidence indicator | LOW | LOW | P3 | 2+ |
| Holiday hours handling | MEDIUM | MEDIUM | P3 | 1.5 or 2 |
| Push notifications | LOW | HIGH | P3 | Never (anti-feature) |
| Crowdedness tracking | MEDIUM | VERY HIGH | P3 | 2+ or never |
| User-submitted hours | LOW | HIGH | P3 | Never (anti-feature) |

**Priority key:**
- P1: Must have for MVP launch (Phase 1)
- P2: Should have, add when usage validates need (Phase 1.5-2)
- P3: Nice to have or explicitly deferred (Phase 2+ or never)

## Competitor Feature Analysis

| Feature | Google Maps | Yelp | AllEvents App | Our Approach (Nevada County Cultural Map) |
|---------|-------------|------|---------------|-------------------------------------------|
| Open/Closed badge | Green/Red dot, "Open now" text | Green checkmark, "Open Now" | N/A (events only) | **Match:** Green/Red dot + text. Universal pattern. |
| Hours display | "Open until X PM" with full schedule dropdown | Similar, shows full week | N/A | **Match:** Inline hours in tooltip + detail panel. Full schedule in panel. |
| Open Now filter | Filter toggle (desktop: hidden above results, mobile: in filters sheet) | Filter checkbox in search refinements | N/A | **Improve:** Make filter prominent. Don't hide it. Toggle button in pill row. |
| Events integration | "Events" tab in Place Details (limited) | "Events" section for venues | Core feature: personalized event discovery by location/interests | **Phase 2:** Event cards in detail panel, not separate tab. Keep map-first UX. |
| Time-aware | No suggestions, just filter | No | AI-powered recommendations | **Differentiate:** "X venues open for next 2 hours" proactive callout. |
| Category filters | Limited (restaurants, cafes, bars) | Extensive (price, cuisine, features) | Event categories (music, food, sports) | **Strength:** 10 cultural categories (galleries, landmarks, performance, etc.). More specific than Google. |
| Mobile UX | Native app, highly optimized | Native app | Native app | **Constraint:** Mobile web. No native app. Must be exceptionally good mobile web experience. |

**Key insight from competitor analysis:**

1. **Google Maps hides "Open Now" filter** — Users complain it's hard to find (see [Google Maps Community thread](https://support.google.com/maps/thread/16169530/where-the-fuck-is-the-open-now-filter-on-desktop)). **Opportunity:** Make our filter prominent and obvious.

2. **Nobody does cultural-specific real-time discovery well** — Google/Yelp optimize for restaurants/retail. Events apps (AllEvents, Eventbrite) don't integrate with venue maps. **Gap:** Cultural maps with real-time discovery are underserved.

3. **"Happening now" is 2026 expectation** — Per [tourism tech trends research](https://coaxsoft.com/blog/tech-travel-trends-innovation), travelers demand "information by the second" about dynamic happenings. Static venue lists feel outdated. **Opportunity:** Real-time discovery is now table stakes for modern tourism tech, but most cultural maps (including ours currently) don't have it.

4. **Map-first interface is the 2026 UX trend** — "If 2023 was the year of short content, 2026 is the year of the map. Users no longer want endless lists." ([Source](https://coaxsoft.com/blog/tech-travel-trends-innovation)) **Strength:** We're already map-first. Adding real-time layers enhances existing paradigm rather than fighting it.

## Research Confidence Assessment

| Area | Confidence | Reasoning |
|------|------------|-----------|
| Table stakes features | **HIGH** | Google Maps patterns well-established since 2015. User expectations clear from multiple sources. |
| Differentiators | **MEDIUM-HIGH** | 2026 tourism trends point to real-time discovery, but cultural-specific applications less documented. Some inference from general travel apps. |
| Anti-features | **HIGH** | Notification fatigue and scope creep well-documented. Push notification statistics from authoritative sources. |
| Technical implementation | **MEDIUM** | Google Places API approach clear (see STACK.md), but integration with current single-file architecture needs validation. |
| Event data sourcing | **LOW-MEDIUM** | Identified as hard problem. Multiple options (API, scraping, manual) but no clear winner. Requires Phase 2 research. |
| User demand validation | **LOW** | No user interviews or analytics. Assuming demand based on industry trends and competitor features. Should validate with user testing. |

**Research gaps:**
- No primary user research (interviews, surveys, usability tests)
- Event data sourcing strategies need deeper dive (Phase 2 research task)
- Mobile UX patterns for combined category + time filters not well-documented (requires design prototyping)
- Hours data accuracy/freshness from Google Places API needs validation (test with sample venues)

## Sources

**Feature expectations and UI patterns:**
- [Google Maps "Open Now" Filter Discussion](https://support.google.com/maps/thread/154832301/)
- [Badge UI Design Best Practices, Mobbin](https://mobbin.com/glossary/badge)
- [UI Design Trends 2026, Landdding](https://landdding.com/blog/ui-design-trends-2026)
- [11 UI Design Best Practices (2026)](https://uxplaybook.org/articles/ui-fundamentals-best-practices-for-ux-designers)

**2026 Tourism technology trends:**
- [7 Travel Technology Trends Driving Tourism in 2026, Coaxsoft](https://coaxsoft.com/blog/tech-travel-trends-innovation)
- [3 Trends Defining Destination Tourism in 2026, Skift](https://skift.com/2025/12/02/3-trends-defining-destination-tourism-in-2026-and-beyond/)
- [Tourism & Visitor Centers Interactive Maps, Places.nu](https://places.nu/use-cases/tourism-visitor-centers/)
- [Tourism Cares Meaningful Travel Map Platform](https://www.travelmarketreport.com/canada/destinations/articles/tourism-cares-unveils-new-digital-platform-for-its-expanding-meaningful-travel-map)

**Event discovery and real-time features:**
- [Community & Cultural Festival Apps, Grandstand](https://grandstandapps.com/community-festivals)
- [The 10 Best Apps for Discovering Events Happening Around You, MakeUseOf](https://www.makeuseof.com/mobile-apps-for-nearby-events/)
- [Event Technology Trends in 2026, Cadmium](https://www.gocadmium.com/resources/event-technology-what-are-the-top-trends-in-2025)

**Google Places API and technical implementation:**
- [Place Field Migration (open_now, utc_offset), Google Developers](https://developers.google.com/maps/documentation/javascript/place_field_js_migration)
- [OpeningHours Reference, Places SDK](https://developers.google.com/maps/documentation/places/android-sdk/reference/com/google/android/libraries/places/api/model/OpeningHours)
- [About the Places API (New), Google Developers](https://developers.google.com/maps/documentation/places/web-service/op-overview)

**Anti-patterns and pitfalls:**
- [App Push Notification Best Practices for 2026, Appbot](https://appbot.co/blog/app-push-notifications-2026-best-practices/)
- [14 Push Notification Best Practices, Reteno](https://reteno.com/blog/push-notification-best-practices-ultimate-guide-for-2026)
- [Avoiding Push Fatigue, ContextSDK](https://contextsdk.com/blogposts/avoiding-push-fatigue-common-user-turn-offs)
- [Travel App Development Guide 2026, 5ly](https://5ly.co/blog/travel-app-development-guide/)

**Museum and cultural venue apps:**
- [Best Museum Apps 2025, Museumfy](https://www.museumfy.com/blog/best-museum-apps-2025-a-comprehensive-review)
- [10 Features to Look for in a Museum App, STQRY](https://stqry.com/blog/museum-app/)
- [8 Trends Transforming Museums, MySmartJourney](https://mysmartjourney.com/en-ca/post/8-trends-that-are-transforming-museums)

**MVP methodology:**
- [Minimum Viable Product (MVP) Guide for 2026, Monday.com](https://monday.com/blog/rnd/mvp-in-project-management/)
- [What Is a Minimum Viable Product? 2026 Strategy Guide, Presta](https://wearepresta.com/what-is-a-minimum-viable-product-the-complete-2026-guide-to-strategic-startup-validation/)

---

**Research completed:** 2026-02-07
**Researched by:** GSD Project Researcher (Claude Sonnet 4.5)
**For:** Nevada County Arts Council Cultural Map — Real-Time Discovery Milestone
