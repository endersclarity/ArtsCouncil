(function() {
  'use strict';

  function createExperienceController(ctx) {
    const {
      map,
      data,
      cats,
      imageData,
      maptilerKey,
      hexToRgba,
      experienceModel,
      corridorMap,
      tourUtils,
      experienceView,
      experienceUI,
      getOriginalPaintValues,
      clearMapLabelStates,
      updateMobileLabelLayerVisibility,
      updateMapFilters,
      updateMapProgressiveLabels,
      onOpenDetail,
      gsap
    } = ctx;

    let activeExperience = null;
    let currentResolvedStops = [];
    let routeAnimationId = null;
    let tourTimeouts = [];
    let activeMoveendHandler = null;
    let dotPulseTween = null;
    let tourPopup = null;

    function getActiveExperience() {
      return activeExperience;
    }

    function resolveStops(experience) {
      return experienceModel.resolveStops(experience, data);
    }

    function applyTheme(theme, fallbackColor) {
      experienceModel.applyTheme({
        theme,
        fallbackColor,
        map,
        maptilerKey,
        hexToRgba
      });
    }

    function removeTheme() {
      experienceModel.removeTheme({
        map,
        maptilerKey,
        originalPaintValues: getOriginalPaintValues()
      });
    }

    function clearCorridorLayers() {
      if (routeAnimationId) {
        cancelAnimationFrame(routeAnimationId);
        routeAnimationId = null;
      }
      experienceModel.removeCorridorMapLayers(map);
    }

    function showTourPopup(stop) {
      if (!tourPopup) {
        tourPopup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 15,
          maxWidth: '260px'
        });
      }
      const popupHTML = experienceView.getTourPopupHTML({
        stop,
        cats,
        imageData
      });
      tourPopup
        .setLngLat([stop.data.x, stop.data.y])
        .setHTML(popupHTML)
        .addTo(map);
    }

    function hideTourPopup() {
      if (tourPopup) tourPopup.remove();
    }

    function flyToStop(stop, index) {
      map.flyTo(tourUtils.getStopFlyToOptions({
        stop,
        resolved: currentResolvedStops,
        index
      }));
    }

    async function autoTour(resolved) {
      cancelTour();

      // Track auto-tour start
      var analytics = window.CulturalMapAnalytics;
      if (analytics && activeExperience) {
        analytics.track('experience:tour', { slug: (activeExperience.slug || '').substring(0, 100) });
      }

      const tourBtn = document.querySelector('.corridor-tour-btn');
      if (tourBtn) tourBtn.classList.add('touring');

      for (let i = 0; i < resolved.length; i++) {
        hideTourPopup();
        const stop = resolved[i];
        stop.index = i;
        flyToStop(stop, i);

        await new Promise((resolve) => {
          const onEnd = () => {
            map.off('moveend', onEnd);
            activeMoveendHandler = null;
            resolve();
          };
          activeMoveendHandler = onEnd;
          map.on('moveend', onEnd);
          const tid = setTimeout(() => {
            map.off('moveend', onEnd);
            activeMoveendHandler = null;
            resolve();
          }, tourUtils.getMoveEndWaitTimeoutMs());
          tourTimeouts.push(tid);
        });

        showTourPopup(stop);

        await new Promise((resolve) => {
          const tid = setTimeout(resolve, tourUtils.getTourDwellMs());
          tourTimeouts.push(tid);
        });
      }

      hideTourPopup();
      const bounds = corridorMap.getCorridorBounds(resolved);
      map.fitBounds(bounds, tourUtils.getTourEndFitOptions());

      if (tourBtn) tourBtn.classList.remove('touring');
    }

    function cancelTour() {
      tourTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      tourTimeouts = [];
      hideTourPopup();

      if (activeMoveendHandler) {
        map.off('moveend', activeMoveendHandler);
        activeMoveendHandler = null;
      }

      const tourBtn = document.querySelector('.corridor-tour-btn');
      if (tourBtn) tourBtn.classList.remove('touring');
    }

    function buildCorridorPanel(experience, resolved) {
      const panel = document.getElementById('corridorPanel');
      experienceView.buildCorridorPanel({
        panelEl: panel,
        experience,
        resolved,
        hexToRgba,
        onStopClick: (idx) => {
          const stop = resolved[idx];
          if (stop && stop.data) {
            flyToStop(stop, idx);
          }
        },
        onTourClick: (tourBtn) => {
          if (tourBtn.classList.contains('touring')) {
            cancelTour();
          } else {
            autoTour(resolved);
          }
        },
        gsap
      });
    }

    function activateExperience(experience) {
      // Track experience/corridor activation
      var analytics = window.CulturalMapAnalytics;
      if (analytics) {
        analytics.track('experience:start', {
          slug: (experience.slug || '').substring(0, 100),
          title: (experience.title || '').substring(0, 100),
          type: experience.type || 'experience'
        });
      }
      // Deactivate any active itinerary to prevent both being active simultaneously
      if (window.CulturalMapItineraryController) {
        CulturalMapItineraryController.deactivateItinerary();
      }
      activeExperience = experience;
      clearMapLabelStates();
      updateMobileLabelLayerVisibility();
      experienceUI.openExperienceSections(experience.type);

      const resolved = resolveStops(experience);
      if (!resolved.length) return;
      currentResolvedStops = resolved;

      experienceUI.setActiveExperienceCard(experience.slug);
      dotPulseTween = experienceUI.startExperienceCardPulse({
        gsap,
        previousTween: dotPulseTween,
        color: experience.color
      });

      if (experience.theme) applyTheme(experience.theme, experience.color);

      if (map.getLayer('assets-circle')) {
        map.setPaintProperty('assets-circle', 'circle-opacity', 0.12);
        map.setPaintProperty('assets-circle', 'circle-stroke-opacity', 0.08);
        map.setPaintProperty('assets-circle', 'circle-radius', 3);
      }

      clearCorridorLayers();

      const routeCoords = corridorMap.getRouteCoordinates(resolved);
      const routeColor = experience.theme ? experience.theme.routeColor : experience.color;
      const accentColor = experience.theme ? experience.theme.accent : experience.color;

      corridorMap.animateRoute({
        map,
        coordinates: routeCoords,
        duration: 2500,
        onFrameId: (id) => { routeAnimationId = id; }
      });

      corridorMap.addCorridorLayers({
        map,
        routeCoords,
        stopsGeoJSON: corridorMap.getStopsGeoJSON(resolved),
        routeColor,
        accentColor
      });

      map.on('click', 'corridor-stops-labels', (event) => {
        if (!event.features || !event.features[0]) return;
        const name = event.features[0].properties.name;
        const match = data.find((d) => d.n === name);
        if (match) onOpenDetail(match);
      });
      map.on('mouseenter', 'corridor-stops-labels', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'corridor-stops-labels', () => { map.getCanvas().style.cursor = ''; });

      buildCorridorPanel(experience, resolved);

      const bounds = corridorMap.getCorridorBounds(resolved);
      map.fitBounds(bounds, { padding: 80, maxZoom: 13, pitch: 30, duration: 2000 });
    }

    function deactivateExperience() {
      activeExperience = null;
      currentResolvedStops = [];
      cancelTour();

      experienceUI.clearActiveExperienceCards();
      experienceUI.clearExperienceCardPulse({
        gsap,
        tween: dotPulseTween
      });
      dotPulseTween = null;

      removeTheme();
      clearCorridorLayers();

      experienceUI.hideCorridorPanel({
        panelEl: document.getElementById('corridorPanel'),
        gsap
      });

      if (map.getLayer('assets-circle')) {
        map.setPaintProperty('assets-circle', 'circle-opacity', 0.85);
        map.setPaintProperty('assets-circle', 'circle-stroke-opacity', 1);
        updateMapFilters();
        updateMapProgressiveLabels();
        updateMobileLabelLayerVisibility();
      }
    }

    return {
      getActiveExperience,
      activateExperience,
      deactivateExperience,
      cancelTour,
      showTourPopup,
      hideTourPopup,
      flyToStop,
      clearCorridorLayers
    };
  }

  window.CulturalMapExperienceController = {
    createExperienceController
  };
})();
