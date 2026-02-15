(function() {
  'use strict';
  const EARTH_RADIUS_MI = 3958.7613;

  function toRad(value) {
    return (value * Math.PI) / 180;
  }

  function normalizeCoords(coords) {
    if (!coords || typeof coords !== 'object') return null;
    const lng = Number(coords.lng);
    const lat = Number(coords.lat);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    return { lng, lat };
  }

  function distanceMiles(fromCoords, toCoords) {
    const from = normalizeCoords(fromCoords);
    const to = normalizeCoords(toCoords);
    if (!from || !to) return null;
    const dLat = toRad(to.lat - from.lat);
    const dLng = toRad(to.lng - from.lng);
    const lat1 = toRad(from.lat);
    const lat2 = toRad(to.lat);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_MI * c;
  }

  function formatDistanceMiles(miles) {
    const value = Number(miles);
    if (!Number.isFinite(value) || value < 0) return '';
    if (value < 10) return `${value.toFixed(1)} mi away`;
    return `${Math.round(value)} mi away`;
  }

  function compareDistanceMiles(aMiles, bMiles) {
    const aUnknown = aMiles === null || aMiles === undefined || aMiles === '';
    const bUnknown = bMiles === null || bMiles === undefined || bMiles === '';
    const a = Number(aMiles);
    const b = Number(bMiles);
    const aKnown = !aUnknown && Number.isFinite(a);
    const bKnown = !bUnknown && Number.isFinite(b);
    if (aKnown && bKnown) return a - b;
    if (aKnown) return -1;
    if (bKnown) return 1;
    return 0;
  }

  function getGeolocateControlOptions() {
    return {
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      },
      trackUserLocation: true,
      showUserLocation: true,
      showAccuracyCircle: true,
      fitBoundsOptions: {
        maxZoom: 14
      }
    };
  }

  function isSecureGeolocationContext(protocol, hostname) {
    if (protocol === 'https:') return true;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  }

  function shouldAutoTriggerGeolocation(env) {
    const safeEnv = env || {};
    const protocol = safeEnv.protocol || (typeof location !== 'undefined' ? location.protocol : '');
    const hostname = safeEnv.hostname || (typeof location !== 'undefined' ? location.hostname : '');
    const hasGeolocation = typeof safeEnv.hasGeolocation === 'boolean'
      ? safeEnv.hasGeolocation
      : (typeof navigator !== 'undefined' && !!navigator.geolocation);

    if (!hasGeolocation) return false;
    return isSecureGeolocationContext(protocol, hostname);
  }

  function autoTriggerGeolocation(control, options) {
    if (!control || typeof control.trigger !== 'function') return false;
    const safeOptions = options || {};
    if (!shouldAutoTriggerGeolocation(safeOptions.env)) return false;

    const delayMs = Number.isFinite(safeOptions.delayMs) ? safeOptions.delayMs : 350;
    setTimeout(() => {
      try {
        control.trigger();
      } catch (err) {
        console.warn('[Geolocation] Failed to trigger geolocation:', err);
      }
    }, delayMs);
    return true;
  }

  const api = {
    distanceMiles,
    formatDistanceMiles,
    compareDistanceMiles,
    getGeolocateControlOptions,
    shouldAutoTriggerGeolocation,
    autoTriggerGeolocation
  };

  if (typeof window !== 'undefined') {
    window.CulturalMapGeolocationModel = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
