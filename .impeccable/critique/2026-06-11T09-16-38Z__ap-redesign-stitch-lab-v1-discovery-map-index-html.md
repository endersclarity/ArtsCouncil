---
target: V1 Discovery Map re-critique exit gate (sandbox @ 8014, desktop+mobile)
total_score: 29
p0_count: 0
p1_count: 0
timestamp: 2026-06-11T09-16-38Z
slug: ap-redesign-stitch-lab-v1-discovery-map-index-html
---
# Re-critique (exit gate) — V1 Discovery Map (sandbox/rail-and-muse @ 8014)

Pass 6 of the 2026-06-10 impeccable plan, after passes 0–5 (tokens 3fb1f7b, layout 0df641f, typeset 6d17d55, polish 1f70a21, animate 0534e4a). Desktop 1440×900 and mobile 390×844, agent-browser session `sandbox`. Compared point-by-point against the 2026-06-11T05-45-23Z baseline (25/40, 0 P0, 5 P1).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Card click now triple-confirms: red outline on the rail card, red knockout marker label, detail drawer slides in. Chips/tabs all carry clear active states |
| 2 | Match System / Real World | 3 | "MUSE Picks only 466" still jargon-with-a-number to a first-timer, though the card badge ("Listed in the MUSE 2025 directory") now explains it downstream |
| 3 | User Control and Freedom | 3 | Prominent CLOSE on the drawer; chips toggle freely; still no "reset view" after deep map wandering |
| 4 | Consistency and Standards | 3 | Component vocabulary now unified (uniform cards, one chip style, eyebrows gone); the dual chip vocabularies persist (Explore tabs Places/Events/Paths vs rail chips Everything/Events/Places) |
| 5 | Error Prevention | 3 | Unchanged — little destructive surface |
| 6 | Recognition Rather Than Recall | 3 | Card category now an informative meta line ("Galleries & Studios · Nevada City"), no longer pseudo-navigation |
| 7 | Flexibility and Efficiency | 2 | Still no keyboard shortcuts or rail grouping/jump; accessible names fixed (49–77 chars vs ~1,200 at baseline) |
| 8 | Aesthetic and Minimalist Design | 3 | The baseline's core failure is fixed: uniform poster-field/photo cards, no eyebrows, no visible rail/panel scrollbars, no collisions. Minor noise remains (drawer scrollbar, all-caps data titles) |
| 9 | Error Recovery | 3 | Unchanged |
| 10 | Help and Documentation | 2 | Unchanged — "What are you in the mood for?" is the only guidance |
| **Total** | | **29/40** | **Good — solid foundation, address weak areas** |

P0 count: 0. P1 count: 0. (Baseline: 25/40, 0 P0, 5 P1.)

## Anti-Patterns Verdict

**Does this look AI-generated? No.** The rail — the baseline's AI-grammar epicenter — now reads as a designed system: full-bleed poster fields (blue/green/pink/teal) with bold knockout titles for imageless events, photo cards with structured white meta blocks, uniform 250×190 grid (168px tall on mobile), date as a bold "Tonight ·" lead-in instead of a kicker.

**Deterministic scan**: CLI `detect.mjs` on index.html: 1 warning — `single-font` (ruled FALSE POSITIVE: single-family Polymath/DM Sans is the canonical brand). In-page detector at 8014: **1 finding** — `cream-palette` (ruled FALSE POSITIVE: `#FAF6EC` is the authored NCAC paper token). **Baseline's 30 in-page findings → 0 real findings.** Specifically gone: `gpt-thin-border-wide-shadow` ×22 (cards now 1px ink border + 4px/10px shadow), `low-contrast` ×4 (no small red text below AA remains; active tab is white-on-ink at 17.4:1), `hero-eyebrow-chip`, `side-tab` ×2, `tight-leading` ×3, `all-caps-body`, `nested-cards`.

**Visual overlays**: injection succeeded via the live-server `detect.js` flow in the `[Human]`-titled tab; console reported the single cream-palette hit; live server stopped and page reloaded clean afterward.

## Baseline P1 resolution (point by point)

1. **Rail cards read as data rows → RESOLVED.** Uniform card grid: every one of 19 rail cards measures exactly 250×190 at 1440 (168px tall at 390; single height value in both programmatic scans). Imageless event cards carry sanctioned poster fields with knockout type; photo cards pair grid-cropped images with a white meta block. Thin-border-wide-shadow eliminated (detector ×22 → 0).
2. **Banned eyebrow pattern → RESOLVED.** Programmatic scan for small tracked-uppercase leaf elements on cards returned zero. The "EXPLORE" hero kicker is gone (h1 is now the typemark block). Date recast as bold "Tonight · Venue" footer line. Detector `hero-eyebrow-chip`: 0.
3. **Chip/legend collision → RESOLVED.** Measured at 1440: legend y 593–632, rail chips y 813–861 — 181px clear gap, programmatic overlap check false. On mobile, chips sit directly above the bottom sheet in the thumb zone and marker labels are no longer clipped by the rail.
4. **Visible OS scrollbars → RESOLVED.** `.rail-track` has `scrollbar-width: none` and 0px scrollbar height at both breakpoints; the Explore panel uses `scrollbar-width: thin`; "MUSE Picks only 466" now sits fully visible above the fold. (New minor finding: the selection drawer still shows a default-width scrollbar — logged below as P2.)
5. **Flat hierarchy / unused brand levers → RESOLVED.** Card titles 34px/700 against 12px meta — a real brand-spec jump. Knockout white-on-poster-field type on featured surfaces. Exactly ONE red framing device on the composition (the featured/detail anchor card; programmatic scan found a single ≥2px solid `#FF2E00`-framed element). Photography now sits in the system (knockout caption bar on drawer photos). Contrast failures gone.

## Brand-lever scorecard (NCAC-V1-BRAND.md)

| Lever | Verdict |
|---|---|
| Red framing device | **Used, correctly rationed** — one frame per composition (featured anchor/detail card), plus the header red rule; not nested, not on every card |
| Knockout type | **Used** — poster-field card titles, selected marker's red knockout label, photo caption bars |
| Poster fields | **Used per the rule** — blue/green/teal/pink full-bleed behind knockout type on campaign-style event cards only; never on buttons/markers/chips |
| Type discipline | **Mostly** — 34px → 12px jump on cards, weight-led emphasis; card footers still mix 10/11/12px micro-sizes |
| Photography in the system | **Used** — grid-cropped photos with knockout caption bar (drawer) and structured meta blocks (rail) |
| Confident negative space | **Improved** — Explore panel borders softened, hairline rows breathe; panel remains fairly dense (acceptable for the product register) |

## Overall Impression

The map was always good; now the chrome around it belongs to the same brand. The rail is the demo's product moment: a confident row of NCAC poster cards that no longer reads as generated scaffolding. Remaining weaknesses are product-depth items (keyboard paths, dual chip vocabularies, help) rather than craft defects.

## What's Working

1. **The rail as a poster wall.** Uniform grid + poster fields + knockout type is exactly the brand's sanctioned fix for photo-less cards, and it is the first thing Eliza/Diana will scan.
2. **Selection feedback chain.** Card outline → red marker label → drawer with framed photo and caption bar: one click, three coherent confirmations, all in brand red.
3. **Marker discipline held.** No pass disturbed the monochrome-leaning marker system; legend, hierarchy, and red-as-selection are intact.

## Priority Issues (new findings — NOT fixed in this pass; backlog for a later pass)

1. **[P2] Selection drawer shows a default OS scrollbar** while rail and panel are styled (`scrollbar-width: auto` on `.selection-drawer`). Fix: match the panel's thin treatment. Suggested command: `/impeccable polish`.
2. **[P2] Dual chip vocabularies persist** — Explore tabs (Places/Events/Paths) vs rail chips (Everything/Events/Places) still force users to learn which owns map state. Fix: merge or visually subordinate one set. Suggested command: `/impeccable distill`.
3. **[P2] Legend conveys Events vs Places by dot color alone** (a11y; carried from baseline persona notes, unresolved by design freeze on the legend). Fix: shape or label differentiation. Suggested command: `/impeccable harden`.
4. **[P2] No keyboard path for the rail** — H7 stays at 2; arrow-key navigation across cards would be cheap. Suggested command: `/impeccable harden`.
5. **[P3] All-caps source data titles ("DASTY ISLAND", "DREAMERS") shout in knockout type.** If these are stylized artist names, leave; otherwise title-case for display. Suggested command: `/impeccable clarify`.

## Persona Red Flags

**Alex (Power User)**: Click feedback fixed (visible triple confirmation). Still no keyboard shortcuts; rail remains one long scroll without grouping; the two chip sets remain.

**Sam (Accessibility)**: Card accessible names fixed (49–77 chars, was ~1,200). Red-on-white AA failures gone; active tab 17.4:1. Remaining: legend color-only encoding, undocumented focus path through the horizontal rail.

**Casey (Distracted Mobile)**: Chips now in the thumb zone above the bottom sheet; uniform 168px cards; no mid-word truncation observed ("beginner-friendly…" ellipsis present); no horizontal page overflow; no scrollbar nubs.

## Minor Observations

- "1351 places to explore" + per-category counts still front-load inventory numbers (honest, but database-flavored).
- `app.js` ink-navy marker drift (`#1a1a2e`) noted at baseline — out of this read-only pass's scope; reconcile later and re-run the marker contract.
- Zero console errors at both breakpoints.

## Questions to Consider

- Should the drawer be the SECOND frame candidate instead of the rail's featured card, or is the current single-frame placement the demo's strongest moment?
- Could the Explore tabs absorb the rail chips entirely once the owner picks a survivor?

## Exit gate verdict

**PASS.** 29/40 vs 25/40 baseline (+4); zero P0; zero P1; no banned patterns (both detector hits are the two pre-ruled false positives); no visible rail/panel scrollbars; no chip/legend collision (181px gap); cards read as product moments at 1440 and 390.
