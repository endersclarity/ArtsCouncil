# Neumorphism Variant

**File:** `index-neumorphism.html`
**Source:** `index-maplibre.html`
**Created:** 2026-02-07

## Design Philosophy

This variant applies **neumorphism** (soft UI) design principles to the Nevada County Cultural Asset Map. Neumorphism creates a soft, tactile interface where elements appear to emerge from or sink into a single-color background.

## Key Characteristics

### Colors
- **Background:** `#e0e5ec` (soft gray)
- **Shadow Light:** `rgba(255,255,255,0.7)` (white highlight)
- **Shadow Dark:** `rgba(0,0,0,0.15)` (soft shadow)
- **Muted accents:** Desaturated category colors

### Shadow Effects
- **Raised:** `6px 6px 12px dark, -6px -6px 12px light`
- **Inset:** `inset 3px 3px 6px dark, inset -3px -3px 6px light`
- **Soft:** `4px 4px 8px dark, -4px -4px 8px light`

### Elements Transformed
1. **Cards** — Neumorphic raised effect with rounded corners
2. **Buttons** — Soft raised state, inset when pressed/active
3. **Input fields** — Inset neumorphic appearance
4. **Icons** — Circular raised elements
5. **Thumbnails** — Circular with soft shadow
6. **Detail panel** — Soft raised panel with dual shadows
7. **Filter pills** — Raised by default, inset when active
8. **Experience cards** — Soft raised, inset on activation

## Interaction States

- **Hover:** Elements lift slightly with enhanced shadow
- **Active/Pressed:** Elements sink inward with inset shadow
- **Focus:** Deeper inset shadow for inputs

## Functional Notes

- All data loading (`data.json`, `image_data.json`) works identically to source
- Map rendering (MapLibre GL JS) unchanged
- Category filtering, experiences, and interactions fully functional
- GSAP animations preserved
- Responsive design maintained

## Usage

Open `index-neumorphism.html` in a browser. All functionality from the MapLibre variant is preserved with a soft, tactile visual aesthetic.

## Comparison

| Aspect | Original (MapLibre) | Neumorphism |
|--------|---------------------|-------------|
| Background | Cream/parchment (#f5f0e8) | Soft gray (#e0e5ec) |
| Borders | Thin lines, contrasting | None (shadows only) |
| Shadows | Standard drop shadows | Dual-directional neumorphic |
| Button states | Color change | Raise/inset depth |
| Visual tone | Editorial/magazine | Tactile/soft UI |
| Contrast | High | Low/soft |

## Browser Support

Same as MapLibre variant. Requires modern browser with CSS custom properties and box-shadow support.
