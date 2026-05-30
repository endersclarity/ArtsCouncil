import { chromium } from "playwright";

const APP_URL = "http://127.0.0.1:4178/v1-discovery-map/index.html?contract=cla-33";

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

async function waitForMap(page) {
  await page.waitForSelector("#map canvas", { timeout: 30000 });
  await page.waitForTimeout(7000);
}

async function clickMapFraction(page, xFraction, yFraction) {
  const point = await page.evaluate(({ xFraction, yFraction }) => {
    const map = document.querySelector("#map");
    if (!map) return null;
    const rect = map.getBoundingClientRect();
    return {
      x: rect.left + rect.width * xFraction,
      y: rect.top + rect.height * yFraction,
    };
  }, { xFraction, yFraction });
  assert(point, "Map element not found");
  await page.mouse.click(point.x, point.y);
  await page.waitForTimeout(1200);
}

async function jumpToNevadaCity(page, zoom) {
  await page.evaluate((zoom) => {
    window.__map.jumpTo({ center: [-121.0169, 39.2622], zoom });
  }, zoom);
  await page.waitForTimeout(2200);
}

async function zoomIntoNevadaCity(page) {
  await jumpToNevadaCity(page, 14.25);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    let capturedMaplibre;
    Object.defineProperty(window, "maplibregl", {
      configurable: true,
      get() {
        return capturedMaplibre;
      },
      set(value) {
        if (value?.Map && !value.Map.__cla33Wrapped) {
          const OriginalMap = value.Map;
          value.Map = class WrappedMap extends OriginalMap {
            constructor(options) {
              super(options);
              window.__map = this;
            }
          };
          value.Map.__cla33Wrapped = true;
        }
        capturedMaplibre = value;
      },
    });
  });

  try {
    await page.goto(APP_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await waitForMap(page);

    await clickMapFraction(page, 0.52, 0.48);
    const localRevealText = await page.locator(".local-reveal-summary").first().textContent({ timeout: 500 }).catch(() => "");
    assert(!localRevealText, "Map click entered Local Reveal", { localRevealText });

    // Task 0 — Zoom hysteresis: below the off-threshold (~12.7), the map is
    // dots-only. A conventional map does not label until a neighborhood is
    // genuinely small. The rejected build showed labels at any zoom >= 11.75.
    await jumpToNevadaCity(page, 12.0);
    const labelsBelowOffThreshold = await page.locator(".map-smart-label").count();
    assert(labelsBelowOffThreshold === 0, "Labels shown below the off-threshold (should be dots-only)", { labelsBelowOffThreshold });

    // Arriving fresh inside the hysteresis band (from below the off-threshold)
    // stays dots-only — the band has not been entered from above.
    await jumpToNevadaCity(page, 12.9);
    const labelsBandFromBelow = await page.locator(".map-smart-label").count();
    assert(labelsBandFromBelow === 0, "Labels shown inside band when arriving from below (no hysteresis)", { labelsBandFromBelow });

    // Cross the on-threshold (labels ON), then drop into the band: labels stay
    // ON. Small zoom nudges around the boundary must not thrash labels.
    await jumpToNevadaCity(page, 13.5);
    const labelsAboveOn = await page.locator(".map-smart-label").count();
    assert(labelsAboveOn > 0, "Labels not shown above the on-threshold", { labelsAboveOn });
    await jumpToNevadaCity(page, 12.9);
    const labelsBandFromAbove = await page.locator(".map-smart-label").count();
    assert(labelsBandFromAbove > 0, "Labels dropped inside band when arriving from above (no hysteresis)", { labelsBandFromAbove });

    await zoomIntoNevadaCity(page);
    const smartLabels = await page.locator(".map-smart-label").count();
    assert(smartLabels > 0, "Close zoom did not show place labels", { smartLabels });

    // Task 1 — Importance ranking: high-importance places (selected/previewed/
    // anchor; tier <= 2) must win a label over ordinary dots. The rejected build
    // ranked ordinary dots by ascending density and let dense-cluster collisions
    // starve the anchor — so an in-view anchor could go unlabeled while ordinary
    // dots got labels. Importance must win.
    const ranking = await page.evaluate(() => window.__smartLabelDebug);
    assert(ranking && Array.isArray(ranking.candidates), "Ranking debug seam not published", { ranking });
    const importantUnlabeled = ranking.candidates.filter((c) => c.importanceTier <= 2 && !c.labeled);
    assert(importantUnlabeled.length === 0, "An in-view high-importance place was not labeled (importance lost to ordinary dots)", {
      importantUnlabeled: importantUnlabeled.map((c) => ({ name: c.name, tier: c.importanceTier })),
    });

    // Task 2 — Placement stability (variable-anchor + last-position cache).
    // A label only switches sides when its previous side now genuinely collides,
    // so panning does not flip-flop anchors. The rejected build rebuilt from
    // scratch with no reuse, so a pan could flip sides (jitter). Snapshot the
    // labeled set, pan far, snapshot again: no place labeled in both views may
    // have changed its anchor side.
    const labeledSnapshot = () => page.evaluate(() =>
      window.__smartLabelDebug.candidates.filter((c) => c.labeled).map((c) => ({ id: c.id, name: c.name, posClass: c.posClass })));
    const beforePan = await labeledSnapshot(); // already centered at z14.25 from zoomIntoNevadaCity
    await page.evaluate(() => window.__map.jumpTo({ center: [-121.0100, 39.2640], zoom: 14.25 }));
    await page.waitForTimeout(2200);
    const afterPan = await labeledSnapshot();
    const beforeMap = new Map(beforePan.map((c) => [c.id, c.posClass]));
    const anchorFlips = afterPan.filter((c) => beforeMap.has(c.id) && beforeMap.get(c.id) !== c.posClass);
    assert(anchorFlips.length === 0, "Label anchor sides flipped on pan (placement not stable)", {
      anchorFlips: anchorFlips.map((c) => ({ name: c.name, from: beforeMap.get(c.id), to: c.posClass })),
    });

    // Task 3 — Hover enrichment: hovering a place must label it (the popup tail
    // already anchors the card; the gap was that labels didn't refresh on hover,
    // so a hovered ordinary dot stayed unlabeled). Invariant: a previewed place
    // is always labeled. Re-center, pick an in-view unlabeled ordinary dot,
    // hover its screen point, then assert whatever got previewed is labeled.
    await jumpToNevadaCity(page, 14.25);
    const hoverTarget = await page.evaluate(() => {
      const dbg = window.__smartLabelDebug;
      const map = document.querySelector("#map");
      const rect = map.getBoundingClientRect();
      const cx = rect.width / 2, cy = rect.height / 2;
      // Pick the unlabeled ordinary dot closest to viewport center for the most
      // reliable hover hit (edge dots may be clipped / overlap nothing).
      const ranked = dbg.candidates
        .filter((c) => !c.labeled && c.importanceTier >= 4)
        .map((c) => {
          const p = window.__map.project([c.lng, c.lat]);
          return { id: c.id, name: c.name, sx: p.x, sy: p.y, d: Math.hypot(p.x - cx, p.y - cy) };
        })
        .sort((a, b) => a.d - b.d);
      const target = ranked[0];
      if (!target) return null;
      return { id: target.id, name: target.name, x: rect.left + target.sx, y: rect.top + target.sy };
    });
    assert(hoverTarget, "No unlabeled in-view ordinary dot available to hover-test");
    // Move in steps so MapLibre registers a real pointer movement over the dot.
    await page.mouse.move(hoverTarget.x - 40, hoverTarget.y - 40);
    await page.mouse.move(hoverTarget.x, hoverTarget.y, { steps: 8 });
    await page.waitForTimeout(1000);
    const hoverState = await page.evaluate(() => {
      const dbg = window.__smartLabelDebug;
      const previewed = dbg.candidates.find((c) => c.id === dbg.previewPlaceId);
      return { previewPlaceId: dbg.previewPlaceId, previewedLabeled: previewed ? previewed.labeled : null };
    });
    assert(hoverState.previewPlaceId, "Hovering a dot did not set a preview", { hoverTarget, hoverState });
    assert(hoverState.previewedLabeled === true, "Hovered (previewed) place is not labeled", { hoverState });

    // Task 4 — De-overload red; selection distinct. Red meant three things
    // (always-on anchor rings + selection ring + halo), so a selected place
    // among anchors was indistinguishable. Selection must be categorically
    // distinct and singular: exactly one place selected, and the selected smart
    // label must carry `.selected` so it matches the selected pin.
    await jumpToNevadaCity(page, 14.25);
    await page.locator(".map-smart-label", { hasText: "Nevada Theatre" }).first().click();
    await page.waitForTimeout(2500);
    const selectedLabels = await page.locator(".map-smart-label.selected").count();
    assert(selectedLabels === 1, "Selected smart label is not singular / missing .selected class", { selectedLabels });
    const selectionState = await page.evaluate(() => {
      const dbg = window.__smartLabelDebug;
      return {
        selectedPlaceId: dbg.selectedPlaceId,
        selectedTierCount: dbg.candidates.filter((c) => c.importanceTier === 0).length,
      };
    });
    assert(selectionState.selectedPlaceId, "Clicking a label did not select a place", { selectionState });
    assert(selectionState.selectedTierCount === 1, "Not exactly one place is selected", { selectionState });

    // Task 5 — Regression: the dense downtown blob stays dots. Clicking into the
    // dense cluster must not enter Local Reveal (the killed spotlight) or
    // spread/spiderfy the cluster into extra markers. Snapshot the rendered
    // dot count over the blob, click it, and confirm no Local Reveal summary
    // appears and the cluster is not spread into new markers.
    await jumpToNevadaCity(page, 14.25);
    const denseDotsBefore = await page.evaluate(() =>
      window.__map.queryRenderedFeatures({ layers: ["place-density"] }).length);
    await clickMapFraction(page, 0.5, 0.5);
    const denseRevealText = await page.locator(".local-reveal-summary").first().textContent({ timeout: 500 }).catch(() => "");
    assert(!denseRevealText, "Dense-cluster click entered Local Reveal", { denseRevealText });
    const denseDotsAfter = await page.evaluate(() =>
      window.__map.queryRenderedFeatures({ layers: ["place-density"] }).length);
    assert(denseDotsAfter <= denseDotsBefore + 1, "Dense cluster was spread/spiderfied on click", { denseDotsBefore, denseDotsAfter });

    console.log(JSON.stringify({ allPass: true, labelsBelowOffThreshold, labelsBandFromBelow, labelsAboveOn, labelsBandFromAbove, smartLabels, importantUnlabeled: importantUnlabeled.length, anchorFlips: anchorFlips.length, previewedLabeled: hoverState.previewedLabeled, selectedLabels, denseSpread: false }, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(JSON.stringify({
    allPass: false,
    message: error.message,
    details: error.details || {},
  }, null, 2));
  process.exit(1);
});
