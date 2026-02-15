# 01-03 Summary: Layout Rebuild + Copy Reframing

**Plan**: 01-03-PLAN.md (Mobile responsive polish and copy reframing)
**Status**: OBSOLETE — replaced by Codex layout rebuild
**Date**: 2026-02-14

## What the Plan Called For

Mobile responsive polish at 375/390/768px and copy reframing pass on `index-maplibre-hero-intent.html`.

## What Actually Happened

Minor copy changes were applied to WIP files (title, subtitle, filter chip labels, colophon text). But the entire plan was rendered moot when **Codex (OpenAI)** built a structural layout rebuild from scratch.

### Codex's Layout Rebuild

Codex restructured the page from the old intent-card layout to a magazine-style layout:

**Old structure:**
```
header.mast (pill-shaped glassmorphism)
section.hero-variant (intent card with discovery tabs)
section#mapSection (map + rails)
div#muse (editorial cards)
section#exploreSection (directory)
footer.colophon
```

**Codex's structure:**
```
main.wrap (1320px grid container)
  header.mast (dark navy bar, brand + edition badge)
  section.cover-grid (cover image + TOC panel)
  section.spread#mapSection (map panel + story cards)
  section#exploreSection (directory)
  section.notes-section (3-col info grid)
  footer.colophon (simplified)
```

### Promotion to Canonical

Codex's WIP files were promoted to canonical in commit `b2d7e48`:
- `index-maplibre-hero-intent-phase1-wip.html` -> `index-maplibre-hero-intent.html`
- `index-maplibre-hero-intent-phase1-wip.css` -> `index-maplibre-hero-intent.css`
- `index-maplibre-phase1-wip.css` -> `index-maplibre.css`

### Known Issues (Post-Promotion)

1. **MAP DOES NOT RENDER** — MapLibre canvas never creates. `initMapLibre()` silently fails. This is a BLOCKER.
2. **4 missing DOM IDs** — `mapAddons`, `mapGuides`, `corridorAddon`, `experienceAddon` referenced by JS modules but absent from Codex's HTML. JS uses optional chaining so this doesn't crash, but features are broken.
3. **Mobile not tested** — Codex's layout has not been verified at 375px.
4. **Copy audit incomplete** — Some "cultural asset" language may remain.

## Execution Agent

- Copy reframing: Claude Code (minor, on WIP files)
- Layout rebuild: **Codex (OpenAI)** — built independently, not through GSD pipeline
- WIP promotion: Claude Code (file copy, commit `b2d7e48`)

## Phase 1 Completion Assessment

| Success Criteria (from ROADMAP) | Status |
|---|---|
| Single visual direction chosen and documented | DONE (magazine layout) |
| Typography/color/card styling consistent | PARTIAL (Codex CSS exists, but map broken) |
| Hero reads as editorial layout | DONE (magazine structure in place) |
| Mobile functional at 375px | NOT VERIFIED |
| Copy references visitor experiences | PARTIAL (some reframing done, audit needed) |

**Phase 1 is ~60% complete.** Layout direction is locked and shipped, but the map rendering bug and missing DOM IDs mean the site is non-functional.

## Artifacts

- Canonical HTML: `website/cultural-map-redesign/index-maplibre-hero-intent.html` (Codex's version)
- Canonical hero CSS: `website/cultural-map-redesign/index-maplibre-hero-intent.css` (Codex's version)
- Canonical base CSS: `website/cultural-map-redesign/index-maplibre.css` (Codex's version)
- Backups: `*.BACKUP-pre-phase1.*` files
- Design source: `website/cultural-map-redesign/mockups/phase1-landscape-mag-overhaul.html`
- Handoff doc: `HANDOFF-phase1-rebuild.md`
- Reconciliation doc: `01-RECONCILIATION.md`
