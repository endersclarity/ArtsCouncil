# Phase 6: Analytics Foundation - Research

**Researched:** 2026-02-15 (updated from 2026-02-16 draft)
**Domain:** Privacy-first web analytics, custom event tracking, UTM attribution
**Confidence:** HIGH

## Summary

Phase 6 instruments all user interactions on the cultural map with Umami Cloud (free Hobby tier). The implementation requires: (1) an Umami Cloud account and tracking script, (2) a provider-agnostic `CulturalMapAnalytics` IIFE module matching the existing `window.CulturalMap*` namespace pattern, (3) UTM-tagged outbound links with `exploregvnc` source for venue referral proof, (4) a dedup throttle to prevent event floods from rapid filter toggling, and (5) a shared dashboard URL for 2-3 committee members.

The codebase already contains a detailed analytics architecture blueprint at `docs/analysis/analytics-architecture-options.md` including a complete `CulturalMapAnalytics` module skeleton with provider adapters, throttle logic, event taxonomy, integration points, and estimated monthly event volumes. That blueprint was designed for Plausible but the module is provider-agnostic by design -- switching the adapter from `plausible` to `umami` is a one-line change. The Umami `track()` API (`umami.track(name, data)`) is nearly identical to the Plausible API pattern.

Umami Cloud Hobby tier provides 100K events/month with 6-month data retention and up to 3 sites. Based on estimated traffic (3,400-14,300 total monthly events from the architecture doc Appendix B), this fits comfortably. The Share URL feature enables committee dashboard access without requiring Umami accounts.

**Primary recommendation:** Build `index-maplibre-analytics.js` as the wrapper module, wire the Umami provider adapter, add the Umami script tag, instrument 13 interaction types across existing modules, UTM-tag all outbound website and Maps links, and configure a shared dashboard URL with Goals for key conversions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Analytics provider:** Umami Cloud (free Hobby plan) -- 0$/mo, 100k events/mo, up to 3 sites, 6-month data retention
- Cookieless, GDPR/CCPA compliant by design -- no consent banner needed
- Script loads on every page, always (no opt-in required)
- Initial site: `cultural-map-redesign-stitch-lab.vercel.app` (can swap domains freely later)
- Sign up at umami.is, create site, get tracking script snippet
- Track zero-result searches as a flagged event (`zero_results: true` property) -- demand signal for unmet content
- Chat interactions stay in Supabase only -- no redundant tracking in Umami (Supabase already logs session, query, intent, assets)
- UTM source: `exploregvnc` -- this is what shows up in venues' Google Analytics as referral source
- Very important to committee -- "we sent you 47 visitors last month" is a key selling point
- Committee members (2-3 people: Kaelen, Diana, possibly Eliza) need dashboard access

### Claude's Discretion
- Event naming convention (flat vs grouped by feature area)
- Event taxonomy structure (how to organize 12+ interaction types)
- UTM campaign naming strategy
- Which outbound action types to track
- Dashboard detail level for committee view
- Provider-agnostic analytics module design (wrapper pattern)
- Dedup throttle implementation (500ms or similar)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Umami Cloud | Hobby (free) | Page views, custom events, UTM capture, shared dashboards | Cookieless, <2KB script, GDPR compliant, no consent banner, free tier covers estimated traffic |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A (vanilla JS IIFE) | -- | `CulturalMapAnalytics` wrapper module | Always -- matches existing codebase `window.CulturalMap*` namespace pattern |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Umami Cloud | Plausible ($14/mo) | Better email reports, lighter script (<1KB vs <2KB), but costs $14-19/mo |
| Umami Cloud | PostHog (free tier) | 1M events/mo but 95KB SDK, massive overkill for this project |
| Custom wrapper | Direct `umami.track()` calls everywhere | Wrapper enables provider swap, throttle, debug mode -- worth the abstraction |

**Installation:** No npm. Single `<script>` tag in `<head>`:
```html
<script defer src="https://cloud.umami.is/script.js" data-website-id="YOUR_WEBSITE_ID"></script>
```

## Architecture Patterns

### Recommended Module Structure
```
website/cultural-map-redesign/
  index-maplibre-analytics.js      # NEW -- CulturalMapAnalytics IIFE wrapper
  index-maplibre-bindings.js       # MODIFY -- add tracking calls at interaction points
  index-maplibre-detail-view.js    # MODIFY -- UTM-tag outbound links in buildDetailMetaHTML()
  index-maplibre-detail-controller.js  # MODIFY -- track detail:open
  index-maplibre-explore-controller.js # MODIFY -- track search queries + zero results
  index-maplibre-experience-controller.js  # MODIFY -- track experience:start
  index-maplibre-filter-ui.js      # NO change needed (filter-ui builds UI; tracking goes in bindings/controllers)
  index-maplibre.js                # MODIFY -- init analytics, track deep link arrivals
  index-maplibre-hero-intent-stitch-frontend-design-pass.html  # MODIFY -- add script tags
```

### Pattern 1: Provider-Agnostic Analytics Wrapper
**What:** A single IIFE module that wraps `umami.track()` behind a generic `CulturalMapAnalytics.track(name, data)` API. All other modules call the wrapper, never Umami directly.
**When to use:** Always -- every tracking call goes through this module.
**Why:** Swapping analytics providers later requires changing one file, not 10+. Centralizes dedup throttle and debug logging.
**Source:** Blueprint exists in `docs/analysis/analytics-architecture-options.md` Section 2.

```javascript
// Source: Umami docs + existing architecture blueprint
(function() {
  'use strict';

  var PROVIDER = 'umami'; // 'umami' | 'debug'
  var DEBUG = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var THROTTLE_MS = 500;
  var _lastEvents = {};

  var providers = {
    umami: function(name, props) {
      if (typeof window.umami !== 'undefined' && typeof window.umami.track === 'function') {
        window.umami.track(name, props);
      }
    },
    debug: function(name, props) {
      // log only, never send
    }
  };

  function track(name, props) {
    if (!name) return;
    props = props || {};

    // Throttle: skip if same event name+props fired within THROTTLE_MS
    var key = name + '|' + JSON.stringify(props);
    var now = Date.now();
    if (_lastEvents[key] && (now - _lastEvents[key]) < THROTTLE_MS) {
      return;
    }
    _lastEvents[key] = now;

    if (DEBUG) {
      console.log('[Analytics]', name, props);
    }

    var send = providers[PROVIDER] || providers.debug;
    try {
      send(name, props);
    } catch (err) {
      if (DEBUG) console.warn('[Analytics] Provider error:', err);
    }
  }

  function tagOutboundUrl(url, campaign) {
    if (!url) return url;
    var sep = url.indexOf('?') === -1 ? '?' : '&';
    return url + sep +
      'utm_source=exploregvnc' +
      '&utm_medium=map' +
      '&utm_campaign=' + encodeURIComponent(campaign || 'general');
  }

  function init() {
    // Delegated outbound click tracking
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      var assetEl = link.closest('[data-asset-name]');
      var venue = assetEl ? assetEl.dataset.assetName : '';

      if (href.startsWith('tel:')) {
        track('Outbound Click', { asset: venue, type: 'phone' });
      } else if (href.includes('google.com/maps')) {
        track('Outbound Click', { asset: venue, type: 'directions' });
      } else if (href.match(/^https?:\/\//) && !href.includes(location.hostname)) {
        track('Outbound Click', {
          asset: venue,
          type: 'website',
          url: href.substring(0, 200)
        });
      }
    });

    if (DEBUG) {
      console.log('[Analytics] Initialized. Provider:', PROVIDER);
    }
  }

  window.CulturalMapAnalytics = {
    track: track,
    tagOutboundUrl: tagOutboundUrl,
    init: init
  };
})();
```

### Pattern 2: UTM-Tagged Outbound Links
**What:** Rewrite venue website/Maps URLs in the detail panel to include `?utm_source=exploregvnc&utm_medium=map&utm_campaign={context}` before the user clicks.
**When to use:** All outbound links in the detail view (website, Google Maps). Phone links (`tel:`) cannot carry UTM params.

**UTM campaign naming (Claude's discretion recommendation):** Use context-based campaign names:

| Context | `utm_campaign` Value |
|---------|---------------------|
| Detail panel website link | `detail-panel` |
| Detail panel Google Maps link | `detail-directions` |
| Experience stop click-through | `experience-stop` |
| Event card link | `event-card` |
| Search result link | `search-result` |
| Itinerary stop link | `itinerary` |

This gives venues granular data: "23 visits from detail-panel, 8 from experience-stop."

### Pattern 3: Delegated Click Listener for Outbound Tracking
**What:** A single `document.addEventListener('click', ...)` in the analytics `init()` that intercepts all outbound link clicks and fires events. No need to add listeners per-link.
**When to use:** Instead of attaching individual click handlers to every outbound link.
**Why:** Outbound links are generated dynamically by `buildDetailMetaHTML()`. Delegation catches them all.
**Note:** Umami uses `navigator.sendBeacon` internally -- fire-and-forget. Do NOT use `e.preventDefault()` + callback patterns. Just fire the event and let the click proceed naturally.

### Pattern 4: Asset Name on Detail Panel for Tracking Context
**What:** Add a `data-asset-name` attribute to the detail panel container so delegated click handlers can identify which venue's outbound link was clicked.
**When to use:** When opening the detail panel, set `detailPanel.dataset.assetName = asset.n`.
**Why:** The delegated click handler needs to know which venue the outbound link belongs to without traversing complex DOM.

### Anti-Patterns to Avoid
- **Scattering raw `umami.track()` calls:** Creates vendor lock-in and makes dedup impossible. Always go through the wrapper.
- **Tracking in view modules:** Views (`*-view.js`) are pure HTML generators. Track in controllers and bindings, not views.
- **Tracking every mouse event:** 100K events/mo budget. Track meaningful interactions only (clicks, toggles, searches, outbound). Do NOT track: scroll depth, hover, tooltip display, map pan/zoom.
- **Duplicate chat tracking:** Chat already logs to Supabase (`chat_logs` table). Do NOT also fire Umami events for chat queries.
- **Tracking PII in event data:** Never include email, phone, or full names in event properties. Use asset names and category names only.
- **Blocking navigation for tracking:** Do NOT use `e.preventDefault()` + callback patterns for outbound links. Umami's sendBeacon is fire-and-forget.
- **Over-throttling with name-only keys:** The 500ms throttle MUST use event name + props as the key, not just event name. Otherwise clicking two different category pills within 500ms loses the second event.

## Event Taxonomy (Claude's Discretion Recommendation)

### Naming Convention: Title Case, Flat
Use short, Title Case event names that read well in the Umami Events dashboard. Properties carry the detail.

**Rationale:** Flat names are easier to scan in Umami's UI, easier to set up as Goals, and don't require special parsing. Each unique name becomes a row in the dashboard. The architecture blueprint uses Title Case (`Category Filter`, `Marker Click`) and this is the convention used in Umami's own documentation examples.

### Complete Event Taxonomy (13 events)

| # | Event Name | Properties | Trigger Point | Module to Modify |
|---|------------|-----------|---------------|-----------------|
| 1 | `Category Filter` | `category`, `action` (enable/disable) | Category pill click | `bindings.js` or main controller |
| 2 | `Category Clear` | -- | "All" pill or clear button | `bindings.js` |
| 3 | `Open Now Toggle` | `enabled` (true/false) | Open Now pill toggle | `bindings.js` |
| 4 | `Events Toggle` | `enabled` (true/false) | Events 14d pill toggle | `bindings.js` |
| 5 | `Marker Click` | `asset`, `category`, `city` | Map marker click | `asset-interactions.js` or main |
| 6 | `Detail Open` | `asset`, `category`, `source` (marker/list/deeplink/event/experience) | Detail panel opens | `detail-controller.js` |
| 7 | `Experience Start` | `experience`, `type` (route/corridor) | Experience card activation | `experience-controller.js` |
| 8 | `Event Click` | `event_title`, `venue`, `source` (carousel/list/search) | Event card click | `bindings.js` |
| 9 | `Search` | `query`, `results`, `zero_results` (true/false) | Search input (debounced 1500ms) | `explore-controller.js` or `bindings.js` |
| 10 | `Editorial Expand` | `title`, `section` | MUSE editorial card expand | `bindings.js` or page-level |
| 11 | `Outbound Click` | `asset`, `type` (website/phone/directions), `url` | Website/phone/Maps clicks | Analytics `init()` delegated listener |
| 12 | `Deep Link Arrival` | `type` (place/experience/event/itinerary), `id` | URL deep link landing | `index-maplibre.js` |
| 13 | `Itinerary View` | `itinerary`, `day` | Itinerary section view | `itinerary-controller.js` |

### Aggregate vs Venue-Level Data
- **Aggregate demand signals:** `Category Filter`, `Open Now Toggle`, `Events Toggle`, `Search`, `Experience Start` -- show what visitors care about
- **Venue-level referral proof:** `Outbound Click` with `asset` property -- shows "we sent venue X this many visitors"
- Both are critical. The `asset` property on `Outbound Click` events enables filtering by venue in the Umami dashboard.

### Zero-Result Search Tracking
Per user requirement, zero-result searches are tracked as `Search` events with `zero_results: true`. These can be filtered in Umami's Events > Properties tab. Optionally, set up a Goal for "Search where zero_results = true" to see the conversion rate (% of searchers who get zero results = unmet demand).

## Umami API Constraints (Verified from Docs)

These constraints govern how event data is structured:

| Constraint | Limit | Source |
|-----------|-------|--------|
| Event name length | 50 characters max | umami.is/docs/track-events |
| String property value | 500 characters max | umami.is/docs/tracker-functions |
| Number precision | 4 decimal places max | umami.is/docs/tracker-functions |
| Object properties | 50 keys max | umami.is/docs/tracker-functions |
| Arrays | Converted to strings, 500 char max | umami.is/docs/tracker-functions |
| Event data without name | Not allowed | umami.is/docs/track-events |

**Implication:** All 13 event names in the taxonomy are under 50 chars (longest: `Deep Link Arrival` = 18 chars). Property values should be truncated: `query.substring(0, 100)`, `url.substring(0, 200)`, `asset.substring(0, 100)`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Page view tracking | Custom pageview counter | Umami auto-tracking (default behavior) | Automatically tracks pageviews, referrers, devices, browsers, countries, screen sizes |
| Session identification | Custom session ID generation | Umami's built-in hash (IP+UA+hostname) | Cookieless session detection, no PII stored |
| UTM parameter parsing | Custom URL param parser | Umami's built-in UTM analysis | Automatically captures all 5 UTM params and shows in UTM report view |
| Bot filtering | Custom User-Agent checks | Umami's built-in bot detection | Filters known bots automatically |
| Geo/device detection | Custom detection scripts | Umami's automatic detection | Captures country, region, city, browser, OS, device type |
| Dashboard | Custom admin panel | Umami Cloud dashboard + Share URL | Built-in filterable views, Goals, zero development effort |
| Consent banner | Cookie consent library | Nothing -- Umami is cookieless | No cookies = no GDPR consent needed |

**Key insight:** Umami auto-tracking handles all standard web analytics. Custom work is ONLY: (1) the wrapper module with throttle, (2) custom event calls at interaction points, and (3) UTM-tagging outbound links.

## Common Pitfalls

### Pitfall 1: Script Load Race Condition
**What goes wrong:** `umami.track()` called before the Umami script finishes loading, causing silent failures.
**Why it happens:** The Umami script loads with `defer`. The analytics module also loads with a `<script>` tag. Timing depends on browser.
**How to avoid:** The wrapper guards with `if (typeof window.umami !== 'undefined' && typeof window.umami.track === 'function')`. If Umami isn't loaded yet, events silently drop. This is acceptable -- the first few ms of interaction events may be lost, but pageviews (auto-tracked after Umami loads) always fire.
**Warning signs:** Events not appearing for interactions that happen immediately on page load (e.g., deep link arrival tracking).

### Pitfall 2: Event Name Length Limit (50 chars)
**What goes wrong:** Event names silently truncated or rejected.
**Why it happens:** Umami enforces a 50-character limit on event names.
**How to avoid:** All 13 event names in the taxonomy are well under 50 chars. Use properties for detail, not the event name.
**Warning signs:** Events with truncated names in dashboard.

### Pitfall 3: Throttle Key Collision
**What goes wrong:** Legitimate rapid interactions (clicking two different category pills quickly) get deduplicated.
**Why it happens:** If throttle key is just event name, all category changes within 500ms collapse to one.
**How to avoid:** Use `name + '|' + JSON.stringify(props)` as the throttle key. `Category Filter|{"category":"Galleries"}` and `Category Filter|{"category":"Trails"}` are distinct keys.
**Warning signs:** Missing events when user rapidly interacts with different elements of the same type.

### Pitfall 4: UTM Parameters Breaking Venue URLs
**What goes wrong:** Some venue websites have fragile URL parsing. Adding `?utm_source=...` to a URL that already has query params can break.
**Why it happens:** Naive `?` concatenation instead of checking for existing `?`.
**How to avoid:** Use the `url.indexOf('?') === -1 ? '?' : '&'` separator check. Test with a few real venue URLs from data.json.
**Warning signs:** Venues reporting broken links from the cultural map.

### Pitfall 5: UTM on Internal Links
**What goes wrong:** UTM parameters accidentally added to internal navigation links, polluting referral data.
**Why it happens:** Blanket "add UTM to all links" approach.
**How to avoid:** Only UTM-tag links where `href` starts with `http` AND does NOT include `location.hostname`. Phone (`tel:`) links cannot carry UTM.
**Warning signs:** Umami showing `exploregvnc` as a referrer source for the map itself.

### Pitfall 6: Ad Blockers Blocking Umami Script
**What goes wrong:** Privacy-focused users with ad blockers block the Umami script, losing those visitors from analytics.
**Why it happens:** `cloud.umami.is/script.js` appears on some blocklists.
**How to avoid:** Accept ~10-15% data loss. For a cultural tourism audience, ad blocker rates are lower than for tech audiences. Umami supports `TRACKER_SCRIPT_NAME` for self-hosted instances to rename the script, but this isn't available on Cloud. Proxying through Vercel is possible but overkill.
**Warning signs:** Significant discrepancy between Vercel's built-in analytics and Umami numbers.

### Pitfall 7: Exceeding 100K Events/Month
**What goes wrong:** Free tier budget exhausted.
**Why it happens:** Tracking low-value high-volume interactions (scroll, hover, impression).
**How to avoid:** Track only 13 meaningful interaction types. Estimated budget from architecture doc: ~15 events/session x 200 sessions/day = 90K/month. Safe margin with room for growth.
**Warning signs:** Check Umami dashboard monthly event count. If approaching 80K, review which events can be removed.

## Code Examples

### Umami Script Tag (add to HTML `<head>`)
```html
<!-- Source: https://umami.is/docs/collect-data -->
<!-- After Google Fonts, before any module scripts -->
<script defer src="https://cloud.umami.is/script.js"
        data-website-id="YOUR_WEBSITE_ID_FROM_DASHBOARD"></script>
```
The `data-website-id` is generated when you create a site in Umami Cloud. The `defer` attribute ensures non-blocking load. Auto-tracking is ON by default (pageviews, referrers, etc.).

### Umami Custom Event API (verified from docs)
```javascript
// Source: https://umami.is/docs/tracker-functions

// Track named event
umami.track('Category Filter');

// Track with properties
umami.track('Category Filter', { category: 'Galleries', action: 'enable' });

// Track pageview (automatic, but can be called manually)
umami.track();

// Track with modified default properties
umami.track(props => ({ ...props, url: '/custom-path', title: 'Custom Title' }));
```

### Integration: Category Filter (in controller/bindings)
```javascript
// After the category state is updated:
var analytics = window.CulturalMapAnalytics;
if (analytics) {
  analytics.track('Category Filter', {
    category: categoryName,
    action: isActive ? 'enable' : 'disable'
  });
}
```

### Integration: Search with Debounce (in bindings.js)
```javascript
// In the search input handler, after buildList():
var analytics = window.CulturalMapAnalytics;
if (analytics && val.length >= 2) {
  clearTimeout(window._searchTrackTimer);
  window._searchTrackTimer = setTimeout(function() {
    var count = document.querySelectorAll('#exploreList .card-item').length;
    analytics.track('Search', {
      query: val.substring(0, 100),
      results: String(count),
      zero_results: count === 0 ? 'true' : 'false'
    });
  }, 1500);
}
```

### Integration: UTM-Tagged Outbound in Detail View
```javascript
// In buildDetailMetaHTML(), modify the website link generation:
var analytics = window.CulturalMapAnalytics;
if (asset.w) {
  var url = asset.w.trim();
  if (!url.startsWith('http')) url = 'https://' + url;
  var taggedUrl = analytics ? analytics.tagOutboundUrl(url, 'detail-panel') : url;
  var display = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  metaHTML += '...<a href="' + taggedUrl + '" target="_blank" rel="noopener">' + display + '</a>...';
}

// Similarly for Google Maps:
if (asset.x && asset.y) {
  var mapsUrl = 'https://www.google.com/maps?q=' + asset.y + ',' + asset.x;
  var taggedMaps = analytics ? analytics.tagOutboundUrl(mapsUrl, 'detail-directions') : mapsUrl;
  metaHTML += '...<a href="' + taggedMaps + '" target="_blank" rel="noopener">View on Google Maps</a>...';
}
```

### Script Load Order (in HTML)
```html
<script src="index-maplibre-config.js"></script>
<script src="index-maplibre-core-utils.js"></script>
<script src="index-maplibre-analytics.js"></script>  <!-- NEW: load early -->
<!-- ... all remaining modules ... -->
<script src="index-maplibre-bindings.js"></script>
<script src="index-maplibre.js"></script>
```
The analytics module loads after config/utils (so it can use hostname check for debug mode) and before all controllers/bindings (so they can call `window.CulturalMapAnalytics.track()`).

## Umami Cloud Setup Steps

1. **Sign up** at https://cloud.umami.is/signup -- email + password
2. **Create site** -- name: "Explore Nevada County", domain: `cultural-map-redesign-stitch-lab.vercel.app`
3. **Copy tracking script** -- get the `<script>` tag with `data-website-id`
4. **Add to HTML** -- paste in `<head>` of the stitch-lab entry point
5. **Enable Share URL** -- Settings > Websites > Edit > Share URL > Add. Select views to expose.
6. **Configure Goals** -- After events flow, create event-based Goals for key conversions
7. **Share with committee** -- send the Share URL to Diana/Eliza. No account needed.

### Dashboard Configuration (Claude's Discretion Recommendation)

**Share URL views to expose for committee:**

| View | Why Include |
|------|------------|
| **Overview** | Page views, visitors, bounce rate, visit duration -- top-level health check |
| **Events** | Custom event counts and properties -- interaction breakdown |
| **UTM** | Campaign source/medium breakdown -- `exploregvnc` referral proof |
| **Realtime** | Live visitor count -- useful for demos during committee meetings |

**Omit from share URL:** Sessions (too granular for committee), Breakdown (developer-focused), Goals/Funnels/Journeys (configure later if needed).

**Goals to configure in Umami dashboard:**

| Goal | Type | Conversion Meaning |
|------|------|-------------------|
| Outbound Click | Event-based | Visitor clicked through to a venue |
| Search | Event-based | Visitor used search |
| Experience Start | Event-based | Visitor started a curated route |
| Detail Open | Event-based | Visitor opened a venue detail panel |

Goals show conversion rates (% of visitors who perform the action) which committee can use to gauge engagement.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Analytics (UA, cookies) | GA4 or privacy-first alternatives | July 2023 (UA sunset) | Umami/Plausible adoption surged |
| Cookie-based tracking + consent banners | Cookieless analytics | 2022-2024 | No consent UI needed |
| Self-hosted analytics servers | Cloud-hosted with free tiers | 2024-2025 | Umami Cloud Hobby plan eliminates DevOps |
| Tag managers (GTM) for instrumentation | Direct JS API calls from app code | Current best practice (simple sites) | No third-party tag manager dependency |

**Deprecated/outdated:**
- Google Universal Analytics (UA): Sunset July 2023. GA4 replaced it but requires cookies + consent in EU.
- `navigator.sendBeacon` polyfills: All modern browsers support it natively. Umami uses it internally.

## Codebase Integration Points (Verified from Source)

### Files to Modify
| File | What Changes | Verified Location |
|------|-------------|-------------------|
| Stitch-lab entry HTML | Add Umami `<script>` in `<head>`, add analytics module `<script>` after core-utils | `<head>` section + script block (lines ~401-444 in canonical) |
| `index-maplibre-detail-view.js` | UTM-tag outbound links in `buildDetailMetaHTML()` | Lines 40-48 (website link) and line 47 (Maps link) |
| `index-maplibre-detail-controller.js` | Track `Detail Open` when panel opens | `openDetail()` function |
| `index-maplibre-bindings.js` | Track filter/toggle/event clicks in existing handlers | Lines 21-26 (filter toggle), 37-50 (search), 61-68 (events filter), 114-125 (event card click), 171-176 (clear filters) |
| `index-maplibre-explore-controller.js` | Track search queries + zero results | After `buildList()` call |
| `index-maplibre-experience-controller.js` | Track `Experience Start` | `activateExperience()` function |
| `index-maplibre.js` | Init analytics module, track `Deep Link Arrival` | Init sequence + deep link handler |

### Files to Create
| File | Purpose | Size |
|------|---------|------|
| `index-maplibre-analytics.js` | Analytics wrapper module (IIFE) | ~60-80 lines |

## Open Questions

1. **Umami Cloud Hobby plan team seat count**
   - What we know: Free plan = 100K events/mo, 3 sites, 6-month retention. Teams feature exists with 4 role levels (Owner, Manager, Member, View Only).
   - What's unclear: Exact number of team seats on Hobby tier. Pricing page renders client-side; couldn't extract.
   - Recommendation: Use **Share URL** for committee access (confirmed available feature). This sidesteps the team seat question entirely and is simpler for non-technical committee members. If seats are available after signup, add Kaelen as Owner and optionally Diana as View Only.

2. **Ad blocker impact on tracking accuracy**
   - What we know: Some ad blockers block `cloud.umami.is`. Umami supports `TRACKER_SCRIPT_NAME` for self-hosted to rename the script, but this isn't configurable on Cloud.
   - What's unclear: Actual block rate for a cultural tourism audience.
   - Recommendation: Accept ~5-15% under-reporting. Not worth proxy workarounds for this project scale. Revisit if numbers seem unreasonably low.

3. **Search debounce timing**
   - What we know: Users type incrementally. Tracking every keystroke wastes events.
   - What's unclear: Optimal debounce delay for this specific search UX.
   - Recommendation: 1500ms idle after last keystroke before firing search event. Only track queries with 2+ characters. This is separate from the 500ms dedup throttle (which prevents the same final query from being tracked twice).

## Sources

### Primary (HIGH confidence)
- Umami Tracker Functions docs (umami.is/docs/tracker-functions) -- `umami.track()` API, function signatures, event data constraints (50 char names, 500 char strings, 50 max properties, 4 decimal precision)
- Umami Track Events docs (umami.is/docs/track-events) -- data attributes, JS tracking, event name limit
- Umami Enable Share URL docs (umami.is/docs/enable-share-url) -- Share URL setup, configurable views (Traffic/Behavior/Growth), no-account access
- Umami Using Teams docs (umami.is/docs/using-teams) -- 4 role levels (Owner/Manager/Member/View Only)
- Umami UTM docs (umami.is/docs/utm) -- automatic capture of 5 standard UTM params
- Umami Goals docs (umami.is/docs/goals) -- URL-based and event-based goals, conversion rate tracking
- Umami Collect Data docs (umami.is/docs/collect-data) -- script tag setup, `data-website-id`, `defer` attribute
- Umami Environment Variables docs (umami.is/docs/environment-variables) -- TRACKER_SCRIPT_NAME, COLLECT_API_ENDPOINT, bot detection config
- Existing codebase: `docs/analysis/analytics-architecture-options.md` -- complete module blueprint, event taxonomy, integration points, volume estimates
- Existing codebase: verified all integration points by reading source of `bindings.js`, `detail-view.js`, `detail-controller.js`, `filter-ui.js`, `explore-controller.js`, `experience-controller.js`, `index-maplibre.js`

### Secondary (MEDIUM confidence)
- Umami Cloud docs (umami.is/docs/cloud) -- Hobby plan described as free, managed, scalable
- Umami pricing: 100K events/mo, 3 sites, 6-month retention on Hobby tier -- verified across multiple references

### Tertiary (LOW confidence)
- Hobby tier exact team seat count -- not found in docs. Mitigated by Share URL feature.
- Ad blocker blocking rates -- estimated from general industry data, not measured for this audience.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Umami Cloud is locked decision; API documented and verified from official docs
- Architecture: HIGH -- complete module blueprint exists in repo; Umami adapter is trivial; all integration points verified in source
- Event taxonomy: HIGH -- 13 events mapped to specific modules and code locations with verified line numbers
- UTM strategy: HIGH -- standard UTM params, committee use case explicit, `tagOutboundUrl()` helper pattern clear
- Dashboard access: MEDIUM -- Share URL confirmed available; team seat count unverified (mitigated)
- Pitfalls: HIGH -- constraints from official docs; throttle/UTM/load-order patterns well-understood

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (stable domain, Umami Cloud API changes slowly)
