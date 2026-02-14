# GVNC Cultural District Experience Platform

## What This Is

An interactive experience platform for the Grass Valley-Nevada City Cultural District that transforms a 687-feature cultural asset map into a MUSE magazine-inspired travel publication visitors and locals can actually use. It combines real-time event listings, curated routes with cinematic map storytelling, and editorial content from three MUSE magazine issues — all as a zero-infrastructure vanilla JS static site on Vercel.

The platform serves both the visitor planning a weekend escape from Sacramento and the local parent looking for Saturday events, while giving the Experience Planning Committee engagement data they've never had.

## Core Value

Drive people to downtowns, local businesses, performance venues, and cultural spaces through an editorial-quality interactive experience that feels like MUSE magazine, not a government listings site.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. Inferred from existing codebase (36 modules, Phases 1-3.5). -->

- ✓ Interactive MapLibre GL JS map with 687 cultural assets across 10 color-coded categories — existing
- ✓ Category filtering with pill UI and map marker highlighting — existing
- ✓ "Open Now" real-time business hours check (Luxon, Pacific timezone, hourly refresh) — existing
- ✓ Trumba RSS event integration with venue matching and 14-day count — existing
- ✓ Events carousel with date filtering (today/weekend/14-day/all) — existing
- ✓ 10 curated experience routes with dim+highlight, cinematic flyTo, auto-tour — existing
- ✓ 3 cultural corridor routes (Hwy 49/20/40) from MUSE Issue 3 — existing
- ✓ Detail panel (slide-in) with asset info, hours, events, Google Maps link — existing
- ✓ Deep linking via URL params (?pid=, ?muse=, ?open=, ?events14d=) — existing
- ✓ 3D terrain rendering (MapTiler terrain-rgb-v2, 2x exaggeration) — existing
- ✓ Smart map labels with progressive collision detection — existing
- ✓ MUSE editorial cards with expandable quotes and Heyzine attribution — existing
- ✓ Explore/directory list with search — existing
- ✓ Theme switching per experience via CSS custom properties — existing
- ✓ Watercolor decorative assets (11 images from 2019 design deck) — existing
- ✓ Hero intent section with tabbed navigation — existing
- ✓ Mobile-responsive layout (768px/1024px breakpoints) — existing
- ✓ MUSE places deep-linkable entries (?muse=<id>) — existing
- ✓ County outline GeoJSON boundary — existing
- ✓ Geolocation model for near-me functionality — existing

### Active

<!-- Current scope. 7 epics, MVP (1-4) then Growth (5-7). -->

**MVP (Epics 1-4):**

- [ ] MUSE editorial design overhaul — typographical, bold, contemporary, bright aesthetic per Diana's directive
- [ ] Unified card design language for itineraries, events, directory, editorials
- [ ] Hero section with magazine-cover editorial layout
- [ ] Section transitions with editorial page-turn rhythm
- [ ] Mobile magazine-style reading experience
- [ ] Copy reframing around visitor experience and local economy (not nature, not internal language)
- [ ] Analytics instrumentation — Plausible script + 12 tracked interactions
- [ ] Provider-agnostic analytics module (index-maplibre-analytics.js)
- [ ] UTM parameters on all outbound links
- [ ] Shared Plausible dashboard for committee
- [ ] Itinerary system — itineraries.json schema, separate from experiences.json
- [ ] 3 authored itineraries (1-day Arts & Nature, 2-day Full Experience, 3-day Deep Dive)
- [ ] Itinerary detail view with stop-by-stop narrative, hours, photos, map route
- [ ] Google Calendar export per itinerary stop
- [ ] Itinerary deep linking (?itinerary=<id>)
- [ ] Tier 2 event integration — LibCal iCal + CivicEngage calendar feeds
- [ ] Event source attribution badges ("From Nevada County Library")
- [ ] Family/kids keyword classifier and filter chip
- [ ] Event dedup logic (title + date + venue fuzzy match)
- [ ] events-merged.json static output with Trumba RSS fallback

**Growth (Epics 5-7):**

- [ ] AI concierge — Gemini chat widget with MUSE content knowledge base
- [ ] Vercel edge function proxy for Gemini API key
- [ ] MUSE citation formatting in chat responses with deep-linking to assets
- [ ] Supabase query logging (anonymous, no PII)
- [ ] Chat privacy notice
- [ ] Demand signal reporting — monthly script pulling Plausible + Supabase data
- [ ] Zero-result search query capture
- [ ] Committee-readable markdown/PDF report
- [ ] Downtown positioning copy pass — reframe all UI text to support local economy
- [ ] Platform name resolution with Diana/Eliza

### Out of Scope

<!-- Explicit boundaries. -->

- Community event submission form — requires Arts Council workflow integration, post-MVP
- QR code venue program — physical-digital tracking, not needed for digital platform launch
- Supabase pgvector RAG — only if context stuffing hits limits (evaluate after chatbot launch)
- Tier 3 event sources (social-only venues) — requires MOUs or scraping, legal complexity
- Bilingual support (Spanish) — disproportionate effort for v1
- CMS for Arts Council staff — Google Sheets pipeline is Vision tier
- Digital kiosk mode — visitor center deployment is Vision tier
- Offline support / service worker — not justified by use case yet
- User accounts / authentication — no PII, public read-only site
- Native mobile app — web-first, mobile later
- Real-time chat / multi-turn conversation memory — keep chatbot simple
- Drag-to-reorder itineraries / user-created itineraries — author-only for now
- Formal WCAG 2.1 AA certification — baseline accessibility yes, certification disproportionate for volunteer project

## Context

**Stakeholder:** Diana Arbex (Program Manager, GV-NC Cultural District). Her directive: "a well-designed travel publication that is also an interactive experience platform that is user-friendly, clean, bold and editorial... more of a reflection of the design of MUSE."

**Committee:** Experience Planning Committee meets monthly. Feb 18, 2026 demo at Gold Miners Inn (12:00-1:30 PM) as agenda item #2: "The role AI and trip and itinerary planning." Charter aligns with Culture Forward 2026-2032 action plan.

**Content sources:** Three MUSE magazine issues (2024, 2025, 2026) with full OCR text. Destination NC 2025. All screenshots + OCR in docs/publications/.

**Existing architecture:** 36 vanilla JS modules (IIFE namespace pattern), no build system, MapLibre GL JS 4.5.0, static Vercel hosting. Zero infrastructure cost. See .planning/codebase/ for full analysis.

**Competitive position:** Already surpasses all comparable small-town DMO platforms (Ashland, Marfa, Sedona, even Visit Santa Fe) technically. Five innovations widen the gap: editorial-as-interface, demand signal capture, AI concierge grounded in local editorial, corridor storytelling, zero-infrastructure maintainability.

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS with ES5 IIFEs, no framework, no build step — settled decision from Phases 1-3.5
- **Module pattern**: window.CulturalMap* namespace, 36+ script tags in dependency order — established convention
- **Hosting**: Vercel free tier static — $0/month, auto-deploy from git
- **Budget**: $19-34/month total (Plausible $14, Gemini API ~$5-20, everything else free tier)
- **Maintainer**: Single volunteer developer (Kaelen) — simplicity over sophistication
- **Timeline**: Feb 18 demo is the near-term milestone; MVP (Epics 1-4) should be demo-ready concept
- **Content**: MUSE editorial content is source-grounded — no inventing quotes or places
- **Privacy**: Cookie-free analytics (Plausible), no PII, no consent banner, anonymous chatbot logging
- **Map provider**: MapTiler Landscape basemap + terrain-rgb-v2 — free tier, 100K tiles/month

## Key Decisions

<!-- Decisions that constrain future work. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vanilla JS, no framework | Zero build system, volunteer-maintainable, 36+ modules already working | ✓ Good |
| MapLibre GL JS over Leaflet | WebGL performance, 3D terrain, already integrated | ✓ Good |
| Dim+highlight, not progressive reveal | Better UX for showing context while focusing attention | ✓ Good |
| Experiences in JSON, not CMS | Single developer can author and deploy in minutes | ✓ Good |
| Itineraries separate from experiences | Different data structure (multi-day, stops with times, calendar export) | — Pending |
| Plausible over Google Analytics | Cookie-free, no consent banner, shared dashboard, privacy-first | — Pending |
| Gemini API with context stuffing first | Simple, no infrastructure, sufficient until query volume proves otherwise | — Pending |
| Supabase for query logging | Free tier, RLS policies, future pgvector option | — Pending |
| Preserve MVP/Growth epic split | Epics 1-4 demo-ready first, 5-7 follow. Clear priority line. | — Pending |

---
*Last updated: 2026-02-14 after initialization*
