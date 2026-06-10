# Spec: Flow Upgrade Pass (markers → first load → joined card → time lens → delights)

Owner approved 2026-06-10. Source vision: `proposed-flows.html` boards + the
flow-proposal images in `docs/briefing-assets/flow-proposals/`. The boards are
direction, not law — deviations below are deliberate and noted as PUSHBACK.

Live data facts this spec is grounded in (verified 2026-06-10):
- places.json: 1351 places, fields include `markerTier`, `anchor`, `featured`,
  `musePick`, `intent`, `category`, `image`, `description`, `descriptionSource`.
  ZERO places have hours data.
- events.json: 60 events, ALL linked to a `placeId` (+ date, lat/lng, image, url).
- paths data exists and renders in Paths mode.

## Stages (each = one loop iteration minimum; commit per stage, do NOT push)

### Stage 1 — Marker redesign (hierarchy + clustering)
Goal: kill the dot soup. At county zoom a visitor should see ~15–30 named
cultural anchors, not ~700 undifferentiated dots.
- Use MapLibre native clustering OR zoom-dependent layer filtering on
  `markerTier` / `anchor` / `featured` — inspect those fields first and use
  whatever tiering already exists rather than inventing a new one.
- Low zoom: anchors/featured only, brand-styled (NCAC red accent), with name
  labels (symbol layer, collision-managed by MapLibre).
- Mid zoom: add the rest as small recessive dots; clusters show counts.
- Selected place: distinct emphasized state; map flies to it (easeTo/flyTo with
  sensible zoom, ~15, never jarring).
- Places with a current event get the red "live" treatment from the Events-01
  board (small halo/pulse), in all modes, not just Events mode.
- Category colors: keep at most a few muted tints; the boards use mostly
  ink-dark dots + red for live/selected. Match the boards, not the current
  olive/mustard palette.

### Stage 2 — First-load experience
Goal: a host, not a database. Replace the cold "1351 PLACES TO EXPLORE" +
search-first panel with:
- One featured anchor card up top (photo, one-line hook, "View place" button)
  rotating/chosen from `featured`/`anchor` places that have a real image and a
  real description (check `descriptionSource` exists or description lacks the
  alpha-review template).
- "What are you in the mood for?" outing-type list with counts (the boards'
  See a Show / Galleries & Studios / Historic Places / Public Art / Shops &
  Makers). Map these from the existing `intent`/`category` fields — inspect the
  actual values first; do not invent taxonomy. Clicking one filters the map AND
  the list, same as today's category filters, just framed as intent.
- Keep search, but below the mood list, not as the hero.
- PUSHBACK adopted: skip the boards' "Good morning" greeting — time-of-day
  copy reads gimmicky and goes stale on screenshots. Lead with the featured
  place instead.

### Stage 3 — Joined-up place card ("Place Pulse" lite)
Goal: the selected-place card becomes the connective surface.
- Sections, shown only when data exists (no empty scaffolding):
  1. Photo + name + category/city + the venue's own description (+ tiny
     "from their website" provenance line when `descriptionSource` exists).
  2. UPCOMING HERE: events where `event.placeId == place.id`, date-sorted,
     max 3, each clickable through to the event (and its `url`).
  3. PART OF A PATH: if the place appears in any path, name the path; clicking
     switches to that path in Paths mode.
  4. NEARBY: 2–3 closest other places (straight-line distance is fine),
     clickable.
- PUSHBACK adopted: the board also shows "Seen in MUSE x2" with editorial
  excerpts. We have only the boolean `musePick` — show a simple "MUSE Pick"
  badge/line, do NOT fabricate excerpts or counts. A real MUSE-excerpt lens
  waits until actual MUSE story data exists.

### Stage 4 — Time lens (events-based only)
Goal: "what's happening" without lying about hours.
- Chip row in Events mode (and a compact entry point in Places mode):
  Today / This weekend / Next 7 days / All upcoming. Filters the event list
  AND the event markers.
- PUSHBACK adopted: NO "Open Now" — zero places have hours data and inventing
  hours would be worse than omitting them. The lens is events-only until hours
  data exists. Note this in STATE.md as a data gap.

### Stage 5 — Delights (small, honest versions)
- "Surprise me nearby": button in Places mode; picks 3–4 random non-anchor
  places that have a real description (prefer ones with images), shows them as
  a mini list + highlighted markers. Pure client-side random with a re-roll.
  The boards' "Reason to go" line: reuse the first sentence of the venue's own
  description — never generate new editorial copy.
- "Make it a night" on the event card: PUSHBACK — the board implies curated
  outings; we have no curation data. Ship the honest version: from the event's
  venue, list 2–3 nearby food/drink/shop places ("Before or after") by
  distance + category. Label it nothing fancier than "Nearby". If that feels
  thin in practice, drop it and note why in STATE.md rather than faking
  curation.

## Rules (every stage)

- Vanilla JS in the existing `app.js` IIFE; match its style. NOTE: app.js
  contains a null byte — use `grep -a` when searching it.
- NEVER read `data/places.json` wholesale into context; use python/jq.
- Bump the `?v=` cache-bust string in index.html on EVERY app.js/styles.css
  change.
- Verify each stage with agent-browser against a local server before
  committing: screenshot, click through the changed flow, zero console errors.
  Mobile check (~390px width) for stages 2 and 3.
- Each commit needs a `data/changelog.json` entry (pre-commit hook enforces).
- Update `.planning/STATE.md` at the end.
- Commit per stage. Do NOT push — owner reviews first. (The unpushed
  self-description commit 0955e99 is already on master; these stack on it.)
- Done when: all 5 stages verified + committed, STATE.md updated, and a final
  summary of what was deliberately NOT built (Open Now, MUSE excerpts,
  fake curation) is in the loop's closing report.
