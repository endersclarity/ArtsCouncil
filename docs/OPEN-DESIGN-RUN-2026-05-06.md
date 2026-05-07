# OpenDesign Run: NCAC V1 Discovery Map Directions

Status: completed draft
Date: 2026-05-06
Tool path: OpenDesign `0.3.0`
Agent: Claude Code via OpenDesign
Skill: `web-prototype`
Fidelity: high fidelity

## Output

OpenDesign project:

```text
/Users/ender/code/open-design/.od/projects/ncac-v1-od-directions-1778106900309/
```

Primary artifact:

```text
/Users/ender/code/open-design/.od/projects/ncac-v1-od-directions-1778106900309/index.html
```

Generated concept image assets:

```text
/Users/ender/code/open-design/.od/projects/ncac-v1-od-directions-1778106900309/assets/placeholder-evening-performance-concept.png
/Users/ender/code/open-design/.od/projects/ncac-v1-od-directions-1778106900309/assets/placeholder-gallery-interior-concept.png
```

Screenshots:

```text
/Users/ender/code/open-design/.od/projects/ncac-v1-od-directions-1778106900309/screenshots/red-frame-atlas-desktop-v2.png
/Users/ender/code/open-design/.od/projects/ncac-v1-od-directions-1778106900309/screenshots/quiet-cultural-layer-desktop-v2.png
/Users/ender/code/open-design/.od/projects/ncac-v1-od-directions-1778106900309/screenshots/muse-field-guide-desktop-v2.png
```

## Directions Produced

### Red Frame Atlas

Strongest brand recognition. Uses NCAC red as a literal frame around the map. Best signal: it reads as Arts Council-owned immediately. Risk: the red frame can feel heavy or municipal if the inner map language gets too GIS-like.

### Quiet Cultural Layer

Most usable and least showy. Treats the map as the page, with NCAC identity reduced to a red rule, restrained typography, and compact controls. Best signal: closest to a real product surface. Risk: may feel too generic in screenshot review unless stakeholders already trust the NCAC shell.

### MUSE Field Guide

Strongest cultural story. Keeps the map primary but adds an editorial field-guide column with a concept image, MUSE-like place copy, and a featured curated path. Best signal: shows voice and cultural authority. Risk: the column can drift toward magazine/feed territory if it grows.

## Codex Read

Best base direction: **Quiet Cultural Layer**.

Best ingredients to borrow:

- Red Frame Atlas: red as structural ownership cue.
- Quiet Cultural Layer: product usability, map dominance, control economy.
- MUSE Field Guide: place-detail card, image-as-proof, MUSE voice, path copy.

Recommended next design iteration:

Create a second OD pass or manual design pass that combines:

- Quiet Cultural Layer as the main shell.
- A smaller Red Frame Atlas ownership cue, not a full border.
- MUSE Field Guide detail card only after interaction.

## Verification Notes

- OpenDesign run completed successfully.
- Browser loaded the artifact.
- Direction switcher works.
- Screenshots captured for all three directions.
- Only browser console error observed was a local `favicon.ico` 404 from the temporary Python server.
- Placeholder imagery is visibly labeled as concept/placeholder in the MUSE direction.

## Caution

This is a design draft, not implementation code. Do not promote directly into canonical frontend without a separate implementation review.
