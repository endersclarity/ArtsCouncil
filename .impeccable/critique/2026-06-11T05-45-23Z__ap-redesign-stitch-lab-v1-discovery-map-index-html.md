---
target: V1 Discovery Map baseline (sandbox @ 8014, desktop+mobile)
total_score: 25
p0_count: 0
p1_count: 5
timestamp: 2026-06-11T05-45-23Z
slug: ap-redesign-stitch-lab-v1-discovery-map-index-html
---
# Baseline critique — V1 Discovery Map (sandbox/rail-and-muse @ 8014)

Pass 1 of the 2026-06-10 impeccable plan. Desktop 1440×900 and mobile 390×844, agent-browser session `sandbox`, post pass-0 canonical tokens (commit 3fb1f7b). Briefed against NCAC-V1-BRAND.md's expressive system: defects AND unused brand levers are scored.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Chip/tab active states clear; clicking a rail card for an already-visible place gives almost no visible feedback |
| 2 | Match System / Real World | 3 | Plain invitation language is good; "MUSE Picks only 466" reads as jargon-with-a-number to a first-timer |
| 3 | User Control and Freedom | 3 | Close button on selected place, chips toggle freely; no obvious "reset view" after deep map wandering |
| 4 | Consistency and Standards | 2 | Two competing chip vocabularies (Explore tabs Places/Events/Paths vs rail chips Everything/Events/Places); legend dot colors vs marker reality drift; eyebrows styled 3 different ways |
| 5 | Error Prevention | 3 | Little destructive surface; search has no constraint issues found |
| 6 | Recognition Rather Than Recall | 3 | Everything visible; but rail card category kickers (GALLERIES & STUDIOS etc.) double as pseudo-navigation users can't act on |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts; rail is one long horizontal scroll with no jump/grouping; cards expose entire event essays to screen readers (e.g. the full Stained Glass class description as one accessible name) |
| 8 | Aesthetic and Minimalist Design | 1 | The core failure: flat mixed-height white rectangles, eyebrow kickers on every card, visible scrollbars, chip/legend collision, heavy boxed Explore panel, near-equal type weights |
| 9 | Error Recovery | 3 | Few error states reachable; empty filter states not obviously designed |
| 10 | Help and Documentation | 2 | No contextual help; "What are you in the mood for?" is the only guidance |
| **Total** | | **25/40** | **Acceptable — significant improvements needed** |

P0 count: 0 (nothing blocks task completion). P1 count: 5.

## Anti-Patterns Verdict

**Does this look AI-generated? Yes, at the rail.** The map itself is restrained and credible; the Discovery Rail and Explore panel are where the AI grammar lives: tracked-uppercase eyebrow on every card ("TONIGHT", "COMING UP", "GALLERIES & STUDIOS", "IN THE PAGES OF MUSE MAGAZINE"), identical white cards with 1px border + soft wide shadow, mixed heights from unconstrained text, and a kicker ("EXPLORE") above the h1.

**Deterministic scan**: CLI `detect.mjs` on index.html: 1 warning — `single-font` (FALSE POSITIVE: single-family Polymath/DM Sans is the canonical brand voice per NCAC-V1-BRAND.md). In-page detector at 8014: **30 findings**:
- `gpt-thin-border-wide-shadow` ×~22 — every rail card: 1px border + 42px shadow blur (`--shadow-float`). The single biggest "AI made this" tell, and it confirms the seed list's "flat data-row cards".
- `low-contrast` ×4 — red `#ff2e00` on white at 3.7:1 (eyebrows, EXPLORE kicker, red labels) and paper `#FAF6EC` on red at 3.4:1 (active "Places" tab knockout). Red text below 18px fails AA.
- `hero-eyebrow-chip` — "EXPLORE" kicker above the h1 (banned pattern, confirmed).
- `side-tab` ×2 — 4px `border-left` accents (absolute ban).
- `tight-leading` ×3 (1.25–1.28), `all-caps-body` (31-char uppercase run), `nested-cards` ×1 (card inside card — plan/DESIGN.md both ban this).
- `cream-palette` — FALSE POSITIVE: `#FAF6EC` is the authored NCAC paper token, identity-preservation wins.

**Visual overlays**: injection succeeded; overlays were displayed in the `[Human]`-titled tab during the run and removed afterward (page reloaded clean).

## Overall Impression

The map layer is genuinely good — quiet basemap, disciplined monochrome-leaning markers, red used for anchors/selection, marker-hierarchy contract 10/10. Everything wrapped AROUND the map looks like scaffolding: the rail is a row of near-identical white slabs whose only "design" is an uppercase red kicker, and the Explore panel is a hard-bordered box with a visible scrollbar cutting off "MUSE Picks only" mid-row. The single biggest opportunity: the brand's expressive system is almost entirely unused — there is no red framing device, no knockout display moment, no poster field, no big type jump anywhere on the surface.

## What's Working

1. **Marker discipline.** Soft-ring anchors, ink dots, red selection — exactly the brand's "hierarchy by size not hue". The contract suite passing 10/10 shows it's engineered, not accidental.
2. **The header typemark.** Two-line "Nevada County / Cultural Map" with ink/red split and the red rule under the header is the closest thing on the page to the real brand voice.
3. **Honest content.** Real events, real venues, real photos where they exist, "Internal preview build" badge, invitation-register copy ("What are you in the mood for?").

## Priority Issues

1. **[P1] Rail cards read as data rows, not product moments.** Mixed heights (113px to 130px+ depending on text), 1px-border-wide-shadow styling ×22, only 2 of the first 6 cards carry imagery, unstyled mid-word truncation at the viewport edge on mobile ("longest ru"). Why: this is the first thing a stakeholder scans and it reads as generated scaffolding, undermining the "culturally credible and ownable" success criterion. Fix: uniform card height grid; imagery or sanctioned poster-field stand-ins on every card; kill the thin-border+float-shadow combo. Suggested command: `/impeccable layout`.
2. **[P1] Banned eyebrow pattern on every card + above the h1.** TONIGHT / COMING UP / category kickers on all ~22 cards, plus the "EXPLORE" hero kicker — detector-confirmed `hero-eyebrow-chip` and the saturated AI tell. Why: it is literally the plan's banned pattern and flattens scanning (every card starts with the same shape). Fix: recast date as a designed element (red "Tonight" word in the title line or a date block); delete the EXPLORE kicker. Suggested command: `/impeccable typeset`.
3. **[P1] Chip/legend collision bottom-right.** Measured overlap: rail chips (y 629–660, x 1161–1401) sit on top of the legend box (y 599–638, x 1177–1407) — ~9px vertical intersection over a 224px-wide band at 1440px. On mobile the chips float mid-map and rail cards clip marker labels ("Empire", "Ga…"). Why: accidental stacking reads as broken, and it's at the exact corner the legend invites you to read. Fix: one stacking plan for the bottom-right (legend above chips with fixed gap, or merge chips into the rail edge). Suggested command: `/impeccable layout`.
4. **[P1] Visible OS scrollbars: horizontal under the rail (both breakpoints) and vertical inside the Explore panel,** the latter clipping "MUSE Picks only 466" mid-row at default height. Why: raw scrollbars + clipped controls signal unfinished chrome on the demo's primary panel. Fix: `scrollbar-width: thin/none` + fade-edge affordances; size the panel so no control is half-visible. Suggested command: `/impeccable layout`.
5. **[P1] Flat type hierarchy / unused brand levers.** Card title ~16px, venue/date ~13px, eyebrow ~11px — small steps, near-equal weight, violating the brand's "2–3 sizes per surface with BIG jumps". Nowhere on the surface: the red framing device (zero instances), knockout type (only the tiny active tab, which fails contrast at 3.4:1), poster fields (zero — despite being the sanctioned fix for photo-less cards), photography-in-the-system treatments (images are bare crops, no red frame/knockout caption bar), confident negative space (Explore panel rows are cramped, 4px side-tab accents instead of breathing room). Why: the brand IS the differentiator for this demo; without its expressive system the build reads as generic GIS chrome — the exact anti-reference in PRODUCT.md. Fix: one red frame moment (header block or first/featured rail card), knockout display type there, poster-field stand-ins for imageless featured cards, real size jumps (title vs meta). Suggested commands: `/impeccable typeset` + `/impeccable layout`.

## Persona Red Flags

**Alex (Power User)**: No keyboard shortcuts; the rail is a single ~22-item horizontal scroll with no grouping or jump; clicking an already-centered card gives no feedback, so Alex can't tell whether the click registered. Two different "Events/Places" chip sets (Explore tabs vs rail chips) force him to learn which one owns the map state.

**Sam (Accessibility)**: Rail card buttons expose entire event essays as a single accessible name (the Stained Glass card's name is ~1,200 characters) — a screen-reader user must listen through the whole thing per card. Red-on-white labels at 3.7:1 and paper-on-red active tab at 3.4:1 fail WCAG AA for their sizes. Horizontal-scroll rail with no visible focus path documentation; legend conveys Events vs Places by dot color alone.

**Casey (Distracted Mobile)**: Rail cards float over the map and clip marker labels; mid-word truncation ("longest ru", "Saloon & Grill 10") with no ellipsis/fade; chips sit mid-screen over the map rather than in the thumb zone; visible scrollbar nubs at the rail edges.

## Minor Observations

- `app.js` marker paint hardcodes ink as `#1a1a2e` (a navy, lines 21/25) — not one of pass-0's four drifted hexes, but it's a fifth drift from canonical ink `#1A1A1A`; worth reconciling in a later pass (re-run the marker contract after).
- Twilight-mode token block still uses its own near-black variants (`#101010`, `#454541`) — intentional darkening or pre-reconciliation drift? Decide once.
- "1351 PLACES TO EXPLORE" + per-category counts (523 History) front-load inventory numbers; counts are honest but read as database, not invitation.
- Two `side-tab` 4px border-left accents (detector hits) — absolute-ban list; restructure whatever uses them.
- The Explore panel's mood list rows are full-width hairline-divided rows with right-aligned counts — fine pattern, but cramped (tight-leading hits land here).
- Detector false positives to ignore in later passes: `single-font`, `cream-palette` (both are the authored brand).

## Questions to Consider

- What is THE one frame? The brand allows exactly one red framing device per composition — header typemark block or a featured "Tonight" card. Which surface earns it for the Eliza/Diana demo?
- Could "Tonight" be the product moment instead of a kicker — one knockout-type featured card at the rail's head, poster-field background, with everything after it quieter?
- Does the Explore panel need to be a box at all, or could it sit on paper with the map showing through — negative space instead of borders?
- If the rail chips and the Explore tabs do the same job, which one survives?
