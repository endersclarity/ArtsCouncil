const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const v1Root = path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map");
const appSource = fs.readFileSync(path.join(v1Root, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(v1Root, "styles.css"), "utf8");
const pass = JSON.parse(fs.readFileSync(path.join(v1Root, "data/coordinate_sanity_pass.json"), "utf8"));
const markers = JSON.parse(fs.readFileSync(path.join(v1Root, "data/coordinate_sanity_markers.geojson"), "utf8"));
const places = JSON.parse(fs.readFileSync(path.join(v1Root, "data/places.json"), "utf8"));

const placesByDecision = new Map(places.map((place) => [place.coordinateDecisionId, place]));
const markerIds = new Set(markers.features.map((feature) => feature.properties.decisionId));

// Cohort representatives are pinned by decisionId: the June 2026 coordinate audit
// upgraded some places off their fixture source (osm-nominatim), deduped others onto
// different decision ids (MUSE BD merge), and left downgrade caveats on a few
// still-ArcGIS places — so "first decision matching the source" no longer lands on a
// place that exercises the cohort's caveat contract.
const decisionsById = new Map(pass.decisions.map((decision) => [decision.decisionId, decision]));
const estimatedDecision = decisionsById.get("jacob-van-blaren-penn-valley--historic landmarks table 1--row-107");
const directoryOnlyDecision = decisionsById.get("chris-stevens-court-grass-valley--historic landmarks table 1--row-35");
const dianaDecision = decisionsById.get("112-w-main-st-grass-valley--historic landmarks table 1--row-2");
const arcgisDecision = decisionsById.get("the-willo-steakhouse-nevada-city--muse bd table 1--row-169");

assert.ok(estimatedDecision, "fixture should include a Census/free-geocoded Coordinate Candidate");
assert.ok(directoryOnlyDecision, "fixture should include a Directory-Only Place");
assert.ok(dianaDecision, "fixture should include a Diana Workbook trusted coordinate");
assert.ok(arcgisDecision, "fixture should include an ArcGIS confident fallback coordinate");

assert.equal(estimatedDecision.coordinateSource, "us-census-geocoder", "pinned Coordinate Candidate should stay census-sourced");
assert.equal(directoryOnlyDecision.publicMarker, false, "pinned Directory-Only Place should stay marker-less in the fixture");
assert.match(String(dianaDecision.coordinateSource), /^diana-workbook/, "pinned Diana pick should stay workbook-sourced");
assert.equal(arcgisDecision.coordinateSource, "arcgis-cultural-assets-confident-match", "pinned ArcGIS pick should stay a confident fallback");

const estimatedPlace = placesByDecision.get(estimatedDecision.decisionId);
const directoryOnlyPlace = placesByDecision.get(directoryOnlyDecision.decisionId);
const dianaPlace = placesByDecision.get(dianaDecision.decisionId);
const arcgisPlace = placesByDecision.get(arcgisDecision.decisionId);

assert.ok(estimatedPlace, "Coordinate Candidates should be present in directory data");
assert.ok(directoryOnlyPlace, "Directory-Only Places should remain browseable in directory data");
assert.ok(dianaPlace, "Diana Workbook places should remain present in directory data");
assert.ok(arcgisPlace, "ArcGIS confident fallback places should remain present in directory data");

assert.equal(estimatedPlace.locationCaveat, "Map location not confirmed - estimated");
assert.equal(estimatedPlace.publicMarker, true);
assert.equal(markerIds.has(estimatedPlace.coordinateDecisionId), true, "estimated Coordinate Candidate can keep a review marker");

assert.equal(directoryOnlyPlace.locationCaveat, "Map location coming soon");
assert.equal(directoryOnlyPlace.publicMarker, false);
assert.equal(directoryOnlyPlace.lat, null);
assert.equal(directoryOnlyPlace.lng, null);
assert.equal(markerIds.has(directoryOnlyPlace.coordinateDecisionId), false, "Directory-Only Place should not get a fake marker");

assert.equal(dianaPlace.locationCaveat, "");
assert.equal(arcgisPlace.locationCaveat, "");

assert.match(appSource, /function renderLocationCaveat\(place\)/, "selected cards should render location caveats through one public card path");
assert.match(appSource, /\$\{renderLocationCaveat\(place\)\}/, "selected place drawer should include the caveat slot");
assert.match(appSource, /if \(isPlaceMapReady\(place\)\) \{\r?\n\s*flyToSelection\(/, "map movement should be guarded by map-ready state");
assert.match(appSource, /const mapReadyPlaces = filteredPlaces\(\)\.filter\(isPlaceMapReady\)/, "marker source should exclude Directory-Only Places");
assert.doesNotMatch(appSource, /place-list-badge[^`]+locationCaveat/s, "directory rows should not expose estimated/missing caveats before selection");
assert.match(stylesSource, /\.location-caveat/, "selected-card caveat should have dedicated styling");

console.log("V1 coordinate caveat contract ok");
