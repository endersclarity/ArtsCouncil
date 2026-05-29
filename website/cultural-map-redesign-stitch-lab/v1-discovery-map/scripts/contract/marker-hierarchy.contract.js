/*
 * Marker Hierarchy contract — GitHub #76 ("implement marker hierarchy beyond density")
 * and the regression repaired for #66/#75 ("Constellation Disclosure" / density-scaled markers).
 *
 * WHY this is a browser/CDP contract and not a node:test:
 *   app.js is a bundler-less IIFE loaded via a plain <script> tag, and the marker
 *   states live in declarative MapLibre paint expressions evaluated per-feature on the
 *   GPU — there is no callable JS seam to unit-test. The real, honest contract is the
 *   rendered map. This file is the repeatable assertion suite that exercises it.
 *
 * HOW to run:
 *   1. Serve the map (e.g. http://127.0.0.1:4178/v1-discovery-map/index.html) and open it
 *      in a browser with the map instance exposed. The app does not expose the map globally,
 *      so capture it by reloading with this init script FIRST (CDP navigate initScript, or
 *      paste before load):
 *        (function(){var iv=setInterval(function(){if(window.maplibregl&&window.maplibregl.Map&&!window.__mapHooked){
 *          window.__mapHooked=true;var O=window.maplibregl.Map;function P(){var i=new O(arguments[0]);
 *          window.__map=i;return i;}P.prototype=O.prototype;window.maplibregl.Map=P;clearInterval(iv);}},5);})();
 *   2. In the page console (or via chrome-devtools evaluate_script), run:
 *        await runMarkerHierarchyContract(window.__map)
 *   3. Expect { allPass: true, failures: [] }.
 *
 * Each check maps to a #76 acceptance criterion (or the #66/#75 regression repair).
 */
async function runMarkerHierarchyContract(map) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  if (!map) return { allPass: false, failures: [{ name: "map missing", detail: "pass window.__map" }] };

  // Use a downtown-GV view where anchors + dense constellations are present.
  map.jumpTo({ center: [-121.061, 39.219], zoom: 13 });
  await wait(500);

  const checks = [];
  const assert = (name, cond, detail) => checks.push({ name, pass: !!cond, detail });

  // C1 — #76: visitor categories / Outing Types / MUSE must NOT become marker icons.
  // The only way letters reach the map is a place-sourced symbol layer; there must be none.
  const placeSymbolLayers = map
    .getStyle()
    .layers.filter((l) => l.type === "symbol" && l.source === "places")
    .map((l) => l.id);
  assert("C1 no category/Outing-Type/MUSE marker icons (no place symbol layers)", placeSymbolLayers.length === 0, placeSymbolLayers);

  // C2 — #76: authored anchor places use a restrained Soft Ring (the anchor-rings circle layer).
  const ringsRendered = map.queryRenderedFeatures({ layers: ["anchor-rings"] }).length;
  assert("C2 anchor Soft Ring present & rendering", !!map.getLayer("anchor-rings") && ringsRendered > 0, { ringsRendered });

  // C3 — drift repair: anchors are GL-only; no DOM anchor overlay can swim behind the basemap.
  assert("C3 zero HTML anchor markers (drift overlay removed)", document.querySelectorAll(".anchor-marker").length === 0);

  // C4 — #76 state priority: selected outranks anchor. In place-points circle-radius the
  // "selected" case must be evaluated before the "anchor" case.
  const radStr = JSON.stringify(map.getPaintProperty("place-points", "circle-radius"));
  const selIdx = radStr.indexOf('"selected"');
  const anchIdx = radStr.indexOf('"anchor"');
  assert("C4 selected marker outranks anchor (priority order)", selIdx > -1 && anchIdx > -1 && selIdx < anchIdx);

  // C5 — CLA-32: coordinate trust/provenance must not be encoded in marker styling.
  // "candidate" can remain data for cards/details, but marker paint must not branch on it.
  const fill = JSON.stringify(map.getPaintProperty("place-density", "circle-color"));
  const strokeColor = JSON.stringify(map.getPaintProperty("place-density", "circle-stroke-color"));
  const placePaint = [
    fill,
    strokeColor,
    JSON.stringify(map.getPaintProperty("place-density", "circle-radius")),
    JSON.stringify(map.getPaintProperty("place-points", "circle-color")),
    JSON.stringify(map.getPaintProperty("place-points", "circle-stroke-color")),
  ].join(" ");
  assert("C5 no coordinate-trust marker styling", !placePaint.includes("candidate") && !placePaint.includes("markerTier"), placePaint);

  // C6 — #66/#75 regression repair: place-density actually renders the constellation base.
  // (It was silently dropped at load by an invalid zoom-in-case expression introduced in PR #71.)
  assert("C6 place-density renders (constellation base restored)", map.queryRenderedFeatures({ layers: ["place-density"] }).length > 0);

  // C7 — CLA-32: events use a distinct diamond symbol, not another circular dot language.
  const eventLayer = map.getLayer("event-points");
  const eventIcon = JSON.stringify(map.getLayoutProperty("event-points", "icon-image"));
  assert("C7 events render as a diamond symbol layer", eventLayer?.type === "symbol" && eventIcon.includes("event-diamond"), { type: eventLayer?.type, eventIcon });

  // C8 — CLA-32: event hit area remains generous after switching visible events to symbols.
  assert("C8 invisible event hit target exists", !!map.getLayer("event-hit-target"));

  // C9 — CLA-32: white may be halo/stroke only, not selected/anchor fill.
  const placePointFill = JSON.stringify(map.getPaintProperty("place-points", "circle-color"));
  assert("C9 no white-filled semantic place markers", !placePointFill.includes("#ffffff") && !placePointFill.includes("paper"), placePointFill);

  // C10 — CLA-32: red rings are reserved for anchor/featured emphasis, not broad content tags.
  const anchorRingFilter = JSON.stringify(map.getFilter("anchor-rings"));
  assert("C10 rings are not applied to broad muse/sampler/current-context sets", !anchorRingFilter.includes("musePick") && !anchorRingFilter.includes("sampler") && !anchorRingFilter.includes("currentContext"), anchorRingFilter);

  return {
    allPass: checks.every((c) => c.pass),
    failures: checks.filter((c) => !c.pass),
    checks: checks.map((c) => ({ name: c.name, pass: c.pass })),
  };
}

if (typeof module !== "undefined" && module.exports) module.exports = { runMarkerHierarchyContract };
if (typeof window !== "undefined") window.runMarkerHierarchyContract = runMarkerHierarchyContract;
