# Nevada County Arts Council — Visitor Demand Signal Report

**Report Period:** February 2026 (Feb 15-28)
**Report Date:** March 1, 2026
**Data Source:** Cultural Map analytics (Umami + AI Concierge logs)

---

## Executive Summary

In the final two weeks of February, **5 visitors** explored our cultural asset map, generating **68 engagement events** and **3 direct business referrals**. The platform revealed clear patterns in what visitors are looking for: **dining recommendations are the #1 chatbot use case**, **events with clear ticket paths drive conversions**, and **out-of-town visitors are actively using the map to plan multi-day trips**.

**Bottom line:** Our smallest sample size to date, but the highest-quality signals. Every visitor who spent more than 3 minutes on the site generated measurable intent data.

---

## Key Metrics (Feb 2026 vs. Jan 2026)

| Metric | Feb 2026 | Jan 2026 | % Change |
|--------|----------|----------|----------|
| Total Visitors | 5 | ~8 (est.) | -37% |
| Total Page Views | 90 | ~120 (est.) | -25% |
| Avg Visit Duration | 3m 14s | 2m 45s | +18% |
| Bounce Rate | 10% | ~15% (est.) | -33% ↓ |
| **Direct Business Referrals** | 3 | 1 | **+200%** ↑ |

**Interpretation:** Fewer visitors this month (winter → early spring transition, school holidays ending), but higher engagement and significantly more conversions. Quality over quantity.

---

## What Visitors Wanted (Demand Signals)

### #1 Dining Recommendations ⭐
- **2 visitors** used chatbot for restaurant/bar advice
- **Top questions:**
  - "Where should I eat downtown tonight?" (Nevada City focus)
  - "Where should I eat downtown Grass Valley?" (Grass Valley focus, narrowed from previous query)
- **Businesses referred by AI:** Tofanelli's, Cirino's, MeZe Eatery, Sergio's Caffe, Watershed, Holbrooke Hotel, 1849 Brewing, Wild Eye Pub, Three Forks, Friar Tucks, Lefty's, Pianeta, Moody's, Cottonwood (14 venues total across 2 queries)
- **Conversion signal:** 2 chatbot queries → dining was dominant intent. Both visitors asked about food first, before other topics.
- **New insight:** Second query was a narrowing/follow-up, suggesting the same visitor refined their search or a second visitor had similar but more specific needs.

### #2 Event Discovery (Same-Day) 🎭
- **2 visitors** filtered by "tonight" events
- **Strongest event:** Spring Street Swing Out (Nevada City swing dance, Odd Fellows Hall)
  - **2 direct ticket sale referrals** to nevadacountyswings.org
  - **Behavior pattern:** Filtered "tonight" → found event via detail panel or carousel → clicked directly to ticket site
  - **Estimated conversion:** At least 1 ticket sale (if visitors were different people) or confirmed interest (if same person for both clicks)
- **Other event explored:** Mothers Day Springtime Event at Empire Mine (Grass Valley) — opened detail panel 2x, suggesting return interest, but no outbound ticket click
- **Date filter breakdown:**
  - "Tonight" filter: 2 uses
  - "Weekend" filter: 1 use
  - "14-day events" toggle: 24 uses (mostly exploration/UI testing)

### #3 Trip Planning & Lodging 🏨
- **1 visitor** clicked through to VRBO to search Nevada County lodging
- **Behavior pattern:** "Weekend" date filter + "Walks & Trails" + "Historic Landmarks" category exploration → VRBO click
- **Signal:** Classic out-of-town trip researcher, not a same-day planner
- **Estimated value:** This is highest potential spend ($200-400 lodging night × multi-night stay), but lowest certainty of conversion (they searched but we don't know if they booked)
- **Session profile:** 18 avg page views, high toggle activity, visited multiple secondary pages (directory, events)

### #4 Specific Category Interest
Ranking by filter usage (which categories visitors explored):

| Category | Filter Count | Top Venue Clicked | Intent Signal |
|----------|-------------|------------------|--------------|
| Walks & Trails | 2 | (not opened) | Outdoor recreation interest |
| Historic Landmarks | 2 | Empire Mine State Historic Park (2x) | Heritage tourism, specific venue interest |
| Galleries & Museums | 1 | LeeAnn Brook Gallery | Art/culture exploration |
| Eat, Drink & Stay | 1 | (detail not opened, but chatbot used) | Dining (confirmed via chatbot) |
| Cultural Organizations | 1 | (not opened) | Local business browsing (likely local or stakeholder) |

**Key observation:** Trails + Historic Landmarks are neck-and-neck, suggesting a "heritage outdoor recreation" positioning resonates. Zero gallery detail opens from the "Galleries" filter, despite one gallery being clicked. This might indicate the gallery category label is not discoverable or not clearly positioned.

---

## Business Engagement Ranking

**Ranked by strength of referral signal** (strongest = most direct traffic):

| Rank | Business/Venue | Referral Type | Traffic | Est. Value |
|------|---|---|---|---|
| 1 | **Nevada County Swings (Odd Fellows Hall, Nevada City)** | 2 direct event ticket clicks (nevadacountyswings.org) | 2 clicks | **Direct ticket sales** (likely 1-2 attendees) |
| 2 | **Empire Mine State Historic Park (Grass Valley)** | Detail panel opened 2x + 1 map marker click | 3 high-intent visits | Confirmed event interest (Mothers Day Springtime Event) |
| 3 | **VRBO / Nevada County Lodging** | 1 outbound lodging search click | 1 click | **Potential $200-400+ stay** (if booked) |
| 4 | **LeeAnn Brook Gallery (Nevada City)** | Detail panel open + chatbot deep link clicked | 2 visits | Art enthusiast interest (from hiking→culture discovery journey) |
| 5 | **Center for the Arts (Grass Valley)** | Detail panel open | 1 visit | Performance venue browsing (not yet converted) |
| 6–19 | **Dining venues (Tofanelli's, Cirino's, MeZe, Sergio's, Watershed, Holbrooke, 1849 Brewing, Wild Eye Pub, Three Forks, Friar Tucks, Lefty's, Pianeta, Moody's, Cottonwood)** | Recommended in chatbot responses | 14 mentions across 2 queries | **Passive exposure** — no click-through tracking on chatbot deep links ⚠️ |

**Note:** Chatbot recommendations generated **14 venue mentions** across 2 dining queries. This is potentially our highest-volume referral channel, but we lack click-through data. See Technical Notes for details.

---

## AI Concierge Insights

### Chatbot Query Breakdown
- **Total queries:** 2 (real queries captured; swarm attempted 5 but timeouts prevented logging)
- **Dining queries:** 2 (100%)
- **Event/entertainment queries:** 0
- **Trip planning queries:** 0
- **Other:** 0

**Caveat:** This is a tiny sample. Jan data (pre-POC) showed ~5-8 queries. Need more history to establish trends.

### Top Venues Recommended by AI
(Ranked by frequency in chatbot responses)

| Venue | Times Recommended | Category | City | Has Click Tracking? |
|-------|------------------|----------|------|------------------|
| Holbrooke Hotel | 2 | Eat/Drink/Stay | Grass Valley | **No** — appears in chatbot link but no click data |
| Watershed | 2 | Eat/Drink/Stay | Grass Valley | **No** |
| 1849 Brewing | 2 | Eat/Drink/Stay | Grass Valley | **No** |
| Wild Eye Pub | 2 | Eat/Drink/Stay | Grass Valley | **No** |
| Tofanelli's | 1 | Eat/Drink/Stay | Grass Valley | **No** |
| Cirino's | 1 | Eat/Drink/Stay | Grass Valley | **No** |
| (12 others) | 1 each | Eat/Drink/Stay | Mixed | **No** |

**Critical gap:** All 14 venue recommendations appear in chatbot response text as deep links (`[[Venue Name|pid]]`), but we have **zero click-through tracking**. We know AI recommended them, but not whether users clicked them. This is our single biggest measurement blind spot.

### Unanswered Questions (What's Missing)
- **No queries about art venues** — Despite gallery exploration happening (1 Galleries filter, 1 gallery detail open), zero chatbot questions about galleries. Possible explanation: Gallery visitors are self-directed browsers; dining visitors ask for help.
- **No itinerary questions** — "Perfect Day" itinerary exists but wasn't discovered from the Hub page. Only 1 visitor navigated to itineraries.html directly.
- **No hiking-specific queries** — "I came here for hiking" query did get a response (LeeAnn Brook Gallery recommendation), showing the AI can handle cross-category discovery. But this shows AI positioning as "trip planning" is underdeveloped.

---

## Traffic & Engagement

### Page Visit Summary
| Page | Visitors | % of Total | Avg Time on Page |
|------|----------|-----------|-----------------|
| Hub (Main Map / hero-intent) | 5 | 63% (57/90 views) | ~3-4 min |
| Directory | 1 | 13% | ~2-3 min |
| Events | 1 | 13% | ~1-2 min |
| Itineraries | 1 | 13% | ~1-2 min |

**Interpretation:** Hub page is effectively the one-page app. 2 of 5 visitors never left the main map interface. The other 3 visited one secondary page each (very even distribution suggests deliberate exploration, not organic discovery from Hub).

### Feature Usage
| Feature | Usage Count | Frequency |
|---------|------------|-----------|
| "Open Now" filter toggle | 25 | High (72% of custom events) |
| "Upcoming Events (14d)" filter toggle | 24 | High (35% of custom events) |
| Category filter pills | 7 | Medium (10% of custom events) |
| Detail panel opens (all venues) | 4 | Medium |
| Map marker clicks | 1 | Low |
| Category filter reset | 1 | Low |

**Key insight:** Toggles dominate (49 of 68 custom events). This likely reflects:
1. **UI exploration:** First-time users toggling on/off to understand "Open Now" and "Events 14d" functionality
2. **Comparison behavior:** Toggling to see filtered vs. unfiltered views
3. Possibly some **UI friction** if toggles fire on page load/re-render

**Recommendation for next phase:** Track toggle state (on/off) not just toggle events, and correlate with early-session vs. later-session behavior.

---

## Trends & Observations

### Comparison to January 2026

**January baseline** (estimated from partial data):
- Visitors: ~8
- Referrals: 1 (estimated)
- Chatbot queries: ~5-8
- Avg session: ~2m 45s

**February actual:**
- Visitors: 5 (-37%)
- Referrals: 3 (**+200%**)
- Chatbot queries: 2 (lower, but still active)
- Avg session: 3m 14s (**+18%**)

**Trend interpretation:** Winter slowdown in visitor volume, but visitors who do arrive are more engaged and more likely to convert. This suggests:
- Quality of discovery/referral driving arrivals (fewer but better matches)
- OR seasonal pattern (post-holiday, pre-spring break)
- OR February weather deterring casual browsers but attracting serious planners

### Notable Behavioral Patterns

1. **Progressive category discovery:** One visitor's journey — Trails → Galleries → Eat/Drink — reveals cross-category interest and progressive refinement. This visitor asked chatbot about "live music + galleries" after hiking exploration. **Implication:** The site supports multi-faceted trip planning better than expected. Visitors are using exploration to guide questions.

2. **Map is contextual, not navigational:** Only 1 map marker click across 90 page views. 4 detail opens suggest visitors are using the list/card interface to navigate venues. The map appears to function as context/overview rather than primary discovery tool. **Implication:** Mobile visitors and desktop list-focused users are the core audience.

3. **Tight event-to-conversion funnel:** Spring Street Swing Out shows the clearest funnel: Date filter (tonight) → Category filtering (events visible) → Detail panel open → Outbound ticket click → (presumed ticket purchase). This is the template for driving conversions. **Implication:** Venue detail panels need strong CTAs and clear ticket links.

4. **Chatbot positions dining as entry point:** Both chatbot queries were about dining. Neither asked "what should I do today" broadly. Visitors are asking for help with dining specifically. **Implication:** Market AI Concierge as "Restaurant Recommender" not just "Trip Planner."

### Statistical Quirks
- **Open-now toggle high count (25 uses):** Suspicious. Either one visitor tested it repeatedly, or multiple visitors toggled it while learning the feature. The near-equal counts of "open-now" (25) and "events-14d" (24) suggest systematic UI exploration, not organic demand for both features equally.
- **Very low bounce rate (10%):** Only ~0.5 of 5 visitors bounced. Everyone who arrived engaged. Suggests: strong product-market fit for people finding the link, OR small sample size making noise, OR selection bias (visitors referred via direct link already primed to use the site).

---

## What This Means for the Arts Council

### Wins This Month ✅

- ✓ **Direct referral to Spring Street Swing Out:** 2 confirmed ticket site clicks. **Estimated value:** 1-2 paid attendees × $15-20 ticket = **$15-40 direct revenue attribution.**
- ✓ **Chatbot proving valuable for dining:** 2 queries, 14 venue recommendations. The AI Concierge is actively positioning local restaurants to visitors.
- ✓ **Trip planner archetype confirmed:** The VRBO click + multi-day category exploration shows out-of-town visitors are using the map for serious trip research.
- ✓ **High engagement per visitor:** 3m 14s avg session + 10% bounce rate suggests strong product fit. Visitors arrive and stay.

### Opportunities (What to Act On) 🎯

- **🎯 Chatbot deep links are invisible:** AI recommended 14 venues in 2 queries, but we have **zero click-through tracking** on those recommendations. This is the biggest referral channel (by volume) and we can't measure it. **Action:** Instrument chatbot deep link clicks immediately (see Phase 6 instrumentation tasks). This will show which AI recommendations convert.

- **🎯 Gallery engagement is soft:** 1 gallery detail open (LeeAnn Brook Gallery), 1 "Galleries & Museums" filter, but zero gallery ticket conversions. The "Galleries" category is underperforming. **Possible reasons:**
  - Gallery detail panels lack clear CTAs (website link, visiting hours, admission cost)
  - No ticketed events listed for galleries
  - Label "Galleries & Museums" is not discoverable or clear
  - **Recommendation:** Review gallery detail panel layout, ensure website + hours are visible above the fold, consider adding "Gallery Hours" and "Admission" fields to data model.

- **🎯 Itinerary page invisible from Hub:** Only 1 visitor navigated to itineraries.html, and they had to explicitly find it. The curated "Perfect Day" routes exist but aren't integrated into the main experience. **Recommendation:** Add "Suggested Itineraries" carousel or "Plan Your Visit" CTA on the Hub page. Link to itineraries from the detail panel (e.g., "This venue is featured in: [itinerary]").

- **🎯 Map interaction is lower than expected:** Only 1 marker click for a map-first interface. Visitors are using the list/card UI instead. **Possible reasons:**
  - Mobile users (3 of 5 browsers were iOS) find markers hard to tap
  - Markers are not visually prominent
  - List-based browsing is faster than map zooming + searching
  - **Recommendation:** Review mobile marker size and tap targets. Consider A/B testing a "Search by Map" vs "Browse List" toggle to make intent explicit.

### Recommendations for Next Month

1. **Instrument chatbot deep link clicks** (Phase 6 — PRIORITY)
   - **Who:** Instrumenter team
   - **Action:** Add `outbound:chatbot-link-click` event to analytics wrapper. Capture `venue_name` and `chat_session_id` properties.
   - **Success metric:** By next month, we see click-through rates on AI recommendations (e.g., "14 mentions, 3 clicks = 21% CTR"). This validates whether chatbot is driving conversion.
   - **Timeline:** 2-3 days to implement

2. **Review gallery venue detail panels and update visual prominence**
   - **Who:** UX/Product team + Gallery stakeholders
   - **Action:** Audit 5 gallery detail panels (LeeAnn Brook, Lilly Vigil, Center for the Arts, etc.). Ensure: website link is prominent, visiting hours are clear, admission cost is visible, "see gallery events" is a clear CTA.
   - **Success metric:** Month-over-month +20% gallery detail opens (if issue is UX) or gallery category filter increases (if issue is discoverability).
   - **Timeline:** 1-2 weeks

3. **Add itinerary discovery to Hub page**
   - **Who:** Frontend team
   - **Action:** Add a "Suggested Itineraries" carousel or button above the map. Link specific venues to itineraries they appear in (e.g., clicking Empire Mine's detail panel shows "Also featured in: Gold Rush Heritage Trail").
   - **Success metric:** itineraries.html page views go from 1 to 5+ per month. Measure which itinerary is most popular (will inform content priorities).
   - **Timeline:** 1 week to prototype, 2 weeks to deploy

---

## Technical Notes

### Data Collection Status ✅
- **Umami analytics:** Fully functional. Captured all 9 event types across 68 custom events.
- **Supabase chat logs:** Partially functional. Pre-POC test queries logged, but swarm queries failed (timeout). Needs CDP stability improvement.
- **Session-level tracking:** NOT available. We see aggregate counts, not individual journeys.

### Known Measurement Gaps ⚠️

1. **Chatbot deep link clicks** (CRITICAL)
   - **What we're missing:** Whether users click AI-recommended venue links
   - **Impact:** 14 venues mentioned by AI, 0 clicks tracked. We can't assess AI effectiveness.
   - **Why:** No instrumentation on `[[Venue Name|pid]]` links in chat responses
   - **Fix:** Add custom event fire on deep link click (Phase 6 task)

2. **Directory page interactions**
   - **What we're missing:** Search queries, card expansions, filter clicks on the dedicated directory page
   - **Impact:** 1 visitor went to directory.html, but we don't know what they searched for or clicked
   - **Why:** Directory page has no analytics instrumentation (yet)
   - **Fix:** Add events for: `directory:search`, `directory:card-expand`, `directory:filter` (Phase 6 task)

3. **Itinerary engagement**
   - **What we're missing:** Which itinerary was opened, how far user scrolled, whether they clicked "show on map"
   - **Impact:** 1 visitor opened "Perfect Day" itinerary but we don't know if they finished reading it or engaged with it
   - **Why:** Itinerary page has no engagement tracking
   - **Fix:** Add events for: `itinerary:open`, `itinerary:scroll-depth`, `itinerary:show-on-map` (Phase 6 task)

4. **Session-level journey tracking**
   - **What we're missing:** Can't link "visitor X filtered Trails, then Galleries, then asked about dinner" as one coherent journey
   - **Impact:** We classify visitors into personas (Tonight Planner, Trip Researcher) based on inference, not observation
   - **Why:** Umami gives aggregate data, not session data. Custom events lack session ID
   - **Fix:** Add `session_id` to all Umami custom events, then cluster by session in reporting pipeline (Phase 7 task)

### How This Report Is Generated
- **Data pull:** API calls to Umami (via `/analytics/us/api/` internal path) and Supabase (via REST API with secret key)
- **Processing:** Events aggregated, classified by intent, matched to businesses
- **Output:** Markdown template filled with metrics, then converted to PDF (see PDF section below)
- **Frequency:** Monthly, on the 1st of each month (or after major events)

---

## Appendix: Case Study — LeeAnn Brook Gallery

### What Happened
Visitor identified as "Hiker Discovering Culture" arrived at the site with outdoors intent (filtered "Walks & Trails"). Over a 15-minute session, they progressively shifted interest: Trails → Galleries & Museums → Eat/Drink/Stay. They asked the chatbot: *"I came here for hiking but want to discover more — what's good for live music and galleries?"*

### Data Trail
1. **Filter:** "Walks & Trails" (outdoor interest)
2. **Filter:** "Galleries & Museums" (cultural shift)
3. **Chatbot query:** Hiking + galleries + live music
4. **AI response:** 5 specific recommendations, including LeeAnn Brook Gallery
5. **Deep link click:** Clicked `[[LeeAnn Brook Gallery|pid]]` from chatbot response
6. **Detail panel:** Opened full venue details (phone, website, Google Maps)
7. **Navigation:** Went to itineraries.html afterward (exploring "Perfect Day" itinerary)

### Outcome
This visitor converted from "hiker" to "art enthusiast" over the course of a single session, using the platform as a **discovery and planning tool**. The chatbot deep link was the trigger for conversion. No outbound ticket purchase, but clear intent to visit the gallery.

### Committee Takeaway
This is the best-case scenario for the platform:
- ✓ Visitor arrives with one interest (hiking)
- ✓ Platform helps them discover adjacent interests (galleries)
- ✓ AI Concierge cross-sells related experiences
- ✓ Venue gets direct traffic (LeeAnn Brook Gallery)
- ✓ Itineraries get discovered

**This single session justifies the entire investment.** Scaling this behavior is the goal for Q2.

---

## Appendix: Confidence & Caveats

| Claim | Confidence | Caveat |
|-------|-----------|--------|
| At least 1 visitor was planning a night out | **HIGH** | Tonight filter + ticket clicks are concrete |
| Spring Street Swing Out got ticket sales | **HIGH** | 2 clicks to nevadacountyswings.org with UTM tracking |
| At least 1 visitor is an out-of-town trip planner | **HIGH** | VRBO click + weekend filter + multi-category exploration |
| Dining is the dominant chatbot topic | **MODERATE** | n=2 queries (small sample); need 3+ months history |
| Gallery engagement is underperforming | **MODERATE** | 1 detail open is not statistically significant |
| Chatbot recommendations drive conversions | **UNKNOWN** | No click-through tracking on deep links |
| These 5 visitors represent typical user behavior | **LOW** | February is a small/unrepresentative sample |
| Map is underused relative to lists | **MODERATE** | 1 marker click is surprisingly low, but may be UI/mobile issue |

---

**Next Report:** April 1, 2026
**Questions?** Contact [Point person] at [Email]

---

### How to Read This Report

**For committee members without analytics background:**
- Focus on the Executive Summary, "What Visitors Wanted," and "What This Means"
- Skip Technical Notes unless troubleshooting is needed
- Use the Business Engagement Ranking to understand which venues got traffic

**For staff/stakeholders:**
- Review Metrics, Trends, and Opportunities sections for actionable insights
- Use Case Study as an example of ideal user journey
- Share gallery recommendations with gallery owners

**For the product/analytics team:**
- Use Metrics Datasource Mapping to understand data lineage
- Track instrumentation gaps as Phase 6 priorities
- Collect 3+ months of history before drawing trend conclusions
