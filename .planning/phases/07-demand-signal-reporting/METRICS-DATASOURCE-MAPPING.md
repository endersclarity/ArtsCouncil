# Demand Signal Report: Metrics-to-Datasource Mapping

This document specifies exactly where each committee report metric comes from and how to retrieve it.

---

## Core Metrics (Executive Summary)

| Metric | Data Type | Umami Source | Supabase Source | Calculation | Notes |
|--------|-----------|--------------|-----------------|------------|-------|
| **Total Visitors** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/events/stats?startAt={ts}&endAt={ts}` → `visitors` field | — | Use `visitors` from stats endpoint | Unique visitor count for period |
| **Total Page Views** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/events/stats` → `pageviews` field | — | Use `pageviews` from stats endpoint | All page loads including repeats |
| **Total Visits** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/events/stats` → `visits` field | — | Use `visits` from stats endpoint | Session count (may differ from visitors if repeat sessions) |
| **Avg Visit Duration** | Duration | `GET /analytics/us/api/websites/{WEBSITE_ID}/events/stats` → `avgDuration` field | — | Use `avgDuration` (in ms) from stats endpoint | Milliseconds; convert to minutes for report (÷ 60,000) |
| **Bounce Rate** | Percentage | `GET /analytics/us/api/websites/{WEBSITE_ID}/events/stats` → `bounceRate` field | — | Use `bounceRate` from stats endpoint | Percentage of single-page visits |

---

## Category & Discovery Metrics

| Metric | Data Type | Umami Source | Calculation | Notes |
|--------|-----------|--------------|------------|-------|
| **Category Filter Count** (by category) | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/event-data/values?startAt={ts}&endAt={ts}&event=category:filter&propertyName=category` → returns array of `{value, total}` | Sum `total` for each `value` (category name) | Shows which categories visitors explored. Categories: "Walks & Trails", "Historic Landmarks", "Galleries & Museums", "Eat, Drink & Stay", "Cultural Organizations", etc. |
| **Top Filtered Category** | String | From category:filter breakdown above | Find category with highest `total` | Which category was explored most this month |
| **Filter Reset Count** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/metrics?startAt={ts}&endAt={ts}&type=event` → filter for event `category:clear` | Count events where `x: "event:category:clear"` | Indicates visitors cleared filters and started a new search |

---

## Feature & Interaction Metrics

| Metric | Data Type | Umami Source | Calculation | Notes |
|--------|-----------|--------------|------------|-------|
| **"Open Now" Toggle Count** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/metrics?startAt={ts}&endAt={ts}&type=event` → filter for `event:toggle:open-now` | Count events where `x: "event:toggle:open-now"` | High counts may indicate UI exploration or real-time status checking |
| **"Events 14d" Toggle Count** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/metrics` → filter for `event:toggle:events-14d` | Count events where `x: "event:toggle:events-14d"` | Indicates interest in upcoming events |
| **Detail Panel Opens** (by venue) | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/event-data/values?startAt={ts}&endAt={ts}&event=detail:open&propertyName=name` | Sum `total` for each venue `value` | Which venues got clicked for details. Also get properties: `city`, `category` |
| **Total Detail Panel Opens** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/metrics` → filter for `event:detail:open` | Count all `detail:open` events | Total engagement with venue detail panels |
| **Map Marker Clicks** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/metrics` → filter for `event:marker:click` | Count all `marker:click` events | Should be low; indicates map is used less than list UI |

---

## Business Referral Metrics (Conversions)

| Metric | Data Type | Umami Source | Calculation | Notes |
|--------|-----------|--------------|------------|-------|
| **Event Ticket Referrals** (total) | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/metrics?type=event` → filter for `event:outbound:event-ticket` | Count all `outbound:event-ticket` events | Direct traffic to event ticketing sites (nevadacountyswings.org, etc.) |
| **Event Ticket Referrals** (by event) | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/event-data/values?startAt={ts}&endAt={ts}&event=outbound:event-ticket&propertyName=title` | Returns array of `{value, total}` for each event `title` | Which specific events got ticket clicks |
| **Event Ticket Referrals** (by venue) | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/event-data/values?startAt={ts}&endAt={ts}&event=outbound:event-ticket&propertyName=venue` | Returns array of `{value, total}` for each venue | Which venues hosted events that got referrals |
| **Lodging Referrals** (VRBO/hotels) | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/metrics` → filter for `event:outbound:lodging-vrbo` | Count all `outbound:lodging-vrbo` events | Direct traffic to booking.com, VRBO, Airbnb, etc. |

---

## Time-Based Intent Metrics

| Metric | Data Type | Umami Source | Calculation | Notes |
|--------|-----------|--------------|------------|-------|
| **"Tonight" Event Filter** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/event-data/values?startAt={ts}&endAt={ts}&event=events:date-filter&propertyName=filter` → filter for `value: "tonight"` | Find `total` where `value == "tonight"` | Same-day planning intent |
| **"Weekend" Event Filter** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/event-data/values` for `events:date-filter` → filter for `value: "weekend"` | Find `total` where `value == "weekend"` | Upcoming weekend planning |
| **14-Day Event Filter** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/event-data/values` for `events:date-filter` → filter for `value: "14d"` | Find `total` where `value == "14d"` | Future trip planning |

---

## Page Visit Metrics

| Metric | Data Type | Umami Source | Calculation | Notes |
|--------|-----------|--------------|------------|-------|
| **Hub Page Views** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/metrics?startAt={ts}&endAt={ts}&type=page` → filter for page path `/` or `/index-maplibre-hero-intent.html` | Count views for landing/hub page | Main map interface; should be highest traffic |
| **Directory Page Views** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/metrics?type=page` → filter for `/directory.html` | Count views for directory page | Dedicated venue listing page |
| **Events Page Views** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/metrics?type=page` → filter for `/events.html` | Count views for events page | Event-focused secondary page |
| **Itineraries Page Views** | Count | `GET /analytics/us/api/websites/{WEBSITE_ID}/metrics?type=page` → filter for `/itineraries.html` | Count views for itineraries page | Curated routes secondary page |
| **Page View % Share** | Percentage | From individual page views above + total pageviews from stats | `(page_views / total_pageviews) * 100` | What % of all traffic went to each page |

---

## AI Concierge / Chatbot Metrics

| Metric | Data Type | Supabase Source | Calculation | Notes |
|--------|-----------|-----------------|------------|-------|
| **Total Chatbot Queries** | Count | `SELECT COUNT(*) FROM chat_logs WHERE created_at BETWEEN '{start_date}' AND '{end_date}'` | Count all rows in chat_logs table for period | Every user query to the AI concierge |
| **Chatbot Queries by Topic** | Count | `SELECT intent, COUNT(*) FROM chat_logs WHERE created_at BETWEEN '{start_date}' AND '{end_date}' GROUP BY intent` | Group by `intent` field and count | The `intent` field should be pre-classified (dining, events, trip planning, etc.) |
| **Top Recommended Venues** (from chatbot) | Count | Parse `response_text` field and count venue mentions in deep links `[[Venue Name\|pid]]` | Grep chatbot responses for `[[` pattern and count | Shows which venues the AI recommends most frequently |
| **Unanswered Questions** | List | `SELECT query_text FROM chat_logs WHERE created_at BETWEEN '{start_date}' AND '{end_date}' AND response_text LIKE '%sorry%' OR response_text LIKE '%don't have%'` | Manual review of responses that indicate missing information | Flag queries AI couldn't answer well |
| **Avg Response Time** (chatbot) | Duration (ms) | `SELECT AVG(duration_ms) FROM chat_logs WHERE created_at BETWEEN '{start_date}' AND '{end_date}'` | Average of `duration_ms` field | How long API takes to respond (for performance tracking) |

---

## Visitor Segmentation / Clustering

| Metric | Data Type | Umami + Inference | Calculation | Notes |
|--------|-----------|------------------|------------|-------|
| **"Tonight Planner" Segment** | Estimated Count | Identify visitors with `events:date-filter == "tonight"` + `outbound:event-ticket` clicks | Count unique sessions with this pattern | Same-day event/dining seekers (high-intent, convertible) |
| **"Trip Researcher" Segment** | Estimated Count | Identify visitors with `events:date-filter == "weekend"` + `outbound:lodging-vrbo` + high category filter count | Count unique sessions with this pattern | Out-of-town planning, higher session duration, multi-category interest |
| **"Local Browser" Segment** | Estimated Count | Identify visitors with low toggle/filter count + no outbound clicks + possibly accessing from Nevada County IP range | Residual classification | Local stakeholders, staff, or people testing the site |

**Note:** Without session-level ID tracking in Umami custom events, these segments are probabilistic inference, not definitive audience classification. See Technical Notes in report template for details.

---

## Month-over-Month Trend Calculations

To compare this month to last month, run the same metrics queries for:
- **This month:** `startAt = first day of current month (midnight), endAt = today or last day of month`
- **Last month:** `startAt = first day of previous month, endAt = last day of previous month`

Then calculate:
| Trend Metric | Formula | Interpretation |
|--------------|---------|-----------------|
| **Visitor Growth %** | `((this_month - last_month) / last_month) * 100` | Positive = growth; negative = decline |
| **Referral Growth %** | `((this_month_refs - last_month_refs) / last_month_refs) * 100` | Shows business referral momentum |
| **Engagement Growth %** | `((this_month_detail_opens - last_month_detail_opens) / last_month_detail_opens) * 100` | Shows interest in venues |
| **Chatbot Adoption %** | `((this_month_queries - last_month_queries) / last_month_queries) * 100` | Shows AI feature uptake |

---

## API Reference Quick Links

### Umami Cloud API
- **Base URL:** `https://cloud.umami.is/analytics/us/api/`
- **Authentication:** `Authorization: Bearer {token}` (from localStorage['umami.auth'])
- **Website ID:** (retrieve from Umami dashboard or .env)

**Key endpoints:**
```
GET /websites/{WEBSITE_ID}/events/stats?startAt={startTs}&endAt={endTs}
  → Returns: {visitors, visits, pageviews, bounceRate, avgDuration}

GET /websites/{WEBSITE_ID}/metrics?startAt={startTs}&endAt={endTs}&type=event
  → Returns: [{x: "event:name", y: count}, ...]

GET /websites/{WEBSITE_ID}/event-data/properties?startAt={startTs}&endTs={endTs}
  → Returns: [{eventName, propertyName, total}, ...]

GET /websites/{WEBSITE_ID}/event-data/values?startAt={startTs}&endAt={endTs}&event={eventName}&propertyName={propName}
  → Returns: [{value, total}, ...]
```

### Supabase REST API
- **Base URL:** `https://tguligitecsfxfkycknh.supabase.co/rest/v1/`
- **Authentication:** `Authorization: Bearer {SUPABASE_SECRET_KEY}` (from .env)

**Chat logs table:**
```
GET /chat_logs?select=*&created_at=gte.{start_date}&created_at=lt.{end_date}&order=created_at.desc
  → Returns: {id, created_at, session_hash, query_text, response_text, intent, assets_referenced, duration_ms, model, ip_hash, meta}
```

---

## Automation & Scripts

### How to Generate This Programmatically

**Pseudocode (Node.js):**

```javascript
// 1. Fetch from Umami
const umami_stats = await fetch(
  'https://cloud.umami.is/analytics/us/api/websites/{WEBSITE_ID}/events/stats?' +
  'startAt=' + startOfMonth + '&endAt=' + endOfMonth,
  { headers: { 'Authorization': 'Bearer ' + umamiToken } }
).then(r => r.json());

const umami_events = await fetch(
  'https://cloud.umami.is/analytics/us/api/websites/{WEBSITE_ID}/metrics?' +
  'startAt=' + startOfMonth + '&endAt=' + endOfMonth + '&type=event',
  { headers: { 'Authorization': 'Bearer ' + umamiToken } }
).then(r => r.json());

// 2. Fetch from Supabase
const chat_logs = await fetch(
  'https://tguligitecsfxfkycknh.supabase.co/rest/v1/chat_logs?' +
  'select=*&created_at=gte.' + startOfMonth + '&created_at=lt.' + endOfMonth,
  { headers: { 'Authorization': 'Bearer ' + supabaseSecretKey } }
).then(r => r.json());

// 3. Process and build report object
const report = {
  totalVisitors: umami_stats.visitors,
  totalPageViews: umami_stats.pageviews,
  avgDuration: umami_stats.avgDuration / 60000, // ms to minutes
  bounceRate: umami_stats.bounceRate,
  categoryFilters: processEventValues('category:filter'),
  eventReferrals: processEventValues('outbound:event-ticket'),
  chatbotQueries: chat_logs.length,
  // ... etc
};

// 4. Render markdown template with report object
const markdown = renderTemplate(COMMITTEE_REPORT_TEMPLATE, report);

// 5. Save as .md file
fs.writeFileSync('report-2026-02.md', markdown);

// 6. Convert to PDF (pandoc or browser print)
// See PDF conversion section below
```

---

## PDF Conversion Options

Once you have the markdown report, convert to PDF for committee distribution:

### Option 1: Pandoc (Recommended)
**Pros:** Free, works offline, quality output, widely supported
**Setup:**
```bash
# Install pandoc (brew on Mac, choco on Windows, apt on Linux)
brew install pandoc

# Convert
pandoc report-2026-02.md -o report-2026-02.pdf \
  --from markdown \
  --to pdf \
  --variable fontsize=11pt \
  --variable geometry=margin=1in
```

**Template file** (optional, for branded letterhead):
Create `committee-report-template.latex` with Arts Council header, logo, footer.

### Option 2: Markdown-to-PDF NPM Package
**Pros:** Fast, Node.js native, customizable CSS
**Setup:**
```bash
npm install markdown-pdf

# Usage in script
const markdownPdf = require('markdown-pdf');
const fs = require('fs');

markdownPdf().from.file('report-2026-02.md').to('report-2026-02.pdf', () => {
  console.log('PDF created');
});
```

### Option 3: Browser Print (Vercel serverless function)
**Pros:** No external dependencies, uses committee's existing Vercel deployment
**Approach:**
1. Create a Vercel function `/api/render-report` that:
   - Takes report data as JSON input
   - Renders markdown as HTML with CSS styling
   - Returns HTML page
2. Open in browser: `https://cultural-map-redesign-stitch-lab.vercel.app/api/render-report?month=02&year=2026`
3. Press Ctrl+P, print to PDF

**Pros:** Branded, consistent with website design, accessible
**Cons:** Requires serverless function setup

---

## Recommended Workflow

### Monthly Report Generation (Every 1st of month at 6am)

1. **Automated script runs:**
   - Queries Umami API for previous calendar month
   - Queries Supabase for previous calendar month
   - Classifies chatbot queries by intent
   - Ranks businesses by referral count

2. **Generated artifacts:**
   - `report-2026-02.md` (markdown)
   - `report-2026-02.pdf` (PDF, via Pandoc)
   - `report-2026-02.json` (raw data object, for re-renders)

3. **Committee distribution:**
   - PDF emailed to committee members
   - Markdown posted to shared drive/Notion
   - JSON uploaded to Supabase for archive

4. **Manual review step:**
   - A human (you) spends 15 min reviewing numbers for sanity checks
   - Adds "Notable Patterns" and "Recommendations" manually (these require judgment)
   - Approves PDF before sending to committee

---

## Questions & Support

**For "instrumenter" (Phase 6 team member):**
- Currently we track: category filters, detail opens, outbound event clicks, outbound lodging clicks, date filters, toggles, marker clicks
- **Missing:** Chatbot deep link clicks (biggest gap), directory page interactions, itinerary engagement, time-on-section
- **Request:** Instrument these gaps so we can improve referral tracking

**For "pipeline" team:**
- We need chatbot queries pre-classified by intent before storing in Supabase
- We need session ID on all Umami custom events to enable session-level journey reconstruction
- Consider storing raw JSON under `meta` field for future extensibility

