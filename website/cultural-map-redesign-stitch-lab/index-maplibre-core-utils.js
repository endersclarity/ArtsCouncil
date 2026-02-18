(function() {
  'use strict';

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isValidCountyCoord(coord) {
    if (!Array.isArray(coord) || coord.length < 2) return false;
    const lon = Number(coord[0]);
    const lat = Number(coord[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return false;
    return lon >= -125 && lon <= -114 && lat >= 35 && lat <= 43;
  }

  function sanitizeCountyOutline(geojson) {
    if (!geojson || !Array.isArray(geojson.features)) return null;
    const cleanedFeatures = geojson.features.map((feature) => {
      if (!feature || !feature.geometry) return null;
      const { type, coordinates } = feature.geometry;
      if (type === 'Polygon' && Array.isArray(coordinates) && Array.isArray(coordinates[0])) {
        const outer = coordinates[0].filter(isValidCountyCoord);
        if (outer.length < 4) return null;
        return {
          ...feature,
          geometry: { type: 'Polygon', coordinates: [outer] }
        };
      }
      if (type === 'MultiPolygon' && Array.isArray(coordinates)) {
        const polygons = coordinates
          .map((poly) => {
            if (!Array.isArray(poly) || !Array.isArray(poly[0])) return null;
            const outer = poly[0].filter(isValidCountyCoord);
            if (outer.length < 4) return null;
            return [outer];
          })
          .filter(Boolean);
        if (!polygons.length) return null;
        return {
          ...feature,
          geometry: { type: 'MultiPolygon', coordinates: polygons }
        };
      }
      return null;
    }).filter(Boolean);

    if (!cleanedFeatures.length) return null;
    return {
      type: 'FeatureCollection',
      features: cleanedFeatures
    };
  }

  /**
   * Parse URL search string into deep-link state object.
   * e.g. "?cats=Historic+Landmarks,Galleries&open=1&pid=42" =>
   *   { cats: ['Historic Landmarks', 'Galleries'], open: '1', pid: '42' }
   */
  function parseDeepLinkSearch(search) {
    var params = new URLSearchParams(search || '');
    var result = {};
    var catsRaw = params.get('cats');
    result.cats = catsRaw ? catsRaw.split(',').map(function(c) { return decodeURIComponent(c.trim()); }).filter(Boolean) : [];
    var scalars = ['open', 'events14d', 'experience', 'itinerary', 'muse', 'pid', 'event', 'eventDate', 'eventCat', 'eventAudience', 'trip'];
    for (var i = 0; i < scalars.length; i++) {
      var key = scalars[i];
      var val = params.get(key);
      if (val !== null) result[key] = val;
    }
    var idxRaw = params.get('idx');
    if (idxRaw !== null && /^\d+$/.test(idxRaw)) {
      result.idx = parseInt(idxRaw, 10);
    }
    return result;
  }

  /**
   * Serialize deep-link state object to URL search string.
   * Omits null/undefined/empty values. Returns '' or '?key=val&...'
   */
  function serializeDeepLinkSearch(state) {
    if (!state) return '';
    var parts = [];
    if (state.cats && state.cats.length) {
      parts.push('cats=' + state.cats.map(function(c) { return encodeURIComponent(c); }).join(','));
    }
    var scalars = ['open', 'events14d', 'experience', 'itinerary', 'muse', 'pid', 'event', 'eventDate', 'eventCat', 'eventAudience', 'trip'];
    for (var i = 0; i < scalars.length; i++) {
      var key = scalars[i];
      var val = state[key];
      if (val !== null && val !== undefined && val !== '') {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
      }
    }
    if (state.idx !== null && state.idx !== undefined) {
      parts.push('idx=' + String(state.idx));
    }
    return parts.length ? '?' + parts.join('&') : '';
  }

  /**
   * Normalize a raw category name to the consolidated 8-category system.
   * Uses CATEGORY_MAP from config; unmapped names pass through unchanged.
   */
  function normalizeCategory(rawLayer, categoryMap) {
    if (!rawLayer) return rawLayer;
    return categoryMap[rawLayer] || rawLayer;
  }

  /**
   * Extract a city name from an address string for assets with blank city field.
   * Scans for known Nevada County city names near the end of the address.
   */
  var KNOWN_CITIES = [
    'Nevada City', 'Grass Valley', 'Truckee', 'Penn Valley',
    'North San Juan', 'Rough and Ready', 'Alta Sierra', 'Soda Springs',
    'Norden', 'Washington', 'Chicago Park', 'Cedar Ridge',
    'Lake of the Pines', 'Lake Wildwood', 'Tahoe City',
    'Colfax', 'Auburn', 'Dutch Flat', 'Gold Run', 'Alta',
    'Donner Summit', 'Smartsville', 'French Corral'
  ];

  function extractCityFromAddress(address) {
    if (!address) return '';
    var addr = String(address);
    for (var i = 0; i < KNOWN_CITIES.length; i++) {
      var city = KNOWN_CITIES[i];
      // Match city name after a comma or at end of string
      var re = new RegExp('(?:,\\s*|\\b)' + city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:\\s*,|\\s*$|\\s+CA)', 'i');
      if (re.test(addr)) return city;
    }
    return '';
  }

  window.CulturalMapCoreUtils = {
    hexToRgba,
    escapeHTML,
    isValidCountyCoord,
    sanitizeCountyOutline,
    parseDeepLinkSearch,
    serializeDeepLinkSearch,
    normalizeCategory,
    extractCityFromAddress
  };
})();
