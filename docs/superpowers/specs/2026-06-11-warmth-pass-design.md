# Design: Round-2 "Warmth Pass" — detail cards + de-icing the app

**Date:** 2026-06-11
**Target:** sandbox worktree `C:\Users\ender\Projects\CulturalAssetMap\sandbox`,
branch `sandbox/rail-and-muse`, served at http://127.0.0.1:8014. Never push;
master and the main `app\` checkout untouched.
**Follows:** the pass 0–6 impeccable loop (baseline 25/40 → 29/40, zero P0/P1).
**Owner verdict driving this round:** the app reads "boring, cold, sharp, old —
stark white, plain black text, black borders." Council showed no enthusiasm for
the current direction. The goal is something they *react* to.

## Diagnosis

The build uses the brand's restrictions but only ~30% of its materials. The
brand's actual palette of surfaces: warm paper #FAF6EC, charcoal ink #1A1A1A
("charcoal surfaces" is in the brand doc), documentary photography with knockout
caption bars, poster fields. The cold comes from: white panels, hard 1px ink
borders everywhere, and text-dumped detail cards.

## Decisions (self-answered brainstorm, owner approved the visual direction)

1. **Detail card job = magazine mini-feature** (not a label, not a dossier).
   Facts become a designed strip, prose becomes an editorial blurb.
2. **Split treatment, owner-approved from live mockups:**
   - **Events → "Charcoal feature" (mockup A):** drawer/card on ink #1A1A1A,
     white knockout type, red weighted kicker ("Tonight · 8 PM"), photo with
     caption bar, red primary action, muted-outline secondary. Events are
     campaign surfaces in the brand's own language; they get the drama.
   - **Places → "Warm magazine page" (mockup B):** paper surface, photo-led
     with ink caption bar, red-ruled date-block-style meta column (category/
     city for places), 22px/800 title, blurb in muted ink, actions inline.
     1,351 places must be warm without shouting.
   - **Poster slabs (mockup C language) stay rail-only.**
3. **Global materials swap (kills the GeoCities read):**
   - White panel/card surfaces → warm paper (#FAF6EC body, #F5F0E8 wells);
     pure white survives only as knockout space inside red/ink fields.
   - Hard 1px ink borders → spacing + surface shifts; hairlines (--line) only
     where structure demands; never black borders as decoration.
   - Every featured surface is image-led or poster-led; bare-text blocks are a
     defect.
4. **Brand constraints that still bind:** one red framing device per
   composition; red structural never decorative; no serifs; no category
   rainbow; marker taxonomy untouched; motion tokens from pass 5 reused;
   reduced-motion coverage mandatory; AA contrast on the charcoal surface
   (white on #1A1A1A 17.4:1, #D8D0C6 secondary ~10:1 — both pass; red on
   charcoal only at display sizes).

## Scope of the build

1. **Event detail card/drawer** rebuilt per mockup A (the marker-click and
   rail-card-tap surfaces for events). Charcoal surface, knockout type,
   kicker/date treatment, caption-bar photo, action row.
2. **Place detail card/drawer** rebuilt per mockup B. Date-block pattern
   adapts to a category/city meta column with the 3px red top rule.
3. **Warmth sweep** across Explore panel, browse lists, chips wells, empty
   states: paper surfaces, border reduction. No layout re-architecture — the
   pass 2–5 structure (uniform rail heights, fade masks, ink-fill actives,
   focus rings) is kept.
4. **Carry-along fixes** (logged P2/P3 from the pass-6 critique): drawer
   default scrollbar styled; rail keyboard path (arrow keys move the active
   card); all-caps source titles retyped per
   `v1-discovery-map/data/source-text-review.md` (data edit, plain-language
   changelog); legend color-only encoding gets shape/label support if cheap.
   The dual chip-vocabulary IA question stays OPEN — owner decision, not this
   pass.
5. **Re-critique gate** at the end: must beat 29/40, zero P0/P1, and pass an
   explicit "cold/stark" check — no pure-white panel surfaces, no decorative
   black borders.

## Non-goals

- No IA changes (tabs/chips vocabularies untouched).
- No marker/legend taxonomy changes beyond the cheap encoding assist.
- No new fonts, no serif, no new colors outside brand tokens + the four
  poster-field secondaries.
- No motion beyond pass-5 tokens (entrances may reuse them).
- Nothing ships: sandbox branch only, owner reviews 8014 vs 8013.

## Mechanics (same as prior loop)

One pass = one commit: ?v= bump (cla-62 onward), plain-language
data/changelog.json entry, agent-browser verification at 8014 (zero console
errors, marker-hierarchy contract 10/10, desktop 1440 + mobile 390
screenshots). Suggested pass order: (1) event card, (2) place card,
(3) warmth sweep, (4) carry-along fixes, (5) re-critique gate.

## Mockup reference

Live mockups the owner approved:
`app\.superpowers\brainstorm\1801-1781184096\content\detail-card-directions.html`
(A = charcoal event feature, B = warm magazine place page, C = poster hero,
rail-only).
