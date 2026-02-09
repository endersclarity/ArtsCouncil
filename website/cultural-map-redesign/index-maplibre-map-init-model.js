(function() {
  'use strict';

  function getFallbackStyle() {
    return {
      version: 8,
      name: 'Dark Fallback',
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }
      },
      layers: [{
        id: 'carto-dark-layer',
        type: 'raster',
        source: 'carto-dark',
        minzoom: 0,
        maxzoom: 19
      }]
    };
  }

  function getMapStyle(maptilerKey) {
    return maptilerKey !== 'GET_YOUR_FREE_KEY_AT_MAPTILER_COM'
      ? `https://api.maptiler.com/maps/landscape/style.json?key=${maptilerKey}`
      : getFallbackStyle();
  }

  function getMapInitOptions({ style, cooperativeGestures = false }) {
    return {
      container: 'map',
      style,
      center: [-120.8, 39.22],
      zoom: 9,
      pitch: 35,
      bearing: -15,
      cooperativeGestures,
      antialias: true,
      maxPitch: 70
    };
  }

  function getHoverPopupOptions() {
    return {
      closeButton: false,
      closeOnClick: false,
      offset: 15,
      maxWidth: '280px'
    };
  }

  window.CulturalMapMapInitModel = {
    getMapStyle,
    getMapInitOptions,
    getHoverPopupOptions
  };
})();
