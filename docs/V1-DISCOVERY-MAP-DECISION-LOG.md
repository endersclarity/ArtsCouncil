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

## Basemap

- Chosen direction: quiet clarity with a muted, flat editorial basemap.
- Alternatives considered: scenic MapTiler terrain; bright tourism map; GIS-like map.
- Why not: scenic terrain revives older atlas branding; tourism style feels generic; GIS style repeats the current asset map problem.
- Easy branch: run the existing basemap comparison and swap the MapLibre style if stakeholders want more terrain or color.
