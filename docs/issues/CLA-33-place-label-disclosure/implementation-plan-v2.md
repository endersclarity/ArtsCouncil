# CLA-33 Place Label Disclosure — Implementation Plan v2

> **STATUS: IMPLEMENTED & SHIPPED (v3), owner-approved, CLA-33 → Done (2026-05-29).**
> The shipped work followed the approved plan `go-ahead-and-write-swirling-simon.md`
> (Task 0–5), which superseded this doc. Evidence: `evidence/v3/`. Verification:
> `scripts/contract/cla-33-place-label-disclosure.contract.mjs` → `allPass: true`.
> Key deviation from this doc's framing: labels are scoped by a zoom **hysteresis
> band** (not center-of-viewport distance — center-distance bias was removed), and
> the dominant visible fix was guaranteeing the **anchor gets labeled** in dense
> clusters (the density-ASC sort was near-inert at the operative zoom). See the
> CLA-33 resolution comment for detail.

> Supersedes `implementation-plan.md` (that plan shipped the rejected build).
> Spec: `interaction-spec.md`. Target: `target/target-replacement-clear-anchored-flow.png`.

> **For agentic workers:** REQUIRED SUB-SKILL: TDD vertical slices. Each slice = a browser-visible failing check, then the smallest app change, then the same check passing. Do NOT mark CLA-33 done until every check below passes AND a human approves the screenshots against the target.

**Goal:** Make labels appear for the dots near the *center of the viewport* (not scattered outliers), bind each label to its dot, enrich the hovered dot with an anchored card, and guarantee a single unmistakable selection identity chain.

**Architecture:** Keep vanilla MapLibre + the existing `map-smart-label` DOM-marker system and `updateSmartLabels()`. This is a re-ranking + binding + hover-refresh change, not a rewrite. No new map modes.

**Tech stack:** Vanilla JS IIFE, MapLibre GL JS 4.7.1, static files via `run.ps1`, Playwright contract checks at `scripts/contract/cla-33-place-label-disclosure.contract.mjs`.

**Files:**
- Modify: `website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js`
- Modify: `website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css`
- Modify: `website/cultural-map-redesign-stitch-lab/v1-discovery-map/index.html` (cache-bust)
- Modify: `scripts/contract/cla-33-place-label-disclosure.contract.mjs` (strengthen)

Why the current build passed yet was rejected: the contract only asserts `smartLabels > 0`. Every task below adds a check that would have caught the real defect.

---

## Task 0 — Raise the close-zoom threshold (density reconciliation)

Highest-leverage change. Labels currently turn on at `getZoom() < 11.75` (`app.js` ~L609), where the whole region is in frame → guaranteed blob. The target's calm only exists at neighborhood zoom.

- [ ] **Step 1 — Failing check.** Assert: at zoom 12.5, `.map-smart-label` count is 0; at zoom ~13.5+, count is small (e.g. 4-10). Expect FAIL today (labels appear at 11.75 and overflow).
- [ ] **Step 2 — Change threshold.** Set the label-on floor to ~13.5 (align with the select fly-to zoom at `app.js` ~L1106). 11.75-13.5 stays dots-only.
- [ ] **Step 3 — Pass.** Re-run; dots-only below the floor, small labeled set above it.

> Constraint for all later tasks: **dots stay monochrome** (no category color — that's CLA-32). Bind label↔dot via leader + proximity + shared red hover/selected state. **Do not add category colors here.** Prefer right-of-dot label placement; demote to left/top only on collision.

## Task 1 — Center-driven ranking (kills "random at a distance")

Root cause: `updateSmartLabels()` ranks by `nearbyDensity` *ascending* (prefers isolated dots) with `centerDistance` only as last tiebreak (`app.js` ~L639-668), then caps at 18 spread across the viewport.

- [ ] **Step 1 — Failing check.** In the contract, after `zoomIntoNevadaCity`, read every `.map-smart-label` screen position and assert the median label is within a center band (e.g. each labeled marker's projected point within 40% of viewport width/height of center, for the non-anchor tier). Expect FAIL today (labels sit on edge outliers).
- [ ] **Step 2 — Re-rank.** Replace the candidate sort so order is: `selected` → `previewed` (hover) → `isAnchor`/`musePick`/`featured` (backdrop) → **`centerDistance` ascending** → name. Remove `nearbyDensity` as a primary key (or invert so it never *promotes* outliers).
- [ ] **Step 3 — Re-cap.** Lower the ordinary-tier cap from 18 to ~8-10 (keep selected/previewed/anchor exempt). Goal: a tight legible set near center, not a viewport sprinkle.
- [ ] **Step 4 — Pass.** Re-run; center-band assertion passes; visually the center neighborhood is labeled and edge outliers are quiet dots.

## Task 2 — Bind every label to its dot

Root cause: label is an offset pill, no connector, no category color (`app.js` ~L730-746).

- [ ] **Step 1 — Failing check.** Assert each `.map-smart-label` has a leader element (e.g. `.label-leader`) OR a `data-anchored` tie to its marker id. Expect FAIL (none exists).
- [ ] **Step 2 — Render the unit.** Build the label as `Name` with a thin leader line/triangle from the marker point to the pill (using the existing `pos-*` offset) so the eye connects pill→dot. **Monochrome — no category color** (deferred to CLA-32). Binding comes from the leader + tight offset, not color.
- [ ] **Step 3 — Style** `.map-smart-label`, `.label-dot`, `.label-leader` in `styles.css` toward the target: small paper pill, readable text, subtle shadow, red hover/focus/selected state.
- [ ] **Step 4 — Pass.** Re-run; binding assertion passes; screenshot at close zoom shows colored-dot-+-name units with visible ties.

## Task 3 — Hover enrichment anchored to the marker

Root cause: `showMarkerPreview` runs on mouse events but `updateSmartLabels` only refreshes on `moveend`/`zoomend` (`app.js` ~L1546, L1601). The preview card floats unanchored.

- [ ] **Step 1 — Failing check.** Hover a known marker (project a place to screen, `page.mouse.move`); assert (a) that place gains a label if it lacked one, (b) the marker shows a hovered/red state, (c) the preview card has a pointer/anchor element tied to the marker. Expect FAIL.
- [ ] **Step 2 — Refresh on preview.** When `state.previewPlaceId` changes, re-resolve labels (or add a lightweight highlight path) so the hovered place is always labeled (tier 2) and reddened.
- [ ] **Step 3 — Anchor the card.** Give the marker-preview card a pointer/tail toward the hovered marker (position from the same `project()` the labels use), not a free-floating box.
- [ ] **Step 4 — Pass.** Re-run hover assertions; screenshot shows one reddened dot + card pointing at it; other labels dim.

## Task 4 — De-overload red; make selection a distinct signal

Root cause (confirmed in code): red is used for THREE meanings — `anchor-rings` (always-on red ring for anchor/featured, `app.js` ~L1449), `place-selection-ring` (red ring on selected, ~L1462), `place-selection-halo` (soft red, ~L1419). A selected place sitting among anchors shows near-identical red rings → ambiguous (`revised-flow/04-click-selection.png`). This contradicts CONTEXT.md **Marker Hierarchy** (interaction-state and authored-importance must be DISTINCT signals) and **Orientation Failure** ("what changed after interaction").

Decision: keep red, but distinguish selection by **fill/shape, not hue** — selected = solid filled core + halo (pops above flat dots and hollow rings); authored-importance anchors keep the hollow red ring. Fill-vs-ring is unambiguous at a glance even inside a cluster. Do NOT recolor anchors or introduce a category palette — that's CLA-32.

- [ ] **Step 1 — Failing check.** Place a selected ordinary place adjacent to an anchor; assert the selected marker is categorically distinct from the anchor ring (e.g. selected has a filled core / distinct radius class; anchor is hollow). Assert the selected place's label carries a `selected` class and the drawer title matches. Expect FAIL today (both render as similar red rings).
- [ ] **Step 2 — Distinct selection treatment.** Give the selected marker a solid filled core (+ keep the halo), clearly larger/topmost, visually separate from the hollow anchor ring. Apply the `selected` red/emphasis class to the selected label only. Ensure exactly one place carries `selected`.
- [ ] **Step 3 — Pass.** Re-run; the selected place is unmistakable even surrounded by anchor rings; dot ↔ label ↔ drawer are obviously the same place.

## Task 5 — Guardrails stay intact (regression)

- [ ] Keep the existing assertions: blank/density map click does NOT enter Local Reveal (`.local-reveal-summary` absent) and does NOT rewrite the Directory Browser.
- [ ] Assert the dense downtown cluster is NOT spread/spiderfied (dot count near center unchanged on focus; no new separated markers).

## Task 6 — Ship state

- [ ] **Step 1 — Cache-bust.** Bump `app.js` / `styles.css` query strings in `index.html` to `cla-33-v2`.
- [ ] **Step 2 — Evidence.** Capture: default dots, close-zoom center labels, hover-anchored card, single-selection. Save under `evidence/v2/`.
- [ ] **Step 3 — Human gate.** Owner compares `evidence/v2/` against `target/target-replacement-clear-anchored-flow.png`. Do NOT auto-close.
- [ ] **Step 4 — Commit** (only after approval):
  ```bash
  git add CONTEXT.md docs/issues/CLA-33-place-label-disclosure scripts/contract/cla-33-place-label-disclosure.contract.mjs website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css website/cultural-map-redesign-stitch-lab/v1-discovery-map/index.html
  git commit -m "feat(CLA-33): center-driven place label disclosure with dot-bound labels"
  ```
- [ ] **Step 5 — Move CLA-33 to Done** only after browser checks pass and owner approves.
