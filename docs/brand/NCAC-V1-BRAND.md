# NCAC V1 Brand — Single Source of Truth

> **This is the canonical brand spec for the V1 Discovery Map.** It is derived directly from the
> real Nevada County Arts & Culture brand guide by Diana Arbex
> (`NCAC_brand-compressed.pdf`). Where older repo docs disagree, **this file wins.**
>
> Supersedes / reconciles: `DESIGN.md`, `V1-NCAC-DESIGN-TOKENS.md`, and the deprecated
> `brand-guide.md` (Gold Country direction). See "Deprecated directions" at the bottom.

---

## The one-sentence brand

**Nevada County Arts & Culture** is bold, confident, and disciplined: a **single red accent on
white and charcoal**, set in **Polymath**, organized by a **strict grid**, and signed with a
**red framing device**. Everything else is restraint.

---

## Palette

Red is the brand. It is **structural, not decorative** — it frames, it anchors, it signals; it is
never sprinkled as garnish.

| Token | Hex | Role |
|---|---|---|
| `--ncac-red` | `#FF2E00` | The accent. Frames, the typemark field, active states, primary markers. One red, used with intent. |
| `--ink` | `#1A1A1A` | Primary text, strong lines, charcoal surfaces. |
| `--ink-soft` / `--muted` | `#5E5852` | Secondary text, captions, de-emphasized labels. |
| `--paper` | `#FAF6EC` | Default warm-white page background. |
| `--paper-soft` | `#F5F0E8` | Slightly recessed surface (panels, wells). |
| `--line` | `#D8D0C6` | Hairlines, dividers, input borders. |
| `--surface` / white | `#FFFFFF` | Cards, fields, knockout space inside the red field. |

**Token reconciliation (spec values WIN over the live CSS drift):**

| Token | Live `styles.css` today | **Canonical (use this)** |
|---|---|---|
| paper | `#f7f7f4` | **`#FAF6EC`** |
| ink | `#141414` | **`#1A1A1A`** |
| line | `#d7d7d0` | **`#D8D0C6`** |
| muted | `#4f4f4a` | **`#5E5852`** |

### Secondary colors — poster fields ONLY

The guide uses bright **blue, green, teal, and pink** as **full-bleed poster/background fields**
(the "Sunrise to Sunset" / "Creative Capital" / "Donate Today" event posters). These are
**campaign expression**, not UI chrome.

- ✅ Allowed: a full-bleed colored hero/cover behind knockout type (e.g. a featured-event card).
- ❌ Never: as button colors, marker categories, tab accents, chart series, or any functional UI
  signal. The functional system is red/ink/paper only.

---

## Typography — Polymath

Type stack (already live via Typekit kit `polymath-variable-2th9nk`):

```
--font-brand: "polymath-variable-2th9nk", "DM Sans", "Inter", system-ui, sans-serif;
```

One family for everything. **No serif display fonts. No Playfair.** (That was the Gold Country
detour.) The voice is bold sans, tight, confident.

### Type scale — discipline over variety

The guide's "Layout Hierarchy" page makes the rule explicit: **2–3 sizes per surface, big jumps
between them.** Hierarchy comes from *weight + size contrast + the grid*, not from many sizes.

| Role | Treatment |
|---|---|
| Display / typemark | Polymath Bold, tight leading, often **knockout white on red**. Big. |
| Heading | Polymath Bold/Semibold, clear step down from display. |
| Body / UI | Polymath Regular/Medium, ~15px, line-height ~1.42. |
| Label / caption | Smaller, uppercase or muted (`--muted`), used sparingly. |

Avoid mid-tier sizes that blur the hierarchy. If you need emphasis, change **weight**, not size.

---

## The Framing Device

The signature asset. A **red rectangular frame** (the "Adaptable frame") that wraps content —
a card, a poster, a hero, a section. It is the brand's handshake.

Rules:
- Red `#FF2E00` stroke. The frame can be the full red field (knockout white type inside) **or**
  a red outline on paper/white.
- **One frame per composition.** It's a signature, not a pattern fill. Don't nest frames or box
  every element.
- The frame implies the grid — its inner content respects consistent margins.
- In-app: use it for the **header typemark block** and at most one hero/featured surface. Not on
  every card.

---

## Grid & hierarchy

- Strict modular grid; everything aligns to it. Generous, consistent margins.
- Hierarchy is earned by **position + size-jump + weight + the red frame**, not by decoration.
- High contrast, lots of white/paper breathing room. Confident negative space.

---

## Imagery

- Photography sits **inside** the system — cropped to the grid, often paired with a red frame or a
  knockout caption bar.
- No watercolor, no illustrated/painterly textures (Gold Country detour). Clean, documentary,
  real Nevada County arts/people.
- Colored poster fields (secondaries) may stand in for imagery on campaign surfaces.

---

## Map marker semantics (V1 Discovery Map)

Carried from `DESIGN.md`, reconciled to this palette:

- Markers are restrained and **monochrome-leaning**: red is the *active/selected/primary* signal;
  ink/charcoal and paper carry the rest. **Do not** color-code categories with a rainbow.
- Hierarchy by **size + zoom step**, not by hue. Featured/anchor places read first (larger, red);
  ordinary places are quiet ink dots until hovered/selected.
- Selected state = red. Hover = subtle ink emphasis. Keep the map quiet so markers and the red
  read clearly against the muted basemap.
- (Engineering invariant, for the later port only: MapLibre silently drops a layer on an invalid
  paint expression; `zoom` may only be a top-level input to `step`/`interpolate`. Validate paint
  exprs before committing and bump the `?v=` cache-bust.)

---

## "Red is structural, not decorative" — the governing rule

Before adding red, ask: *is this red doing a job* (framing, anchoring the brand, signaling the
active/primary state)? If it's just there to look lively, remove it. The power of the brand is the
**single** red used **with restraint**.

---

## Deprecated directions (do not use; pointers here)

- **Gold Country** — `docs/brand-guide.md` (Feb 2026): cream + gold, Playfair serif, watercolor,
  10-category rainbow. Owner did not author it; it is an explicit anti-reference in `PRODUCT.md`.
  **Superseded by this file.**
- Older scattered token notes (`V1-NCAC-DESIGN-TOKENS.md`, `DESIGN.md` token block) are folded in
  above; where they drift from these hexes, **this file is authoritative**.
