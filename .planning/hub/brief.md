# Arts Hub — Project Brief

**Date:** 2026-03-14
**Author:** Kaelen Jennings
**Client:** Nevada County Arts Council (Eliza, director; Diana Arbex, program manager)
**Status:** Draft for Monday review

---

## What This Is

The digital implementation of Culture Forward Goal 2: "Develop a Creative Network Exchange digital hub to unify arts resources and showcase the creative sector's community impact."

A centralized arts & culture platform for western Nevada County. Not a general tourism site. Not a chamber of commerce directory. An arts-and-culture-only experience platform that answers: **"What's worth doing here, and where is it?"**

---

## Why It Exists

- **26% of survey respondents** cite "lack of information about events" as their #1 barrier to cultural participation (Culture Forward, p.11)
- **74.8% of non-local visitors** already cite arts/culture as their primary reason for visiting — they're coming, they just can't find what's on
- **$66 million** in economic activity from arts/culture, but communication is fragmented across chamber sites, Trumba, Instagram, print magazines, and word of mouth
- **No centralized digital hub exists** for western Nevada County arts. Visit Truckee Tahoe covers the east side. The Gold Country side has nothing comparable.

Culture Forward calls this out 13 times. It's Phase 1 of the strategic plan (2026-2027).

---

## Who It's For

### Primary: Arts & Culture Enthusiasts
- **Out-of-town visitors** planning or currently on a trip. Want to discover what's happening and where to go.
- **Curious locals** wondering what's on this weekend. Want quick answers without checking 6 different websites.

### Secondary (future phases):
- **Artists, Culture Bearers, Organizations** — want exposure, event listing, networking
- **Funders & Partners** — want impact data, engagement metrics
- **Underserved populations** — tribal communities, Latino/a/x, youth, immigrant communities (bilingual platform is a Culture Forward requirement, deferred past MVP)

---

## What It Does (MVP)

### Must-Have: Two core features

**1. Events — "What's Happening"**
- Trumba calendar data displayed as branded event cards (Gallery Frame treatment)
- Filterable by: Tonight / This Weekend / This Month
- Category filtering (performing arts, visual arts, community, festivals)
- Each card: image, title, date/time, venue, category tag, "Details" link (links to source)
- Source: Arts Council Trumba calendar only (no external scraping for MVP)

**2. Explore — "What's Here"**
- Interactive cultural asset map (MapLibre GL JS, 685+ assets)
- Muse business directory overlay (curated artisanal/boutique places only — "no Jack in the Box")
- Category filters: galleries, venues, eat/drink, stay, public art, historic
- Click a pin → detail panel with name, description, hours, link
- Source: Diana's updated cultural asset spreadsheet + Muse business directory data

### Placeholder pages (show the vision, no functionality yet):

**3. Plan a Visit** — "Coming soon" page with concept teaser. Will eventually hold curated 1-day, 2-day, weekend itineraries by theme.

**4. Stories** — "Coming soon" page with concept teaser. Will eventually hold Muse editorial content, artist spotlights, cultural identity narratives.

---

## What It Does NOT Do (Deferred)

| Feature | Why deferred |
|---------|-------------|
| Ticket purchasing | Requires venue partnerships, conversations haven't happened |
| Lodging / VRBO integration | Scope creep, not arts-specific |
| External calendar scraping (KVMR, Stardust, etc.) | Data ownership concerns, needs permission conversations |
| Event submission by public | Requires moderation capacity they don't have |
| AI chatbot / concierge | Cool but not MVP |
| Artist directory / networking | Culture Forward Goal 2 feature, but post-MVP |
| Bilingual (English/Spanish) | Culture Forward requirement, but not MVP |
| Analytics dashboard for committee | Post-launch feature |
| Arts Passport / gamification | Goal 6, long-term |
| Kiosk mode | Goal 3 "Arts Move Mountains" campaign, long-term |

---

## Homepage Structure

| # | Section | Purpose | Content |
|---|---------|---------|---------|
| 1 | **Nav** | Navigation + brand | NCAC typemark, links: Explore, Events, Plan a Visit, Stories, About |
| 2 | **Intent Hero** | Route the user | "What are you looking for?" — 4 cards: What's Happening, What's Here, Plan a Visit (coming soon), Stories (coming soon) |
| 3 | **Happening Now** | Solve the #1 problem | Tonight / This Weekend / This Month chips. Featured event cards from Trumba. Gallery Frame treatment per brand guide. |
| 4 | **Explore** | Showcase the map + directory | Map preview or teaser image. "Explore the cultural landscape" CTA linking to full map page. |
| 5 | **Newsletter** | Capture engagement | "Get weekly arts & culture picks." Simple email signup. |
| 6 | **Footer** | Utility + partner access | Contact, social links, "List Your Event" for venues/partners, NCAC typemark |

---

## Site Map

```
Home
├── Events (full page — Trumba data, filterable)
├── Explore (full page — MapLibre map + business directory)
├── Plan a Visit (placeholder)
├── Stories (placeholder)
└── About (lightweight — who is NCAC, link to Culture Forward)
```

---

## Design Source of Truth

`.planning/hub/design/brand-mockup-final.html`

Key brand elements:
- **Color:** `#FF2400` (scarlet red) accent, `#3F3F3F` (charcoal) text, white background
- **Typography:** Polymath is the official brand font (geometric sans-serif, bold). The page 24 mockup uses an unidentified serif italic for the hero headline — we're using Playfair Display as a stand-in until Kevin Bird confirms. Nunito is our proposed Google Fonts fallback for Polymath — not yet approved by Kevin Bird.
- **Gallery Frame:** 3px solid `#FF2400` border, sharp corners (never rounded on frame), program label bar inside. This is the signature brand device.
- **Voice:** Confident, direct, community-oriented, action-driven. "Art moves mountains."
- **Aesthetic:** Swiss modernist meets warm gallery. Grid-based, type-forward, generous white space.

Full design spec: `plans/03-replication-prompt.md`

---

## Tech Stack

| Layer | Choice | Reasoning |
|-------|--------|-----------|
| Markup | Vanilla HTML | Simple, no build step, matches their Squarespace comfort level |
| Styling | Vanilla CSS | Design system via custom properties, no framework needed |
| Interactivity | Vanilla JS | Minimal JS for filters, map, event loading |
| Map | MapLibre GL JS | Already proven in stitch-lab, free, no API key required |
| Events data | Trumba RSS/JSON | Their existing calendar system |
| Asset data | Static JSON | Exported from Diana's spreadsheet |
| Hosting | Vercel | Free tier, already used for stitch-lab, zero config |
| Fonts | Google Fonts | Playfair Display + Nunito (free, proposed — pending Kevin Bird approval on Polymath web licensing and hero serif choice) |

No React. No build step. No package.json. Just files on Vercel.

---

## Data Sources

| Source | Format | Records | Owner | Location |
|--------|--------|---------|-------|----------|
| Cultural Assets (all categories) | JSON (converted from .numbers) | 1,969 assets (494 new) | Diana / NCAC | `website/arts-hub/data/cultural-assets.json` |
| — Historic Landmarks | subset | 256 | | |
| — MUSE Business Directory | subset | 491 | | |
| — Artisan Eat/Drink/Stay | subset | 320 | | |
| — Galleries/Studios/Museums | subset | 83 | | |
| — Performance Spaces | subset | 30 | | |
| — Arts Organizations | subset | 87 | | |
| — Public Art | subset | 63 | | |
| — Fairs & Festivals | subset | 68 | | |
| — + 6 more categories | subset | 571 | | |
| Trumba Calendar | RSS / iCal | Live feed | NCAC | 30-min cache |
| Brand Assets | PDF | — | Kevin Bird | `docs/NCAC_brand-compressed.pdf` |
| Original GeoJSON (reference) | GeoJSON | 685 | NCAC / GIS | `data/cultural-asset-map/` |

**Note:** Diana's updated spreadsheet nearly triples the original 685-asset GeoJSON. Some newer records are missing lat/lng coordinates and will need geocoding.

---

## What We're Building From

This is a **new build**, not a retrofit of the existing stitch-lab deployment. We can cherry-pick proven patterns:

| From stitch-lab | Reuse? |
|----------------|--------|
| MapLibre GL JS integration | Yes — map rendering, marker layers, detail panels |
| GeoJSON data loading | Yes — asset data pipeline |
| Event card rendering | Partially — need to apply Gallery Frame brand treatment |
| CSS layout patterns | No — fresh design system from brand guide |
| Hero/intent routing | Partially — concept proven, needs redesign |
| AI chatbot | No — deferred |
| Trip builder | No — deferred |

---

## Success Criteria

**For Monday's review with Diana/Eliza:**
- [ ] This brief exists and communicates the scope clearly
- [ ] They can see what's in vs. what's out
- [ ] The design source of truth shows the visual direction
- [ ] We have a shared understanding of the MVP

**For MVP launch:**
- [ ] A visitor can find what events are happening this week in Nevada County arts
- [ ] A visitor can explore the cultural asset map and find venues, galleries, restaurants
- [ ] The site looks and feels like the NCAC brand (Gallery Frame, scarlet red, Polymath/Nunito, white space)
- [ ] The site works on mobile
- [ ] It's live on a URL they can share

**For Culture Forward alignment (post-MVP measurement):**
- Reduce "lack of information about events" as participation barrier (currently 26%)
- Increase website traffic to the hub
- Become the primary source for arts/culture event discovery in western Nevada County

---

## Relationship & Logistics

- **Compensation:** $500 stipend, independent contractor
- **Agreement:** MOU at [Google Docs link](https://docs.google.com/document/d/1bHr1uItklEYhXTGm8EWBg64KdJlh3j90/edit)
- **Brand alignment:** Kevin Bird (creative director) doing full NCAC brand refresh; hub must align
- **Hosting decision:** TBD — could live on Vercel standalone or integrate into their Squarespace site later
- **Feedback loop:** Structured brainstorming → rough alpha → in-person session → async text iteration

---

## References

| Document | Location |
|----------|----------|
| Culture Forward Strategic Plan | `docs/culture-forward-strategic-plan.pdf` |
| Culture Forward Extraction | `.planning/hub/context/culture-forward-extraction.md` |
| Brand Guide | `docs/NCAC_brand-compressed.pdf` |
| Brand Guide Analysis | `.planning/hub/context/brand-guide-analysis.md` |
| March 13 Meeting Transcript | `Transcripts/2026-03-13_arts-council-meeting_CLEAN.txt` |
| March 13 Meeting Notes | `.planning/hub/meetings/2026-03-13-arts-council-call.md` |
| Design Source of Truth | `.planning/hub/design/brand-mockup-final.html` |
| Build Spec | `plans/03-replication-prompt.md` |
| Decision Log | `.planning/hub/decisions.md` |
| Feb 14 Product Brief (reference) | `_bmad-output/planning-artifacts/product-brief-ArtsCouncil-2026-02-14.md` |
| Feb 14 PRD (reference) | `_bmad-output/planning-artifacts/prd.md` |
