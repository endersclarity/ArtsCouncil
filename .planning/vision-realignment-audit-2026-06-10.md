# Vision Realignment Audit — 2026-06-10 (v2)

**Revision rule (owner, 2026-06-10):** Only the April 24 docs count as requirements. Everything
before April 24 was direction for a build that died in the Experience Planning Committee politics;
pre-April statements are lineage ("what it morphed into"), never standing wants. V1 of this audit
treated some February/March quotes as live asks — those findings are corrected below and the
originals struck where they designed toward dead ideas.

**Verdict up front:** The build has NOT drifted into a tourism portal, and measured against the
April 24 brief alone it delivers 4 of the brief's 6 parts cleanly (usable map, simple filters,
event + place integration, light curation via the 4 authored paths). The two genuine gaps are the
**discovery feed** (a visible card list so users aren't hunting pins — the panel exists but doesn't
lead) and **iteration-first scope** — the brief exists to "provoke useful feedback," and the Council
has not seen the build since April. The drift is not in the product; it is in the silence.

Method note: quotes below were verified verbatim against the CLEAN transcripts (timestamps in
brackets are seconds into the recording). The April 24 "meetings" exist only as ChatGPT summaries —
there is no raw transcript behind them. Treat every April 24 claim as derived, not primary.

---

## Q1. Inventory of explicit asks

**How to read this table under the April-24-only rule:** the "Verbatim anchor" column is lineage,
not requirements. Only the right-hand column (the April 24 form of each ask) is binding. Where an
ask has no April 24 successor, it is dead — marked ☠ below.

| Ask | Who / when | Verbatim anchor | Most recent statement |
|---|---|---|---|
| Central hub for events info | Eliza, Mar 13 (reading the Regional Marketing Plan) | "the need for a central hub for people to get their information… where people can post their events and learn about different shows" | Apr 24 brief reframes it as "discovery layer," deliberately retiring "hub" language |
| Calendar at the center (Trumba) | Eliza, Mar 13 | "what you heard around the table was all about the Trumba calendar… this is like the next generation of that" | Apr 24: morphed into "event + place integration" — equal billing with places, NOT "calendar is the centerpiece" |
| Curated Eat/Drink/Stay, no mass-market | Eliza, Mar 13 [3976.1] | "we're not going to share Jack in the box, or Best Western, unless they've opened up a new gallery" | Apr 24 form: "manual curation encouraged to maintain quality" + "curated, branded content unique to the arts community" — the verbatim rule is lineage, the curation value survived |
| MUSE business directory as a map layer | Eliza, Mar 13 | "Muse has a business directory which is phenomenal. And we ultimately have always wanted that to become… an additional layer within the Cultural asset map" | Apr 24 form: generic "business directory" integration (Session 3) — the MUSE-specific framing did not carry forward |
| Brand parallel to MUSE | Eliza, Mar 13; Diana, Feb 18 | Eliza: "We could choose to brand it parallel to Muse. I love that." Diana (Feb 18): "I think it really should be the inspiration for the site in general" | ☠ as stated. Apr 24 form: "visual elements (images, branding) critical to differentiate the site" + "branded maps, custom markers" — branding survives, parallel-to-MUSE identity does not |
| A curated "day of" experience | Diana (Eliza voicing it), Feb 18 [1430.1] | "you go and learn something at the Curious Forge, and then you go and have lunch, and then you go and do this or that… that would be cool" | Apr 24: "3–5 human-built groupings" |
| Curated, validated content — not AI itineraries | Apr 24 GPT summary (Session 3) | "consensus leaned toward curated experiences using validated local data rather than fully AI-driven trip planning" | Most recent direction statement |
| AI for data freshness only | Eliza, Feb 18 [186.4] | "This isn't trolling the web. It's trolling validated data… No hallucinations, only updated data" | Standing; Eliza, Mar 13 [4077.5]: "we have quite big consciences around AI" |
| Usable, modern map UX | Apr 24 (Sessions 1–2) | "a usable map — not GIS, not a database viewer… clustered, intentional markers" (brief) | Most recent |
| Discovery feed/panel + simple filters | Apr 24 brief | "Events, Live Music, Arts, Food/Drink, Places, possibly Lodging later" | Most recent |
| Do one thing well | Eliza, Mar 13 [3886.2] | "let's blow people away, because we've done something very well with what we have, our calendar, and our cultural asset map, and our business directory from [MUSE]" | ☠ as a scope statement (it scoped the dead build). Apr 24 successor: "intentionally narrow… react to the experience before we define any larger system" |
| Iterate with feedback, don't finalize | Apr 24 brief | "react to the experience before we define any larger system" | Most recent |

**Important attribution flags (transcript vs. derived doc):**
- The **AI itinerary builder was Kaelen's initiative, not their ask.** Eliza, Feb 18: "we are
  experimenting with AI as a tool to build itineraries" — framing a demo Kaelen brought. Kaelen
  himself, Feb 18 [1386.4]: "the ones that it came up with, it's AI-slopped, I think." The Apr 24
  consensus against AI itineraries confirms the build was right to drop it.
- The **March brief (.planning/hub/brief.md) is the most over-derived document.** Its homepage
  structure, "Intent Hero," newsletter capture, Gallery Frame spec, and Trumba-only MVP were
  Kaelen's synthesis for a Monday review — there is no transcript line where Eliza or Diana asked
  for that page architecture. The Apr 24 brief quietly supersedes it (single-page map, no hub
  homepage), and the build follows Apr 24. Correct call, but worth knowing the March brief never
  got their sign-off in any transcript I can find.
- **Scope was never formally closed.** Eliza, Mar 13 [4022.7]: "it is just a question of what kind
  of scope do we really want, and that's what we'll work on next week." The Apr 24 docs are the
  closest thing to that answer, and they are ChatGPT artifacts. Nothing newer exists. That is the
  real risk: the last primary-source direction is ~3 months old.

## Q2. Exceeds vs. falls short

**Exceeds (built, nobody asked):**
- The entire data-provenance regime: coordinate audits against Census/parcels, "in their own words"
  descriptions, photo self-hosting, link-rot passes, audit-everything.py. Invisible to Eliza and
  Diana as features — though it directly serves Eliza's one stated AI principle (validated data,
  no staleness; she cited SF Gate recommending a venue "closed for three years," Feb 6). Defensible,
  but it consumed months they never weighed in on.
- MUSE **story lens** (33 articles mapped with exact citations). They asked for the MUSE *business
  directory* as a layer and MUSE as brand inspiration; nobody asked for article-to-place mapping.
  It is a plausible extension of "brand it parallel to Muse," but it is an inference, not an ask.
- "Surprise me nearby," mood-based browse, time lens. All consistent with "discovery-first," none
  individually requested. Low-risk surplus.
- 1,351 places. The Apr 24 brief's data model implies a curated set; the Council's own framing was
  685 assets + MUSE directory. Volume itself was never the ask — curation was.

**Falls short (in the April 24 docs, thin or absent in the build):**
1. **The discovery feed.** Brief part 2: "a visible list/card layer for events and places so users
   aren't forced to hunt through pins." The panel exists, but the feed doesn't lead the experience.
   Note (v2 correction): the brief gives events and places *equal billing* — "events as the
   centerpiece" was a v1 finding built on the dead March direction and is withdrawn.
2. **The feedback loop.** Apr 24 asked for weekly meetings or async voice-memo feedback and framed
   the entire draft as existing "to provoke useful feedback." No Council contact since April. This
   is the largest gap, bigger than any feature.
3. **Distinct branding.** Apr 24 (Session 1): "Visual elements (images, branding) critical to
   differentiate the site"; (Session 3): "branded maps, custom markers." The build's DM Sans/Inter
   shell is clean but generic — the differentiation ask is unmet. (The parallel-to-MUSE identity
   from March is dead; plain "differentiate the site" is what survives.)
4. **Market research / user input.** Apr 24 (Session 3) suggested market research on visitor and
   local needs. Nothing in the record shows it happened.

## Q3. Politics — what this must NOT become, and is it drifting?

What it must not become, in their words: Eliza, Mar 13 [1153.2–1171.2]: "So, this is for the arts.
It's for arts and culture. And of course, there's crossover with business. But it is for arts and
culture. So I don't want us to get distracted. By politics." Plus the Apr 24 don'ts: not the Arts
Hub (ownership fight), not an AI itinerary builder, not "integrate everything."

**Audit of the build:** mostly clean. No lodging booking, no VRBO embeds, no "plan your trip"
language, no county content. Category mix is culture-dominant (Walks & Trails 270, Historic 248,
Galleries 67, Public Art 62, Performing Arts 54…).

Two watch items:
- **Eat, Drink & Stay is the third-largest category: 242 places, 223 public markers, ~40 of them
  lodging (inns, RV resorts, campgrounds).** (v2 correction:) The April 24 brief says filters for
  "Events, Live Music, Arts, Food/Drink, Places, **possibly Lodging later**" — so 40 live lodging
  markers are ahead of the brief's own schedule, shipped without the "later" decision being made.
  Eliza's March blessing of curated lodging is dead-build lineage and can't be leaned on. Either
  get the lodging set blessed in the next session or pull it behind a flag until they ask.
- **Walks & Trails at 270 is the single biggest category.** Trails are the most tourism-generic,
  least arts-specific content on the map. No one asked for trail density; if Go Nevada County wants
  a fight, "biggest category is hiking" is the easiest thing to point at.

## Q4. MUSE — is the current read right? (v2: rewritten under the April-24-only rule)

The uncomfortable truth: **MUSE barely appears in the April 24 docs.** The brief never names it.
The session summaries ask only for a generic "business directory" integrated with the calendar and
map (Session 3) and "curated, branded content unique to the arts community" (Session 1). The
strategic-interpretation section explicitly says to leave "room for future editorial/event layers
without promising them now."

So under the owner's rule:
- The **MUSE story lens** (33 articles → mapped places) is an unrequested invention. Possibly a
  delightful one, but it should be presented to the Council as a proposal, not as a delivered ask.
- The **business-directory read** survives, but generically — the MUSE-specific framing ("MUSE
  Picks" as a named layer, parallel-to-MUSE branding) is pre-April lineage, dead until they re-ask.
- The right move is to let *them* re-attach MUSE to the product in the next feedback session, not
  to build deeper on a March quote.

## Q5. Three most valuable in-scope next moves

1. **Show it to Eliza and Diana.** The Apr 24 contract was "react to the experience before we
   define any larger system," with weekly or voice-memo feedback. Every week without their reaction
   compounds drift risk; no feature matters more than restarting the loop. Bring the Q1 table.
2. **Finish the discovery feed.** Brief part 2, verbatim: a "visible list/card layer for events and
   places so users aren't forced to hunt through pins." Equal billing for events and places — not
   events-first (that was the dead March direction).
3. **A curation pass with Diana, framed as Apr 24's "manual curation… to maintain quality."** One
   working session: she blesses or cuts borderline Eat/Drink & Stay venues and the lodging set
   (Apr 24 said "possibly Lodging later" — 40 lodging places are live now, ahead of that schedule).
   Whether MUSE Picks becomes a named layer is *their* call to make in that session, not a
   pre-built assumption.

---

## Conflicts between derived docs and transcripts (flagged per ground rules)

- **March brief vs. Apr 24 brief:** March prescribes a multi-page hub site (homepage, Events page,
  Plan a Visit, Stories, newsletter) with Trumba-only events; Apr 24 prescribes a single-page
  discovery map. They conflict; the build follows Apr 24. Correct, but the March brief's "Success
  Criteria" were never re-validated against the new shape.
- **March brief says "Lodging / VRBO integration — deferred, not arts-specific."** The transcript
  is softer: Eliza endorsed curated lodging on the cultural map. The brief over-hardened her
  position. The build's ~40 curated-ish lodging places are closer to the transcript than to the
  brief — fine, pending the curation pass above.
- **Apr 24 GPT summary, Session 1: "replacing current cultural asset map with dynamic version" on
  "their own website" / "arts hub page."** This re-imports hub/Squarespace language the synthesis
  brief explicitly retires the same day. No raw transcript exists to adjudicate. Treat the
  synthesis brief as controlling and the session summaries as colour.
- **PROJECT.md / STATE.md core value** ("Drive people to downtowns, local businesses, performance
  venues…") is an economic-development framing no one in any transcript used. Their framing was
  arts-and-culture discovery. Harmless internally, but don't say it to the Council — it's
  Go-Nevada-County language.
- **Attribution drift in earlier planning:** the AI concierge, trip builder, dream board, and
  analytics phases (Phases 5–8 in STATE.md) all trace to developer initiative; transcripts show
  Eliza's AI appetite limited to data freshness plus open skepticism ("quite big consciences around
  AI"). The V1 Discovery Map correctly dropped them — keep them dropped.
