(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.V1PlaceData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Single source of truth for what image a place shows and its honest status.
  // Dependencies (resolveMedia, categoryPlaceholderFor, defaultPlaceholder) are
  // injected by app.js so this module stays pure and testable, and so app.js
  // keeps ownership of CATEGORY_PLACEHOLDER_IMAGES (its contract test).
  function resolvePlaceImage(place, opts) {
    const image = (place && place.image) || {};
    if (image.kind === "real" && image.src) {
      return {
        src: opts.resolveMedia(image.src),
        isRealImage: true,
        status: "real",
        alt: image.alt || place.name || "",
        credit: image.credit || "",
      };
    }
    // A kind="placeholder" record's per-record src/placeholderSrc is intentionally
    // ignored in favor of the nicer NCAC category placeholder. An image object with
    // no "placeholder" kind but an explicit src still uses that src.
    const explicit = image.kind === "placeholder" ? "" : image.src || image.placeholderSrc;
    const placeholderSrc =
      explicit ||
      opts.categoryPlaceholderFor(place && place.category) ||
      opts.defaultPlaceholder;
    return {
      src: opts.resolveMedia(placeholderSrc),
      isRealImage: false,
      status: "placeholder",
      alt: image.alt || (place && place.name) || "",
      credit: image.credit || "",
    };
  }

  // Indexed place lookup — replaces scattered `places.find(p => p.id === id)`.
  function buildPlaceIndex(places) {
    const index = new Map();
    (places || []).forEach((place) => {
      if (place && place.id != null) index.set(place.id, place);
    });
    return index;
  }

  function placeById(index, id) {
    return index.get(id);
  }

  var VALID_IMAGE_KINDS = new Set(["real", "placeholder"]);

  function normalizeName(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  // Dev-mode integrity check over the place dataset. Returns a flat list of
  // {type, id, detail} problems. The "canonical-name-collision" rule implements
  // the second half of the Canonical Place definition (normalized name+city
  // co-location) that ADR-0001's id-only dedup does not cover.
  function findPlaceDataProblems(places) {
    const list = places || [];
    const problems = [];

    const idCounts = new Map();
    list.forEach((p) => idCounts.set(p.id, (idCounts.get(p.id) || 0) + 1));
    idCounts.forEach((count, id) => {
      if (count > 1) problems.push({ type: "duplicate-id", id: id, detail: count + " records share this id" });
    });

    const nameCityGroups = new Map();
    list.forEach((p) => {
      const key = normalizeName(p.name) + "|" + normalizeName(p.city);
      if (!normalizeName(p.name)) return;
      if (!nameCityGroups.has(key)) nameCityGroups.set(key, []);
      nameCityGroups.get(key).push(p);
    });
    nameCityGroups.forEach((group) => {
      if (group.length > 1) {
        problems.push({
          type: "canonical-name-collision",
          id: group[0].id,
          detail: 'name+city "' + group[0].name + " / " + (group[0].city || "") + '" maps to ' + group.length + " ids: " + group.map((p) => p.id).join(", "),
        });
      }
    });

    list.forEach((p) => {
      if (p.image && p.image.kind != null && !VALID_IMAGE_KINDS.has(p.image.kind)) {
        problems.push({ type: "invalid-image-kind", id: p.id, detail: 'image.kind="' + p.image.kind + '"' });
      }
      if (p.markerTier === "map-ready" && !(Number.isFinite(p.lat) && Number.isFinite(p.lng))) {
        problems.push({ type: "map-ready-missing-coord", id: p.id, detail: "map-ready but lat/lng not finite" });
      }
    });

    return problems;
  }

  return { resolvePlaceImage, buildPlaceIndex, placeById, findPlaceDataProblems };
});
