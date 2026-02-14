# Testing Patterns

**Analysis Date:** 2026-02-14

## Test Framework

**Runner:**
- Node.js native test runner (`node:test`)
- No external framework (Jest/Mocha/Vitest not used)
- Config: None required (uses default Node.js test runner)

**Assertion Library:**
- Node.js native `assert/strict` module
- Available assertions: `assert.equal()`, `assert.deepEqual()`, `assert.ok()`, `assert.throws()`

**Run Commands:**
```bash
node tests/test_maplibre_deeplink_codec.js    # Run single test
node --test tests/*.js                         # Run all tests (Node 18+)
```

## Test File Organization

**Location:**
- All tests in `tests/` directory at repository root
- Not co-located with source files

**Naming:**
- Pattern: `test_{description}.js`
- Examples: `test_maplibre_deeplink_codec.js`, `test_muse_editorials_schema.js`, `test_maplibre_geolocation_model.js`
- Test names describe the module/feature under test

**Structure:**
```
artscouncil/
├── tests/
│   ├── test_maplibre_deeplink_codec.js          (98 lines)
│   ├── test_maplibre_geolocation_model.js       (62 lines)
│   ├── test_muse_editorials_schema.js           (70 lines)
│   ├── test_maplibre_redesign_clone.js          (200 lines - variant test suite)
│   └── ... (14 test files total, 1063 lines)
└── website/cultural-map-redesign/
    └── index-maplibre-*.js                      (source modules)
```

## Test Structure

**Suite Organization:**
```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const modulePath = path.join(
  __dirname,
  '..',
  'website',
  'cultural-map-redesign',
  'index-maplibre-core-utils.js'
);

const coreUtils = require(modulePath);

test('parseDeepLinkSearch parses repeatable cats and other fields', () => {
  const out = coreUtils.parseDeepLinkSearch(
    '?cat=A&cat=B&open=1&events14d=0&experience=x'
  );

  assert.deepEqual(out, {
    cats: ['A', 'B'],
    open: '1',
    events14d: '0',
    experience: 'x',
    muse: null,
    pid: 'y'
  });
});

test('serializeDeepLinkSearch round-trips cats including commas', () => {
  // Test implementation
});
```

**Patterns:**
- One `test()` call per test case
- Descriptive test names (no `it()` or `describe()` wrappers)
- Arrange-Act-Assert structure implicit (no comments delineating sections)
- Test imports use absolute paths via `path.join(__dirname, ...)`

## Mocking

**Framework:** None (no dedicated mocking library)

**Patterns:**
- No mocking detected in test files
- Tests import actual modules via `require()`
- Pure function testing (most modules export stateless utilities)
- No network/API mocking (tests don't make external calls)

**What to Mock:**
- Not applicable (current tests focus on pure functions)

**What NOT to Mock:**
- Pure utility functions (tested directly with real inputs)

## Fixtures and Factories

**Test Data:**
```javascript
// Inline test data
const state = {
  cats: ['Historic Landmarks', 'Eat, Drink & Stay'],
  open: true,
  events14d: false,
  experience: 'gold-rush-heritage',
  muse: 'van-norden-meadow',
  pid: 'ChIJoUtya1Bxm4ARGG8BoeoOHEE',
  idx: 12,
  event: 'evt_123',
  eventDate: '14d',
  eventCat: 'Galleries & Museums'
};

const search = coreUtils.serializeDeepLinkSearch(state);
```

**Location:**
- No centralized fixtures directory
- Test data defined inline within each test case
- Schema validation tests load real production data files: `fs.readFileSync(path.join(__dirname, '..', 'website', 'cultural-map-redesign', 'muse_editorials.json'))`

## Coverage

**Requirements:** None enforced

**View Coverage:**
- No coverage tooling detected
- No `package.json` scripts for coverage reporting

## Test Types

**Unit Tests:**
- Focus: Pure utility functions in `*-utils.js` and `*-model.js` modules
- Examples:
  - `test_maplibre_deeplink_codec.js`: Tests URL parsing/serialization (`parseDeepLinkSearch()`, `serializeDeepLinkSearch()`)
  - `test_maplibre_geolocation_model.js`: Tests distance calculations (`distanceMiles()`, `formatDistanceMiles()`)
  - `test_muse_editorials_schema.js`: Schema validation for editorial JSON data

**Integration Tests:**
- Focus: Data integrity and file structure validation
- Example: `test_muse_editorials_schema.js` validates JSON schema compliance across all editorial entries

**E2E Tests:**
- Not used (no Playwright, Cypress, or Puppeteer detected)

## Common Patterns

**Async Testing:**
- Not present in current test suite (all tests are synchronous)
- If needed, pattern would be:
  ```javascript
  test('async operation', async () => {
    const result = await someAsyncFunction();
    assert.equal(result, expected);
  });
  ```

**Error Testing:**
```javascript
test('distanceMiles returns null for invalid coordinates', () => {
  const miles = geolocationModel.distanceMiles(
    { lng: 'bad', lat: 39 },
    { lng: -120, lat: 40 }
  );
  assert.equal(miles, null);
});
```

**Schema Validation Pattern:**
```javascript
function loadEditorials() {
  const raw = fs.readFileSync(EDITORIALS_PATH, 'utf8');
  const data = JSON.parse(raw);
  assert.ok(Array.isArray(data), 'muse_editorials.json must be an array');
  assert.ok(data.length > 0, 'muse_editorials.json must not be empty');
  return data;
}

test('muse_editorials.json: basic invariants', () => {
  const editorials = loadEditorials();
  for (const e of editorials) {
    assert.ok(e && typeof e === 'object', 'each editorial must be an object');
    assert.ok(e.id && typeof e.id === 'string', 'editorial.id must be a string');
    assert.ok(e.title && typeof e.title === 'string', 'editorial.title must be a string');
    // ... more assertions
  }
});
```

**Security Testing Pattern:**
```javascript
test('muse_editorials.json: no local windows paths in user-facing strings', () => {
  const editorials = loadEditorials();
  const strings = [];
  collectStrings(editorials, strings);
  const offenders = strings.filter((s) => s.includes('C:\\Users\\'));
  assert.deepEqual(
    offenders,
    [],
    `found Windows local paths in muse_editorials.json: ${offenders.join(', ')}`
  );
});
```

## Test Coverage Gaps

**Untested areas:**
- View modules (`*-view.js`): HTML generation functions not tested
- Controller modules (`*-controller.js`): Event handlers and orchestration logic not tested
- Main entry point (`index-maplibre.js`): Bootstrap and integration logic not tested
- DOM manipulation: No browser environment testing (would require JSDOM or similar)
- Map interactions: MapLibre GL JS rendering and user interactions not tested
- Event handlers: Click, scroll, and keyboard interactions not tested

**What's tested:**
- Pure utility functions (`*-utils.js`): URL parsing, date/time calculations, distance formatting
- Data models (`*-model.js`): Geolocation calculations, state transformations
- Data schema validation: JSON structure and content validation

**Priority:**
- High: Core utility functions (already covered)
- Medium: Data transformation logic in models (partially covered)
- Low: View rendering and DOM manipulation (zero coverage, would require browser test harness)

## Testing Philosophy

**Current approach:**
- Focus on pure functions with clear inputs/outputs
- Avoid testing code with side effects (DOM manipulation, map rendering)
- Schema validation for data integrity
- No mocking or stubbing (test real implementations)

**Constraints:**
- Vanilla JS with no build system limits testing options
- Modules designed for browser environment (global `window` object)
- Node.js compatibility layer added for testability (`if (typeof module !== 'undefined' && module.exports)`)

---

*Testing analysis: 2026-02-14*
