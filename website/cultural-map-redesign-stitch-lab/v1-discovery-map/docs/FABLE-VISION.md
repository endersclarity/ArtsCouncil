# The Almanac: A Fable 5 Vision for the Cultural Map

*Author: Claude (Fable 5), 2026-06-10. An opinionated rebuild spec, written freehand
against the live v1-discovery-map. Not a committee document.*

## The one-sentence thesis

Stop building a map with a list attached. Build a **living field guide to Nevada
County culture** — time-first, narrative-first — where the map is the answer
surface, not the home page.

## What I see in the current build

The v1 proves the plumbing: clean data, live events, curated paths, a working map.
But it inherits the default shape of every civic GIS project: a map of 1,959 dots
with filters. That shape answers the question "what exists here?" Nobody asks that
question. Visitors and locals ask three questions, in this order:

1. **"What's happening tonight / this weekend?"** (time)
2. **"What should I do with my afternoon?"** (itinerary)
3. **"What is this place I'm standing in front of?"** (context)

The current app answers question 3 well, question 1 grudgingly (Events is a mode
you switch to), and question 2 only through four static paths. I would invert the
whole thing.

## The product: three lenses, one substrate

### Lens 1 — Today (the home page)

The app opens to **today**, not to a county of dots. A date-aware editorial front:
tonight's events, what's open now, one featured anchor, one suggested path that
actually works today (no "Evening Arts Night" on a night with no shows). The 9-feed
event pipeline is the most alive thing in this codebase; it should be the heartbeat
of the product, precomputed nightly into a `today.json` the static site reads.

The voice is an almanac, not a dashboard: "Thursday, June 11. The Nevada Theatre
runs a film at 7. The farmers market wraps at noon. Three galleries are open late."
Written by template + data now; written by a model in the refresh pipeline later.

### Lens 2 — Paths (the spine, made dynamic)

Paths are the best idea in v1 and the least developed. They become **generated
itineraries**: a path template (anchors + narrative beats) hydrated with live data
— which stops are open, what's playing, walking time between them. The four
hand-written paths remain as flagship editorial, but the system can compose
"Saturday with kids, starting from the Foundry" from anchors + events + hours.
Every path is a shareable URL (the URL-state machinery already exists in
`review-state.js`); your day plan is a link, no accounts, no database.

### Lens 3 — The Map (demoted, and better for it)

The map becomes the *answer surface*: it renders whatever lens you're in. Today
shows tonight's venues; a path shows its route and stops; search shows results.
The 1,959-place directory survives as exactly that — a searchable directory page —
but only ~200 curated, photographed, verified places earn default map presence.
A map of 200 great things beats a map of 1,959 uneven things. The provenance tiers
already in the data (Diana-verified / candidate / directory-only) become the
curation gate instead of a marker style.

## The design language: field guide, not web app

Keep the NCAC bones (red #ff2e00, ink, warm paper) but commit to an **editorial
almanac aesthetic**: big serif display type, generous margins, numbered path stops
like a trail guide, dates set like a letterpress calendar. The basemap goes
near-monochrome — ink lines on paper — so that red means exactly one thing:
*something is happening here*. The current design is pleasant and anonymous; this
one should look like it could only be about this county. Gold-rush-era print
ephemera, not gold-rush kitsch: think WPA guidebook, not saloon font.

Mobile is the primary canvas (people use this standing on Broad Street), and it
should work offline-ish (PWA shell + cached today.json) because foothill cell
coverage is real.

## The tech: keep the boring, add one build step

The no-framework, static-JSON architecture is a strength. Keep it. Changes:

- **A nightly build step** (extend the existing refresh pipeline) that emits
  `today.json`, hydrated paths, and the curated map set. The site stays static;
  the intelligence moves into the pipeline.
- **Split app.js** into modules per lens; it's at 78KB and one file.
- **Ship places.json sliced**: curated set eagerly, full directory lazily.
  2.1MB on first paint is the current tax for the dot-map shape.
- No database, no accounts, no backend. URL state is the persistence layer.

## What gets cut

- Mode-switcher UI (Places/Events/Paths tabs) — replaced by the three lenses.
- 1,759 placeholder-image dots on the default map.
- The generic filter-chip taxonomy as the primary navigation.

## Pre-mortem (the fool's pass, run against my own idea)

- **Risk: editorial voice needs feeding.** An almanac with stale copy is worse
  than a dashboard. Mitigation: every sentence on Today must be data-derived;
  hand-written copy only where it never expires (anchors, flagship paths).
- **Risk: curation politics.** Choosing 200 of 1,959 places means telling 1,759
  members they're "directory only." Mitigation: rotate the curated set; make the
  gate objective (photo + verified coords + hours), which doubles as an incentive
  for venues to complete their data.
- **Risk: events data is thin (24 today).** A time-first product with a quiet
  week looks dead. Mitigation: Today degrades gracefully to "open now" places and
  a featured path; never an empty state.
- **Risk: this is a v2 rebuild dressed as a redesign.** True. But the data layer
  carries over untouched, which is where the real cost lives.

## Build order (tracer bullets, each shippable)

1. **Today page** reading current events.json — new front door, old map untouched.
2. **Ink-and-paper basemap + curated marker set** — the visual identity lands.
3. **Hydrated paths** with shareable URLs and walking legs.
4. **Directory page** absorbing the long tail; map demoted to answer surface.
5. **PWA shell + nightly today.json** in the refresh pipeline.

Each step deploys to Vercel independently and can be dogfooded with the existing
agent-browser audit loop.
