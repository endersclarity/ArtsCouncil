# Phase 7: Demand Signal Reporting — Pipeline Architecture

**Author:** pipeline agent
**Date:** 2026-02-18
**Status:** Design complete — ready for implementation

---

## Overview

This document specifies the automated reporting pipeline for Phase 7. It covers five components:
1. Data pull script (`scripts/demand-signal-pull.mjs`)
2. Session reconstruction approach
3. Intent classification taxonomy and rules
4. Business referral attribution schema
5. Scheduling recommendation

---

## 1. Data Pull Script: `scripts/demand-signal-pull.mjs`

### Interface

```bash
# Default: last 30 days
node scripts/demand-signal-pull.mjs

# Custom date range
node scripts/demand-signal-pull.mjs --from 2026-01-18 --to 2026-02-18

# Output to file
node scripts/demand-signal-pull.mjs --from 2026-01-01 --to 2026-02-01 --out reports/jan-2026.json

# Verbose mode (logs each API call, useful for debugging auth)
node scripts/demand-signal-pull.mjs --verbose
```

### Environment Variables Required

```bash
# .env (already present in project)
UMAMI_WEBSITE_ID=         # Umami Cloud website UUID
UMAMI_BEARER_TOKEN=       # Bearer token from localStorage['umami.auth'] — expires, must refresh
SUPABASE_URL=             # https://tguligitecsfxfkycknh.supabase.co
SUPABASE_SECRET_KEY=      # Bypasses RLS — read access to chat_logs
```

**Note on Umami token:** The `umami.auth` localStorage value is a JSON-encoded object. Extract with:
```bash
# In agent-browser after logging in:
JSON.parse(localStorage.getItem('umami.auth')).token
```
This token expires (session-based). For automated runs, store a refreshed token in `.env` as `UMAMI_BEARER_TOKEN`.

### Umami API Calls (in order)

All calls use base: `https://cloud.umami.is/analytics/us/api/websites/{WEBSITE_ID}`

```javascript
// 1. Overview stats
GET /stats?startAt={ms}&endAt={ms}
→ { visitors, visits, pageviews, bounces, totaltime }

// 2. Event metrics (aggregate counts per event type)
GET /metrics?startAt={ms}&endAt={ms}&type=event
→ [{ x: "category:filter", y: 7 }, { x: "detail:open", y: 4 }, ...]

// 3. Event property inventory (which events have which properties)
GET /event-data/properties?startAt={ms}&endAt={ms}
→ [{ eventName, propertyName, total }, ...]

// 4. Per-property value breakdowns (one call per event+property combo)
// Known combinations:
GET /event-data/values?startAt={ms}&endAt={ms}&event=category:filter&propertyName=category
GET /event-data/values?startAt={ms}&endAt={ms}&event=detail:open&propertyName=name
GET /event-data/values?startAt={ms}&endAt={ms}&event=detail:open&propertyName=city
GET /event-data/values?startAt={ms}&endAt={ms}&event=detail:open&propertyName=category
GET /event-data/values?startAt={ms}&endAt={ms}&event=outbound:event-ticket&propertyName=venue
GET /event-data/values?startAt={ms}&endAt={ms}&event=outbound:event-ticket&propertyName=title
GET /event-data/values?startAt={ms}&endAt={ms}&event=marker:click&propertyName=name
GET /event-data/values?startAt={ms}&endAt={ms}&event=toggle:open-now&propertyName=state
GET /event-data/values?startAt={ms}&endAt={ms}&event=toggle:events-14d&propertyName=state
GET /event-data/values?startAt={ms}&endAt={ms}&event=events:date-filter&propertyName=filter
GET /event-data/values?startAt={ms}&endAt={ms}&event=search:query&propertyName=query
GET /event-data/values?startAt={ms}&endAt={ms}&event=search:query&propertyName=results
GET /event-data/values?startAt={ms}&endAt={ms}&event=experience:start&propertyName=slug
GET /event-data/values?startAt={ms}&endAt={ms}&event=outbound:website&propertyName=venue
GET /event-data/values?startAt={ms}&endAt={ms}&event=trip:bookmark-add&propertyName=name
// Script should call /event-data/properties first and dynamically discover combos

// 5. Page views breakdown
GET /metrics?startAt={ms}&endAt={ms}&type=url
→ [{ x: "/", y: 45 }, { x: "/directory.html", y: 12 }, ...]
```

### Supabase API Calls

```javascript
// Chat logs with date range filter
GET {SUPABASE_URL}/rest/v1/chat_logs
  ?select=id,created_at,session_hash,query_text,response_text,intent,assets_referenced,duration_ms,model
  &created_at=gte.{ISO_START}
  &created_at=lte.{ISO_END}
  &order=created_at.desc
  -H "apikey: {SUPABASE_SECRET_KEY}"
  -H "Authorization: Bearer {SUPABASE_SECRET_KEY}"
```

### Unified Output Schema

```json
{
  "meta": {
    "generated_at": "2026-02-18T10:00:00Z",
    "period_start": "2026-01-18T00:00:00Z",
    "period_end": "2026-02-18T23:59:59Z",
    "period_days": 31
  },

  "overview": {
    "visitors": 142,
    "visits": 198,
    "pageviews": 1847,
    "bounce_rate": 0.12,
    "avg_duration_ms": 194000
  },

  "page_views": [
    { "url": "/", "views": 1162, "pct": 0.63 },
    { "url": "/directory.html", "views": 237, "pct": 0.13 }
  ],

  "events": {
    "summary": [
      { "name": "toggle:open-now", "count": 312 },
      { "name": "category:filter", "count": 87 }
    ],
    "by_property": {
      "category:filter.category": [
        { "value": "Walks & Trails", "count": 24 },
        { "value": "Historic Landmarks", "count": 19 }
      ],
      "detail:open.name": [
        { "value": "Empire Mine State Historic Park", "count": 18 }
      ],
      "outbound:event-ticket.venue": [
        { "value": "Odd Fellows Hall", "count": 7 }
      ],
      "events:date-filter.filter": [
        { "value": "tonight", "count": 31 },
        { "value": "weekend", "count": 22 }
      ],
      "search:query.query": [
        { "value": "galleries", "count": 8 },
        { "value": "bar restaurant", "count": 5 }
      ]
    }
  },

  "chat_logs": [
    {
      "id": "uuid",
      "created_at": "2026-02-16T14:32:00Z",
      "session_hash": "abc123",
      "query_text": "Where should I eat downtown tonight?",
      "intent": "dining",
      "assets_referenced": ["Tofanelli's", "MeZe Eatery", "Watershed"],
      "duration_ms": 11665,
      "model": "gemini-2.0-flash"
    }
  ],

  "derived": {
    "intent_clusters": { ... },    // See Section 3
    "venue_attribution": { ... },  // See Section 4
    "demand_signals": { ... }      // Human-readable summary for committee
  }
}
```

---

## 2. Session Reconstruction

### The Core Limitation

Umami Cloud's API does not expose per-session event streams. The `/sessions` endpoint exists in self-hosted Umami but is not available via the Cloud API (`/analytics/us/api/`). We have:
- Aggregate event counts and property breakdowns
- Visitor/visit totals
- Page view breakdowns by URL
- No session ID → event mapping

### What We CAN Do

**Approach A: Co-occurrence scoring (primary)**

Treat the dataset as a joint probability problem. For each intent cluster, calculate how many of its component signals co-occurred in the same reporting period relative to base rates.

Example: `tonight` date filter + dining-category chatbot query + `outbound:event-ticket` → these three signals co-occurred in a 24-hour window with small visitor count (5). Even without session IDs, the pattern is readable.

At scale (30+ days, 100+ visitors), we can use **mutual information**: if `events:date-filter=tonight` and `category:filter=Eat Drink Stay` correlate at rates higher than chance across multiple reporting periods, they belong to the same behavioral cluster.

**Approach B: Temporal bucketing (secondary)**

Pull event counts in 1-hour buckets using the `startAt`/`endAt` params (narrow windows). Events clustered within the same hour are more likely to belong to the same session. This is not session attribution, but it narrows the inference window.

```javascript
// Pull 24 1-hour windows instead of one 24-hour window
for each hour in reporting_period:
  GET /stats?startAt={hour_start}&endAt={hour_end}
  GET /metrics?startAt={hour_start}&endAt={hour_end}&type=event
```

Cost: 24x API calls per day analyzed. For a 30-day report = 720 calls. Acceptable but slow (~2-3 min run time).

**Approach C: Supabase session_hash as anchor**

Chat logs include `session_hash`. This is a fingerprint of the visitor's session. We can:
1. For each chat log, look at what Umami events fired in the same hour
2. If there are 2 visitors in that hour and one chatbot query, infer which event patterns belong to the "chatbot user" vs. the non-chatbot user

This gives us partial session reconstruction for any visitor who used the chatbot.

**Recommendation:** Implement A as default (aggregate clustering). Add B as `--granular` flag for high-value reporting periods (e.g., after an event). Document C as a future enhancement once instrumentation adds Umami session IDs to custom event properties.

### Future: Session ID Attribution (Tier 1 Instrumentation Gap)

The cleanest fix is adding Umami's session ID to every custom event as a property. Umami generates a session ID (`umami.sessionId` in the client script's internal state). Instrumenter can expose this. Then every custom event carries `{ session_id: "abc", ...other_props }` and Supabase `chat_logs` rows can store it too. This collapses the reconstruction problem entirely.

---

## 3. Intent Classification Taxonomy

### Taxonomy (7 types)

| Intent | Label | Core Signal Pattern | Confidence ceiling |
|--------|-------|--------------------|--------------------|
| Tonight Planner | `tonight_planner` | `events:date-filter=tonight` AND/OR chatbot dining query AND/OR `outbound:event-ticket` | HIGH (all signals are specific) |
| Trip Researcher | `trip_researcher` | `outbound:lodging-vrbo` AND/OR `events:date-filter=weekend` AND multiple category filters | HIGH (VRBO click is unambiguous) |
| Art Seeker | `art_seeker` | `category:filter` with 2+ of: Galleries, Cultural Orgs, Performing Arts | MODERATE |
| Family Planner | `family_planner` | `category:filter=Education` OR search queries containing "kids/family/children" | MODERATE (low sample currently) |
| Event Hunter | `event_hunter` | `toggle:events-14d=on` + `detail:open` on event-type asset OR `outbound:event-ticket` without `tonight` filter | MODERATE |
| Local Explorer | `local_explorer` | `toggle:open-now=on` AND low session count (1-2 pages) AND no outbound lodging | LOW (hard to distinguish from Casual Browser) |
| Casual Browser | `casual_browser` | Default — no high-signal actions. Vercel referrer + short session. | LOW (residual bucket) |

### Classification Rules (decision tree)

```
IF outbound:lodging-vrbo fired:
  → trip_researcher (HIGH confidence)

ELSE IF outbound:event-ticket fired:
  IF events:date-filter=tonight also fired in same period:
    → tonight_planner (HIGH confidence)
  ELSE:
    → event_hunter (MODERATE confidence)

ELSE IF events:date-filter=tonight fired:
  IF chatbot query contains ["eat", "drink", "dinner", "restaurant", "bar"]:
    → tonight_planner (HIGH confidence)
  ELSE:
    → tonight_planner (MODERATE confidence)

ELSE IF category:filter contains 2+ of [Galleries, Cultural Orgs, Performing Arts, Museums]:
  → art_seeker (MODERATE confidence)

ELSE IF category:filter=Education OR search terms match family keywords:
  → family_planner (MODERATE confidence)

ELSE IF toggle:events-14d=on + detail:open count >= 2:
  → event_hunter (MODERATE confidence)

ELSE IF toggle:open-now=on AND pageviews <= 5:
  → local_explorer (LOW confidence)

ELSE:
  → casual_browser (LOW confidence)
```

### Rule Application at Aggregate Level

Since we don't have session IDs, these rules classify **signal clusters** per period, not individual visitors. The output is:

```json
"intent_clusters": {
  "tonight_planner": {
    "confidence": "HIGH",
    "evidence": ["events:date-filter=tonight (2)", "outbound:event-ticket (2)", "chat query: dining"],
    "estimated_visitor_count": 1
  },
  "trip_researcher": {
    "confidence": "HIGH",
    "evidence": ["outbound:lodging-vrbo (1)", "events:date-filter=weekend (1)", "category:filter=Walks & Trails (2)"],
    "estimated_visitor_count": 1
  },
  "casual_browser": {
    "confidence": "LOW",
    "evidence": ["vercel referrer", "category:filter=Cultural Organizations (1)", "no outbound clicks"],
    "estimated_visitor_count": 2
  }
}
```

The `estimated_visitor_count` is a rough inference: sum the total visitors, subtract those accounted for by high-confidence clusters. Distribute remainder across lower-confidence clusters.

### Chatbot Query Intent Subclassification

For each chat log row, classify `query_text` into a micro-intent:

| Query pattern | Micro-intent |
|--------------|--------------|
| eat/drink/dinner/restaurant/bar | `dining` |
| hotel/stay/lodging/night/vrbo | `lodging` |
| hike/trail/outdoor/nature | `outdoor` |
| gallery/art/studio/museum | `arts` |
| tonight/this evening/now | `same_day` |
| weekend/saturday/sunday | `future_trip` |
| kids/family/children | `family` |
| music/concert/show/live | `live_music` |

Classification via keyword matching on `query_text.toLowerCase()`. Multiple labels can apply (e.g., "dinner before the concert tonight" → `dining` + `live_music` + `same_day`).

---

## 4. Business Referral Attribution

### Attribution Hierarchy

Four signal types, ranked by economic value:

```
TIER 1 — DIRECT REFERRAL (conversion-equivalent)
  outbound:event-ticket → venue got a ticket click-through
  outbound:lodging-vrbo → lodging sector got a booking inquiry
  outbound:website → venue website visited (weaker than ticket, stronger than view)

TIER 2 — QUALIFIED INTEREST (intent without conversion)
  detail:open → venue engaged in detail panel
  marker:click → venue selected on map
  chat assets_referenced → venue recommended by AI (no click tracking yet)

TIER 3 — CATEGORY INTEREST (topical, not venue-specific)
  category:filter → category explored (distributes across all venues in category)
  search:query → search performed (venues matching query may have been seen)
```

### Venue Attribution Schema

```json
"venue_attribution": [
  {
    "venue": "Odd Fellows Hall",
    "city": "Nevada City",
    "category": "Performing Arts",
    "signals": {
      "outbound_ticket_clicks": 2,
      "detail_opens": 0,
      "marker_clicks": 0,
      "chat_recommendations": 0,
      "chat_click_throughs": 0
    },
    "attribution_score": 200,
    "tier": 1,
    "primary_signal": "outbound:event-ticket"
  },
  {
    "venue": "Empire Mine State Historic Park",
    "city": "Grass Valley",
    "category": "Historic Landmarks",
    "signals": {
      "outbound_ticket_clicks": 0,
      "detail_opens": 2,
      "marker_clicks": 1,
      "chat_recommendations": 0,
      "chat_click_throughs": 0
    },
    "attribution_score": 30,
    "tier": 2,
    "primary_signal": "detail:open"
  },
  {
    "venue": "Tofanelli's Gold Country Bistro",
    "city": "Grass Valley",
    "category": "Eat/Drink/Stay",
    "signals": {
      "outbound_ticket_clicks": 0,
      "detail_opens": 0,
      "marker_clicks": 0,
      "chat_recommendations": 5,
      "chat_click_throughs": 0
    },
    "attribution_score": 5,
    "tier": 2,
    "primary_signal": "chat:recommended",
    "note": "Click-through tracking not yet instrumented — score is undercount"
  }
]
```

**Attribution score formula:**
```
score = (outbound_ticket_clicks × 100)
      + (outbound_website_clicks × 40)
      + (detail_opens × 10)
      + (marker_clicks × 5)
      + (chat_recommendations × 5)
      + (chat_click_throughs × 30)   // when instrumented
```

Weights are arbitrary starting points. Can be calibrated once we have more data. The committee doesn't need weights explained — they need a ranked list.

### Chat Recommendation Extraction

Parse `response_text` from chat_logs for `[[Asset Name|pid]]` deep link patterns:

```javascript
const deepLinkRegex = /\[\[([^\|]+)\|([^\]]+)\]\]/g;
// "Visit [[LeeAnn Brook Gallery|leeann-brook]] or [[Empire Mine|empire-mine]]"
// → ["LeeAnn Brook Gallery", "Empire Mine"]
```

Count how many times each venue appears in `response_text` across all chat logs in the period. Until chatbot deep link click tracking is instrumented, this is the best proxy for AI-driven referral.

---

## 5. Scheduling Recommendation

### Cadence Options

| Cadence | Rationale | Drawback |
|---------|-----------|---------|
| Monthly | Matches committee meeting rhythm. Enough data per period for meaningful patterns. | Misses event-driven spikes (swing dance night vs. dead Tuesday) |
| Weekly | Catches event-week vs. off-week comparisons. Useful once traffic grows. | Under-sampled at current visitor volumes (5-50/week) |
| Event-triggered | Run after each major event (Art Walk, Mothers Day at Empire Mine, etc.) | Requires manual scheduling, no automation |

**Recommendation: Monthly cron + manual event-triggered runs**

1. **Monthly automated pull** via GitHub Actions on the 1st of each month
2. **Manual runs** after notable events using CLI with `--from`/`--to` args

### GitHub Actions Workflow

```yaml
# .github/workflows/demand-signal-report.yml
name: Monthly Demand Signal Report

on:
  schedule:
    - cron: '0 9 1 * *'   # 9am UTC on the 1st of every month
  workflow_dispatch:       # Allow manual trigger from Actions UI

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run demand signal pull
        env:
          UMAMI_WEBSITE_ID: ${{ secrets.UMAMI_WEBSITE_ID }}
          UMAMI_BEARER_TOKEN: ${{ secrets.UMAMI_BEARER_TOKEN }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SECRET_KEY: ${{ secrets.SUPABASE_SECRET_KEY }}
        run: |
          MONTH_START=$(date -d "$(date +%Y-%m-01) -1 month" +%Y-%m-01)
          MONTH_END=$(date -d "$(date +%Y-%m-01) -1 day" +%Y-%m-%d)
          node scripts/demand-signal-pull.mjs --from $MONTH_START --to $MONTH_END \
            --out reports/$(date +%Y-%m)-demand-signals.json
      - name: Commit report
        run: |
          git config user.email "reports@exploregvnc.com"
          git config user.name "Demand Signal Bot"
          git add reports/
          git diff --staged --quiet || git commit -m "chore: monthly demand signal report $(date +%Y-%m)"
          git push
```

**UMAMI_BEARER_TOKEN gotcha:** This token is session-scoped and expires. For automation to work, we need either:
1. A service account API key (Umami Cloud Pro feature — not available on free tier)
2. A refresh script that logs in via headless browser and extracts a new token before each run

For now: manually refresh the token quarterly and update the GitHub Actions secret. When the committee needs more reliable automation, upgrade to Umami Pro.

---

## 6. Key Implementation Notes for Instrumenter

The pipeline's accuracy is directly limited by what events are fired. Top gaps to close:

### 1. Chatbot deep link click tracking (HIGHEST PRIORITY)
Every `[[Asset Name|pid]]` link in chat responses should fire `chat:deeplink-click` with `{ venue, pid }`. This is the single biggest measurement gap — chatbot may be our most powerful referral engine but is completely invisible.

### 2. Session ID as event property (ENABLES SESSION RECONSTRUCTION)
Expose Umami's internal session ID on all custom event calls. This collapses the session reconstruction problem. Schema addition:
```javascript
{ session_id: window.umami?.sessionId, ...existing_props }
```

### 3. Toggle state in event (already partially done, verify consistency)
`toggle:open-now` should always fire with `{ state: "on"|"off" }`. If Umami is seeing 25 toggles but we can't tell on vs. off ratios, the data is half-blind.

### 4. Search query logging
`search:query` events should include `{ query, results_count, zero_results: bool }`. What people search for and DON'T find is as valuable as what they do find.

---

## 7. Data Contracts for Reporter

The reporter team's report template should be designed around this guaranteed structure from `derived`:

```json
"derived": {
  "intent_clusters": {
    "tonight_planner": { "confidence": "HIGH|MODERATE|LOW", "estimated_visitor_count": 1, "evidence": [...] },
    "trip_researcher":  { ... },
    "art_seeker":       { ... },
    "casual_browser":   { ... }
  },

  "venue_attribution": [
    // Sorted by attribution_score DESC
    // Each: { venue, city, category, signals, attribution_score, tier, primary_signal }
  ],

  "demand_signals": {
    "top_categories": ["Walks & Trails", "Historic Landmarks"],
    "top_venues_by_engagement": ["Empire Mine", "Odd Fellows Hall"],
    "top_outbound_referrals": [
      { "venue": "Odd Fellows Hall", "clicks": 2, "type": "event-ticket" }
    ],
    "chatbot_topics": ["dining", "same_day"],
    "chatbot_venue_recs": [
      { "venue": "Tofanelli's", "recommended_count": 3 }
    ],
    "notable_patterns": [
      "Tonight-planning cluster: 1 visitor, event ticket click-through for Spring Street Swing Out",
      "Trip research cluster: VRBO click + weekend filter, trails + landmarks focus"
    ]
  }
}
```

---

## Summary

| Component | Approach | Confidence ceiling |
|-----------|---------|-------------------|
| Data pull | Umami + Supabase REST, unified JSON output | DETERMINISTIC |
| Session reconstruction | Co-occurrence clustering (no session IDs in API) | MODERATE (~60%) |
| Intent classification | Rule-based decision tree on aggregate signals | HIGH for conversion events, LOW for browse-only |
| Business attribution | 4-tier scoring: outbound clicks → detail opens → chat recs | High for tier 1, undercount for chat (instrumentation gap) |
| Scheduling | Monthly GitHub Actions + manual CLI for events | Umami token refresh is manual pain point |

**Single biggest improvement:** Add session IDs to custom events (instrumenter task) + add chatbot deep link click tracking. Together, these would push session reconstruction from 60% to near 100% and make chatbot the most granular referral channel in the dataset.
