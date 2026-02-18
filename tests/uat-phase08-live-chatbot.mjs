/**
 * Phase 8 Tasks 16 & 17: Live Chatbot E2E + Analytics
 *
 * Targets the live Vercel stitch-lab deployment.
 * Requires /api/chat (Gemini serverless) to be working.
 *
 * T16-A  FAB opens chat panel
 * T16-B  Trip planning cards appear (requires dreamboard in localStorage)
 * T16-C  Click "1-Day Plan" → Gemini responds (typing indicator → bot message)
 * T16-D  {{ITINERARY}} block parsed → .chat-itin-card rendered
 * T16-E  "View & Edit" navigates to trip.html with activeTrip set
 * T17    Analytics events fire: chat:open, chat:query-sent, trip:itinerary-generated
 */

import { test, expect } from '@playwright/test';

const LIVE_URL =
  'https://cultural-map-redesign-stitch-lab.vercel.app/index-maplibre-hero-intent-stitch-frontend-design-pass.html';

// Two saved places so trip planning cards appear
const DREAMBOARD =
  '{"version":1,"places":[{"id":"p1","name":"Nevada Theatre","category":"Performing Arts","city":"Nevada City"},{"id":"p2","name":"Miners Foundry","category":"Cultural Organizations","city":"Nevada City"}],"events":[]}';

/**
 * Common setup: inject localStorage + analytics interceptors before navigation.
 */
async function setupPage(page) {
  // T17 — Intercept window.umami.track via property descriptor.
  // Runs before any page scripts so it catches Umami's initialization assignment.
  await page.addInitScript(() => {
    window.__analyticsLog = [];
    let _umami;
    Object.defineProperty(window, 'umami', {
      get() { return _umami; },
      set(val) {
        _umami = val;
        if (val && typeof val.track === 'function') {
          const orig = val.track.bind(val);
          val.track = (name, props) => {
            window.__analyticsLog.push({ name, props: props || {}, source: 'umami' });
            return orig(name, props);
          };
        }
      },
      configurable: true,
    });
  });

  // Inject dreamboard so trip-planning cards render when panel opens
  await page.addInitScript((db) => {
    localStorage.setItem('ncac-dreamboard', db);
  }, DREAMBOARD);

  await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });

  // Wait for all modules (map, chat, analytics) to finish initializing
  await page.waitForTimeout(3500);

  // Fallback interceptor: wrap CulturalMapAnalytics.track directly.
  // Covers cases where Umami is blocked by the network or loads differently.
  await page.evaluate(() => {
    const a = window.CulturalMapAnalytics;
    if (a && typeof a.track === 'function' && !a.__intercepted) {
      const orig = a.track.bind(a);
      a.track = function (name, data) {
        window.__analyticsLog = window.__analyticsLog || [];
        // Only record if not already captured at the umami level
        const isDup = window.__analyticsLog.some(
          (e) => e.name === name && e.source === 'umami'
        );
        if (!isDup) {
          window.__analyticsLog.push({ name, props: data || {}, source: 'analytics-module' });
        }
        return orig(name, data);
      };
      a.__intercepted = true;
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// T16-A: FAB opens chat panel
// ─────────────────────────────────────────────────────────────────────────────
test('T16-A: FAB opens chat panel', async ({ page }) => {
  await setupPage(page);

  // FAB should reach ready state
  await expect(page.locator('.chat-fab--ready')).toBeVisible({ timeout: 5_000 });

  // Click FAB
  await page.locator('.chat-fab').click();
  await page.waitForTimeout(400);

  // Panel should be open, welcome message visible
  await expect(page.locator('#chatPanel.chat-panel--open')).toBeVisible({ timeout: 3_000 });
  await expect(page.locator('.chat-msg--bot.chat-welcome').first()).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// T16-B: Trip planning cards appear (dreamboard has 2 items)
// ─────────────────────────────────────────────────────────────────────────────
test('T16-B: Trip planning cards appear with dreamboard items', async ({ page }) => {
  await setupPage(page);

  await page.locator('.chat-fab').click();
  await page.waitForTimeout(800);

  await expect(page.locator('.chat-trip-cards')).toBeVisible({ timeout: 5_000 });

  // Exactly 3 cards: 1-day, 2-day, organize
  await expect(page.locator('.chat-trip-card[data-trip-plan]')).toHaveCount(3);
  await expect(page.locator('.chat-trip-card[data-trip-plan="1day"]')).toBeVisible();
  await expect(page.locator('.chat-trip-card[data-trip-plan="2day"]')).toBeVisible();
  await expect(page.locator('.chat-trip-card[data-trip-plan="organize"]')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// T16-C/D/E + T17: Full Gemini flow — itinerary card rendered → trip.html
// ─────────────────────────────────────────────────────────────────────────────
test('T16-C/D/E + T17: Gemini 1-day plan → itinerary card → trip.html + analytics', async ({ page }) => {
  // Gemini can take up to 30s; trip.html navigation adds more time
  test.setTimeout(120_000);

  await setupPage(page);

  // Open panel
  await page.locator('.chat-fab').click();
  await page.waitForTimeout(800);

  // Click the "1-Day Plan" trip card
  await expect(page.locator('.chat-trip-card[data-trip-plan="1day"]')).toBeVisible({ timeout: 5_000 });
  await page.locator('.chat-trip-card[data-trip-plan="1day"]').click();

  // ── T16-C ──────────────────────────────────────────────────────────────────
  // User message should appear immediately, typing indicator follows
  await expect(page.locator('.chat-msg--user')).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('.chat-typing-wrapper')).toBeVisible({ timeout: 8_000 });

  // Wait for Gemini to finish (typing indicator disappears) — up to 75s
  await expect(page.locator('.chat-typing-wrapper')).not.toBeVisible({ timeout: 75_000 });

  // Short settle wait for DOM to update after typing stops
  await page.waitForTimeout(1500);

  // ── T16-D ──────────────────────────────────────────────────────────────────
  // Bot message present
  await expect(page.locator('.chat-msg--bot').last()).toBeVisible({ timeout: 5_000 });

  // Diagnostic: capture what Gemini actually returned (helps debug if itin-card missing)
  const botText = await page.locator('.chat-msg--bot').last().textContent().catch(() => '(could not read)');
  console.log('[T16-D] Last bot message (first 300 chars):', botText?.slice(0, 300));

  // Itinerary card rendered from {{ITINERARY}} block
  await expect(page.locator('.chat-itin-card')).toBeVisible({ timeout: 8_000 });

  // Title is non-empty
  const title = await page.locator('.chat-itin-title').textContent();
  expect(title?.trim().length, 'chat-itin-title should not be empty').toBeGreaterThan(0);

  // Meta contains a number (stops or days)
  const meta = await page.locator('.chat-itin-meta').textContent();
  expect(meta, 'chat-itin-meta should contain a digit').toMatch(/\d/);

  // CTA links to trip.html
  const ctaHref = await page.locator('.chat-itin-cta').getAttribute('href');
  expect(ctaHref, 'CTA href should include trip.html').toContain('trip.html');

  // ── T17 ────────────────────────────────────────────────────────────────────
  // Verify analytics events fired (check before navigating away)
  const log = await page.evaluate(() => window.__analyticsLog || []);

  expect(log.some((e) => e.name === 'chat:open'), 'chat:open should fire').toBe(true);
  expect(log.some((e) => e.name === 'chat:query-sent'), 'chat:query-sent should fire').toBe(true);
  expect(log.some((e) => e.name === 'trip:itinerary-generated'), 'trip:itinerary-generated should fire').toBe(true);

  // query_length should be > 0 on chat:query-sent
  const queryEvt = log.find((e) => e.name === 'chat:query-sent');
  if (queryEvt?.props?.query_length !== undefined) {
    expect(queryEvt.props.query_length, 'query_length > 0').toBeGreaterThan(0);
  }

  // stops should be > 0 on trip:itinerary-generated
  const itinEvt = log.find((e) => e.name === 'trip:itinerary-generated');
  if (itinEvt?.props?.stops !== undefined) {
    expect(itinEvt.props.stops, 'stops > 0').toBeGreaterThan(0);
  }

  // session_hash should be present on Umami-level events
  const umamiEvents = log.filter((e) => e.source === 'umami');
  if (umamiEvents.length > 0) {
    const withHash = umamiEvents.filter((e) => e.props?.session_hash);
    expect(withHash.length, 'umami events should carry session_hash').toBeGreaterThan(0);
  }

  // ── T16-E ──────────────────────────────────────────────────────────────────
  // Click "View & Edit" — navigate to trip.html
  await page.locator('.chat-itin-cta').click();
  await page.waitForURL(/trip\.html/, { timeout: 10_000 });
  await page.waitForTimeout(3000); // wait for trip page JS to init

  // ncac-user-trips should exist with activeTrip
  const trips = await page.evaluate(() => {
    const raw = localStorage.getItem('ncac-user-trips');
    return raw ? JSON.parse(raw) : null;
  });
  expect(trips, 'ncac-user-trips should be set').not.toBeNull();
  expect(trips.activeTrip, 'activeTrip should be set').toBeTruthy();

  // Trip page itinerary zone should be visible (try multiple known selectors)
  const itinZone = page.locator(
    '#itinerary-zone, #tb-itinerary-content, .tb-itinerary, .tb-section, .tb-stop'
  );
  await expect(itinZone.first()).toBeVisible({ timeout: 8_000 });
});
