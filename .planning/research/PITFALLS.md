# Pitfalls Research: Real-Time Discovery Features (Hours/Events) on Web Maps

**Domain:** Real-time business hours and event data integration for cultural asset mapping
**Researched:** 2026-02-08
**Confidence:** HIGH

This research focuses on pitfalls when adding "Open Now" filtering and "Events Today" features to web maps with 687 cultural assets. Based on your dual Leaflet/MapLibre architecture and Google Places API integration plan.

---

## Critical Pitfalls

### Pitfall 1: Google Places API Caching Violations

**What goes wrong:**
You cache Places API content (hours, ratings, reviews) for more than 30 days or store it permanently, violating Google's Terms of Service. Google detects this through usage pattern analysis and revokes your API key without warning, breaking your production map.

**Why it happens:**
Developers assume they can cache any API response to reduce costs and improve performance. The instinct to "cache everything" for a static cultural map feels natural. Google's caching policy is buried in documentation most people skip.

**How to avoid:**
- Cache ONLY place_id values (exempt from restrictions) — store these indefinitely
- Cache other Places API data (hours, reviews, etc.) for maximum 30 days
- Use client-side localStorage with TTL timestamps, not server-side permanent storage
- Implement automatic cache expiry logic: `if (Date.now() - cachedTimestamp > 30 * 24 * 60 * 60 * 1000) { refetch() }`
- Document caching strategy in code comments referencing official policy

**Warning signs:**
- API requests suddenly return 403 or API key deactivated errors
- No gradual degradation — Google enforcement is binary (works/doesn't work)
- Happens more often in production than development (usage patterns trigger detection)

**Phase to address:**
Phase 1 (Hours integration) — before any caching is implemented. Add cache expiry logic from day one.

---

### Pitfall 2: Naive Rate Limit Handling (Quota Exhaustion)

**What goes wrong:**
You hit Google Places API rate limits (queries per minute per project) during page load when fetching hours for 687 assets. Users see error states, incomplete data, or the page hangs. In production, multiple users loading the map simultaneously compounds the problem exponentially.

**Why it happens:**
- Developers test with <10 markers, then deploy with 687 markers
- Rate limit is per project per minute, not per user — multiple concurrent users share the same quota
- Autocomplete/Place Details requests during development inflate quota usage invisibly
- No exponential backoff or queue management in client-side code

**How to avoid:**
- **Never fetch hours for all 687 assets on page load** — only fetch for visible/filtered markers
- Implement viewport-based fetching: only request hours for assets currently in map bounds
- Add exponential backoff with jitter for 429 responses:
  ```javascript
  async function fetchWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url);
        if (response.status === 429) {
          const delay = Math.min(1000 * Math.pow(2, i) + Math.random() * 1000, 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        return response;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
      }
    }
  }
  ```
- Monitor rate limit headers proactively (X-RateLimit-Remaining, X-RateLimit-Reset)
- Consider server-side proxy with request queuing for production (phases asset requests across time)

**Warning signs:**
- 429 "Too Many Requests" errors in console during development
- Intermittent failures that resolve after waiting
- Page load time increases with concurrent users
- API costs spike unexpectedly

**Phase to address:**
Phase 1 (Hours integration) — critical before production deployment. Must be in place before launch.

---

### Pitfall 3: Timezone Hell (Business Hours Parsing)

**What goes wrong:**
You parse business hours in user's local timezone instead of the business's timezone (PST for Nevada County). A user in New York sees "Closed Now" for a venue that's actually open because you compared 3pm EST against 12pm-5pm PST hours without timezone conversion. Or worse: hours display in UTC and confuse everyone.

**Why it happens:**
- Naive `new Date()` uses browser timezone by default
- Developers forget businesses operate in their local timezone, not user's timezone
- Google Places API returns UTC offsets but requires manual timezone calculation
- Daylight Saving Time boundaries differ by location (not all places observe DST, transition dates vary)
- "Open 24 hours" and special cases (e.g., "Closed Sundays") need separate handling

**How to avoid:**
- Use Google Time Zone API to get business timezone from lat/lng: `https://maps.googleapis.com/maps/api/timezone/json?location={lat},{lng}&timestamp={now}`
- Store timezone info with each venue: `{ name: "North Star House", timezone: "America/Los_Angeles", ... }`
- Use timezone-aware comparison libraries (date-fns-tz, Luxon, Temporal API) — do NOT use raw Date objects
- Example with Luxon:
  ```javascript
  import { DateTime } from 'luxon';

  function isOpenNow(hours, venueTimezone) {
    const now = DateTime.now().setZone(venueTimezone);
    const currentDay = now.weekdayLong.toLowerCase(); // "monday"
    const currentTime = now.toFormat('HH:mm'); // "14:30"
    // Compare currentTime against hours[currentDay]
  }
  ```
- Handle special cases explicitly:
  - Open 24 hours: `{ type: 'always_open' }`
  - Closed permanently: `{ type: 'permanently_closed' }`
  - Irregular hours: `{ type: 'irregular', note: "Call ahead" }`
- Test with users in different timezones (EST, MST, HST)

**Warning signs:**
- "Open Now" filter shows wrong results for users outside PST
- Hours display correctly but filter logic fails
- Inconsistent results between morning/evening users
- Bugs appear only during DST transition weeks (March/November)

**Phase to address:**
Phase 1 (Hours integration) — must be correct from launch. Timezone bugs are visible and erode trust.

---

### Pitfall 4: Stale Event Data (No Freshness Strategy)

**What goes wrong:**
Event data displays outdated information: "Events Today" shows a concert from last week, or a canceled event still appears. Users arrive at closed venues, destroying trust in your map. Events management organizations stop sharing data with you.

**Why it happens:**
- Events are time-sensitive but treated like static cultural assets
- No automatic expiry for past events in data layer
- Manual event entry without validation (typos in dates, wrong years)
- Aggregating events from multiple sources (Eventbrite, Google Calendar, manual CMS) with no deduplication
- No process for event organizers to update/cancel listings

**How to avoid:**
- **Automatic event expiry:** Filter out events where `eventDate < Date.now()` before rendering
- Add event status field: `{ status: 'scheduled' | 'canceled' | 'postponed' | 'completed' }`
- Implement event deduplication when aggregating from multiple sources:
  - Use consistent event_id across sources (hash of venue + date + title)
  - Match events by venue + time proximity (within 30 minutes) + title similarity (Levenshtein distance < 3)
- Display data freshness indicator: "Events updated 2 hours ago" with manual refresh button
- Set reasonable refresh intervals:
  - Events data: refresh every 6 hours
  - Business hours: refresh every 24 hours (daily, not real-time)
- Add "Report Issue" link on event cards for user-submitted corrections
- Build event submission form with validation:
  - Date must be future
  - Time must be valid 24-hour format
  - Venue must match existing asset or include address
- Phase event aggregation:
  1. Manual curated events first (lowest risk)
  2. Single API source (Eventbrite) next
  3. Multi-source aggregation last (highest complexity)

**Warning signs:**
- Users report attending events that don't exist
- Event count on map doesn't decrease over time (accumulation)
- Multiple listings for same event from different sources
- "Events Today" shows nothing on days with known events (over-filtering)

**Phase to address:**
Phase 2 (Events integration) — build freshness logic from day one. Phase 3 (Multi-source aggregation) adds deduplication.

---

### Pitfall 5: Dual Map Architecture Code Duplication

**What goes wrong:**
You implement "Open Now" filter in index.html (Leaflet), then copy-paste the implementation to index-maplibre.html. A bug fix in one version doesn't propagate to the other. The two maps diverge silently, creating maintenance hell. One version ships with a critical bug the other doesn't have.

**Why it happens:**
- No build system means no shared modules (everything is inline in single HTML files)
- "Just copy-paste for now, we'll refactor later" (you won't)
- Separate codebases for Leaflet vs MapLibre API differences make sharing hard
- Different marker implementations (L.CircleMarker vs MapLibre circle layer) require different filter logic
- Time pressure to ship features leads to duplicated implementation

**How to avoid:**
- **Option A: Shared JavaScript modules** (recommended for Phase 1)
  - Extract business logic into shared JS files: `hours-utils.js`, `event-utils.js`, `filter-logic.js`
  - Keep only map rendering code inline in HTML files
  - Example structure:
    ```
    website/cultural-map-redesign/
      index.html (Leaflet rendering)
      index-maplibre.html (MapLibre rendering)
      js/
        hours-utils.js (isOpenNow, parseHours, timezone handling)
        event-utils.js (filterEventsByDate, deduplicateEvents)
        filter-logic.js (applyFilters, updateMarkerVisibility)
    ```
  - Both HTML files import shared modules via `<script type="module">`
- **Option B: Progressive enhancement wrapper** (advanced)
  - Use maplibre-gl-leaflet binding to create unified API
  - Write once, works on both (limits MapLibre-specific features)
- **Option C: Feature flags in single file** (simplest but messiest)
  - Detect map type at runtime: `const isMapLibre = typeof maplibregl !== 'undefined'`
  - Branch logic: `isMapLibre ? updateMapLibreMarkers() : updateLeafletMarkers()`
- **Testing strategy:**
  - Maintain checklist of features to test in both versions
  - Before committing: test same interaction flow in both maps
  - Use browser dev tools to compare console logs across versions

**Warning signs:**
- "It works in Leaflet but not MapLibre" bug reports
- Finding old code during debugging that doesn't exist in current version
- Forgetting which version has which features
- Fear of touching code because unclear which file is source of truth

**Phase to address:**
Phase 1 (Hours integration) — extract shared modules BEFORE implementing hours logic. Prevents accumulation of technical debt.

---

### Pitfall 6: Exposed API Keys Without Restrictions (Security)

**What goes wrong:**
You hardcode a Google Maps API key in client-side JavaScript (visible in source) without proper restrictions. An attacker scrapes the key, uses it for their own map projects, and exhausts your quota. You receive a $10,000+ bill for usage you didn't initiate. Google refuses to waive the charges.

**Why it happens:**
- Static sites require client-side API keys (no backend to hide them)
- Developers assume "it's just a map" doesn't need security hardening
- API key restrictions are optional during setup, easy to skip
- Testing with unrestricted keys, forgetting to add restrictions before production
- Lack of monitoring means abuse goes undetected until billing

**How to avoid:**
- **Accept that client-side API keys are visible** — this is inherent to static sites
- **Apply API key restrictions immediately:**
  - HTTP referrer restrictions: whitelist only your domains (`*.vercel.app/*`, `culturalmap.com/*`)
  - API restrictions: enable ONLY required APIs (Places API, Maps JavaScript API, Time Zone API)
  - Disable all other APIs (Directions, Distance Matrix, etc.)
- **Set up billing alerts:**
  - Google Cloud Console → Billing → Budgets & alerts
  - Alert at $50, $100, $200 thresholds
  - Configure budget cap (e.g., $500/month max)
- **Monitor usage daily during first month:**
  - Check Google Cloud Console → APIs & Services → Dashboard
  - Watch for unusual traffic spikes or unfamiliar referrers
  - Investigate requests from unexpected domains immediately
- **Consider Vercel Edge Functions proxy for production scale:**
  - Hides API key server-side
  - Adds rate limiting per user IP
  - Enables request logging and monitoring
  - Defer to Phase 4 (scaling) unless abuse detected earlier
- **Rotate keys quarterly:**
  - Create new key with restrictions
  - Update deployed sites
  - Delete old key after 48-hour overlap period

**Warning signs:**
- Unexpected spike in API usage (10x normal)
- Requests from domains you don't control
- Billing alerts triggering
- Map stops working due to quota exhaustion
- Unusual geographic distribution of requests (e.g., traffic from countries you don't serve)

**Phase to address:**
Phase 1 (Hours integration) — BEFORE deploying API key to production. Set restrictions on day one.

---

### Pitfall 7: Field Masking Neglect (Cost Explosion)

**What goes wrong:**
You request all available fields from Google Places API (`fields=*`) for each venue instead of specifying only needed fields. Each request costs 10x more than necessary. After 1000 page loads, you've burned through $500 budget that should have lasted months.

**Why it happens:**
- Documentation examples use `fields=*` for simplicity
- Developers don't realize field masking affects billing tier (IDs Only → Location → Basic → Advanced → Preferred)
- Testing with small user counts hides cost scaling
- Assuming "we might need this data later" justifies over-fetching
- Tiered pricing is non-obvious: requesting one Advanced field charges for ALL Advanced tier

**How to avoid:**
- **Use field masking for every Places API request:**
  ```javascript
  // BAD: costs $17 per 1000 requests (Advanced tier)
  fetch(`/maps/api/place/details?fields=*&place_id=${id}`)

  // GOOD: costs $3 per 1000 requests (Basic tier)
  fetch(`/maps/api/place/details?fields=place_id,name,opening_hours,formatted_address&place_id=${id}`)
  ```
- **Understand pricing tiers:**
  - Basic Data: `place_id`, `name`, `formatted_address`, `opening_hours`, `geometry` ($3/1000)
  - Contact Data: `phone_number`, `website`, `opening_hours` ($3/1000)
  - Atmosphere Data: `price_level`, `rating`, `user_ratings_total` ($5/1000)
  - **If you request ANY Atmosphere field, you pay Atmosphere tier for entire request**
- **Request ONLY what you'll display:**
  - For "Open Now" filter: `opening_hours.open_now` (Basic tier)
  - For hours display: `opening_hours.weekday_text` (Basic tier)
  - For contact: `website, formatted_phone_number` (Contact tier)
  - Avoid: `rating, reviews, photos` unless needed (jumps to Atmosphere tier)
- **Use `fields` parameter calculator:**
  - Google provides pricing calculator to estimate costs
  - Test field combinations to find cheapest tier that meets needs
- **Monitor actual costs weekly:**
  - Google Cloud Console → Billing → Cost table
  - Break down by SKU (Place Details - Basic vs Advanced)
  - If seeing "Advanced" charges, audit field masks

**Warning signs:**
- Monthly bill 5-10x higher than estimates
- "Place Details - Advanced" or "Place Details - Preferred" line items when you only need hours
- Costs increase linearly with user traffic (should plateau with caching)
- Billing shows all requests at highest tier

**Phase to address:**
Phase 1 (Hours integration) — implement field masking from first API call. Audit before launch.

---

### Pitfall 8: Mobile Performance Collapse (No Marker Clustering)

**What goes wrong:**
The map works smoothly on desktop with 687 markers, but lags severely on mobile devices. Touch interactions stutter, zoom is choppy, filtering takes 3-5 seconds. Users on older phones (<2GB RAM) experience browser crashes. Bounce rate on mobile is 70%.

**Why it happens:**
- Testing on high-end desktop (16GB RAM, dedicated GPU) hides mobile constraints
- 687 individual DOM elements (Leaflet) or 687 features in GeoJSON layer (MapLibre) overwhelm mobile rendering
- No marker clustering means every marker renders even when viewport shows 50
- Mobile browsers have strict memory limits (Safari: ~1GB per tab)
- Touch event handlers on 687 markers cause event listener bloat
- Developers assume "it's just circles on a map" is lightweight

**How to avoid:**
- **Implement marker clustering from day one:**
  - Leaflet: use [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) plugin
  - MapLibre: use built-in clustering with `cluster: true` in GeoJSON source
  - Configure reasonable cluster radius: 50-80px
  - Show cluster counts: "23" inside clustered marker
  - Expand cluster on click (zoom + pan to show individual markers)
- **Clustering configuration for 687 markers:**
  ```javascript
  // Leaflet
  const markers = L.markerClusterGroup({
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  // MapLibre
  map.addSource('assets', {
    type: 'geojson',
    data: geojsonData,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });
  ```
- **Viewport culling (if not using clustering):**
  - Only render markers within current map bounds + 10% buffer
  - Dynamically add/remove markers as user pans
  - Cache marker objects, don't recreate on every pan
- **Reduce marker complexity:**
  - Use simple circles, not custom SVG icons (SVG is expensive on mobile)
  - Limit CSS animations on markers (shadows, pulses)
  - Defer loading hours data until marker is clicked (don't fetch for all visible)
- **Test on real mobile devices:**
  - iPhone SE (low-end iOS)
  - Android device with 2GB RAM
  - Use Chrome DevTools mobile throttling (4x CPU slowdown)
  - Profile with Performance tab: look for long tasks >50ms
- **Progressive enhancement strategy:**
  - Desktop: show all 687 markers with rich interactions
  - Mobile: aggressive clustering (threshold: maxClusterRadius: 80)
  - Very small screens (<375px): consider list view as primary, map as secondary

**Warning signs:**
- Mobile PageSpeed Insights score <50
- Console warnings about memory pressure
- Touch gestures lag or drop frames
- Zoom animation stutters
- Browser prompts to "stop running script"
- High bounce rate specifically on mobile traffic

**Phase to address:**
Phase 1 (Hours integration) — before adding dynamic data to markers. Clustering is harder to retrofit.

---

### Pitfall 9: Event Deduplication Failure (Multi-Source Aggregation)

**What goes wrong:**
You aggregate events from Eventbrite, Google Calendar, and a manual CSV. The same concert appears 3 times on the map with slight variations ("Summer Jazz Festival", "Summer Jazz Festival 2026", "Jazz Festival - Summer"). Users click each expecting different events, lose trust, stop using the map.

**Why it happens:**
- No unique event_id across different platforms
- Each source uses different schema (date formats, venue names, categories)
- String matching is brittle: "North Star House" vs "North Star Historic House" vs "North Star"
- Time precision varies: some sources give minute-level, others day-level
- Human data entry introduces typos and inconsistencies
- Deduplication is deferred to "later" during initial aggregation work

**How to avoid:**
- **Generate stable event_id for deduplication:**
  ```javascript
  function generateEventId(event) {
    // Normalize inputs
    const venue = normalizeVenueName(event.venue);
    const date = new Date(event.date).toISOString().split('T')[0]; // YYYY-MM-DD only
    const title = event.title.toLowerCase().trim();

    // Hash to create stable ID
    return hashCode(`${venue}|${date}|${title}`);
  }
  ```
- **Venue name normalization:**
  - Strip common suffixes: "LLC", "Inc.", "Museum", "Gallery"
  - Remove special characters: `normalize('NFD').replace(/[\u0300-\u036f]/g, '')`
  - Lowercase and trim whitespace
  - Map known aliases: "North Star House" → canonical "North Star Historic Conservancy"
- **Date/time proximity matching:**
  - Consider events "same" if within 30-minute window
  - Account for timezone differences in source data
  - Day-level events (no time specified): match on date only
- **Title similarity threshold:**
  - Use Levenshtein distance or Jaccard similarity
  - Threshold: >80% similarity + same venue + same date = likely duplicate
  - Handle common variations: "2026" suffix, "Annual" prefix, punctuation differences
- **Merge strategy when duplicates found:**
  - Choose most complete record as primary (most fields populated)
  - Preserve source URLs from all duplicates (multiple ticket links is good)
  - Combine descriptions (append if significantly different)
  - Take earliest timestamp for "first seen" metadata
- **Manual review dashboard (Phase 3):**
  - Flag potential duplicates for human review (75-95% similarity)
  - Show side-by-side comparison for ambiguous cases
  - One-click merge or mark as distinct
- **Source priority hierarchy:**
  1. Manual curation (highest trust)
  2. Eventbrite (structured data, official)
  3. Google Calendar (less structured)
  4. Scraped/imported data (lowest trust, review before publishing)

**Warning signs:**
- Users report "duplicate events" in feedback
- Event count inflates unrealistically (500 events when expecting 200)
- Same venue shows multiple overlapping events at exact same time
- Filtering by category shows same event in multiple categories
- Event detail panel has identical descriptions with different titles

**Phase to address:**
Phase 3 (Multi-source aggregation) — don't aggregate without deduplication. Phase 2 (single source) can skip this.

---

### Pitfall 10: Offline Mode Neglect (Progressive Web App Gap)

**What goes wrong:**
Users in rural Nevada County (spotty cell coverage) visit the map, lose connectivity, and the map becomes completely unusable — blank tiles, no markers, no cached hours. They bookmark the site but never return because it's unreliable in the field.

**Why it happens:**
- Developers test on reliable WiFi, never experience connectivity loss
- Static site hosting (Vercel) doesn't include service worker by default
- Assumption that "it's a web map, must be online" is acceptable
- Mobile users in rural areas are underestimated
- No service worker means no Cache API, no offline fallback
- External dependencies (CDN for Leaflet, basemap tiles) fail silently offline

**How to avoid:**
- **Implement service worker with caching strategy:**
  ```javascript
  // service-worker.js
  const CACHE_NAME = 'cultural-map-v1';
  const STATIC_ASSETS = [
    '/index.html',
    '/data.json',
    '/image_data.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
  ];

  // Cache-first strategy for static assets
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  });
  ```
- **Cache strategy by resource type:**
  - Static assets (HTML, CSS, JS): Cache-first (always use cache if available)
  - Cultural asset data (data.json): Stale-while-revalidate (serve cache, update in background)
  - Basemap tiles: Cache-first with expiry (store 100-200 tiles for core county area)
  - Hours/events API: Network-first (fresh data preferred), cache as fallback
- **Offline-first architecture:**
  - Store core 687 assets in IndexedDB (larger capacity than localStorage)
  - Pre-cache basemap tiles for Nevada County at zoom levels 10-14
  - Show "Using cached data from [date]" banner when offline
  - Gracefully degrade: hide "Open Now" filter when offline (can't verify freshness)
  - Enable basic map interactions (pan, zoom, marker clicks) with cached data
- **Background sync for events:**
  - Use Background Sync API to queue event submissions when offline
  - Retry automatically when connectivity restored
  - Show pending sync indicator in UI
- **Offline detection UX:**
  - Listen to `navigator.onLine` changes
  - Show prominent "You're offline" banner (not just console warning)
  - Disable features that require fresh data (hours, events)
  - Provide "Refresh when online" button
- **Testing offline mode:**
  - Chrome DevTools: Network tab → Throttling → Offline
  - Test partial connectivity: Slow 3G with random packet loss
  - Service worker updates: force update and verify old cache clears
  - Verify functionality: marker clicks, filtering, detail panel work offline

**Warning signs:**
- Users report "map stops working randomly"
- High bounce rate from rural/mobile users
- Support requests mentioning "blank map" or "nothing loads"
- Analytics show short session duration correlated with mobile traffic
- No service worker registered in DevTools → Application tab

**Phase to address:**
Phase 4 (PWA/Offline) — not critical for MVP, but important for production maturity. Phase 1-3 focus on online-first.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip timezone handling, assume all users in PST | Faster development (no timezone library) | Wrong "Open Now" results for non-PST users; silent failure mode | Never — Nevada County attracts tourists from worldwide |
| Fetch hours for all 687 assets on page load | Simple implementation (one fetch call) | Rate limit violations; slow page load; high API costs | Never — use viewport-based fetching |
| Store Places API data in localStorage indefinitely | Eliminates repeat API calls | Violates Google ToS; risks API key revocation | Never — cache with 30-day max TTL |
| Manual event entry in data.json with no validation | No event aggregation complexity | Typos, wrong dates, stale events; unmaintainable | Acceptable for MVP (Phase 2) with <20 events; must move to validated system for scale |
| Copy-paste filter logic between Leaflet and MapLibre | Fast feature parity | Code drift; maintenance nightmare; bugs in one version only | Never — extract shared modules upfront |
| Client-side-only implementation (no backend proxy) | Zero infrastructure; static site simplicity | API rate limits; CORS issues; can't implement request queuing | Acceptable for MVP (<1000 concurrent users); must add proxy for production scale |
| Hardcode Nevada County timezone (America/Los_Angeles) instead of using Time Zone API | No API calls; faster | Breaks if venues added outside county; rigid | Acceptable for Phase 1 (cultural assets are county-scoped) |
| Use `fields=*` during development | Faster prototyping; don't need to look up field names | 10x higher API costs; easy to forget to fix before production | Acceptable in dev only; MUST add field masking before production |
| No marker clustering for 687 markers | Simpler implementation; no plugin dependency | Mobile performance collapse; high bounce rate | Never — clustering is essential for >200 markers on mobile |
| Skip service worker (online-only map) | Zero PWA complexity; faster initial development | Unusable in rural areas; no offline resilience | Acceptable for Phase 1-3 MVP; must add for Phase 4 production |
| No event deduplication (single source only) | Simple aggregation pipeline | Duplicates if adding second source; hard to retrofit | Acceptable for Phase 2 (Eventbrite only); must add before Phase 3 multi-source |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Places API | Using `openNow: true` parameter alone for "Open Now" filter | Use `openNow: false` to get all places, then use `openNow: true` to get open places, merge responses with open status flag. The single call doesn't return closed venues. |
| Google Places API | Requesting all fields (`fields=*`) for each venue | Use field masking: only request needed fields (`fields=place_id,opening_hours,formatted_address`). Reduces latency and costs significantly (can save 70-90% on API costs). |
| Google Time Zone API | Fetching timezone for each venue on every page load | Fetch timezone once per venue, store in `data.json` as permanent property. Timezone doesn't change. Pre-compute for all 687 assets during data pipeline step. |
| Places API autocomplete | Starting autocomplete session on first keystroke | Trigger after 3+ characters typed. Each session costs money; reduces wasted suggestions. Debounce input by 300ms to avoid rapid firing. |
| Event APIs (Eventbrite, Google Calendar) | Assuming event objects have consistent schema | Normalize event data immediately after fetch: map different APIs to unified schema before storing. Use TypeScript interfaces to enforce consistency. |
| localStorage caching | Not checking cache size limits (5-10MB) | Monitor localStorage usage; implement LRU eviction; fallback to memory cache if quota exceeded. Use IndexedDB for larger datasets (hours for 687 assets). |
| Leaflet.markercluster plugin | Adding markers individually in loop: `markers.addLayer(marker)` | Batch add markers: `markers.addLayers(markerArray)`. Individual adds cause cluster recalculation each time (O(n²)). Batch is O(n). |
| MapLibre clustering | Assuming cluster click auto-zooms to children | Must implement click handler manually: `map.on('click', 'clusters', (e) => { ... zoomToClusterChildren ... })`. Not automatic like Leaflet plugin. |
| Service worker caching | Caching API responses with dynamic query params | Cache by URL without query params for API endpoints, or use Cache API `ignoreSearch: true` option. Prevents cache fragmentation. |
| Vercel deployment | Using environment variables for API keys in static site | Static sites can't access build-time env vars at runtime. Use Vercel Edge Functions or accept client-side keys with restrictions. |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching hours for all 687 assets on page load | Slow initial load (5-10s); high bounce rate; API quota errors | Viewport-based fetching: only fetch hours for markers in current map bounds + small buffer (~50 markers at a time) | >100 markers with external API calls |
| No request throttling for rapid filter changes | "Open Now" filter toggles trigger 50+ API requests simultaneously | Debounce filter changes (300ms); cancel in-flight requests on new filter; queue requests with max concurrency limit (5 concurrent) | When users toggle filters rapidly |
| Storing all 687 assets + hours + events in single data structure | Sluggish UI; slow filtering; memory bloat on mobile | Separate data layers: static assets in `data.json`, hours in sessionStorage keyed by place_id, events in separate structure; lazy-load hours/events only when needed | >500 assets with real-time data |
| Client-side date/time parsing in tight loops | Lag when filtering 687 events by date range | Parse dates once on load, store as timestamp; comparison is cheap integer math | >200 events with date filtering |
| Re-rendering all markers on filter change | Map lags, animation stutters | Update marker visibility/style in-place (Leaflet: `setStyle`, MapLibre: `setFilter`); don't recreate marker objects | >300 markers with frequent filtering |
| No marker clustering on mobile | Browser crashes, 70%+ bounce rate on mobile | Implement clustering from day one; use more aggressive clustering on mobile (larger clusterRadius) | >200 markers on mobile devices |
| Fetching basemap tiles on every page load | Slow map rendering; wasted bandwidth | Cache basemap tiles with service worker; set appropriate Cache-Control headers; use tile URL with version for cache busting | All users, especially mobile/rural |
| localStorage for hours data (687 assets x 7 days/week) | QuotaExceededError, data loss | Use IndexedDB for structured data (larger capacity, ~50MB vs ~5MB). Fall back to memory cache if storage unavailable. | >100 assets with detailed hours |
| No pagination for event list | Slow rendering; infinite scroll lag | Paginate events (30-50 per page); virtualize list if >200 items; lazy-render event cards as they scroll into view | >100 events in list view |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| API key with no HTTP referrer restrictions | Key stolen, used for attacker's projects, $10k+ bill | Apply HTTP referrer whitelist immediately: `*.vercel.app/*`, `culturalmap.com/*`. Test restrictions before production. |
| Storing user-submitted event data without sanitization | XSS attacks via event titles/descriptions | Sanitize all user input: escape HTML entities, strip script tags, validate URLs before rendering. Use DOMPurify library. |
| No CORS protection on API proxy (if added) | Anyone can call your proxy, burn through your API quota | Implement origin checking, rate limiting per IP, authentication for write operations. |
| Caching authentication tokens in service worker | Tokens exposed to other origins via service worker scope | Never cache authenticated API responses in service worker. Use memory-only cache for sensitive data. |
| Exposing internal place_id mapping | Scrapers can correlate your curated data with Google's data | Obfuscate place_ids: hash or encrypt in client-side code, decode before API calls. Deters casual scraping. |
| No rate limiting on client-side API calls | Malicious script in browser console exhausts quota in minutes | Implement client-side rate limiter: max 10 req/minute per user session. Won't stop determined attackers but raises the bar. |
| User-submitted event URLs without validation | Phishing links, malware distribution | Validate event/venue URLs: must be HTTPS, match known domain patterns, check against safe browsing API before publishing. |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| "Open Now" shows zero results outside business hours (8pm) | Dead-end experience; users can't discover venues | Show all venues, visually dim closed ones; allow toggling "Open Now" filter; show next opening time on closed markers |
| No visual distinction between "has hours data" vs "hours unknown" | Users assume venue is closed when data just isn't available | Use distinct marker states: green = open now, grey = closed, hollow = hours unknown; add tooltip explanation |
| Events disappear immediately after event time | Events at 7pm vanish at 7:01pm while event is still ongoing | Keep events visible for duration + buffer (e.g., 3-hour concert shows until 10:30pm if starts at 7pm) |
| Stale data with no freshness indicator | Users don't know if "Events Today" is current or week-old | Add "Updated 2 hours ago" badge; show manual refresh button; display loading state during refresh |
| "Open Now" filter uses user's timezone, not venue timezone | Wrong results for tourists browsing from different timezone | Always calculate open/closed in venue's timezone (Nevada County = PST/PDT); display times in venue's local time |
| Overwhelming event density on map (50+ event markers) | Cluttered, unusable map | Use marker clustering for events; expand cluster on click to reveal individual events; consider "Events" as separate map layer user can toggle |
| No fallback when API fails | Blank spaces where hours should be; confusing empty state | Graceful degradation: show "Hours unavailable" with link to venue website; log error for debugging; maintain cached hours as fallback |
| "Loading..." spinners block entire map | Users can't interact with map while hours loading | Progressive loading: show map + markers immediately, load hours asynchronously, update markers as data arrives |
| Mobile filter UI overlays map content | Users can't see search results, must close filter to view map | Use bottom sheet for filters on mobile; semi-transparent overlay; quick filter pills above map instead of full panel |
| No "Clear filters" action | Users set multiple filters, confused why no results, can't reset easily | Prominent "Clear all filters" button; show active filter pills with X to remove individually; display result count "Showing 47 of 687" |
| Event detail panel shows only title + date | Users can't decide if event is worth attending without more context | Include: high-quality image, full description, ticket price/link, venue name + map marker, duration, category tags, "Add to Calendar" button |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **"Open Now" filter:** Works but doesn't handle 24-hour venues, venues with irregular hours ("By Appointment"), or venues missing hours data — verify all edge cases have UI states
- [ ] **Hours display:** Shows "9am-5pm" but doesn't indicate timezone — verify timezone is explicit ("9am-5pm PST") or obvious from context
- [ ] **Events Today:** Filters by date but doesn't account for timezone (midnight cutoff) — verify event date boundaries use venue timezone, not UTC
- [ ] **API caching:** Uses localStorage but no expiry logic — verify TTL timestamps exist and are checked before serving cached data
- [ ] **Rate limit handling:** Fetches data but no retry logic for 429 errors — verify exponential backoff is implemented and tested
- [ ] **Dual map sync:** Feature works in Leaflet but untested in MapLibre — verify EVERY feature in BOTH map versions before commit
- [ ] **Event deduplication:** Aggregates from multiple sources but doesn't dedupe — verify same event from different APIs appears only once
- [ ] **Error states:** API fails silently, no user feedback — verify loading states, error messages, retry buttons are implemented
- [ ] **Mobile performance:** Works on desktop but lags on mobile — verify throttling/debouncing, lazy loading, clustering on mobile devices
- [ ] **Accessibility:** Visual-only indicators for open/closed — verify screen reader announcements, ARIA labels, keyboard navigation
- [ ] **API key restrictions:** Key works but has no referrer restrictions — verify HTTP referrer whitelist applied before deploying to production
- [ ] **Field masking:** API calls work but using `fields=*` — verify field masking specifies only needed fields, check billing tier
- [ ] **Marker clustering:** Shows all markers but no clustering — verify clustering plugin installed and configured for >200 markers
- [ ] **Event expiry:** Events display but past events accumulate — verify automatic filtering of events where `date < now`
- [ ] **Timezone handling:** Hours parse correctly in PST but fails for users in other timezones — verify Luxon/date-fns-tz integration, test from EST
- [ ] **Offline fallback:** Map works online but blank offline — verify service worker registered, cache strategy defined, offline UI implemented
- [ ] **Stale data indicator:** Shows cached data but no timestamp — verify "Updated [time] ago" badge displays cache age
- [ ] **Input sanitization:** User-submitted events work but no XSS protection — verify HTML escaping, script tag stripping, URL validation

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| API key revoked (caching violation) | HIGH | Create new Google Cloud project; obtain new API key; update all deployed versions; audit caching code; add 30-day TTL enforcement; document policy in code comments; wait 24-48hrs for reactivation if appealing |
| Rate limits exceeded in production | MEDIUM | Add server-side proxy with request queue immediately (can deploy in 1-2 hours); implement viewport-based fetching; reduce concurrent request limit; consider upgrading API tier if sustained traffic |
| Timezone bugs causing wrong "Open Now" results | MEDIUM | Hotfix: hardcode "America/Los_Angeles" for all Nevada County venues (immediate fix); Long-term: integrate Time Zone API and Luxon library (1-2 days); Test with VPN in different timezones before redeploying |
| Stale event data eroding trust | LOW | Implement immediate automatic expiry (filter events where date < now); add "Report Issue" button to each event card; email event organizers to verify/update listings; display freshness timestamp |
| Code drift between Leaflet/MapLibre versions | HIGH | Audit both versions, identify divergence; extract shared modules (1-2 days refactor); establish testing checklist; no new features until parity restored |
| Performance degradation (too many API calls) | LOW | Add aggressive viewport-based filtering; implement request debouncing (300ms); enable caching with TTL; profile with Chrome DevTools to identify bottleneck |
| Exposed API key abuse | HIGH | Rotate key immediately (create new, delete old); apply HTTP referrer restrictions; set billing cap; investigate unusual usage patterns; consider Vercel Edge Functions proxy |
| Field masking neglect (high costs) | LOW | Audit all API calls, add field masking (1-2 hours); deploy hotfix; monitor next billing cycle to verify cost reduction; document required fields in code |
| Mobile performance collapse | MEDIUM | Add marker clustering plugin (3-4 hours implementation); test on real mobile device; reduce marker complexity (simpler icons); implement viewport culling if clustering insufficient |
| Event duplication (multi-source) | MEDIUM | Implement deduplication algorithm (6-8 hours); run batch deduplication on existing events; add unique event_id generation; create manual review queue for ambiguous matches |
| Offline mode missing (PWA gap) | HIGH | Implement service worker from scratch (2-3 days); define cache strategies; test offline scenarios; deploy as progressive enhancement (doesn't break existing users) |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| API caching violations | Phase 1 (Hours integration) | Test cache expiry by setting TTL to 1 minute, verify data refetches; Review Google ToS compliance in code comments |
| Rate limit exhaustion | Phase 1 (Hours integration) | Load test with 10 concurrent users toggling filters; Verify 429 errors trigger retry with backoff; Monitor API quota in Google Cloud Console |
| Timezone parsing errors | Phase 1 (Hours integration) | Test with browser timezone set to EST, MST, HST; Verify "Open Now" filter matches timezone-aware calculation; Test during DST transition dates |
| Stale event data | Phase 2 (Events integration) | Manually set event date to yesterday, verify it doesn't appear in "Events Today"; Check freshness indicator updates on page reload |
| Code duplication (dual map) | Phase 1 (Hours integration) | Extract shared modules before implementing hours; Test same feature in both maps; Code review to verify no copy-paste |
| Client-side performance | Phase 1 (Hours integration) | Profile page load with 687 markers; Verify viewport filtering limits concurrent API calls to <50; Test on mobile device |
| Exposed API keys | Phase 1 (Hours integration) | Apply HTTP referrer restrictions before deploying API key; Test restrictions work (API calls from other domains fail) |
| Field masking neglect | Phase 1 (Hours integration) | Review API calls in Network tab, verify field parameter present; Check Google Cloud billing SKU is "Basic" not "Advanced" |
| Mobile performance collapse | Phase 1 (Hours integration) | Test on iPhone SE and Android 2GB RAM device; Verify marker clustering active; Check PageSpeed Insights mobile score >70 |
| Event deduplication | Phase 3 (Multi-source events) | Manually create duplicate events from two sources with slightly different titles; Verify single merged event appears |
| Offline mode neglect | Phase 4 (PWA/Offline) | Test with DevTools Network → Offline; Verify service worker caches assets; Check basic map interactions work without network |
| Missing error states | Phase 1, 2 (Every feature) | Simulate API failure (offline mode); Verify loading states, error messages, retry buttons; Test screen reader announcements |

---

## Additional Domain-Specific Warnings

### Irregular Hours Complexity

Cultural venues have unique hours patterns that standard parsing can't handle:

- **Seasonal variations:** "Open May-October only" (North Star House as museum)
- **Event-dependent hours:** "Open during performances only" (theaters)
- **By appointment:** "Call ahead" (galleries)
- **Volunteer-run:** Hours may not be reliable even when listed

**Mitigation:** Add `hours_type` field: `'regular' | 'seasonal' | 'by_appointment' | 'event_only' | 'call_ahead'`. Don't attempt automated "Open Now" for non-regular types. Show appropriate messaging: "By appointment only - call ahead" instead of "Closed."

### Cultural Asset Trust Requirements

Cultural maps have higher trust requirements than restaurant maps. Wrong hours = frustrated tourists who drove 30 minutes. Wrong events = missed once-a-year performances.

**Mitigation:**
- Add "Verify hours before visiting" disclaimer on detail panel
- Link to venue website/phone prominently (more trustworthy than aggregated data)
- Show last verified date for hours data ("Hours verified: Jan 15, 2026")
- Prioritize manual curation over automated aggregation for critical venues (landmarks, museums)
- Build relationship with venues: email to confirm hours quarterly

### Static Site Constraints

Deploying to Vercel as static site limits options:

- No server-side caching layer (can't share cache across users)
- No request queuing/throttling at server (must do client-side)
- No backend for API key security (client-side keys are visible)
- No server-side rendering for SEO/performance (all rendering is client-side)
- No real-time data push (must poll for event updates)

**Mitigation:**
- Accept client-side API keys are visible (use API key restrictions: HTTP referrer whitelist)
- Implement aggressive client-side caching within ToS limits (30-day TTL)
- Consider Vercel Edge Functions for API proxy if scaling issues arise (defer to Phase 4)
- Use Vercel Edge Config for server-side data that updates infrequently (hours data for 687 assets)
- Accept polling-based freshness (check for event updates every 6 hours, not real-time)

### Rural Connectivity Reality

Nevada County has inconsistent mobile coverage, especially in rural/mountain areas:

- Grass Valley, Nevada City: Good coverage
- Highway 20 West, 49 North: Spotty 3G/4G
- Remote venues (wineries, hiking trails): Often no signal

**Mitigation:**
- Prioritize offline mode (Phase 4) as production requirement, not nice-to-have
- Pre-cache basemap tiles for entire county during service worker install
- Store all 687 core assets in IndexedDB (accessible offline)
- Test in Airplane Mode regularly during development
- Consider downloadable "offline pack" feature (user can pre-download before road trip)

### Volunteer-Maintained Data Quality

Many cultural venues are volunteer-run with outdated online info:

- Website may not reflect current hours
- Google Places data may be years old
- Phone number disconnected or wrong
- Seasonal closures not reflected online

**Mitigation:**
- Build direct relationships with venue contacts (email list for updates)
- Quarterly verification campaign: email all venues "Please confirm hours"
- Prominent "Report Issue" button (users help keep data current)
- Community contribution model: allow venue owners to claim/update their listing
- Flag venues with "Hours not verified in 6+ months" warning

### Event Aggregation Complexity Underestimation

Event aggregation is 5-10x more complex than business hours:

- **Hours:** mostly static, 7-day cycle, predictable patterns
- **Events:** one-time occurrences, frequent changes, cancellations, complex schema, multi-source conflicts

**Mitigation:**
- Phase 2: Start with single manual-curated source (lowest complexity)
- Phase 2.5: Add single automated source (Eventbrite only)
- Phase 3: Multi-source aggregation with deduplication (highest complexity)
- Don't underestimate: budget 2-3x time for event features vs hours features
- Consider event aggregation as separate product from cultural map (could be standalone)

---

## Sources

### Google Places API & Rate Limits
- [Places API Usage and Billing | Google for Developers](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [Google Places API limits (and how to overcome them easily)](https://blog.apify.com/google-places-api-limits/)
- [Policies and attributions for Places API](https://developers.google.com/maps/documentation/places/web-service/policies)
- [How to Handle API Rate Limits Gracefully (2026 Guide)](https://apistatuscheck.com/blog/how-to-handle-api-rate-limits)
- [Optimizing Web Service Usage | Google Maps Platform](https://developers.google.com/maps/optimize-web-services)
- [Choose fields to return | Places API | Google for Developers](https://developers.google.com/maps/documentation/places/web-service/choose-fields)
- [Manage Google Maps Platform costs | Pricing and Billing | Google for Developers](https://developers.google.com/maps/billing-and-pricing/manage-costs)

### Timezone & Business Hours Parsing
- [Best Practices Using Time Zone API Web Services | Google for Developers](https://developers.google.com/maps/documentation/timezone/web-service-best-practices)
- [Falsehoods programmers believe about time](https://gist.github.com/timvisee/fcda9bbdff88d45cc9061606b4b923ca)
- [UTC is Enough for Everyone, Right?](https://zachholman.com/talk/utc-is-enough-for-everyone-right)

### Event Data Management & Freshness
- [Why Data Freshness Matters: 5 Real-World Use Cases [2026]](https://tacnode.io/post/data-freshness-use-cases)
- [From Data To Decisions: UX Strategies For Real-Time Dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/)
- [Event Deduplication in Meta Ads: Fix Double Counting](https://medium.com/@agrowthagen/event-deduplication-in-meta-ads-fix-double-counting-8d795478b2a1)
- [What is data freshness? Definition, examples, and best practices](https://www.metaplane.dev/blog/data-freshness-definition-examples)
- [Event Deduplication | Mixpanel Developer Docs](https://developer.mixpanel.com/reference/event-deduplication)
- [How to Implement Deduplication Strategies in Microservices](https://oneuptime.com/blog/post/2026-01-30-microservices-deduplication-strategies/view)

### Leaflet/MapLibre Performance & Architecture
- [Optimizing Leaflet Performance with a Large Number of Markers | Medium](https://medium.com/@silvajohnny777/optimizing-leaflet-performance-with-a-large-number-of-markers-0dea18c2ec99)
- [Optimising MapLibre Performance: Tips for Large GeoJSON Datasets](https://maplibre.org/maplibre-gl-js/docs/guides/large-data/)
- [Progressively enhancing maps | by Jeremy Keith | Medium](https://adactio.medium.com/progressively-enhancing-maps-07778db5946f)
- [GitHub - Leaflet/Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
- [Clustering with MapLibre GL JS - Stadia Maps Documentation](https://docs.stadiamaps.com/tutorials/clustering-styling-points-with-maplibre/)
- [Leaflet migration guide - MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/guides/leaflet-migration-guide/)

### Caching & API Best Practices
- [Google Maps API Response Caching for Speed and Cost](https://www.lunar.dev/flows/google-maps-api)

### Security & API Keys
- [Google Maps Platform security guidance | Google for Developers](https://developers.google.com/maps/api-security-best-practices)
- [Best practices for managing API keys | Google Cloud Documentation](https://docs.cloud.google.com/docs/authentication/api-keys-best-practices)
- [API Key Security Best Practices for 2026 - DEV Community](https://dev.to/alixd/api-key-security-best-practices-for-2026-1n5d)
- [REST API Security Best Practices (2026) | Complete Guide](https://www.levo.ai/resources/blogs/rest-api-security-best-practices)

### Progressive Web Apps & Offline Mode
- [Offline and background operation - Progressive web apps | MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [Caching - Progressive web apps | MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching)
- [PWA Offline Functionality: Caching Strategies Checklist](https://www.zeepalm.com/blog/pwa-offline-functionality-caching-strategies-checklist)
- [How to make a PWA work offline](https://progressier.com/pwa-capabilities/how-to-make-a-pwa-work-offline)

---

*Pitfalls research for: Real-time discovery features (business hours, events) on cultural asset maps*
*Researched: 2026-02-08*
*Confidence: HIGH (verified with official Google documentation, multiple authoritative sources, and real-world implementation patterns)*
