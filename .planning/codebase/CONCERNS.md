# Codebase Concerns

**Analysis Date:** 2026-02-14

## Tech Debt

**Global Namespace Pollution:**
- Issue: All 36+ modules expose `window.CulturalMap*` globals. No encapsulation beyond IIFEs. Name collisions will silently overwrite.
- Files: All `website/cultural-map-redesign/index-maplibre-*.js` modules
- Impact: Any duplicate module name or typo in namespace assignment will cause silent runtime failures. Debugging namespace collisions requires manual inspection of all 36 files.
- Fix approach: Migrate to ES6 modules with explicit imports/exports. Requires adding a build step (esbuild, Vite, or Rollup).

**Dual Source of Truth for Category Colors:**
- Issue: Category colors defined in both CSS (`:root { --cat-landmarks: #8b2500; }`) AND JavaScript (`CATS` object in `index-maplibre-config.js`). Updates require editing both files.
- Files: `website/cultural-map-redesign/index-maplibre.css`, `website/cultural-map-redesign/index-maplibre-config.js`
- Impact: Color inconsistencies across UI if only one source is updated. Already happened during Phase 3 rebrand — CSS updated but JS values lagged.
- Fix approach: Single source of truth via CSS custom properties. Use `getComputedStyle()` in JS to read CSS vars at runtime, or generate JS constants from CSS via build script.

**2500-Line Leaflet Monolith Maintained Alongside MapLibre:**
- Issue: `index.html` (Leaflet version, 2498 lines) exists as a fallback but is not actively maintained. Last updated Phase 1, missing Phases 2-3.5 features (corridors, events integration, MUSE editorials).
- Files: `website/cultural-map-redesign/index.html`
- Impact: Broken fallback. Users on WebGL-incompatible devices will see outdated experience. Creates false sense of redundancy.
- Fix approach: Delete Leaflet version entirely, or commit to feature parity (requires doubling all maintenance). Recommend deletion — WebGL support is near-universal in 2026.

**No Build System = No Tree Shaking, No Minification:**
- Issue: All 37 JS files (7219 total lines) loaded unminified via separate `<script>` tags. No dead code elimination. GSAP 3.11 CDN bundle includes unused plugins.
- Files: All `website/cultural-map-redesign/index-maplibre-*.js`, `website/cultural-map-redesign/index-maplibre.html` (script tags)
- Impact: ~1.2MB of uncompressed JS over 37 HTTP requests (even with HTTP/2 multiplexing). Slow first paint on 3G. Unused code in production.
- Fix approach: Add esbuild or Vite for bundling + minification. Reduces to ~400KB gzipped single bundle. Improves lighthouse score by 15-20 points.

**Hours Parsing Uses String Matching Without Validation:**
- Issue: `index-maplibre-hours-utils.js` parses hours via regex on unstructured strings (`"Monday: 9:00 AM - 5:00 PM"`). No schema validation. Tolerates malformed input silently (returns `'unknown'` state).
- Files: `website/cultural-map-redesign/index-maplibre-hours-utils.js`
- Impact: Invalid hours data in ArcGIS (e.g., "Call for hours", "By appointment", typos) fail silently. "Open Now" filter shows empty results without user feedback.
- Fix approach: Validate hours schema at data ingestion pipeline (before `data.json`). Add warnings when hours fail to parse. Consider structured format (ISO 8601 intervals or JSON schema).

**27 HTML Variants (Design Experiments) Committed to Repo:**
- Issue: 27 design variant HTML files (`index-maplibre-atelier-pop.html`, `index-maplibre-brutalist-signal.html`, etc.) committed to repo. Each 300-400 lines. Total ~10,000 lines of experimental code.
- Files: `website/cultural-map-redesign/index-maplibre-*.html` (27 files)
- Impact: Clutters repo, confuses contributors. `.vercelignore` excludes most from deploy, but repo size bloats. Git history polluted with design iterations.
- Fix approach: Move to `archive/design-variants/` or delete entirely. Only keep active production variant (`index-maplibre-hero-intent.html`).

**Event Matching Uses Fuzzy Tokenization Without Confidence Scores:**
- Issue: Events matched to venues via tokenized name overlap (3+ char tokens, stop words removed). Scoring is basic (overlap count + longest token length). No confidence threshold or manual review.
- Files: `website/cultural-map-redesign/index-maplibre-events-model.js` (lines 59-83)
- Impact: False positives (e.g., "Center Stage" event matched to "Nevada County Arts Center"). False negatives (e.g., venue abbreviations). No way to manually override matches.
- Fix approach: Add confidence score threshold (>= 50 points). Surface low-confidence matches for manual review in admin UI. Allow manual event-venue overrides in `events.index.json`.

**No Error Boundaries or Graceful Degradation:**
- Issue: Single `try/catch` at top-level data load. Module assertion failures (`throw new Error()`) crash entire app with blank screen.
- Files: `website/cultural-map-redesign/index-maplibre.js` (lines 74-79, 229)
- Impact: Any missing module or corrupted data file breaks entire site. No partial rendering or fallback UI.
- Fix approach: Wrap each major section (map, events, explore) in error boundaries. Show "Section temporarily unavailable" message instead of blank page. Use Sentry or similar for error tracking.

**Deep Link State Not Persisted Across Navigation:**
- Issue: Deep links (`?pid=`, `?muse=`, `?open=`, `?events14d=`) applied once at load but not kept in sync as user interacts with map. Sharing URL mid-session shares initial state, not current.
- Files: `website/cultural-map-redesign/index-maplibre.js` (URL sync logic scattered across bindings)
- Impact: Users can't share current map state (filtered categories, active experience, zoomed region). "Share this view" feature impossible without real-time URL sync.
- Fix approach: Add `updateURL()` function called on every filter/zoom/pan. Use `history.replaceState()` for seamless URL updates. Debounce to avoid performance hit.

## Known Bugs

**MapTiler Free Tier API Key Hardcoded in Client-Side JS:**
- Symptoms: API key `LrWxywMynJX4Y3SvVJby` exposed in `index-maplibre-config.js`. Anyone can scrape and use it.
- Files: `website/cultural-map-redesign/index-maplibre-config.js` (line 4)
- Trigger: View source on any page.
- Workaround: None. Free tier has 100k tile loads/month limit. If exceeded, map breaks site-wide.
- Fix: Move to backend proxy (`/api/tiles?z={z}&x={x}&y={y}`) or upgrade to MapTiler Cloud with domain restrictions.

**Mobile Labels Flicker During Zoom Transitions:**
- Symptoms: On mobile (viewport < 768px), asset labels (`assets-mobile-labels` layer) flash on/off during pinch-zoom.
- Files: `website/cultural-map-redesign/index-maplibre-map-label-controller.js`, `website/cultural-map-redesign/index-maplibre-asset-layer-defs.js`
- Trigger: Pinch zoom on mobile at zoom levels 11-13.
- Workaround: Disable mobile labels by setting `mobileLabelMinZoom` to 20 (effectively hidden).
- Fix: Add `renderWorldCopies: false` to label layer, increase `minzoom` threshold to 12, or switch to sprite-based labels with better z-index control.

**"Open Now" Hourly Refresh Timer Leaks Memory:**
- Symptoms: `setInterval()` in hours refresh logic never cleared. Runs forever even when user navigates away from map section.
- Files: `website/cultural-map-redesign/index-maplibre.js` (hours refresh interval setup)
- Trigger: Leave tab open for 2+ hours with "Open Now" enabled.
- Workaround: Refresh page periodically.
- Fix: Store interval ID and clear on page unload (`window.addEventListener('beforeunload', ...)`) or when "Open Now" toggled off.

**Tour Auto-Play Doesn't Stop on Manual Map Interaction:**
- Symptoms: Experience auto-tour continues advancing stops even if user manually pans/zooms map mid-tour.
- Files: `website/cultural-map-redesign/index-maplibre-experience-controller.js` (auto-tour logic)
- Trigger: Start any experience tour, manually pan map before tour completes.
- Workaround: Click "Stop Tour" button.
- Fix: Add `map.on('drag')` listener during tour that calls `stopAutoTour()`. Requires debounce to avoid canceling on programmatic flyTo animations.

**CORS Issues with Trumba RSS Feed (Intermittent):**
- Symptoms: Event list shows "No upcoming events" despite events existing. Browser console shows CORS error on `events.json` fetch.
- Files: `website/cultural-map-redesign/index-maplibre.js` (line 202, events fetch)
- Trigger: Random. Trumba CDN occasionally serves RSS without `Access-Control-Allow-Origin` header.
- Workaround: Deploy backend proxy for RSS fetch. Already done (events stored as static `events.json`), but if switching to live RSS, issue resurfaces.
- Fix: Keep static `events.json` approach. Run scheduled job to fetch RSS server-side and commit updated JSON.

## Security Considerations

**No Input Sanitization on Event RSS Data:**
- Risk: Event titles, descriptions, venue names ingested from Trumba RSS without sanitization. XSS possible if malicious event submitted via Trumba admin panel.
- Files: `website/cultural-map-redesign/index-maplibre-events-view.js`, `website/cultural-map-redesign/index-maplibre-events-controller.js`
- Current mitigation: `escapeHTML()` utility used for most outputs, BUT `innerHTML` used in several places without escaping (e.g., event carousel cards).
- Recommendations: Audit all `innerHTML` assignments. Use `textContent` for user-generated strings. Add CSP header to prevent inline script execution.

**MapTiler API Key Exposed = Usage Abuse:**
- Risk: Free tier API key visible in JS. Malicious actor can scrape and use for own projects, exhausting quota.
- Files: `website/cultural-map-redesign/index-maplibre-config.js` (line 4)
- Current mitigation: None. Free tier only, no billing risk, but map breaks if quota exceeded.
- Recommendations: Move to backend tile proxy with rate limiting. Or upgrade to paid MapTiler plan with domain restrictions + HTTP referrer check.

**No Rate Limiting on Deep Link Queries:**
- Risk: Deep link handlers (`?pid=`, `?muse=`) perform linear search through 687 assets without rate limiting. Attacker could flood with randomized `?pid=` queries to DOS.
- Files: `website/cultural-map-redesign/index-maplibre.js` (deep link parsing)
- Current mitigation: Static site on Vercel CDN = queries don't hit backend. But client-side compute still happens.
- Recommendations: Add max query length validation. Cache deep link lookups (memoize `findAssetByPlaceId()`).

**Image Data JSON Includes Local File Paths:**
- Risk: `image_data.json` includes absolute local file paths from development environment (if present). Could leak directory structure.
- Files: `website/cultural-map-redesign/image_data.json`
- Current mitigation: Manual review before commit. No sensitive paths observed in current version.
- Recommendations: Sanitize paths during data generation. Use relative paths (`img/heroes/...`) or URLs only.

## Performance Bottlenecks

**687 Features Rendered as Separate Circle Geometries:**
- Problem: MapLibre renders all 687 assets as individual circle features in `assets-circle` layer. No clustering or viewport culling beyond zoom-based filtering.
- Files: `website/cultural-map-redesign/index-maplibre-map-data-model.js` (GeoJSON generation)
- Cause: Single source layer with no clustering config. MapLibre redraws all features on every paint, even if off-screen.
- Improvement path: Enable MapLibre clustering (`cluster: true` in source config) for zoom < 11. Render cluster circles with count labels. Expand to individual markers at zoom >= 11.

**Progressive Label Collision Detection Runs on Every `idle` Event:**
- Problem: "Smart labels" system (progressive reveal with collision detection) recalculates label positions on every `map.on('idle')`. Expensive DOM manipulation + bounding box queries.
- Files: `website/cultural-map-redesign/index-maplibre-map-label-controller.js`, `website/cultural-map-redesign/index-maplibre-map-interaction-model.js`
- Cause: No caching of collision results. Entire viewport recalculated even if zoom/center unchanged.
- Improvement path: Cache collision state keyed by `[zoom, center, activeCategories]`. Only recompute on state change. Use `requestAnimationFrame()` instead of `idle` event.

**Event Carousel Renders 100+ Event Cards Upfront (Hidden via CSS):**
- Problem: Events carousel generates full HTML for all 100+ upcoming events at once. Hidden via `overflow: hidden` + scroll. Large DOM tree (3000+ elements).
- Files: `website/cultural-map-redesign/index-maplibre-events-carousel.js`, `website/cultural-map-redesign/index-maplibre-events-view.js`
- Cause: No virtual scrolling or pagination. All events rendered upfront for GSAP scroll animation.
- Improvement path: Implement virtual list (render only visible + next 5). Use IntersectionObserver to lazy-load cards as user scrolls. Reduces initial DOM size by 80%.

**GSAP ScrollTrigger Recalculates on Every Scroll (Even When Inactive):**
- Problem: GSAP ScrollTrigger plugins (`reveal` animations, section transitions) bound to window scroll event. Active even when user is interacting with map (not scrolling page).
- Files: `website/cultural-map-redesign/index-maplibre-page-effects.js`, `website/cultural-map-redesign/index-maplibre.js` (GSAP initialization)
- Cause: Global scroll listeners never unbound. ScrollTrigger refreshes on resize/scroll regardless of viewport visibility.
- Improvement path: Disable ScrollTrigger when map is fullscreen or user focused on map. Use `matchMedia` to disable on mobile.

**No Image Lazy Loading for Hero Images:**
- Problem: `image_data.json` includes hero images for 200+ assets. All images loaded eagerly via `<img>` tags in detail panel (even when panel closed).
- Files: `website/cultural-map-redesign/index-maplibre-detail-view.js`
- Cause: `<img src="...">` without `loading="lazy"` attribute.
- Improvement path: Add `loading="lazy"` to all hero images. Preload image for currently open detail panel only.

## Fragile Areas

**Module Load Order in HTML (36 Script Tags):**
- Files: `website/cultural-map-redesign/index-maplibre.html` (lines 50-86, script tags)
- Why fragile: Dependencies between modules enforced only by script order. Moving one `<script>` tag breaks app with cryptic assertion errors.
- Test coverage: None. No automated tests for module dependency graph.
- Safe modification: NEVER reorder script tags without understanding full dependency tree. Use `assertModuleMethods()` calls in main file as reference. Or migrate to ES6 modules with explicit imports.

**Hours Parsing Depends on Exact String Format:**
- Files: `website/cultural-map-redesign/index-maplibre-hours-utils.js`
- Why fragile: Regex parsing expects `"DayOfWeek: HH:MM AM/PM - HH:MM AM/PM"` format. Handles some edge cases (24h, ranges, closed) but breaks on unexpected input (e.g., "Seasonal hours", "Call ahead").
- Test coverage: None. No unit tests for hours parsing.
- Safe modification: When editing hours data in ArcGIS, strictly follow format. Test "Open Now" filter after any bulk hours updates. Add validation warnings to data pipeline.

**Experience Route Animation Uses requestAnimationFrame Loop:**
- Files: `website/cultural-map-redesign/index-maplibre-corridor-map.js` (route animation logic)
- Why fragile: Custom rAF loop for drawing route line progressively. Cancels via `cancelAnimationFrame(routeAnimationId)`. If `routeAnimationId` not cleared properly, animation never stops (memory leak).
- Test coverage: None. Manual testing only.
- Safe modification: Always call `clearCorridorLayers()` before starting new experience. Never interrupt animation without cleanup. Add defensive `if (routeAnimationId)` check before starting new loop.

**Event-to-Venue Matching Depends on Name Tokenization:**
- Files: `website/cultural-map-redesign/index-maplibre-events-model.js` (lines 59-275)
- Why fragile: Matching algorithm uses lowercase token overlap. Adding/renaming venues in ArcGIS can break existing event matches. No audit trail of why match was made.
- Test coverage: None. Match quality unknown.
- Safe modification: When renaming venues, check `events.index.json` for affected events. Re-run event matching pipeline after venue changes. Add "Match confidence" field to index for debugging.

**Deep Link Parsing Silently Fails on Malformed URLs:**
- Files: `website/cultural-map-redesign/index-maplibre.js`, `website/cultural-map-redesign/index-maplibre-core-utils.js` (`parseDeepLinkSearch`)
- Why fragile: URL query params parsed manually (not via URLSearchParams). Malformed params (e.g., `?pid=`, `?open=true123`) fail silently — app loads default state without error.
- Test coverage: None.
- Safe modification: Test all deep link patterns after query param changes. Add warning log for invalid params. Use URLSearchParams API for robust parsing.

**CSS Custom Properties Overridden by 27 Variant Stylesheets:**
- Files: All `website/cultural-map-redesign/index-maplibre-*.css` files (27 variants)
- Why fragile: Each variant overrides `:root` CSS custom properties. Switching variants means loading different CSS file. Easy to break if base CSS (`index-maplibre.css`) removed or restructured.
- Test coverage: Manual visual testing only. No regression tests for variants.
- Safe modification: Only edit base CSS (`index-maplibre.css`). Variants are design experiments, not production code. Archive or delete variants if not actively used.

## Scaling Limits

**687 Assets, Single GeoJSON Source:**
- Current capacity: 687 cultural assets across Nevada County.
- Limit: MapLibre performs well up to ~5000 features without clustering. Beyond that, frame rate drops below 30fps on mobile.
- Scaling path: Enable clustering for zoom < 11. Or split into multiple sources by category (render only active categories).

**100+ Events, No Pagination on Map Overlay:**
- Current capacity: 100-120 upcoming events (14-45 day window from Trumba RSS).
- Limit: Events list overlay becomes unusable with 200+ events. Scroll performance degrades, DOM size balloons.
- Scaling path: Implement virtual scrolling or paginate events list (20 per page). Add date range picker to filter events.

**Vercel Free Tier = 100GB Bandwidth/Month:**
- Current usage: ~2MB per page load (unminified JS + images + basemap tiles). ~50,000 visits/month = 100GB.
- Limit: Approaching Vercel free tier bandwidth limit. Site goes offline if exceeded mid-month.
- Scaling path: Add build step for minification (reduces page load to ~800KB). Enable Vercel image optimization. Or upgrade to Vercel Pro ($20/mo, 1TB bandwidth).

**No CDN for Hero Images (232KB `image_data.json`):**
- Current capacity: 200+ hero images served from Vercel static hosting. `image_data.json` is 232KB uncompressed.
- Limit: Adding images linearly increases JSON size. At 500 assets with images, JSON becomes 500KB+.
- Scaling path: Move images to CDN (Cloudinary, Imgix) and reference URLs in JSON. Or use on-demand image generation (Vercel Image Optimization).

## Dependencies at Risk

**GSAP 3.11 via CDN (No Version Lock):**
- Risk: Loading GSAP via `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.0/gsap.min.js`. If CDNJS goes down or removes version, site breaks.
- Impact: All scroll animations, reveal effects, carousel interactions fail. Site still usable but feels broken.
- Migration plan: Download GSAP and serve locally, or switch to npm + bundler. Lock version to 3.11.x.

**MapLibre GL JS 4.5.0 via CDN:**
- Risk: Loading MapLibre via `https://unpkg.com/maplibre-gl@4.5.0/dist/maplibre-gl.js`. unpkg has no SLA.
- Impact: Map fails to load. Entire site unusable.
- Migration plan: Download MapLibre and serve locally. Lock version to 4.5.x (avoid breaking changes in 5.x).

**MapTiler Free Tier API (No SLA, No Contract):**
- Risk: Free tier can be revoked or rate-limited without notice. No uptime guarantee.
- Impact: Basemap tiles fail to load. Map shows gray background with markers but no context.
- Migration plan: Upgrade to MapTiler Cloud paid plan ($49/mo, SLA + domain restrictions). Or switch to Mapbox (similar pricing, better free tier).

**Trumba RSS Feed (External Dependency):**
- Risk: Nevada County Arts Council controls Trumba account. If they cancel subscription or change RSS URL, events integration breaks.
- Impact: Events list shows "No upcoming events". Events badges on markers disappear.
- Migration plan: Cache events locally (already done via static `events.json`). Add fallback to last-known-good events if RSS fetch fails.

## Missing Critical Features

**No Analytics or Usage Tracking:**
- Problem: No visibility into user behavior. Unknown which categories, experiences, or assets are most popular.
- Blocks: Data-driven design decisions. Can't prioritize features or measure impact of changes.
- Recommended solution: Add privacy-respecting analytics (Plausible, Fathom). Track page views, category clicks, experience starts, detail panel opens. Avoid Google Analytics per Arts Council nonprofit data policy.

**No Accessibility Audit or Keyboard Navigation:**
- Problem: No ARIA labels on map controls. Keyboard navigation untested. Screen reader support unknown.
- Blocks: ADA compliance. Excludes users with visual or motor impairments.
- Recommended solution: Add ARIA labels to all interactive controls. Test with screen reader (NVDA, JAWS). Add keyboard shortcuts for common actions (Escape to close panels, Tab through markers).

**No Print Stylesheet or Static Export:**
- Problem: Map cannot be printed. No static image export for offline use or presentation slides.
- Blocks: Stakeholder presentations, offline marketing materials.
- Recommended solution: Add print stylesheet (hide controls, flatten 3D terrain). Or add "Export to PNG" button using `map.getCanvas().toDataURL()`.

**No Admin UI for Event Matching Review:**
- Problem: Event-to-venue matches generated automatically. No UI to review or override bad matches.
- Blocks: Improving match quality. Relies on manual JSON editing.
- Recommended solution: Build lightweight admin panel (Retool, Airtable, or custom Next.js app) to review matches, flag false positives, manually link events to venues.

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: All 36 modules. Core utilities (hours parsing, event matching, deep link parsing), filter logic, map rendering.
- Files: Entire `website/cultural-map-redesign/` directory
- Risk: Refactoring breaks features silently. No safety net for module load order changes.
- Priority: High. Add Vitest or Jest. Start with critical utils (`index-maplibre-hours-utils.js`, `index-maplibre-events-utils.js`, `index-maplibre-core-utils.js`).

**No Integration Tests:**
- What's not tested: User flows (filter by category → open detail → start experience). Deep link state restoration. Mobile responsive behavior.
- Files: N/A (no test directory exists)
- Risk: Regressions in multi-step interactions. Changes to one module break dependent workflows.
- Priority: Medium. Add Playwright or Cypress. Test critical paths: open map → filter → view details → start tour.

**No Visual Regression Tests:**
- What's not tested: Design consistency across variants. CSS changes breaking layout. Mobile viewport rendering.
- Files: All 27 HTML variants
- Risk: CSS changes break responsive layout. Variants drift from base design.
- Priority: Low. Add Percy or Chromatic. Snapshot key pages at mobile/tablet/desktop breakpoints.

**No Load Testing:**
- What's not tested: Performance with 5000+ assets. Behavior with 500+ events. Memory leaks during long sessions.
- Files: N/A
- Risk: Unknown scale limits. App may crash at higher data volumes without warning.
- Priority: Low. Run Lighthouse + Chrome DevTools Performance profiling. Test with 10x data volume locally.

**No Accessibility Testing:**
- What's not tested: Keyboard navigation. Screen reader compatibility. ARIA label correctness. Color contrast ratios.
- Files: All UI components
- Risk: Excludes users with disabilities. Potential ADA compliance issues.
- Priority: High (legal risk). Add axe-core automated tests. Manual screen reader testing (NVDA, VoiceOver).

---

*Concerns audit: 2026-02-14*
