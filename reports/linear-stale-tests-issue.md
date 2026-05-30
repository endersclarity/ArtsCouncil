## Problem

Two contract tests in `tests/` fail against the current build for reasons unrelated to any active bug — they enshrine constraints that no longer hold. They drag the suite's pass rate down and obscure real regressions.

### 1. `test_v1_primary_anchor_identity.js` — anchor images may now hotlink (owner decision)

Asserts each Primary Anchor's `image.src` matches `^assets/anchors/` with `kind:"real"`, `status:"credible"`. The owner decided (2026-05-30) that **anchors may use hotlinked images** (e.g. Google `lh3.googleusercontent.com`); the local-assets-only requirement is dropped. This also softens ADR-0001's "Primary Anchors must resolve to fully resolved real images" implication.

- [ ] Relax the test to accept hotlinked `https://` srcs (still require `kind:"real"` / a real Image Proof, just not a local path).
- [ ] Add an override note to ADR-0001 recording the hotlink allowance.

### 2. `test_v1_category_placeholder_contract.js` — stale `"Creative Services"` expectation

Asserts the set of place categories equals a hardcoded list that still includes `"Creative Services"`, which `places.json` no longer contains. Pure data/test drift, predates recent work.

- [ ] Reconcile the test's expected category set with the actual categories in `places.json` (or make it derive from the data).

## Why now
Surfaced while running the suite during CLA-37. Neither was caused by that work; both are obscuring signal. Low-risk test-only fixes.
