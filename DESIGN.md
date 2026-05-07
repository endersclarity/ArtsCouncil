# Design Context

## Source Priority

1. Live Nevada County Arts Council site.
2. Claude Design handoff.
3. V1 Discovery Map brief, decision log, and token note.
4. OpenDesign output as moodboard only, never token source.

## Visual Direction

Use quiet NCAC product clarity: red, ink, warm paper, strong typemark discipline, compact controls, and a working map as the dominant surface.

The page should feel like an NCAC-native map tool, not a campaign landing page or magazine feed. Red should create ownership through structure and active states, not decoration.

## Core Tokens

- Red: `#FF2E00`
- Ink: `#1A1A1A`
- Paper: `#FAF6EC`
- Soft paper: `#F5F0E8`
- Line: `#D8D0C6`
- Muted text: `#5E5852`

## Typography

Use a simple sans stack:

```css
font-family: "polymath-variable-2th9nk", "DM Sans", "Inter", system-ui, sans-serif;
```

Do not use serif display fonts for V1. Avoid Playfair, Iowan, Charter, Georgia, and old Gold Country atlas styling.

## Layout

- MapLibre map should dominate desktop and mobile first view.
- Header should be compact and NCAC-native.
- Control panel should be compact, flat, and functional.
- Mobile should keep the map visible above the docked panel.
- Avoid cards inside cards and avoid decorative wrappers around the map.

## Components

- Mode tabs: `Places`, `Events`, `Paths`.
- Filter chips: visitor intent labels backed by source categories.
- Detail card: image proof, name, category, compact description, practical links, related events where available.
- Path view: fixed route line, numbered markers, short stop list.

## Imagery

Real place photos are preferred. Category watercolors and logos are not acceptable V1 place-proof placeholders.

Missing images should use intentionally designed generated placeholders that are visibly labeled as placeholders until replaced by real documentation.

## Motion

Use restrained map movement only: fly-to, fit-bounds, and hover/click feedback. No decorative animation.
