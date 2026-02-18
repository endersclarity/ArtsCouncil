#!/usr/bin/env node
/**
 * demand-signal-pull.mjs
 *
 * Automated data pull for Nevada County Cultural Map demand signal reporting.
 * Queries Umami Cloud API (analytics events) and Supabase REST API (chat logs),
 * classifies visitor intent, scores business referral attribution, and outputs
 * unified JSON for committee reporting.
 *
 * Usage:
 *   node --env-file=.env scripts/demand-signal-pull.mjs [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--out path.json] [--verbose]
 *
 * Environment variables required (load via --env-file=.env or export):
 *   UMAMI_WEBSITE_ID      - Umami Cloud website UUID
 *   UMAMI_BEARER_TOKEN    - Bearer token from cloud.umami.is (expires quarterly)
 *   SUPABASE_URL          - Supabase project URL
 *   SUPABASE_SECRET_KEY   - Supabase secret key (bypasses RLS, read access)
 *
 * Zero npm dependencies. Uses Node.js native fetch (Node 18+).
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// ---------------------------------------------------------------------------
// CLI argument parsing (zero dependencies)
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

const VERBOSE = args.includes('--verbose');
const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

const fromStr = getArg('--from') || thirtyDaysAgo.toISOString().slice(0, 10);
const toStr = getArg('--to') || now.toISOString().slice(0, 10);
const outPath = getArg('--out');

const startDate = new Date(fromStr + 'T00:00:00Z');
const endDate = new Date(toStr + 'T23:59:59Z');
const startMs = startDate.getTime();
const endMs = endDate.getTime();
const periodDays = Math.ceil((endMs - startMs) / (24 * 60 * 60 * 1000));

// ---------------------------------------------------------------------------
// Environment variable validation
// ---------------------------------------------------------------------------
const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;
const UMAMI_BEARER_TOKEN = process.env.UMAMI_BEARER_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

const missing = [];
if (!UMAMI_WEBSITE_ID) missing.push('UMAMI_WEBSITE_ID');
if (!UMAMI_BEARER_TOKEN) missing.push('UMAMI_BEARER_TOKEN');
if (!SUPABASE_URL) missing.push('SUPABASE_URL');
if (!SUPABASE_SECRET_KEY) missing.push('SUPABASE_SECRET_KEY');

if (missing.length > 0) {
  console.error(`ERROR: Missing required environment variables: ${missing.join(', ')}`);
  console.error('');
  if (missing.includes('UMAMI_BEARER_TOKEN')) {
    console.error('To get UMAMI_BEARER_TOKEN:');
    console.error('  1. Log into https://cloud.umami.is');
    console.error('  2. Open browser console');
    console.error('  3. Run: JSON.parse(localStorage.getItem("umami.auth")).token');
    console.error('  4. Add to .env: UMAMI_BEARER_TOKEN=<token>');
  }
  console.error('');
  console.error('Usage: node --env-file=.env scripts/demand-signal-pull.mjs [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--out path.json] [--verbose]');
  process.exit(1);
}

const UMAMI_BASE = `https://cloud.umami.is/analytics/us/api/websites/${UMAMI_WEBSITE_ID}`;

function log(msg) {
  if (VERBOSE) console.error(`[verbose] ${msg}`);
}

// ---------------------------------------------------------------------------
// Section 1: Umami API helpers
// ---------------------------------------------------------------------------
async function umamiGet(path, params = {}) {
  const url = new URL(`${UMAMI_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  log(`Umami GET ${url.href}`);

  const res = await fetch(url.href, {
    headers: { 'Authorization': `Bearer ${UMAMI_BEARER_TOKEN}` }
  });

  if (res.status === 401) {
    console.error('ERROR: UMAMI_BEARER_TOKEN expired or invalid (HTTP 401).');
    console.error('Refresh from cloud.umami.is dashboard:');
    console.error('  JSON.parse(localStorage.getItem("umami.auth")).token');
    console.error('Then update UMAMI_BEARER_TOKEN in .env or GitHub Actions secrets.');
    process.exit(1);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Umami API error ${res.status} on ${path}: ${body}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Section 1: Umami API calls
// ---------------------------------------------------------------------------
async function fetchUmamiData() {
  const timeParams = { startAt: startMs, endAt: endMs };

  // 1. Overview stats
  log('Fetching overview stats...');
  const stats = await umamiGet('/stats', timeParams);

  // 2. Event metrics (aggregate counts per event type)
  log('Fetching event metrics...');
  const eventMetrics = await umamiGet('/metrics', { ...timeParams, type: 'event' });

  // 3. Event property inventory
  log('Fetching event properties...');
  const eventProperties = await umamiGet('/event-data/properties', timeParams);

  // 4. Per-property value breakdowns (dynamic discovery from properties)
  log(`Discovered ${eventProperties.length} event+property combos, fetching values...`);
  const propertyValues = {};
  for (const prop of eventProperties) {
    const key = `${prop.eventName}.${prop.propertyName}`;
    log(`  Fetching values for ${key}`);
    const values = await umamiGet('/event-data/values', {
      ...timeParams,
      event: prop.eventName,
      propertyName: prop.propertyName
    });
    propertyValues[key] = values;
  }

  // 5. Page view breakdown — try multiple Umami API approaches
  log('Fetching page view metrics...');
  var pageMetrics = [];
  try {
    pageMetrics = await umamiGet('/metrics', { ...timeParams, type: 'url' });
  } catch (e) {
    log('Page view /metrics?type=url failed (' + e.message.slice(0, 80) + '), trying /pageviews...');
    try {
      const pv = await umamiGet('/pageviews', { ...timeParams, unit: 'day' });
      // /pageviews returns { pageviews: [{t,y}], sessions: [{t,y}] } — flatten to url-like
      pageMetrics = (pv && pv.pageviews) ? pv.pageviews.map(function(d) { return { x: d.t || d.x, y: d.y }; }) : [];
    } catch (e2) {
      log('Page view fallback also failed — continuing without page breakdown');
      pageMetrics = [];
    }
  }

  return { stats, eventMetrics, eventProperties, propertyValues, pageMetrics };
}

// ---------------------------------------------------------------------------
// Section 2: Supabase API call
// ---------------------------------------------------------------------------
async function fetchChatLogs() {
  // Build URL manually to handle duplicate query param keys (PostgREST supports this)
  const selectFields = 'id,created_at,session_hash,query_text,response_text,intent,assets_referenced,duration_ms,model';
  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  // Supabase URLSearchParams with duplicate keys: build manually
  const queryString = `select=${encodeURIComponent(selectFields)}&created_at=gte.${encodeURIComponent(startIso)}&created_at=lte.${encodeURIComponent(endIso)}&order=created_at.desc`;
  const url = `${SUPABASE_URL}/rest/v1/chat_logs?${queryString}`;

  log(`Supabase GET ${url}`);

  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SECRET_KEY,
      'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`
    }
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase API error ${res.status}: ${body}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Section 3: Intent classification (7-type decision tree)
// ---------------------------------------------------------------------------
function classifyIntentClusters(eventsSummary, propertyValues, chatLogs, overview) {
  // Index event counts by name
  const eventCounts = {};
  for (const evt of eventsSummary) {
    eventCounts[evt.x] = evt.y;
  }

  // Index property values as { "eventName.propertyName": [{value, total}] }
  // (already structured this way from fetchUmamiData)

  // Helper: get count for a specific property value
  function propCount(eventProp, targetValue) {
    const values = propertyValues[eventProp] || [];
    const match = values.find(v => v.value === targetValue);
    return match ? match.total : 0;
  }

  // Helper: get all values for a property
  function propValues(eventProp) {
    return propertyValues[eventProp] || [];
  }

  // Check chatbot queries for keywords
  const chatDiningQueries = chatLogs.filter(l =>
    /eat|drink|dinner|restaurant|bar|brunch|lunch|cafe|coffee/i.test(l.query_text || '')
  );
  const chatFamilyQueries = chatLogs.filter(l =>
    /kids|family|children|child/i.test(l.query_text || '')
  );

  // Art-related categories in category:filter
  const artCategories = ['Galleries', 'Cultural Organizations', 'Performing Arts', 'Museums'];
  const filteredArtCats = artCategories.filter(cat => propCount('category:filter.category', cat) > 0);

  // Build clusters
  const clusters = {};
  const totalVisitors = overview.visitors || 0;
  let accountedVisitors = 0;

  // Rule 1: trip_researcher — outbound:lodging-vrbo > 0
  const vrboClicks = eventCounts['outbound:lodging-vrbo'] || 0;
  if (vrboClicks > 0) {
    const est = Math.max(1, Math.min(Math.ceil(vrboClicks / 2), totalVisitors));
    clusters.trip_researcher = {
      confidence: 'HIGH',
      evidence: [
        `outbound:lodging-vrbo (${vrboClicks})`,
        ...(propCount('events:date-filter.filter', 'weekend') > 0
          ? [`events:date-filter=weekend (${propCount('events:date-filter.filter', 'weekend')})`] : [])
      ],
      estimated_visitor_count: est
    };
    accountedVisitors += est;
  }

  // Rule 2: tonight_planner — outbound:event-ticket > 0 AND tonight filter
  const ticketClicks = eventCounts['outbound:event-ticket'] || 0;
  const tonightFilter = propCount('events:date-filter.filter', 'tonight');

  if (ticketClicks > 0 && tonightFilter > 0) {
    const est = Math.max(1, Math.min(Math.ceil(Math.max(ticketClicks, tonightFilter) / 2), totalVisitors));
    clusters.tonight_planner = {
      confidence: 'HIGH',
      evidence: [
        `outbound:event-ticket (${ticketClicks})`,
        `events:date-filter=tonight (${tonightFilter})`,
        ...(chatDiningQueries.length > 0 ? [`chat dining queries (${chatDiningQueries.length})`] : [])
      ],
      estimated_visitor_count: est
    };
    accountedVisitors += est;
  }
  // Rule 3: tonight_planner (chat dining + tonight filter, no ticket clicks)
  else if (tonightFilter > 0 && chatDiningQueries.length > 0) {
    const est = Math.max(1, Math.min(tonightFilter, totalVisitors));
    clusters.tonight_planner = {
      confidence: 'HIGH',
      evidence: [
        `events:date-filter=tonight (${tonightFilter})`,
        `chat dining queries (${chatDiningQueries.length})`
      ],
      estimated_visitor_count: est
    };
    accountedVisitors += est;
  }
  // Rule 3b: tonight_planner (tonight filter only, moderate confidence)
  else if (tonightFilter > 0) {
    const est = Math.max(1, Math.min(tonightFilter, totalVisitors));
    if (!clusters.tonight_planner) {
      clusters.tonight_planner = {
        confidence: 'MODERATE',
        evidence: [`events:date-filter=tonight (${tonightFilter})`],
        estimated_visitor_count: est
      };
      accountedVisitors += est;
    }
  }

  // Rule 4: event_hunter — outbound:event-ticket > 0 (without tonight)
  if (ticketClicks > 0 && !clusters.tonight_planner) {
    const est = Math.max(1, Math.min(Math.ceil(ticketClicks / 2), totalVisitors));
    clusters.event_hunter = {
      confidence: 'MODERATE',
      evidence: [`outbound:event-ticket (${ticketClicks})`],
      estimated_visitor_count: est
    };
    accountedVisitors += est;
  }

  // Rule 5: art_seeker — 2+ art-related categories filtered
  if (filteredArtCats.length >= 2) {
    const est = Math.max(1, Math.min(2, totalVisitors));
    clusters.art_seeker = {
      confidence: 'MODERATE',
      evidence: filteredArtCats.map(c => `category:filter=${c} (${propCount('category:filter.category', c)})`),
      estimated_visitor_count: est
    };
    accountedVisitors += est;
  }

  // Rule 6: family_planner — Education filter OR chat family queries
  const educationFilter = propCount('category:filter.category', 'Education');
  if (educationFilter > 0 || chatFamilyQueries.length > 0) {
    const evidence = [];
    if (educationFilter > 0) evidence.push(`category:filter=Education (${educationFilter})`);
    if (chatFamilyQueries.length > 0) evidence.push(`chat family queries (${chatFamilyQueries.length})`);
    const est = Math.max(1, Math.min(2, totalVisitors));
    clusters.family_planner = {
      confidence: 'MODERATE',
      evidence,
      estimated_visitor_count: est
    };
    accountedVisitors += est;
  }

  // Rule 7: event_hunter (toggle + detail opens)
  const events14d = propCount('toggle:events-14d.state', 'on');
  const detailOpens = eventCounts['detail:open'] || 0;
  if (!clusters.event_hunter && events14d > 0 && detailOpens >= 2) {
    const est = Math.max(1, Math.min(2, totalVisitors));
    clusters.event_hunter = {
      confidence: 'MODERATE',
      evidence: [
        `toggle:events-14d=on (${events14d})`,
        `detail:open (${detailOpens})`
      ],
      estimated_visitor_count: est
    };
    accountedVisitors += est;
  }

  // Rule 8: local_explorer — open-now toggle + low pageviews
  const openNowOn = propCount('toggle:open-now.state', 'on');
  const pageviews = overview.pageviews || 0;
  if (openNowOn > 0 && pageviews <= 5) {
    const est = Math.max(1, Math.min(openNowOn, totalVisitors));
    clusters.local_explorer = {
      confidence: 'LOW',
      evidence: [
        `toggle:open-now=on (${openNowOn})`,
        `pageviews=${pageviews} (low)`
      ],
      estimated_visitor_count: est
    };
    accountedVisitors += est;
  }

  // Rule 9: casual_browser — residual
  const residual = Math.max(0, totalVisitors - accountedVisitors);
  if (residual > 0 || Object.keys(clusters).length === 0) {
    clusters.casual_browser = {
      confidence: 'LOW',
      evidence: [
        `residual visitors (${residual})`,
        ...(Object.keys(clusters).length === 0 ? ['no high-signal actions detected'] : [])
      ],
      estimated_visitor_count: Math.max(residual, 1)
    };
  }

  return clusters;
}

// ---------------------------------------------------------------------------
// Section 4: Chatbot query micro-intent classification
// ---------------------------------------------------------------------------
const MICRO_INTENT_PATTERNS = {
  dining: /eat|drink|dinner|restaurant|bar|brunch|lunch|cafe|coffee/i,
  lodging: /hotel|stay|lodging|night|vrbo|airbnb|cabin|camp/i,
  outdoor: /hike|trail|outdoor|nature|park|swim|bike|kayak/i,
  arts: /gallery|art|studio|museum|exhibit/i,
  same_day: /tonight|this evening|now|today/i,
  future_trip: /weekend|saturday|sunday|next week|visit/i,
  family: /kids|family|children|child/i,
  live_music: /music|concert|show|live|band|gig/i
};

function classifyQueryIntents(queryText) {
  if (!queryText) return [];
  const lower = queryText.toLowerCase();
  const intents = [];
  for (const [intent, pattern] of Object.entries(MICRO_INTENT_PATTERNS)) {
    if (pattern.test(lower)) intents.push(intent);
  }
  return intents;
}

function annotateChatLogs(chatLogs) {
  return chatLogs.map(log => ({
    ...log,
    query_intents: classifyQueryIntents(log.query_text)
  }));
}

// ---------------------------------------------------------------------------
// Section 5: Business referral attribution scoring
// ---------------------------------------------------------------------------
function scoreVenueAttribution(propertyValues, chatLogs) {
  const venues = {};

  // Helper to ensure venue entry exists
  function ensureVenue(name) {
    if (!name) return null;
    if (!venues[name]) {
      venues[name] = {
        venue: name,
        city: '',
        category: '',
        signals: {
          outbound_ticket_clicks: 0,
          outbound_website_clicks: 0,
          detail_opens: 0,
          marker_clicks: 0,
          chat_recommendations: 0,
          chat_click_throughs: 0
        }
      };
    }
    return venues[name];
  }

  // Count outbound:event-ticket by venue
  const ticketVenues = propertyValues['outbound:event-ticket.venue'] || [];
  for (const v of ticketVenues) {
    const entry = ensureVenue(v.value);
    if (entry) entry.signals.outbound_ticket_clicks += v.total;
  }

  // Count outbound:website by venue
  const websiteVenues = propertyValues['outbound:website.venue'] || [];
  for (const v of websiteVenues) {
    const entry = ensureVenue(v.value);
    if (entry) entry.signals.outbound_website_clicks += v.total;
  }

  // Count detail:open by name
  const detailNames = propertyValues['detail:open.name'] || [];
  for (const v of detailNames) {
    const entry = ensureVenue(v.value);
    if (entry) entry.signals.detail_opens += v.total;
  }

  // Enrich city from detail:open.city if available
  const detailCities = propertyValues['detail:open.city'] || [];
  // Match city to venue via correlated data (best effort: same position in arrays)
  // Since Umami returns aggregated values, we can't directly correlate.
  // Instead, use detail:open.name entries and try to match by name.

  // Count marker:click by name
  const markerNames = propertyValues['marker:click.name'] || [];
  for (const v of markerNames) {
    const entry = ensureVenue(v.value);
    if (entry) entry.signals.marker_clicks += v.total;
  }

  // Count chat:deeplink-click by venue
  const chatDeeplinks = propertyValues['chat:deeplink-click.venue'] || [];
  for (const v of chatDeeplinks) {
    const entry = ensureVenue(v.value);
    if (entry) entry.signals.chat_click_throughs += v.total;
  }

  // Extract chat recommendations from response_text [[Venue Name|pid]] patterns
  const deepLinkRegex = /\[\[([^|]+)\|([^\]]+)\]\]/g;
  for (const chatLog of chatLogs) {
    if (!chatLog.response_text) continue;
    let match;
    const seen = new Set(); // dedupe within single response
    while ((match = deepLinkRegex.exec(chatLog.response_text)) !== null) {
      const venueName = match[1].trim();
      if (seen.has(venueName)) continue;
      seen.add(venueName);
      const entry = ensureVenue(venueName);
      if (entry) entry.signals.chat_recommendations += 1;
    }
  }

  // Enrich city and category from detail:open property values
  const detailCats = propertyValues['detail:open.category'] || [];
  // Best-effort enrichment: for each venue, find matching city/category from detail:open data
  for (const v of detailCities) {
    // Look for venues in the same city (rough match)
    for (const name of Object.keys(venues)) {
      if (!venues[name].city && detailNames.some(d => d.value === name)) {
        // We can't directly correlate city to name from Umami aggregates
        // Set city if only one city value exists (common for small datasets)
        if (detailCities.length === 1) venues[name].city = v.value;
      }
    }
  }

  // Score and tier
  const results = Object.values(venues).map(v => {
    const s = v.signals;
    const score = (s.outbound_ticket_clicks * 100)
               + (s.outbound_website_clicks * 40)
               + (s.detail_opens * 10)
               + (s.marker_clicks * 5)
               + (s.chat_recommendations * 5)
               + (s.chat_click_throughs * 30);

    let tier;
    if (score >= 100) tier = 1;
    else if (score >= 10) tier = 2;
    else tier = 3;

    // Determine primary signal
    let primarySignal = 'unknown';
    if (s.outbound_ticket_clicks > 0) primarySignal = 'outbound:event-ticket';
    else if (s.outbound_website_clicks > 0) primarySignal = 'outbound:website';
    else if (s.chat_click_throughs > 0) primarySignal = 'chat:deeplink-click';
    else if (s.detail_opens > 0) primarySignal = 'detail:open';
    else if (s.marker_clicks > 0) primarySignal = 'marker:click';
    else if (s.chat_recommendations > 0) primarySignal = 'chat:recommended';

    const result = {
      venue: v.venue,
      city: v.city,
      category: v.category,
      signals: s,
      attribution_score: score,
      tier,
      primary_signal: primarySignal
    };

    // Add note for venues with chat recs but no click-throughs
    if (s.chat_recommendations > 0 && s.chat_click_throughs === 0) {
      result.note = 'Score may undercount -- chatbot click-through data depends on Phase 7 instrumentation';
    }

    return result;
  });

  // Sort by attribution_score DESC, return top 20
  results.sort((a, b) => b.attribution_score - a.attribution_score);
  return results.slice(0, 20);
}

// ---------------------------------------------------------------------------
// Section 6: Demand signals summary (human-readable for committee)
// ---------------------------------------------------------------------------
function buildDemandSignals(propertyValues, venueAttribution, chatLogs, annotatedChatLogs) {
  // Top categories from category:filter
  const categoryValues = propertyValues['category:filter.category'] || [];
  const topCategories = categoryValues
    .sort((a, b) => b.total - a.total)
    .map(v => v.value);

  // Top venues by engagement from detail:open.name
  const detailNames = propertyValues['detail:open.name'] || [];
  const topVenuesByEngagement = detailNames
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map(v => v.value);

  // Top outbound referrals from tier 1 attribution
  const topOutboundReferrals = venueAttribution
    .filter(v => v.tier === 1)
    .map(v => ({
      venue: v.venue,
      clicks: v.signals.outbound_ticket_clicks + v.signals.outbound_website_clicks,
      type: v.primary_signal
    }));

  // Chatbot topics: aggregate micro-intent counts
  const chatbotTopics = {};
  for (const log of annotatedChatLogs) {
    for (const intent of (log.query_intents || [])) {
      chatbotTopics[intent] = (chatbotTopics[intent] || 0) + 1;
    }
  }
  const sortedTopics = Object.entries(chatbotTopics)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);

  // Chatbot venue recommendations from [[Venue|pid]] extraction
  const venueRecCounts = {};
  const deepLinkRegex = /\[\[([^|]+)\|([^\]]+)\]\]/g;
  for (const chatLog of chatLogs) {
    if (!chatLog.response_text) continue;
    let match;
    while ((match = deepLinkRegex.exec(chatLog.response_text)) !== null) {
      const name = match[1].trim();
      venueRecCounts[name] = (venueRecCounts[name] || 0) + 1;
    }
  }
  const chatbotVenueRecs = Object.entries(venueRecCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([venue, count]) => ({ venue, recommended_count: count }));

  // Zero-result searches
  const searchZeroValues = propertyValues['search:zero.query'] || [];
  const exploreSearchValues = propertyValues['explore:search.query'] || [];
  const zeroResultSearches = [
    ...searchZeroValues.map(v => v.value),
    ...exploreSearchValues.filter(v => {
      // Check if results_count=0 (if available)
      return false; // Can't determine from aggregate data -- include all as potential
    })
  ];

  // Notable patterns (human-readable strings describing behavioral clusters)
  const notablePatterns = [];

  // Tonight-planning pattern
  const tonightFilter = (propertyValues['events:date-filter.filter'] || [])
    .find(v => v.value === 'tonight');
  const ticketVenues = propertyValues['outbound:event-ticket.venue'] || [];
  const diningChats = annotatedChatLogs.filter(l => (l.query_intents || []).includes('dining'));
  if (tonightFilter || diningChats.length > 0) {
    const parts = [];
    if (tonightFilter) parts.push(`tonight filter (${tonightFilter.total}x)`);
    if (ticketVenues.length > 0) parts.push(`event ticket clicks to ${ticketVenues[0].value}`);
    if (diningChats.length > 0) parts.push(`${diningChats.length} dining chatbot queries`);
    notablePatterns.push(`Tonight-planning cluster: ${parts.join(' + ')} suggests same-day visitor activity`);
  }

  // Trip research pattern
  const weekendFilter = (propertyValues['events:date-filter.filter'] || [])
    .find(v => v.value === 'weekend');
  const lodgingChats = annotatedChatLogs.filter(l => (l.query_intents || []).includes('lodging'));
  if (weekendFilter || lodgingChats.length > 0) {
    const parts = [];
    if (weekendFilter) parts.push(`weekend filter (${weekendFilter.total}x)`);
    if (lodgingChats.length > 0) parts.push(`${lodgingChats.length} lodging chatbot queries`);
    if (topCategories.length > 0) parts.push(`top category interest: ${topCategories.slice(0, 2).join(', ')}`);
    notablePatterns.push(`Trip-research cluster: ${parts.join(' + ')} indicates advance planning visitors`);
  }

  // Chatbot engagement pattern
  if (chatLogs.length >= 3) {
    const uniqueSessions = new Set(chatLogs.map(l => l.session_hash).filter(Boolean));
    notablePatterns.push(
      `AI concierge engagement: ${chatLogs.length} queries from ${uniqueSessions.size} unique sessions -- ` +
      `top topics: ${sortedTopics.slice(0, 3).join(', ') || 'general'}`
    );
  }

  return {
    top_categories: topCategories,
    top_venues_by_engagement: topVenuesByEngagement,
    top_outbound_referrals: topOutboundReferrals,
    chatbot_topics: sortedTopics,
    chatbot_venue_recs: chatbotVenueRecs,
    zero_result_searches: zeroResultSearches,
    notable_patterns: notablePatterns
  };
}

// ---------------------------------------------------------------------------
// Section 7: Main execution
// ---------------------------------------------------------------------------
async function main() {
  log(`Period: ${fromStr} to ${toStr} (${periodDays} days)`);
  log(`Umami Website ID: ${UMAMI_WEBSITE_ID}`);
  log(`Supabase URL: ${SUPABASE_URL}`);

  // Fetch all data
  log('--- Fetching Umami data ---');
  const umami = await fetchUmamiData();

  log('--- Fetching Supabase chat logs ---');
  const rawChatLogs = await fetchChatLogs();
  log(`Fetched ${rawChatLogs.length} chat logs`);

  // Build overview
  const overview = {
    visitors: umami.stats.visitors || 0,
    visits: umami.stats.visits || 0,
    pageviews: umami.stats.pageviews || 0,
    bounce_rate: umami.stats.bounces != null
      ? (umami.stats.visits > 0 ? umami.stats.bounces / umami.stats.visits : 0)
      : (umami.stats.bounceRate || 0),
    avg_duration_ms: umami.stats.totaltime != null
      ? (umami.stats.visits > 0 ? Math.round(umami.stats.totaltime / umami.stats.visits) : 0)
      : (umami.stats.avgDuration || 0)
  };

  // Build page_views with percentages
  const totalPageviews = overview.pageviews || 1;
  const pageViews = umami.pageMetrics.map(p => ({
    url: p.x,
    views: p.y,
    pct: Math.round((p.y / totalPageviews) * 100) / 100
  })).sort((a, b) => b.views - a.views);

  // Build events summary
  const eventsSummary = umami.eventMetrics.map(e => ({
    name: e.x,
    count: e.y
  }));

  // Annotate chat logs with micro-intents
  const annotatedChatLogs = annotateChatLogs(rawChatLogs);

  // Derive intent clusters
  log('--- Classifying intent clusters ---');
  const intentClusters = classifyIntentClusters(
    umami.eventMetrics,
    umami.propertyValues,
    rawChatLogs,
    overview
  );

  // Score venue attribution
  log('--- Scoring venue attribution ---');
  const venueAttribution = scoreVenueAttribution(umami.propertyValues, rawChatLogs);

  // Build demand signals
  log('--- Building demand signals ---');
  const demandSignals = buildDemandSignals(
    umami.propertyValues,
    venueAttribution,
    rawChatLogs,
    annotatedChatLogs
  );

  // Assemble unified output
  const output = {
    meta: {
      generated_at: new Date().toISOString(),
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
      period_days: periodDays
    },
    overview,
    page_views: pageViews,
    events: {
      summary: eventsSummary,
      by_property: umami.propertyValues
    },
    chat_logs: annotatedChatLogs,
    derived: {
      intent_clusters: intentClusters,
      venue_attribution: venueAttribution,
      demand_signals: demandSignals
    }
  };

  // Output
  const jsonStr = JSON.stringify(output, null, 2);

  if (outPath) {
    // Ensure directory exists
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, jsonStr, 'utf-8');
    log(`Written to ${outPath}`);
  } else {
    process.stdout.write(jsonStr + '\n');
  }

  // Summary to stderr
  const venuesScored = venueAttribution.length;
  const clustersFound = Object.keys(intentClusters).length;
  console.error(
    `Demand signal report: ${overview.visitors} visitors, ` +
    `${eventsSummary.length} event types, ` +
    `${rawChatLogs.length} chat queries, ` +
    `${venuesScored} venues scored, ` +
    `${clustersFound} intent clusters`
  );
}

main().catch(err => {
  console.error(`FATAL: ${err.message}`);
  if (VERBOSE) console.error(err.stack);
  process.exit(1);
});
