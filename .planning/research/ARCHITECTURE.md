# Architecture Research: Real-Time Discovery Features in Web Maps

**Domain:** Client-side web mapping with dynamic data (hours, events)
**Researched:** 2026-02-07
**Confidence:** HIGH

## Standard Architecture

Real-time discovery features in web maps typically follow a **three-layer architecture**: data layer, API integration layer, and UI/rendering layer. For static sites with cron jobs (like this project), a **pre-fetch + client-side render** pattern is standard.

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    UI/Rendering Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Leaflet │  │ MapLibre│  │ Marker  │  │ Detail  │        │
│  │  Map    │  │   Map   │  │Renderer │  │ Panel   │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                     Data Management Layer                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │   Data Store (fetch JSON → in-memory cache)         │    │
│  │   - data.json (assets)                               │    │
│  │   - hours.json (Google Places API results)          │    │
│  │   - events.json (event calendar API results)        │    │
│  │   - experiences.json (curated trails)               │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    API Integration Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Google   │  │  Event   │  │  GitHub  │                   │
│  │ Places   │  │ Calendar │  │  Actions │                   │
│  │   API    │  │   API    │  │  (Cron)  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Map Renderer | Display geographic data with markers and interactivity | Leaflet 1.9.4 or MapLibre GL JS 4.5.0 via CDN |
| Data Store | Load, cache, and provide access to JSON data | `fetch()` on page load → in-memory JS objects |
| Marker Renderer | Convert data objects to map markers with styling | Map API's marker/layer methods with category-based styling |
| Detail Panel | Show asset details (name, hours, events, links) | Vanilla JS DOM manipulation, slide-in panel |
| Filter System | Toggle markers by category or experience | Array filtering + map layer visibility toggling |
| Hours Provider | Supply current hours status (Open/Closed) | Pre-fetched `hours.json` + client-side logic |
| Events Provider | Supply upcoming events for each asset | Pre-fetched `events.json` + date filtering in browser |
| Cron Orchestrator | Schedule API fetches to update JSON files | GitHub Actions scheduled workflow or Vercel Cron |

## Recommended Project Structure

For vanilla JS, no-build architecture (already in use):

```
website/cultural-map-redesign/
├── index.html                  # Leaflet version (fallback)
├── index-maplibre.html         # MapLibre version (flagship)
├── data.json                   # Base asset data (687 features)
├── hours.json                  # NEW: Google Places hours data
├── events.json                 # NEW: Event calendar data
├── experiences.json            # Curated trails (existing)
├── image_data.json             # Asset images (existing)
├── img/                        # Static assets
├── .github/workflows/
│   ├── fetch-hours.yml         # NEW: Cron job for Places API
│   └── fetch-events.yml        # NEW: Cron job for events API
└── scripts/
    ├── fetch-hours.js          # NEW: Node script for Places API
    └── fetch-events.js         # NEW: Node script for events API
```

### Structure Rationale

- **Single HTML files:** No build system. Everything (HTML/CSS/JS) in one file per variant. This project already uses this pattern successfully.
- **Static JSON data files:** Pre-fetched API results served as static assets. Client-side code just reads these files.
- **Cron scripts in `/scripts/`:** Node.js scripts run by GitHub Actions (or Vercel Cron). Write results to JSON files, commit back to repo.
- **Dual map support:** Separate HTML files for Leaflet and MapLibre. Share the same JSON data files.

## Data Flow

### Initial Page Load

```
User visits page
    ↓
HTML loads (inline CSS/JS)
    ↓
Parallel fetch() calls for JSON files
    ├─ data.json (base assets)
    ├─ hours.json (NEW - Places API cache)
    ├─ events.json (NEW - event calendar cache)
    ├─ experiences.json (curated trails)
    └─ image_data.json (asset images)
    ↓
Parse JSON → in-memory JS objects
    ↓
Initialize map (Leaflet or MapLibre)
    ↓
Render markers (color-coded by category)
    ↓
Attach event listeners (click → detail panel)
```

### Displaying Hours/Events

```
User clicks marker
    ↓
Look up asset by name in data.json
    ↓
Look up hours in hours.json (by place_id or name)
    ↓
Look up events in events.json (by asset name)
    ↓
Calculate "Open Now" status (client-side time logic)
    ↓
Filter events to "upcoming" (client-side date logic)
    ↓
Render detail panel with:
    - Asset info (name, description, address)
    - Hours (Open/Closed, hours list)
    - Upcoming events (date, title, link)
    - Google Maps link
```

### Data Update Flow (Cron)

```
GitHub Actions scheduled trigger (daily 6am PT)
    ↓
Run fetch-hours.js
    ├─ Read data.json (get list of assets)
    ├─ For each asset with address:
    │   ├─ Query Google Places API (Text Search)
    │   ├─ Get place_id
    │   ├─ Query Place Details (hours only)
    │   └─ Rate limit delay (avoid quota errors)
    ↓
Write hours.json
    {
      "asset_name": {
        "place_id": "ChIJ...",
        "hours": ["Monday: 9:00 AM – 5:00 PM", ...],
        "updated": "2026-02-07T14:00:00Z"
      }
    }
    ↓
Commit hours.json to repo
    ↓
Vercel auto-deploys (static file updated)
    ↓
Next user gets fresh hours data
```

## Architectural Patterns

### Pattern 1: Pre-Fetch + Client-Side Render

**What:** API calls happen server-side (cron job), results stored as static JSON. Client just reads JSON and renders.

**When to use:**
- Static site hosting (Vercel, Netlify, GitHub Pages)
- Rate-limited APIs (Google Places)
- Data that changes slowly (hours, events)

**Trade-offs:**
- PRO: No API keys in client code
- PRO: Fast page load (no API latency)
- PRO: Works offline after initial load
- PRO: Avoids rate limit issues from many users
- CON: Data slightly stale (updated on cron schedule, not real-time)
- CON: Requires CI/CD setup (GitHub Actions or Vercel Cron)

**Example:**
```javascript
// Client-side code (simplified)
async function loadData() {
  const [assets, hours, events] = await Promise.all([
    fetch('data.json').then(r => r.json()),
    fetch('hours.json').then(r => r.json()),
    fetch('events.json').then(r => r.json())
  ]);

  return { assets, hours, events };
}

function isOpenNow(hoursData) {
  const now = new Date();
  const dayIndex = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hourString = hoursData.hours[dayIndex]; // "Monday: 9:00 AM – 5:00 PM"

  // Parse hourString, compare to now.getHours()
  // Return true/false
}
```

### Pattern 2: Dual Map API Support via Abstraction

**What:** Write data layer once, render with either Leaflet or MapLibre. Abstract marker creation behind a common interface.

**When to use:**
- Supporting legacy browsers (Leaflet fallback)
- Comparing map libraries (A/B testing)
- Progressive enhancement (Leaflet → MapLibre)

**Trade-offs:**
- PRO: One data pipeline serves both maps
- PRO: Users choose preferred renderer
- CON: Must maintain two HTML files
- CON: Marker API differences require abstraction

**Example:**
```javascript
// Shared data loading logic (both files)
const assets = await fetch('data.json').then(r => r.json());

// Leaflet-specific rendering (index.html)
assets.forEach(asset => {
  L.circleMarker([asset.y, asset.x], {
    color: CATS[asset.l].color,
    radius: 8
  })
  .bindPopup(asset.n)
  .addTo(map);
});

// MapLibre-specific rendering (index-maplibre.html)
map.addSource('assets', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: assets.map(asset => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [asset.x, asset.y] },
      properties: { name: asset.n, layer: asset.l }
    }))
  }
});

map.addLayer({
  id: 'asset-markers',
  type: 'circle',
  source: 'assets',
  paint: {
    'circle-color': ['get', ['get', 'layer'], ['literal', CATS_COLORS]],
    'circle-radius': 8
  }
});
```

### Pattern 3: place_id as Stable Identifier

**What:** Google Places API's `place_id` is exempt from caching restrictions and never changes. Store it once, reuse forever.

**When to use:** Any time you're fetching Google Places data.

**Trade-offs:**
- PRO: Exempt from caching restrictions (can store indefinitely)
- PRO: Stable across API versions
- PRO: Reduces API calls (one-time lookup, then use place_id)
- CON: Initial lookup requires Text Search (separate API call)

**Example:**
```javascript
// Step 1: Initial lookup (do this once in cron job)
const searchResponse = await fetch(
  `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(assetName + ' ' + assetAddress)}&key=${API_KEY}`
);
const searchData = await searchResponse.json();
const placeId = searchData.results[0]?.place_id;

// Step 2: Store place_id in hours.json
hoursData[assetName] = {
  place_id: placeId,
  last_fetched: new Date().toISOString()
};

// Step 3: Future fetches use place_id directly
const detailsResponse = await fetch(
  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours&key=${API_KEY}`
);
```

### Pattern 4: Progressive Disclosure (Base Data + Enrichment)

**What:** Load base asset data immediately, enrich with hours/events data as available. Don't block rendering on enrichment.

**When to use:** When enrichment data is optional or slow to load.

**Trade-offs:**
- PRO: Fast initial render (map shows immediately)
- PRO: Graceful degradation (hours missing? Show asset anyway)
- CON: Two rendering passes (base, then enriched)

**Example:**
```javascript
// Render base data immediately
const assets = await fetch('data.json').then(r => r.json());
renderMarkers(assets);

// Enrich with hours/events (non-blocking)
Promise.all([
  fetch('hours.json').then(r => r.json()).catch(() => ({})),
  fetch('events.json').then(r => r.json()).catch(() => ({}))
]).then(([hours, events]) => {
  enrichAssets(assets, hours, events);
  updateMarkers(assets); // Re-render with enriched data
});
```

## Anti-Patterns

### Anti-Pattern 1: Client-Side API Calls with Exposed Keys

**What people do:** Put Google Places API key directly in client-side JavaScript, make API calls from browser.

**Why it's wrong:**
- API key visible in page source (anyone can steal it)
- Rate limits apply per key (one bad user exhausts quota for everyone)
- Google Places API has strict usage policies against client-side caching
- Every user's page load triggers API calls (expensive, slow)

**Do this instead:** Use cron job to fetch data server-side, store results as static JSON. Client reads JSON (no API key needed).

### Anti-Pattern 2: Synchronous fetch() Blocking Render

**What people do:**
```javascript
const data = await fetch('data.json').then(r => r.json());
const hours = await fetch('hours.json').then(r => r.json());
const events = await fetch('events.json').then(r => r.json());
// Map doesn't render until all three complete sequentially
```

**Why it's wrong:** Sequential fetches delay rendering. If one file is slow, everything blocks.

**Do this instead:** Use `Promise.all()` for parallel fetches:
```javascript
const [data, hours, events] = await Promise.all([
  fetch('data.json').then(r => r.json()),
  fetch('hours.json').then(r => r.json()),
  fetch('events.json').then(r => r.json())
]);
```

### Anti-Pattern 3: Storing Large Data in localStorage

**What people do:** Fetch hours.json, cache entire file in `localStorage` for "performance."

**Why it's wrong:**
- localStorage is synchronous (blocks main thread on read/write)
- 5-10MB limit (easy to hit with 687 assets)
- Harder to invalidate cache when data updates
- Unnecessary for static files (browser HTTP cache already handles this)

**Do this instead:** Let the browser cache JSON files via HTTP headers. Vercel sets `Cache-Control` automatically for static files. Re-fetch on page load (fast due to HTTP cache).

### Anti-Pattern 4: Tight Coupling Between Data and UI

**What people do:** Inline hours/events logic directly in marker click handlers, hardcode API response structure throughout codebase.

**Why it's wrong:**
- Hard to change data source (e.g., switch from Google Places to Yelp)
- Hard to test (UI and data logic intertwined)
- Hard to reuse (Leaflet and MapLibre versions duplicate logic)

**Do this instead:** Create data access layer:
```javascript
// Data layer (reusable)
const AssetData = {
  getHours(assetName) {
    return hoursCache[assetName] || null;
  },

  getEvents(assetName) {
    return (eventsCache[assetName] || [])
      .filter(e => new Date(e.date) > new Date());
  },

  isOpenNow(assetName) {
    const hours = this.getHours(assetName);
    if (!hours) return null;
    // Calculate open/closed status
    return calculateOpenStatus(hours);
  }
};

// UI layer (map-specific)
marker.on('click', () => {
  const hours = AssetData.getHours(asset.n);
  const events = AssetData.getEvents(asset.n);
  const openNow = AssetData.isOpenNow(asset.n);
  renderDetailPanel({ asset, hours, events, openNow });
});
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Places API | Server-side fetch (cron) → JSON file | Rate limited: 500 QPM default. Use exponential backoff. |
| Event Calendar API | Server-side fetch (cron) → JSON file | Depends on event source (Google Calendar, Eventbrite, etc.) |
| MapTiler | Client-side tile loading | API key in URL, OK for client (tiles are public). |
| Vercel | Static file hosting + auto-deploy | Deploys on push to `master`. Edge caching for JSON files. |
| GitHub Actions | Cron orchestrator | Schedule: `0 6 * * *` (daily 6am PT). Requires `GOOGLE_PLACES_API_KEY` secret. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Data layer ↔ Cron scripts | File I/O (write JSON) | Cron writes JSON, commits to repo. Vercel deploys. |
| Data layer ↔ Client code | HTTP fetch (read JSON) | Client fetches JSON on page load. |
| Map renderer ↔ Data layer | Function calls (in-memory) | After JSON loaded, pure JavaScript object access. |
| Leaflet ↔ MapLibre | Separate implementations | No shared code (different HTML files). Same JSON data. |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k assets | Current architecture is perfect. Single JSON file, in-memory rendering. |
| 1k-10k assets | Consider IndexedDB for client-side storage. Paginate marker rendering (viewport-based culling). |
| 10k+ assets | Move to tile-based rendering (vector tiles). Pre-compute hours/events aggregations. Consider CDN with edge caching. |

### Scaling Priorities

1. **First bottleneck: Google Places API quota**
   - **Symptom:** Cron job fails with `OVER_QUERY_LIMIT` errors
   - **Fix:** Batch requests with exponential backoff delays. Rate limit to 400 QPM (safety margin). Consider upgrading quota.
   - **Mitigation:** Only fetch hours for assets that need it (have address, are open to public). Skip residential/private sites.

2. **Second bottleneck: Client-side marker rendering**
   - **Symptom:** Page slow to load with many markers (1000+)
   - **Fix:**
     - Use viewport culling (only render markers in view)
     - Use marker clustering (group nearby markers)
     - Use vector tiles (render server-side, stream to client)
   - **For Leaflet:** Use `Leaflet.markercluster` plugin
   - **For MapLibre:** Use native clustering with `cluster: true` on GeoJSON source

3. **Third bottleneck: JSON file size**
   - **Symptom:** Slow page load, high bandwidth usage
   - **Fix:**
     - Split JSON by category (fetch only visible categories)
     - Use gzip compression (Vercel does this automatically)
     - Use binary format (Protocol Buffers, FlatBuffers) instead of JSON

## Build Order Recommendations

Based on component dependencies, suggested implementation order:

### Phase 1: Hours Data Pipeline (Foundation)

**Why first:** Hours are simpler than events (single API, well-documented). Establishes the cron → JSON → client pattern.

1. Create `scripts/fetch-hours.js` (Node.js script)
   - Read `data.json` to get asset list
   - For each asset with address:
     - Text Search → get `place_id`
     - Place Details → get `opening_hours`
     - Rate limit delay (1 second between requests)
   - Write `hours.json`

2. Create `.github/workflows/fetch-hours.yml`
   - Schedule: daily 6am PT
   - Run `node scripts/fetch-hours.js`
   - Commit `hours.json` if changed
   - Requires `GOOGLE_PLACES_API_KEY` secret

3. Test locally:
   - Run script manually
   - Verify `hours.json` format
   - Check for API errors

### Phase 2: Hours UI (Leaflet version)

**Why next:** Validate the data pipeline works before adding complexity (MapLibre, events).

1. Update `index.html` (Leaflet version)
   - Add `fetch('hours.json')` to page load
   - Create `getHoursForAsset(name)` function
   - Create `isOpenNow(hours)` function
   - Update detail panel HTML to show hours
   - Style "Open Now" badge (green) / "Closed" badge (red)

2. Test with real data:
   - Deploy to Vercel
   - Wait for cron to run (or trigger manually)
   - Verify hours appear in detail panel

### Phase 3: Events Data Pipeline (Parallel to Hours)

**Why parallel:** Events are independent of hours. Can develop simultaneously.

1. Choose event data source
   - Option A: Google Calendar API (if Arts Council has public calendar)
   - Option B: Eventbrite API (if venues use Eventbrite)
   - Option C: Scrape venue websites (fragile, not recommended)

2. Create `scripts/fetch-events.js`
   - Query event API for each asset
   - Filter to upcoming events only
   - Write `events.json`:
     ```json
     {
       "Empire Mine": [
         {
           "title": "Gold Rush Days",
           "date": "2026-08-15",
           "time": "10:00 AM",
           "link": "https://..."
         }
       ]
     }
     ```

3. Create `.github/workflows/fetch-events.yml`
   - Schedule: daily 6am PT (same time as hours)
   - Run `node scripts/fetch-events.js`
   - Commit `events.json` if changed

### Phase 4: Events UI (Leaflet version)

1. Update `index.html`
   - Add `fetch('events.json')` to page load
   - Create `getEventsForAsset(name)` function
   - Filter to upcoming events only (client-side date logic)
   - Update detail panel HTML to show events list
   - Add "Add to Calendar" button (generate .ics file)

### Phase 5: Port to MapLibre

**Why last:** Leaflet version is the fallback. Get it working first, then port.

1. Update `index-maplibre.html`
   - Copy hours/events logic from Leaflet version
   - Adapt to MapLibre's event system (`map.on('click', 'asset-markers', ...)`)
   - Test feature parity

### Phase 6: Polish

1. Error handling
   - Graceful degradation if `hours.json` or `events.json` missing
   - Show "Hours unavailable" instead of crashing

2. Loading states
   - Show skeleton UI while fetching JSON files
   - Show "Loading hours..." in detail panel

3. Monitoring
   - Add Sentry or LogRocket for error tracking
   - Monitor cron job success/failure (GitHub Actions logs)

## Client-Side vs Server-Side Concerns

### Client-Side Responsibilities

- Fetch JSON files (data, hours, events, experiences)
- Parse JSON into JavaScript objects
- Render map with markers
- Handle user interactions (click, filter, search)
- Calculate "Open Now" status (based on pre-fetched hours + current time)
- Filter events to "upcoming" (based on pre-fetched events + current date)
- Render detail panel with enriched data
- Handle responsive layout (mobile, tablet, desktop)

### Server-Side Responsibilities (Cron)

- Fetch data from external APIs (Google Places, event calendar)
- Handle API authentication (keep keys secret)
- Rate limiting and retry logic (exponential backoff)
- Data transformation (API response → simplified JSON format)
- Write JSON files to repository
- Commit changes (only if data changed)
- Trigger Vercel deployment (automatic on push)

### Why This Split?

**Security:** API keys never exposed in client code. Google Places API key stays in GitHub Secrets.

**Performance:** Client loads fast (no API latency). Pre-fetched data served as static files from CDN.

**Cost:** One cron job per day = minimal API usage. If client-side, every user triggers API calls.

**Reliability:** API failures isolated to cron job. Client always gets data (even if slightly stale).

**Offline capability:** After initial load, map works offline (data already fetched).

## Data Freshness Trade-offs

| Update Frequency | API Calls/Day | Data Staleness | Cost | Use Case |
|------------------|---------------|----------------|------|----------|
| Real-time (client-side) | 687 assets × N users | 0 seconds | HIGH | Not suitable (API key exposure, quota limits) |
| Hourly (cron) | 24 × 687 = 16,488 | 0-60 min | MEDIUM | Acceptable for events, overkill for hours |
| Daily (cron) | 1 × 687 = 687 | 0-24 hours | LOW | **Recommended** for hours (businesses rarely change hours) |
| Weekly (cron) | 0.14 × 687 = 96 | 0-7 days | VERY LOW | Acceptable for static data (addresses, descriptions) |

**Recommendation:** Daily cron at 6am PT (before business hours). Hours/events fresh by 9am when users visit.

## Caching Strategy

### HTTP Caching (Automatic via Vercel)

Vercel sets these headers for static files:
- `Cache-Control: public, max-age=0, must-revalidate` (for HTML)
- `Cache-Control: public, max-age=31536000, immutable` (for versioned assets)

For JSON files, Vercel uses:
- `Cache-Control: public, max-age=0, must-revalidate`

This means:
- Browser checks for updates on every page load
- If file unchanged (304 Not Modified), uses cached version (fast)
- If file changed, downloads new version (slow first time, then cached)

**No client-side caching needed.** Browser HTTP cache handles this automatically.

### API Response Caching (Server-Side)

Google Places API allows caching `place_id` indefinitely. Other data (hours, reviews) can be cached up to 30 days per Terms of Service.

**Strategy:**
1. First fetch: Text Search → store `place_id` in `hours.json`
2. Subsequent fetches: Use `place_id` directly (skip Text Search)
3. Update hours daily (within 30-day policy)
4. If API call fails, keep stale data (don't delete `hours.json`)

**Example `hours.json` structure:**
```json
{
  "Empire Mine": {
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "hours": [
      "Sunday: Closed",
      "Monday: 9:00 AM – 5:00 PM",
      "Tuesday: 9:00 AM – 5:00 PM",
      "Wednesday: 9:00 AM – 5:00 PM",
      "Thursday: 9:00 AM – 5:00 PM",
      "Friday: 9:00 AM – 5:00 PM",
      "Saturday: 10:00 AM – 4:00 PM"
    ],
    "fetched": "2026-02-07T14:00:00Z"
  }
}
```

## Error Handling Patterns

### Client-Side Error Handling

```javascript
// Graceful degradation for missing hours/events data
async function loadEnrichmentData() {
  try {
    const hours = await fetch('hours.json').then(r => {
      if (!r.ok) throw new Error('Hours unavailable');
      return r.json();
    });
    return { hours, hoursAvailable: true };
  } catch (err) {
    console.warn('Hours data unavailable:', err);
    return { hours: {}, hoursAvailable: false };
  }
}

// UI handles missing data gracefully
function renderHours(asset, hoursData) {
  if (!hoursData[asset.n]) {
    return '<p class="hours-unavailable">Hours not available</p>';
  }

  const openNow = isOpenNow(hoursData[asset.n]);
  return `
    <div class="hours">
      <span class="status ${openNow ? 'open' : 'closed'}">
        ${openNow ? 'Open Now' : 'Closed'}
      </span>
      <ul>${hoursData[asset.n].hours.map(h => `<li>${h}</li>`).join('')}</ul>
    </div>
  `;
}
```

### Server-Side Error Handling (Cron)

```javascript
// Exponential backoff for API rate limits
async function fetchWithRetry(url, maxRetries = 3) {
  let delay = 1000; // Start with 1 second

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);

      if (response.status === 429) { // Rate limit
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      console.error(`Attempt ${i + 1} failed:`, err);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

// Keep stale data on failure (don't delete hours.json)
async function updateHoursData() {
  let existingData = {};
  try {
    existingData = JSON.parse(fs.readFileSync('hours.json', 'utf8'));
  } catch (err) {
    console.log('No existing hours data');
  }

  const newData = { ...existingData }; // Start with existing data

  for (const asset of assets) {
    try {
      const hours = await fetchPlaceHours(asset);
      newData[asset.n] = hours;
    } catch (err) {
      console.error(`Failed to fetch hours for ${asset.n}:`, err);
      // Keep existing data for this asset (don't overwrite)
    }
  }

  fs.writeFileSync('hours.json', JSON.stringify(newData, null, 2));
}
```

## Sources

**HIGH Confidence (Official Documentation):**
- [Best Practices Using Places API Web Services | Google for Developers](https://developers.google.com/maps/documentation/places/web-service/web-services-best-practices)
- [Leaflet Documentation](https://leafletjs.com/reference.html) via Context7 `/websites/leafletjs`
- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js/docs/) via Context7 `/websites/maplibre_maplibre-gl-js`
- [Client-side storage - Learn web development | MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage)
- [IndexedDB API - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

**MEDIUM Confidence (Recent Articles, Multiple Sources):**
- [Why Developers Are Ditching Frameworks for Vanilla JavaScript - The New Stack](https://thenewstack.io/why-developers-are-ditching-frameworks-for-vanilla-javascript/)
- [How to Handle API Rate Limits Gracefully (2026 Guide) | API Status Check Blog](https://apistatuscheck.com/blog/how-to-handle-api-rate-limits)
- [Modern Web Storage Guide: Local Storage vs IndexedDB vs Cache API Compared](https://jsschools.com/web_dev/modern-web-storage-guide-local-storage-vs-indexed/)
- [Calendar API for integrated scheduling applications | Cronofy Scheduling](https://www.cronofy.com/developer/calendar-api)

**Project-Specific Context:**
- Existing architecture in `index-maplibre.html` (single-file, vanilla JS, fetch-based data loading)
- Current data structures: `data.json`, `experiences.json`, `image_data.json`
- Deployment: Vercel static hosting with auto-deploy on push

---
*Architecture research for: Real-time discovery features in client-side web maps*
*Researched: 2026-02-07*
