## Context

Architecture-deepening pass on the live V1 Discovery Map (`app.js`, a 1,748-line IIFE). Per the folder AGENTS.md, marker render has no callable JS seam (Invariant 1) and the right leverage is making the **place-data spine cohesive and verifiable**, not restructuring rendering. Done via TDD.

## What shipped

New testable UMD module **`place-data.js`** (`window.V1PlaceData`, mirrors `review-state.js`), loaded before `app.js`. 10 unit tests in `tests/test_v1_place_data_module.js` (node:test + vm), all green.

- **`resolvePlaceImage(place, opts)`** — single source of truth for Image Proof vs. Visible Incompleteness. `resolveMedia`/`categoryPlaceholderFor`/`defaultPlaceholder` are injected so `app.js` keeps `CATEGORY_PLACEHOLDER_IMAGES`. `renderImage` now branches on `resolved.isRealImage`. Preserves exact prior behavior (incl. the deliberate rule that a `kind:"placeholder"` record uses the NCAC category placeholder, not its stale `placeholderSrc`).
- **`buildPlaceIndex` / `placeById`** — replaces ~8 scattered `state.places.find(p => p.id === id)` lookups with one indexed helper (built at init). The lone compound find (with `visibleIds`) is intentionally left.
- **`findPlaceDataProblems(places)`** — dev-mode integrity check, surfaced via `?debug=data`: duplicate ids, **Canonical Place name+city collisions** (see CLA-36), invalid `image.kind`, map-ready places missing finite coords. Never throws, never affects render. Gives the verifiable seam ADR-0001's "table-testable" intent implies.

## Verification

- `tests/test_v1_place_data_module.js`: 10/10 pass.
- Updated `tests/test_v1_placeholder_card_treatment_contract.js` (the real-precedence assertion now points at `place-data.js` where the logic moved; behavior unchanged). Full JS suite: the only delta from my change is that test flipping fail→pass.
- Live app (CDP contract per AGENTS.md): map/markers/list/filters render, a real hotlinked photo paints in the detail card (Air Aligned Aerial Arts Academy, credit "via Google"), **no console errors**. `index.html` cache-bust bumped to `cla-37-v1`.

## Deliberately out of scope
State-fragmentation/`setMode` state machine and smart-label collision heuristics — higher-risk changes against the silent-failure paint layer; not worth it for v1.

## Note
Pre-existing test drift unrelated to this change: `test_v1_category_placeholder_contract.js` fails on a stale `"Creative Services"` expectation, and `test_v1_primary_anchor_identity.js` enforces a local-`assets/anchors/`-only image rule the owner has since dropped (anchors may hotlink). Both predate this work; flagged, not touched.
