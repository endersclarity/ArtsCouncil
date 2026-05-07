# OpenDesign Packet: NCAC V1 Discovery Map

Status: draft for first OpenDesign pass
Date: 2026-05-06
Use with: Prototype / web-prototype / High fidelity / Claude Code

## Prompt To Use

Design three high-fidelity first-screen visual directions for the Nevada County Arts Council V1 Discovery Map.

This is an approval-stage cultural discovery map prototype, not a public launch and not a full Arts Hub. The first screen should make Arts Council stakeholders feel: "This is ours. This is culturally credible. Keep going."

The product should feel like the Nevada County Arts Council's cultural layer made visible: map-first, editorial, local, restrained, useful, and ownable.

## Required Product Shape

Create three distinct first-screen directions for the same product:

1. **Red Frame Atlas**
   - Map dominates the viewport.
   - NCAC red frame or red edge treatment creates ownership.
   - Compact control panel floats or docks without stealing the page.
   - Best for: strongest brand recognition.

2. **Quiet Cultural Layer**
   - Map is flatter, calmer, almost publication-like.
   - White/charcoal UI with red used sparingly for active state and Arts Council identity.
   - Counts, modes, and hints are subtle.
   - Best for: most usable and least showy.

3. **MUSE Field Guide**
   - Map remains primary, but editorial cues are warmer.
   - Uses short MUSE-like copy, featured hint, and image-backed place proof.
   - Still not feed-first, not a magazine homepage.
   - Best for: strongest cultural story.

Each direction should show only the first screen. Do not build a full app.

## Screen Requirements

The screen must include:

- Large interactive-map area as the dominant visual object.
- Nevada County Arts Council / Grass Valley-Nevada City Cultural District identity.
- Mode controls: `Places`, `Events`, `Paths`.
- Counts for each mode.
- A compact featured hint, such as "Start with Gallery & Studio Day" or "Tonight: 6 cultural events nearby."
- A visible but compact filter affordance.
- A sample selected-place preview or collapsed detail teaser, not a giant sidebar.
- Clear evidence that Places are primary, Events are secondary, and Paths are curated mapped tours.

## Content Model

Use realistic sample content:

- Places: galleries, studios, public art, performance spaces, historic places, artisan food/drink/stay.
- Events: light upcoming layer only, not a full event calendar.
- Paths: curated fixed overlays, not a dynamic trip planner.

Use these provisional path names:

- Living Like a Local
- Gallery & Studio Day
- Evening Arts Night

Use visitor-intent labels backed by categories:

- See a Show
- Galleries & Studios
- Historic Places
- Public Art
- Music
- Family-Friendly

## Brand And Visual Constraints

Use the current NCAC/live-site direction as source of truth:

- Red, white, charcoal hierarchy.
- Polymath-like typography: sturdy, editorial, legible, Arts Council-native.
- Strong typemark discipline.
- Grid/framing principles.
- Lower visual complexity.
- Two to three type sizes, not many competing styles.
- Single accent color, with red doing real work.

Do not use the older cream/gold/Playfair/DM Sans "Gold Country atlas" direction as the main style. That is prior work, not current source of truth.

Do not imitate generic tourism-board styling.

Do not use default AI purple/blue gradients, bokeh blobs, decorative orbs, glassmorphism, fake SaaS cards, or stock-photo polish.

## Imagery

Images are essential, but they must act as place proof.

Use real-looking cultural-place imagery if needed:

- venue facade
- gallery interior
- stage/performance space
- mural/public art
- historic downtown street
- studio/workshop detail

If an image is not real, label it clearly as a placeholder. Do not pretend generated images are actual NCAC place documentation.

## Map Feel

The basemap should feel quiet and editorial:

- muted land and road palette
- clear cultural markers
- clusters/counts where useful
- no generic GIS gray interface
- no scenic terrain spectacle as the main point

The map is the product argument. The UI should not bury it.

## Copy Voice

Voice should be MUSE-concise:

- warm
- specific
- place-aware
- practical
- no hype
- no institutional jargon

Avoid:

- "platform"
- "Arts Hub"
- "AI trip planner"
- "submit your listing"
- "correct this data"
- "tourism ecosystem"
- "unlock experiences"
- "seamless journey"

## Success Rubric

A good first pass:

- Feels native to NCAC before any text explains it.
- Makes the map dominant in the first three seconds.
- Suggests cultural authority without looking municipal.
- Shows enough places/events/paths to feel alive.
- Keeps the detail card compact.
- Makes stakeholders want to react to the direction, not debate a platform.

A bad first pass:

- Looks like a generic map dashboard.
- Feels like a tourism calendar.
- Makes events the main product.
- Uses old Arts Hub language.
- Uses fake scenic "wow" instead of cultural specificity.
- Makes red decorative instead of structural.
- Overloads the first screen with panels, cards, and explanations.

## Output Request

Return three named high-fidelity first-screen HTML prototypes or variants.

For each variant, include:

- one-sentence design thesis
- the HTML/CSS artifact
- a short "why this works" note
- one known risk

Do not create implementation tickets.
Do not write a PRD.
Do not expand scope beyond first-screen visual directions.
