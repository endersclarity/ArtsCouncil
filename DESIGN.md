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

Draft 2 uses six generated editorial-abstraction placeholders:

- Gallery / Studio
- Performance / Event Venue
- Historic Place
- Public Art
- Maker / Shop
- Food / Stay / Gathering Place

Use placeholders when imagery is missing or weak. Weak imagery includes watercolor/category art, logos/brand marks, broken or non-image-looking URLs, and anything that does not read as place proof. The card label is only `Placeholder image`; specific weakness reasons stay in data/gap docs.

## Markers

Markers communicate layer and priority, not full category taxonomy.

- Place: restrained ink/neutral dot.
- Featured or MUSE: NCAC red emphasis.
- Selected place: ringed active state.
- Event: red dot with subtle halo, visible in Events mode.
- Path stop: numbered marker with subtle active/pulse treatment.
- Cluster: paper fill, red stroke, ink count.

Do not use category icon soup, category rainbow markers, or a category legend. Keep taxonomy in filters and selected cards.

## Paths

Paths are curated stop sequences, not turn-by-turn route geometry. Emphasize numbered stops, the stop list, and active marker treatment. Avoid a heavy route line; use only a faint helper connector if visual QA shows the sequence is unclear.

## Draft 2 Tooling

Draft 2 should be implemented manually in the existing MapLibre app. Do not use OpenDesign or Claude Design for this draft. Use image generation only for the six labeled editorial-abstraction placeholders, and use impeccable as QA/review guardrails.

## Motion

Use restrained map movement only: fly-to, fit-bounds, and hover/click feedback. No decorative animation.
