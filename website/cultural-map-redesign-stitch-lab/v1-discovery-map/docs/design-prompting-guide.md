# Design Prompting Guide — Fable 5 / Opus 4.8

Distilled from Anthropic's model behavioral guide (the "prompting guide" the workflow video
names). Canonical sources, fetch when a new model ships:
- `https://platform.claude.com/docs/en/about-claude/models/migration-guide.md` (per-model "how to
  prompt this model" — the design-relevant gold is in the Opus 4.8 / 4.7 sections)
- `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview`

## How to refresh a design skill with this (the workflow)

1. Open the design skill prompt you want to refresh (`frontend-design`, `design-taste-frontend`,
   or `impeccable`).
2. Paste the skill prompt + this guide into Claude. Ask: "Here is the prompting guide for the
   current model. Rewrite this design skill to match it."
3. Claude returns a model-tuned version. Diff it, keep what fits NCAC, commit.

Skills go stale as models change. This file is how you re-tune in one step on the next release.

## The design-relevant rules

**Effort is the main lever.** Default `high`; `xhigh` for coding/agentic and animation work
(fewer retries); `max` only when correctness outweighs cost. Simple copy/layout tweaks can drop to
`medium`. Animation work (GSAP, sequenced reveals) wants `xhigh`/`max`.

**Propose 4 directions first** — the fix for "converging on the distribution" (the model drifting
to the safest average design). Before building, have the model output 4 distinct visual directions
(bg hex / accent hex / typeface + one-line rationale), then implement only the one you pick. This
breaks the default house style and gives you the choice.

**Anti-slop snippet.** Forbid generic AI aesthetics: overused fonts (Inter, Roboto, Arial, system
fonts), cliché palettes (purple gradients on white/dark), predictable layouts, cookie-cutter
components. Demand unique fonts, a cohesive theme, and motion for micro-interactions.

**Watch the house style.** Opus 4.7/4.8 default to warm cream/off-white backgrounds, serif display
type (Georgia, Fraunces, Playfair), and a terracotta/amber accent. It reads editorial — close to
NCAC's poster brand, but it will drift off our exact palette. Pin exact hex and typefaces from the
brand file (NCAC-V1-BRAND.md / DESIGN.md) rather than relying on the default.

**More literal instruction-following (4.7/4.8).** The model does what you say and does not silently
generalize. Be specific: exact hex, exact typeface, exact spacing. Vague nudges ("make it cleaner")
shift it to a different fixed style rather than producing range.

**Narration and verbosity (4.8).** 4.8 narrates more between steps and writes longer wrap-ups. For a
build task, add a silence-default if it gets chatty. Verbosity responds well to an explicit length
instruction.

**Make verification explicit.** After generating, have a sub-agent check the output against the
brand file (NCAC-V1-BRAND.md / DESIGN.md) as the source of truth. Point it there, not at vibes.

**Give product context.** This repo's `AGENTS.md` is the product-context file. A design task should
read it first so the model knows what the map is and who it serves.

## NCAC bindings (do not skip)

- **Brand source of truth:** NCAC-V1-BRAND.md / DESIGN.md. Poster framing, #FF2500 red, cool
  neutrals, Card=Poster frames. The rail frame is red/black/white, not colored.
- **Functional vs marketing.** The map (`index.html` + `app.js`) is **functional UI** — keep it
  quiet, no heavy animation, do not break MapLibre interaction. Save bold design and GSAP motion for
  marketing surfaces (rail poster, story cards, a standalone story page).
- **Scope:** assets map only. No Trumba-centerpiece work; events mirror the official NCAC calendar.

## Ready-to-paste design preamble

> Read `AGENTS.md` for product context and the brand file (NCAC-V1-BRAND.md / DESIGN.md) for the
> design system; treat the brand file as the source of truth for color, type, and spacing. Before
> building, propose 4 distinct visual directions for this brief (bg hex / accent hex / typeface +
> one-line rationale) and let me pick one; then implement only that direction. Use the brand's exact
> hex and typefaces — do not substitute defaults. NEVER use generic AI aesthetics: no Inter / Roboto
> / system fonts, no purple-on-white gradients, no cookie-cutter layouts. Use cohesive color, a
> distinctive typeface, and motion for micro-interactions. This is a functional map UI unless I say
> otherwise — keep it quiet and do not animate the map interaction. Run at high effort (xhigh for
> animation). When done, verify the result against the brand file via a sub-agent.
