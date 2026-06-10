# Stories Content Strategy — Arts Hub V2

**Date:** 2026-03-15
**Author:** Content Strategy (Kaelen Jennings)
**For:** Eliza Tudor, Diana Arbex / Gianna
**Status:** Pitch draft for internal review

---

## Section 1: What Eliza & Diana Actually Want

After reading both meeting transcripts (Feb 18, March 13), the Culture Forward strategic plan, the MUSE content catalog, and the writers' room output, here is what leadership actually cares about — not what they say in press releases, but what they get animated about in real conversation.

### Eliza's priorities (from transcript evidence):

1. **"Blow people away, because we've done something very well with what we have."** She wants the existing data — Trumba calendar, 1,969-asset map, MUSE business directory — to be integrated so well that it feels like a fully staffed DMO built it. Not more features. Better execution of what already exists.

2. **Central ticketing dream.** She keeps coming back to the idea that NCAC could be the place where people buy tickets for arts events across the county. She described this as a "dream that keeps coming back" from years before her tenure. Stories that naturally funnel readers toward "get tickets" are aligned with this vision.

3. **Beta testing as community event.** She wants to "gather [venue leaders] together, show them on the big screen, they've highlighted events, they just think they've died and gone to heaven." Stories are part of that wow factor — content that makes the InConcert Sierras and Nevada Theatres of the world feel seen and promoted.

4. **The listening session play.** She envisions a listening session where trusted arts partners see the hub, give input, and become evangelists. Stories give those partners something to share, something to point at and say "this is what the Arts Council is doing for us."

5. **Fill the gap Visit Truckee Tahoe fills for the east side.** "We have no agency like Visit Truckee Tahoe in the western part of Nevada County." She wants this hub to be that — but for arts and culture specifically.

### Diana's priorities (from transcript and MUSE editorial record):

1. **MUSE quality or nothing.** Diana edited three issues of MUSE. She knows what good editorial looks like: proper nouns first, sensory detail, earned adjectives, no tourism cliches. Any "story" on the hub that reads like AI-generated chamber-of-commerce copy will get killed. She will compare every piece to what Jesse Locks, Karen Terrey, and Leslie Caratachea produced in MUSE Issue 3.

2. **The business directory as cultural infrastructure.** Diana curated the MUSE business directory — "no Jack in the Box." She cares deeply that the artisanal curation is preserved. Stories that explain WHY a place is featured (not just that it exists) align with her editorial instinct.

3. **The cultural asset map as her baby.** Diana updated the spreadsheet from 685 to 1,969 assets. She added 494 new entries. Stories that make those assets come alive — that turn a database row into a reason to visit — are stories that honor her work.

4. **"Rural is the New Cool" as thesis statement.** She wrote this piece for MUSE. It is her editorial voice at its purest: Tyler Foote Road, the Ridge, Mother Truckers, Communal Cafe, Crystal Rainbow Rock Shop. Stories that follow this pattern — a local's drive, specific stops, sensory detail, unhurried pace — are stories she would be proud of.

5. **Bridging the Truckee-GVNC divide.** MUSE covers both cultural districts. The hub needs stories that naturally connect Truckee and Grass Valley-Nevada City without making either feel secondary.

### What they would share at a board meeting:

- "We built the first arts-and-culture digital hub in western Nevada County that brings together our calendar, our map, and our MUSE directory. And it has stories."
- "Here is a story about the wine trail that mentions 12 of our listed wineries, and every one of them is clickable on the map."
- "A visitor from Sacramento used this story to plan a weekend. They hit four venues they'd never heard of."
- "The theatre companies asked us to feature their season — and now they're submitting their events to our calendar."

---

## Section 2: Why the Existing 6 MUSE Editorials Are Good But Not Enough

The 6 existing editorials in `muse_editorials.json` are:

1. **Our Cultural Corridors** (Jesse Locks) — Highway routes as heritage corridors
2. **Off the Wall: Art in Nature** (Annette Muller) — Trail art installations
3. **Be Many and Be Loud** (Karen Terrey) — Open mics and literary scene
4. **Rural Is the New Cool** (Diana Arbex) — Local's drive through the Ridge and downtown NC
5. **Julia Morgan's Legacy** (Kyle Winters) — North Star House and Twin Pines architecture
6. **Latinx Culture: At Home in the Moment** (Leslie Caratachea) — Year-round Latinx community

### What they cover well:

- Heritage and place (corridors, architecture, land art)
- Literary/performance culture (open mics)
- Equity and inclusion (Latinx community)
- Local identity (Rural is the New Cool)

### What is conspicuously missing:

**1. No "what's happening tonight" story.** Not a single editorial addresses the live, temporal experience — what it feels like to walk into Golden Era on a Friday, what the Crazy Horse sounds like on a weeknight, what the Onyx Theatre lobby buzzes with before a screening. This is the #1 use case for the hub (Eliza's own words), and there is zero editorial content that supports it.

**2. No food and wine story.** MUSE Issue 3 has a full wine feature ("New Gold in Nevada County," p50-51) and food is woven throughout, but none of the 6 editorials cover it. The 211 "Artisan Place to Eat, Drink or Stay" assets and 22 "Winery/Tasting Rooms" have no narrative support.

**3. No gallery walk / visual arts story.** 83 galleries/studios/museums in the data. 29 more art galleries. The visual arts are the backbone of both cultural districts, and there is no editorial that walks someone through a gallery afternoon.

**4. No music history or live music story.** MUSE Issue 3 has "Lucky Little Towns" (music history, p58-59) but it is not in the 6 editorials. Live music is the single most searched-for cultural activity. The 109 breweries/restaurants/bars and 30 performance spaces have no story connecting them.

**5. No seasonal story.** All 6 editorials are evergreen. Nothing says "come in October for the film festival" or "summer Saturdays at the farmers market." The hub will feel static without temporal hooks.

**6. No tourist orientation story.** All 6 are written for an audience that already knows the region. None says "you are 60 miles from Sacramento, here is what to do with 48 hours." MUSE Issue 1 has "48 Hours in Truckee" and "48 Hours in GVNC" — neither is in the 6.

**7. No maker / artisan story.** The Curious Forge, Truckee Roundhouse, the craft fair circuit — Eliza specifically mentioned the Curious Forge as something the Experience Planning Committee cares about. No editorial covers the maker culture.

**8. No theatre story.** CATS has been running for 30+ years. Sierra Stages, Lyric Rose, LeGacy Presents, Sierra Theatre Company — MUSE Issue 3 has "On and Off the Stage" (p60-61). Not in the 6.

### Audience gaps:

- **First-time visitors from Sacramento/Bay Area:** No orientation content
- **Foodies and wine travelers:** No story at all
- **Families:** No story addresses family-friendly arts experiences
- **Live music seekers:** No story despite this being the top search intent
- **Working artists / creative professionals:** No story about living and working here as a creative

---

## Section 3: Proposed Story Concepts

### Story 1: "Friday Night in Nevada City"

- **Format:** Interactive Map Story
- **Hook:** You drove up from Sacramento after work. It is 6:30 PM. Here is what happens next.
- **Content outline:**
  - Real-time-feeling walkthrough of a Friday evening: gallery that stays open late, dinner at a MUSE-curated restaurant, live music at one of three venues within walking distance
  - Names specific venues by block: Broad Street galleries, Mill Street dining, Commercial Street nightlife
  - Ends with "and if you're staying..." — connecting to the lodging in the directory
  - Emphasizes the walkability that tourists don't expect from a mountain town
- **Venues/assets referenced:** Art Works Gallery, The Granucci Gallery, Lola at The National Exchange, Golden Era Lounge, Nevada Theatre (if showing), Wild Eye Pub, National Exchange Hotel
- **Map integration:** "All 7 venues are within a 5-minute walk. See them highlighted on the map."
- **Source material:** Existing asset data + MUSE directory. Would benefit from one evening of original observation to get current details right.
- **Audience:** Tourist (primary), curious local (secondary)
- **Effort:** Medium — needs light original writing, but all venues are in the data

### Story 2: "New Gold: Nevada County's Wine Country You Didn't Know About"

- **Format:** Feature Article with map pins
- **Hook:** Gold miners dug the earth. Today's winemakers learned to listen to it.
- **Content outline:**
  - Adapted from MUSE Issue 3 "New Gold" article (p50-51) — we already have the editorial source
  - 12+ wineries profiled: Szabo, Lucchesi, Naggiar, Avanguardia, Nevada City Winery, Truckee River Winery, plus the natural wine makers (Arquils, Under the Table, Everwild)
  - The argument: this is a legit wine region that nobody outside Nevada County takes seriously yet
  - Tasting room hours and "pair with" suggestions connecting to MUSE eat/drink listings
- **Venues/assets referenced:** All 22 wineries in the data, plus Montoliva, Gray Pine, Zumo (currently missing, should be added)
- **Map integration:** "See the full wine trail on the map — from Penn Valley to Truckee." Readers can filter to winery/tasting category.
- **Source material:** MUSE Issue 3 wine article is the primary source. Most of this can be adapted rather than written from scratch.
- **Audience:** Tourist (wine travelers), local (discovery)
- **Effort:** Low — MUSE already wrote this. Adaptation and map integration only.

### Story 3: "The $66 Million Scene Nobody's Talking About"

- **Format:** Feature Article / Data Story
- **Hook:** Nevada County's creative sector generates $66 million a year. Here is where that money moves.
- **Content outline:**
  - Opens with the AEP data: $66M economic activity, 1,400 jobs, $13M tax revenue
  - Non-local visitors spend $74.80 per person. Majority say arts/culture is the main reason for their visit.
  - Profiles 4-5 venues that represent different slices of the economy: a gallery owner, a venue operator, a restaurant that books live music, a festival organizer, a teaching artist
  - Closes with the Culture Forward argument: the arts are economic infrastructure, not decoration
- **Venues/assets referenced:** Center for the Arts, Nevada Theatre, Curious Forge, Music in the Mountains, an artisan restaurant (e.g., The Stone House or Pianeta)
- **Map integration:** "These 5 places represent $X in annual cultural economic activity. Explore the full map to see the 1,969 assets that make up the scene."
- **Source material:** Culture Forward economic data is all extracted. Venue profiles would need light original writing. Could interview Eliza for pull quotes.
- **Audience:** Arts professionals, funders, board members, policy makers — the "advocacy" audience
- **Effort:** Medium — data is ready, but making it narrative rather than statistical requires editorial skill

### Story 4: "48 Hours in Grass Valley & Nevada City"

- **Format:** Listicle / Interactive Itinerary
- **Hook:** Two days. Two towns. Everything you need to know.
- **Content outline:**
  - Adapted from MUSE Issue 1 "48 Hours in GVNC" — already written, with 30+ venues named
  - Restructured as a time-based itinerary: Friday evening, Saturday morning/afternoon/evening, Sunday morning
  - Each stop: venue name, what to do there, how long to spend, what's next
  - Mix of galleries, food, music, shopping, nature (Wolf Creek Trail as a morning reset)
  - Ends with "extend your stay" connecting to lodging directory
- **Venues/assets referenced:** 20+ from the MUSE article: Empire Mine, Holbrooke Hotel, Center for the Arts, Miners Foundry, Three Forks Bakery, Kitkitdizzi, Communal Cafe, etc.
- **Map integration:** Full itinerary route on the map. Each stop is a clickable pin. "Follow this route" button.
- **Source material:** MUSE Issue 1 is the primary source. Needs updating (venue hours, new openings) but the bones exist.
- **Audience:** Tourist (first-time visitor)
- **Effort:** Low — adaptation of existing MUSE content

### Story 5: "48 Hours in Truckee"

- **Format:** Listicle / Interactive Itinerary
- **Hook:** Mountain town, real culture. Skip the ski lodge. Start here.
- **Content outline:**
  - Adapted from MUSE Issue 1 "48 Hours in Truckee" plus Issue 3 "Mountain Heart, Small-Town Soul"
  - Truckee-specific itinerary: Historic Downtown, Donner Lake area, the Railyard district
  - Emphasis on what makes Truckee's arts scene distinct from GVNC: Truckee Artist Lofts, 9848 Gallery, Community Arts Center, Piper J Gallery
  - Food/drink integration: Moody's, Alibi Ale Works, Pour House, Coffee Bar, Cottonwood
- **Venues/assets referenced:** 15+ Truckee venues from MUSE
- **Map integration:** Truckee-focused map view with highlighted pins
- **Source material:** Two MUSE articles cover this comprehensively
- **Audience:** Tourist (ski visitors discovering the arts scene), Truckee locals
- **Effort:** Low — adaptation of existing MUSE content

### Story 6: "Every Stage in Nevada County: A Theatre Guide"

- **Format:** Feature Article with venue profiles
- **Hook:** Six theatre companies. Thirty performance spaces. A town of 3,000 with more stages than most cities.
- **Content outline:**
  - Profiles each active theatre company: CATS (30+ years, Asian American theatre), Sierra Stages, Lyric Rose (LGBTQ+), LeGacy Presents, Sierra Theatre Company, House of Fates
  - The venue inventory: Nevada Theatre (oldest original-use theatre in California), Don Baggett Theatre, Off Broadstreet, Miners Foundry, Center for the Arts
  - What makes this unusual: per-capita density of performance venues in a rural county
  - Closing argument: you can see live theatre here every weekend, year-round
- **Venues/assets referenced:** 10+ performance venues, 6 theatre companies — all in the asset data
- **Map integration:** "See every stage on the map" — filter to Performing Arts category
- **Source material:** MUSE Issue 3 "On and Off the Stage" (p60-61) plus asset data. Would benefit from a brief interview with one theatre leader.
- **Audience:** Tourist (theatre lovers), local (discovery of companies they haven't tried)
- **Effort:** Medium — MUSE article plus additional profiling

### Story 7: "The Gallery Walk Nobody Told You About"

- **Format:** Photo Essay / Map Story
- **Hook:** More than 80 galleries in a county of 100,000. Walk three blocks in Nevada City and you'll pass seven.
- **Content outline:**
  - Self-guided gallery walk: downtown Nevada City's gallery cluster, Grass Valley's Mill Street and Main Street galleries, the Seven Hills district newcomers (Crush/The Vault, Wonder Docent, 'Uba Seo)
  - Each gallery profiled: what they show, when they're open, what makes them distinct
  - Special call-out for First Friday art walks and open studio events
  - The Seven Hills neighborhood emergence as a new gallery district
- **Venues/assets referenced:** Art Works Gallery, Granucci Gallery, Seven Stars Gallery, The Chambers Project, Crush/The Vault, 'Uba Seo, Wonder Docent, Make Local Habit, Lorien Powers, Osborn Woods, LeeAnn Brook
- **Map integration:** Walking route overlaid on the map with gallery pins highlighted
- **Source material:** Asset data gives us names and addresses. Photo-dependent — would need gallery images. MUSE directory entries provide some context.
- **Audience:** Tourist, local
- **Effort:** Medium-High — needs original photography or permission to use gallery images

### Story 8: "Sound Check: Where to Hear Live Music This Week"

- **Format:** Recurring Listicle (updated weekly or auto-generated from Trumba data)
- **Hook:** Every venue. Every night. One list.
- **Content outline:**
  - Not a static story — a dynamically-populated feature that pulls from the events calendar
  - Grouped by night of the week, then by venue
  - Each listing: band name, genre tags, venue, time, ticket link
  - Venue mini-profiles for the first-time reader: "Golden Era is a craft cocktail bar with a tiny stage and big sound" — one sentence each
  - Context paragraph at top changes seasonally
- **Venues/assets referenced:** Golden Era, Crazy Horse, Moody's, Wild Eye Pub, Alibi Ale Works, The Fern, Stardust Station, Center for the Arts, Nevada Theatre
- **Map integration:** "See tonight's live music venues on the map" — filters events to music category
- **Source material:** Trumba event data is the engine. Venue descriptions from asset data. Context paragraph needs original writing.
- **Audience:** Local (primary — this is the "check every Thursday" use case from the product assessment), tourist (secondary)
- **Effort:** Low for content, Medium for technical implementation (dynamic generation)

### Story 9: "Make Something: Nevada County's Maker Spaces and Craft Studios"

- **Format:** Feature Article
- **Hook:** A blacksmithing class before lunch. Ceramics after. The Curious Forge alone has 14 different shops under one roof.
- **Content outline:**
  - The Curious Forge as the anchor: what it is, what you can do there, how a visitor can drop in
  - Truckee Roundhouse: the east-side makerspace
  - Indian Springs Art & Ceramic Center in Penn Valley
  - The open studio circuit: ASiF (Artists' Studio in the Foothills), artists who welcome visitors
  - The maker culture argument: this county has an unusual density of people who make things with their hands
- **Venues/assets referenced:** Curious Forge, Truckee Roundhouse, Indian Springs, ASiF, Bear River Glassworks, Wolf Craft School
- **Map integration:** "Find every studio and makerspace on the map" — filter to maker/studio categories
- **Source material:** MUSE Issue 1 "The Maker Movement" (p37). Eliza specifically mentioned Curious Forge as a priority for the Experience Planning Committee.
- **Audience:** Tourist (experiential traveler), local (trying something new)
- **Effort:** Medium — MUSE article exists but needs expansion and current details

### Story 10: "Off the Grid: North San Juan, the Ridge, and Nevada County's Rural Heart"

- **Format:** Feature Article / Photo Essay
- **Hook:** Drive north on Highway 49. Time slows down. The art gets weirder and more honest.
- **Content outline:**
  - Expanded version of Diana's "Rural Is the New Cool" — the Ridge as a distinct cultural zone
  - North Columbia Schoolhouse Cultural Center as the anchor: decades of folk music, poetry, Sierra Storytelling Festival
  - The Ridge community: Mother Truckers, Ridge Cafe, the hand-painted signs, the sense of being in a different Nevada County
  - North San Juan's identity: rural creative hub, Culture Forward's explicit mention of "positioning North San Juan and the Yuba Watershed as cultural sanctuaries"
  - Why this matters: Culture Forward identifies that "arts resources are heavily concentrated in GVNC" — this story makes the case for the rest
- **Venues/assets referenced:** North Columbia Schoolhouse, Mother Truckers, Ridge Cafe, Malakoff Diggins, Washington Hotel, Rice's Crossing Preserve
- **Map integration:** The map zooms to the Ridge and Highway 49 corridor, showing assets outside the GV-NC core
- **Source material:** Diana's MUSE article is the primary source. Culture Forward's equity data provides the "why." Would benefit from one original visit.
- **Audience:** All — locals rediscovering the Ridge, tourists seeking the authentic-rural experience, arts advocates interested in regional equity
- **Effort:** Low-Medium — Diana already wrote this story. Expanding it with map integration and Culture Forward framing is primarily editorial.

### Story 11: "When the Artists Came: A Brief History of Nevada County's Creative Migration"

- **Format:** Feature Article / Long-form
- **Hook:** Gold brought them first. Then the back-to-the-land movement. Then the artists. Here is how a mining county became an arts colony.
- **Content outline:**
  - The arc: Gold Rush → Victorian architecture → hippie migration (1970s) → arts community formation → California Cultural District designation
  - Key moments: KVMR founding, Nevada City Film Festival emergence, Music in the Mountains arrival, CATS establishing Asian American theatre in a majority-white rural county
  - The economic transformation: from extractive industry to creative economy ($66M)
  - Closing: the Culture Forward plan as the latest chapter — community decides arts ARE the economy
- **Venues/assets referenced:** Nevada Theatre (1865), Empire Mine, KVMR, Music in the Mountains, Nevada City Film Festival, Center for the Arts, North Star House
- **Map integration:** Timeline overlay on the map — "see the cultural landscape in 1865, 1970, 2000, 2026"
- **Source material:** MUSE Issue 3 "Lucky Little Towns" (music history) provides the template. Culture Forward provides the data. Would need original research for historical accuracy.
- **Audience:** All — this is the "share at a board meeting" story
- **Effort:** High — requires original research and careful historical writing. Stretch goal.

### Story 12: "Nisenan Land: Indigenous Art and Cultural Reclamation"

- **Format:** Feature Article / Q&A
- **Hook:** Before the Gold Rush, this was Nisenan land. The reclamation is happening now.
- **Content outline:**
  - 'Uba Seo: Nisenan Arts & Culture gallery on Broad Street — the most visible manifestation
  - CHIRP (California Heritage Indigenous Research Project) — the organization behind homeland return
  - The Nisenan Gateway collaboration at Wildflower Ridge Preserve — art as placekeeping
  - Culture Forward's explicit recognition of Indigenous communities in its equity framework
  - Washoe Tribe representation on focus groups
  - Why this matters for the hub: indigenous cultural assets should not be a category checkbox — they are the foundational layer
- **Venues/assets referenced:** 'Uba Seo gallery, Wildflower Ridge Preserve, Donner Summit Petroglyphs
- **Map integration:** Indigenous cultural sites highlighted on the map — petroglyphs, tribal lands, the gallery
- **Source material:** MUSE Issues 1 and 2 both cover indigenous themes ("Visibility Through Art," "From Visibility to Homeland Return"). Culture Forward explicitly names tribal organizations. Would absolutely require review and input from Nisenan/Washoe representatives before publication.
- **Audience:** All — this is the equity story that Culture Forward demands
- **Effort:** High — cannot be written without community review. Must not be performative. Stretch goal that requires relationship-building.

---

## Section 4: Content Calendar Suggestion

### Assumption: 2 stories/month, starting with site launch

**Launch batch (Month 1) — ship with the site:**

| Story | Why first |
|-------|-----------|
| **48 Hours in Grass Valley & Nevada City** (Story 4) | Tourist orientation. The most immediately useful story. Low effort — MUSE adaptation. |
| **New Gold: Wine Country** (Story 2) | Showcases map integration beautifully. Low effort — MUSE adaptation. Demonstrates the "everything connected" value. |

**Month 2:**

| Story | Why now |
|-------|--------|
| **Friday Night in Nevada City** (Story 1) | Temporal story that gives the hub a "now" feeling. Pairs with the events calendar launch. |
| **48 Hours in Truckee** (Story 5) | Covers the second cultural district. Prevents the "this is only about GV-NC" objection from Truckee stakeholders. |

**Month 3:**

| Story | Why now |
|-------|--------|
| **Sound Check: Live Music This Week** (Story 8) | Recurring feature that gives locals a reason to come back weekly. Requires events data pipeline to be stable. |
| **The Gallery Walk Nobody Told You About** (Story 7) | Visual arts story for summer gallery season. Pairs with First Friday events. |

**Month 4:**

| Story | Why now |
|-------|--------|
| **Make Something: Maker Spaces** (Story 9) | Experiential tourism story. Aligns with Curious Forge/Experience Planning Committee interest. |
| **Every Stage: Theatre Guide** (Story 6) | Theatre season content. Serves the advocacy audience by profiling theatre companies. |

**Month 5:**

| Story | Why now |
|-------|--------|
| **The $66 Million Scene** (Story 3) | Advocacy/data story. Time this for a board meeting or Culture Forward committee update. |
| **Off the Grid: The Ridge** (Story 10) | Equity story showing coverage beyond GV-NC. Honors Diana's editorial voice. |

**Month 6 (stretch goals):**

| Story | Why now |
|-------|--------|
| **When the Artists Came** (Story 11) | Long-form historical piece. Requires the most research. Publishable once the hub has established credibility. |
| **Nisenan Land** (Story 12) | Must not be rushed. Only publish after genuine community engagement. Could coincide with a tribal event or cultural moment. |

---

## Section 5: The Diana Test

For each proposed story, an honest assessment: Would Diana be proud to share this, or would she see it as AI filler?

| # | Story | Diana Test | Reasoning |
|---|-------|-----------|-----------|
| 1 | Friday Night in NC | **Proud, with conditions** | She would love the specificity and walkability angle. She would reject any sentence that could describe any downtown in America. Every venue name must be correct, every detail current. If this reads like "enjoy a charming evening in a historic downtown," she tosses it. If it reads like "Golden Era's cocktail list changes weekly but the Paloma never leaves; the stage is the size of a kitchen table and the sound fills the room" — she shares it. |
| 2 | Wine Country | **Proud** | This is a MUSE adaptation. The closing line — "In a region once known for mining the earth, this new generation of vintners is learning instead to listen to it" — is already Diana-quality. The map integration adds something MUSE print cannot do. She would share this immediately. |
| 3 | $66 Million Scene | **Cautious** | Diana is an editor, not a data analyst. She would appreciate the advocacy value but would flag any section that reads like a grant application. The profiles of individual venues must carry the piece. The data is the frame; the stories are the painting. If the profiles sound like MUSE, she shares it. If they sound like an economic impact report, she does not. |
| 4 | 48 Hours GVNC | **Proud** | Direct adaptation of MUSE. She would check every venue for accuracy and current hours. She would want the voice to match the original — place-first, sensory, unhurried. This is low risk because the editorial already exists. |
| 5 | 48 Hours Truckee | **Proud** | Same as above. She would be glad Truckee is covered equally. |
| 6 | Theatre Guide | **Proud, with conditions** | Diana would insist that each theatre company gets genuinely distinct treatment — not "another wonderful local company." CATS doing Asian American theatre in a rural Sierra county IS the story. Lyric Rose doing LGBTQ+ theatre IS the story. If the piece treats them as interchangeable, she rejects it. If each profile has a specific detail that no other company could claim, she shares it. |
| 7 | Gallery Walk | **Very proud** | This is her territory. She curated these galleries. She would want the Seven Hills emergence covered (Crush/The Vault, Wonder Docent, 'Uba Seo) because that is the new development. She would reject any gallery description that does not name what the gallery actually shows. "A wonderful collection of local art" = death. "Crush pairs tattoo art with gallery exhibitions in a shared space on Argall Way" = life. |
| 8 | Live Music This Week | **Functional approval** | This is utility content, not editorial. Diana would approve of the concept but would not consider it editorial achievement. She would insist the venue mini-profiles (one sentence each) are MUSE-quality. She would not share this at a dinner party, but she would use it every Thursday. |
| 9 | Maker Spaces | **Proud** | Curious Forge is a genuine story. The piece needs to capture the physical experience — sparks, heat, the smell of sawdust — not just list what classes are offered. Diana edited "The Maker Movement" for MUSE Issue 1. She knows what this story should feel like. |
| 10 | The Ridge | **Very proud** | She wrote the original. Expanding it with map integration and Culture Forward equity framing honors both her editorial work and the strategic plan. This is the story that proves the hub is not just a tourism brochure. |
| 11 | Creative Migration | **Proud if done right, embarrassed if done wrong** | This is the highest-risk story. Get the history wrong, flatten the narrative into "isn't it neat that artists live here," and Diana would be mortified. Get it right — trace specific people, specific moments, specific migrations — and it becomes the signature piece of the entire hub. This must not be rushed. |
| 12 | Nisenan Land | **Will not share unless community-reviewed** | Diana knows this story matters. She also knows it cannot be written by outsiders about insiders. She would demand that Nisenan and Washoe representatives review and approve before publication. If they do, she shares it with pride. If this is written without that review, she kills it regardless of quality. |

### Summary scoring:

- **Diana-ready at launch (low effort):** Stories 2, 4, 5
- **Diana-ready with careful writing (medium effort):** Stories 1, 6, 7, 9, 10
- **Diana-ready with right conditions (high effort):** Stories 3, 8, 11, 12
- **Would Diana share on social media?** Stories 2, 4, 5, 7, 10 — yes, immediately. Stories 1, 6, 9 — yes, if well-written. Stories 3, 8 — useful but not share-worthy as editorial. Stories 11, 12 — only if exceptional.

### The real test:

Diana's bar is not "is this accurate?" Her bar is "does this make me feel something about a place I already know?" The Crystal Rainbow Rock Shop sentence from her MUSE article — "it's impossible to imagine a more charming, or more tiny, local business" — makes you smile because it is both precise and affectionate. Every story on this hub needs at least one sentence like that per venue. If it does not have that, it is AI filler, and she will know.

---

## Appendix: Quick-Reference Data for Story Writing

### Key economic figures (from Culture Forward):
- $66 million total economic activity (2023)
- ~1,400 FTE jobs supported
- $13 million tax revenue (local, state, federal)
- $42.30 average per-person spending at arts events
- $74.80 average for non-local attendees
- 1/3 of audiences are non-local
- Majority of non-local attendees cite arts/culture as main visit reason

### Asset counts (from cultural-assets.json):
- 1,969 total assets (494 new additions)
- 275 walks and trails
- 256 historic landmarks
- 211 artisan eat/drink/stay
- 112 artisan shops
- 109 breweries/restaurants/bars
- 83 galleries/studios/museums
- 77 arts organizations
- 68 fairs/festivals
- 63 public art installations
- 30 performance spaces
- 22 wineries/tasting rooms

### MUSE editorial sources available for adaptation:
- "48 Hours in Truckee" (Issue 1, p22)
- "48 Hours in GVNC" (Issue 1, p23-24)
- "Laid Down by the Underground" (Issue 1, p25-26) — underground art scene
- "The Maker Movement" (Issue 1, p37) — makerspaces
- "Culture of Food in Nevada County" (Issue 2, p22-23)
- "Four Seasons in GVNC/Truckee Cultural District" (Issue 2, p14-18)
- "Mural Tour of Nevada County" (Issue 2, p9) — 25 murals mapped
- "New Gold: Nevada County Wine" (Issue 3, p50-51)
- "Living Like a Local: GVNC" (Issue 3, p30)
- "Mountain Heart, Small-Town Soul" (Issue 3, p31-33) — Truckee
- "Lucky Little Towns: Music Scene" (Issue 3, p58-59)
- "On and Off the Stage: Theatre" (Issue 3, p60-61)
- "Paved with Passion: Skateparks" (Issue 3, p56-57)
- "Art of Herbalism" (Issue 3, p64)
