# Phase 7: Demand Signal Reporting — Research

**Researched:** 2026-02-17
**Domain:** Analytics pipeline (Umami Cloud API + Supabase REST), instrumentation, Node.js reporting, GitHub Actions scheduling, Pandoc PDF generation
**Confidence:** HIGH — extensive POC work completed 2026-02-18 proves all critical data access paths

---

## Summary

Phase 7 is unusually well-researched before planning begins. A complete POC was executed on 2026-02-18: synthetic users browsed the live Vercel site, Umami Cloud API and Supabase REST were queried from the terminal, blind intent reconstruction was attempted from aggregate data (~60% accuracy), and all four committee report deliverables were fully designed (template, metrics-datasource mapping, sample report, delivery guide). The pipeline is proven. The design is done. The remaining work is implementation.

The phase decomposes into three sequential plans with a hard dependency chain: **07-01 must ship before 07-02 and 07-03** because the reporting pipeline's accuracy depends on new instrumentation data being captured first. Plan 07-01 adds 12 new analytics events and injects `session_hash` onto all 37 existing events. Plans 07-02 and 07-03 build the data pull script and committee report respectively.

The single most important insight from the POC: Umami Cloud's API does not expose per-session event streams (the `/sessions` endpoint is self-hosted-only). This caps blind intent reconstruction at ~60% from aggregate data. Closing this gap requires adding Umami's internal session ID as a property on every custom event — which is exactly what the `session_hash` injection task in 07-01 accomplishes. The chatbot deep link click gap is the second most important: the chatbot may be the site's highest-value referral engine but is completely invisible to analytics.

**Primary recommendation:** Implement 07-01 first (instrumentation gaps + session_hash injection), then 07-02 (data pull script), then 07-03 (committee report). Do not parallelize — each plan's output is the next plan's input.

---

## Standard Stack

### Core

| Library / Service | Version | Purpose | Why Standard |
|------------------|---------|---------|--------------|
| Node.js native `fetch` | v18+ | Umami Cloud + Supabase REST API calls | Available natively in Node 18+, no extra dependencies |
| `dotenv` | latest | Load `.env` credentials | Established pattern; `.env` already exists in project |
| Umami Cloud API | `/analytics/us/api/` prefix | Analytics event data source | Already deployed; POC confirmed endpoints work |
| Supabase REST API | v1 | Chat log data source | Already deployed; secret key already in `.env` |
| Pandoc | latest stable | Markdown → PDF for committee | Free, offline, professional, automatable; recommended in POC |
| GitHub Actions | ubuntu-latest + Node 20 | Monthly cron scheduling | Already in repo ecosystem; full workflow designed in POC |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `node:fs` | built-in | Write JSON/markdown output files | For `--out` flag in data pull script |
| `node:path` | built-in | Cross-platform path handling | Consistent with existing scripts like `enrich-muse-places-osm.mjs` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pandoc PDF | markdown-pdf npm package | markdown-pdf requires Puppeteer/Chromium, more fragile; Pandoc + LaTeX is more professional and automatable |
| Pandoc PDF | Browser print via Vercel function | Browser print is inconsistent across OS/browser; Pandoc is deterministic |
| GitHub Actions cron | Local cron (`crontab`) | Local cron fails when machine is off; GitHub Actions is always-on |
| Umami Cloud Bearer token | Umami Pro service account key | Service account is Umami Pro feature — not available on free tier. Bearer token approach is the only option on free tier. |

**Installation:**
```bash
# No npm packages needed for the data pull script itself (native fetch)
# For report template (optional branded CSS via markdown-pdf fallback):
npm install --save-dev markdown-pdf

# Pandoc (system-level, one-time):
# Windows: choco install pandoc
# Mac: brew install pandoc
# Linux: sudo apt-get install pandoc
```

---

## Architecture Patterns

### Recommended Project Structure

```
scripts/
├── demand-signal-pull.mjs          # Plan 07-02: data pull + intent classification + attribution
├── build-chat-knowledge-pack.js    # Existing — reference for script style

.github/
└── workflows/
    └── demand-signal-report.yml    # Plan 07-02: monthly cron

reports/
└── YYYY-MM-demand-signals.json     # Output from data pull script

website/cultural-map-redesign-stitch-lab/
└── index-maplibre-analytics.js     # Plan 07-01: session_hash injection + 12 new events

.planning/phases/07-demand-signal-reporting/
├── COMMITTEE-REPORT-TEMPLATE.md    # Plan 07-03: already designed, needs wiring
├── SAMPLE-REPORT-FEBRUARY-2026.md  # Plan 07-03: reference output
├── METRICS-DATASOURCE-MAPPING.md  # Plan 07-02: reference spec
└── PIPELINE-ARCHITECTURE.md       # Plan 07-02: reference spec
```

### Pattern 1: Umami Cloud API Authentication

**What:** Umami Cloud has no service account API key. Authentication uses a Bearer token extracted from `localStorage['umami.auth']` when logged into cloud.umami.is. This token is session-scoped and expires.

**Critical gotcha — use the correct API prefix:**
```javascript
// CORRECT: internal analytics path
const BASE = 'https://cloud.umami.is/analytics/us/api/websites/{WEBSITE_ID}';

// WRONG: returns 401
const BASE = 'https://cloud.umami.is/api/websites/{WEBSITE_ID}';
```

**Token extraction (do this manually when token expires):**
```javascript
// In agent-browser after logging in to cloud.umami.is:
JSON.parse(localStorage.getItem('umami.auth')).token
// Store result as UMAMI_BEARER_TOKEN in .env
```

**API call pattern:**
```javascript
async function umamiGet(path, params) {
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${process.env.UMAMI_BEARER_TOKEN}` }
  });
  if (!res.ok) throw new Error(`Umami API ${res.status}: ${await res.text()}`);
  return res.json();
}
```

**Proven endpoints (all verified in POC):**
```
GET /stats?startAt={ms}&endAt={ms}
  → { visitors, visits, pageviews, bounces, totaltime }

GET /metrics?startAt={ms}&endAt={ms}&type=event
  → [{ x: "category:filter", y: 7 }, ...]

GET /event-data/properties?startAt={ms}&endAt={ms}
  → [{ eventName, propertyName, total }, ...]

GET /event-data/values?startAt={ms}&endAt={ms}&event={name}&propertyName={prop}
  → [{ value, total }, ...]

GET /metrics?startAt={ms}&endAt={ms}&type=url
  → [{ x: "/directory.html", y: 12 }, ...]
```

### Pattern 2: Supabase REST for Chat Logs

**What:** The Supabase anon key is insert-only (enforced by RLS). Reading `chat_logs` requires the secret key from `.env`.

```javascript
async function fetchChatLogs(startIso, endIso) {
  const url = new URL(`${process.env.SUPABASE_URL}/rest/v1/chat_logs`);
  url.searchParams.set('select', 'id,created_at,session_hash,query_text,response_text,intent,assets_referenced,duration_ms,model');
  url.searchParams.set('created_at', `gte.${startIso}`);
  url.searchParams.set('created_at', `lte.${endIso}`);
  url.searchParams.set('order', 'created_at.desc');
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.SUPABASE_SECRET_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SECRET_KEY}`
    }
  });
  return res.json();
}
```

### Pattern 3: Session Hash Injection (07-01 Core Task)

**What:** Umami Cloud does not expose session IDs in its API. The workaround is to inject a stable per-session fingerprint as a property on every custom event. The existing `CulturalMapAnalytics.track()` wrapper is the single injection point.

**Implementation in `index-maplibre-analytics.js`:**
```javascript
// Generate once per page load, stored in sessionStorage
function _getSessionHash() {
  var key = 'gvnc_session_hash';
  var existing = sessionStorage.getItem(key);
  if (existing) return existing;
  // Fingerprint: timestamp + random (not crypto-secure, but sufficient for analytics)
  var hash = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  sessionStorage.setItem(key, hash);
  return hash;
}

function track(eventName, data) {
  if (!window.umami || typeof window.umami.track !== 'function') return;
  var key = _dedupKey(eventName, data);
  var now = Date.now();
  if (_lastKeys[key] && (now - _lastKeys[key]) < THROTTLE_MS) return;
  _lastKeys[key] = now;
  try {
    // Inject session_hash on every event
    var payload = Object.assign({ session_hash: _getSessionHash() }, data || {});
    window.umami.track(eventName, payload);
  } catch (e) {}
}
```

**Why sessionStorage (not localStorage):** A new hash per browser tab session. If the same person opens two tabs, they get two hashes — which is correct (two sessions). If they close and reopen, they get a new hash — also correct.

**Why not `umami.sessionId`:** Umami's internal session ID is not exposed on `window.umami`. It's stored in an internal closure. The fingerprint approach is the reliable alternative.

### Pattern 4: New Event Instrumentation Pattern (07-01)

Following the established pattern from Phase 6 and 6.1:

**Chat deep link click tracking (highest priority gap):**
The chatbot renders `[[Asset Name|pid]]` deep links as anchor tags. Click tracking uses event delegation at the chat panel container level:

```javascript
// In index-maplibre-chat-controller.js or index-maplibre-bindings.js
document.addEventListener('click', function(e) {
  var link = e.target.closest('[data-chat-deeplink]');
  if (!link) return;
  CulturalMapAnalytics.track('chat:deeplink-click', {
    venue: link.dataset.venueName,
    pid: link.dataset.pid
  });
});
```

**Chat open/close:**
```javascript
// When chat panel opens:
CulturalMapAnalytics.track('chat:open', {});
// When chat panel closes:
CulturalMapAnalytics.track('chat:close', {});
```

**Explore (directory) interactions:**
```javascript
// Search query in directory:
CulturalMapAnalytics.track('explore:search', { query, results_count });
// Card expand:
CulturalMapAnalytics.track('explore:card-expand', { name, category, city });
```

**Session start (fires once per load):**
```javascript
// In index-maplibre.js main init or analytics.js itself:
CulturalMapAnalytics.track('session:start', { referrer: document.referrer || 'direct' });
```

### Pattern 5: Intent Classification (07-02)

Rule-based decision tree operating on aggregate signal counts (not per-session, since Umami Cloud doesn't expose sessions). Applied per reporting period:

```javascript
function classifyIntentClusters(events, chatLogs) {
  const clusters = {};
  const byName = {}; // event name → count
  const byProp = {}; // "event:prop=value" → count

  // Index events
  events.summary.forEach(e => byName[e.name] = e.count);
  // ... index property values

  // Decision tree (in priority order):
  if (byName['outbound:lodging-vrbo'] > 0) {
    clusters['trip_researcher'] = { confidence: 'HIGH', evidence: [...] };
  }
  if (byName['outbound:event-ticket'] > 0) {
    const hasTonight = byProp['events:date-filter.filter=tonight'] > 0;
    clusters[hasTonight ? 'tonight_planner' : 'event_hunter'] = { confidence: 'HIGH' };
  }
  // ... etc. (full taxonomy in PIPELINE-ARCHITECTURE.md)

  return clusters;
}
```

**7 intent types (from PIPELINE-ARCHITECTURE.md):**
1. `tonight_planner` — `events:date-filter=tonight` + dining chatbot query + ticket clicks
2. `trip_researcher` — `outbound:lodging-vrbo` + `events:date-filter=weekend` + multiple categories
3. `art_seeker` — 2+ of: Galleries, Cultural Orgs, Performing Arts filters
4. `family_planner` — Education filter or search terms matching kids/family
5. `event_hunter` — `toggle:events-14d=on` + detail opens, no lodging
6. `local_explorer` — `toggle:open-now=on` + short session + no outbound lodging
7. `casual_browser` — residual bucket

### Pattern 6: Business Referral Attribution (07-02)

4-tier scoring hierarchy. Attribution score per venue per period:

```javascript
const score = (outbound_ticket_clicks * 100)
            + (outbound_website_clicks * 40)
            + (detail_opens * 10)
            + (marker_clicks * 5)
            + (chat_recommendations * 5)
            + (chat_click_throughs * 30);  // only after 07-01 ships chat:deeplink-click
```

Chat recommendations are extracted by parsing `response_text` from Supabase for `[[Venue Name|pid]]` patterns:
```javascript
const deepLinkRegex = /\[\[([^\|]+)\|([^\]]+)\]\]/g;
let m;
while ((m = deepLinkRegex.exec(responseText)) !== null) {
  chatRecommendations[m[1]] = (chatRecommendations[m[1]] || 0) + 1;
}
```

### Pattern 7: GitHub Actions Workflow (07-02)

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
          node scripts/demand-signal-pull.mjs \
            --from $MONTH_START --to $MONTH_END \
            --out reports/$(date +%Y-%m)-demand-signals.json
      - name: Commit report
        run: |
          git config user.email "reports@exploregvnc.com"
          git config user.name "Demand Signal Bot"
          git add reports/
          git diff --staged --quiet || git commit -m "chore: monthly demand signal report $(date +%Y-%m)"
          git push
```

**UMAMI_BEARER_TOKEN manual refresh cadence:** Quarterly or when API calls return 401. Store in GitHub Actions secrets after refreshing. This is a known operational cost of the free-tier approach.

### Anti-Patterns to Avoid

- **Don't fetch all events then filter client-side.** Use `event-data/values` with specific `event` and `propertyName` params — it's one API call per combination and returns pre-aggregated counts.
- **Don't use `/api/` prefix for Umami Cloud.** Always use `/analytics/us/api/`. The standard prefix returns 401 with no useful error.
- **Don't use Supabase anon key for chat_logs reads.** RLS policy is insert-only on anon key. Secret key is required for reads.
- **Don't try to reconstruct individual sessions from Umami Cloud.** The sessions endpoint is self-hosted-only. Use aggregate co-occurrence clustering and session_hash injection going forward.
- **Don't add `session_hash` as a separate event.** Inject it as a property on every existing event via the `track()` wrapper — this is the centralized approach and requires only one code change.
- **Don't use `localStorage` for session hash.** Use `sessionStorage` — it resets per tab, which is the correct session boundary for analytics.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown → PDF | Custom HTML→PDF pipeline | Pandoc + LaTeX template | Pandoc handles typography, page breaks, tables correctly; already designed in POC |
| Intent classification | ML model | Rule-based decision tree | Traffic volume is too low for ML (5-50 visitors/day). Rules are interpretable and debuggable. |
| Session attribution | Custom fingerprinting in API | session_hash injected via `track()` wrapper + sessionStorage | Minimal code change, works within Umami's constraints |
| Chat venue extraction | NLP | Regex on `[[Venue Name|pid]]` pattern | Pattern is deterministic and already defined in the codebase |
| Scheduling | Cron on dev machine | GitHub Actions workflow_dispatch + schedule | GitHub Actions is always-on; local cron dies when machine sleeps |

**Key insight:** At current traffic volumes (5-50 visitors/day), sophisticated ML approaches are both unnecessary and counterproductive. Rule-based classification is transparent, debuggable, and correct for the committee audience.

---

## Common Pitfalls

### Pitfall 1: Umami Bearer Token Expiry
**What goes wrong:** The GitHub Actions job starts returning 401 errors silently. The report script fails with no data. No one notices until the monthly report is empty.
**Why it happens:** `localStorage['umami.auth']` is a session-scoped JWT. It expires. Umami Cloud free tier has no service account tokens.
**How to avoid:** Add explicit 401 detection in the data pull script that exits with a non-zero code and a clear error message ("UMAMI_BEARER_TOKEN expired — refresh from cloud.umami.is dashboard"). The GitHub Actions job will then fail visibly. Establish a quarterly calendar reminder to refresh.
**Warning signs:** Any Umami API call returning HTTP 401 or 403.

### Pitfall 2: Wrong API Base URL
**What goes wrong:** All Umami API calls return 401 with no useful message.
**Why it happens:** The public API path (`/api/`) is not the internal path Umami Cloud uses. The correct path is `/analytics/us/api/`.
**How to avoid:** Hardcode the correct base URL constant in the data pull script. Add a comment: "// Must use /analytics/us/api/ prefix — /api/ returns 401 on Umami Cloud."
**Warning signs:** 401 even with a freshly-extracted token.

### Pitfall 3: Supabase Anon Key vs Secret Key Confusion
**What goes wrong:** `chat_logs` queries return empty arrays or 403 errors.
**Why it happens:** The anon key has insert-only RLS policy. Reads require the secret key.
**How to avoid:** In the data pull script, always use `SUPABASE_SECRET_KEY` for reads. Never use `SUPABASE_ANON_KEY`.
**Warning signs:** Empty array response (not 403 — Supabase with wrong RLS returns empty, not error, for some query shapes).

### Pitfall 4: Toggle Event Inflation
**What goes wrong:** The report shows 300 `toggle:open-now` events for 50 visitors — meaningless inflation.
**Why it happens:** The POC revealed that 2 visitors generated 49 of 68 custom events, largely from UI exploration toggling. Reporting raw counts misleads the committee.
**How to avoid:** In the report, distinguish "unique sessions that used the feature" (approximated via session_hash after 07-01) from "total toggle events." Until session_hash data accumulates, add a caveat in the report technical notes.
**Warning signs:** Toggle counts >> visitor counts (ratio > 3:1 is suspicious).

### Pitfall 5: Session Hash Not Present on Pre-07-01 Data
**What goes wrong:** Running the data pull script on historical data from before 07-01 ships returns events without `session_hash`. The intent clustering code crashes or produces garbage.
**Why it happens:** `session_hash` is a new property added by 07-01. Historical events won't have it.
**How to avoid:** The intent classification in 07-02 must work on both pre-07-01 aggregate data (no session_hash, use co-occurrence) and post-07-01 data (with session_hash, use per-session journeys). Build two code paths, not one.
**Warning signs:** `session_hash` property missing from event-data/values responses.

### Pitfall 6: Over-Promising Intent Reconstruction Accuracy
**What goes wrong:** The committee expects the report to show "exactly which visitors did what." The 60% blind reconstruction accuracy disappoints.
**Why it happens:** Session-level attribution requires per-session data that Umami Cloud API doesn't expose. This is a structural limitation, not a bug.
**How to avoid:** The committee report template already accounts for this (REPORTER-HANDOFF.md design principle 4: "Measurement gaps are flagged, not hidden"). The report should state confidence levels (HIGH/MODERATE/LOW) for each intent cluster. Don't over-promise; the data is still uniquely valuable.
**Warning signs:** Report uses language like "Visitor X did..." (implying individual attribution). Should be "visitors who filtered for trails and then searched for lodging suggest..."

### Pitfall 7: Chatbot Deep Link Click Undercount
**What goes wrong:** Business referral ranking systematically underscores chatbot-recommended venues. The report shows low scores for dining establishments that were recommended many times by the AI.
**Why it happens:** Before 07-01 ships `chat:deeplink-click`, chatbot recommendations are tracked via `assets_referenced` in Supabase (count of AI mentions) but NOT via actual user click-throughs. The attribution score should weight this differently than a confirmed click.
**How to avoid:** In the attribution scoring, add a `note` field to any venue that has chat recommendations but zero `chat_click_throughs`: "Score is undercount — chatbot click-through tracking ships in Phase 7-01." This is already documented in the PIPELINE-ARCHITECTURE.md attribution schema.

---

## Code Examples

Verified patterns from POC and existing codebase:

### Terminal test of Umami API (verified working in POC)
```bash
# From .env
source .env

# Test stats endpoint
curl -s \
  -H "Authorization: Bearer $UMAMI_BEARER_TOKEN" \
  "https://cloud.umami.is/analytics/us/api/websites/${UMAMI_WEBSITE_ID}/stats?startAt=$(date -d '30 days ago' +%s000)&endAt=$(date +%s000)"
```

### Terminal test of Supabase REST (verified working in POC)
```bash
source .env
curl -s \
  -H "apikey: $SUPABASE_SECRET_KEY" \
  -H "Authorization: Bearer $SUPABASE_SECRET_KEY" \
  "$SUPABASE_URL/rest/v1/chat_logs?select=*&order=created_at.desc&limit=5"
```

### Existing script style reference (`enrich-muse-places-osm.mjs`)
```javascript
// Existing scripts use: ES modules (.mjs), node:fs, node:path, no build step
// demand-signal-pull.mjs should follow the same conventions
import fs from 'node:fs';
import path from 'node:path';
// dotenv loaded via: node --env-file=.env scripts/demand-signal-pull.mjs
```

### Extracting event property breakdowns from Umami
```javascript
// Dynamically discover all event+property combinations, then fetch values
async function fetchAllEventProperties(startAt, endAt) {
  const props = await umamiGet('/event-data/properties', { startAt, endAt });
  const results = {};
  for (const { eventName, propertyName } of props) {
    const key = `${eventName}.${propertyName}`;
    const values = await umamiGet('/event-data/values', {
      startAt, endAt, event: eventName, propertyName
    });
    results[key] = values; // [{ value, total }, ...]
  }
  return results;
}
```

### Chat venue recommendation extraction
```javascript
function extractChatRecommendations(chatLogs) {
  const counts = {};
  const regex = /\[\[([^\|]+)\|([^\]]+)\]\]/g;
  chatLogs.forEach(log => {
    let m;
    while ((m = regex.exec(log.response_text)) !== null) {
      const venueName = m[1];
      counts[venueName] = (counts[venueName] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([venue, count]) => ({ venue, count }));
}
```

---

## Open Questions

1. **Where does `UMAMI_BEARER_TOKEN` live in GitHub Actions secrets?**
   - What we know: Must be stored as a GitHub Actions secret before the workflow can run
   - What's unclear: The repo may not have GitHub Actions secrets configured yet
   - Recommendation: 07-02 plan should include a "setup" task: navigate to repo Settings → Secrets → add UMAMI_WEBSITE_ID, UMAMI_BEARER_TOKEN, SUPABASE_URL, SUPABASE_SECRET_KEY

2. **Does Umami Cloud's `/analytics/us/api/` prefix ever change?**
   - What we know: The prefix was discovered empirically during POC; it is not documented in Umami's public docs
   - What's unclear: Whether this path is stable or could change with Umami Cloud updates
   - Recommendation: Add retry logic with a clear error message when the API returns unexpected status codes

3. **How will the `session_hash` property interact with Umami's property storage limits?**
   - What we know: Umami Cloud stores custom event properties; the free tier limits are not fully documented
   - What's unclear: Whether adding `session_hash` to all 37 existing events (doubling property count) triggers any rate limits or storage thresholds
   - Recommendation: Monitor Umami dashboard after 07-01 ships. If property counts are throttled, remove `session_hash` from low-signal events (toggles, category:clear) and keep it only on high-value events (detail:open, outbound:*, chat:*)

4. **What is the Pandoc installation story on the local Windows dev machine?**
   - What we know: The delivery guide specifies `choco install pandoc` for Windows
   - What's unclear: Whether Pandoc with a LaTeX engine (required for PDF) is available on MSYS_NT (the project's shell)
   - Recommendation: Verify `pandoc --version` works. If LaTeX engine is missing, use `--pdf-engine=weasyprint` or the `markdown-pdf` npm package as fallback. The committee report can also be distributed as HTML-to-print if needed.

5. **Will the GitHub Actions cron job have network access to Umami Cloud and Supabase?**
   - What we know: GitHub Actions `ubuntu-latest` runners have full internet access by default
   - What's unclear: Whether Supabase or Umami Cloud have any IP allowlisting that might block GitHub Actions runner IPs
   - Recommendation: Test with `workflow_dispatch` (manual trigger) before relying on the monthly cron

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Session attribution via Umami sessions API | Session hash as custom event property (workaround) | 2026-02-18 POC | Umami Cloud does not expose sessions API; fingerprint approach is the only option on free tier |
| Manual report generation (copy-paste from dashboard) | Automated data pull script + markdown template | Phase 7 implementation | Report generation goes from 2+ hours manual work to 5-minute automated run |
| 9 tracked event types (Phase 6 baseline) | 37 existing + 12 new = 49 total event types (after 07-01) | Phase 7-01 | Complete behavioral coverage including chatbot clicks, session starts, directory interactions |

**Deprecated/outdated:**
- Umami share dashboard URL (`/share/875bmvTJ7Hd2oLAx`): Provides visual-only summary, no REST API. Cannot be used for automated reporting. Only useful for committee members browsing the dashboard manually.

---

## Sources

### Primary (HIGH confidence — POC-verified)

- **POC-INTERNAL-BRIEF.md** — Synthetic user swarm results, Umami API + Supabase REST access confirmed working, instrumentation gap inventory
- **PIPELINE-ARCHITECTURE.md** — Full pipeline design: data pull script interface, session reconstruction approaches, 7-type intent taxonomy, 4-tier attribution schema, GitHub Actions workflow
- **METRICS-DATASOURCE-MAPPING.md** — Exact API endpoints and calculation formulas for every committee report metric
- **REPORTER-HANDOFF.md** — Report design decisions, template design rationale, delivery guide
- **BLIND-INTENT-RECONSTRUCTION.md** — Empirical ~60% accuracy measurement, behavioral pattern taxonomy from real data
- **`index-maplibre-analytics.js`** — Current instrumentation: 24 event types, IIFE pattern, dedup throttle architecture
- **`06.1-01-SUMMARY.md`** — Phase 6.1 completed: 7 additional event types (now 23 total after Phase 6 + 6.1 baseline)
- **ROADMAP.md** — Confirmed 3-plan decomposition: 07-01 (instrumentation), 07-02 (pipeline), 07-03 (report)

### Secondary (MEDIUM confidence)

- **COMMITTEE-REPORT-TEMPLATE.md** — Report structure already fully designed, validated against POC swarm data
- **REPORT-DELIVERY-GUIDE.md** — Pandoc + LaTeX workflow specified, Node.js automation pseudocode included
- **SAMPLE-REPORT-FEBRUARY-2026.md** — Filled-in example using POC data; proves the format works

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tools and APIs are proven in production by POC
- Architecture: HIGH — PIPELINE-ARCHITECTURE.md contains battle-tested design from POC
- Pitfalls: HIGH — pitfalls are observed from actual POC execution, not hypothetical
- Umami token refresh cadence: MEDIUM — known operational cost, exact expiry period not documented

**Research date:** 2026-02-17
**Valid until:** 60 days — Umami Cloud API path (`/analytics/us/api/`) could change; Supabase REST API is stable

---

## Phase 7 Plan Summary (For Planner)

The three plans map directly to the 3 roadmap deliverables. The dependency chain is strict:

### 07-01: Instrumentation Gaps (ships first)
**What:** Modify `index-maplibre-analytics.js` to inject `session_hash` on all existing events + add 12 new event types
**Key tasks:**
1. Add `_getSessionHash()` using sessionStorage, inject into `track()` wrapper
2. Add `chat:deeplink-click` event (highest priority gap — chatbot referral invisibility)
3. Add `chat:open` and `chat:close` events
4. Add `chat:query-sent` event (client-side query submission tracking)
5. Add `session:start` event (fired once per page load)
6. Add `explore:search`, `explore:card-expand`, `explore:deeplink-click` (directory interactions)
7. Add `itinerary:scroll-depth` and `itinerary:show-map-click`
8. Add `page:section-visibility` (IntersectionObserver on major sections)
**Files:** `index-maplibre-analytics.js` + whichever controller modules fire the new events
**Deploy:** Stitch-lab as always

### 07-02: Reporting Pipeline (ships after 07-01)
**What:** `scripts/demand-signal-pull.mjs` + GitHub Actions workflow
**Key tasks:**
1. Create `scripts/demand-signal-pull.mjs` with `--from`, `--to`, `--out`, `--verbose` flags
2. Implement Umami API calls (stats + events + event-data/properties + event-data/values)
3. Implement Supabase chat_logs fetch
4. Implement 7-type intent classification decision tree
5. Implement 4-tier business referral attribution scoring
6. Implement chatbot recommendation extraction via `[[Venue|pid]]` regex
7. Output unified JSON schema (see PIPELINE-ARCHITECTURE.md section 1.3)
8. Create `.github/workflows/demand-signal-report.yml` with monthly cron + workflow_dispatch
9. Document GitHub Actions secret setup
**Files:** `scripts/demand-signal-pull.mjs`, `.github/workflows/demand-signal-report.yml`

### 07-03: Committee Report (ships after 07-02)
**What:** Wire the markdown template to the pipeline output + Pandoc PDF setup
**Key tasks:**
1. Verify Pandoc installation works on local machine (test with sample report)
2. Finalize `COMMITTEE-REPORT-TEMPLATE.md` as the authoritative output format
3. Add report generation logic to `demand-signal-pull.mjs` (or separate `scripts/generate-report.mjs`)
4. Test full end-to-end: `node scripts/demand-signal-pull.mjs | pandoc → .pdf`
5. Create `scripts/publish-monthly-report.sh` automation script
6. Verify GitHub Actions workflow can produce the markdown output (PDF generation stays local, not in Actions, to avoid LaTeX dependency in CI)
**Files:** `scripts/generate-report.mjs` (optional separation), `scripts/publish-monthly-report.sh`

**Requirement coverage:**
- REPT-01: Umami stats pull (07-02 task 2)
- REPT-02: Supabase chat_logs pull (07-02 task 3)
- REPT-03: Top 10 venues by detail opens + outbound clicks (07-02 task 5, attribution scoring)
- REPT-04: Category filter frequency ranking (07-02 task 2, event-data/values for category:filter)
- REPT-05: Zero-result search queries (07-01 adds `search:zero` property; 07-02 reports on it)
- REPT-06: Chatbot intent distribution (07-02 task 6, micro-intent classification on query_text)
- REPT-07: Markdown → PDF via Pandoc (07-03 task 1-4)
- REPT-08: GitHub Actions + manual CLI trigger (07-02 task 8, `workflow_dispatch`)
