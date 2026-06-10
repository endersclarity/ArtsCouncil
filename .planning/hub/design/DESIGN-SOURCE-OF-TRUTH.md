# Design Source of Truth

**This folder answers one question: what should the Arts Hub look like?**

## The Authoritative File

`brand-mockup-final.html` — Open this in a browser to see the brand-correct website design. All design decisions for the hub should visually conform to this reference.

To view: serve this folder locally (`npx serve .` or `python -m http.server`) and open in browser. The poster images (`poster-*.jpeg`) must be in the same directory.

## What This Defines

- **Color palette:** Scarlet `#FF2400` + Charcoal `#3F3F3F` on white. No other UI colors.
- **Typography:** Polymath (`polymath-variable-2th9nk`), the official brand font from Diana's brand guide. It loads via the Typekit kit in `website/cultural-map-redesign-stitch-lab/v1-discovery-map/index.html`; DM Sans is the fallback. Decision 2026-06-09: Polymath everywhere. Playfair Display and Nunito were stand-ins in older mockups and are retired.
- **The Gallery Frame:** 3px solid `#FF2400`, sharp corners (radius: 0), with Program Label Bar at top. This is the core brand device.
- **Component patterns:** Nav bar, event cards, section labels, CTAs, district links, program grid, calendar, newsletter, footer.
- **Spacing rhythm:** 8px base unit. Generous white space throughout.
- **Interaction patterns:** Color transitions on hover (200ms ease), subtle card lift (3px translateY).

## What This Does NOT Define

- What sections/pages the hub will actually have (that's the PRD)
- What data feeds the components (Trumba, cultural asset map, Muse directory)
- User flows, navigation structure, or feature scope
- Responsive/mobile behavior (to be designed during build)

## Supporting Files

| File | Purpose |
|------|---------|
| `brand-mockup-final.html` | THE reference mockup — open in browser |
| `mockup-final-v2.png` | Full-page screenshot of the mockup |
| `mockup-final-viewport.png` | Above-the-fold viewport screenshot |
| `ref-homepage-full.jpeg` | Original brand guide website at full length |
| `poster-sunset.jpeg` | Extracted "Sunrise to Sunset" artwork |
| `poster-meetup.jpeg` | Extracted "Creatives Meetup" poster |
| `poster-mobilize.jpeg` | Extracted "Mobilize" poster |
| `poster-capitol.jpeg` | Extracted "Creative Capitol" poster |

## Upstream Sources

- **Brand guide PDF:** `docs/NCAC_brand-compressed.pdf` (Kevin Bird, 31 pages)
- **Brand analysis:** `.planning/hub/context/brand-guide-analysis.md`
- **Replication prompt:** `plans/04-final-prompt.md` (full build spec with design tokens)
- **Site DNA:** `plans/01-site-dna.md` (forensic audit of the brand mockup)
