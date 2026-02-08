# Technology Stack Research

**Project:** Nevada County Arts Council Cultural Map - "Happening Now" Features
**Domain:** Real-time discovery features for interactive web maps (business hours, event calendars)
**Researched:** 2026-02-08
**Confidence:** HIGH

## Executive Summary

For adding "Happening Now" features to the cultural map, the recommended stack uses:

- **Day.js (1.11.x)** for date/time handling (2KB, replaces deprecated Moment.js)
- **opening_hours.js (3.x)** for business hours parsing (battle-tested, handles all edge cases)
- **Google Places API** for hours data (server-side daily fetch via GitHub Actions)
- **Google Calendar API v3** for events data (server-side hourly fetch via GitHub Actions)
- **GitHub Actions** for automation (free for public repos, runs cron jobs)
- **Vercel** for hosting (already deployed, auto-deploys on push)

**Key architecture:** Fetch data server-side → write JSON → commit → auto-deploy → client reads JSON and calculates "is open now" instantly.

This approach avoids exposing API keys, stays within free tiers, and provides instant performance for visitors.

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla JavaScript | ES2020+ | Client-side logic | No build system required, works in all modern browsers, matches existing codebase |
| Leaflet | 1.9.4 | Map rendering (fallback) | Already in use, lightweight (42KB), mobile-friendly, excellent plugin ecosystem |
| MapLibre GL JS | 4.5.0 | Map rendering (flagship) | Already in use, 3D terrain support, WebGL performance, MIT license (Mapbox fork) |
| Node.js | 20.x LTS | Cron scripts | GitHub Actions default (v6 uses Node 20), native fetch() support, no bundler needed |

### External APIs
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Google Places API | v1 (New) | Business hours data | Most comprehensive hours database, 500 QPM free tier, place_id cacheable indefinitely. Structured `opening_hours` object with `periods` array. |
| Google Calendar API | v3 | Event data | OAuth 2.0 via service accounts, RESTful, JSON responses, built-in filtering with `timeMin`/`timeMax`. Free tier: 1M queries/day. |

### Infrastructure
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| GitHub Actions | - | Cron orchestration | Free for public repos, integrated with repo, handles secrets securely. 2,000 minutes/month free tier. |
| actions/checkout | v6 | Checkout repo in workflow | Latest version with improved credential security. Requires Actions Runner v2.329.0+. |
| actions/setup-node | v6 | Install Node.js in workflow | Latest version with auto-caching for npm. Use `node-version: 20` (LTS). |
| Vercel | - | Static hosting + auto-deploy | Already in use, edge CDN, auto-deploys on push, zero config for static sites. 100 deploys/day free tier. |

### Supporting Libraries (CRITICAL)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Day.js** | 1.11.x | Date/time manipulation and timezone handling | **ALWAYS include.** 2KB size (vs 60KB Moment.js), immutable API, excellent plugin ecosystem. Works via CDN without build system. Industry standard for vanilla JS projects in 2025. |
| **Day.js UTC plugin** | (bundled) | UTC conversion for API requests | **ALWAYS include.** Google Places returns hours in local venue time; you need UTC normalization for consistent comparisons. |
| **Day.js Timezone plugin** | (bundled) | Timezone conversion and display | **ALWAYS include.** Nevada County is Pacific Time; visitors may be in other zones. Handles DST automatically. |
| **Day.js customParseFormat** | (bundled) | Parse custom time formats from APIs | Include when normalizing Google Calendar or Eventbrite event times that don't follow ISO 8601. |
| **opening_hours.js** | 3.x | Business hours parsing and "is open now" logic | **CRITICAL.** Battle-tested library originally built for OpenStreetMap. Handles complex rules (holidays, seasons, variable times, overnight shifts). Has prebuilt browser bundle for no-build environments. Superior to rolling your own hours logic. |
| **@googleapis/calendar** | 8.x | Node.js client for Calendar API | Use in GitHub Actions scripts for server-side Calendar API calls. Not needed for client-side (use fetch directly). Requires Node 18+. |
| Eventbrite API | v3 | Optional event source for ticketed events | Only if venues use Eventbrite for ticket sales. Venue-centric endpoints. OAuth token via GitHub Secrets. 1,000 requests/hour free tier. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Moment.js** | Deprecated since 2020. 60KB size. Mutable API causes bugs. Project in maintenance mode. | Day.js (2KB, immutable, same API) |
| **Client-side API calls to Google Places** | Exposes API key in client code. Rate limits apply per key, not per user. 687 venues × visitors = quota exhaustion in hours. | GitHub Actions cron → fetch hours → write JSON → commit → deploy |
| **Custom regex parsing of hours** | Business hours have edge cases (holidays, "open 24h", overnight shifts, seasonal hours, DST) that you'll miss. | opening_hours.js library (handles all edge cases) |
| **Browser geolocation for timezone** | Unreliable. Doesn't match venue timezone (visitor may be remote). DST edge cases. | Day.js timezone plugin with 'America/Los_Angeles' IANA timezone |
| **`new Date()` for time comparisons** | JavaScript Date is notoriously buggy with timezones. Mutable. No DST handling. | Day.js immutable API with timezone plugin |
| **Embedding Google Calendar iframe** | Not map-friendly. Can't filter by venue or style events. Requires users to scroll a separate widget. | Fetch Calendar API → normalize to JSON → render as map markers/popups |

## Installation

### Client-Side (CDN - No Build System)

```html
<!-- Already in use -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/maplibre-gl@4.5.0/dist/maplibre-gl.js"></script>

<!-- Day.js with plugins (REQUIRED for hours feature) -->
<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11/dayjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11/plugin/utc.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11/plugin/timezone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11/plugin/customParseFormat.js"></script>
<script>
  dayjs.extend(dayjs_plugin_utc);
  dayjs.extend(dayjs_plugin_timezone);
  dayjs.extend(dayjs_plugin_customParseFormat);
</script>

<!-- opening_hours.js (REQUIRED for hours feature) -->
<script src="https://openingh.openstreetmap.de/opening_hours.js/opening_hours+deps.min.js"></script>
```

### Server-Side (GitHub Actions Scripts)

```bash
# Option 1: Zero dependencies (for hours-only)
# Use native Node 20 fetch(), no npm install needed

# Option 2: With Calendar API client (if implementing events)
cd scripts/
npm init -y
npm install @googleapis/calendar --save-dev
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Date library | **Day.js** | Moment.js | Moment.js deprecated since 2020. 60KB vs 2KB. Mutable API causes bugs. |
| Date library | **Day.js** | date-fns | date-fns good for build systems. Day.js CDN simpler for no-build projects (single 2KB file vs multiple imports). |
| Date library | **Day.js** | Luxon | Luxon is 17KB, overkill. Use only if you need complex business day calculations. |
| Hours parsing | **opening_hours.js** | Custom regex | NEVER roll your own. Holidays, overnight shifts, seasonal hours, DST are complex. |
| Hours API | Google Places | Yelp Fusion | Yelp has fewer rural POIs, more restrictive caching, requires OAuth |
| Event Calendar | Google Calendar | Eventbrite only | Use Calendar for venues managing own calendars. Eventbrite supplementary. |
| Cron | GitHub Actions | Vercel Cron | Vercel Cron requires Pro plan ($20/mo). GitHub Actions free. |

## Architecture Patterns

### Pattern 1: "Is this venue open right now?"

**Client-side calculation (recommended):**

```javascript
// 1. GitHub Actions fetches hours daily (6am PT)
// 2. Stores normalized rules in data/hours.json
//    { "North Star House": { "rule": "Mo-Fr 10:00-16:00; Sa 10:00-14:00" } }

// 3. Client loads hours.json
const hoursData = await fetch('data/hours.json').then(r => r.json());

// 4. Check if open
const venue = hoursData['North Star House'];
const oh = new opening_hours(venue.rule);
const isOpen = oh.getState(new Date()); // true/false
const nextChange = oh.getNextChange(new Date()); // Date or undefined

// 5. Update UI
marker.setStyle({
  fillColor: isOpen ? '#2ecc71' : '#e74c3c'
});

// 6. Refresh every 60 seconds
setInterval(() => {
  const isOpen = oh.getState(new Date());
  marker.setStyle({ fillColor: isOpen ? '#2ecc71' : '#e74c3c' });
}, 60000);
```

**Why:** Hours rarely change (daily fetch sufficient). Calculation is instant. No API calls during browsing.

### Pattern 2: "What events are happening today?"

**Server-side fetch (recommended):**

```javascript
// GitHub Actions cron (hourly: 7,37 * * * *)
const todayStart = dayjs.tz('America/Los_Angeles').startOf('day').toISOString();
const todayEnd = dayjs.tz('America/Los_Angeles').endOf('day').toISOString();

const response = await calendar.events.list({
  auth: auth,
  calendarId: 'venue@calendar.google.com',
  timeMin: todayStart,
  timeMax: todayEnd,
  singleEvents: true,
  orderBy: 'startTime'
});

// Normalize and write
const events = response.data.items.map(event => ({
  venue_id: 'North Star House',
  title: event.summary,
  start: event.start.dateTime,
  end: event.end.dateTime,
  url: event.htmlLink
}));

fs.writeFileSync('data/events-today.json', JSON.stringify(events));
// Commit → Vercel redeploys
```

**Why:** Calendar API requires auth (can't expose). "Today" defined server-side. Pre-built JSON is instant for visitors.

### Pattern 3: Combined "Happening Now" Filter

```javascript
// Client-side intersection
const isOpen = openingHoursCheck(venue);
const hasEvent = eventsToday.some(e => e.venue_id === venue.id);
const happeningNow = isOpen && hasEvent;

// Filter map markers
markers.forEach(marker => {
  const visible = !happeningNowFilter || marker.venue.happeningNow;
  marker.setOpacity(visible ? 1 : 0.3);
});
```

## API Quotas & Rate Limits

| API | Free Tier | Usage Estimate | Strategy |
|-----|-----------|----------------|----------|
| Google Places | $200/mo credit (28,500 requests) | 687 daily = 20,600/mo | Well under limit. Cache hours in JSON. |
| Google Calendar | 1M queries/day | 240 queries/day (10 venues × 24 hours) | Negligible. Use service account. |
| GitHub Actions | 2,000 minutes/mo | ~750 minutes/mo (daily + hourly cron) | Safe. 5min/workflow × 25 runs/day. |
| Vercel | 100 deploys/day | 25 deploys/day (1 daily + 24 hourly) | Safe. Auto-deploy on commit. |

**Rate limiting (Places API):**
```javascript
// Add delay between requests to stay under 500 QPM
const DELAY_MS = 150; // 400 QPM with safety margin

for (const venue of venues) {
  await fetchPlaceDetails(venue);
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
}
```

## Version Compatibility

| Library A | Library B | Notes |
|-----------|-----------|-------|
| Day.js 1.11.x | opening_hours.js 3.x | Pass Day.js to opening_hours via `.toDate()`. opening_hours expects native Date. |
| Day.js | Leaflet 1.9.x / MapLibre 4.x | No conflicts. Day.js is pure JS, map libraries don't touch dates. |
| @googleapis/calendar 8.x | Node.js 20.x | Requires Node 18+. GitHub Actions ubuntu-latest uses Node 20 LTS. |
| Google Places API (New) | Google Maps JS API v3 | Places (New) is current. Use `Place.fetchFields()`. Ignore "(Legacy)" docs. |

## GitHub Actions Schedule

```yaml
# .github/workflows/fetch-hours.yml
on:
  schedule:
    - cron: '0 14 * * *'  # 6am PT = 2pm UTC
  workflow_dispatch:      # Manual trigger for testing

# .github/workflows/fetch-events.yml
on:
  schedule:
    - cron: '7,37 * * * *'  # Every 30min at :07 and :37
  workflow_dispatch:
```

**Why these times:**
- **6am PT (hours):** Before business hours, after API rate limit resets, low GitHub load
- **:07 and :37 (events):** Avoid top-of-hour congestion, 30min refresh keeps events current

## Sources

**HIGH Confidence:**
- Day.js API: Context7 via mcp-client (2026-02-08)
- Day.js version: https://github.com/iamkun/dayjs/releases
- opening_hours.js: https://github.com/opening-hours/opening_hours.js (WebFetch 2026-02-08)
- Google Places fields: https://developers.google.com/maps/documentation/javascript/place-data-fields
- GitHub Actions checkout v6: https://github.com/actions/checkout
- GitHub Actions setup-node v6: https://github.com/actions/setup-node

**MEDIUM Confidence:**
- Business hours patterns: Perplexity (2026-02-08) + opening_hours.js docs
- Event calendar patterns: Perplexity (2026-02-08) + Google Calendar API docs
- GitHub Actions cron patterns: Perplexity (2026-02-08) + GitHub docs

---

**Critical Decisions:**

1. **Day.js, not Moment.js** — Moment deprecated, 30x larger
2. **opening_hours.js, not custom parsing** — Edge cases are complex
3. **Server-side fetch, client-side calculation** — API keys stay secret, performance is instant
4. **GitHub Actions, not Vercel Cron** — Free vs $20/mo
5. **Daily hours, hourly events** — Matches data volatility and user expectations

This stack supports 687 venues with "Happening Now" features on zero server infrastructure.

---
*Researched: 2026-02-08*
*Confidence: HIGH*
