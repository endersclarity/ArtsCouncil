(function() {
  'use strict';

  function bindAssetInteractions(ctx) {
    const {
      map,
      isCoarsePointer,
      data,
      hoverPopup,
      markMapInteracted,
      getHoveredFeatureId,
      setHoveredFeatureId,
      buildFeatureTooltipHTML,
      openDetail,
      cancelTour,
      showTourPopup,
      hideTourPopup,
      updateMapProgressiveLabels,
      updateMobileLabelLayerVisibility,
      scheduleSmartLabelUpdate,
      updateMapFilters,
      scheduleIdlePreview
    } = ctx;

    map.on('mousemove', 'assets-hit', (event) => {
      markMapInteracted();
      map.getCanvas().style.cursor = 'pointer';
      if (event.features.length === 0) return;
      const feature = event.features[0];

      const prevHovered = getHoveredFeatureId();
      if (prevHovered !== null) {
        map.setFeatureState({ source: 'assets', id: prevHovered }, { hover: false });
      }
      setHoveredFeatureId(feature.id);
      map.setFeatureState({ source: 'assets', id: feature.id }, { hover: true });
      const coords = (feature.geometry && feature.geometry.type === 'Point' && Array.isArray(feature.geometry.coordinates))
        ? feature.geometry.coordinates
        : [event.lngLat.lng, event.lngLat.lat];

      hoverPopup
        .setLngLat(coords)
        .setHTML(buildFeatureTooltipHTML(feature.properties || {}))
        .addTo(map);
    });

    map.on('mouseleave', 'assets-hit', () => {
      map.getCanvas().style.cursor = '';
      const hovered = getHoveredFeatureId();
      if (hovered !== null) {
        map.setFeatureState({ source: 'assets', id: hovered }, { hover: false });
        setHoveredFeatureId(null);
      }
      hoverPopup.remove();
    });

    if (isCoarsePointer && map.getLayer('assets-mobile-labels')) {
      map.on('click', 'assets-mobile-labels', (event) => {
        if (!event.features || event.features.length === 0) return;
        const feature = event.features[0];
        const featureIdx = Number(feature.properties && feature.properties.idx);
        const venue = Number.isInteger(featureIdx) ? data[featureIdx] : null;
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
          zoom: Math.max(map.getZoom(), 13.2),
          pitch: Math.max(map.getPitch(), 45),
          bearing: map.getBearing(),
          duration: 620,
          essential: true
        });
      });
      map.on('mouseenter', 'assets-mobile-labels', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'assets-mobile-labels', () => { map.getCanvas().style.cursor = ''; });
    }

    let clickFlyId = 0;
    const isMobileClick = window.matchMedia('(max-width: 900px)').matches;
    map.on('click', 'assets-hit', (event) => {
      markMapInteracted();
      if (event.features.length === 0) return;
      const feature = event.features[0];
      const featureIdx = Number(feature.properties && feature.properties.idx);
      const venue = Number.isInteger(featureIdx) ? data[featureIdx] : data.find((item) => item.n === feature.properties.name);
      if (!venue) return;

      var analytics = window.CulturalMapAnalytics;
      if (analytics) {
        analytics.track('marker:click', {
          name: (venue.n || '').substring(0, 100),
          category: venue.l || '',
          city: venue.c || ''
        });
      }

      cancelTour();
      hoverPopup.remove();
      const thisClick = ++clickFlyId;

      if (isMobileClick) {
        openDetail(venue);
        map.flyTo({
          center: [venue.x, venue.y],
          zoom: Math.max(map.getZoom(), 13),
          pitch: Math.max(map.getPitch(), 45),
          bearing: map.getBearing(),
          duration: 800,
          essential: true
        });
      } else {
        const currentCenter = map.getCenter();
        const markerLngLat = new maplibregl.LngLat(venue.x, venue.y);
        const distanceMeters = currentCenter.distanceTo(markerLngLat);
        const currentZoom = map.getZoom();
        const shouldFly = distanceMeters > 220 || currentZoom < 14.5;

        if (shouldFly) {
          map.flyTo({
            center: [venue.x, venue.y],
            zoom: Math.max(currentZoom, 14.5),
            pitch: Math.max(map.getPitch(), 50),
            bearing: map.getBearing(),
            duration: 900,
            essential: true
          });
          map.once('moveend', () => {
            if (thisClick !== clickFlyId) return;
            showTourPopup({ data: venue });
            setTimeout(() => {
              if (thisClick !== clickFlyId) return;
              openDetail(venue);
              setTimeout(() => hideTourPopup(), 450);
            }, 500);
          });
        } else {
          showTourPopup({ data: venue });
          setTimeout(() => {
            if (thisClick !== clickFlyId) return;
            openDetail(venue);
            setTimeout(() => hideTourPopup(), 420);
          }, 250);
        }
      }
    });

    map.on('dragstart', markMapInteracted);
    map.on('zoomstart', markMapInteracted);
    map.on('rotatestart', markMapInteracted);
    map.on('pitchstart', markMapInteracted);
    map.on('move', scheduleSmartLabelUpdate);
    map.on('pitch', scheduleSmartLabelUpdate);
    map.on('rotate', scheduleSmartLabelUpdate);
    map.on('resize', scheduleSmartLabelUpdate);

    const refreshLabels = () => {
      updateMapProgressiveLabels();
      updateMobileLabelLayerVisibility();
    };
    map.on('moveend', refreshLabels);
    map.on('zoomend', refreshLabels);
    map.on('idle', refreshLabels);

    map.getCanvas().addEventListener('wheel', markMapInteracted, { passive: true });
    map.getCanvas().addEventListener('mousedown', markMapInteracted);
    map.getCanvas().addEventListener('touchstart', markMapInteracted, { passive: true });

    updateMapFilters();
    refreshLabels();
    scheduleIdlePreview();
  }

  window.CulturalMapAssetInteractions = {
    bindAssetInteractions
  };
})();
