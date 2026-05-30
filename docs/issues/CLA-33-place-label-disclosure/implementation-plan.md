# CLA-33 Place Label Disclosure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use TDD-style vertical slices. Each slice starts with a browser-visible failing check, then the smallest app change, then the same check passing.

**Goal:** Replace accidental Local Reveal map-click disclosure with close-zoom place name labels that appear only when readable.

**Architecture:** Keep the existing vanilla MapLibre app. Use the current `map-smart-label` DOM-marker system, but feed it ordinary visible places at close zoom instead of only anchors. Remove the map-level Local Reveal click trigger so blank map clicks do not rewrite the Directory Browser.

**Tech Stack:** Vanilla JS IIFE, MapLibre GL JS 4.7.1, static files served by `run.ps1`, browser-visible Playwright checks for behavior.

---

## Rejection Note

The first implementation attempt was rejected by the owner. Do not treat the current committed behavior as the design target. The replacement target is `docs/issues/CLA-33-place-label-disclosure/target/target-replacement-clear-anchored-flow.png`.

Required correction for any future plan:

- labels must appear because they belong to an obvious focused area, not because they survived a hidden global sort;
- every visible label must be visually tied to its own dot;
- every hover card must clearly point to the highlighted marker;
- selected detail must keep the selected dot, selected label, and detail panel relationship unmistakable;
- do not implement again until the target flow has been converted into a concrete interaction spec.

## Files

- Modify: `website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js`
- Modify: `website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css`
- Modify: `website/cultural-map-redesign-stitch-lab/v1-discovery-map/index.html`
- Create: `scripts/contract/cla-33-place-label-disclosure.contract.mjs`

## Task 1: Stop Accidental Local Reveal

- [x] **Step 1: Write failing browser check**

Create `scripts/contract/cla-33-place-label-disclosure.contract.mjs` with a check that opens the map, clicks an ordinary map area, and asserts `.local-reveal-summary` is absent.

- [x] **Step 2: Run check and confirm current failure**

Run: `node scripts/contract/cla-33-place-label-disclosure.contract.mjs`

Expected before implementation: FAIL because `.local-reveal-summary` appears after a map click.

- [x] **Step 3: Remove map-click Local Reveal**

In `app.js`, remove the `startLocalRevealFromMapClick` registration and do not register `click` on `place-density` for Local Reveal. Keep marker click handlers for `place-points` and `anchor-rings`.

- [x] **Step 4: Re-run check**

Run: `node scripts/contract/cla-33-place-label-disclosure.contract.mjs`

Expected: PASS for blank/density-area map click not changing the Directory Browser.

## Task 2: Show Close-Zoom Place Names

- [x] **Step 1: Extend browser check**

Add a check that zooms into Nevada City/Grass Valley and asserts at least one `.map-smart-label` appears.

- [x] **Step 2: Run check and confirm current failure**

Run: `node scripts/contract/cla-33-place-label-disclosure.contract.mjs`

Expected before implementation: FAIL or weak coverage because smart labels only use anchors and disappear when there are too many.

- [x] **Step 3: Expand `updateSmartLabels()` source places**

In `app.js`, make `updateSmartLabels()` return early below close zoom, then collect visible map-ready filtered places inside the viewport. Include selected and hovered/previewed place ids first when available, then anchors/MUSE/featured, then ordinary places in stable name order.

- [x] **Step 4: Keep collision hiding**

Use the existing occupied-box placement logic. Add labels only where a candidate position does not collide with markers or previous labels. Cap total candidate labels to a small close-zoom number so dense screens do not become text soup.

- [x] **Step 5: Re-run check**

Run: `node scripts/contract/cla-33-place-label-disclosure.contract.mjs`

Expected: PASS with readable close-zoom labels.

## Task 3: Polish Label Styling and Cache Bust

- [x] **Step 1: Style close-zoom labels**

Adjust `.map-smart-label` in `styles.css` toward the target: small white/paper pill, readable text, subtle shadow, hover/focus red state.

- [x] **Step 2: Bump cache-bust query**

In `index.html`, bump `app.js` and `styles.css` query strings to `cla-33-place-label-disclosure`.

- [x] **Step 3: Visual verification**

Capture screenshots for:

- default map
- close zoom labels
- clicked marker selection

Expected: no Local Reveal circle; Directory stays stable; close zoom has readable labels where space allows.

## Task 4: Linear and Done State

- [x] **Step 1: Attach final evidence**

Update Linear CLA-33 with local evidence paths, target URL, and final behavior summary.

- [ ] **Step 2: Commit implementation**

Run:

```bash
git add CONTEXT.md docs/issues/CLA-33-place-label-disclosure scripts/contract/cla-33-place-label-disclosure.contract.mjs website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css website/cultural-map-redesign-stitch-lab/v1-discovery-map/index.html
git commit -m "feat: add close zoom place label disclosure"
```

- [ ] **Step 3: Mark Linear done**

Move CLA-33 to Done only after browser verification passes.
