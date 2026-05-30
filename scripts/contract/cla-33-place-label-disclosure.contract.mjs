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

async function zoomIntoNevadaCity(page) {
  await page.evaluate(() => {
    window.__map.jumpTo({ center: [-121.0169, 39.2622], zoom: 14.25 });
  });
  await page.waitForTimeout(2200);
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

    await zoomIntoNevadaCity(page);
    const smartLabels = await page.locator(".map-smart-label").count();
    assert(smartLabels > 0, "Close zoom did not show place labels", { smartLabels });

    console.log(JSON.stringify({ allPass: true, smartLabels }, null, 2));
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
