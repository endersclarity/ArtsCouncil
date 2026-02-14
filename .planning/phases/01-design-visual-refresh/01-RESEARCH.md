# Phase 1: Design & Visual Refresh - Research

**Researched:** 2026-02-14
**Domain:** CSS design system, typography, color palette, card components, responsive layout, editorial copy
**Confidence:** HIGH

## Summary

Phase 1 transforms the existing site from a "Heritage Neumorphism" aesthetic (cream/gold watercolor with inset shadows and soft embossed surfaces) into a MUSE-inspired travel publication look: clean, bold, contemporary, bright editorial. The current codebase is a 3,900-line CSS file (`index-maplibre.css`) plus a 750-line variant CSS (`index-maplibre-hero-intent.css`) with 36+ JS modules. There is no build system -- all CSS is hand-authored.

The key challenge is that the existing design system was built around neumorphic shadows (`--shadow-raised`, `--shadow-inset`, `--shadow-soft`) and a muted cream/gold/ink palette that reads as "vintage civic" rather than "contemporary travel magazine." Diana Arbex explicitly asked for something that reflects MUSE magazine -- typographical, bold, contemporary, bright. The brand guide documents an extensive visual system that needs to be updated, not thrown away.

**Primary recommendation:** Establish new CSS custom properties (design tokens) at `:root` level for the refreshed palette and shadow language, then cascade changes through each section. Do NOT rewrite the CSS from scratch -- the responsive breakpoints, grid layouts, and module interactions are battle-tested. Replace the neumorphic shadow vocabulary with flat/editorial shadows, update the color palette to brighter tones, and tighten typography spacing. Work section-by-section: tokens first, then hero, then cards, then directory, then mobile, then copy.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Custom Properties | Native | Design tokens (colors, fonts, shadows, spacing) | Already in use; zero-dependency approach to theming |
| Google Fonts | CDN | Playfair Display, DM Sans, JetBrains Mono | Already loaded; the typography triad is confirmed by stakeholder |
| GSAP 3.12 | CDN | Scroll reveals, panel animations | Already in use; needed for `.reveal` class transitions |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| MapLibre GL JS | 4.5.0 | Map rendering | Already loaded; CSS overrides for map controls need updating |
| None additional needed | - | This phase is pure CSS + copy changes | No new dependencies required |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-authored CSS tokens | Open Props / design token library | Adds a dependency; overkill for a single-site project |
| Inline responsive breakpoints | Container queries | Browser support is good now, but existing breakpoints work; not worth the migration risk |

**Installation:**
```bash
# No installation needed. Pure CSS/HTML/copy editing.
```

## Architecture Patterns

### Current CSS Architecture

```
website/cultural-map-redesign/
├── index-maplibre.css              # 3,903 lines - master stylesheet
├── index-maplibre-hero-intent.css  # 750 lines - hero variant (imports master)
├── index-maplibre-hero-intent.html # Flagship HTML (uses hero-intent CSS)
└── ~26 variant CSS/HTML files      # Design experiments (can be ignored)
```

### Pattern 1: Design Token Cascade

**What:** All visual properties flow from CSS custom properties defined at `:root`. Changes at token level cascade everywhere.

**When to use:** This is how the codebase already works. Updating `--ink`, `--cream`, `--gold`, shadow variables, etc. at `:root` propagates through all components.

**Current tokens (that need updating):**
```css
:root {
  /* Background system (neumorphic - needs replacing) */
  --neuro-bg: #F4EFE6;
  --neuro-light: rgba(255,250,240,0.8);
  --neuro-dark: rgba(80,60,40,0.2);

  /* Core palette (muted heritage - needs brightening) */
  --ink: #4A6B7C;        /* Currently slate navy - should be near-black */
  --cream: #F4EFE6;      /* Warm parchment - should be cleaner white */
  --gold: #D4AF37;       /* Rich gold - keep or brighten */
  --rust: #B85C38;       /* Warm accent - evaluate */

  /* Shadow system (neumorphic - needs replacing) */
  --shadow-raised: 6px 6px 12px rgba(80,60,40,0.2), -6px -6px 12px rgba(255,250,240,0.8);
  --shadow-inset: inset 3px 3px 6px rgba(80,60,40,0.2), inset -3px -3px 6px rgba(255,250,240,0.8);
  --shadow-soft: 4px 4px 8px rgba(80,60,40,0.15), -4px -4px 8px rgba(255,250,240,0.7);

  /* Typography (confirmed by stakeholder - keep) */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'DM Sans', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Category colors (in CATS object in JS + CSS vars) */
  --cat-landmarks: #A0522D;   /* ... etc, 10 total */
}
```

### Pattern 2: Section-by-Section Refactoring

**What:** The CSS is organized in clear sections with comment headers. Work through each section sequentially rather than doing a global find-replace.

**Section order in CSS file:**
1. `:root` tokens (lines 1-41) -- UPDATE FIRST
2. Body/HTML basics (lines 42-53)
3. Hero section (lines 54-154) -- hero-intent.css overrides this
4. Section intro (lines 156-278)
5. Category cards (lines 279-402)
6. Map section + controls (lines 404-1012)
7. Tooltips (lines 1014-1134)
8. Detail panel (lines 1136-1472)
9. MUSE editorial cards (lines 1474-1685)
10. MUSE showcase (lines 1687-2176) -- dynamic cards + reader panel
11. Explore list (lines 2178-2574)
12. Colophon (lines 2576-2648)
13. Experience selector (lines 2650-3200)
14. Corridor panel (lines 3209-3660)
15. Animations (lines 3715-3733)
16. Responsive breakpoints (lines 3735-3903)

### Pattern 3: Dual Source of Truth for Category Colors

**What:** Category colors are defined BOTH in CSS custom properties (`--cat-landmarks`, etc.) AND in JavaScript (`CATS` object in `index-maplibre-config.js`). Many components set colors via inline `style` attributes from JS.

**Critical implication:** Changing category colors requires updating BOTH:
1. `index-maplibre.css` `:root` block (CSS custom properties)
2. `index-maplibre-config.js` `CATS` object (JS hex values)

### Anti-Patterns to Avoid

- **Full CSS rewrite:** The 3,900 lines include battle-tested responsive behavior, z-index stacking, scroll handling, and MapLibre control overrides. Rewriting risks breaking everything. Refactor in place.
- **New CSS file alongside old one:** The hero-intent variant already uses `@import url('index-maplibre.css')`. Adding a third layer of overrides creates specificity nightmares. Edit the source files directly.
- **Changing class names:** 36+ JS modules reference CSS classes by name. Renaming classes requires touching every JS file. Avoid unless absolutely necessary.
- **Removing the neumorphic shadow variables without replacing usages:** `--shadow-raised` is used in ~15 places. If you redefine the variable, all usages update. If you delete it, you get 15 broken styles.
- **Changing border-radius values ad-hoc:** The brand guide says "no border-radius anywhere" but the hero-intent variant uses `border-radius: 22px`, `999px`, `14px` extensively. The intent variant is the active design -- it already departed from the brand guide's "sharp corners" rule. Pick one approach and apply consistently.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Design tokens | Custom JSON token pipeline | CSS custom properties at `:root` | Already in place, zero tooling needed |
| Color palette generation | Manual hex picking | Start from MUSE publication color extraction | Ground palette in actual publication colors |
| Responsive breakpoints | New breakpoint system | Existing 600px/760px/900px/980px breakpoints | Already tested across all sections |
| Typography scale | New scale | Existing clamp() values with minor adjustments | clamp() already handles fluid sizing |
| Card component library | Abstracted card system | Refactor existing card CSS classes in place | Too many card variants to abstract (cat-card, explore-cat-card, intent-strip-card, muse-card, muse-story-card, event cards, etc.) |

**Key insight:** This is a CSS refactoring phase, not an architecture phase. The structure is solid. The visual vocabulary needs updating.

## Common Pitfalls

### Pitfall 1: Inconsistent Card Styling

**What goes wrong:** There are at least 8 different card component styles in the CSS: `.cat-card`, `.explore-cat-card`, `.intent-strip-card`, `.muse-card`, `.muse-story-card`, `.map-event-item`, `.detail-event-card`, `.intent-editorial-card`. Each has its own border-radius, shadow, padding, and hover behavior.

**Why it happens:** Cards were added incrementally over Phases 1-3.5 with no shared card token system.

**How to avoid:** Define a small set of card tokens (`--card-radius`, `--card-border`, `--card-shadow`, `--card-shadow-hover`, `--card-bg`) and apply them consistently. Don't try to make all cards identical -- they serve different purposes -- but their border treatment, shadow depth, and hover behavior should feel cohesive.

**Warning signs:** If you find yourself writing `border-radius: 14px` in one card and `border-radius: 10px` in another without a reason, the system is drifting.

### Pitfall 2: Shadow System Regression

**What goes wrong:** Replacing neumorphic shadows with flat shadows breaks the visual rhythm. Neumorphic shadows give elements a "pressed in" or "raised out" feel; flat shadows just create depth. The transition needs to be intentional.

**Why it happens:** `--shadow-raised`, `--shadow-inset`, and `--shadow-soft` are used as the ONLY shadow vocabulary. Every component references one of these three. Changing them changes everything simultaneously.

**How to avoid:** Redefine the three shadow variables to new editorial-appropriate values:
- `--shadow-raised` -> gentle drop shadow (cards, buttons)
- `--shadow-inset` -> removed or very subtle inner shadow (active states)
- `--shadow-soft` -> minimal shadow (decorative elements)

Test in isolation before deploying globally.

**Warning signs:** Elements looking "flat" or losing visual hierarchy after shadow changes.

### Pitfall 3: Color Contrast Failures

**What goes wrong:** Brightening the palette without checking contrast ratios. The current muted palette has carefully tuned text/background combinations. Making backgrounds whiter and accents brighter can break WCAG AA compliance.

**Why it happens:** The existing palette has `--ink: #4A6B7C` (a medium blue-gray) on `--cream: #F4EFE6` (warm parchment). That's ~4.3:1 contrast -- barely AA. If `--cream` gets lighter without `--ink` getting darker, contrast drops below 4.5:1.

**How to avoid:** When updating palette:
- New primary text color must achieve 4.5:1+ contrast on new background
- New muted text (currently `var(--slate)` / `rgba(26,22,18,0.6)`) must achieve 3:1+ on background
- Test with browser DevTools contrast checker

**Warning signs:** Text looking "washed out" on the new palette. Any rgba() color with alpha < 0.5 on a light background is suspect.

### Pitfall 4: Hero Intent CSS Override Conflicts

**What goes wrong:** `index-maplibre-hero-intent.css` imports `index-maplibre.css` and then overrides many styles. Changes to the base CSS may be invisibly overridden by the intent CSS, or conversely, changes to intent CSS may not cascade properly because the base CSS has higher specificity.

**Why it happens:** The intent variant uses `@import` at the top and then redefines styles for `.theme-intent`, `.mast-*`, `.intent-*`, and `.hero-variant-*` classes. Some overrides use `!important`.

**How to avoid:** When changing a style, check both CSS files. Search for the class name in both. The intent variant is the active production design -- make changes there first, then verify they don't conflict with base styles.

**Warning signs:** Styles that "should work" not appearing. Usually means the other CSS file has a conflicting rule.

### Pitfall 5: Mobile Breakpoint Pile-up

**What goes wrong:** There are 4 responsive breakpoints (`600px`, `760px`, `900px`, `980px`) used across both CSS files. Adding new responsive rules without checking existing ones creates conflicting styles at certain widths.

**Why it happens:** Different sections were made responsive at different times. The intent CSS adds its own `@media (max-width: 760px)` and `@media (max-width: 980px)` blocks.

**How to avoid:** Mobile pass should be a dedicated step AFTER all desktop changes are complete. Use browser DevTools at 375px (iPhone SE), 390px (iPhone 14), and 768px (iPad) to verify. Don't add new breakpoints -- use the existing four.

**Warning signs:** Layout looking fine at 375px but broken at 500px (between breakpoints).

### Pitfall 6: JS-Generated HTML Not Matching CSS Changes

**What goes wrong:** Many UI elements are generated by JavaScript at runtime (`explore-view.js`, `detail-view.js`, `events-view.js`, `catalog-view.js`, `filter-ui.js`). These JS files contain inline HTML strings with hardcoded class names and sometimes inline styles. CSS class name changes or semantic restructuring breaks JS-generated content.

**Why it happens:** The JS modules build HTML via string concatenation (template literals with embedded CSS classes and inline `style` attributes). There's no template system.

**How to avoid:**
- DO NOT rename existing CSS classes unless absolutely necessary
- If a JS module sets inline `style="color:${cfg.color}"`, CSS changes won't affect that color -- you'd need to change the JS too
- Check which JS modules generate each component before changing its CSS
- Search the entire JS codebase for the class name before modifying it

**Key JS files that generate styled HTML:**
- `index-maplibre-explore-view.js` -- explore category cards, explore list items
- `index-maplibre-detail-view.js` -- detail panel content, meta rows, hours pills
- `index-maplibre-events-view.js` -- event cards, event carousel items, event rows
- `index-maplibre-catalog-view.js` -- category grid cards (hero)
- `index-maplibre-filter-ui.js` -- filter pills, hours legend, status toggles
- `index-maplibre-experience-view.js` -- experience cards, corridor panel stops
- `index-maplibre-bindings.js` -- MUSE showcase cards, editorial rail cards

### Pitfall 7: Copy Changes Breaking Deep Links and Accessibility

**What goes wrong:** Renaming section headings or removing `aria-*` attributes during copy reframing. The hero intent HTML has carefully structured `role="tablist"`, `aria-selected`, `aria-controls`, and `aria-label` attributes. The site supports deep linking via query params.

**Why it happens:** Copy reframing (DSGN-07) touches the same HTML that has accessibility markup. Easy to accidentally remove an `id` that a deep link or `aria-controls` references.

**How to avoid:** When rewriting copy in HTML, preserve all `id`, `aria-*`, `data-*`, and `role` attributes. Only change text content, not structural attributes.

## Code Examples

### Example 1: Replacing Neumorphic Shadow System

```css
/* BEFORE (Heritage Neumorphism) */
:root {
  --shadow-raised: 6px 6px 12px rgba(80,60,40,0.2), -6px -6px 12px rgba(255,250,240,0.8);
  --shadow-inset: inset 3px 3px 6px rgba(80,60,40,0.2), inset -3px -3px 6px rgba(255,250,240,0.8);
  --shadow-soft: 4px 4px 8px rgba(80,60,40,0.15), -4px -4px 8px rgba(255,250,240,0.7);
}

/* AFTER (Editorial flat shadows) */
:root {
  --shadow-raised: 0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-inset: 0 1px 2px rgba(0,0,0,0.04) inset;
  --shadow-soft: 0 1px 4px rgba(0,0,0,0.05);
}
```

### Example 2: Palette Shift from Heritage to MUSE-Adjacent

```css
/* BEFORE (Heritage Neumorphism palette) */
:root {
  --neuro-bg: #F4EFE6;   /* warm parchment */
  --ink: #4A6B7C;         /* slate navy */
  --cream: #F4EFE6;       /* same as bg */
  --gold: #D4AF37;        /* rich gold */
  --rust: #B85C38;        /* warm rust */
}

/* AFTER (Clean editorial palette -- example direction) */
:root {
  --neuro-bg: #FAFAF8;   /* near-white, clean */
  --ink: #1a1612;         /* true dark (brand guide value) */
  --cream: #FAFAF8;       /* matches bg */
  --gold: #c8943e;        /* brand guide gold */
  --rust: #a0522d;        /* brand guide rust */
}
```

### Example 3: Card Token System

```css
/* New card tokens to apply across all card variants */
:root {
  --card-bg: rgba(255, 255, 255, 0.8);
  --card-border: 1px solid rgba(26, 22, 18, 0.08);
  --card-radius: 12px;
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --card-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.10);
  --card-transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
```

### Example 4: Updating Category Colors in Both CSS and JS

```css
/* CSS: index-maplibre.css :root block */
--cat-landmarks: #c0392b;  /* brighter red */
```

```javascript
/* JS: index-maplibre-config.js CATS object */
'Historic Landmarks': { color: '#c0392b', short: 'Landmarks', watercolor: 'landmarks' },
```

Both MUST match. The JS value is used for inline styles on dynamically generated elements.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Neumorphic shadows (raised/inset illusion) | Flat/editorial shadows with subtle depth | Neumorphism peaked ~2020-2021, now dated | Removing double-shadow neumorphism is the single biggest visual modernization |
| Warm parchment backgrounds | Clean near-white or pure white | MUSE magazine uses clean white pages | Background color change cascades through entire site |
| Muted heritage category colors | Brighter, more saturated category accents | Travel publications use bold color coding | Category colors appear on every card, pill, marker, and panel |
| Sharp corners per brand guide | Rounded corners already in hero-intent variant | The active code already departed from brand guide | Standardize on the rounded approach already in use |

**Deprecated/outdated:**
- The brand guide's "no border-radius anywhere" rule: Already violated extensively by the hero-intent variant which is the production code. The guide should be updated to match reality (rounded corners are the current direction).
- The "Heritage Neumorphism" naming: The neumorphic aesthetic is what Diana wants to move away from. The variable names `--neuro-bg`, `--neuro-light`, `--neuro-dark` should be renamed to generic names.

## Existing Design Experiments

There are 26+ variant HTML/CSS files in the redesign directory (names like `index-maplibre-monograph.html`, `index-maplibre-electric-opera.html`, `index-maplibre-brutalist-signal.html`, etc.). These are design experiments from earlier phases. They can be referenced for ideas but should NOT be used as starting points -- the hero-intent variant is the canonical production code.

## MUSE Publication Reference

Three MUSE issues are captured in `docs/publications/` with screenshots and OCR text. Key visual characteristics from MUSE that should inform the refresh:

1. **Clean white backgrounds** with generous whitespace
2. **Bold serif headlines** (similar to Playfair Display usage)
3. **Bright photography** with clean crop/bleed treatments
4. **Color used as accent, not background** -- category colors in small doses
5. **Monospace labels** for kickers and metadata (already in place with JetBrains Mono)
6. **Minimal decoration** -- no watercolor textures, no noise overlays, no neumorphic embossing

## Scope of Changes

### Files that MUST change:

| File | Change Type | Reason |
|------|-------------|--------|
| `index-maplibre.css` | Heavy edit | Design tokens, shadow system, palette, card styles, all sections |
| `index-maplibre-hero-intent.css` | Moderate edit | Hero section styling, intent card refinement |
| `index-maplibre-hero-intent.html` | Light edit | Copy reframing (DSGN-07), possible hero structure tweaks |
| `index-maplibre-config.js` | Light edit | Category color hex values in CATS object |
| `docs/brand-guide.md` | Moderate edit | Document new design direction, update color/shadow specs |

### Files that MAY need changes:

| File | Change Type | Reason |
|------|-------------|--------|
| `index-maplibre-explore-view.js` | Light edit | If explore card structure changes |
| `index-maplibre-detail-view.js` | Light edit | If detail panel styling tokens change |
| `index-maplibre-catalog-view.js` | Light edit | If category card rendering changes |
| `index-maplibre-bindings.js` | Light edit | If MUSE showcase card rendering changes |
| `index-maplibre-events-view.js` | Light edit | If event card styling changes |

### Files that should NOT change:
- All `*-model.js` files (data/state logic, not visual)
- All `*-controller.js` files (event wiring, not visual)
- `index-maplibre.js` (bootstrap, not visual)
- Data files (`data.json`, `experiences.json`, etc.)

## Copy Reframing Analysis (DSGN-07)

Current UI copy that needs reframing:

| Location | Current Copy | Problem | Direction |
|----------|-------------|---------|-----------|
| HTML `<title>` | "Cultural Asset Map" | Internal language | "Explore Nevada County" or similar |
| `.mast-name` (h1) | "Cultural Asset Map" | Government-speak | Visitor-facing name |
| `.mast-sub` | "Nevada County Arts Council" | Org name as subtitle | Could be tagline instead |
| `.hero-variant-sub` | "Explore Nevada County's cultural landscape..." | "cultural landscape" is internal | Frame around what visitors want to DO |
| Section tags | "Directory" | Generic | "Places to Explore" or "Local Directory" |
| Search placeholder | "Search" | Generic | "Search places, events..." |
| Events filter labels | "All", "Today", "Weekend", "14d" | "14d" is dev shorthand | "This Week", "This Month" or similar |
| Explore section | "Explore by Category" | Fine but generic | Could emphasize visitor intent |
| Colophon | "About This Project" | Internal project language | "About This Guide" or similar |
| Colophon | "687 cultural assets across 10 categories" | Data-speak | "687 places to discover" |
| Colophon | "Quiet Graphics" reference | Internal design history | Remove or make visitor-facing |

Copy should be reframed around: "What can I DO here?" not "What DATA exists?"

## Open Questions

1. **Product name for visitor-facing copy**
   - What we know: Diana provided placeholder titles ("The Guide to Nevada County", "Visit Nevada County", "Nevada County, Explored") but noted Eliza isn't sold on these yet
   - What's unclear: Whether the site title can change without committee approval
   - Recommendation: Use a working title like "Explore Nevada County" and flag it as placeholder. The name can be changed later without structural impact (it's just text in `<h1>` and `<title>`).

2. **Watercolor asset fate**
   - What we know: 11 watercolor illustrations exist in `img/watercolor/`, used as category icons and placeholder images. MUSE magazine does NOT use watercolors.
   - What's unclear: Whether watercolors should be kept as a nod to the 2019 vision or removed for a cleaner MUSE-adjacent look
   - Recommendation: Keep watercolors as fallback/placeholder images but reduce their prominence. They work as category icons at 32x32px. Remove them from backgrounds and decorative uses. The "quiet graphics" identity can coexist with MUSE-brightness.

3. **Hero section structure**
   - What we know: The hero-intent variant has tabs (Categories, Feature Picks, Upcoming Events, Curated Routes) in a card format. Diana wants it to look "polished and intentional."
   - What's unclear: Whether the tabbed discovery panel is the right hero structure or if a simpler editorial splash would be better
   - Recommendation: Keep the tabbed structure (it serves visitor intent well) but refine the visual treatment to feel more editorial -- larger type, cleaner card edges, more whitespace.

4. **Map container border treatment**
   - What we know: Current map has a 4px dark border with 20px border-radius and neumorphic inset shadow. This is the most neumorphic element on the page.
   - What's unclear: Whether the map should be borderless (full-bleed) or maintain a subtle frame
   - Recommendation: Reduce to 1px border or remove entirely. The map terrain already provides visual interest. A heavy frame reads as "government GIS" not "travel publication."

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis: `index-maplibre.css` (3,903 lines), `index-maplibre-hero-intent.css` (750 lines), `index-maplibre-hero-intent.html` (379 lines), `index-maplibre-config.js` (38 lines)
- `docs/brand-guide.md` -- comprehensive brand identity document (726 lines)
- Diana Arbex email preserved at `docs/correspondence/diana-arbex-email-2026-02-14.md` (cited in CLAUDE.md)
- MUSE publication OCR files in `docs/publications/`

### Secondary (MEDIUM confidence)
- Brand guide's stated direction vs. actual code implementation: the code has already diverged from the brand guide in several areas (border-radius, shadow depth, color values). The brand guide represents the Phase 3 intent; the code represents Phase 3.5 evolution.
- 26+ variant experiments provide visual direction options but none were selected as canonical

### Tertiary (LOW confidence)
- MUSE magazine visual style inferred from OCR text descriptions rather than direct visual analysis of screenshots. For color extraction, the actual MUSE page screenshots in `docs/publications/muse-issue-03-2026/` should be examined visually.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed; pure CSS/HTML/copy editing
- Architecture: HIGH - Codebase is well-structured with clear section boundaries
- Pitfalls: HIGH - Based on direct analysis of every section of the CSS file and JS module interfaces
- Color palette specifics: MEDIUM - Exact new hex values are a design decision, not a research finding

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (stable -- no external dependencies to go stale)
