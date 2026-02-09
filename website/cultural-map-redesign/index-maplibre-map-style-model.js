(function() {
  'use strict';

  function getAssetPaintStyles({ openNowMode, hasCategoryFilter }) {
    const baseRadius = hasCategoryFilter ? 7 : 5;
    const hoverRadius = hasCategoryFilter ? 10 : 8;

    if (openNowMode) {
      return {
        circleRadius: [
          'case',
          ['boolean', ['feature-state', 'hover'], false], hoverRadius,
          ['==', ['get', 'hours_state'], 'open'], baseRadius + 1.6,
          Math.max(baseRadius - 0.8, 3.8)
        ],
        circleColor: [
          'case',
          ['==', ['get', 'hours_state'], 'open'], ['get', 'color'],
          'rgba(26,22,18,0.16)'
        ],
        circleOpacity: [
          'case',
          ['==', ['get', 'hours_state'], 'open'], 0.96,
          0.34
        ],
        circleStrokeColor: [
          'case',
          ['==', ['get', 'hours_state'], 'open'], '#2fa35b',
          'rgba(26,22,18,0.55)'
        ],
        circleStrokeWidth: [
          'case',
          ['==', ['get', 'hours_state'], 'open'], 2.8,
          1.15
        ],
        circleStrokeOpacity: [
          'case',
          ['==', ['get', 'hours_state'], 'open'], 1,
          0.62
        ],
        mobileTextOpacity: [
          'case',
          ['==', ['get', 'hours_state'], 'open'], 0.95,
          0.42
        ]
      };
    }

    return {
      circleRadius: [
        'case',
        ['boolean', ['feature-state', 'hover'], false], hoverRadius,
        baseRadius
      ],
      circleColor: ['get', 'color'],
      circleOpacity: 0.85,
      circleStrokeColor: 'rgba(255,255,255,0.6)',
      circleStrokeWidth: 1.5,
      circleStrokeOpacity: 1,
      mobileTextOpacity: 0.92
    };
  }

  function shouldShowMobileLabels({
    activeExperience,
    zoom,
    visibleCount,
    mobileLabelMinZoom,
    mobileLabelMaxVisible
  }) {
    return !activeExperience
      && zoom >= mobileLabelMinZoom
      && visibleCount <= mobileLabelMaxVisible
      && visibleCount > 0;
  }

  window.CulturalMapMapStyleModel = {
    getAssetPaintStyles,
    shouldShowMobileLabels
  };
})();
