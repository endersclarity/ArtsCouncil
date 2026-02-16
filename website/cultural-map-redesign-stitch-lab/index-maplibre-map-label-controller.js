(function() {
  'use strict';

  function createMapLabelController(ctx) {
    const {
      map,
      data,
      cats,
      escapeHTML,
      mapInteractionModel,
      mapStyleModel,
      hoverPopup,
      buildFeatureTooltipHTML,
      openDetail,
      getActiveExperience,
      getOpenNowMode,
      getHoveredFeatureId,
      setHoveredFeatureId,
      isCoarsePointer = false,
      smartLabelsEnabled = false,
      labelMaxVisible = 32,
      labelAllThreshold = 16,
      labelSubsetCount = 12,
      mobileLabelMinZoom = 11.2,
      mobileLabelMaxVisible = 46
    } = ctx;

    let hasUserInteractedWithMap = false;
    let idlePreviewTimer = null;
    let idlePreviewFeatureId = null;
    let smartLabelLayer = null;
    let smartLabelFrame = null;

    function clearIdlePreviewHoverState() {
      if (idlePreviewFeatureId !== null && map && map.getSource('assets')) {
        map.setFeatureState({ source: 'assets', id: idlePreviewFeatureId }, { hover: false });
      }
      idlePreviewFeatureId = null;
    }

    function stopIdlePreview() {
      if (idlePreviewTimer) {
        clearTimeout(idlePreviewTimer);
        idlePreviewTimer = null;
      }
      clearIdlePreviewHoverState();
      if (getHoveredFeatureId() === null && hoverPopup) hoverPopup.remove();
    }

    function clearMapLabelStates() {
      if (smartLabelLayer) smartLabelLayer.innerHTML = '';
    }

    function ensureSmartLabelLayer() {
      if (!smartLabelsEnabled || smartLabelLayer) return;
      const mapEl = document.getElementById('map');
      if (!mapEl) return;
      const layer = document.createElement('div');
      layer.className = 'smart-label-layer';
      layer.id = 'smartLabelLayer';
      layer.addEventListener('click', (event) => {
        const card = event.target.closest('.smart-label-card');
        if (!card) return;
        const idx = Number(card.getAttribute('data-idx'));
        if (!Number.isFinite(idx) || idx < 0 || idx >= data.length) return;
        const venue = data[idx];
        if (!venue || !venue.x || !venue.y) return;
        var analytics = window.CulturalMapAnalytics;
        if (analytics) {
          analytics.track('marker:click', {
            name: (venue.n || '').substring(0, 100),
            category: venue.l || '',
            city: venue.c || ''
          });
        }
        openDetail(venue);
        map.flyTo({
          center: [venue.x, venue.y],
          zoom: Math.max(map.getZoom(), 14),
          pitch: map.getPitch(),
          bearing: map.getBearing(),
          duration: 550,
          essential: true
        });
      });
      mapEl.appendChild(layer);
      smartLabelLayer = layer;
    }

    function updateMapProgressiveLabels() {
      if (!map || !map.getLayer('assets-circle') || !map.getSource('assets')) return;
      ensureSmartLabelLayer();
      if (getActiveExperience()) {
        clearMapLabelStates();
        return;
      }
      if (!smartLabelsEnabled || !smartLabelLayer) return;

      const rendered = map.queryRenderedFeatures({ layers: ['assets-circle'] }) || [];
      const plan = mapInteractionModel.getSmartLabelRenderPlan({
        renderedFeatures: rendered,
        map,
        openNowMode: getOpenNowMode(),
        labelMaxVisible,
        labelAllThreshold,
        labelSubsetCount,
        cats,
        escapeHTML
      });
      if (!plan.shouldRender || !plan.html) {
        clearMapLabelStates();
        return;
      }
      smartLabelLayer.innerHTML = plan.html;
    }

    function scheduleSmartLabelUpdate() {
      if (!smartLabelsEnabled) return;
      if (smartLabelFrame) return;
      smartLabelFrame = requestAnimationFrame(() => {
        smartLabelFrame = null;
        updateMapProgressiveLabels();
      });
    }

    function getVisibleAssetFeatureCount() {
      if (!map || !map.getLayer('assets-circle')) return 0;
      const rendered = map.queryRenderedFeatures({ layers: ['assets-circle'] }) || [];
      return mapInteractionModel.getVisibleAssetFeatureCount(rendered);
    }

    function updateMobileLabelLayerVisibility() {
      if (!map || !isCoarsePointer || !map.getLayer('assets-mobile-labels')) return;
      const visibleCount = getVisibleAssetFeatureCount();
      const canShow = mapStyleModel.shouldShowMobileLabels({
        activeExperience: getActiveExperience(),
        zoom: map.getZoom(),
        visibleCount,
        mobileLabelMinZoom,
        mobileLabelMaxVisible
      });
      map.setLayoutProperty('assets-mobile-labels', 'visibility', canShow ? 'visible' : 'none');
    }

    function markMapInteracted() {
      hasUserInteractedWithMap = true;
      stopIdlePreview();
    }

    function scheduleIdlePreview() {
      if (!map || hasUserInteractedWithMap || getActiveExperience() || !map.getLayer('assets-circle')) return;
      if (idlePreviewTimer) clearTimeout(idlePreviewTimer);
      idlePreviewTimer = setTimeout(runIdlePreviewStep, 1200 + Math.random() * 1200);
    }

    function runIdlePreviewStep() {
      if (!map || hasUserInteractedWithMap || getActiveExperience() || !map.getLayer('assets-circle')) return;
      const visible = map.queryRenderedFeatures({ layers: ['assets-circle'] }) || [];
      const feature = mapInteractionModel.pickIdlePreviewFeature({ renderedFeatures: visible, maxPool: 28 });
      if (!feature) {
        scheduleIdlePreview();
        return;
      }
      clearIdlePreviewHoverState();
      const hoveredFeatureId = getHoveredFeatureId();
      if (hoveredFeatureId !== null) {
        map.setFeatureState({ source: 'assets', id: hoveredFeatureId }, { hover: false });
        setHoveredFeatureId(null);
      }
      idlePreviewFeatureId = feature.id;
      map.setFeatureState({ source: 'assets', id: idlePreviewFeatureId }, { hover: true });

      const coords = (feature.geometry && feature.geometry.type === 'Point' && Array.isArray(feature.geometry.coordinates))
        ? feature.geometry.coordinates
        : map.getCenter().toArray();

      hoverPopup
        .setLngLat(coords)
        .setHTML(buildFeatureTooltipHTML(feature.properties || {}))
        .addTo(map);

      idlePreviewTimer = setTimeout(() => {
        clearIdlePreviewHoverState();
        if (!hasUserInteractedWithMap) hoverPopup.remove();
        scheduleIdlePreview();
      }, 1150 + Math.random() * 450);
    }

    return {
      stopIdlePreview,
      clearMapLabelStates,
      updateMapProgressiveLabels,
      scheduleSmartLabelUpdate,
      getVisibleAssetFeatureCount,
      updateMobileLabelLayerVisibility,
      markMapInteracted,
      scheduleIdlePreview
    };
  }

  window.CulturalMapMapLabelController = {
    createMapLabelController
  };
})();
