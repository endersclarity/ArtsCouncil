// tests/test_district_intent_modal.js
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:8001';
const HOME = BASE + '/index-maplibre-hero-intent-stitch-frontend-design-pass.html';
const DIR  = BASE + '/directory.html';

test.describe('District intent modal', () => {

  test('modal is hidden on load', async ({ page }) => {
    await page.goto(HOME);
    const modal = page.locator('#intentModal');
    await expect(modal).toBeHidden();
  });

  test('clicking Atmosphere card opens modal', async ({ page }) => {
    await page.goto(HOME);
    // First district card is Atmosphere
    await page.locator('.district-feature-card').first().click();
    await expect(page.locator('#intentModal')).toBeVisible();
    await expect(page.locator('#intentModalTitle')).toContainText('after dark');
  });

  test('modal shows 4 subcategory cards', async ({ page }) => {
    await page.goto(HOME);
    await page.locator('.district-feature-card').first().click();
    const subcats = page.locator('.intent-modal-subcat');
    await expect(subcats).toHaveCount(4);
  });

  test('Escape key closes modal', async ({ page }) => {
    await page.goto(HOME);
    await page.locator('.district-feature-card').first().click();
    await expect(page.locator('#intentModal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#intentModal')).toBeHidden();
  });

  test('clicking backdrop closes modal', async ({ page }) => {
    await page.goto(HOME);
    await page.locator('.district-feature-card').first().click();
    await expect(page.locator('#intentModal')).toBeVisible();
    await page.locator('#intentModalBackdrop').click({ force: true });
    await expect(page.locator('#intentModal')).toBeHidden();
  });

  test('subcategory click navigates to directory with ?cat=', async ({ page }) => {
    await page.goto(HOME);
    await page.locator('.district-feature-card').first().click();
    const firstSubcat = page.locator('.intent-modal-subcat').first();
    const href = await firstSubcat.getAttribute('href');
    expect(href).toContain('directory.html?cat=');
  });

  test('Explore Further links to directory with ?intent=atmosphere', async ({ page }) => {
    await page.goto(HOME);
    await page.locator('.district-feature-card').first().click();
    const exploreHref = await page.locator('#intentModalExploreBtn').getAttribute('href');
    expect(exploreHref).toContain('directory.html?intent=atmosphere');
  });

  test('directory ?intent=culture shows multi-category results', async ({ page }) => {
    await page.goto(DIR + '?intent=culture');
    await page.waitForTimeout(2500);
    const results = page.locator('.directory-item');
    const count = await results.count();
    expect(count).toBeGreaterThan(10);
  });

  test('directory ?cat=Performance+Spaces shows single category results', async ({ page }) => {
    await page.goto(DIR + '?cat=Performance+Spaces');
    await page.waitForTimeout(2500);
    const header = page.locator('.directory-header-title');
    await expect(header).toBeVisible();
  });

});
