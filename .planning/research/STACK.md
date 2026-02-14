# Stack Research

**Domain:** Cultural tourism interactive platform — analytics, itinerary, events, AI chatbot, reporting
**Researched:** 2026-02-14
**Confidence:** MEDIUM (versions verified via CDN/Context7, pricing from official sites, some limits from training data)

## Existing Stack (Do Not Change)

These are already in place and should NOT be re-evaluated:

| Technology | Version | Purpose |
|------------|---------|---------|
| MapLibre GL JS | 4.5.0 | WebGL mapping |
| GSAP | 3.11 | Animation |
| Turf.js | 7.2 | Geospatial analysis |
| Luxon | 3.4 | Date/time (Pacific TZ) |
| Vanilla JS (IIFEs) | ES5 | Module system |
| Vercel | Free (Hobby) | Static hosting + functions |

**Constraint:** No npm, no build step, no ES6 modules. All new libraries load via CDN `<script>` tags or are used server-side in Vercel/Supabase functions.

---

## Recommended New Stack

### Analytics

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Plausible Analytics | Cloud | Privacy-first page analytics | GDPR-compliant, no cookie banner needed, lightweight (< 1KB script), simple dashboard. $9/mo for 10K pageviews which is plenty for a cultural district site. |
| Supabase (PostgreSQL) | supabase-js 2.95.3 | Custom event logging, demand signal storage | Free tier: 500MB database, 2GB bandwidth, 500K edge function invocations. Stores structured analytics (itinerary saves, chatbot queries, feature usage) that Plausible cannot capture. |

**Confidence:** HIGH for Plausible (verified pricing from official site). HIGH for Supabase-js version (verified via CDN package.json: 2.95.3).

**Integration pattern:**
```html
<!-- Plausible: one script tag, done -->
<script defer data-domain="cultural-map-redesign.vercel.app"
  src="https://plausible.io/js/script.js"></script>

<!-- Supabase: CDN for custom event logging -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

Plausible handles page views, referrers, geography. Supabase handles custom events (itinerary creation, chatbot usage, asset clicks, corridor engagement). This separation means Plausible can be the "public dashboard" shared with the committee while Supabase stores the operational data.

### Itinerary System

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vanilla JS | ES5 IIFE | Itinerary builder UI, drag-to-reorder | Fits existing architecture. No new library needed for the UI. |
| Supabase | 2.95.3 | Persist saved itineraries (optional, for sharing) | Same instance as analytics. Store itinerary JSON for shareable links. |
| ics.js (manual) | N/A | Generate .ics calendar export | Generating an ICS file is trivial (~50 lines). Use a IIFE helper, not a library. RFC 5545 VCALENDAR/VEVENT format is simple enough to template. |

**Confidence:** HIGH. ICS generation is a well-documented format. No library needed.

**Calendar export pattern (no library):**
```javascript
// Generate ICS content directly - RFC 5545
function generateICS(events) {
  var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GVNC Cultural District//EN'];
  events.forEach(function(e) {
    lines.push('BEGIN:VEVENT');
    lines.push('DTSTART:' + formatICSDate(e.start));
    lines.push('DTEND:' + formatICSDate(e.end));
    lines.push('SUMMARY:' + escapeICS(e.name));
    lines.push('LOCATION:' + escapeICS(e.location));
    lines.push('DESCRIPTION:' + escapeICS(e.description));
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
```

### Event Aggregation (Tier 2 — iCal Parsing)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| ical.js | 2.2.1 | Parse iCal/ICS feeds from multiple sources | Only mature, actively maintained iCal parser for JavaScript. RFC 5545 compliant. Browser-compatible via ES6 module from unpkg CDN. Handles RRULE expansion, timezones, VEVENT iteration. 1.2K GitHub stars, MPL-2.0 license. |
| Vercel Function | N/A | Server-side iCal fetch + merge proxy | iCal feeds are cross-origin. Need a serverless function to fetch, parse, merge, and cache multi-source events. Runs in `api/` directory. Hobby plan: 4 CPU-hours + 1M invocations/month free. |

**Confidence:** HIGH for ical.js (verified v2.2.1 via GitHub, CDN availability via unpkg, Context7 docs confirm parsing API). MEDIUM for Vercel function approach (standard pattern, but need to verify CORS handling with specific iCal sources).

**CDN usage (verified from Context7):**
```html
<script type="module">
  import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";
</script>
```

**Important:** ical.js uses ES6 module syntax. Since the existing codebase uses ES5 IIFEs, the iCal parsing should happen server-side in a Vercel function, NOT client-side. The Vercel function fetches iCal feeds, parses with ical.js (Node.js), merges events, and returns JSON that the client consumes like any other data fetch.

### AI Chatbot

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Google Gemini API (REST) | v1beta | LLM for conversational cultural guide | Generous free tier: 15 RPM, 1M tokens/day for Gemini 2.0 Flash. $0.10/1M input tokens, $0.40/1M output tokens on paid tier. Far cheaper than OpenAI/Anthropic for this use case. |
| Vercel Function | N/A | API key proxy (never expose key to browser) | Thin proxy: receives user message, prepends system prompt with cultural context, forwards to Gemini REST API, streams response back. |
| Context stuffing (not RAG) | N/A | Ground chatbot in local knowledge | Stuff the system prompt with data.json asset catalog, experiences.json routes, and muse_editorials.json. At ~687 assets with compact keys, the full catalog fits in ~50K tokens. Gemini 2.0 Flash has 1M context window. No vector DB needed. |

**Confidence:** HIGH for Gemini API (verified REST endpoint, JS SDK, and pricing via Context7 + official docs). MEDIUM for context stuffing approach (depends on actual token count of data.json — needs measurement).

**REST API pattern (no SDK needed client-side):**
```javascript
// Vercel function: api/chat.js
export default {
  async fetch(request) {
    const { message, history } = await request.json();
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'Understood.' }] },
            ...history,
            { role: 'user', parts: [{ text: message }] }
          ]
        })
      }
    );
    return new Response(response.body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

**Why NOT `@google/genai` SDK client-side:** It is an npm package (v1.41.0 verified via CDN). It uses ES modules and assumes Node.js. Even if loaded from CDN, it would expose the API key in the browser. Use the raw REST API from a Vercel function instead.

### Demand Signal Reporting

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase PostgreSQL | Free tier | Aggregate analytics data, generate reports | Same database as analytics. SQL views and functions for rollups. |
| Supabase Edge Functions (Deno) | Deno 2 runtime | Scheduled report generation | Cron-triggered edge function that queries Supabase, builds report JSON. Committee members access via a simple dashboard page. |
| Vanilla HTML/JS | N/A | Report dashboard UI | Static HTML page with charts. No framework needed. |
| Chart.js | 4.x | Data visualization for reports | De facto standard for simple charts. CDN-loadable. Lightweight. |

**Confidence:** MEDIUM for Supabase Edge Functions (verified Deno 2 runtime via Context7, but scheduling/cron may require external trigger or Supabase's pg_cron). LOW for Chart.js version (training data, needs verification).

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ical.js | 2.2.1 | iCal/ICS parsing | Server-side in Vercel function for multi-source event aggregation |
| @supabase/supabase-js | 2.95.3 | Database client | Client-side via CDN for custom analytics + itinerary persistence |
| Chart.js | 4.x | Data visualization | Demand signal dashboard only (LOW confidence on version) |
| Sortable.js | 1.15.x | Drag-and-drop reorder | Itinerary builder if drag-to-reorder is needed (LOW confidence) |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Analytics | Plausible ($9/mo) | Google Analytics 4 | GA4 requires cookie consent banner, complex setup, data owned by Google. Plausible is privacy-first, simpler, data you own. |
| Analytics | Plausible ($9/mo) | Umami (self-hosted) | Umami is free but requires server hosting. Single volunteer dev should not maintain analytics infrastructure. |
| Custom events | Supabase | Plausible custom events | Plausible custom events exist but are limited (goal-based, not queryable SQL). Supabase gives full SQL for reporting. |
| iCal parsing | ical.js | node-ical | node-ical wraps ical.js internally, adds unnecessary abstraction. Use ical.js directly. |
| iCal parsing | ical.js | rrule.js | rrule.js handles recurrence only, not full iCal parsing. ical.js does both. |
| AI chatbot | Gemini 2.0 Flash | OpenAI GPT-4o-mini | GPT-4o-mini costs more ($0.15/$0.60 per 1M tokens vs $0.10/$0.40). Gemini free tier is more generous (15 RPM vs 3 RPM). |
| AI chatbot | Gemini 2.0 Flash | Claude Haiku | Anthropic has no free tier for API usage. Budget constraint makes Gemini the clear winner. |
| AI chatbot | Context stuffing | RAG with vector DB | 687 assets fit easily in Gemini's 1M token context window. RAG adds complexity (embedding pipeline, vector DB cost, retrieval logic) for zero benefit at this data scale. |
| Database | Supabase | Firebase | Supabase offers real PostgreSQL with SQL. Firebase is NoSQL, harder to do reporting/aggregation queries. |
| Serverless | Vercel Functions | Supabase Edge Functions | Use both. Vercel functions for the chatbot proxy (co-located with the static site). Supabase edge functions for scheduled database tasks (co-located with the data). |
| Charts | Chart.js | D3.js | D3 is overkill for a simple reporting dashboard. Chart.js is higher-level, CDN-loadable, simpler. |
| Charts | Chart.js | Observable Plot | Newer but less CDN-friendly, smaller ecosystem. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Google Analytics 4 | Cookie consent required, privacy concerns, complex setup, data locked in Google | Plausible Analytics |
| npm / build system | Project constraint: vanilla JS, no build step | CDN script tags |
| ES6 `import/export` in client code | Project uses ES5 IIFEs with `window.CulturalMap*` globals | Keep IIFE pattern for all client-side modules |
| Vector database (Pinecone, Weaviate) | Data fits in context window. RAG is over-engineering for 687 assets | Context stuffing with Gemini's 1M token window |
| `@google/genai` SDK in browser | Exposes API key, requires ES modules | Raw REST API via Vercel function proxy |
| Full CMS (Strapi, Contentful) | Overkill. Itineraries are hand-authored JSON files | JSON files in repo, Supabase for user-generated saves |
| WebSocket / real-time for chatbot | Unnecessary complexity. Request/response is fine for a chatbot | Standard fetch() to Vercel function |
| Heavyweight iCal libs (tsdav, caldav-client) | CalDAV protocol support not needed. Just parsing public .ics feeds | ical.js for RFC 5545 parsing |

---

## Budget Impact

| Service | Free Tier | Paid Tier | Estimated Monthly Cost |
|---------|-----------|-----------|------------------------|
| Vercel Hobby | 4 CPU-hours, 1M invocations, 100GB bandwidth | N/A (hobby is free) | $0 |
| Plausible Cloud | 30-day trial only | $9/mo (10K pageviews) | $9 |
| Supabase Free | 500MB DB, 2GB bandwidth, 500K edge fn invocations | $25/mo Pro (if needed) | $0 |
| Gemini API Free | 15 RPM, 1M tokens/day | $0.10/$0.40 per 1M tokens | $0 (free tier likely sufficient) |
| **Total** | | | **$9/mo** |

This fits well within the $19-34/mo budget, leaving room for Supabase Pro ($25) if the free tier is exceeded later.

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @supabase/supabase-js@2.95.3 | Browser via CDN (UMD) | Verified: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` exposes global `supabase` |
| ical.js@2.2.1 | Node.js + Browser (ES6 module) | Use server-side in Vercel function. ES5 transpiled version available at unpkg. |
| Gemini API v1beta | REST (any HTTP client) | No client library needed. Plain `fetch()` from Vercel function. |
| Plausible script | Any HTML page | Single `<script>` tag. No dependencies. |
| Vercel Functions | Node.js 20.x | `api/*.js` files auto-deployed. `export default { fetch() {} }` signature. |

---

## Integration with Existing Module System

All new client-side code MUST follow the existing pattern:

```javascript
// index-maplibre-analytics.js
(function() {
  'use strict';

  var supabaseClient = window.supabase.createClient(
    'https://YOUR_PROJECT.supabase.co',
    'YOUR_ANON_KEY'  // anon key is safe to expose (RLS enforced)
  );

  function trackEvent(category, action, label) {
    // Plausible custom event
    if (window.plausible) {
      window.plausible(action, { props: { category: category, label: label } });
    }
    // Supabase structured event
    supabaseClient.from('analytics_events').insert({
      category: category,
      action: action,
      label: label,
      timestamp: new Date().toISOString()
    });
  }

  window.CulturalMapAnalytics = {
    trackEvent: trackEvent
  };
})();
```

Server-side code (Vercel functions, Supabase edge functions) can use modern JS/TS freely since it runs in Node.js/Deno, not the browser.

---

## Sources

- **Context7** `/supabase/supabase-js` — CDN usage, insert API, client creation (HIGH confidence)
- **Context7** `/websites/ai_google_dev_api` — Gemini REST API endpoints, generateContent format (HIGH confidence)
- **Context7** `/kewisch/ical.js` — Browser usage, VEVENT parsing, RRULE iteration (HIGH confidence)
- **Context7** `/websites/supabase` — Edge Functions, Deno runtime, deploy commands (HIGH confidence)
- **CDN package.json** `@supabase/supabase-js@2` — Version 2.95.3 confirmed (HIGH confidence)
- **CDN package.json** `@google/genai` — Version 1.41.0 confirmed (HIGH confidence)
- **GitHub** `kewisch/ical.js` — Version 2.2.1, MPL-2.0, active maintenance (HIGH confidence)
- **Plausible.io** — Pricing $9/mo starter, script tag integration (MEDIUM confidence, marketing page)
- **Vercel docs** `/docs/functions` — `api/*.js` pattern, Hobby limits, pricing model (HIGH confidence)
- **Vercel docs** `/docs/functions/limitations` — 4 CPU-hours free, 300s max duration (HIGH confidence)
- **Gemini pricing page** — $0.10/$0.40 per 1M tokens for 2.0 Flash, free tier details (MEDIUM confidence)
- **Supabase free tier** — 500MB DB, 500K edge fn invocations (LOW confidence, from training data, verify at supabase.com/pricing)

---
*Stack research for: GVNC Cultural District Experience Platform — Milestone 2 capabilities*
*Researched: 2026-02-14*
