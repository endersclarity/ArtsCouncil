# Phase 7 POC: Synthetic User Swarm Analytics Test

**Date:** 2026-02-18
**Purpose:** Prove the analytics pipeline can surface user intent from Umami + Supabase data

## Swarm Ground Truth (what agents actually did)

### visitor-1: Tourist Couple (Sacramento, dinner + live music)
- **Interactions:** ~5 (partial — CDP connection issues)
- **Pages:** Hub, directory
- **Filters:** Weekend event filter
- **Chatbot:** No
- **Note:** Accidentally browsed localhost (no Umami tracking)

### visitor-2: Family with Kids (daytime Saturday activities)
- **Interactions:** ~3 (partial — CDP connection issues)
- **Pages:** Hub only
- **Filters:** Weekend filter, attempted Galleries & Museums
- **Chatbot:** No
- **Note:** Clicked "Show Kids/Library" button

### visitor-3: Local (what's happening tonight)
- **Interactions:** 18 (BEST SESSION)
- **Pages:** Hub, directory, events.html
- **Filters:** Tonight, Today, category dropdown
- **Chatbot:** YES — "What's good to eat tonight in Nevada City?"
- **Outbound:** Explored VRBO link, hotel detail buttons
- **Search:** "bar restaurant" in directory

### visitor-4: Art Collector (SF, galleries + studios)
- **Interactions:** 15 (across 2 attempts)
- **Pages:** Hub, directory (Galleries filter), events (Galleries filter), directory (Public Art), directory (Cultural Orgs)
- **Filters:** Galleries & Museums, Public Art, Cultural Organizations
- **Chatbot:** Attempted (connection timeout)
- **Search:** "galleries" in directory

### visitor-5: Hiker Discovering Culture
- **Interactions:** 15 (CLEANEST SESSION)
- **Pages:** Hub, events.html, itineraries.html
- **Filters:** Trails → Galleries & Museums → Eat/Drink (progressive shift!)
- **Chatbot:** YES — "I came here for hiking but want to discover more - what's good for live music and galleries?"
- **AI Response:** 5 specific recs (Foxhound Espresso, LeeAnn Brook Gallery, Kitkitdizzi, Lilly Vigil Gallery, The Holbrooke Hotel)
- **Deep Link:** Clicked LeeAnn Brook Gallery from chat → detail panel with phone, website, Google Maps
- **Itinerary:** Opened "perfect-day" itinerary

## Umami Analytics Captured (last 24 hours)

**Overview:**
- Visitors: 5
- Visits: 10
- Page Views: 90
- Bounce Rate: 10%
- Avg Visit Duration: 3m 14s

**Pages Hit:**
| Page | Visitors | % |
|------|----------|---|
| Hub (hero-intent) | 5 | 63% |
| events.html | 1 | 13% |
| directory.html | 1 | 13% |
| itineraries.html | 1 | 13% |

**Custom Events (68 total, 9 unique types):**
| Event | Count | % | Signal |
|-------|-------|---|--------|
| toggle:open-now | 25 | 37% | Real-time venue status demand |
| toggle:events-14d | 24 | 35% | Upcoming events browsing |
| category:filter | 7 | 10% | Category-based discovery |
| detail:open | 4 | 6% | Venue detail engagement |
| events:date-filter | 3 | 4% | Time-based event search |
| outbound:event-ticket | 2 | 3% | Business referral (tickets) |
| category:clear | 1 | 1% | Filter reset |
| marker:click | 1 | 1% | Map-based discovery |
| outbound:lodging-vrbo | 1 | 1% | Lodging referral |

**Referrer:** vercel.com (3 visitors)
**Browser:** Chrome/Chrome iOS/Edge iOS
**Location:** United States

## Supabase Chat Logs (COMPLETE — pulled via secret key)

**Swarm queries (Feb 18):** Did NOT persist to Supabase. The CDP connection issues during the swarm likely killed the serverless function calls before completion. 0 rows after Feb 17.

**Pre-swarm test queries (Feb 15-16):** 5 rows total, 2 real queries + 3 test/debug:

### Query 1: "Where should I eat downtown tonight?" (Feb 15, smoke-test)
- **Response:** 12 specific venue recommendations across Nevada City, Grass Valley, and Truckee
- **Deep links generated:** Three Forks, Friar Tucks, Lefty's, Cirino's, Watershed, Holbrooke, 1849 Brewing, Wild Eye Pub, Pianeta, Moody's, Cottonwood
- **MUSE citation:** Included `{{MUSE|rural-is-the-new-cool|"...downtown Nevada City rituals..."}}` block
- **Duration:** 11,665ms

### Query 2: "Where should I eat downtown Grass Valley?" (Feb 16)
- **Response:** 8 venue recommendations organized by dining style (Classic, Modern, Elevated, Casual)
- **Deep links generated:** Tofanelli's, Cirino's, MeZe Eatery, Sergio's Caffe, Watershed, Holbrooke, 1849 Brewing, Wild Eye Pub
- **MUSE citation:** Included `{{MUSE|latinx-culture-here-and-now|"vital anchors of identity..."}}` block
- **Cross-sell:** Recommended booking dinner before the upcoming Joss Stone concert at Center for the Arts
- **Duration:** 12,588ms

**Key insight for committee:** The AI concierge doesn't just answer — it cross-references venue data with upcoming events and weaves in MUSE editorial citations. Each response is a micro-itinerary that drives traffic to specific local businesses.

## Umami Event Properties (COMPLETE — pulled via internal API)

**category:filter** (7 events) — Which categories visitors explored:
| Category | Count |
|----------|-------|
| Walks & Trails | 2 |
| Historic Landmarks | 2 |
| Galleries & Museums | 1 |
| Eat, Drink & Stay | 1 |
| Cultural Organizations | 1 |

**detail:open** (4 events) — Which venues visitors engaged with:
| Venue | City | Category | Count |
|-------|------|----------|-------|
| Mothers Day Springtime Event at Empire Mine | Grass Valley | Fairs & Festivals | 2 |
| LeeAnn Brook Gallery | Nevada City | Galleries & Museums | 1 |
| Center for the Arts | Grass Valley | Performance Spaces | 1 |

**outbound:event-ticket** (2 events) — Business referrals:
| Event | Venue | Clicks |
|-------|-------|--------|
| Spring Street Swing Out | Odd Fellows Hall, 212 Spring Street, Nevada City | 2 |
→ URL: nevadacountyswings.org (with UTM tracking: utm_source=exploregvnc)

**outbound:lodging-vrbo** (1 event):
→ URL: vrbo.com/search?destination=Nevada+County,+CA

**events:date-filter** (3 events) — Time-based intent:
| Filter | Count |
|--------|-------|
| tonight | 2 |
| weekend | 1 |

**marker:click** (1 event):
→ Mothers Day Springtime Event at Empire Mine (Grass Valley, Fairs & Festivals)

**toggle states:** open-now toggled 25x, events-14d toggled 24x

## What's Left To Do

1. **Pull Supabase chat logs** — Need to either:
   - Log into Supabase dashboard via browser to view chat_logs table
   - Get correct pooler connection string from Supabase dashboard (Project Settings > Database > Connect)
   - The region/shard in `aws-0-us-west-1.pooler.supabase.com` may be wrong for this project

3. **Reconstruct user intents** — From analytics alone, attempt to cluster sessions by:
   - Category filter patterns → art collector vs hiker vs foodie
   - Time filter patterns → local (tonight) vs tourist (weekend)
   - Outbound click patterns → which businesses got referrals
   - Chatbot patterns → what questions people ask

4. **Draft committee report** — Format as a 1-page demo showing:
   - "Here's what 5 users did on our site in 15 minutes"
   - "Here's what we can tell about their intent from data alone"
   - "Here's which businesses got direct click-throughs"
   - "No other small-town DMO has this capability"

## Technical Learnings

- **agent-browser CDP can't handle concurrent tab access** — connection timeouts when multiple agents use tabs simultaneously
- **Sequential execution works** — one agent at a time gets clean 15-interaction sessions
- **Some agents hit localhost instead of Vercel** — must be explicit about URL in prompts
- **Umami share URL is visual dashboard only** — no REST API on share endpoints
- **Supabase anon key is insert-only** — can't read chat_logs without elevated access

## Key Files

- Umami share dashboard: https://cloud.umami.is/share/875bmvTJ7Hd2oLAx
- Umami events page: https://cloud.umami.is/share/875bmvTJ7Hd2oLAx/events
- Supabase project: tguligitecsfxfkycknh
- Analytics wrapper: website/cultural-map-redesign-stitch-lab/index-maplibre-analytics.js
- Stitch-lab URL: https://cultural-map-redesign-stitch-lab.vercel.app/
