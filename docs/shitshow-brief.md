# V1 Discovery Map Triage Brief

Date: 2026-05-26

Status: working triage brief, not official issues

Target of truth: `website/cultural-map-redesign-stitch-lab/v1-discovery-map/`

## Core Read

The current V1 map does not merely look unfinished; it undermines confidence. It feels cluttered, clunky, confusing, and boring at the same time. The user sees evidence of implementation effort, but not a coherent public experience.

This should not be framed as a polish pass. The artifact needs a rethink around trust, disclosure, language, first-use flow, and product posture before visual refinement will matter.

## What Feels Wrong

### Trust Failure

The markers do not feel geographically trustworthy. Many appear away from the streets, buildings, or places they are meant to represent. Some feel like they are in bushes or arbitrary nearby land rather than at real destinations.

This breaks the basic promise of a map. If the user does not trust the marker positions, the rest of the experience cannot carry authority.

### Interest Failure

The opening screen does not create curiosity or momentum. It shows a large dataset and a control panel, but it does not give the user a strong first reason to care.

The experience lacks a first satisfying move, such as starting a route, opening a featured place, seeing what is happening soon, or exploring a clear town/cultural cluster.

### Comprehension Failure

Users cannot quickly tell what they are looking at, what matters, or what to do first. The screen presents many controls and system states before it presents a clear public-facing idea.

The map has implementation, but not enough interpretation.

### Interaction Failure

Markers, clusters, filters, search, and list behavior feel clunky rather than fluent.

The disclosure model is especially weak: at distance, clusters become generic numbers; closer in, markers become initials. Neither state gives enough cultural meaning or confidence.

### Language Failure

The copy sounds like internal review justification rather than a public cultural map. It explains the prototype and its rationale instead of presenting a useful experience.

Terms like "internal alpha," "visible places," "review list," "prototype," "stakeholder review," and similar language make the app feel like homework being graded instead of a public product.

Desired voice: public beta, plain, non-cheesy, specific, useful.

Avoid slogan language like "Find the places where Nevada County makes culture."

Prefer direct language like:

- "Explore cultural places, events, and routes across Nevada County."
- "A countywide guide to cultural places and events."
- "Search by name, town, or category."
- "Featured place."
- "Place details."

### Composition Failure

The left panel, map, markers, filters, and legend compete rather than forming a clear experience. The left panel is doing admin/data-browser work when it should orient, invite, and explain what the map is showing.

The current interface reads more like a dataset QA tool than an arts council cultural map.

### Confidence Failure

The artifact feels embarrassing to show in its current form, even though the underlying work may be substantial.

The problem is not that the map has no value. The problem is that the current presentation makes the value hard to feel.

## Product Posture Diagnosis

Current posture:

> This is a prototype proving that a culture-forward map can exist.

Needed posture:

> This is a public-facing cultural map experience. It may be early, but it should behave like something real.

The V1 artifact should stop treating the full dataset as the opening experience. The full dataset can exist underneath, but the first screen needs an authored layer.

## Early Direction

The "Stakeholder Proof Deck" concept direction felt strongest of the three explored directions, but the copy should use public beta language rather than review/deck language.

The Diana Workbook-only prototype with a MapTiler Streets basemap felt immediately more trustworthy than the current V1/CARTO Positron treatment. The Streets basemap should be treated as a validated direction to integrate or compare in the real V1: it gives roads, town labels, water, terrain context, and enough visual reference for users to judge whether markers are plausible.

Promising direction:

- Public-facing language.
- Stakeholder-ready structure.
- Clear proof modules for places, events, and routes.
- Map preview that feels real and trustworthy.
- Selected anchor or route that gives the first screen a reason to exist.

## Grill Decisions Captured

These are working product decisions from the 2026-05-26 grill, not final implementation tickets.

### First-Load Browsing

The first screen should not open with a raw alphabetical all-places list. The left column should behave as a Directory Browser, beginning with a Browse Starting View.

Implementation issue:

- [#65](https://github.com/endersclarity/ArtsCouncil/issues/65) — MUSE-Grounded Browse Starting View. Closed.

The accepted first input for that Browse Starting View is the refined MUSE-Grounded Sampler:

- GV/NC showcase scope only for first-load visibility.
- Editorial Direct MUSE Evidence required for sampler inclusion.
- Fuzzy/theme-only MUSE evidence cannot qualify a sampler place by itself.
- Truckee, Penn Valley, and other outside-scope places may still receive MUSE-backed card enrichment later.
- MUSE grounding should be implicit in the opening list; the first panel should not present itself as a MUSE feature or magazine archive.

The refined sampler artifact currently lives at:

`website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/muse_grounded_sampler.json`

### Filter Model

The first public browse surface should lead with an Outing Type list rather than raw workbook categories or a permanent stack of filter chips.

Implementation issue:

- [#74](https://github.com/endersclarity/ArtsCouncil/issues/74) — replace first filter impression with Outing Type browse list. Open.

- Outing Type means broad visitor-facing lanes such as art, music and performance, history, local shops, outdoors, events, and family-friendly options.
- Exact categories should remain available as card metadata or secondary filtering, but they should not define the first browse impression.
- The UI should avoid showing Outing Type and category filters as two always-visible stacked control rows; that risks recreating the same clutter under friendlier labels.

Future issue shape:

- Replace the first filter impression with an Outing Type browse list.
- Reveal precise category controls only after the user has chosen a lane, searched, or opened deeper filtering.

### Map Density Disclosure

Default numbered cluster bubbles are no longer the preferred broad/medium zoom treatment.

Preferred direction: Constellation Disclosure with Local Reveal.

Implementation issues:

- [#66](https://github.com/endersclarity/ArtsCouncil/issues/66) — Constellation Disclosure. Closed.
- [#67](https://github.com/endersclarity/ArtsCouncil/issues/67) — Local Reveal / dense-map clicks update the Directory Browser. Closed.
- [#75](https://github.com/endersclarity/ArtsCouncil/issues/75) — density-scaled constellation markers. Implemented in the V1 Discovery Map slice.
- [#76](https://github.com/endersclarity/ArtsCouncil/issues/76) — marker hierarchy beyond density. Open.

- Broad/medium zooms should show restrained place dots as a spatial pattern rather than collapsing everything into generic number bubbles.
- Constellation marks scale with nearby-place density in V1: a single Ordinary Place stays small, while a dense constellation becomes a larger soft aggregate mark without turning into a default numbered cluster bubble.
- Density-scaled constellation marks remain on the Local Reveal path. Clicking or tapping dense map intent updates the Directory Browser with nearby places instead of opening a popover or encoding category mix on the map.
- Marker shape and icon language should not encode visitor category or Outing Type. Category belongs in filters, list rows, cards, and supporting labels; the map marker hierarchy should carry density, interaction state, authored importance, and route sequence instead.
- The selected place should become the strongest individual marker on the map, visually tied to the Selected Directory Card through a matching accent, stroke, or halo. Selection should outrank ordinary dots and density marks without becoming a giant branded pin.
- Authored-importance markers, such as anchor, MUSE, or path places, can be a little special before selection using a restrained Soft Ring treatment. The ring should read as curated importance, not as category type, and should remain quieter than the selected-marker state.
- Dense areas should reveal nearby places on user intent, not through always-visible category-mix bubbles or fake neighborhood buckets.
- Local Reveal should update the Directory Browser with nearby places instead of opening a cramped map popover list.

### Selected Place Navigation

The selected-place experience should use a Unified Place Card rather than separate MUSE/non-MUSE or anchor/non-anchor card models.

Implementation issue:

- [#68](https://github.com/endersclarity/ArtsCouncil/issues/68) — Unified Place Card Selection Drawer. Closed.

Accepted navigation direction:

- Desktop: stable Directory Browser + live map + Unified Place Card in a Selection Drawer.
- Desktop does not need a separate Context Rail when the Directory Browser remains visible; the visible Directory Browser is the return path.
- Desktop drawer should stay focused on selected-place content, with normal close/dismiss behavior rather than a breadcrumb dashboard, numbered explanation panel, or second navigation system.
- Mobile: selected place appears in a bottom sheet with clear close/back behavior. A compact context strip is only needed if the browsing surface is hidden enough that the return path is unclear.

Supersession note for #68:

The original prep phrase "compact Context Rail / Mobile Context Strip" was narrowed during issue shaping. For #68, the accepted implementation scope is the lean drawer/sheet: desktop omits Context Rail entirely, while mobile uses the bottom sheet's close/back affordance as the compact return cue unless a later usability pass proves more context is needed.

### Coordinate Disclosure

The coordinate pass created Review Markers, not fully trusted public truth.

Implementation issue:

- [#69](https://github.com/endersclarity/ArtsCouncil/issues/69) — estimated and missing location caveats in place cards. Closed.

- Diana Workbook and ArcGIS confident fallback coordinates do not need routine provenance text in normal selected cards.
- Census/free-geocoded candidate locations can appear in the review map, but selected cards should say `Map location not confirmed - estimated`.
- Directory-only places remain in the directory without a marker and should say `Map location coming soon`.
- Selecting a directory-only place should not pan or zoom the map.

### First Copy Direction

The public surface should use plain, specific public-beta copy. Current accepted first-pass language:

Implementation issue:

- [#70](https://github.com/endersclarity/ArtsCouncil/issues/70) — first viewport and first selected-place public beta copy cleanup. Closed.

- Title: `Nevada County Cultural Map`
- Support line: `Browse cultural places, stories, and events across Grass Valley and Nevada City.`
- Directory label: `Places to explore`
- Search placeholder: `Search places`
- Near-map action: `Show places in this area`
- Selected card label: `Place details`
- MUSE section label: `Seen in MUSE`
- Context rail language: `From: Places to explore` with a separate `Back` action.

## Working Repair Themes

- Validate address-level coordinates before treating places as map-ready.
- Start the left column with the refined MUSE-Grounded Sampler instead of a raw all-places list.
- Replace the low-context CARTO Positron basemap with a more legible map background, starting with the MapTiler Streets direction validated in the Diana Workbook prototype.
- Replace default number-only clusters with Constellation Disclosure and Local Reveal.
- Use real marker symbols, density-scaled restrained place dots, and numbered route stops instead of initials or category icon soup.
- Give the first screen one obvious satisfying move.
- Let the left panel orient and invite before it becomes a full inventory browser.
- Keep the Directory Browser, map, selected marker, and selected card coordinated.
- Replace internal/prototype language with plain public-facing map language.
- Treat filters as user questions, not database categories.
- Keep the full dataset available, but stop letting it dominate first load.

## Issue Status

This brief is the source narrative. GitHub issues are the implementation slices. Readers should use both: the brief explains why the work exists; the issues show what has been built or queued.

Completed implementation slices:

- [#65](https://github.com/endersclarity/ArtsCouncil/issues/65) — MUSE-Grounded Browse Starting View. Closed.
- [#66](https://github.com/endersclarity/ArtsCouncil/issues/66) — Constellation Disclosure. Closed.
- [#67](https://github.com/endersclarity/ArtsCouncil/issues/67) — Local Reveal / dense-map clicks update the Directory Browser. Closed.
- [#68](https://github.com/endersclarity/ArtsCouncil/issues/68) — Unified Place Card Selection Drawer. Closed.
- [#69](https://github.com/endersclarity/ArtsCouncil/issues/69) — estimated and missing location caveats in place cards. Closed.
- [#70](https://github.com/endersclarity/ArtsCouncil/issues/70) — first viewport and first selected-place public beta copy cleanup. Closed.

Queued implementation slice:

- [#74](https://github.com/endersclarity/ArtsCouncil/issues/74) — replace first filter impression with Outing Type browse list. Open.
- [#75](https://github.com/endersclarity/ArtsCouncil/issues/75) — density-scaled constellation markers. Open.
- [#76](https://github.com/endersclarity/ArtsCouncil/issues/76) — marker hierarchy beyond density. Open.

Still unresolved from this brief:

- Coordinate trust and validation beyond visible caveats.
- Marker visual language inside the Constellation Disclosure system beyond density-scaled constellation markers.
- Basemap integration or comparison for the MapTiler Streets direction.
- Global public copy beyond the first viewport / first click.
- Opening experience depth beyond the MUSE-Grounded Sampler and Outing Type direction.
- Authored routes and featured anchors as a stronger first-screen experience.
- Broader data-source sanity and governance.

## Remaining Issue Areas

This brief is intentionally not an issue list. It captures the first triage read so the project does not lose sight of the core failure.

Likely future issue areas not yet fully shaped:

- Coordinate trust and validation.
- Marker and cluster disclosure.
- Public beta copy rewrite beyond first viewport and first click.
- Left panel first-use redesign beyond the current sampler and Outing Type slice.
- Filter model follow-through after [#74](https://github.com/endersclarity/ArtsCouncil/issues/74).
- First-screen stakeholder/public hybrid composition.
- Authored routes and featured anchors as opening experience.
