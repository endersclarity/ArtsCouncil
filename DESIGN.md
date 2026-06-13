# Design Context

## Source of truth

**`docs/brand/NCAC-V1-BRAND.md` is the canonical brand spec** (written page-by-page from the real
43-page NCAC Style Guide; rendered pages in `docs/brand/style-guide-pages/`). This DESIGN.md is the
map-app's working visual layer; where the two ever disagree, the brand doc wins. The shipped tokens
live in `website/.../v1-discovery-map/styles.css` `:root` — treat that block as the live token source
and keep this file's values in sync with it, not ahead of it.

Reference priority for anything not covered here: (1) `NCAC-V1-BRAND.md`, (2) the live Nevada County
Arts Council site, (3) the V1 brief / decision log. OpenDesign output is moodboard only, never a token
source.

## Visual Direction

Quiet, NCAC-native map clarity on the guide's **cool ground**: white surfaces, black text, a gray
`#F7F7F7` well, and a working map as the dominant surface. (The old warm Gold-Country cream/charcoal
system is retired — shipped 2026-06-13, cla-80.)

Red `#FF2500` carries the brand through **structure, not decoration**: it is the accent, the active /
selected / featured state, the **card frame**, and the link color. The frame is the brand's signature
device, but it lives on **cards and posters, not on the map** — the map stage stays unframed and quiet
(prototype variant B; the framed-map variant A was rejected as too loud). Color beyond red enters only
through key art and the gradient sprays.

This should feel like an NCAC-native map tool, not a campaign landing page or magazine feed.

## Core Tokens

Live source: `styles.css` `:root`. Current shipped values:

- Red (Nevada County Red): `#FF2500` — accent, frame, links, active states
- Ink (all text): `#000000`; soft ink: `#555555`
- Paper / surface / panel: `#FFFFFF`
- Well (recessed fields, chip wells, placeholders): `#F7F7F7`
- Line: `#E4E4E4`; strong line: `#000000`
- Quiet map field: `#EEF0F2`

### Secondary palette — gradient sprays only

Blue `#109AFF`, green `#00CD2D`, yellow `#FFCC00`, orange `#FF7705`, pink `#FF0090`. These are **not UI
colors**. They are the source colors for the gradient sprays that fill imageless campaign/event cards
when no key art exists (NCAC-V1-BRAND.md p.13). Real photos replace the spray when available. Never use
them for buttons, tabs, chart series, or category chrome — the functional system is red/black/white/gray.

## Typography

```css
font-family: "polymath-variable-2th9nk", "DM Sans", "Inter", system-ui, sans-serif;
```

Polymath is the brand face (self-hosted woff2). Large headlines use the Display cut; subheads and body
use the text cut. Two to three sizes per surface, hierarchy by size-jump + weight. No serif display
fonts; no all-caps (use bold or a size step); italics only for major works. Avoid Playfair, Iowan,
Charter, Georgia, and all old Gold Country atlas styling.

## Layout

- MapLibre map dominates the desktop and mobile first view.
- Header is compact and NCAC-native; a thin red frame strip may run along the top edge.
- Control panel is compact, flat, functional.
- Mobile keeps the map visible above the docked panel.
- The frame wraps **cards and posters**, never the map. Avoid cards-inside-cards and decorative
  wrappers around the map itself.
- Align card content to a grid; key images get rounded corners.

## Components

- Mode tabs: `Places`, `Events`, `Paths`.
- Filter chips: visitor-intent labels backed by source categories.
- **Card = Poster.** Rail and detail cards follow the guide's poster anatomy: a red program tab knocked
  into the card's top edge (names the program/category), a large title, a rounded-corner key image, and
  a presenter/meta bar. *(Shipped: cool palette, red frame, gradient-spray fills, red links. Remaining
  polish, not yet started: the top-edge program tab and insetting the rail image fully inside its frame
  — see NCAC-V1-BRAND.md deltas.)*
- Detail card: image proof, name, category/city, compact description, one practical action, related
  events where available. Featured anchors may add one short editorial hook.
- First-load card: highest-priority featured anchor with image, hook, and `View on map`. Don't fall back
  to a generic instructional empty state while anchor data exists.
- Path view: numbered markers, clickable stop list, anchor icons/hooks, faint helper connector only.
- Discovery Rail (shipped, merged to master): bottom horizontal snap-scroll card rail on first load
  (events, sampler places, one MUSE story card, one path card). Rail Follow eases the camera on
  scroll-settle (no zoom change) and highlights the marker; full fly-and-zoom only on card tap. Rail
  chips (`Everything` / `Events` / `Places`) filter the stream. While the rail shows, the left panel
  collapses to a compact search/filter toolbar; search or filtering expands the full browser and retires
  the rail. Mobile uses the rail as the bottom-drawer card surface.
- MUSE surfaces: story-card kicker "In the pages of MUSE Magazine"; "MUSE Picks only" filter in Places
  mode (AND-composed with outing-type chips); directory badge "Listed in the MUSE {year} directory" +
  the directory's category label, deep-linking to the Heyzine page. MUSE naming here is pre-Council —
  treat the labels as proposals, not settled brand.

## Imagery

Real place/event photos are preferred and read as proof. Events now carry real Trumba flyers where the
feed provides them (cla-81); the remaining imageless events (Crazy Horse, Golden Era) and any photo-less
place fall back to a **brand gradient spray** (secondary palette, black knockout type), not a flat field
and not watercolor/logo art. Weak imagery (watercolor/category art, logos, broken or non-image URLs,
anything that isn't place proof) is treated as missing. Any visible placeholder is labeled only
`Placeholder image`; specific weakness reasons stay in data/gap docs.

## Markers

Markers communicate layer and priority, not full category taxonomy.

- Place: restrained ink/neutral dot.
- Featured anchor: restrained red ring plus compact icon label.
- Non-anchor place: no marker upgrade unless separately selected by an approved V1 rule.
- Selected place: ringed red active state.
- Event: red dot with subtle halo, visible in Events mode.
- Path stop: numbered marker with subtle active/pulse treatment.
- Cluster: white fill, muted neutral stroke, ink count; never lets clusters dominate in red.

No category icon soup, no rainbow markers, no category legend. Icons are only for featured anchors and
path stops. Keep taxonomy in filters and selected cards. (Red on markers is the owner's pick and stays,
cla-76; marker semantics are separate from card/frame decoration.)

## Paths

Curated stop sequences, not turn-by-turn geometry. Emphasize numbered stops, the clickable stop list,
and active marker treatment. Avoid a heavy route line; use only a faint helper connector so the sequence
doesn't read like route math.

## Motion

Tokens in `styles.css` `:root`: `--motion-fast 120ms`, `--motion-base 200ms`, `--ease-out` (ease-out
quint, confident deceleration, no bounce). Map movement stays restrained: fly-to, fit-bounds, hover /
click feedback, and the Rail Follow ease. No decorative animation. Every animated property has a
`prefers-reduced-motion: reduce` fallback.

## Demo Polish Rules

- Demo-critical records are the path stops and likely first review clicks. Clean their category,
  description, website, and image state before broad data polish.
- Cards read as product moments, not data QA: proof and desire first; image weakness is logged in data
  docs, not explained in the UI.
- Red is reserved for ownership, active modes, selected/featured places, events, path stops, card
  frames, and links. Don't let clusters dominate the map in red, and don't sprinkle red decoratively on
  the map surface.
