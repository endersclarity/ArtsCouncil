#!/usr/bin/env node
/**
 * generate-demand-report.mjs
 *
 * Reads pipeline JSON output (from demand-signal-pull.mjs) and generates
 * a human-readable markdown committee report. No npm dependencies.
 *
 * Usage:
 *   node scripts/generate-demand-report.mjs --input reports/2026-02-demand-signals.json [--out reports/2026-02-demand-report.md]
 *
 * If --out is omitted, writes to stdout.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

const inputPath = getArg('--input');
const outPath = getArg('--out');

if (!inputPath) {
  console.error('Usage: node scripts/generate-demand-report.mjs --input <pipeline.json> [--out <report.md>]');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load pipeline JSON
// ---------------------------------------------------------------------------
let data;
try {
  const raw = readFileSync(inputPath, 'utf-8');
  data = JSON.parse(raw);
} catch (err) {
  console.error(`ERROR: Could not read pipeline JSON from ${inputPath}: ${err.message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
function fmt(n) {
  if (n == null) return '0';
  return Number(n).toLocaleString('en-US');
}

function pct(value, total) {
  if (!total || total === 0) return '0.0';
  return ((value / total) * 100).toFixed(1);
}

function durationMin(ms) {
  if (!ms) return '0';
  return (ms / 60000).toFixed(1);
}

function bounceRatePct(rate) {
  if (rate == null) return '0';
  // Rate might be 0-1 decimal or 0-100 integer
  const val = rate > 1 ? rate : rate * 100;
  return val.toFixed(1);
}

function monthName(isoStr) {
  if (!isoStr) return 'Unknown';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function shortDate(isoStr) {
  if (!isoStr) return 'Unknown';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function nextMonth(isoStr) {
  if (!isoStr) return 'Next month';
  const d = new Date(isoStr);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// ---------------------------------------------------------------------------
// Extract data sections (with graceful defaults)
// ---------------------------------------------------------------------------
const meta = data.meta || {};
const overview = data.overview || {};
const pageViews = data.page_views || [];
const events = data.events || {};
const eventsSummary = events.summary || [];
const byProperty = events.by_property || {};
const chatLogs = data.chat_logs || [];
const derived = data.derived || {};
const intentClusters = derived.intent_clusters || {};
const venueAttribution = derived.venue_attribution || [];
const demandSignals = derived.demand_signals || {};

// Compute totals
const totalEvents = eventsSummary.reduce((sum, e) => sum + (e.count || 0), 0);
const tier1Referrals = venueAttribution
  .filter(v => v.tier === 1)
  .reduce((sum, v) => {
    const s = v.signals || {};
    return sum + (s.outbound_ticket_clicks || 0) + (s.outbound_website_clicks || 0);
  }, 0);

// Aggregate chat query intents
const intentAgg = {};
for (const log of chatLogs) {
  const intents = log.query_intents || [];
  for (const intent of intents) {
    intentAgg[intent] = (intentAgg[intent] || 0) + 1;
  }
}
const totalQueryIntents = Object.values(intentAgg).reduce((s, c) => s + c, 0);

// Average chat response duration
const avgChatDuration = chatLogs.length > 0
  ? Math.round(chatLogs.reduce((s, l) => s + (l.duration_ms || 0), 0) / chatLogs.length)
  : 0;

// ---------------------------------------------------------------------------
// Build report sections
// ---------------------------------------------------------------------------
const sections = [];

// --- Header ---
sections.push(`# Nevada County Arts Council — Visitor Demand Signal Report

**Report Period:** ${monthName(meta.period_start)}
**Report Date:** ${shortDate(meta.generated_at)}
**Data Source:** Cultural Map analytics (Umami + AI Concierge logs)

---`);

// --- Executive Summary ---
sections.push(`## Executive Summary

This month, **${fmt(overview.visitors)} visitors** explored our cultural asset map, generating **${fmt(totalEvents)} engagement events** and **${fmt(tier1Referrals)} direct business referrals**.

---`);

// --- Key Metrics ---
sections.push(`## Key Metrics

| Metric | Value |
|--------|-------|
| Total Visitors | ${fmt(overview.visitors)} |
| Total Page Views | ${fmt(overview.pageviews)} |
| Avg Visit Duration | ${durationMin(overview.avg_duration_ms)} min |
| Bounce Rate | ${bounceRatePct(overview.bounce_rate)}% |
| Direct Business Referrals | ${fmt(tier1Referrals)} |

---`);

// --- What Visitors Wanted (Demand Signals) ---
const topCategories = demandSignals.top_categories || [];
const zeroResultSearches = demandSignals.zero_result_searches || [];
const categoryProps = byProperty['category:filter.category'] || [];

let demandSection = `## What Visitors Wanted (Demand Signals)

### Category Interest Ranking

`;

if (categoryProps.length > 0) {
  demandSection += `| Rank | Category | Filter Count |
|------|----------|-------------|
`;
  categoryProps
    .sort((a, b) => (b.total || 0) - (a.total || 0))
    .forEach((cat, i) => {
      demandSection += `| ${i + 1} | ${cat.value} | ${fmt(cat.total)} |\n`;
    });
} else if (topCategories.length > 0) {
  demandSection += `| Rank | Category |
|------|----------|
`;
  topCategories.forEach((cat, i) => {
    demandSection += `| ${i + 1} | ${cat} |\n`;
  });
} else {
  demandSection += `No category filter data for this period.\n`;
}

// Top Venues by Engagement
demandSection += `
### Top Venues by Engagement

`;

const top10Venues = venueAttribution.slice(0, 10);
if (top10Venues.length > 0) {
  demandSection += `| Rank | Venue | Detail Opens | Outbound Clicks | Score |
|------|-------|-------------|-----------------|-------|
`;
  top10Venues.forEach((v, i) => {
    const s = v.signals || {};
    const outbound = (s.outbound_ticket_clicks || 0) + (s.outbound_website_clicks || 0);
    demandSection += `| ${i + 1} | ${v.venue} | ${fmt(s.detail_opens)} | ${fmt(outbound)} | ${fmt(v.attribution_score)} |\n`;
  });
} else {
  demandSection += `No venue engagement data for this period.\n`;
}

// Zero-Result Searches
demandSection += `
### Zero-Result Searches (Unmet Demand)

`;

if (zeroResultSearches.length > 0) {
  demandSection += `Visitors searched for these terms and found nothing — potential content gaps:\n\n`;
  zeroResultSearches.forEach(q => {
    demandSection += `- "${q}"\n`;
  });
} else {
  demandSection += `No zero-result searches this period.\n`;
}

demandSection += `
---`;

sections.push(demandSection);

// --- Business Engagement Ranking ---
let bizSection = `## Business Engagement Ranking

**Ranked by referral signal strength** (outbound clicks = strongest):

`;

if (top10Venues.length > 0) {
  bizSection += `| Rank | Business | City | Category | Score | Primary Signal |
|------|----------|------|----------|-------|---------------|
`;
  top10Venues.forEach((v, i) => {
    bizSection += `| ${i + 1} | ${v.venue} | ${v.city || 'N/A'} | ${v.category || 'N/A'} | ${fmt(v.attribution_score)} | ${v.primary_signal || 'unknown'} |\n`;
  });

  // Add notes for venues with undercount warnings
  const notedVenues = top10Venues.filter(v => v.note);
  if (notedVenues.length > 0) {
    bizSection += `\n**Note:** ${notedVenues.length} venues in this ranking have chatbot recommendations but no click-through tracking. Scores may undercount actual referral value.\n`;
  }
} else {
  bizSection += `No business engagement data for this period.\n`;
}

bizSection += `
---`;

sections.push(bizSection);

// --- AI Concierge Insights ---
let chatSection = `## AI Concierge Insights

### Query Volume
- **Total queries:** ${fmt(chatLogs.length)}
- **Avg response time:** ${fmt(avgChatDuration)}ms

`;

// Intent Distribution
chatSection += `### Intent Distribution

`;

if (Object.keys(intentAgg).length > 0) {
  chatSection += `| Intent | Count | % |
|--------|-------|---|
`;
  Object.entries(intentAgg)
    .sort((a, b) => b[1] - a[1])
    .forEach(([intent, count]) => {
      chatSection += `| ${intent} | ${fmt(count)} | ${pct(count, totalQueryIntents)}% |\n`;
    });
} else {
  chatSection += `No chatbot data for this period.\n`;
}

// Top Venues Recommended by AI
const chatbotVenueRecs = demandSignals.chatbot_venue_recs || [];

chatSection += `
### Top Venues Recommended by AI

`;

if (chatbotVenueRecs.length > 0) {
  chatSection += `| Venue | Times Recommended |
|-------|------------------|
`;
  chatbotVenueRecs.slice(0, 10).forEach(rec => {
    chatSection += `| ${rec.venue} | ${fmt(rec.recommended_count)} |\n`;
  });
} else {
  chatSection += `No AI venue recommendations this period.\n`;
}

chatSection += `
---`;

sections.push(chatSection);

// --- Visitor Intent Clusters ---
let clusterSection = `## Visitor Intent Clusters

`;

const clusterEntries = Object.entries(intentClusters);
if (clusterEntries.length > 0) {
  clusterEntries.forEach(([label, cluster]) => {
    const evidence = (cluster.evidence || []).join(', ');
    clusterSection += `### ${label}
- **Confidence:** ${cluster.confidence || 'UNKNOWN'}
- **Estimated visitors:** ${fmt(cluster.estimated_visitor_count)}
- **Evidence:** ${evidence}

`;
  });
} else {
  clusterSection += `No intent clusters identified for this period.\n\n`;
}

clusterSection += `---`;

sections.push(clusterSection);

// --- Traffic Breakdown ---
let trafficSection = `## Traffic Breakdown

`;

if (pageViews.length > 0) {
  const totalPV = pageViews.reduce((s, p) => s + (p.views || 0), 0) || 1;
  trafficSection += `| Page | Views | % of Total |
|------|-------|-----------|
`;
  pageViews.forEach(p => {
    trafficSection += `| ${p.url} | ${fmt(p.views)} | ${pct(p.views, totalPV)}% |\n`;
  });
} else {
  trafficSection += `No page view data for this period.\n`;
}

trafficSection += `
---`;

sections.push(trafficSection);

// --- Feature Usage ---
let featureSection = `## Feature Usage

`;

// Extract relevant event counts
const featureEvents = [
  'toggle:open-now',
  'toggle:events-14d',
  'category:filter',
  'detail:open',
  'marker:click',
  'outbound:event-ticket',
  'outbound:lodging-vrbo',
  'events:date-filter'
];

const eventIndex = {};
for (const e of eventsSummary) {
  eventIndex[e.name] = e.count || 0;
}

const featureRows = featureEvents
  .filter(name => eventIndex[name] != null)
  .map(name => ({ name, count: eventIndex[name] }));

if (featureRows.length > 0) {
  featureSection += `| Feature | Count |
|---------|-------|
`;
  featureRows.forEach(f => {
    featureSection += `| ${f.name} | ${fmt(f.count)} |\n`;
  });
} else {
  featureSection += `No feature usage data for this period.\n`;
}

featureSection += `
---`;

sections.push(featureSection);

// --- Technical Notes ---
const hasSessionHash = chatLogs.some(l => l.session_hash);
const hasChatDeeplink = eventsSummary.some(e => e.name === 'chat:deeplink-click');

let techSection = `## Technical Notes

### Data Collection
- **Umami analytics:** Privacy-first, no cookies, tracks custom events via provider-agnostic wrapper
- **Supabase chat logs:** AI concierge queries and responses with session attribution
- **Session tracking:** ${hasSessionHash
  ? 'session_hash property on all events enables per-visitor journey reconstruction'
  : 'Aggregate data only — session-level attribution available in future reports'}

### Known Measurement Gaps
1. Chatbot deep link clicks: ${hasChatDeeplink
  ? 'Now tracked'
  : 'Not yet instrumented — chatbot referral value may be undercounted'}
2. Session-level journeys: Umami Cloud API provides aggregate counts, not per-session event streams

---

*Report generated by Cultural Map analytics pipeline*
*Next report: ${nextMonth(meta.period_end)}*`;

sections.push(techSection);

// ---------------------------------------------------------------------------
// Assemble and output
// ---------------------------------------------------------------------------
const report = sections.join('\n\n');

if (outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, report, 'utf-8');
  console.error(`Report written to ${outPath} (${report.split('\n').length} lines)`);
} else {
  process.stdout.write(report + '\n');
}
