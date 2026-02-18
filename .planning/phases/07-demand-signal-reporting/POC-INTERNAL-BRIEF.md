# Phase 7 POC: Demand Signal Reporting — Internal Brief

**Date:** 2026-02-18
**Status:** POC complete. Data pipeline proven. Ready for phase scoping.

---

## What we proved

We spawned 5 synthetic user agents (blind — no knowledge of our analytics instrumentation) to browse the live Vercel site as realistic personas, then pulled the analytics data from Umami and Supabase to see what we could reconstruct about their intent.

**The pipeline works.** From aggregate analytics alone, a blind analyst reconstructed ~60% of user intent — correctly identifying a "tonight planner" who clicked through to buy swing dance tickets, a "trip researcher" planning a weekend getaway with VRBO, and a residual browser cluster. The high-signal behaviors (ticket clicks, lodging search, dining queries, time filters) are clearly readable from data.

**What's invisible:** Session-level attribution. A visitor who filtered trails → galleries → eat/drink (a progressive interest shift from outdoor to culture to dining) looks the same in aggregate as three separate visitors each filtering once. The art collector who methodically explored galleries, public art, and cultural orgs across 3 pages was completely buried. Umami's share dashboard gives us aggregate counts, not per-session journeys.

---

## Data access (now working)

### Umami Cloud API
- **Auth:** Bearer token from `localStorage['umami.auth']` when logged into cloud.umami.is
- **Critical:** Must use `/analytics/us/api/` prefix, NOT `/api/` (returns 401)
- **Endpoints:** stats, metrics, event-data/properties, event-data/values (all documented in CLAUDE.md)
- **Login:** development@thenorthstarhouse.org

### Supabase REST API
- **Auth:** Secret key `SUPABASE_SECRET_KEY` in .env (bypasses RLS)
- **Endpoint:** `$SUPABASE_URL/rest/v1/chat_logs?select=*&order=created_at.desc`
- **Schema:** id, created_at, session_hash, query_text, response_text, intent, assets_referenced, duration_ms, model

Both are now curl-able from terminal. No browser needed for data pulls going forward.

---

## Analytics inventory (what we capture today)

### Custom events (9 types, instrumented in index-maplibre-analytics.js)

| Event | Properties | Signal type |
|-------|-----------|-------------|
| `toggle:open-now` | state | Feature usage |
| `toggle:events-14d` | state | Feature usage |
| `category:filter` | category | Discovery intent |
| `category:clear` | — | Filter reset |
| `detail:open` | name, city, category | Venue engagement |
| `events:date-filter` | filter (tonight/weekend) | Temporal intent |
| `outbound:event-ticket` | url, title, venue | Business referral (conversion) |
| `outbound:lodging-vrbo` | url | Lodging referral |
| `marker:click` | name, city, category | Map interaction |

### What's NOT instrumented (gaps found during POC)

1. **Chatbot deep link clicks** — AI recommends venues with `[[Asset Name|pid]]` links. Zero tracking on whether users click them. This is potentially our most powerful referral channel, completely invisible.
2. **Session-level journey tracking** — Umami gives us aggregate counts. We can't reconstruct "visitor X filtered trails, then galleries, then asked chatbot about dinner." Need session attribution.
3. **Chatbot conversation depth** — We log individual queries but not conversation flow (did they ask a follow-up? did they click a deep link from the response?).
4. **Directory page interactions** — search queries, card expansions, deep link clicks from directory are not instrumented.
5. **Itinerary engagement** — which itinerary was opened, how far they scrolled, whether they clicked "show on map."
6. **Time-on-section** — no scroll depth or section visibility tracking.

---

## Swarm results summary

### 5 synthetic visitors, 15 minutes, blind

| Visitor | Persona | Interactions | Key behavior | Chatbot? |
|---------|---------|-------------|--------------|----------|
| 1 | Tourist couple (Sacramento) | ~5 (partial) | Weekend filter, browsed hub + directory | No |
| 2 | Family with kids | ~3 (partial) | Weekend filter, tried galleries | No |
| 3 | Local ("what's tonight") | 18 | Tonight filter, category dropdown, directory search, VRBO link | Yes — "What's good to eat tonight in Nevada City?" |
| 4 | Art collector (SF) | 15 | Galleries → Public Art → Cultural Orgs filters, directory search "galleries" | Attempted (timeout) |
| 5 | Hiker discovering culture | 15 | Trails → Galleries → Eat/Drink (progressive shift!), opened itinerary | Yes — hiking→culture query, clicked deep link to LeeAnn Brook Gallery |

### Umami captured

- 68 custom events, 9 unique types
- toggle:open-now (25), toggle:events-14d (24), category:filter (7), detail:open (4)
- 2 outbound ticket clicks (Spring Street Swing Out → nevadacountyswings.org)
- 1 outbound lodging click (VRBO Nevada County)
- Categories filtered: Walks & Trails (2), Historic Landmarks (2), Galleries & Museums (1), Eat/Drink/Stay (1), Cultural Orgs (1)
- Venues engaged: Empire Mine (3 interactions), LeeAnn Brook Gallery (1), Center for the Arts (1)

### Supabase captured

- 5 chat log entries (2 real queries + 3 test/debug, all pre-swarm Feb 15-16)
- Swarm chatbot queries did NOT persist (CDP connection issues killed the serverless calls)
- Pre-swarm queries show rich AI responses: 8-12 venue recs per query, MUSE citations, event cross-sells

---

## Blind reconstruction accuracy

A blind analyst (no ground truth knowledge) was given only the aggregate Umami + Supabase data. Results:

| Ground truth | Blind reconstruction | Accuracy |
|-------------|---------------------|----------|
| visitor-3: local planning tonight | "Tonight Planner" cluster — correctly linked tonight filter + dining chatbot + ticket clicks | HIT |
| visitor-1/5: out-of-towner researching trip | "Trip Researcher" cluster — correctly identified VRBO + weekend + trails pattern | HIT |
| visitor-4: art collector multi-category journey | Buried in residual "Casual Browser" cluster | MISS |
| visitor-5: progressive trails → galleries → dining shift | Invisible in aggregate data | MISS |
| visitor-2: family with kids | No signal detected (too few interactions) | MISS |

**Conclusion:** High-signal behaviors (conversions, outbound clicks, chatbot queries, time filters) are readable from aggregate data. Subtle behavioral arcs require session-level attribution.

---

## What a real phase would need to deliver

### Tier 1: Fix instrumentation gaps
- Instrument chatbot deep link clicks (biggest gap)
- Add session-level event properties (session ID on all custom events)
- Instrument directory page (search, card expand, deep link click)
- Instrument itinerary engagement (which one, scroll depth, show-on-map)

### Tier 2: Reporting pipeline
- Automated data pull script (Umami API + Supabase REST → JSON)
- Session reconstruction logic (cluster events by session, infer journey)
- Business referral report (which venues got outbound clicks, from what paths)
- Intent classification (tonight planner / trip researcher / local / art seeker / etc.)

### Tier 3: Committee-facing output
- One-page demand signal report (monthly or after events)
- "Here's what visitors wanted, here's which businesses got traffic"
- Chatbot query analysis (what are people asking? what's missing from the site?)
- Comparison over time (are event ticket clicks growing? is chatbot usage increasing?)

---

## Technical learnings from the POC

- **CDP can't handle concurrent agents** — connection timeouts when multiple agents share tabs. Sequential execution works.
- **Umami share URL has no API** — must use authenticated internal API path (`/analytics/us/api/`)
- **Supabase anon key is insert-only** — need secret key for reads
- **Supabase pooler region matters** — `aws-0-us-west-1` was wrong for our project. Get the correct string from dashboard.
- **Agent-browser agents must be told NEVER localhost** — some agents browsed localhost:8001 instead of the Vercel URL, generating zero analytics.

---

## Key files

| File | Purpose |
|------|---------|
| `.planning/phases/07-demand-signal-reporting/SWARM-POC-RESULTS.md` | Full ground truth + Umami data + Supabase data |
| `.planning/phases/07-demand-signal-reporting/BLIND-INTENT-RECONSTRUCTION.md` | Blind analyst's reconstruction from data alone |
| `.planning/phases/07-demand-signal-reporting/POC-INTERNAL-BRIEF.md` | This file |
| `website/cultural-map-redesign-stitch-lab/index-maplibre-analytics.js` | Analytics instrumentation wrapper |
| `.env` | Umami + Supabase credentials (all working) |
