# Redesign brief for Open Design's agent

## What this folder is
This is the **real, live Nevada County Cultural Map** (V1 Discovery Map) — the actual production
files, not a mock:
- `index.html`, `styles.css`, `app.js`, `review-state.js` — the live app (vanilla JS + MapLibre GL).
- `NCAC-V1-BRAND.md` — the **canonical brand guide**. This is the source of truth. Obey it exactly.

## Your task
Redesign the **visual layer only** of this app so it strictly expresses the NCAC brand defined in
`NCAC-V1-BRAND.md`. Produce a restyled `index.html` + `styles.css` (and HTML-string templates in
`app.js` if needed). **Do not change data loading, map logic, or state behavior** — only the look.

## Hard brand rules (from NCAC-V1-BRAND.md — do not deviate)
- **One accent: NCAC red `#FF2E00`.** Used structurally (framing, active/primary states, primary
  markers), never as decoration. Everything else is ink `#1A1A1A`, paper `#FAF6EC`, soft `#F5F0E8`,
  line `#D8D0C6`, muted `#5E5852`, white.
- **Typeface: Polymath** via the existing Typekit kit (`polymath-variable-2th9nk`). No serifs, no
  Playfair. Bold, confident, 2–3 sizes per surface with big size/weight jumps — hierarchy by
  weight + grid, not by many sizes.
- **The red Framing Device** is the signature: a red rectangular frame around ONE hero/signature
  surface (e.g. the header typemark block and at most one featured surface). Do not box everything.
- **Brand name lockup:** "Nevada County / Arts & Culture" as a red field with knockout white type.
- **Secondary colors (blue/green/teal/pink)** only as full-bleed poster fields, NEVER as UI chrome,
  buttons, tabs, or category colors.
- **Map markers:** monochrome-leaning. Red = active/selected/featured (MUSE picks). Ordinary places
  are quiet ink dots. Hierarchy by size + zoom, NOT by hue. No rainbow categories.
- Strict grid, generous whitespace, high contrast.

## App structure to preserve (redesign, don't remove)
- Header: brand lockup + nav (MUSE Magazine / Culture Forward / Cultural Asset Map) + "Public beta".
- Control panel: mode tabs (Places / Events / Paths), outing-type filter chips (Historic Places,
  Outdoors, Eat Drink & Stay, Galleries & Studios, See a Show, Shops & Makers), search, places list.
- Detail card for a selected place.
- Map legend.

## Engineering invariants (so you don't silently break the live map)
- MapLibre silently drops a layer on an invalid paint expression; `zoom` may only be a top-level
  input to `step`/`interpolate` (never nested in `case`).
- This is the visual layer — keep all `data/*.json` fetches, marker layer ids, and mode state intact.

Deliver the redesigned files in this project so they can be previewed.
