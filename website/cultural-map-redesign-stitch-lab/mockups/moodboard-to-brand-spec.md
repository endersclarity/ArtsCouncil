# Moodboard to Brand Spec
Date: 2026-02-14
Project: GVNC Cultural Map Redesign
Source Board: `https://www.pinterest.com/didiarbex/nevada-county-explored/`

## Goal
Translate Diana's Pinterest direction into a usable visual spec for the website redesign without copying individual layouts directly.

## Input Set (Board Pins)
Board size detected: 14 pins.

Pin IDs captured from the board:
- `438397345004387301`
- `438397345004387304`
- `438397345004387308`
- `438397345004387326`
- `438397345004387328`
- `438397345004387341`
- `438397345004387346`
- `438397345004387435`
- `438397345004387452`
- `438397345004387461`
- `438397345004387464`
- `438397345004387465`
- `438397345004387510`
- `438397345004387514`

## Triage
Use this as a filter for what we imitate.

### Keep (Core Direction)
- `438397345004387435` (editorial content-page structure)
- `438397345004387326` (front/back page contrast treatment)
- `438397345004387328` (travel-editorial spread style)
- `438397345004387346` (interior spread with visual rhythm)
- `438397345004387301` (high-contrast typographic cover)
- `438397345004387510` (bold poster typography, high energy)
- `438397345004387514` (expressive typographic color energy)

### Maybe (Secondary Influence)
- `438397345004387461` (travel cover tone, outdoors)
- `438397345004387452` (travel cover composition)
- `438397345004387341` (multi-cover collage feel)
- `438397345004387465` (cover + human-photo framing)

### Reject (Low Priority for This Site)
- `438397345004387304` (studio-branding ad mood, less map-relevant)
- `438397345004387308` (ad-heavy visual language can feel off-brand)
- `438397345004387464` (strong image, weak signal for interface system)

## Style DNA (What Is Consistent)
These are the repeatable threads across the strongest pins:
- Bold, compressed visual hierarchy (clear headline dominance).
- Bright editorial accents over neutral bases.
- Image-first storytelling with hard crops and confident framing.
- Grid discipline with occasional asymmetry.
- Flat, print-like surfaces over soft/neumorphic depth.
- Mix of structured blocks plus expressive type moments.

## Translation to Website UI
Do not reproduce magazine pages literally. Convert the DNA into interface rules:

### Layout Rules
- Use a strict content grid (12-col desktop, 4-col mobile).
- Allow one "hero break" area with asymmetry; keep the rest structured.
- Keep section spacing generous and intentional.

### Typography Rules
- Headline style: bold sans, large scale, tight line-height.
- Body style: clean readable serif or neutral sans for long copy.
- Use uppercase micro-labels for metadata and navigation tags.

### Color Rules
- Base: bright near-white or light neutral.
- Text: high-contrast dark.
- Accent set: 2-3 vivid editorial accents max (not rainbow).
- Use accent blocks as focal anchors, not full-page floods.

### Surface/Depth Rules
- Flat cards, light shadows, clean edges.
- No embossed or heavy inset neumorphism.
- Border radii should be controlled and consistent.

## Starter Token Proposal
These are directionally aligned starter tokens (tune after feedback).

```css
:root {
  --bg-page: #f8f8f5;
  --bg-surface: #ffffff;
  --text-primary: #151515;
  --text-secondary: #4c4c4c;

  --accent-cyan: #24c4d4;
  --accent-lime: #d6ea39;
  --accent-coral: #ff5a4f;

  --border-soft: #e9e7e2;
  --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.08);
  --radius-card: 12px;
  --radius-pill: 999px;

  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 20px;
  --space-lg: 32px;
  --space-xl: 48px;
}
```

## Guardrails
- Uniform in vibe, not random in execution.
- No per-section style jumps.
- Keep one coherent type system and one coherent shadow system.
- Accents should guide attention, not decorate every element.

## Execution Plan (Before Full CSS Rollout)
1. Build 3 aligned variants (A/B/C) from the same token family.
2. Keep structure constant; vary only type scale, accent usage, and image framing.
3. Share A/B/C in one review page for Diana.
4. Lock one direction, then apply tokens globally in Phase 1.

## Recommendation
Do not download and analyze every Pinterest image right now. The board already has enough signal. Use this curated set as the directional source, then validate with Diana's upcoming Pinterest board update before full implementation.
