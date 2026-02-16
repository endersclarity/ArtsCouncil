# Phase 4: Copy & Positioning - Research

**Researched:** 2026-02-16
**Domain:** Editorial voice extraction, content copywriting, cultural positioning
**Confidence:** HIGH (primary sources are local repo OCR files, not external)

## Summary

This phase rewrites every user-facing text string on the platform so it reads as the Experience Planning Committee's editorial-quality digital tool. The MUSE magazine OCR corpus (3 issues, ~220 pages of editorial content) is the definitive voice source. The Arts Council website voice is a secondary alignment reference but does not override MUSE.

The core finding is that MUSE has a distinctive, extractable voice that differs markedly from generic tourism copy. It is place-specific (always names venues), narrative-forward (tells stories, not lists features), second-person direct ("you will find"), and balances evocative description with concrete wayfinding. The voice shifts register by context: feature articles are warm and immersive; organizational/institutional text is measured but still personal; directory/calendar sections are purely functional. This register variation is intentional and should be preserved on the platform.

**Primary recommendation:** Extract the MUSE voice rules documented below and apply them as a style guide for every copy surface. Rewrite all ~60-80 text strings across 6-8 files. Do NOT invent a new voice; derive every choice from the OCR evidence.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Voice must be derived from MUSE magazine OCR analysis — not guessed, extracted
- Researcher analyzes every MUSE issue OCR available (in repo + any we can access) to extract: sentence structure, vocabulary, how they introduce places, how they balance informational vs evocative
- Also analyze the Arts Council website voice for alignment
- Whether voice is uniform or varies by section: Claude decides after research
- The MUSE voice IS the North Star — Arts Council website is secondary reference for alignment
- Nature is supporting color only. Lead with galleries, dining, performances, studios
- Trails/rivers/forests mentioned only when they connect to cultural stops or as scenic backdrop
- Hero headline positioning: let MUSE voice analysis shape the core promise (not decided in advance)
- Geography: "Nevada County Cultural District" as the umbrella brand, individual town names (Grass Valley, Nevada City, Penn Valley) used when describing specific areas
- Terminology for places/venues: Claude decides after research (no more "cultural assets")
- Full rewrite of everything — no copy carries over as-is
- Category names (Historic Landmarks, Eat Drink & Stay, etc.): Claude decides whether to rename after MUSE analysis
- All 3 itinerary narratives get full rewrite — titles, intros, and every stop description
- Colophon/credits: match MUSE's own credit/attribution patterns (researcher extracts from MUSE issues)

### Claude's Discretion
- Voice register per section (editorial everywhere vs editorial for features / functional for utilities)
- Category name changes (keep or rename based on MUSE alignment)
- Terminology for venues/places (pick what fits the extracted voice)
- Colophon language and committee positioning (match MUSE attribution patterns)
- Platform name (currently "Explore Nevada County" — assess whether this fits or needs change)

### Deferred Ideas (OUT OF SCOPE)
- Competitor DMO site language analysis (Marfa, Asheville, Hudson Valley, etc.) — could be part of research but may expand scope. Researcher should at least scan 2-3 for contrast.
- "Are we the first site that serves both tourists and locals?" — interesting positioning question. Research should surface whether this dual-audience approach has precedents.
</user_constraints>

## Standard Stack

This phase involves no new libraries or dependencies. It is a pure content/copy phase touching existing files.

### Core Tools
| Tool | Purpose | Why Standard |
|------|---------|--------------|
| Text editor | Rewrite HTML text, JSON strings, JS string literals | All copy lives in static files |
| OCR corpus (in-repo) | Voice extraction source | 3 issues of MUSE OCR already in `docs/publications/` |

### Files Requiring Edits
| File | Copy Surfaces | Count |
|------|--------------|-------|
| `index-maplibre-hero-intent-stitch-frontend-design-pass.html` | Title, mast, hero, tabs, section headers, MUSE cards, colophon | ~25 strings |
| `events.html` | Title, mast, page title, subtitle | ~5 strings |
| `itineraries.html` | Title, mast, page title, subtitle | ~5 strings |
| `index-maplibre-config.js` | Category names, short names, demo picks taglines | ~20 strings |
| `itineraries.json` | 3 itinerary titles, subtitles, descriptions, ~21 stop narratives, ~21 tips | ~50 blocks |
| `experiences.json` | Experience/corridor titles, descriptions, stop notes, connectors | ~30 blocks |
| `chat-knowledge-pack.json` | System prompt personality/intro text | ~1 block |

**Total: ~130-140 individual text edits across 7 files.**

## Architecture Patterns

### Pattern 1: MUSE Voice Extraction (from 3-Issue OCR Corpus)

The following patterns are extracted from reading the complete OCR of MUSE Issues 1 (2024, 57pp), 2 (2025, 55pp), and 3 (2026, 112pp). All evidence below cites specific articles and page numbers.

#### Sentence Structure

**Place-first introductions.** MUSE always leads with the specific place name, then adds a characterizing detail. Never introduces with a generic category.

Evidence:
- "Walk further down Main Street and stop by Foggy Mountain Music, selling a crazy mix of instruments" (I3 p30)
- "Visit the Crystal Rainbow Rock Shop on Commercial Street — it's impossible to imagine a more charming, or more tiny, local business" (I3 p28-29)
- "Start by shopping local art at Make Local Habit on East Main Street" (I3 p30)

**Second-person direct address.** MUSE writes to "you" constantly, creating the feeling of being guided by a local friend.

Evidence:
- "you will feel time slow down" (I3 p28)
- "if you're experiencing our District like a local, you might catch one of Tess's tasting events" (I3 p30)
- "Wyld Tiger's artisanal breads...will leave an indelible memory of possibly the best sourdough you'll have ever tasted" (I3 p30)

**Em-dash parenthetical color.** Heavy use of em-dashes to insert vivid detail without breaking sentence flow.

Evidence:
- "a community that is passionate and protective, pioneering and progressive, charming and a little funky" (I3 p31)
- "the Pelton waterwheel was developed and manufactured here in 1878" — inserted mid-narrative as a factual anchor (I3 corridors)
- "the walls hold decades of stories, folk music, poetry, and art that bring locals together" (I3 p28)

**Short punchy closers.** Paragraphs and articles frequently end with a short, declarative sentence that lands with emotional weight.

Evidence:
- "We're still lucky." (I3 p59, music history)
- "In a region once known for mining the earth, this new generation of vintners is learning instead to listen to it." (I3 p51)
- "Through them, Julia Morgan's legacy endures." (I3 p43)

**Narrative arc within paragraphs.** Each paragraph tells a mini-story: setup, exploration, payoff.

Evidence:
- The wine article (I3 p50-51) opens with Gold Rush miners bringing grape vines, traces through Prohibition, and lands on today's natural winemakers
- The music history (I3 p58-59) traces bands through decades using specific names and venues
- The African Dance article (I3 p10) starts in 1980 East Palo Alto, moves through decades, arrives at present-day Miners Foundry

#### Vocabulary DNA

| MUSE Uses | Instead of (Generic Tourism) |
|-----------|----------------------------|
| "creative life" | "arts scene" |
| "culture bearers" | "artists" (when broader) |
| "cultural district" | "area", "region" |
| "sense of place" | "atmosphere" |
| "grounded in place" | "authentic" |
| "cultural infrastructure" | "arts resources" |
| "places" or venue name | "cultural assets" |
| "spaces" | "venues" (when architectural) |
| specific proper nouns always | "a local restaurant", "a gallery" |

**Words MUSE never uses:** "hidden gem," "best-kept secret," "off the beaten path," "must-see attraction," "bucket list." These are generic tourism cliches that MUSE actively avoids.

**Words MUSE frequently uses:** "discover," "explore," "experience," "creative," "community," "local," "stories," "traditions," "place," "vibrant," "diverse."

#### How MUSE Introduces Places

Three consistent patterns observed across all issues:

1. **Name + sensory/characterizing hook:** "Communal Cafe for a coffee among locals" (I3 p29). Always the name first, then what makes it distinct.

2. **Name + owner/maker quote:** "When you work this way, he says, you feel the land breathe." — Carlos Caruncho, Arquils Wines (I3 p51). Gives the place a human voice.

3. **Name + geographic wayfinding:** "up on West Main Street is The Granucci Gallery at The Center for the Arts" (I3 p30). Orients the reader physically in the town.

#### Informational vs. Evocative Balance

| Context | Register | Evidence |
|---------|----------|----------|
| Feature articles (Living Like a Local, Wine, Music) | ~70% evocative, 30% informational | Rich sensory language, narrative arcs, personal quotes |
| Director's letter / institutional | ~40% evocative, 60% informational | Personal but measured, uses "we" collectively, cites statistics |
| Calendar/directory sections | 100% informational | Dates, times, locations, no narrative |
| Corridors/heritage | ~50/50 | Historical facts interwoven with landscape description |

**Recommendation for platform:** Mirror this register variation. Editorial modules (MUSE cards, itinerary narratives, experience descriptions) use the warm evocative register. Utility modules (category labels, filter chips, event listings, search) use clean functional language. Both draw from the same vocabulary DNA.

### Pattern 2: Downtown/Culture-Forward Framing

MUSE consistently leads with cultural venues and only references nature when it connects to a cultural stop or provides scenic context.

Evidence of culture-first framing:
- "Rural is the New Cool" (I3 p28-29): Opens with "not just scenic, but an arts destination" — explicitly repositioning nature as backdrop
- The wine article (I3 p50-51): Vineyards are presented as cultural enterprises, not nature destinations
- "Living Like a Local" (I3 p30): Every single recommendation is a gallery, shop, restaurant, theater, or cultural space — zero nature stops
- "Mountain Heart, Small-Town Soul" (I3 p31-33): Starts with brand positioning, leads to galleries and coffee shops, nature mentioned only as "epic scenery" context

Evidence of nature-as-supporting-color:
- "Visitors come for our trails, wild spaces, and dreamy foothills — yet our cultural scene remains one of our most captivating surprises" (I3 p29)
- "Our community's character is wrapped up in a certain sturdiness and a willingness to go out into nature" — Mayor Zabriskie (I3 p31), but this is about character, not activity
- "Off the Wall: Art in Nature" (I3 p34-35) — even the nature-focused article is about ART in nature, not nature itself

### Pattern 3: MUSE Credit/Colophon Convention

From the front matter of all three issues:

**Publication credit line:** "Published by Nevada County Arts Council"
**Initiative description:** "MUSE is an initiative of Nevada County's two California Cultural Districts, a special designation bestowed by the California Arts Council, a state agency."
**Partner listing:** "Truckee Cultural District and Grass Valley-Nevada City Cultural District are a partnership between our municipalities, our chambers of commerce, our downtown associations, and our cultural allies."
**Collective framing:** "Together, we elevate artists and culture bearers across all disciplines, and the organizations, makers, storytellers and visionaries who shape life in our region."
**Individual credits:** Writers credited by name with their institutional role (e.g., "Diana Arbex, Grass Valley-Nevada City Cultural District Program Manager")

**Recommendation for platform colophon:** Follow this exact pattern. Name the Experience Planning Committee, credit MUSE as editorial source, list the Cultural District partnership, credit Nevada County Arts Council as publisher.

### Anti-Patterns to Avoid

- **Generic tourism language:** "Hidden gem," "best-kept secret," "off the beaten path," "must-see," "bucket list." MUSE never uses these. Neither should the platform.
- **Nature-first framing:** "Nestled in the Sierra foothills" as an opening line. MUSE occasionally uses geographic context but never leads with landscape when describing cultural venues.
- **"Cultural assets" terminology:** The data model uses this term internally, but it should never appear in user-facing text. MUSE says "places," "spaces," "venues," or the specific proper name.
- **Passive voice:** MUSE overwhelmingly uses active voice. "You will find" not "Can be found." "We elevate" not "Arts are elevated."
- **Unattributed authority:** MUSE attributes opinions and recommendations to specific named people. The platform should either use second-person guidance ("Visit the Crystal Rainbow Rock Shop") or attribute to MUSE/a named writer.
- **Category-first introductions:** "This gallery features..." MUSE always leads with the proper name, not the category.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Voice consistency | Ad-hoc rewriting by feel | The MUSE Voice Rules extracted above as a style checklist | Without rules, copy will drift toward generic tourism language |
| Itinerary narrative rewrite | Write from scratch without reference | Adapt from MUSE's own "48 Hours" and "Living Like a Local" article patterns | These articles ARE itinerary narratives — same structure, proven voice |
| Category descriptions | Invent new descriptions | Derive from how MUSE describes these venue types in editorial articles | Consistency with the magazine voice |
| Colophon | Generic boilerplate | Mirror MUSE's own credit pattern (see Pattern 3 above) | The platform IS a MUSE initiative |

## Common Pitfalls

### Pitfall 1: Voice Drift to Generic Tourism
**What goes wrong:** Copywriter starts in MUSE voice but gradually drifts toward Visit California / generic DMO language ("discover the magic," "experience the charm").
**Why it happens:** Generic tourism language is the path of least resistance. It feels natural because we've all read it thousands of times.
**How to avoid:** Use the MUSE vocabulary DNA table as a checklist. After writing each block, scan for any word in the "Instead of" column and replace with the MUSE equivalent.
**Warning signs:** Adjectives without specificity ("charming," "magical," "quaint"). Sentences that could describe any town in America.

### Pitfall 2: Nature Creep
**What goes wrong:** Nature imagery sneaks back in as the default framing. "Surrounded by towering pines and rushing rivers, Nevada County's cultural scene..."
**Why it happens:** The region IS beautiful, and it's tempting to lead with landscape.
**How to avoid:** Check every headline, intro sentence, and description: does it lead with a cultural venue/activity? If nature appears, is it supporting color (fine) or the main subject (rewrite)?
**Warning signs:** Nature appears in the first sentence of any section that isn't specifically about nature/trails.

### Pitfall 3: Inconsistent Register
**What goes wrong:** Utility labels get the warm editorial treatment ("Discover our curated collection of upcoming happenings!") or editorial sections get the flat functional treatment.
**Why it happens:** Without clear register rules, every surface gets the same treatment.
**How to avoid:** Tag each copy surface as EDITORIAL or FUNCTIONAL before writing. Editorial = warm, narrative, specific. Functional = clean, direct, minimal.
**Warning signs:** Filter chips or dropdown labels with sentences. Editorial cards with no narrative arc.

### Pitfall 4: Over-Quoting MUSE
**What goes wrong:** Platform text becomes a collage of MUSE quotes rather than original copy in the MUSE voice.
**Why it happens:** It's easier to copy than to derive.
**How to avoid:** The MUSE editorial cards already quote MUSE directly (that's appropriate). Everything else should be ORIGINAL copy written in the MUSE voice, not quoted from the magazine.
**Warning signs:** Quotation marks everywhere. Text that reads like a book report rather than an original editorial.

### Pitfall 5: Forgetting the Dual Audience
**What goes wrong:** Copy speaks only to tourists ("when you visit") or only to locals ("our favorite spots"), but not both.
**Why it happens:** Most platforms target one audience. This one serves both.
**How to avoid:** MUSE itself models this perfectly — "Living Like a Local" articles are written for visitors who want to feel like locals, but actual locals read them too. Use second-person "you" and let the reader self-identify.
**Warning signs:** "Visitors will enjoy..." or "For tourists..." — language that excludes locals.

## Code Examples

### Example 1: Hero Headline Rewrite

Current:
```html
<div class="cover-headline">Your Guide<br>to Local<br>Culture</div>
```

MUSE-voice approach (derived from how MUSE titles its issues and articles):
```html
<!-- Option A: Direct, district-forward -->
<div class="cover-headline">Nevada County<br>Cultural District</div>

<!-- Option B: Echoing MUSE's own framing -->
<div class="cover-headline">Creative Life<br>in Motion</div>

<!-- Option C: Activity-forward, second-person -->
<div class="cover-headline">Discover<br>What We Make</div>
```

The hero headline is a decision point that depends on MUSE voice analysis shaping the core promise. Options above demonstrate the range; the planner should select one or present options for Diana/Eliza feedback.

### Example 2: Category Name Assessment

Current names vs. MUSE usage patterns:

| Current | MUSE Equivalent | Recommendation | Confidence |
|---------|----------------|----------------|------------|
| Historic Landmarks | "historic landmarks," "heritage sites" | **Keep** — MUSE uses this naturally | HIGH |
| Eat, Drink & Stay | "restaurants, bars," "dining," "lodging" | **Keep** — captures the scope, MUSE-aligned | HIGH |
| Arts Organizations | "arts organizations," "cultural groups" | **Keep** — MUSE uses this exact phrase | HIGH |
| Cultural Resources | No clear MUSE equivalent — too vague | **Rename** to "Libraries & Learning" or "Community Resources" | MEDIUM |
| Fairs & Festivals | "festivals," "events" | **Keep** — MUSE uses "festivals" frequently | HIGH |
| Galleries & Museums | "galleries," "studios," "museums" | **Keep** — MUSE uses all three | HIGH |
| Walks & Trails | "trails," "nature," "wild spaces" | **Consider rename** to "Trails & Landscapes" — but low priority since nature is supporting color | LOW |
| Public Art | "murals," "public art," "art on walls" | **Keep** — MUSE uses "public art" naturally | HIGH |
| Performance Spaces | "theaters," "venues," "performance" | **Keep** — MUSE uses "performance" naturally | HIGH |
| Preservation & Culture | "cultural heritage," "preservation" | **Keep** — MUSE uses these terms | MEDIUM |

**Net recommendation:** Rename "Cultural Resources" (too vague). Keep everything else. "Walks & Trails" is fine to keep since trails do appear in MUSE as supporting content.

### Example 3: Venue Terminology

The data model calls them "assets" internally (`data.json` uses single-letter keys). The config calls them "assets" in `mapActiveText`. User-facing text should use:

| Context | Use | Not |
|---------|-----|-----|
| Map panel | "places" — "687 places" | "assets", "locations", "listings" |
| Filter banner | "Showing 42 galleries" (category name) | "Showing 42 assets" |
| Detail panel | The venue's proper name | "This asset" |
| Search placeholder | "Search places" | "Search assets" |
| General reference | "places," "venues," "spaces" | "cultural assets," "points of interest" |

### Example 4: Itinerary Narrative Rewrite Pattern

Current (generic/informational):
```json
"narrative": "Settle into a farm-to-table lunch at one of Nevada City's most beloved spots. The menu rotates with the seasons, sourcing from local farms, and the walls double as gallery space for regional artists."
```

MUSE-voice rewrite (place-first, sensory, second-person):
```json
"narrative": "California Organics pairs a rotating farm-to-table menu with gallery walls that change as often as the seasons. Grab the back patio in warm weather—you'll find it hard to leave."
```

Key differences: Lead with the name. Shorter. More direct. Sensory hook. Second-person address. Active suggestion rather than passive description.

### Example 5: Colophon Rewrite

Current:
```html
<article class="note">
  <h3>Places</h3>
  <p>Over 680 places to discover across Nevada County, sourced from the
    Nevada County Arts Council. Last updated December 2024.</p>
</article>
```

MUSE-voice rewrite (mirroring MUSE's own credit pattern):
```html
<article class="note">
  <h3>Places</h3>
  <p>687 places across Nevada County's two California Cultural Districts,
    curated by the Experience Planning Committee and Nevada County Arts Council.</p>
</article>
```

Key differences: Specific count. References Cultural Districts (the official designation MUSE always uses). Credits the Experience Planning Committee. Removes passive "sourced from."

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|-------------|------------------|--------------|--------|
| Generic DMO tourism copy | Editorial/magazine voice derived from MUSE | This phase | Platform reads as a MUSE digital extension, not a generic map tool |
| "Cultural assets" terminology | "Places" / proper names | This phase | Warmer, more accessible language |
| Nature-first framing | Downtown/culture-first framing | This phase | Positions the platform per the Committee's vision |
| No colophon / generic footer | MUSE-pattern colophon crediting Experience Planning Committee | This phase | Establishes the platform's institutional identity |

## Discretion Recommendations

### Voice Register per Section

**Recommendation: Two registers, one vocabulary.**

| Register | Where Used | Characteristics |
|----------|-----------|----------------|
| **Editorial** | Hero headline, MUSE cards, itinerary narratives, experience descriptions, colophon | Warm, narrative, second-person, specific proper nouns, sensory hooks, short punchy closers |
| **Functional** | Category labels, tab names, filter chips, search placeholders, event listings, map panel labels | Clean, direct, minimal, no narrative, noun-phrase based |

Both registers draw from the same MUSE vocabulary DNA (never "cultural assets," always "places"; never generic tourism cliches). The difference is sentence structure and emotional temperature.

**Confidence: HIGH** — MUSE itself uses exactly this two-register approach. Feature articles vs. calendar/directory sections.

### Category Name Changes

**Recommendation: Rename one category, keep nine.**

Only "Cultural Resources" needs renaming — it is too vague and has no MUSE equivalent. Suggested rename: "Libraries & Archives" (if that better fits the actual venues in this category) or "Community & Learning" (if the category is broader). The planner should check what venues actually fall in this category before finalizing.

All other category names align with MUSE's natural vocabulary and should be kept.

**Confidence: HIGH** for keeping 9 of 10. MEDIUM for the specific rename — depends on what's actually in the "Cultural Resources" category.

### Terminology for Venues/Places

**Recommendation: "Places" as the default noun. Never "cultural assets" in user-facing text.**

MUSE uses "places," "spaces," "venues," and specific proper names. It never uses "assets," "attractions," "points of interest," or "listings." The platform's data model can continue to use "assets" internally (in code, variable names, JSON keys), but every user-visible string should say "places."

**Confidence: HIGH** — clear evidence from all three MUSE issues.

### Colophon Language

**Recommendation: Mirror MUSE's credit pattern exactly.**

Structure:
1. What it is: "A digital publication of the Grass Valley-Nevada City Cultural District"
2. Who built it: "Created by the Experience Planning Committee"
3. Editorial source: "Editorial content adapted from MUSE, published by Nevada County Arts Council"
4. Partnership: "Nevada County's California Cultural Districts are a partnership between [municipalities, chambers, downtown associations, cultural allies]"
5. Technical credit: "Built with MapLibre, Turf.js, GSAP. Basemap by MapTiler."

**Confidence: HIGH** — directly mirrors MUSE's own front matter pattern across all three issues.

### Platform Name

**Recommendation: Keep "Explore Nevada County" for now, but flag as a decision for Diana/Eliza per COPY-06.**

Arguments for keeping:
- Clear, functional, immediately understandable
- SEO-friendly (contains the place name)
- Already established in the current deployment

Arguments for changing:
- Generic — could describe any county's website
- Doesn't convey the editorial/cultural district positioning
- MUSE itself chose an evocative single-word name

Possible alternatives if the Committee wants to change:
- "Nevada County Cultural District" (institutional, clear, mirrors MUSE's own framing)
- "MUSE Explore" or "MUSE Digital" (ties to the magazine brand)
- Something original — but this should come from the Committee, not from us

**Confidence: MEDIUM** — this is explicitly deferred to Diana/Eliza input per COPY-06. Research should surface options but not decide.

## Dual-Audience Research Note

The user asked whether platforms serving both tourists and locals have precedents. Brief findings from the competitive DMO analysis already in the repo (`docs/analysis/competitive-dmo-analysis.md`):

- **Most DMOs target visitors only.** Visit Truckee Tahoe, Visit Santa Fe, Visit Bend — all visitor-focused.
- **MUSE itself is the precedent.** MUSE explicitly serves both audiences: "Living Like a Local" articles are for visitors who want to feel local AND for actual locals discovering their own region. The Director's Letter (I3 p4-5) calls it "a tool for discovery, collaboration, and visibility."
- **The platform is pioneering.** The competitive analysis concludes: "No other cultural district of this scale has built anything remotely this capable." The dual-audience approach is part of what makes it unique.

**Implication for copy:** Write in second-person "you" and let readers self-identify. Never say "visitors" or "tourists" — say "you." This is exactly what MUSE does.

## Copy Surface Inventory

Complete list of every text string that needs rewriting, organized by file:

### Hub Page (index-maplibre-hero-intent-stitch-frontend-design-pass.html)

| ID | Current Text | Type | Register |
|----|-------------|------|----------|
| H1 | `<title>Explore Nevada County — Frontend Design Pass</title>` | Meta | Functional |
| H2 | `Explore Nevada County` (mast h1, 3 pages) | Brand | Functional |
| H3 | `Culture · Discovery · 2026` (edition tagline) | Brand | Editorial |
| H4 | `Nevada County Cultural District` (cover tag) | Brand | Functional |
| H5 | `Your Guide to Local Culture` (cover headline) | Editorial | Editorial |
| H6 | `start exploring` (toc kicker) | Label | Functional |
| H7 | `Discover by Story` (toc title) | Label | Editorial |
| H8 | Tab labels: Categories, Feature Picks, Upcoming Events, Curated Routes | Labels | Functional |
| H9 | `Browse categories` (pane label) | Label | Functional |
| H10 | `Interactive · Updated weekly` (toc note) | Label | Functional |
| H11 | `Cultural Asset Map` (map panel title) | Label | Functional |
| H12 | `687 places` (map pill) | Label | Functional |
| H13 | `assets` (map active text default) | Label | Functional |
| H14 | `Featured Narratives` (editorial section header) | Label | Editorial |
| H15 | `from MUSE '26 | Issue 03` (editorial eyebrow) | Label | Functional |
| H16 | `Upcoming Events` (events section header) | Label | Functional |
| H17 | `Now and next` (events title) | Label | Functional |
| H18 | `Guided Routes & Experiences` (map addon header) | Label | Editorial |
| H19 | `Cultural Corridors from MUSE '26` (corridor addon) | Label | Functional |
| H20 | `Curated Experiences` (experience addon) | Label | Functional |
| H21 | `MUSE stories, mapped.` (muse section title) | Editorial | Editorial |
| H22 | MUSE section subtitle | Editorial | Editorial |
| H23 | 4 MUSE card titles, quotes, author lines | Editorial | Editorial |
| H24 | `Directory` tag + `Explore by Category` heading | Label | Functional |
| H25 | Colophon: 3 notes (Places, Editorial, Built with) | Editorial | Editorial |
| H26 | Footer: `© 2026 Nevada County Arts Council` | Legal | Functional |

### Events Page (events.html)
| ID | Current Text | Register |
|----|-------------|----------|
| E1 | `<title>Events Calendar — Explore Nevada County</title>` | Functional |
| E2 | `Events Calendar` (page title) | Functional |
| E3 | `X events from 5 sources across Nevada County` (subtitle) | Functional |

### Itineraries Page (itineraries.html)
| ID | Current Text | Register |
|----|-------------|----------|
| I1 | `<title>Trip Itineraries — Explore Nevada County</title>` | Functional |
| I2 | `Trip Itineraries` (page title) | Functional |
| I3 | `Curated multi-day plans for exploring Nevada County's cultural district` (subtitle) | Editorial |

### Config JS (index-maplibre-config.js)
| ID | Current Text | Register |
|----|-------------|----------|
| C1 | 10 category names in CATS object | Functional |
| C2 | 10 category short names | Functional |
| C3 | 8 DEMO_FEATURED_PICKS taglines | Editorial |

### Itineraries JSON (itineraries.json)
| ID | Current Text | Register |
|----|-------------|----------|
| J1 | 3 itinerary titles | Editorial |
| J2 | 3 itinerary subtitles | Editorial |
| J3 | 3 itinerary descriptions | Editorial |
| J4 | ~21 stop narratives | Editorial |
| J5 | ~21 stop tips | Functional |

### Experiences JSON (experiences.json)
| ID | Current Text | Register |
|----|-------------|----------|
| X1 | Experience/corridor titles | Editorial |
| X2 | Experience/corridor subtitles | Editorial |
| X3 | Experience/corridor descriptions | Editorial |
| X4 | Stop notes | Editorial |
| X5 | Stop connectors | Editorial |

### Chat Knowledge Pack (chat-knowledge-pack.json)
| ID | Current Text | Register |
|----|-------------|----------|
| K1 | System prompt intro / personality description | Editorial |

## Open Questions

1. **What venues are in the "Cultural Resources" category?**
   - What we know: The category exists in CATS config and data.json uses it
   - What's unclear: The specific venues — are they libraries, schools, media outlets, or a mix?
   - Recommendation: Planner should check data.json during implementation to pick the right rename

2. **Platform name — Diana/Eliza decision**
   - What we know: Currently "Explore Nevada County." COPY-06 explicitly requires Diana/Eliza input.
   - What's unclear: Whether they want to change it and what to
   - Recommendation: Present the current name alongside 2-3 alternatives with rationale. Do not rename without their input.

3. **Chat concierge personality alignment**
   - What we know: The AI concierge has a system prompt with personality. It should match the MUSE voice.
   - What's unclear: How much of the chat prompt is personality vs. functional instructions
   - Recommendation: Planner should review the full chat prompt before scoping the rewrite

## Sources

### Primary (HIGH confidence)
- `docs/publications/muse-issue-03-2026/ocr/` — 40+ OCR files covering complete Issue 3 (112 pages)
- `docs/publications/muse-issue-02-2025/muse-issue-02-2025-ocr.txt` — Complete Issue 2 OCR
- `docs/publications/muse-issue-01-2024/muse-issue-01-2024-ocr.txt` — Complete Issue 1 OCR
- `docs/analysis/muse-content-catalog.md` — Comprehensive venue/article index across all 3 issues
- `docs/analysis/culture-forward-extraction.md` — Culture Forward plan data with Arts Council voice samples
- `docs/analysis/competitive-dmo-analysis.md` — Competitive landscape assessment
- All current site files in `website/cultural-map-redesign-stitch-lab/`

### Secondary (MEDIUM confidence)
- `website/cultural-map-redesign/mockups/travel-mag-style-analysis.md` — Visual/layout analysis (not voice-specific but relevant for editorial positioning)

## Metadata

**Confidence breakdown:**
- MUSE voice extraction: HIGH — based on direct OCR reading of 3 complete issues (~220 pages)
- Copy surface inventory: HIGH — based on direct reading of all 7 target files
- Category recommendations: HIGH for 9/10, MEDIUM for "Cultural Resources" rename
- Colophon pattern: HIGH — directly mirrors MUSE front matter
- Platform name: MEDIUM — explicitly deferred to Committee decision

**Research date:** 2026-02-16
**Valid until:** Indefinite (MUSE voice is stable; new issues would extend but not invalidate)
