(function() {
  'use strict';

  function applyAssetFilters({ map, combinedExpr }) {
    map.setFilter('assets-circle', combinedExpr);
    if (map.getLayer('assets-hit')) {
      map.setFilter('assets-hit', combinedExpr);
    }
    if (map.getLayer('assets-mobile-labels')) {
      map.setFilter('assets-mobile-labels', combinedExpr);
    }
  }

  function applyAssetPaintStyles({ map, activeExperience, styles }) {
    if (!map.getLayer('assets-circle') || activeExperience) return;
    map.setPaintProperty('assets-circle', 'circle-radius', styles.circleRadius);
    map.setPaintProperty('assets-circle', 'circle-color', styles.circleColor);
    map.setPaintProperty('assets-circle', 'circle-opacity', styles.circleOpacity);
    map.setPaintProperty('assets-circle', 'circle-stroke-color', styles.circleStrokeColor);
    map.setPaintProperty('assets-circle', 'circle-stroke-width', styles.circleStrokeWidth);
    map.setPaintProperty('assets-circle', 'circle-stroke-opacity', styles.circleStrokeOpacity);
    if (map.getLayer('assets-mobile-labels')) {
      map.setPaintProperty('assets-mobile-labels', 'text-opacity', styles.mobileTextOpacity);
    }
  }

  function recenterAfterFilter({
    map,
    filtered,
    shouldResetView
  }) {
    if (filtered.length) {
      const bounds = filtered.reduce((b, d) => b.extend([d.x, d.y]),
        new maplibregl.LngLatBounds([filtered[0].x, filtered[0].y], [filtered[0].x, filtered[0].y])
      );
      map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
      return;
    }
    if (shouldResetView) {
      map.flyTo({ center: [-120.8, 39.22], zoom: 9, pitch: 0, bearing: 0, duration: 1000 });
    }
  }

  window.CulturalMapMapRenderController = {
    applyAssetFilters,
    applyAssetPaintStyles,
    recenterAfterFilter
  };
})();
