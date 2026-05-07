# V1 NCAC Design Tokens

Status: implementation reference
Date: 2026-05-06

## Source Priority

1. Live Nevada County Arts Council site: `https://www.nevadacountyarts.org/`
2. Claude Design handoff: `/Users/ender/code/Arts Council/claudedesign-handoff`
3. V1 Discovery Map brief and decision log

The OpenDesign first pass is a moodboard only. It is not a token source.

## Core Tokens

- Red: `#FF2E00`
- Ink: `#1A1A1A`
- Paper: `#FAF6EC`
- Soft paper: `#F5F0E8`
- Line: `#D8D0C6`
- Muted text: `#5E5852`

## Typography

Use a simple NCAC-native sans stack:

```css
font-family: "polymath-variable-2th9nk", "DM Sans", "Inter", system-ui, sans-serif;
```

Do not use serif display fonts for V1. The old cream/gold/serif atlas direction is deprecated for this map alpha.

## Interface Rules

- MapLibre is the real map surface.
- Red is structural: header rule, active mode, selected path, important pins.
- Keep panels compact and flat. No glassmorphism, scenic hero, or fake map art.
- Places are primary. Events are a light layer. Paths are fixed curated overlays.
- Image placeholders must remain visibly labeled.
