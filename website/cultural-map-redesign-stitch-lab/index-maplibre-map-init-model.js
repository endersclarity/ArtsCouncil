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
      ? 'https://api.maptiler.com/maps/landscape/style.json?key=' + maptilerKey
      : getFallbackStyle();
  }

  function getMapInitOptions(opts) {
    var style = opts.style;
    var cooperativeGestures = opts.cooperativeGestures !== undefined ? opts.cooperativeGestures : false;
    // S14: Mobile-aware initial zoom — show full county at narrow viewports
    var isMobile = window.innerWidth <= 600;
    return {
      container: 'map',
      style: style,
      center: [-120.8, 39.22],
      zoom: isMobile ? 8.5 : 9,
      pitch: isMobile ? 0 : 35,
      bearing: isMobile ? 0 : -15,
      cooperativeGestures: cooperativeGestures,
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
