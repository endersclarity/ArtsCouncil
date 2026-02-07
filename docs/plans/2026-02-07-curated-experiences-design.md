# Curated Experiences Layer - Design Document

**Date:** 2026-02-07
**Status:** Approved
**Project:** Nevada County Arts Council Cultural Asset Map

## Summary

Add a "Curated Experiences" system to the existing cultural asset map. Experiences are themed overlays that highlight subsets of the 687 assets with connecting routes, narrative text, and optional visual theme switching. The first experience is a MUSE-magazine-inspired "Cultural Corridors" overlay based on the Arts Council's published corridor content (Highways 40, 20, 49).

## Key Decisions

- **No framework.** Stays vanilla HTML/CSS/JS + Leaflet. No React, no Next.js, no build system.
- **Dim + Highlight** map behavior when an experience is active (not progressive reveal).
- **Theme switching** per experience - the MUSE corridor gets its own visual mode that transforms the entire UI and basemap.
- **Two phases:** Leaflet version ships first, then a MapLibre GL JS prototype for comparison.
- **YAGNI.** No individual asset pages, no CMS, no database. JSON files, static site, Vercel deploy.

## Data Model

### experiences.json

```json
[
  {
    "slug": "gold-rush-heritage",
    "title": "Gold Rush Heritage Trail",
    "subtitle": "From Empire Mine to Malakoff Diggins",
    "description": "Follow the story of gold through Nevada County. From the deepest mines to the largest hydraulic diggings, each stop connects to the next through 170 years of history.",
    "color": "#c8943e",
    "theme": {
      "basemap": "terrain",
      "accent": "#2a8c8c",
      "accentSecondary": "#b85c38",
      "accentTertiary": "#7a9e7e",
      "background": "#f2ece4",
      "text": "#2c2c2c",
      "dimmedMarker": "#c5bdb0",
      "routeColor": "#b85c38",
      "vibe": "muse"
    },
    "stops": [
      {
        "asset": "Empire Mine",
        "order": 1,
        "note": "One of the oldest, deepest, richest gold mines in California",
        "connector": "The mine's superintendent needed a home befitting the operation's grandeur..."
      },
      {
        "asset": "North Star House",
        "order": 2,
        "note": "1905 mansion designed by Julia Morgan for mine superintendent A.D. Foote",
        "connector": "Foote's greatest engineering feat wasn't the house - it was the powerhouse below..."
      },
      {
        "asset": "North Star Mine Powerhouse",
        "order": 3,
        "note": "World's largest Pelton wheel, 30 feet in diameter, built 1895",
        "connector": "The Pelton wheel was invented just up the road..."
      },
      {
        "asset": "Miners Foundry",
        "order": 4,
        "note": "Founded 1856, where the Pelton waterwheel was developed and manufactured in 1878",
        "connector": "Next door, the oldest theatre on the West Coast..."
      },
      {
        "asset": "Nevada Theatre",
        "order": 5,
        "note": "Opened September 11, 1865. Mark Twain and Jack London performed here.",
        "connector": "West of the Gold Country towns, a republic once stood..."
      },
      {
        "asset": "Rough and Ready",
        "order": 6,
        "note": "Seceded from the United States in 1850 to form the Great Republic",
        "connector": "North into the Ridge, miners built a school for their children..."
      },
      {
        "asset": "North Columbia Schoolhouse",
        "order": 7,
        "note": "1875 schoolhouse, now the creative heart of the San Juan Ridge",
        "connector": "Further into the ridge, the scars of ambition..."
      },
      {
        "asset": "Malakoff Diggins",
        "order": 8,
        "note": "World's largest hydraulic gold mining operation. Led to one of America's first environmental laws."
      }
    ]
  }
]
```

Stops reference assets by name from `data.json`. Asset coordinates are resolved at runtime via name matching. The `connector` field is narrative text displayed between stops in the info panel.

Additional experiences to author:
- **Highway 40: Lincoln Highway** (from MUSE article - Donner Summit petroglyphs, Van Norden Meadow, Clair Tappaan Lodge, Rainbow Lodge, 20 Mile Museum)
- **Highway 20: Wagon Trail to Modern Artery** (Washington Hotel, Little Town of Washington, Rough and Ready)
- **Highway 49: Golden Chain** (Empire Mine, San Juan Ridge, North Columbia Schoolhouse, Sierra Storytelling Festival)
- **Poetry & Performance Circuit** (Nevada Theatre, Miners Foundry, North Star House, SPF Fringe venues)

Experiences without a `theme` block use the default dim+highlight on the existing dark editorial design.

## UI: Experience Selector

Horizontal row of styled cards above the map, one per experience. Each card shows:
- Experience title
- Stop count
- Accent color stripe/indicator

**Interaction:**
- Click to activate (dim+highlight + theme transition)
- Click again or "X" to deactivate (return to default)
- Click a different experience to swap directly
- Category filter pills still work independently (two filter dimensions)

## Map Behavior: Dim + Highlight

When an experience is active:
1. All 687 markers dim to ~15% opacity
2. Experience stops light up with numbered badges in the experience accent color
3. Dashed route line connects stops in order
4. Route line has a subtle glow/shadow underneath
5. Info panel appears with experience description and scrollable stop list with connector narrative

When deactivated:
- All markers return to normal opacity
- Route line and numbered badges removed
- Info panel dismissed

## Theme Switching

Experiences with a `theme` block trigger a full visual mode transition (~600ms CSS transition):

1. **CSS custom properties swap** on `:root` - accent colors, background, text color
2. **Basemap crossfade** - dark CartoDB fades out, themed basemap fades in (two tile layers with opacity transition)
3. **UI chrome inverts** - header, panels, pills shift from dark-on-light to light-on-dark (or vice versa)
4. **Marker restyling** - dimmed markers use the theme's `dimmedMarker` color

### MUSE Theme (Cultural Corridors)

Pulled from the Arts Council's MUSE magazine (Issue 3, 2026):

| Property | Value | Source |
|----------|-------|--------|
| Primary accent | `#2a8c8c` (teal) | MUSE header blocks |
| Secondary accent | `#b85c38` (burnt rust) | Illustrated mountain tones |
| Tertiary accent | `#7a9e7e` (sage green) | Illustrated map background |
| Background | `#f2ece4` (warm cream) | MUSE page backgrounds |
| Text | `#2c2c2c` (dark gray) | MUSE body text |
| Route line | `#b85c38` (rust) | Mountain illustration palette |
| Dimmed markers | `#c5bdb0` (warm gray) | Derived |
| Basemap | CartoDB Positron or Stamen Terrain | Light/warm to match MUSE feel |

Typography stays the same (Playfair Display + DM Sans) in both modes.

## Implementation Phases

### Phase 1: Leaflet Version (Ship First)

Build directly into the existing `index.html`. No new files except `experiences.json`.

1. Create `experiences.json` with Gold Rush Heritage Trail
2. Add experience selector UI row
3. Implement dim+highlight (marker opacity toggling)
4. Implement theme switching (CSS custom property swap + basemap layer crossfade)
5. Build MUSE theme
6. Add route line with dash animation
7. Add numbered stop markers with tooltips
8. Add info panel with narrative connector text
9. Author additional experiences (Highway 40, 20, 49, Poetry Trail)
10. Deploy to Vercel

### Phase 2: MapLibre GL JS Prototype (Compare)

Separate HTML file for side-by-side comparison.

1. Duplicate page as MapLibre variant
2. Port markers, filters, experience system to MapLibre API
3. Add 3D terrain via MapTiler raster-dem source
4. Design custom vector tile basemap style for MUSE theme
5. Add cinematic camera (flyTo with pitch/bearing between stops)
6. Add WebGL animated route drawing
7. Add GSAP for UI transition animations
8. Deploy as separate URL

### Libraries

**Phase 1 (Leaflet):**
- Leaflet 1.9.4 (already included, CDN)
- No new dependencies

**Phase 2 (MapLibre):**
- MapLibre GL JS (CDN)
- MapTiler free tier (terrain data + vector tiles, 100k loads/month)
- GSAP (CDN, for UI animations)

## Design Reference

The MUSE visual identity comes from:
- MUSE '26 Issue 03, pages 12-13: Cultural Corridor illustrated map by Milada Belohlavek and Ron Pitcher
- MUSE '26 Issue 03, pages 44-45: "Our Cultural Corridors" article by Jesse Locks
- Teal header blocks, warm earth tones, illustrated vintage Americana, light/airy backgrounds

The existing editorial design (cream/ink/gold, dark CartoDB basemap) is the default. MUSE theme activates as a corridor-specific visual mode.

## Context

This project supports Kaelen Jennings' volunteer work with the Nevada County Arts Council. The cultural corridor concept connects the Grass Valley-Nevada City Cultural District with the Truckee Cultural District via Highways 40, 20, and 49. The Arts Council published the corridor concept in MUSE magazine but it has low awareness. This interactive version aims to make the corridor discoverable and shareable.

Key stakeholders:
- Eliza (Nevada County Arts Council)
- Diana/Gianna (Arts Council staff, created MUSE corridor content)
- North Star Historic Conservancy (appears in 4 of 10 data layers)
