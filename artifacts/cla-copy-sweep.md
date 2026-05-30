## Problem

The V1 map's surface copy didn't know its audience: it kept slipping into **stakeholder-review voice** — narrating the UI's own mechanics, provenance, and confidence ("image proof", "high confidence / direct place evidence", "Directory record", "demonstrate how cultural discovery can be curated") instead of intriguing a citizen. Root cause was baked into the glossary itself: CONTEXT.md's default was `Audience = Stakeholder Review Audience`, so the copy dutifully addressed the reviewer.

Resolved via `/grill-with-docs` → red-teamed with `/the-fool`. Core ruling: **visible copy serves the citizen, full stop**; reviewers (Eliza, Diane) judge it *as a citizen would* and get no on-surface sentences of their own. Intrigue, don't justify.

## Changes (live app: `website/cultural-map-redesign-stitch-lab/v1-discovery-map/`)

| Where | Before | After |
|---|---|---|
| Nav badge | `Public beta` (bold, red-underlined) | `Internal preview build` — muted (weight 500, transparent) |
| Place eyebrow (`placeKindLabel`/`placeReviewLabel`/detail) | `Directory record` / `MUSE pick` | the place's **category** (plural, e.g. `Performing Arts`) |
| MUSE block (`renderSeenInMuse`) | `Seen in MUSE` + confidence + `pp. 14-19` + `direct place evidence` | `In the pages of MUSE Magazine` + title + issue only |
| Empty state | `…will show image proof, source category…` | `Pick a place to see what makes it worth a visit.` |
| Browse hint | `…centered first, with the wider county still visible as context.` | `…where the map is densest — the wider county stays in view.` |
| Path chooser | `…demonstrate how cultural discovery can be curated…` | `Three routes through the county's cultural life. Pick one to start walking.` |
| a11y leak | `aria-label="Directory record details"` | `aria-label="Place details"` |

Also removed now-dead `museArticleContext()`.

## The Fool's catches (changed the plan)

- MUSE verb **"Featured in" → "In the pages of"** — match data is page-level mentions, not features; "featured" would overclaim to the two reviewers who know what MUSE printed.
- Empty state stopped promising "photos / what's happening" (many cards are thin).
- Browse hint dropped "the heart of the county" (ranking claim Diane might bristle at) for the factual "densest."
- Category labels **kept plural** (sector tags, not "this is a Gallery" sentences; "Eat, Drink & Stay" won't singularize).

## Verification (live preview, DOM-asserted)

- Eyebrow renders category (`Performing Arts`); list badges = categories + `Primary anchor`.
- MUSE place `107-argall-way-nevada-city`: label `In the pages of MUSE Magazine`, items = title + issue, **zero** banned terms (`confidence`, `direct place evidence`, `image proof`, `Directory record`, `MUSE pick`, page citations).
- Badge muted: weight 500, transparent bg.
- No console errors.

## Glossary rulings captured in `CONTEXT.md`

Audience split (citizen = the voice), Invitation Copy, Place-Kind Eyebrow, Seen-in-MUSE credential (+ "In the pages of" rationale), de-justified Anchor Card, badge exception.

## Open (out of scope, by design)

`importanceTier` still lets MUSE boost marker rank (tier 4). Invisible to citizens — not a copy issue. Left for a separate decision.
