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

const estimatedDecision = pass.decisions.find((decision) => decision.coordinateSource === "us-census-geocoder");
const directoryOnlyDecision = pass.decisions.find((decision) => decision.publicMarker === false);
const dianaDecision = pass.decisions.find((decision) => String(decision.coordinateSource).startsWith("diana-workbook"));
const arcgisDecision = pass.decisions.find((decision) => decision.coordinateSource === "arcgis-cultural-assets-confident-match");

assert.ok(estimatedDecision, "fixture should include a Census/free-geocoded Coordinate Candidate");
assert.ok(directoryOnlyDecision, "fixture should include a Directory-Only Place");
assert.ok(dianaDecision, "fixture should include a Diana Workbook trusted coordinate");
assert.ok(arcgisDecision, "fixture should include an ArcGIS confident fallback coordinate");

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
assert.match(appSource, /if \(isPlaceMapReady\(place\)\) \{\n\s*state\.map\.flyTo/, "map movement should be guarded by map-ready state");
assert.match(appSource, /const mapReadyPlaces = filteredPlaces\(\)\.filter\(isPlaceMapReady\)/, "marker source should exclude Directory-Only Places");
assert.doesNotMatch(appSource, /place-list-badge[^`]+locationCaveat/s, "directory rows should not expose estimated/missing caveats before selection");
assert.match(stylesSource, /\.location-caveat/, "selected-card caveat should have dedicated styling");

console.log("V1 coordinate caveat contract ok");
