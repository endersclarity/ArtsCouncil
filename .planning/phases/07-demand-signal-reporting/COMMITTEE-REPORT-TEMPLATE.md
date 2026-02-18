# Nevada County Arts Council — Visitor Demand Signal Report

**Report Period:** [Month/Year]
**Report Date:** [Generated Date]
**Data Source:** Cultural Map analytics (Umami + AI Concierge logs)

---

## Executive Summary

This month, **[X] visitors** explored our cultural asset map, generating **[Y] engagement events** and **[Z] direct business referrals**. The platform revealed clear patterns in what visitors are looking for: dining recommendations, event discovery, and weekend getaway planning.

---

## Key Metrics (This Month vs. Last Month)

| Metric | This Month | Last Month | % Change |
|--------|-----------|-----------|----------|
| Total Visitors | — | — | — |
| Total Page Views | — | — | — |
| Avg Visit Duration | — min | — min | — |
| Bounce Rate | — % | — % | — |
| **Direct Business Referrals** (outbound clicks) | — | — | — |

---

## What Visitors Wanted (Demand Signals)

### #1 Dining Recommendations
- **[X] visitors** used chatbot for restaurant/bar advice
- **Top questions:** "Where to eat tonight?" "Where can I find local cuisine?"
- **Businesses referred:** [List venues recommended by chatbot]
- **Conversion signal:** [X] chatbot queries → Y% chatted about dining first

### #2 Event Discovery
- **[X] visitors** filtered by "tonight" or "weekend" events
- **Strongest event:** [Event name, venue, ticket clicks]
- **[Y] direct ticket sales referrals** to [Business Name]
- **Event categories explored:** [Perform Arts, Fairs & Festivals, etc.]

### #3 Trip Planning & Lodging
- **[X] visitors** clicked through to VRBO/hotel booking sites
- **Signal:** Out-of-town trip research behavior (not same-day planning)
- **Categories explored:** [Trails, Historic Landmarks, etc.]
- **Avg. session duration for trip planners:** [X] min

### #4 Specific Category Interest
Ranking by filter usage:

| Category | Filter Count | Top Venue Clicked |
|----------|-------------|------------------|
| [Category 1] | [X] | [Venue Name] |
| [Category 2] | [X] | [Venue Name] |
| [Category 3] | [X] | [Venue Name] |

---

## Business Engagement Ranking

**Ranked by strength of referral signal** (strongest = most direct traffic):

| Rank | Business/Venue | Referral Type | Traffic | Est. Value |
|------|---|---|---|---|
| 1 | [Business Name] | Event ticket clicks | [X] clicks | [Direct sales] |
| 2 | [Business Name] | Detail panel opens | [X] visits | [High interest] |
| 3 | [Business Name] | Category filter → chatbot rec | [X] mentions | [Medium interest] |
| — | — | — | — | — |

**Note:** Chatbot recommendations generated [X] venue mentions but lack click-through tracking. This is our biggest measurement gap (see Technical Notes below).

---

## AI Concierge Insights

### Chatbot Query Breakdown
- **Total queries:** [X]
- **Dining queries:** [X] ([Y]%)
- **Event/entertainment queries:** [X] ([Y]%)
- **Trip planning queries:** [X] ([Y]%)
- **Other:** [X] ([Y]%)

### Top Venues Recommended by AI
(Ranked by frequency in chatbot responses)

| Venue | Times Recommended | Category | Has Click Tracking? |
|-------|------------------|----------|------------------|
| [Venue Name] | [X] | [Category] | Yes / No |
| [Venue Name] | [X] | [Category] | Yes / No |
| [Venue Name] | [X] | [Category] | Yes / No |

### Unanswered Questions (What's Missing)
- [If no chatbot queries about galleries, note: "Zero queries about art venues despite 3x gallery detail opens"]
- [If no queries about itineraries, note: "AI trip builder exists but not discovered via Hub page"]
- [If common question patterns, note: "Multiple visitors asked about [X], suggests [Y] section needs better visibility"]

---

## Traffic & Engagement

### Page Visit Summary
| Page | Visitors | % of Total | Avg Time on Page |
|------|----------|-----------|-----------------|
| Hub (Main Map) | [X] | [Y]% | [X] min |
| Directory | [X] | [Y]% | [X] min |
| Events | [X] | [Y]% | [X] min |
| Itineraries | [X] | [Y]% | [X] min |

### Feature Usage
| Feature | Usage Count | Frequency |
|---------|------------|-----------|
| "Open Now" filter | [X] | High / Medium / Low |
| "Upcoming Events" filter | [X] | High / Medium / Low |
| Category pills | [X] | High / Medium / Low |
| Detail panel opens | [X] | High / Medium / Low |
| Map marker clicks | [X] | High / Medium / Low |

---

## Trends & Observations

### Month-over-Month Comparison
- **Visitor growth:** [+X% / -X%]
- **Referral growth:** [+X% / -X%] direct business clicks
- **Chatbot adoption:** [+X% / -X%] queries month-over-month
- **Category preference shift:** [E.g., "Trails interest up 20%, Dining stable, Events up 8%"]

### Notable Behavioral Patterns
1. **[Pattern A]:** [Description and implication for the Arts Council]
2. **[Pattern B]:** [Description and implication]
3. **[Pattern C]:** [Description and implication]

---

## What This Means for the Arts Council

### Wins This Month
- ✓ **Direct referral traffic to [Business Name]:** X outbound clicks, estimated Y revenue impact
- ✓ **Chatbot proving valuable:** X% of visitors used AI assistant, generating Z venue recommendations
- ✓ **[Category/venue/feature] stronger than expected:** [Explanation]

### Opportunities (What to Act On)
- 🎯 **Galley engagement is low:** [X] detail opens but zero ticket sales. Consider: better gallery event listings, more prominent CTAs, weekend gallery hours.
- 🎯 **Itinerary page not discovered:** Only [X] visitor found curated routes. Consider: link itineraries from Hub, add "Plan Your Visit" CTA above the fold.
- 🎯 **[Category] underperforming:** [X] filters, no conversions. Data suggests: [possible reason]. Recommend: [action].

### Recommendations for Next Month
1. **[Actionable recommendation based on data]**
   - Who: [Committee member or staff responsible]
   - Action: [Specific change]
   - Success metric: [What we'll track]

2. **[Actionable recommendation]**
   - Who: [Responsible party]
   - Action: [Specific change]
   - Success metric: [What we'll track]

3. **[Actionable recommendation]**
   - Who: [Responsible party]
   - Action: [Specific change]
   - Success metric: [What we'll track]

---

## Technical Notes

### Data Collection
- **Umami analytics** captures: visitor traffic, page views, category filters, detail panel opens, outbound event ticket clicks, lodging referrals
- **Supabase chat logs** capture: AI concierge queries and responses
- **Session-level tracking:** Currently not available (aggregate data only)

### Known Measurement Gaps
1. **Chatbot deep link clicks:** AI recommends venues with clickable links, but we don't track whether users click them. **Impact:** We can see "X venues mentioned by AI" but not "Y actually visited from AI recommendation."
2. **Directory page interactions:** Search and filter activity on the dedicated directory page is not instrumented. **Impact:** We miss local browsing behaviors.
3. **Itinerary engagement:** We don't track which itineraries are opened or how far users scroll through them.
4. **Session-level journeys:** Umami gives us aggregate counts. We can't see "Visitor A filtered Trails → Galleries → asked about dinner" as a coherent journey.

### How This Report Is Generated
- **Monthly automation:** On [Day] of each month, a data pull script fetches Umami stats + Supabase chat logs
- **Time window:** All events from [1st to 28th/31st of month]
- **Processing:** Events are aggregated, classified by intent (dining, events, lodging, etc.), and matched to businesses
- **Output:** This markdown report is generated, then converted to PDF for committee distribution

---

## Appendix: Sample Deep Dive

### Case Study: [Event Name or Venue Name]
**What happened:** [Specific user behavior example]
**Data trail:** [Sequence of events that reveal intent]
**Outcome:** [Did they convert? Did they ask chatbot? Did they refer a friend?]
**Committee takeaway:** [Why this matters]

---

**Next Report:** [Date]
**Questions?** Contact [Point person] at [Email]
