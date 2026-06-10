# Arts Hub V2 — Product Assessment

**Date:** 2026-03-15
**Author:** Product Critic Agent
**Subject:** Map-centric integrated experience for Nevada County Arts Council

---

## 1. What Problem Does This Solve?

NCAC currently operates three separate digital properties that don't talk to each other:

1. **Trumba calendar** on Squarespace — shows events as a list. No geographic context. You see "Live Jazz at The Holbrooke" but have no idea where The Holbrooke is relative to your hotel, what else is nearby, or what's happening at other venues that same night.

2. **Cultural Asset Map** (stitch-lab) — shows 1,969 pins on a map. Beautiful, technically impressive. But it's static asset inventory. It doesn't tell you that the gallery you're looking at has an opening reception this Thursday, or that the restaurant next door is in the MUSE directory as an artisan pick.

3. **MUSE business directory** — curated list of artisanal, boutique places ("no Jack in the Box"). Exists as a print magazine supplement. Has no digital presence beyond a static PDF or spreadsheet. Cannot be searched, filtered, or discovered spatially.

The result: a visitor checking "what's happening tonight in Nevada City" must check the Trumba calendar, mentally cross-reference with the asset map, hope the venue name matches something they recognize, and then independently find restaurant recommendations from MUSE or a chamber site. Most people just ask a friend or skip the planning entirely.

**The V2 hub collapses these three into one interface.** When you filter events to "tonight," the map lights up only the venues with events tonight. When you click a map pin, you see both the asset details AND its upcoming events. When you find a MUSE-curated restaurant, you can see what's happening nearby after dinner. The integration itself is the product.

This is not a small refinement. NCAC's Culture Forward strategic plan mentions the need for a "centralized digital hub" 21 times. 26% of survey respondents cite "lack of information about events" as their primary barrier to cultural participation. The data exists. The audience exists. The connective tissue does not.

---

## 2. Who Is It For?

### User Story 1: The Weekend Visitor from Sacramento

Sarah drives up from Sacramento on a Friday afternoon. She knows Nevada City is "artsy" but has never been. She pulls up the hub on her phone. The map shows tonight's events as highlighted pins. She sees a gallery opening on Broad Street and a live jazz show two blocks away — both visible on the same map. She taps the gallery pin, sees it's free, sees the jazz show starts at 8pm, and discovers an artisan pizza place (MUSE pick) between the two. She just planned her evening in 90 seconds without checking three websites.

**What this requires:** Time-filtered event pins on the map. Venue detail panels that show both asset info and upcoming events. MUSE overlay visible alongside events.

### User Story 2: The Curious Local Who Checks Every Thursday

Marcus lives in Grass Valley and likes live music but is tired of finding out about shows the day after they happened. Every Thursday he opens the hub, filters to "This Weekend," and sees what's on. He discovers a roots band at Golden Era he's never heard of. He taps the pin, reads the description, saves it. He notices a ceramic studio open house the next morning two streets over — something he wouldn't have found on any single calendar.

**What this requires:** Reliable, comprehensive event data from Trumba. Category/time filtering that works fast. Enough density of events that the map feels alive on any given week.

### User Story 3: Eliza Preparing a Board Presentation

Eliza needs to show the NCAC board that the hub is working. She opens the analytics and can see: 847 unique visitors this month, 63% mobile, most-viewed category is "Live Music," most-clicked venue is Nevada Theatre, Tuesday evenings are dead. She screenshots the map showing event density for a busy weekend and includes it in her Culture Forward Phase 1 update. The hub is generating the data the strategic plan requires.

**What this requires:** Umami or equivalent analytics. Event-level click tracking. Exportable summary data. This is post-MVP but should be wired from day one.

---

## 3. What Makes It Different From NCAC's Existing Web Presence?

| Property | What it does | What it can't do |
|----------|-------------|-----------------|
| **Squarespace site** (nevadacountyarts.org) | NCAC org info, artist calls, Trumba calendar embed, membership, blog | No map. No spatial context. Calendar is a list with no filtering beyond category. |
| **Stitch-lab map** (Vercel) | 1,969 assets on MapLibre, filters, corridors, detail panels, chatbot, trip builder | No live events. No time-based filtering. Overly complex — 50+ JS files, 830-line HTML. Feature-rich but scope-crept. |
| **MUSE magazine** | Beautifully curated business directory, editorial content, community voice | Print-first. No digital search. No spatial context. Not updated in real-time. |
| **Visit Truckee Tahoe** (aspirational comp) | Polished tourism hub with lodging, dining, activities. Professional DMO. | East-side coverage only. Not arts-focused. Static curation, not live event data. Budget and staff NCAC doesn't have. |

**The V2 hub is the only thing that answers the question: "What's happening WHERE tonight?"** That spatial-temporal intersection is what nobody else provides — not the Squarespace site, not the stitch-lab, not MUSE, and not Visit Truckee Tahoe.

The current arts-hub V1 (the `website/arts-hub/` codebase) is a clean start that gets the architecture right — events page, explore page, Gallery Frame design system — but the events page and the map page are still separate HTML files with no cross-linking. V2 would make the map the primary interface with events flowing through it.

---

## 4. Is Map-Centric the Right Call?

### Arguments For

**The map IS the differentiator.** NCAC has 1,969 geolocated cultural assets. No comparable small arts council has anything close (the research confirms this). A list of events is commodity — Google, Eventbrite, and Facebook all do it. An interactive map with event-highlighted pins, time filtering, and curated directory overlay is something nobody at this scale has built.

**Geography matters here more than most places.** Nevada County isn't a grid city. It's a collection of small towns (Nevada City, Grass Valley, North San Juan, Penn Valley) connected by winding mountain roads. Knowing that two events are 3 minutes apart vs. 25 minutes apart changes your evening plan. A list can't communicate that. A map can.

**It matches how visitors already think.** Tourists exploring a new area think spatially: "I'm here, what's around me?" Not: "Show me an alphabetical list of events in a county I've never been to."

**The stitch-lab proves the technical viability.** MapLibre can handle 1,969 assets on mobile. The rendering pipeline exists. The data exists. This is not speculative.

### Arguments Against

**Most users want a simple list first.** Data from every event discovery platform (Eventbrite, Bandsintown, Do512) shows that users overwhelmingly start with time-based lists, not maps. "What's tonight" is a temporal query, not a spatial one. Leading with a map when most people want a list could create friction.

**Map-first is harder on mobile.** Maps on phones are frustrating — small targets, accidental zooms, pins overlapping. The stitch-lab already has 50+ JS files partly because making the map work well on mobile is genuinely hard. The detail panel, the filter overlay, the legend — they all fight for screen space.

**Event density may be too low.** If the Trumba calendar has 3 events on a Tuesday, the "events tonight" map will show 3 pins in a sea of empty. That looks broken, not helpful. List-based UIs degrade gracefully when content is sparse. Maps don't.

**Content maintenance burden.** A map with 1,969 assets needs coordinate accuracy, category correctness, and up-to-date hours. Diana's spreadsheet has assets missing lat/lng. The stitch-lab already has 3 documented assets with incorrect map coordinates. At scale, map maintenance is more expensive than list maintenance.

### Verdict

Map-centric is the right strategic call for differentiation, but the execution needs a hybrid approach. The map should be prominent and central — the "wow" moment when someone first arrives — but it should share the stage with a fast, filterable event list. When someone asks "what's tonight," show them a list AND highlight the pins. Don't force them to find answers by panning around a map.

The stitch-lab's mistake was trying to be everything: magazine layout, editorial content, events broadsheet, district showcase, lodging, trip builder, chatbot — all on one page. The V2 hub should be disciplined: map + events + directory, deeply integrated, nothing else at launch.

---

## 5. How Does This Compare to What Other Small Arts Councils Are Doing?

Based on the comparable hubs research (10 sites analyzed):

**Nobody at NCAC's scale does all three (calendar + map + directory) as a unified hub.** That's the headline. Most small arts orgs do one thing well:

- **West Harlem Arts Alliance** — artist directory + calendar, no map
- **Arts Council of Placer County** — directory-as-resource-hub, no interactive map
- **Vermont Arts Council** — best events UX (list/calendar/map toggle), but no curated directory
- **Creative Directory Napa Valley** — best directory model, no events, no map
- **Paseo Arts District (OKC)** — events + directory on Squarespace, no custom map

The closest thing to what V2 proposes is the **Arts in California Parks** project, which has a synchronized map-list viewport — but that's a state-level program with state-level funding, not a county arts council running on a $500 stipend.

**NCAC's existing 1,969-asset MapLibre map is already more technically sophisticated than anything comparable orgs have built.** Most use embedded ArcGIS iframes or Google Maps embeds. The custom MapLibre implementation with category layers, marker styling, and detail panels is genuinely ahead of the peer group.

The risk isn't that someone else is doing this better. The risk is that NCAC tries to do too much with too few hands and the hub becomes a beautiful prototype that stops getting updated after 3 months.

---

## 6. Risks and What "Blow People Away" Looks Like Measurably

### Risks

**Risk 1: Event data sparsity.** Trumba-only means the calendar is incomplete. If a visitor checks "tonight" and sees 2 events when there are actually 8 happening across town (the other 6 on KVMR's calendar, Stardust's Instagram, and word of mouth), the hub feels broken. This is the most dangerous risk because it's a credibility problem. Once someone decides the hub "doesn't have everything," they don't come back.

**Mitigation:** Aggressive Trumba curation in the near term. Honest framing ("events from the NCAC calendar"). External calendar ingestion as the #1 post-MVP priority. The listening session Eliza proposed is the right venue to get venue operators submitting their own events.

**Risk 2: Maintenance capacity.** NCAC doesn't have a communications manager. Eliza and Diana are stretched. The hub needs someone updating events, fixing broken coordinates, and responding to "why isn't my venue listed?" inquiries. If that person doesn't exist, the hub will rot.

**Mitigation:** Build for minimum maintenance. Auto-pull from Trumba (already the plan). Static asset data that only changes quarterly. No features requiring ongoing editorial curation at launch.

**Risk 3: Stitch-lab scope creep repeats.** The stitch-lab started as a cultural asset map and ended up with a chatbot, trip builder, lodging section, email capture, translation widget, QR flyer gallery, and 50+ JavaScript files. The V2 hub could easily follow the same trajectory if Kaelen is building in isolation without regular checkpoints.

**Mitigation:** The brief is well-scoped. The deferred features list is clear. The structured brainstorming + alpha + in-person session workflow that was agreed on March 13 is the right process. Stick to it.

**Risk 4: Brand alignment timing.** Kevin Bird's brand refresh isn't done yet. Building the hub before the style guide is finalized risks rework. But waiting risks losing momentum.

**Mitigation:** The current brand mockup (`brand-mockup-final.html`) and the compressed brand guide are sufficient for an alpha. Gallery Frame (3px solid #FF2400) is confirmed. Nunito/Playfair as stand-ins for Polymath is reasonable. Kevin can provide refinements that don't require architectural changes.

### What "Blow People Away" Looks Like — Measurably

Eliza's quote: "Blow people away, because we've done something very well with what we have — our calendar, and our cultural asset map, and our business directory from MUSE."

That translates to measurable success criteria:

| Metric | Baseline | "Blown Away" Target | Timeframe |
|--------|----------|-------------------|-----------|
| Monthly unique visitors to hub | 0 (doesn't exist yet) | 500 | 3 months post-launch |
| % of visitors who interact with map | N/A | 40%+ | 3 months |
| Events page → map click-through | 0% (currently separate) | 25%+ | 3 months |
| "Lack of info about events" barrier (survey) | 26% | <20% | Next survey cycle |
| Venue operator positive feedback (beta session) | N/A | 8/10 venue reps say "I want my events on this" | Beta listening session |
| Experience Planning Committee reaction | N/A | Unanimous "let's move forward" | First demo |
| Mobile usability (can find tonight's events in <30 sec) | N/A | 90% of test users succeed | Usability test |

The honest truth: "blow people away" for this audience means three things:
1. It looks professional — not like a side project
2. Events and the map actually talk to each other — the integration they've been asking for
3. It works on a phone — because that's where tourists discover things

If the hub does those three things, NCAC will be ahead of every comparable small arts council in the country. That's not hyperbole — the research confirms it.

---

## 7. What Should Kaelen Say When Presenting This Monday?

### The 60-Second Version

"Culture Forward calls for a centralized digital hub 21 times. We have the three ingredients: the Trumba calendar, the 1,969-asset cultural map, and the MUSE business directory. What we don't have is a single place where they work together. That's what the hub does. When someone asks 'what's happening tonight,' they see a map of tonight's events. When they tap a venue, they see both the place and what's coming up there. When they find a MUSE restaurant, they can see what's nearby after dinner. It's the integration that makes it different from a calendar, different from a map, and different from a directory. It's all three, connected."

### Key Talking Points

1. **Anchor to Culture Forward.** "This isn't my idea. This is Goal 2 of the regional marketing plan, Phase 1, 2026-2027. The community already told you they want this."

2. **Name the problem concretely.** "26% of survey respondents said lack of information about events is their #1 barrier. Our data exists — it's just scattered across three systems that don't talk to each other."

3. **Show the integration, not the map.** "The map is impressive, but the real product is what happens when you filter events to 'tonight' and the map updates to show only tonight's venues. That's the thing nobody else has."

4. **Be honest about scope.** "MVP is events + map + directory, integrated. Ticketing, external calendar scraping, lodging, AI chatbot — all deferred. We can add those later. For now, we nail the core."

5. **Address the politics preemptively.** "This uses NCAC's own data — your calendar, your asset map, your MUSE directory. We're not scraping anyone's calendar or stepping on chamber territory. When it's good enough, venues will want to be on it."

6. **Quantify the competitive advantage.** "I researched 10 comparable arts council hubs. None of them do calendar + map + directory together. Our MapLibre map with 1,969 assets is already more technically advanced than any peer organization. We're not catching up — we're ahead."

7. **Ask for what you need.** "I need two things: (a) the brand style guide when Kevin has it, and (b) a 30-minute checkpoint in two weeks to review the alpha before I build further. That's it."

### What NOT to Say

- Don't demo the stitch-lab. It's 830 lines of HTML with 50 JS files. It will raise more questions than it answers.
- Don't promise a timeline for the full vision. Promise the MVP and a checkpoint.
- Don't get into AI features. Eliza said "I don't think either one of us would know what to even say to that." Park it.
- Don't bring up Visit Truckee Tahoe as a direct comparison. It creates expectations NCAC can't meet at this budget and staffing level.

---

## Assessment Summary

The Arts Hub V2 is the right product for the right moment. Culture Forward demands it. The data exists. The technical foundation (MapLibre, Trumba, MUSE data) is proven. The comparable hubs research shows nobody at NCAC's scale has built this integration.

The main risks are event data sparsity (Trumba-only is incomplete), maintenance capacity (who updates this after launch?), and scope creep (the stitch-lab cautionary tale). All three are manageable with discipline.

The map-centric approach is strategically correct but must be paired with a strong list/timeline view for events. Don't force spatial thinking on people asking temporal questions. Let the map be the "wow" and the list be the workhorse.

If Kaelen delivers a clean, branded, mobile-friendly hub where events and the map are truly integrated — where clicking a pin shows tonight's event at that venue, where filtering to "this weekend" lights up the map — that will be ahead of every comparable small arts council digital presence in the country. For $500 and one developer with Claude Code, that's a remarkable outcome.

The bar for "blow people away" is lower than it seems. The committee has been asking for this for 18 months. Actually building it — and having it work on a phone — will be the wow.
