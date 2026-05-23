# V1 Discovery Map Decision Log

Status: internal alpha decision record
Date: 2026-05-06

This log preserves choices and rejected alternatives so stakeholder feedback can be translated into branches without losing why V1 went in its current direction.

## Build Base

- Chosen direction: fresh `v1-discovery-map` shell inside the stitch-lab preview deploy area.
- Alternatives considered: build from Arts Hub V2; build from old stitch variants; modify canonical directly.
- Why not: older branches carry stale platform framing, old typography, page-first structure, and broader Arts Hub assumptions.
- Easy branch: promote the V1 shell to canonical after approval, or compare against a specific old branch if stakeholders ask for a familiar behavior.

## Visual System

- Chosen direction: current NCAC site and Diana brand guide are source-of-truth constraints.
- Alternatives considered: Claude Design typography; older Playfair/DM Sans cultural atlas system; Arts Hub V2 Nunito/Playfair system.
- Why not: those directions predate or conflict with confirmed Polymath/live-site brand constraints.
- Easy branch: preserve the map structure while swapping typography/tokens if NCAC explicitly requests another approved brand treatment.

## Opening Experience

- Chosen direction: NCAC-feeling shell with a large map and compact control panel.
- Alternatives considered: pure full-screen map; story-first landing page; event/sidebar-first layout.
- Why not: pure map loses Arts Council ownership cues; story-first weakens map-first proof; event/sidebar-first reopens calendar/platform territory.
- Easy branch: increase editorial intro or reduce panel chrome if stakeholders identify the opening as too sparse or too busy.

## Draft 4 Visitor Pull

- Chosen direction: 10 authored cultural anchors layered over the full place dataset.
- Alternatives considered: icons for every category; a separate story page; broader featured-place ranking.
- Why not: full taxonomy icons become icon soup, a story page weakens map-first proof, and broad ranking reopens data-readiness debates.
- Easy branch: change the anchor list or hooks in data prep while keeping regular places as quiet dots.

## Data Source

- Chosen direction: Diana workbook as source authority, Arts Hub V2 JSON as coordinate and mechanics reference.
- Alternatives considered: use Arts Hub JSON directly; use workbook only; wait for a full database cleanup.
- Why not: direct JSON may be stale; workbook alone is not fully map-ready; full cleanup would block alpha.
- Easy branch: rerun reconciliation with a newer workbook, ArcGIS export, or approved canonical dataset.

## Data Gaps

- Chosen direction: show only records that can appear credibly on the map and log incomplete records separately.
- Alternatives considered: show everything; hand-pick a tiny demo-only set.
- Why not: showing everything exposes broken cards; tiny demo list hides the data reality.
- Easy branch: widen or narrow visibility thresholds after the first review.

## Events

- Chosen direction: light live event layer using current NCAC Trumba RSS where events match visible places.
- Alternatives considered: full events sidebar/calendar; no events; stale Arts Hub V2 event JSON.
- Why not: full event product distracts from V1; no events feels static; stale March events cannot be presented as current.
- Easy branch: add richer event browsing later if the map proves the direction.

## Paths

- Chosen direction: three MUSE-current mapped paths: Living Like a Local, Gallery & Studio Day, Evening Arts Night.
- Alternatives considered: older Gallery Walk / Evening in Nevada City / Live Music Night Out labels; story-only cards; trip planner.
- Why not: older labels are less tied to current MUSE framing; story-only under-demos mapped routes; trip planner violates V1 non-goals.
- Easy branch: rename or retheme paths while preserving the fixed-route model.

## Images

- Chosen direction: use real images when available, otherwise a visibly labeled AI placeholder state.
- Alternatives considered: generic stock; no image area; only real images.
- Why not: stock can feel dishonest; no images weakens place proof; only real images blocks alpha coverage.
- Easy branch: replace placeholders progressively with approved real images.

## Draft 2 Image System

- Chosen direction: generate and wire six NCAC editorial-abstraction placeholders for weak or missing place imagery.
- Alternatives considered: photo-like generated concepts; flat category cards; no generated placeholders.
- Why not: photo-like concepts risk being mistaken for real documentation; flat cards do not demonstrate an image-rich place card; no placeholders leaves the alpha with a visible image hole.
- Implementation rule: classify image quality during data prep using light source/URL heuristics. `image_data.json` is the main photo reference source; Diana's workbook remains asset authority.
- Weak imagery: missing images, watercolor/category art, logos/brand marks, non-image-looking URLs, and obvious weak image references.
- Credible imagery: Google Places image URLs, Wikimedia image files, and normal image-file URLs unless logo-ish.
- UI rule: show only `Placeholder image` on generated art; keep the reason in JSON/gap docs, not in the card.
- Easy branch: replace generated placeholders with approved real photos as they become available.

## Draft 4 V1/Gemini Reconciliation

- Chosen direction: keep `v1-discovery-map` as the forward prototype and remove the duplicate `v1-discovery-map-gemini` folder after selectively porting useful mechanics.
- Alternatives considered: replace V1 with Gemini; keep both folders; remove Gemini without porting.
- Why not: Gemini added useful interaction mechanics but compressed the rich selected-card treatment and dropped the explicit 10-anchor data model. Keeping both folders made the work harder to reason about.
- Implementation rule: preserve V1's rich card, 10 authored anchors, and Draft 4 visitor-pull model. Port only mechanics that improve the same direction: mobile drawer, optional Twilight mode, anchor marker overlay, and custom basemap styling.
- Data rule: do not adopt Gemini's `places.json` as-is because it removes the `anchor` objects. Field comparison found no coordinate, event, image, or description improvements that justified replacing V1 data.

## Draft 2 Place Cards

- Chosen direction: optimize selected-place cards for proof + desire first, utility second.
- Alternatives considered: practical utility first; data confidence first.
- Why not: utility-first is less persuasive for stakeholder demo; data-confidence-first makes the alpha feel like QA tooling.
- Implementation rule: lead with real image or labeled placeholder, then name, category/city, concise MUSE-like description, then `Visit site` and related events when available.
- Easy branch: add directions or source confidence later if the alpha shifts toward public utility.

## Draft 2 Marker Grammar

- Chosen direction: markers communicate layer and priority, not full category taxonomy.
- Alternatives considered: category icon pack; category color rainbow; category legend.
- Why not: 1,076 places make icon/category systems visually noisy; filters and detail cards already carry taxonomy.
- Implementation rule: use restrained place dots, featured/MUSE emphasis, selected-place ring, event dot plus halo, and cluster count bubbles. Keep category/intent in filters and cards.
- Easy branch: add category icons only for a smaller curated subset later.

## Draft 2 Paths

- Chosen direction: Paths appear as curated stop sequences, not heavy route geometry.
- Alternatives considered: strong route line; faint connector; no path emphasis.
- Why not: a heavy connector looks like algebra and does not help users understand a cultural route.
- Implementation rule: emphasize numbered markers, selected/active stop states, subtle pulse/attention ring, and readable stop list. Avoid a prominent route line.
- Easy branch: restore a faint helper connector if user testing shows the sequence is unclear.

## Draft 2 Tooling

- Chosen direction: implement Draft 2 manually in the existing MapLibre alpha using Codex, local generated placeholder assets, browser QA, and impeccable review.
- Alternatives considered: OpenDesign; Claude Design.
- Why not: Draft 2 is targeted implementation on a working app, not broad visual exploration. Prior OpenDesign output drifted away from the real MapLibre/NCAC constraints.
- Easy branch: use OpenDesign or Claude Design later if a fresh visual direction is needed.

## Basemap

- Chosen direction: quiet clarity with a muted, flat editorial basemap.
- Alternatives considered: scenic MapTiler terrain; bright tourism map; GIS-like map.
- Why not: scenic terrain revives older atlas branding; tourism style feels generic; GIS style repeats the current asset map problem.
- Easy branch: run the existing basemap comparison and swap the MapLibre style if stakeholders want more terrain or color.

## Draft 3 Demo Polish

- Chosen direction: keep the existing MapLibre alpha and polish the first stakeholder-demo clicks.
- Alternatives considered: restart visual exploration in OpenDesign or Claude Design; broaden into a PRD; run a full data audit first.
- Why not: the product direction is already stable, and the biggest risk is whether the first five minutes feel culturally credible rather than merely wired.
- Implementation rule: prioritize selected-card craft, demo-critical path records, quieter clusters, path stop sequence clarity, and optimized placeholder assets.
- Demo data rule: path stops are explicitly logged in `DATA-GAPS.md` as demo-critical records, including placeholder-image dependencies.
- Image rule: generated placeholders are served as compressed WebP assets; source PNGs are not needed in the preview app.
- Easy branch: after review, replace placeholder-dependent path stops with approved real photography or swap the curated path themes without changing the map architecture.
