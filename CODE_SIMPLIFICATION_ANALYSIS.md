# Code Simplification Analysis: index-neumorphism.html

**File Size:** 3,527 lines, 108KB
**Structure:** Single-file HTML with embedded CSS and JavaScript
**JavaScript:** 36 functions, 194 variable/function declarations

## Executive Summary

The file is **functionally well-structured** but suffers from **organizational complexity** rather than code quality issues. The main problem is that **3,500 lines in a single file** makes maintenance, debugging, and collaboration difficult.

**Primary recommendation:** File separation (CSS extraction, JS modularization)
**Secondary recommendations:** Code consolidation, dead code removal, naming improvements

---

## Major Refactoring Opportunities

### 1. **File Separation** (High Impact, Preserves Functionality)

**Problem:** Monolithic 108KB single file
**Impact:** Hard to navigate, slows editor performance, poor maintainability

**Proposed Structure:**
```
index-neumorphism.html  (structure only, ~500 lines)
styles.css              (all styles, ~1,500 lines)
map-app.js              (all functionality, ~1,400 lines)
data.json               (already separate)
experiences.json        (already separate)
image_data.json         (already separate)
```

**Benefits:**
- 80% reduction in main HTML file size
- Easier code navigation and maintenance
- Better caching (CSS/JS can be cached separately)
- Enables minification/compression
- Parallel development (edit CSS without touching JS)

**Risk:** None (standard practice, zero functional impact)

---

### 2. **Duplicate Color Definitions** (Medium Impact)

**Problem:** Color palette defined twice - once in CSS variables (lines 29-67) and again in JavaScript CATS object (lines 2177-2188)

**Current:**
```css
/* CSS */
:root {
  --cat-landmarks: #A0522D;
  --cat-eat: #D4AF37;
  /* ...8 more categories */
}
```

```javascript
// JavaScript
const CATS = {
  'Historic Landmarks': { color: '#8b2500', ... },
  'Eat, Drink & Stay':  { color: '#a67830', ... },
  // ...8 more categories
}
```

**Issues:**
- Colors don't match between CSS and JS (#A0522D vs #8b2500)
- Maintenance burden (update in 2 places)
- Source of truth unclear

**Proposed Fix:**
```javascript
// Read from CSS custom properties
const CATS = {
  'Historic Landmarks': {
    color: getComputedStyle(document.documentElement)
      .getPropertyValue('--cat-landmarks').trim(),
    short: 'Landmarks',
    watercolor: 'landmarks'
  },
  // ...
};
```

**Benefit:** Single source of truth, guaranteed consistency
**Risk:** Low (CSS variables always available at runtime)

---

### 3. **Redundant Theme Storage/Reset Logic** (Medium Impact)

**Problem:** Complex theme system stores/restores MapLibre paint properties (lines 2456-2465, paint reset logic scattered)

**Current:**
```javascript
let originalPaintValues = {};

function storeOriginalPaints() {
  try {
    const layers = map.getStyle().layers || [];
    layers.forEach(layer => {
      if (layer.paint) {
        originalPaintValues[layer.id] = { ...layer.paint };
      }
    });
  } catch (e) { /* style may not be fully loaded */ }
}
```

**Issue:** Only used for theme reset, but theme colors are defined per-experience in experiences.json. Could simplify by re-applying base theme instead of storing/restoring.

**Proposed:**
```javascript
// Define base theme as constant
const BASE_THEME = {
  basemap: 'terrain',
  accent: '#2a8c8c',
  // ...rest of MUSE theme
};

function resetTheme() {
  applyTheme(BASE_THEME);  // Just re-apply, no storage needed
}
```

**Benefit:** Removes 50+ lines of storage/retrieval code
**Risk:** Low (theme values are known constants)

---

### 4. **Excessive Global State** (Medium Impact)

**Problem:** 14 module-level variables for state management

**Current:**
```javascript
let DATA = [];
let IMAGE_DATA = {};
let EXPERIENCES = [];
let map;
let activeCategory = null;
let activeExperience = null;
let cardElements = [];
let listPage = 0;
let corridorMarkers = [];
let currentResolvedStops = [];
let routeAnimationId = null;
let tourTimeouts = [];
let activeMoveendHandler = null;
let dotPulseTween = null;
let originalPaintValues = {};
let hoverPopup = null;
let hoveredFeatureId = null;
```

**Issues:**
- Hard to reason about state changes
- No encapsulation
- Difficult to reset/test

**Proposed:**
```javascript
// Consolidate into state object
const AppState = {
  data: {
    assets: [],
    images: {},
    experiences: []
  },
  ui: {
    activeCategory: null,
    activeExperience: null,
    listPage: 0
  },
  map: {
    instance: null,
    hoverPopup: null,
    hoveredFeatureId: null
  },
  experience: {
    corridorMarkers: [],
    currentStops: [],
    routeAnimationId: null,
    tourTimeouts: [],
    activeMoveendHandler: null,
    dotPulseTween: null
  }
};
```

**Benefits:**
- Clear state organization
- Easier debugging (console.log one object)
- Enables state reset
- Better testing

**Risk:** Medium (requires updating all references, but systematic change)

---

### 5. **Repeated MapLibre Layer Cleanup** (Low Impact)

**Problem:** Similar cleanup logic repeated across multiple functions

**Current:**
```javascript
// Scattered in multiple places
if (map.getLayer('corridor-route-glow')) map.removeLayer('corridor-route-glow');
if (map.getSource('corridor-route-glow')) map.removeSource('corridor-route-glow');
if (map.getLayer('corridor-route-animated')) map.removeLayer('corridor-route-animated');
if (map.getSource('corridor-route-animated')) map.removeSource('corridor-route-animated');
// ...repeated 6-8 times
```

**Proposed:**
```javascript
function removeMapLayersAndSources(prefixes) {
  const style = map.getStyle();

  prefixes.forEach(prefix => {
    style.layers
      .filter(l => l.id.startsWith(prefix))
      .forEach(l => {
        if (map.getLayer(l.id)) map.removeLayer(l.id);
      });

    Object.keys(style.sources)
      .filter(s => s.startsWith(prefix))
      .forEach(s => {
        if (map.getSource(s)) map.removeSource(s);
      });
  });
}

// Usage
removeMapLayersAndSources(['corridor-', 'experience-']);
```

**Benefit:** Removes ~30 lines of duplicate code
**Risk:** Low (well-defined scope)

---

### 6. **Magic Numbers** (Low Impact)

**Problem:** Hard-coded values scattered throughout

**Examples:**
```javascript
// Line 2712: Duration
animateRoute(routeCoords, 2500);

// Line 2791: Padding
map.fitBounds(bounds, { padding: 80, maxZoom: 13, pitch: 30, duration: 2000 });

// Line 2868: Mobile breakpoint
const mobile = window.matchMedia('(max-width: 900px)').matches;
```

**Proposed:**
```javascript
// At top of script
const CONFIG = {
  MAPTILER_KEY: 'LrWxywMynJX4Y3SvVJby',

  // Animation timing
  ROUTE_ANIMATION_DURATION: 2500,
  FLY_TO_DURATION_MOBILE: 1200,
  FLY_TO_DURATION_DESKTOP: 2000,
  TOUR_DWELL_TIME_MOBILE: 1500,
  TOUR_DWELL_TIME_DESKTOP: 2500,

  // Layout
  BREAKPOINT_MOBILE: 600,
  BREAKPOINT_TABLET: 900,
  LIST_PAGE_SIZE: 30,

  // Map
  MAP_BOUNDS_PADDING: 80,
  MAP_DEFAULT_PITCH: 35,
  MAP_CINEMATIC_PITCH: 55,
  // ...
};
```

**Benefits:**
- Easy tuning without code diving
- Self-documenting
- Consistent values

**Risk:** None (pure refactor)

---

### 7. **Inconsistent Naming** (Low Impact)

**Problem:** Mixing conventions

**Examples:**
```javascript
// Snake case vs camel case
IMAGE_DATA        // SCREAMING_SNAKE
activeMoveendHandler  // camelCase
currentResolvedStops  // camelCase

// Verbose vs abbreviated
currentResolvedStops   // verbose
cfg                    // abbreviated (line 2529)
```

**Proposed Standard:**
```javascript
// Constants: SCREAMING_SNAKE_CASE
const MAPTILER_KEY = '...';
const DEFAULT_THEME = { ... };

// State/variables: camelCase
let activeExperience = null;
let resolvedStops = [];

// Avoid single-letter or abbreviated names
// BAD:  cfg, d, f, r
// GOOD: config, data, feature, response
```

**Benefit:** Improved readability
**Risk:** None (systematic rename)

---

### 8. **Nested Ternaries** (Low Impact)

**Problem:** Hard-to-read conditional logic

**Example (lines 2532-2534):**
```javascript
const imgHTML = imgInfo
  ? `<img class="tooltip-img" src="${imgInfo.img}" alt="${imgInfo.alt || props.name}" onerror="this.parentNode.removeChild(this)">`
  : `<div class="tooltip-placeholder" style="background:linear-gradient(135deg, ${cfg.color}, ${cfg.color}dd)"><img src="img/watercolor/${wcSlug}.png" class="tooltip-watercolor" alt="" onerror="this.style.display='none'"></div>`;
```

**Proposed:**
```javascript
function buildTooltipImage(imgInfo, config, props) {
  if (imgInfo) {
    return `<img class="tooltip-img"
                 src="${imgInfo.img}"
                 alt="${imgInfo.alt || props.name}"
                 onerror="this.parentNode.removeChild(this)">`;
  }

  const wcSlug = config.watercolor || 'landmarks';
  return `<div class="tooltip-placeholder"
               style="background:linear-gradient(135deg, ${config.color}, ${config.color}dd)">
            <img src="img/watercolor/${wcSlug}.png"
                 class="tooltip-watercolor"
                 alt=""
                 onerror="this.style.display='none'">
          </div>`;
}

const imgHTML = buildTooltipImage(imgInfo, cfg, props);
```

**Benefits:**
- More readable
- Easier to test
- Reusable (tooltip logic appears 3+ times)

**Risk:** None

---

## Dead Code Candidates

### 1. **Unused Variables**
```javascript
let cardElements = [];  // Line 2199 - Set but never read
```

### 2. **Commented-Out Code**
```javascript
// Line 190: /* Removed paper texture for neumorphism */
// Line 202: /* hero watercolors now in layout, not absolute positioned */
```
**Action:** Remove comments referencing removed features

### 3. **Redundant Watercolor Preload**
```javascript
// Lines 2246-2260: Preloads watercolor images
// But images are lazy-loaded via onerror handlers anyway
// Minimal performance benefit for added complexity
```

---

## CSS Simplification

### 1. **Redundant Neumorphic Shadow Definitions**

**Problem:** Three shadow variables, but very similar

**Current:**
```css
--shadow-raised: 6px 6px 12px rgba(80,60,40,0.2), -6px -6px 12px rgba(255,250,240,0.8);
--shadow-inset: inset 3px 3px 6px rgba(80,60,40,0.2), inset -3px -3px 6px rgba(255,250,240,0.8);
--shadow-soft: 4px 4px 8px rgba(80,60,40,0.15), -4px -4px 8px rgba(255,250,240,0.7);
```

**Analysis:** Could consolidate to 2 (raised + inset) if soft is rarely used

### 2. **Media Query Consolidation**

**Problem:** Media queries scattered throughout CSS

**Example:**
```css
@media (max-width: 600px) { /* line 159 */ }
@media (max-width: 900px) { /* line 800-ish */ }
@media (max-width: 600px) { /* line 1200-ish */ }
```

**Proposed:** Group all breakpoint rules together at end of file

---

## Estimated Impact

| Refactor | LOC Reduction | Maintainability | Performance | Risk |
|----------|---------------|-----------------|-------------|------|
| **File separation** | -0 (reorganize) | ★★★★★ | ★★☆☆☆ | Low |
| **Duplicate colors** | -20 | ★★★★☆ | ☆☆☆☆☆ | Low |
| **Theme storage** | -60 | ★★★☆☆ | ★☆☆☆☆ | Low |
| **State consolidation** | -0 (refactor) | ★★★★☆ | ☆☆☆☆☆ | Medium |
| **Layer cleanup** | -30 | ★★☆☆☆ | ☆☆☆☆☆ | Low |
| **Magic numbers** | +15 (config) | ★★★☆☆ | ☆☆☆☆☆ | None |
| **Naming** | -0 (rename) | ★★☆☆☆ | ☆☆☆☆☆ | None |
| **Nested ternaries** | +10 (functions) | ★★★☆☆ | ☆☆☆☆☆ | None |

---

## Recommended Action Plan

### Phase 1: Low-Risk Quick Wins (1-2 hours)
1. Extract CSS to separate file
2. Extract JS to separate file
3. Remove dead code (unused variables, old comments)
4. Consolidate magic numbers into CONFIG object

**Result:** Much easier to work with, zero functional changes

### Phase 2: Code Quality (2-3 hours)
5. Fix duplicate color definitions
6. Simplify theme storage/reset
7. Create helper function for layer cleanup
8. Extract nested ternaries into functions

**Result:** Cleaner, more maintainable code

### Phase 3: Structural (4-5 hours, optional)
9. Consolidate global state into AppState object
10. Standardize naming conventions
11. Group CSS media queries

**Result:** Professional-grade code organization

---

## What NOT to Change

**Keep as-is:**
- ✅ MapLibre GL integration (well-implemented)
- ✅ GSAP animations (performant, clean)
- ✅ Experience system architecture (solid design)
- ✅ Turf.js route animation (creative, works well)
- ✅ IIFE wrapper pattern (correct for single-file script)
- ✅ Neumorphic design system (complete, consistent)

---

## Conclusion

The code is **functionally sound** but would benefit greatly from **organizational refactoring**. The biggest win is **file separation** (CSS/JS extraction), which is low-risk and high-impact. Secondary improvements (color consolidation, state management, naming) are valuable but less critical.

**Final recommendation:** Start with Phase 1 (file separation + dead code removal). This alone will make the codebase dramatically easier to maintain while preserving exact functionality.
