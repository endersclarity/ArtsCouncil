# Description sweep — data flags (not fixed by the sweep)

Surfaced while rewriting boilerplate descriptions. The sweep only touches
`description` + `descriptionSource`; everything here needs a separate data pass.

## From the pilot (2026-07-02)

- **south-pine-cafe-grass-valley** — southpinecafe.com DNS-dead, record already `websiteStatus: dead`. Shipped copy states only record facts + MUSE join, but verify the cafe still operates.
- **full-circle-press-grass-valley** — record says Grass Valley; full-circle-press.com says Nevada City. Shipped copy names no city; resolve the city field.
- **athena-grass-valley** — zero web presence on record; candidate for a local-knowledge pass.
