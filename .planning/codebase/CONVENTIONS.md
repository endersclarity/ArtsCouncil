# Coding Conventions

**Analysis Date:** 2026-02-14

## Naming Patterns

**Files:**
- Module files: `index-maplibre-{domain}-{type}.js` (e.g., `index-maplibre-events-model.js`, `index-maplibre-map-filter-model.js`)
- Main entry point: `index-maplibre.js`
- Data files: lowercase with underscores (e.g., `data.json`, `image_data.json`, `muse_editorials.json`)
- Test files: `test_{description}.js` (e.g., `test_maplibre_deeplink_codec.js`, `test_muse_editorials_schema.js`)

**Functions:**
- camelCase for all functions: `buildVenueEventIndex()`, `getHoursState()`, `parseDeepLinkSearch()`
- Factory functions: `create{Name}Controller()` (e.g., `createExploreController()`, `createMapLabelController()`)

**Variables:**
- camelCase for local variables: `matchedEventsByAsset`, `hoveredFeatureId`, `userLocationCoords`
- UPPER_SNAKE_CASE for module-level constants: `MAPTILER_KEY`, `PACIFIC_TZ`, `EVENT_WINDOW_DAYS`, `LABEL_MAX_VISIBLE`
- Global state variables: camelCase with descriptive names (`activeCategories`, `openNowMode`, `events14dMode`)

**Types:**
- PascalCase for global namespace objects exposed via `window.CulturalMap*`: `CulturalMapConfig`, `CulturalMapEventsModel`, `CulturalMapDetailController`

## Code Style

**Formatting:**
- Indentation: 2 spaces (consistent across all modules)
- No trailing semicolons on block statements
- Semicolons required for all other statements
- Single quotes for strings: `'use strict'`, `'America/Los_Angeles'`
- Template literals for multi-line HTML/string interpolation: `` `<div>${value}</div>` ``

**Linting:**
- No formal linter configuration detected (no `.eslintrc*` or `.prettierrc*` files)
- Code follows ES5 syntax constraints (no ES6 modules, no `class`, no `const`/`let` in older sections)
- Strict mode enforced: Every IIFE starts with `'use strict';`

## Import Organization

**Order:**
1. Module config/utilities (top of `index-maplibre.js`):
   ```javascript
   const cfg = window.CulturalMapConfig || {};
   const coreUtils = window.CulturalMapCoreUtils || {};
   ```
2. External dependencies accessed via globals: `maplibregl`, `gsap`, `turf`, `luxon`
3. Module-specific imports from `window.CulturalMap*` namespace
4. Destructured utility functions from imported modules

**Path Aliases:**
- No path aliases (no build system)
- All imports via `window.*` globals
- HTML script tag order defines module resolution order

## Error Handling

**Patterns:**
- Defensive null checks pervasive: `if (!data || !Array.isArray(data.features)) return null;`
- Early returns for invalid input: `if (!Array.isArray(coord) || coord.length < 2) return false;`
- Fallback values in destructuring: `const eventsUtils = window.CulturalMapEventsUtils || {};`
- Assertion checks at module bootstrap:
  ```javascript
  function assertModuleMethods(moduleRef, methods, errorMessage) {
    if (!moduleRef || methods.some((method) => typeof moduleRef[method] !== 'function')) {
      throw new Error(errorMessage);
    }
  }
  ```
- Try-catch for external data fetching:
  ```javascript
  fetch('data.json').then(r => r.json()).catch(() => ({}))
  ```
- Console warnings for recoverable errors: `console.warn('[Geolocation] Failed to trigger geolocation:', err);`
- Console errors for critical failures: `console.error('Failed to load data:', err);`

## Logging

**Framework:** Native `console` API (no wrapper library)

**Patterns:**
- Prefixed log messages with context: `console.log('[Terrain] Source added, terrain set, exaggeration: 2');`
- Warnings for non-critical failures: `console.warn('[Markers] Failed to register icon for "layerName"', err);`
- Errors for bootstrap/data loading failures: `console.error('Failed to load data:', err);`
- No debug logging in production code (logs are minimal, primarily for development)

## Comments

**When to Comment:**
- Section headers in large files (`index-maplibre.js`):
  ```javascript
  // ============================================================
  // CONFIG
  // ============================================================
  ```
- Inline comments for non-obvious logic:
  ```javascript
  // Require stronger evidence than a short 1-token overlap.
  if (overlap >= 2) return overlap * 10 + longest;
  ```
- Explanation of workarounds or constraints:
  ```javascript
  // Fast rollback switch for marker prototype: set false to return to circle-only markers.
  const ENABLE_CATEGORY_ICON_MARKERS = true;
  ```
- Docstring-style comments rare (not using JSDoc consistently)

**JSDoc/TSDoc:**
- No formal JSDoc usage
- Function signatures inferred from usage, not documented with `@param`/`@returns`
- Complex functions use inline comments instead of docblocks

## Function Design

**Size:**
- Small utility functions: 10-30 lines (`hexToRgba()`, `escapeHTML()`, `getHoursLabel()`)
- Medium domain functions: 30-100 lines (`getHoursState()`, `parseDeepLinkSearch()`, `openDetail()`)
- Large orchestration functions: 100-300 lines (`buildVenueEventIndex()`, main bootstrap in `index-maplibre.js`)
- Largest file: `index-maplibre.js` at 2745 lines (main entry point, orchestrates all modules)

**Parameters:**
- Context object pattern for controllers: `openDetail(ctx)` where `ctx` contains all dependencies
- Named parameters via destructuring:
  ```javascript
  function buildDetailHeroHTML({ asset, cfg, imageData }) { ... }
  ```
- Optional parameters with default values: `function getNowInTimezone(timezone = 'America/Los_Angeles') { ... }`
- Function options objects for complex calls:
  ```javascript
  getUpcomingEventsForAssetIdx({
    matchedEventsByAsset,
    assetIdx,
    isEventWithinDays,
    days
  })
  ```

**Return Values:**
- Explicit returns preferred over implicit `undefined`
- Null for "not found" states: `if (!parsed) return null;`
- Empty arrays/objects for "no results": `return [];`, `return {};`
- Boolean flags for state checks: `return isOpenAtNow(ranges, timezone) ? 'open' : 'closed';`

## Module Design

**Exports:**
- Single namespace object per module exposed via `window.CulturalMap*`:
  ```javascript
  window.CulturalMapCoreUtils = {
    hexToRgba,
    escapeHTML,
    parseDeepLinkSearch,
    serializeDeepLinkSearch,
    isValidCountyCoord,
    sanitizeCountyOutline
  };
  ```
- Dual export for Node.js testing compatibility:
  ```javascript
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  ```

**Barrel Files:**
- Not used (no ES6 modules)
- Each module loaded individually via `<script>` tag in HTML

## Architecture Patterns

**MVC-ish separation:**
- Models (`*-model.js`): Pure functions, state transformations, filtering logic
- Views (`*-view.js`): HTML generation, DOM rendering (no side effects)
- Controllers (`*-controller.js`): Event handling, model-view coordination
- Utils (`*-utils.js`): Pure helper functions, no external dependencies

**Namespace encapsulation:**
- All modules wrapped in IIFE:
  ```javascript
  (function() {
    'use strict';
    // module code
    window.CulturalMapModuleName = { ... };
  })();
  ```

**Dependency injection:**
- Main entry point (`index-maplibre.js`) imports all modules and passes them to controllers
- Controllers receive context objects with all dependencies
- Avoids circular dependencies through explicit injection order

---

*Convention analysis: 2026-02-14*
