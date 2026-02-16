# Phase 6: Analytics Foundation - Research

**Researched:** 2026-02-16
**Domain:** Privacy-first web analytics, custom event tracking, UTM attribution
**Confidence:** HIGH

## Summary

This phase instruments the Explore Nevada County cultural map with Umami Cloud analytics to track user interactions and prove referral value to local businesses. Umami is a privacy-first, cookieless analytics platform that requires no consent banner, making it ideal for a public-interest cultural tourism site.

The implementation is straightforward: one script tag for Umami Cloud, one new analytics wrapper module (`index-maplibre-analytics.js`) that centralizes all `umami.track()` calls behind a provider-agnostic API, and surgical instrumentation of 12+ existing interaction points across the codebase. UTM parameters on outbound links (`utm_source=exploregvnc`) enable venue-level referral attribution in their own Google Analytics. A shared dashboard URL gives committee members read-only access without needing Umami accounts.

**Primary recommendation:** Create a single analytics wrapper module with a dedup throttle, then instrument existing event handlers in `bindings.js`, `detail-controller.js`, `experience-controller.js`, `filter-ui.js`, and `explore-controller.js`. Do not scatter raw `umami.track()` calls across modules.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Analytics provider:** Umami Cloud (free Hobby plan) — 0$/mo, 100k events/mo, up to 3 sites, 6-month data retention
- Cookieless, GDPR/CCPA compliant by design — no consent banner needed
- Script loads on every page, always (no opt-in required)
- Initial site: `cultural-map-redesign-stitch-lab.vercel.app` (can swap domains freely later)
- Sign up at umami.is, create site, get tracking script snippet
- Track zero-result searches as a flagged event (`zero_results: true` property)
- Chat interactions stay in Supabase only — no redundant tracking in Umami
- UTM source: `exploregvnc`
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
None — discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Umami Cloud | Hosted (latest) | Privacy-first web analytics | Cookieless, GDPR-compliant, free tier sufficient, no self-hosting burden |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | No additional libraries needed | Umami provides the tracking script; wrapper is vanilla JS |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Umami Cloud | Self-hosted Umami | Full control but requires PostgreSQL + server maintenance — overkill for 3-site hobby use |
| Umami Cloud | Plausible, Fathom | Similar privacy-first approach but paid plans start higher; Umami free tier covers this project |

**Installation:** No npm install required. Umami is a single `<script>` tag loaded from Umami Cloud CDN.

## Architecture Patterns

### Recommended Module Structure
```
website/cultural-map-redesign/
├── index-maplibre-analytics.js      # NEW — analytics wrapper module
├── index-maplibre-bindings.js       # MODIFY — add track calls at interaction points
├── index-maplibre-detail-view.js    # MODIFY — UTM-tag outbound links
├── index-maplibre-detail-controller.js  # MODIFY — track detail panel opens
├── index-maplibre-explore-controller.js # MODIFY — track search, zero results
├── index-maplibre-experience-controller.js # MODIFY — track experience activations
├── index-maplibre-filter-ui.js      # MODIFY — track category filter, open now, events toggle
└── index-maplibre.js                # MODIFY — track deep link arrivals, init analytics
```

### Pattern 1: Provider-Agnostic Analytics Wrapper
**What:** A single IIFE module that wraps `umami.track()` behind a generic `CulturalMapAnalytics.track(name, data)` API. All other modules call the wrapper, never Umami directly.
**When to use:** Always — this is the only way to track events.
**Why:** Swapping analytics providers later requires changing one file, not 10+. Also centralizes dedup throttle logic.
**Example:**
```javascript
// Source: Umami docs (https://umami.is/docs/tracker-functions)
(function() {
  'use strict';

  var _lastEvent = '';
  var _lastTime = 0;
  var THROTTLE_MS = 500;

  function track(eventName, data) {
    var now = Date.now();
    var key = eventName + JSON.stringify(data || {});
    if (key === _lastEvent && (now - _lastTime) < THROTTLE_MS) {
      return; // dedup — same event within throttle window
    }
    _lastEvent = key;
    _lastTime = now;

    if (typeof window.umami !== 'undefined' && typeof window.umami.track === 'function') {
      window.umami.track(eventName, data || {});
    }
  }

  window.CulturalMapAnalytics = { track: track };
})();
```

### Pattern 2: UTM-Tagged Outbound Links
**What:** Append UTM parameters to outbound venue links (website, Google Maps) so venues see `exploregvnc` as referral source in their own analytics.
**When to use:** All outbound links in the detail panel.
**Example:**
```javascript
// UTM structure for outbound links
function addUtmParams(url, campaignContext) {
  var sep = url.indexOf('?') === -1 ? '?' : '&';
  return url + sep +
    'utm_source=exploregvnc' +
    '&utm_medium=referral' +
    '&utm_campaign=' + encodeURIComponent(campaignContext);
}

// Usage in detail-view.js for website links:
var taggedUrl = addUtmParams(url, 'venue-detail');
// For Google Maps links:
var mapsUrl = addUtmParams('https://www.google.com/maps?q=...', 'directions');
```

### Pattern 3: Declarative Event Tracking via Data Attributes
**What:** Umami supports `data-umami-event` attributes for simple click tracking without JavaScript.
**When to use:** Static elements where adding JS event listeners is overhead (e.g., colophon links, CTA buttons).
**Constraint:** All data attribute values are stored as strings; event names max 50 characters.
**Example:**
```html
<!-- Source: https://umami.is/docs/track-events -->
<a href="https://example.com"
   data-umami-event="outbound-click"
   data-umami-event-venue="North Star House"
   data-umami-event-type="website"
   target="_blank">Visit website</a>
```

### Anti-Patterns to Avoid
- **Scattering raw `umami.track()` calls:** Creates vendor lock-in and makes dedup impossible. Always go through the wrapper.
- **Tracking every mouse event:** Umami has 100k events/mo on free tier. Track meaningful interactions, not hover/scroll noise.
- **Duplicate tracking of chat events:** Chat already logs to Supabase. Do NOT add Umami tracking to chat interactions.
- **Tracking PII in event data:** Never include email, phone, or names in event properties. Stick to category names, asset IDs, and interaction types.

## Event Taxonomy (Claude's Discretion — Recommendation)

### Naming Convention: Kebab-case, Feature-Grouped
Use a `feature:action` pattern for clarity in the Umami events dashboard. Umami event names max 50 chars.

| Event Name | Properties | Trigger Point | Module |
|------------|------------|---------------|--------|
| `category:filter` | `{ category: "Historic Landmarks" }` | Category pill click | `filter-ui.js` / `bindings.js` |
| `category:clear` | `{}` | "All" pill or clear button | `bindings.js` |
| `toggle:open-now` | `{ state: "on" }` | Open Now pill toggle | `bindings.js` |
| `toggle:events-14d` | `{ state: "on" }` | Events 14d pill toggle | `bindings.js` |
| `marker:click` | `{ category: "...", name: "...", pid: "..." }` | Map marker click | `asset-interactions.js` |
| `detail:open` | `{ category: "...", name: "...", pid: "..." }` | Detail panel opens | `detail-controller.js` |
| `experience:start` | `{ slug: "...", title: "...", type: "corridor" }` | Experience card click | `experience-controller.js` |
| `experience:tour` | `{ slug: "..." }` | Auto-tour button click | `experience-controller.js` |
| `event:click` | `{ event_id: "...", title: "...", venue: "..." }` | Event card click (map/list) | `bindings.js` |
| `search:query` | `{ query: "...", results: 15, zero_results: false }` | Search input debounced | `explore-controller.js` |
| `search:zero` | `{ query: "...", zero_results: true }` | Search with 0 results | `explore-controller.js` |
| `editorial:expand` | `{ editorial_id: "..." }` | MUSE editorial card expand | `bindings.js` or page-level |
| `outbound:website` | `{ venue: "...", url: "..." }` | Website link click in detail | `detail-view.js` |
| `outbound:phone` | `{ venue: "..." }` | Phone link click in detail | `detail-view.js` |
| `outbound:directions` | `{ venue: "..." }` | Google Maps link click | `detail-view.js` |
| `deeplink:arrive` | `{ pid: "...", name: "...", source: "chat" }` | Deep link arrival | `index-maplibre.js` |
| `itinerary:view` | `{ slug: "...", title: "..." }` | Itinerary card click | `itinerary-controller.js` |

### Aggregate vs Venue-Level Data
- **Aggregate demand signals:** `category:filter`, `toggle:*`, `search:*`, `experience:start` — show what visitors care about
- **Venue-level referral proof:** `outbound:website`, `outbound:phone`, `outbound:directions` — show "we sent you X visitors"
- Both are critical. The event properties carry venue names so Umami can filter/group by venue.

### UTM Campaign Naming Strategy (Claude's Discretion — Recommendation)
Use context-based campaign names to distinguish how the user found the venue:

| Context | utm_campaign Value |
|---------|-------------------|
| Detail panel website link | `venue-detail` |
| Detail panel Google Maps link | `directions` |
| Event link from event card | `event-listing` |
| Experience stop click-through | `experience-tour` |
| Itinerary stop link | `itinerary` |
| Explore list item click-through | `directory` |

This lets venues see not just that traffic came from `exploregvnc` but HOW the visitor found them.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Analytics tracking | Custom fetch/beacon | `umami.track()` | Handles batching, offline, retries |
| Page view tracking | Manual route change detection | Umami auto-track (default on) | Automatically tracks SPAs and hash changes |
| Event dedup | Nothing | Simple throttle in wrapper | 500ms key+time check is sufficient |
| Dashboard | Custom admin panel | Umami Cloud dashboard + Share URL | Built-in filterable views, zero development |
| Consent banner | Cookie consent library | Nothing — Umami is cookieless | No cookies = no GDPR consent needed |

**Key insight:** Umami handles all the hard analytics infrastructure (storage, aggregation, dashboards, retention). The only custom code is the thin wrapper module and UTM parameter injection.

## Common Pitfalls

### Pitfall 1: Exceeding 100k Events/Month on Free Tier
**What goes wrong:** Enthusiastic tracking of every scroll, hover, and impression blows through the free tier budget.
**Why it happens:** 687 assets x multiple interactions x return visitors adds up fast.
**How to avoid:** Track only meaningful interactions (clicks, toggles, searches, outbound). Do NOT track: scroll depth, hover, tooltip display, map pan/zoom, page section visibility. Estimate: ~15 tracked events per session x 200 sessions/day = 90k/month. Safe margin.
**Warning signs:** Check Umami dashboard monthly for event count trends.

### Pitfall 2: UTM Parameters Breaking Venue URLs
**What goes wrong:** Some venue websites have fragile URL parsing. Adding `?utm_source=...` to a URL that already has query params can break.
**Why it happens:** Naive string concatenation instead of proper URL parsing.
**How to avoid:** Use the `?` vs `&` separator check shown in the code example. Test with a few real venue URLs.
**Warning signs:** Venues reporting broken links from the cultural map.

### Pitfall 3: Dedup Throttle Too Aggressive or Too Lax
**What goes wrong:** Too aggressive (5s) — misses legitimate rapid category browsing. Too lax (50ms) — doesn't catch double-click/double-fire.
**Why it happens:** Different interactions have different natural rhythms.
**How to avoid:** 500ms is the sweet spot for click-based interactions. Search queries should use a separate debounce (300-500ms on input, then track on idle).
**Warning signs:** Dashboard shows suspiciously round numbers per event (throttle too aggressive) or doubled events (too lax).

### Pitfall 4: Tracking Script Blocked by Ad Blockers
**What goes wrong:** Some ad blockers block `cloud.umami.is` tracking script, resulting in under-reporting.
**Why it happens:** Ad blockers maintain blocklists that include analytics domains.
**How to avoid:** Accept it. Umami Cloud is less blocked than Google Analytics but not immune. For this project's audience (cultural tourists, committee members), ad blocker rates are low. Do NOT attempt to circumvent blockers.
**Warning signs:** Page views in Umami significantly lower than Vercel's built-in analytics (if enabled).

### Pitfall 5: Event Data Property Limits
**What goes wrong:** Umami silently truncates or drops data that exceeds limits.
**Why it happens:** Umami enforces: strings max 500 chars, numbers max 4 decimal precision, objects max 50 properties.
**How to avoid:** Keep event data lean — category name, venue name (truncated to 100 chars), interaction type. Never send full descriptions or HTML.
**Warning signs:** Missing data in Umami's Properties tab for events.

## Code Examples

### Umami Script Tag (add to HTML `<head>`)
```html
<!-- Source: https://umami.is/docs/tracker-configuration -->
<script
  defer
  src="https://cloud.umami.is/script.js"
  data-website-id="YOUR_WEBSITE_ID_HERE"
></script>
```
**Note:** The `data-website-id` is generated when you create a site in Umami Cloud. The `defer` attribute ensures non-blocking load. No `data-auto-track="false"` needed — we want automatic page view tracking.

### Analytics Wrapper Module (full implementation)
```javascript
// index-maplibre-analytics.js
// Source: Custom wrapper pattern + Umami docs
(function() {
  'use strict';

  var _lastKey = '';
  var _lastTime = 0;
  var THROTTLE_MS = 500;

  /**
   * Track a named event with optional data properties.
   * Deduplicates identical events within THROTTLE_MS window.
   * Provider-agnostic: currently wired to Umami, swap here only.
   */
  function track(eventName, data) {
    if (!eventName) return;
    var now = Date.now();
    var key = eventName + '|' + JSON.stringify(data || {});
    if (key === _lastKey && (now - _lastTime) < THROTTLE_MS) return;
    _lastKey = key;
    _lastTime = now;

    // Provider: Umami Cloud
    if (typeof window.umami !== 'undefined' && typeof window.umami.track === 'function') {
      window.umami.track(eventName, data || {});
    }
  }

  /**
   * Append UTM parameters to an outbound URL.
   * utm_source is always 'exploregvnc'.
   */
  function tagOutboundUrl(url, campaign) {
    if (!url) return url;
    var sep = url.indexOf('?') === -1 ? '?' : '&';
    return url + sep +
      'utm_source=exploregvnc' +
      '&utm_medium=referral' +
      '&utm_campaign=' + encodeURIComponent(campaign || 'general');
  }

  window.CulturalMapAnalytics = {
    track: track,
    tagOutboundUrl: tagOutboundUrl
  };
})();
```

### Instrumenting Category Filter (in bindings.js or filter-ui.js)
```javascript
// After existing category pill click handler:
onSetCategory(name);
// Add:
var analytics = window.CulturalMapAnalytics;
if (analytics && name) {
  analytics.track('category:filter', { category: name });
} else if (analytics && !name) {
  analytics.track('category:clear');
}
```

### Instrumenting Detail Panel Open (in detail-controller.js)
```javascript
// At start of openDetail():
var analytics = window.CulturalMapAnalytics;
if (analytics) {
  analytics.track('detail:open', {
    category: asset.l,
    name: (asset.n || '').substring(0, 100),
    city: asset.c || ''
  });
}
```

### UTM-Tagging Outbound Links (in detail-view.js)
```javascript
// Replace current website link generation:
var analytics = window.CulturalMapAnalytics;
var taggedUrl = analytics ? analytics.tagOutboundUrl(url, 'venue-detail') : url;
metaHTML += '<a href="' + taggedUrl + '" target="_blank" rel="noopener">' + display + '</a>';

// Replace current Google Maps link:
var mapsBase = 'https://www.google.com/maps?q=' + asset.y + ',' + asset.x;
var taggedMaps = analytics ? analytics.tagOutboundUrl(mapsBase, 'directions') : mapsBase;
metaHTML += '<a href="' + taggedMaps + '" target="_blank" rel="noopener">View on Google Maps</a>';
```

### Tracking Outbound Click Events (via click handler or data attributes)
```javascript
// Option A: Event delegation on detail panel
panelEl.addEventListener('click', function(e) {
  var link = e.target.closest('a[target="_blank"]');
  if (!link) return;
  var analytics = window.CulturalMapAnalytics;
  if (!analytics) return;
  var href = link.getAttribute('href') || '';
  var venueName = (document.getElementById('detailName') || {}).textContent || '';
  if (href.includes('tel:')) {
    analytics.track('outbound:phone', { venue: venueName.substring(0, 100) });
  } else if (href.includes('google.com/maps')) {
    analytics.track('outbound:directions', { venue: venueName.substring(0, 100) });
  } else {
    analytics.track('outbound:website', { venue: venueName.substring(0, 100), url: href.substring(0, 200) });
  }
});
```

### Search Tracking with Zero-Result Flag
```javascript
// In explore-controller.js, after buildList():
var searchVal = document.getElementById('searchInput').value.trim();
if (searchVal.length >= 2) {
  var filtered = getFilteredData();
  var analytics = window.CulturalMapAnalytics;
  if (analytics) {
    analytics.track(filtered.length === 0 ? 'search:zero' : 'search:query', {
      query: searchVal.substring(0, 100),
      results: filtered.length,
      zero_results: filtered.length === 0
    });
  }
}
```

## Umami Cloud Setup Steps

1. **Sign up** at https://umami.is — create account (email + password)
2. **Create site** — name: "Explore Nevada County", domain: `cultural-map-redesign-stitch-lab.vercel.app`
3. **Copy tracking script** — get the `<script>` tag with `data-website-id`
4. **Add to HTML** — paste in `<head>` of the stitch-lab entry point HTML
5. **Enable Share URL** — Settings > Websites > Edit > Share URL > Add. Select Traffic views (Overview, Events, Sessions). Generate link.
6. **Share with committee** — send the Share URL to Diana/Eliza. No account needed; read-only access.

### Dashboard Access (Claude's Discretion — Recommendation)
Umami Cloud's Share URL feature is the best fit for committee access:
- **No accounts needed** — share a URL, anyone can view
- **Configurable views** — choose which analytics pages are visible (Traffic, Behavior, Growth)
- **Recommended visible views for committee:**
  - Overview (page views, visitors, bounce rate)
  - Events (interaction breakdown by type)
  - UTM (campaign attribution — shows referral proof)
- **Hide from committee:** Sessions (individual session detail), Realtime (not useful for monthly review)

This satisfies the 2-3 person access requirement without consuming team seats on the free plan.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Analytics (UA) | GA4 or privacy-first alternatives | 2023 (UA sunset) | Umami is the leading OSS alternative |
| Cookie-based tracking + consent banners | Cookieless analytics (Umami, Plausible) | 2022-2024 | No consent UI needed, simpler UX |
| Self-hosted analytics | Cloud-hosted with free tiers | 2024-2025 | Umami Cloud Hobby plan eliminates DevOps |

**Deprecated/outdated:**
- Google Analytics Universal Analytics (UA): Sunset July 2023. GA4 replaced it but requires cookies + consent.
- `navigator.sendBeacon` custom implementations: Umami handles this internally.

## Codebase Integration Points

### Files to Modify (existing)
| File | What Changes | Why |
|------|-------------|-----|
| `index-maplibre-hero-intent-stitch-frontend-design-pass.html` (stitch-lab) | Add Umami `<script>` tag in `<head>`, add analytics module `<script>` before `bindings.js` | Script loading |
| `index-maplibre-detail-view.js` | UTM-tag outbound links in `buildDetailMetaHTML()` | Referral attribution |
| `index-maplibre-detail-controller.js` | Track `detail:open` in `openDetail()` | Interaction tracking |
| `index-maplibre-bindings.js` | Track filter/toggle/event clicks | Interaction tracking |
| `index-maplibre-explore-controller.js` | Track search queries + zero results | Search demand signals |
| `index-maplibre-experience-controller.js` | Track `experience:start` in `activateExperience()` | Experience engagement |
| `index-maplibre.js` | Track `deeplink:arrive` in deep link handler | Attribution from chat/shares |

### Files to Create (new)
| File | Purpose |
|------|---------|
| `index-maplibre-analytics.js` | Analytics wrapper module (IIFE, ~50 lines) |

### Script Load Order
The analytics module must load **before** any module that calls it, but **after** config. Insert between `index-maplibre-config.js` and the first controller module:
```
<script src="index-maplibre-config.js"></script>
<script src="index-maplibre-core-utils.js"></script>
<script src="index-maplibre-analytics.js"></script>  <!-- NEW -->
... (remaining modules)
```

## Open Questions

1. **Umami Cloud Hobby plan team seat limit**
   - What we know: Free plan supports 100k events/mo, 3 sites, 6-month retention
   - What's unclear: Exact number of team member seats on free plan (pricing page renders client-side, couldn't extract)
   - Recommendation: Use Share URL for committee access (confirmed available). Team seats are unnecessary since committee only needs read-only dashboards. If team seats are needed later, check Umami Cloud settings after signup.

2. **Ad blocker impact on tracking accuracy**
   - What we know: Umami Cloud scripts are less blocked than GA but some blockers target `cloud.umami.is`
   - What's unclear: Actual block rate for this site's audience
   - Recommendation: Accept some under-reporting (~5-15%). Not worth proxy/custom-domain workarounds for this project scale.

3. **Search debounce vs throttle for tracking**
   - What we know: Users type incrementally ("north" -> "north star" -> "north star house"). Tracking every keystroke wastes events.
   - What's unclear: Optimal debounce delay
   - Recommendation: Debounce search tracking at 800ms idle after last keystroke. Only track queries with 2+ characters. This is separate from the 500ms dedup throttle.

## Sources

### Primary (HIGH confidence)
- Umami Tracker Functions docs (https://umami.is/docs/tracker-functions) — `umami.track()` API, function signatures, event data limits
- Umami Track Events docs (https://umami.is/docs/track-events) — data attributes, JS tracking, 50-char event name limit
- Umami Tracker Configuration docs (https://umami.is/docs/tracker-configuration) — script tag attributes, `data-website-id`, `data-domains`, `data-auto-track`
- Umami Enable Share URL docs (https://umami.is/docs/enable-share-url) — Share URL setup, configurable views (Traffic/Behavior/Growth)

### Secondary (MEDIUM confidence)
- Umami pricing search results — Hobby plan: 100k events/mo, 3 sites, free. Verified across multiple sources.
- Share URL community docs — read-only public dashboard without authentication confirmed.

### Tertiary (LOW confidence)
- Team seat limits on Hobby plan — could not extract from client-rendered pricing page. Share URL is confirmed fallback.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Umami is locked decision, docs verified, API confirmed
- Architecture: HIGH — Wrapper pattern is well-established, codebase interaction points identified from source code
- Event taxonomy: HIGH — All 12+ interaction types mapped to specific modules and code locations
- UTM strategy: HIGH — Standard UTM parameters, committee's use case clear
- Dashboard access: MEDIUM — Share URL confirmed, team seat count unverified (mitigated by Share URL)
- Pitfalls: HIGH — Event limits, URL handling, throttle timing all documented with mitigations

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (stable domain, Umami Cloud changes slowly)
