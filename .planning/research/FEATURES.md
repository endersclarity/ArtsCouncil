# Feature Research

**Domain:** Cultural tourism / DMO interactive experience platform
**Researched:** 2026-02-14
**Confidence:** MEDIUM-HIGH (competitive analysis verified against live sites; tech capabilities verified via Context7; AI concierge and analytics patterns based on multiple corroborating sources)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or amateurish compared to the DMO platforms visitors have already used.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Pre-built itineraries (1/2/3-day)** | Diana's direct request; Experience Charter Priority #1; every funded DMO has these (VTT, Sedona, Bend). Visitors arriving from Sacramento/Bay Area expect "plan my weekend" content. | MEDIUM | Already have `experiences.json` pattern. New `itineraries.json` with day/time/stop structure. Author 9 itineraries (3 durations x 3 themes). Content authoring is the bulk of work, not code. |
| **Itinerary map visualization** | If you show an itinerary, users expect to see it on the map. Numbered stops with route lines per day. VTT does this. | MEDIUM | Reuse existing experience route rendering. Add day-boundary visual (color shift or dashed segment). Deep-link each itinerary via URL param. |
| **Analytics (pageviews + custom events)** | Committee needs data to justify continued investment. Without analytics, the platform is a demo, not a tool. Every serious DMO site tracks engagement. | LOW | Plausible Analytics: one `<script>` tag + 12 `plausible()` calls for custom events. $9/mo. No cookies, no consent banner. Context7 confirms: `plausible('EventName', {props: {...}})` is the entire API. |
| **Outbound click tracking** | Arts Council's value proposition to local businesses is referral traffic. Must prove "we sent X people to your website/directions." | LOW | Plausible custom events on outbound links: `plausible('Outbound', {props: {destination: url, asset: name}})`. Trivial to add to existing detail panel click handlers. |
| **Mobile-first UX polish** | 60%+ of tourism site traffic is mobile. A visitor on Broad Street with a phone is the primary use case. Current responsive layout is "good" but not "great." | MEDIUM | Bottom-sheet detail panel, touch-friendly filters, map controls sized for thumbs. Not a rewrite -- incremental CSS + interaction fixes. |
| **MUSE editorial aesthetic** | Diana's explicit directive: "more of a reflection of the design of MUSE." The editorial voice IS the brand. Without it, this is just another map. | MEDIUM | Typography hierarchy, whitespace, bold section headers, magazine-quality layout. This is design work, not feature work. Already have Playfair Display + DM Sans. |
| **Search (directory + map)** | Users expect to type a name and find it. Current explore section has search, but it should be prominent and fast. | LOW | Already partially built in explore section. Make it a persistent search bar in the filter area, not buried below the map. |
| **Shareable deep links** | Users share "check out this place" links. Already have `?pid=` and `?muse=` params. Need to extend for itineraries and events. | LOW | Add `?itin=arts-nature-2day` and `?event=<id>` params. Pattern already established. |

### Differentiators (Competitive Advantage)

Features that set the product apart. None of GVNC's comparable competitors have these, and they are hard to replicate.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **AI concierge (Gemini chatbot)** | VTT's MindTrip partnership is the only comparable in the Sierra region. A Gemini-powered concierge grounded in MUSE content + 685 assets + Trumba events answers "what should I do tonight?" with editorial voice, not generic AI. VTT's saw 5000% itinerary creation growth. | HIGH | Gemini API with Google Search grounding (Context7 verified: `{googleSearch: {}}` tool config). System prompt with MUSE editorial context. Client-side `@google/genai` SDK supports chat with streaming. Needs: API key management (proxy or Vercel serverless function), system prompt with local data injection, chat UI component, conversation state. |
| **Demand signal reporting** | No small-town DMO captures "what do visitors search for?" data. Analytics custom events + search queries + category filter usage = a demand intelligence dashboard the committee can act on. "People keep searching for 'culinary' but we only have 12 restaurants mapped." | MEDIUM | Plausible dashboard with custom event props. Category filter events, search queries, itinerary selections. Monthly export or live dashboard shared with Diana. The insight is the product, not the code. |
| **Multi-source event aggregation (Trumba + LibCal + iCal)** | Currently pulling 155 events from Trumba RSS alone. Adding Nevada County Library (LibCal) and City of GV/NC (CivicEngage iCal) could triple event coverage. More events = more reasons to visit = more engagement. No competitor aggregates across municipal + arts + library calendars. | MEDIUM | LibCal has a read API (Context7/web confirmed). CivicEngage exports iCal. Build a unified event model that normalizes RSS + iCal + LibCal JSON into the existing event card format. Deduplication by venue+date is the hard part. |
| **Editorial-driven design (magazine-as-interface)** | The "interactive travel publication" framing Diana described. Not a map tool, not a directory -- a magazine you can interact with. MUSE editorial cards, pull quotes, corridor narratives, photographic hero sections. No DMO platform treats editorial content as the primary interface layer. | HIGH | This is design + content work, not a feature toggle. Requires: editorial section between map and directory, MUSE content integration with Heyzine attribution, photography pipeline (biggest gap), cinematic scroll-driven storytelling. The existing MUSE editorial cards + experience narratives are the foundation. |
| **Curated experience auto-tour** | The cinematic flyTo between stops with narrative connectors is genuinely unique. No competitor has this. It turns the map from a reference tool into an experience. | LOW | Already built. Polish and extend to itineraries. |
| **"Open Now" with timezone-aware hours** | Confirmed via competitive analysis: zero competitors have this. It solves the "I'm standing downtown, what's open?" use case that mobile tourists actually have. | LOW | Already built. Hourly refresh, Luxon-based. Just needs visibility (promote in hero section). |
| **Cultural corridor storytelling** | Highway 40/20/49 routes from MUSE Issue 3. Turns "driving through" into "stopping at." No other cultural district maps highway corridors as cultural narratives. | LOW | Already built. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for a volunteer-maintained, no-budget cultural tourism platform.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Booking/ticketing integration** | DMOs like VTT and Sedona have it. Seems like a natural conversion funnel. | Requires payment processing, liability, business agreements, and ongoing maintenance. A volunteer project cannot support transaction infrastructure. The Arts Council is not a booking agent. | Link OUT to business websites and ticket platforms (Eventbrite, Brown Paper Tickets). Track outbound clicks as the conversion metric. |
| **User accounts and saved trips** | Sedona has "save to my trip" bookmarks. Seems useful for trip planning. | Requires auth infrastructure, data storage, privacy policy, account management UI. Massive scope for a static site with no backend. | Use localStorage for session-based "favorites" list. Generate a shareable URL with selected stops encoded as query params. No accounts needed. |
| **User-generated content (reviews, photos, ratings)** | CrowdRiff's UGC photo integration is compelling. Yelp-style reviews seem democratic. | Requires moderation, spam filtering, content policy, legal review. A volunteer cannot moderate user content. Reviews create liability. | Curate professional and MUSE photography. Link to Google Maps for reviews. The editorial voice IS the content strategy -- UGC dilutes it. |
| **CMS for business owners** | Businesses want to update their own hours and descriptions. | Multi-tenant CMS is a full SaaS product. Authentication, permissions, content review workflows, data validation. This is a 6-month project by itself. | Google Sheet to JSON pipeline for Arts Council staff updates. One trusted editor, not hundreds of business accounts. |
| **Native mobile app** | "Everyone has an app." Committee members may ask for this. | App store deployment, two codebases (iOS + Android), update cycles, download friction. PWA provides 95% of the benefit. | Add PWA manifest + service worker for "Add to Home Screen" capability. Offline caching of data.json for in-field use. Zero app store friction. |
| **Multilingual support** | Sedona has 6 languages. International visitors exist. | Translation of 685 asset descriptions, all editorial content, all UI strings. Ongoing maintenance as content changes. Massive content scope for a volunteer project. | Defer until data shows international visitor demand in analytics. Browser-level translation (Chrome Translate) covers 80% of the need. |
| **Real-time chat with a human** | "Can I talk to someone?" is a natural request. | Requires staffing, response time SLA, hours of operation. The Arts Council has limited staff. | AI concierge handles 80% of queries. Fallback: "Visit the Nevada City Chamber Visitor Center at 132 Main St" with hours and phone number. |
| **Social features (commenting, sharing walls)** | "Build community" sounds good in meetings. | Moderation burden, spam, off-topic content, legal liability. Social features require ongoing human attention that a volunteer project cannot provide. | Social sharing buttons (copy link, share to social media). Let social happen on social platforms. |
| **All-in-one event submission** | "Let businesses submit their own events." | Moderation, spam, duplicate events, data quality. Events from 3 feed sources (Trumba, LibCal, iCal) already cover the landscape. | Arts Council manages Trumba calendar centrally. Libraries manage LibCal. Cities manage CivicEngage. Platform aggregates, not originates. |

## Feature Dependencies

```
[Analytics (Plausible)]
    -- required by --> [Demand Signal Reporting]
    -- required by --> [Outbound Click Tracking]
    -- enhances --> [Every other feature] (all interactions become measurable)

[Itinerary Data Format (itineraries.json)]
    -- required by --> [Itinerary Map Visualization]
    -- required by --> [Itinerary Deep Links]
    -- required by --> [AI Concierge itinerary recommendations]

[Multi-source Event Aggregation]
    -- requires --> [Unified Event Model (normalizing RSS + iCal + LibCal)]
    -- enhances --> [AI Concierge] (more events = better answers)
    -- enhances --> [Itineraries] (events can be woven into day plans)

[AI Concierge (Gemini)]
    -- requires --> [Analytics] (to track what people ask)
    -- requires --> [Itineraries] (to recommend trip plans)
    -- requires --> [Serverless proxy] (API key cannot be client-side)
    -- enhances --> [Demand Signal Reporting] (chat queries = purest demand signal)

[MUSE Editorial Aesthetic]
    -- independent --> (design work, no technical dependencies)
    -- enhances --> [AI Concierge] (editorial tone in system prompt)
    -- enhances --> [Itineraries] (editorial narrative for each stop)

[Mobile UX Polish]
    -- independent --> (CSS + interaction work)
    -- enhances --> [Every user-facing feature]

[Search Enhancement]
    -- enhances --> [AI Concierge] (search fallback when concierge is overkill)
    -- enhances --> [Demand Signal Reporting] (search queries tracked via Plausible)

[PWA / Offline Support]
    -- independent --> (service worker + manifest)
    -- enhances --> [Mobile UX] (installable, cached data for in-field use)
```

### Dependency Notes

- **Analytics must come first:** Without Plausible, no feature has measurable impact. The committee needs numbers.
- **Itineraries before AI Concierge:** The concierge needs itinerary data to recommend trips. Build the data first, then teach the AI about it.
- **Event aggregation is independent but high-value:** Adding LibCal + CivicEngage triples event coverage with moderate effort. Can proceed in parallel with itineraries.
- **AI Concierge is the capstone:** It depends on analytics (for tracking), itineraries (for recommendations), and editorial content (for tone). Build it after the foundation is solid.
- **MUSE aesthetic and mobile UX are parallel tracks:** Design work that can happen alongside feature development without blocking anything.

## MVP Definition

### Launch With (v1 -- Phase 4 immediate)

- [x] **Analytics foundation (Plausible)** -- Committee needs data yesterday. One script tag, 12 custom events. Deploy in a day.
- [x] **Outbound click tracking** -- Proves referral value to businesses. 30 minutes of work on top of Plausible.
- [x] **Pre-built itineraries (3 minimum)** -- Diana's direct request. 1-day Arts & Culture, 2-day Arts & Nature, 1-day History & Innovation. Content authoring is the bottleneck.
- [x] **MUSE editorial polish pass** -- Not a redesign, just elevation. Tighten typography, improve section hierarchy, add editorial rhythm. Design sprints, not rewrites.

### Add After Validation (v1.x -- Phase 4 extended)

- [ ] **Full itinerary suite** (9 itineraries: 3 durations x 3+ themes) -- Trigger: first 3 itineraries show engagement in analytics
- [ ] **Multi-source event aggregation** -- Trigger: committee asks "why aren't library events showing?" or analytics show event section is high-engagement
- [ ] **Explore directory overhaul** -- Trigger: analytics show directory section bounce rate is high
- [ ] **Mobile UX deep pass** -- Trigger: analytics show >50% mobile traffic (likely)
- [ ] **PWA manifest + service worker** -- Trigger: mobile users request "add to home screen"
- [ ] **Search enhancement** -- Trigger: demand signal data shows people want to find specific venues

### Future Consideration (v2+ -- Phase 5)

- [ ] **AI Concierge (Gemini)** -- Defer until itineraries + analytics + event aggregation are solid. The concierge needs data to be useful. Also needs serverless proxy (Vercel function) for API key security. HIGH complexity but HIGH differentiation.
- [ ] **Demand signal dashboard** -- Defer until 3+ months of analytics data exists. Plausible dashboard may suffice; custom reporting only if committee needs more.
- [ ] **Category evolution** -- Defer until committee provides explicit mapping of charter focus areas to platform categories. Biggest blast radius of any change.
- [ ] **Data enrichment (250+ missing MUSE venues)** -- Defer until core features are stable. Geocoding + data entry for each venue. Could be a volunteer project.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Analytics (Plausible) | HIGH | LOW | **P1** |
| Outbound click tracking | HIGH | LOW | **P1** |
| Pre-built itineraries (3) | HIGH | MEDIUM | **P1** |
| MUSE editorial polish | HIGH | MEDIUM | **P1** |
| Itinerary map visualization | MEDIUM | MEDIUM | **P1** |
| Shareable itinerary deep links | MEDIUM | LOW | **P1** |
| Mobile UX polish | HIGH | MEDIUM | **P2** |
| Full itinerary suite (9) | MEDIUM | MEDIUM | **P2** |
| Search enhancement | MEDIUM | LOW | **P2** |
| Multi-source event aggregation | MEDIUM | MEDIUM | **P2** |
| Explore directory overhaul | MEDIUM | MEDIUM | **P2** |
| PWA / offline support | LOW | LOW | **P2** |
| AI Concierge (Gemini) | HIGH | HIGH | **P3** |
| Demand signal dashboard | MEDIUM | MEDIUM | **P3** |
| Category evolution | MEDIUM | HIGH | **P3** |
| Data enrichment (250+ venues) | MEDIUM | HIGH | **P3** |

**Priority key:**
- P1: Must have for next milestone (Phase 4 core)
- P2: Should have, add when P1s are stable and validated by analytics
- P3: Future phase, requires foundation from P1 + P2

## Competitor Feature Analysis

| Feature | Visit Truckee Tahoe | Visit Santa Fe | Visit Bend | Visit Sedona | **GVNC (Current)** | **GVNC (Planned)** |
|---------|---------------------|----------------|------------|--------------|---------------------|---------------------|
| Interactive map | Itinerary-only | No (separate domain) | Yes (filtering) | No | **Yes (685 assets, 10 categories, 3D terrain)** | Same + itinerary overlay |
| Category filtering | No | No | Yes | No | **Yes (10 categories, color-coded)** | Same |
| Real-time events | No | Calendar with filters | Calendar | No | **Yes (155 from Trumba RSS)** | **300+ from 3 sources** |
| Open Now | No | No | No | No | **Yes (timezone-aware)** | Same |
| AI trip planning | **Yes (MindTrip)** | No | No | No | No | **Yes (Gemini, v2)** |
| Curated routes | Curated itineraries | No | Ale Trail only | No | **Yes (10 experiences + 3 corridors)** | Same + 9 itineraries |
| Editorial content | No | Digital visitor guide | Blog/journal | No | **Yes (MUSE cards, corridor narratives)** | Enhanced editorial sections |
| Analytics/intelligence | Internal only | Unknown | Unknown | Unknown | No | **Yes (Plausible + demand signals)** |
| Booking integration | Yes (lodging) | No | No | Yes (hotels) | No | **No (deliberate anti-feature)** |
| Trip planner/save | Yes (AI-generated) | No | No | Yes (basic save) | No | **Deep-linkable itineraries** |
| 3D terrain | No | No | No | No | **Yes** | Same |
| Deep linking | No | No | No | No | **Yes** | Extended for itineraries + events |
| Cinematic auto-tour | No | No | No | No | **Yes** | Extended for itineraries |

### Competitive Summary

GVNC already leads on 12 of 17 tracked features. The two meaningful gaps are:

1. **AI trip planning** -- VTT's MindTrip partnership shows 5000% itinerary creation growth. This is the single most impactful feature to add. Planned for Phase 5 with Gemini.

2. **Booking integration** -- Deliberately excluded. The platform drives referrals, not transactions. Outbound click tracking proves the value without the liability.

After Phase 4 (itineraries + analytics + event aggregation + editorial polish), GVNC will lead on 15 of 17 features. After Phase 5 (AI concierge), 16 of 17 -- with booking as the only deliberate gap.

## How Features Typically Work in This Domain

### Itinerary / Trip Planning Systems

**How DMOs do it (observed patterns):**
- **VTT (MindTrip):** AI-powered. User answers preference questions, gets multi-day itinerary with lodging. Conversion funnel ends at booking.
- **Sedona:** Basic "save to my trip" bookmark list. No structure, no narrative, no map integration.
- **Visit Bend:** No trip planner. Relies on blog content ("3 days in Bend") for itinerary guidance.
- **Most small DMOs:** PDF itineraries or blog posts. Not interactive.

**What GVNC should do:** Pre-built, editorially-authored itineraries with day/time structure, map visualization, and cinematic auto-tour. The editorial voice (from MUSE) is the differentiator -- these are curated narratives, not algorithm-generated lists. Each itinerary is a `itineraries.json` entry with stops linked to `data.json` assets. Deep-linkable, shareable, and trackable via Plausible.

**Expected behavior:** User selects duration (1/2/3 day) and theme. Sees day-by-day timeline with morning/afternoon/evening stops. Each stop shows name, description, estimated time, and links to detail panel. Map shows numbered stops with route line per day. Auto-tour available.

### Multi-Source Event Aggregation

**How it typically works:**
- **Primary feed:** Trumba RSS (already integrated, 155 events)
- **Library events:** LibCal has a read API that returns JSON. Events include title, date, time, location, description. Filter by branch/category.
- **Municipal events:** CivicEngage and similar platforms export iCal (.ics) feeds. Standard RFC 5545 format with VEVENT components.
- **Deduplication:** Match on venue name + date + time. Fuzzy matching needed (e.g., "Miners Foundry" vs "Miners Foundry Cultural Center").

**Expected behavior:** Unified event model that normalizes all sources into a common format. Single event list in the UI with source attribution. Venue matching links events to map markers regardless of source. Filter by source optionally ("Library events," "Arts Council events," "City events").

### AI Concierge / Chatbot

**How DMOs do it (observed patterns):**
- **VTT (MindTrip):** Dedicated AI trip planning partner. Deep integration with VTT's listings. Lodging-centric conversion funnel. Saw engagement up 220%, itinerary creation up 5000%.
- **Visit Estes Park ("Rocky Mountain Roamer"):** AI chatbot on WhatsApp and Instagram. Real-time recommendations.
- **Destination Toronto (GuideGeek):** AI tool that incorporates the DMO's businesses and attractions into itineraries.

**What GVNC should do:** Gemini-powered chat widget grounded in local data. System prompt includes: 685 asset descriptions, MUSE editorial context, curated experience narratives, itinerary data, current events from Trumba. Uses Google Search grounding for questions outside the local data (e.g., weather, driving directions). Tone matches MUSE editorial voice -- warm, knowledgeable, culture-forward, not corporate.

**Technical approach (verified via Context7):**
- `@google/genai` JavaScript SDK for chat with streaming (`ai.chats.create()`, `chat.sendMessageStream()`)
- Google Search grounding via `{googleSearch: {}}` tool config
- System instruction with MUSE editorial tone + local data context
- Serverless proxy (Vercel function) to protect API key
- Chat history maintained client-side
- Track every query via Plausible for demand signal capture

### Analytics + Demand Signal Capture

**How DMOs typically track:**
- Google Analytics 4 (most common, but cookie-heavy and privacy-invasive)
- Simpleview DMS (enterprise DMO platform with built-in analytics)
- ADARA / Zartico (travel-specific analytics platforms, expensive)

**What GVNC should do:** Plausible Analytics because: no cookies (no consent banner needed), privacy-first (GDPR/CCPA compliant), lightweight (< 1KB script), custom events with properties, $9/month. Custom events to track:

1. `Category_Filter` -- props: `{category: "Galleries"}`
2. `Open_Now_Toggle` -- props: `{state: "on"}`
3. `Events_Filter` -- props: `{state: "on"}`
4. `Experience_Selected` -- props: `{name: "Gold Rush Heritage", type: "experience"}`
5. `Itinerary_Selected` -- props: `{name: "Arts and Nature", duration: "2-day"}`
6. `Detail_Panel_Opened` -- props: `{asset: "Del Oro Theater", category: "Performing Arts"}`
7. `Outbound_Website` -- props: `{asset: "Art Works Gallery", url: "..."}`
8. `Outbound_Directions` -- props: `{asset: "Art Works Gallery"}`
9. `Outbound_Phone` -- props: `{asset: "Art Works Gallery"}`
10. `Search_Query` -- props: `{query: "wine tasting"}`
11. `AI_Concierge_Query` -- props: `{query: "what's open tonight"}`
12. `Deep_Link_Opened` -- props: `{type: "pid", id: "..."}`

**Demand signal = the aggregate story these events tell.** "Category filter shows 40% of users try Culinary, but we only have 12 restaurants mapped. Gap identified." This is the intelligence product the committee needs.

### Editorial-Driven Design (Magazine-as-Interface)

**What this means in practice:**
- Sections feel like magazine spreads, not app screens
- Typography does heavy lifting (Playfair Display for impact, DM Sans for readability)
- Whitespace is generous, not cramped
- Pull quotes from MUSE articles appear between functional sections
- Photography is hero-sized and editorial-quality (biggest gap currently)
- Color comes from editorial palette, not UI framework defaults
- Scroll storytelling: sections reveal with narrative flow, not just stacking
- The Heyzine flipbook links maintain attribution to the physical magazine

**2026 design trends supporting this approach (from web research):**
- "Digital collecting turned editorial" -- mixing images with labels and catalog information
- "Motion narrative" -- scroll becomes the storyteller
- Print-inspired digital design making a comeback as reaction to AI-generated sameness
- DMOs treating websites as "content hubs that supply authoritative information to AI tools"

**What GVNC should do:** Lean into the magazine metaphor. The hero section is the cover. The map section is the centerfold. Itineraries are feature articles. The explore directory is the index. The colophon is the masthead. Every section should feel like turning a page, not scrolling a feed.

## Sources

### Verified (HIGH confidence)
- Plausible Analytics custom events API -- Context7 `/plausible/docs` (verified Feb 2026)
- Gemini API chat + streaming + Google Search grounding -- Context7 `/websites/ai_google_dev_gemini-api` (verified Feb 2026)
- Competitive DMO analysis -- `docs/analysis/competitive-dmo-analysis.md` (original research, Feb 2026)
- Feature audit -- `docs/analysis/2026-02-14-feature-audit.md` (codebase crawl, Feb 2026)
- PRD -- `docs/PRD.md` (project requirements, Feb 2026)
- MUSE content catalog -- `docs/analysis/muse-content-catalog.md` (cross-referenced, Feb 2026)

### Corroborated (MEDIUM confidence)
- [Visit Truckee Tahoe AI trip planner performance](https://www.visittruckeetahoe.com/) -- MindTrip integration, 220% engagement increase, 5000% itinerary creation growth (multiple web sources agree)
- [DMO AI chatbot patterns](https://twosixdigital.com/on-our-radar-highlight-new-ai-powered-itinerary-planners-that-integrate-onto-dmo-websites/) -- TwoSix Digital analysis of AI itinerary planners
- [DMO technology trends 2026](https://www.simpleviewinc.com/blog/stories/post/transformative-travel-and-tourism-trends-a-2026-guide-for-future-focused-dmos/) -- Simpleview article on DMO trends
- [DMO marketing trends 2026](https://noblestudios.com/travel-tourism/travel-tourism-marketing-trends-2026/) -- Noble Studios travel marketing trends
- [Destinations International on AI](https://destinationsinternational.org/blog/five-things-dmo-marketers-need-know-about-ai-technology) -- Industry association perspective
- LibCal API capabilities -- [Springshare LibCal](https://www.springshare.com/libcal) (read/write APIs confirmed by multiple sources)
- [Editorial design trends 2026](https://humanmade.com/work/travel-trends-2026-a-scalable-immersive-editorial-platform/) -- Human Made on scalable editorial platforms

### Unverified (LOW confidence -- flag for validation)
- VTT MindTrip specific performance numbers (220%/5000%) -- sourced from VTT's own marketing, not independently verified
- CivicEngage iCal export capability -- assumed based on industry standard, not directly verified against GV/NC's specific CivicEngage instance
- Gemini API free tier limits for a tourism chatbot use case -- pricing and rate limits should be verified before committing to Gemini over alternatives

---
*Feature research for: GVNC Cultural District Experience Platform*
*Researched: 2026-02-14*
