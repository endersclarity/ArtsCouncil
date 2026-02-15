(function() {
  'use strict';

  function getAssetsCircleLayerDef() {
    return {
      id: 'assets-circle',
      type: 'circle',
      source: 'assets',
      paint: {
        'circle-radius': [
          'case',
          ['boolean', ['feature-state', 'hover'], false], 8,
          5
        ],
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.85,
        'circle-stroke-color': 'rgba(255,255,255,0.6)',
        'circle-stroke-width': 1.5,
        'circle-stroke-opacity': 1
      }
    };
  }

  function getAssetsHitLayerDef() {
    return {
      id: 'assets-hit',
      type: 'circle',
      source: 'assets',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 10,
          10, 12,
          14, 14
        ],
        'circle-color': '#000000',
        'circle-opacity': 0,
        'circle-stroke-opacity': 0
      }
    };
  }

  function getAssetsMobileLabelsLayerDef({
    mobileLabelMinZoom,
    mobileLabelSizeBase,
    mobileLabelSizeLarge
  }) {
    return {
      id: 'assets-mobile-labels',
      type: 'symbol',
      source: 'assets',
      layout: {
        'text-field': ['get', 'label_name'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Regular'],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          mobileLabelMinZoom, mobileLabelSizeBase,
          13, 11.5,
          15, mobileLabelSizeLarge
        ],
        'text-anchor': 'top',
        'text-offset': [0, 1],
        'text-max-width': 12,
        'text-optional': true,
        'text-allow-overlap': false,
        'text-ignore-placement': false,
        'visibility': 'none'
      },
      paint: {
        'text-color': 'rgba(42,68,86,0.92)',
        'text-halo-color': 'rgba(244,239,230,0.96)',
        'text-halo-width': 1.15,
        'text-halo-blur': 0.5,
        'text-opacity': 0.92
      }
    };
  }

  function getAssetsSymbolLayerDef() {
    return {
      id: 'assets-symbols',
      type: 'symbol',
      source: 'assets',
      layout: {
        'icon-image': ['get', 'icon_key'],
        'icon-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 0.35,
          12, 0.55,
          15, 0.7
        ],
        'icon-allow-overlap': true,
        'icon-ignore-placement': false,
        'icon-optional': true
      },
      paint: {
        'icon-opacity': 0.92
      }
    };
  }

  window.CulturalMapAssetLayerDefs = {
    getAssetsCircleLayerDef,
    getAssetsSymbolLayerDef,
    getAssetsHitLayerDef,
    getAssetsMobileLabelsLayerDef
  };
})();
