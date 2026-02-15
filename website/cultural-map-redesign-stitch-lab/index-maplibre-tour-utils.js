(function() {
  'use strict';

  function isMobileViewport() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  function getStopBearing({ resolved, index }) {
    let bearing = 0;
    if (index < resolved.length - 1) {
      const current = resolved[index];
      const next = resolved[index + 1];
      bearing = turf.bearing(
        turf.point([current.data.x, current.data.y]),
        turf.point([next.data.x, next.data.y])
      );
    } else if (index > 0) {
      const prev = resolved[index - 1];
      const current = resolved[index];
      bearing = turf.bearing(
        turf.point([prev.data.x, prev.data.y]),
        turf.point([current.data.x, current.data.y])
      );
    }
    return bearing;
  }

  function getStopFlyToOptions({ stop, resolved, index }) {
    const mobile = isMobileViewport();
    return {
      center: [stop.data.x, stop.data.y],
      zoom: mobile ? 13 : 14.5,
      pitch: mobile ? 45 : 55,
      bearing: getStopBearing({ resolved, index }),
      duration: mobile ? 1200 : 2000,
      essential: true
    };
  }

  function getMoveEndWaitTimeoutMs() {
    return isMobileViewport() ? 2000 : 4000;
  }

  function getTourDwellMs() {
    return isMobileViewport() ? 1500 : 2500;
  }

  function getTourEndFitOptions() {
    return { padding: 60, pitch: 30, duration: 2000 };
  }

  window.CulturalMapTourUtils = {
    getStopFlyToOptions,
    getMoveEndWaitTimeoutMs,
    getTourDwellMs,
    getTourEndFitOptions
  };
})();
