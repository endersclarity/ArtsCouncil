# Technology Stack Research

**Project:** Nevada County Cultural Map — Real-Time Discovery
**Researched:** 2026-02-07
**Confidence:** HIGH

## Recommended Stack

### Core APIs

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Google Places API (New)** | v1 (Current) | Hours data for 687 venues | Authoritative source. `opening_hours.isOpen()` method for real-time status. Replaced legacy API Feb 2021. 10,000 free calls/month (Essentials tier as of March 2025). |
| Eventbrite API | v3 (REST) | Event aggregation (Phase 2) | OAuth2, `/events/search/` endpoint. Best coverage for cultural events. Free tier available. Alternative: manual curation. |

**Google Places API (New) Details:**
- **Current status:** Legacy Places API disabled. Must use Places API (New).
- **Key features for our use case:**
  - `current_opening_hours`: 7-day schedule + special days (holidays)
  - `secondary_opening_hours`: Different services at same location (e.g., museum + café)
  - `opening_hours.isOpen()`: Real-time boolean check
- **Billing changes (March 2025):** Replaced universal $200/month credit with per-SKU free tiers. Essentials tier = 10,000 free calls/month per API.
- **Cost per call beyond free tier:** $0.017 per Place Details request (Basic Data fields). Hours data = Basic Data.
- **For 687 venues:** One-time fetch = $11.69 if no cache. With weekly refresh = ~$50/year. Well within budget.

**Sources:**
- [Places API (New) Overview, Google Developers](https://developers.google.com/maps/documentation/places/web-service/op-overview)
- [OpeningHours Reference, Places SDK](https://developers.google.com/maps/documentation/places/android-sdk/reference/com/google/android/libraries/places/api/model/OpeningHours)
- [Place Field Migration (open_now deprecated), Google Developers](https://developers.google.com/maps/documentation/javascript/place_field_js_migration)
- [Places API Usage and Billing, Google Developers](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [New Billing System (March 2025), Google Maps Platform](https://mapsplatform.google.com/pricing/)
- [Google Maps API Free Credit System Changes, Store Locator Widgets](https://www.storelocatorwidgets.com/blogpost/20499/New_Google_Maps_API_free_credit_system_from_March_1st_2025)

### Data Storage & Caching

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Static JSON files** | N/A | Cache hours data client-side | Matches current architecture (single HTML file). `hours_data.json` fetched on page load. Regenerate weekly via script. |
| localStorage | Browser API | Cache API responses | Prevent redundant calls. TTL-based invalidation. Simple, no backend needed. |
| Vercel Edge CDN | N/A | Serve static JSON with `Cache-Control` headers | Sub-100ms latency globally. Free tier = 100GB bandwidth/month. Current site already on Vercel. |

**Caching Strategy:**
1. **Pre-fetch hours (build-time):** Node.js script calls Google Places API for all 687 venues → generates `hours_data.json`
2. **Client-side cache (runtime):** Store in localStorage with 24-hour TTL. Check `isOpen()` status client-side using cached schedule.
3. **Refresh cadence:** Regenerate `hours_data.json` weekly (GitHub Action or manual). Cultural venues don't change hours daily.
4. **Graceful degradation:** If localStorage unavailable, fetch from CDN. If JSON stale/missing, show "Hours unavailable" placeholder.

**Why not server-side?**
- Current site = static Vercel deployment. No backend.
- Serverless functions (Vercel Functions) add complexity for minimal gain.
- 687 venues × weekly refresh = ~104 API calls/week = well within free tier.
- Hours data doesn't need real-time accuracy. Daily staleness is acceptable.

**Sources:**
- [API Caching Strategies, DreamFactory](https://blog.dreamfactory.com/api-caching-strategies-challenges-and-examples)
- [How to Handle API Rate Limits (2026 Guide), API Status Check](https://apistatuscheck.com/blog/how-to-handle-api-rate-limits)
- [Caching for Rate Limiting, DEV Community](https://dev.to/chinthala_tejeswarreddy_/caching-vs-rate-limiting-more-like-caching-for-rate-limiting-dmh)

### JavaScript Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Luxon** | 3.x | Date/time manipulation | Parsing Google Places hours format. "Open until 5:00 PM" display. Timezone-safe (Pacific Time for Nevada County). Lighter than Moment.js. |
| date-fns | 3.x | Alternative to Luxon | If bundle size critical (<10KB vs Luxon's ~20KB). Similar API. |

**Why Luxon:**
- Modern, actively maintained (Moment.js deprecated)
- Immutable API (no mutation bugs)
- Timezone support via `IANAZone` (handles PST/PDT)
- Readable syntax: `DateTime.now().setZone('America/Los_Angeles')`

**Why NOT Moment.js:**
- Officially deprecated ("no new features")
- Large bundle size (~67KB minified)
- Mutable API (footgun for beginners)

**Implementation note:** Add via CDN to match current single-file architecture. No build system needed.

```html
<script src="https://cdn.jsdelivr.net/npm/luxon@3/build/global/luxon.min.js"></script>
```

**Sources:**
- [Luxon Documentation](https://moment.github.io/luxon/)
- [Why Moment.js is Dead, Flatlogic](https://flatlogic.com/blog/why-momentjs-is-dead/)
- [Date-fns vs Luxon Comparison](https://npmtrends.com/date-fns-vs-luxon)

### Event Data (Phase 2)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Eventbrite API | v3 | Cultural event aggregation | Best coverage. `/events/search/` endpoint with venue filters. OAuth2 for auth. Free tier available. |
| Web Scraping (Cheerio.js) | 1.x | Fallback for venues without Eventbrite | For venues with `/events` pages. Node.js script to scrape, output JSON. High maintenance burden. |
| Manual Curation | N/A | Hybrid approach | Arts Council staff manually add key events to `events_data.json`. Sustainable for small orgs. |

**Recommendation: Hybrid approach**
1. **Eventbrite API** for venues using Eventbrite (estimate: 30-40% of 687 venues)
2. **Manual curation** for major events (MUSE Cultural Corridors, Nevada County Fair, quarterly gallery openings)
3. **Defer web scraping** unless user demand is overwhelming (high maintenance, fragile)

**Eventbrite API Details:**
- **Endpoint:** `GET /events/search/?q=<venue_name>&location.address=<address>`
- **Rate limit:** 1000 requests/hour (anonymous), 2000/hour (OAuth)
- **Cost:** Free for public event data
- **Challenges:** Requires venue mapping (Eventbrite venue IDs ≠ our venue IDs). One-time setup cost.

**Alternative: Schema.org structured data scraping**
Many cultural venues use Schema.org `Event` markup. Could scrape with far less fragility than raw HTML parsing. Worth investigating in Phase 2 research.

**Sources:**
- [Eventbrite API Introduction, Eventbrite Platform](https://www.eventbrite.com/platform/docs/introduction)
- [Get Event Information Using Eventbrite API, I'd Rather Be Writing](https://idratherbewriting.com/learnapidoc/docapis_eventbrite_example.html)
- [Eventbrite Events with Order Count, API Evangelist](https://apievangelist.com/2020/01/15/eventbrite-events-with-order-count-and-capacity-using-the-api/)
- [Event Aggregation Tools, The Events Calendar](https://theeventscalendar.com/products/event-aggregator/)

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **Hours data source** | Google Places API (New) | Yelp Fusion API | Smaller dataset (focus on restaurants/bars). Less cultural venue coverage. Similar pricing. |
| **Hours data source** | Google Places API (New) | Manual data entry | Unsustainable for 687 venues. Hours change seasonally. Staff burden. |
| **Date library** | Luxon | Moment.js | Deprecated. Large bundle. Mutable API. |
| **Date library** | Luxon | Day.js | No built-in timezone support (needs plugin). Less feature-complete. |
| **Caching** | Static JSON + localStorage | Server-side cache (Redis) | Requires backend. Over-engineering for static site. |
| **Event data** | Hybrid (Eventbrite + manual) | AllEvents API | Limited cultural event coverage. Focuses on mainstream events (concerts, sports). |
| **Event data** | Hybrid (Eventbrite + manual) | Full web scraping | Fragile. High maintenance. Breaks when venues redesign sites. |
| **Deployment** | Vercel (current) | Netlify, GitHub Pages | Already on Vercel. Migration adds risk, no benefit. |

## Installation & Setup

### Phase 1: Hours Data

**1. Google Places API Setup**
```bash
# Enable Places API (New) in Google Cloud Console
# Create API key with Places API (New) enabled
# Set HTTP referrer restrictions (https://cultural-map-redesign.vercel.app/*)
```

**2. Fetch hours script (Node.js)**
```bash
npm init -y
npm install axios dotenv luxon

# Create scripts/fetch-hours.js
# Reads data.json (687 venues)
# Calls Google Places API for each venue
# Outputs hours_data.json
```

**3. Luxon for date handling**
```html
<!-- Add to index.html <head> -->
<script src="https://cdn.jsdelivr.net/npm/luxon@3/build/global/luxon.min.js"></script>
```

**4. Deploy updated hours_data.json**
```bash
# Run weekly via GitHub Action or manual
node scripts/fetch-hours.js
git add website/cultural-map-redesign/hours_data.json
git commit -m "Update hours data"
git push  # Vercel auto-deploys
```

### Phase 2: Event Data (Future)

**1. Eventbrite API Setup**
```bash
# Create Eventbrite account
# Generate OAuth token at eventbrite.com/platform/api/
# Add to .env file (never commit)
```

**2. Event fetch script**
```bash
npm install @eventbrite/eventbrite-sdk-javascript

# Create scripts/fetch-events.js
# Query /events/search/ for Nevada County venues
# Filter to today's events
# Output events_data.json
```

**3. Daily refresh**
```bash
# GitHub Action: daily at 6 AM Pacific
# Fetches events, regenerates JSON, commits to repo
```

## Data Format Specifications

### hours_data.json

```json
{
  "North Star House Museum & Conservancy": {
    "isOpen": false,
    "status": "Closed",
    "todayHours": "10:00 AM - 4:00 PM",
    "nextChange": "Opens at 10:00 AM",
    "schedule": {
      "Monday": "Closed",
      "Tuesday": "Closed",
      "Wednesday": "10:00 AM - 4:00 PM",
      "Thursday": "10:00 AM - 4:00 PM",
      "Friday": "10:00 AM - 4:00 PM",
      "Saturday": "10:00 AM - 4:00 PM",
      "Sunday": "10:00 AM - 4:00 PM"
    },
    "specialHours": {
      "2026-12-25": "Closed - Christmas"
    },
    "lastUpdated": "2026-02-07T08:00:00-08:00",
    "source": "Google Places API"
  }
}
```

**Format rationale:**
- `isOpen` = boolean for easy filtering
- `status` + `todayHours` = human-readable display strings
- `nextChange` = "Opens at X" or "Closes at Y" for urgency messaging
- `schedule` = full week for detail panel display
- `specialHours` = holiday overrides (Google Places `special_days` field)
- `lastUpdated` = ISO8601 timestamp for staleness detection
- `source` = attribution (Google Places vs manual vs venue website)

### events_data.json (Phase 2)

```json
{
  "events": [
    {
      "id": "evt_001",
      "name": "Watercolor Workshop with Local Artist",
      "venue": "Nevada City Artists Co-op",
      "venueId": "nc_artists_coop",
      "date": "2026-02-07",
      "startTime": "14:00:00",
      "endTime": "16:00:00",
      "category": "workshop",
      "description": "Learn watercolor techniques...",
      "url": "https://example.com/event",
      "source": "Eventbrite",
      "lastUpdated": "2026-02-07T06:00:00-08:00"
    }
  ]
}
```

## Technical Constraints

### Current Architecture (Single HTML File)

**Constraint:** No build system, no bundler, no backend.

**Implications:**
- All JavaScript must work via CDN (Luxon, Leaflet, MapLibre already loaded this way)
- API calls must be client-side (CORS-enabled endpoints only)
- Data must be pre-fetched and committed to repo as static JSON
- No server-side rendering, no dynamic routes

**This is actually a strength:** Simplicity. Deploy = push to git. No complex infrastructure.

### API Rate Limits

**Google Places API:**
- 10,000 free calls/month (Essentials tier)
- $0.017/call beyond free tier
- 687 venues = 1 API call each
- **Strategy:** Pre-fetch weekly, cache aggressively. Stay under free tier.

**Eventbrite API:**
- 1000 requests/hour (anonymous)
- 2000 requests/hour (OAuth)
- **Strategy:** Daily batch fetch at 6 AM. 687 venues = under 1000 requests. Safe.

### Browser Compatibility

**Target:** Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

**localStorage:** [98.5% support](https://caniuse.com/namevalue-storage)
**Fetch API:** [98% support](https://caniuse.com/fetch)
**Luxon:** Relies on Intl API (97% support)

**Graceful degradation for old browsers:**
- Feature detection: `if (typeof Storage !== 'undefined')`
- Fallback: Fetch JSON directly from CDN on every page load
- No localStorage = slightly slower, but functional

## Confidence Assessment

| Technology | Confidence | Reasoning |
|------------|------------|-----------|
| Google Places API (New) | **HIGH** | Official Google documentation. Widely used. Clear pricing. Current as of Feb 2026. |
| Static JSON caching | **HIGH** | Proven pattern. Already using for `data.json` and `image_data.json`. |
| Luxon for dates | **HIGH** | Industry standard. Active maintenance. Well-documented. |
| Eventbrite API | **MEDIUM** | Good documentation, but venue mapping is non-trivial. Requires Phase 2 research to validate coverage. |
| localStorage | **HIGH** | Mature browser API. Reliable. Fallback strategy clear. |
| Hybrid event sourcing | **MEDIUM** | Manual curation is sustainable for Arts Council, but labor-intensive. Need to validate staff capacity. |

## Research Gaps

**Phase 1 (Hours Data):**
- [ ] Test Google Places API with sample Nevada County venues (North Star House, Miners Foundry, etc.). Verify hours data quality.
- [ ] Confirm timezone handling: Does API return Pacific Time or UTC? How to detect DST transitions?
- [ ] Measure bundle size impact of Luxon (20KB). Test on 3G connection.

**Phase 2 (Events Data):**
- [ ] Survey 687 venues: How many use Eventbrite? How many have public event calendars?
- [ ] Evaluate Schema.org structured data scraping as alternative to Eventbrite API.
- [ ] Estimate Arts Council staff time for manual event curation (hours/week).
- [ ] Test event data freshness: If daily fetch fails, how stale can events get before UX breaks?

**Technical debt:**
- [ ] Single HTML file architecture won't scale forever. At what point (features? file size?) should we introduce a build system?
- [ ] No error monitoring (Sentry, LogRocket). How to debug production issues with user-reported bugs?

## Sources

**Google Places API:**
- [Places API (New) Overview, Google Developers](https://developers.google.com/maps/documentation/places/web-service/op-overview)
- [OpeningHours Model, Places SDK](https://developers.google.com/maps/documentation/places/android-sdk/reference/com/google/android/libraries/places/api/model/OpeningHours)
- [Place Field Migration, Google Developers](https://developers.google.com/maps/documentation/javascript/place_field_js_migration)
- [Places API Usage and Billing, Google Developers](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)
- [New Billing System Changes (March 2025), Store Locator Widgets](https://www.storelocatorwidgets.com/blogpost/20499/New_Google_Maps_API_free_credit_system_from_March_1st_2025)

**Eventbrite API:**
- [Eventbrite API Docs, Eventbrite Platform](https://www.eventbrite.com/platform/docs/introduction)
- [Get Event Information Using Eventbrite API, I'd Rather Be Writing](https://idratherbewriting.com/learnapidoc/docapis_eventbrite_example.html)
- [Eventbrite Events with API, API Evangelist](https://apievangelist.com/2020/01/15/eventbrite-events-with-order-count-and-capacity-using-the-api/)
- [Event Aggregator, The Events Calendar](https://theeventscalendar.com/products/event-aggregator/)

**Caching and rate limiting:**
- [How to Handle API Rate Limits (2026 Guide), API Status Check](https://apistatuscheck.com/blog/how-to-handle-api-rate-limits)
- [API Caching Strategies, DreamFactory](https://blog.dreamfactory.com/api-caching-strategies-challenges-and-examples)
- [Caching for Rate Limiting, DEV Community](https://dev.to/chinthala_tejeswarreddy_/caching-vs-rate-limiting-more-like-caching-for-rate-limiting-dmh)
- [10 Best Practices for API Rate Limiting (2025), DEV Community](https://dev.to/zuplo/10-best-practices-for-api-rate-limiting-in-2025-358n)

**Date libraries:**
- [Luxon Documentation](https://moment.github.io/luxon/)
- [Why Moment.js is Dead, Flatlogic](https://flatlogic.com/blog/why-momentjs-is-dead/)
- [Date-fns vs Luxon Comparison, NPM Trends](https://npmtrends.com/date-fns-vs-luxon)

---

**Research completed:** 2026-02-07
**Researched by:** GSD Project Researcher (Claude Sonnet 4.5)
**For:** Nevada County Arts Council Cultural Map — Real-Time Discovery Milestone
