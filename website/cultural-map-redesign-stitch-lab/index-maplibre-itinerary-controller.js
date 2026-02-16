(function() {
  'use strict';

  var itineraryModel = window.CulturalMapItineraryModel || {};
  var itineraryView = window.CulturalMapItineraryView || {};
  var corridorMap = window.CulturalMapCorridorMap || {};

  var state = {
    itineraries: [],
    resolved: {},  // id -> resolvedStops array
    data: [],
    map: null,
    heroContainer: null,
    overlayContainer: null,
    activeId: null,
    routeAnimationId: null
  };

  /**
   * Initialize itinerary system.
   * @param {Object} opts - { itineraries, data, map, heroContainer, overlayContainer }
   */
  function initItineraries(opts) {
    if (!opts) return;
    state.itineraries = opts.itineraries || [];
    state.data = opts.data || [];
    state.map = opts.map || null;
    state.heroContainer = opts.heroContainer || null;
    state.overlayContainer = opts.overlayContainer || null;

    // Pre-resolve stops for all itineraries
    for (var i = 0; i < state.itineraries.length; i++) {
      var it = state.itineraries[i];
      if (it.id) {
        state.resolved[it.id] = itineraryModel.resolveItineraryStops(it, state.data);
      }
    }

    // Render hero cards
    if (state.heroContainer) {
      state.heroContainer.innerHTML = itineraryView.renderHeroCards(state.itineraries);

      // Bind click handlers on hero cards
      var cards = state.heroContainer.querySelectorAll('.itinerary-hero-card');
      for (var c = 0; c < cards.length; c++) {
        cards[c].addEventListener('click', (function(card) {
          return function() {
            var id = card.getAttribute('data-itinerary-id');
            if (id) activateItinerary(id);
          };
        })(cards[c]));
      }
    }
  }

  /**
   * Activate an itinerary by id.
   */
  function activateItinerary(id) {
    if (!id) return;

    // Deactivate any currently active experience
    if (window.CulturalMapExperienceController && window.CulturalMapExperienceController.deactivateExperience) {
      window.CulturalMapExperienceController.deactivateExperience();
    }

    // Deactivate current itinerary if different
    if (state.activeId && state.activeId !== id) {
      deactivateItinerary();
    }

    var itinerary = itineraryModel.getItineraryById(state.itineraries, id);
    if (!itinerary) return;

    var resolved = state.resolved[id];
    if (!resolved || !resolved.length) return;

    var analytics = window.CulturalMapAnalytics;
    if (analytics) {
      analytics.track('itinerary:start', {
        id: (id || '').substring(0, 100),
        title: (itinerary.title || '').substring(0, 100)
      });
    }

    state.activeId = id;

    // Render detail overlay
    var container = state.overlayContainer;
    if (!container) {
      container = document.getElementById('itineraryOverlay');
    }
    if (container) {
      container.innerHTML = itineraryView.renderDetailOverlay(itinerary, resolved);
      container.classList.add('active');

      // GSAP animation if available
      var content = container.querySelector('.itinerary-overlay-content');
      if (window.gsap && content) {
        window.gsap.fromTo(container, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        window.gsap.fromTo(content, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.05 });
      } else {
        container.style.opacity = '1';
      }

      // Bind close button
      var closeBtn = container.querySelector('.itinerary-overlay-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() { deactivateItinerary(); });
      }
      var backdrop = container.querySelector('.itinerary-overlay-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', function() { deactivateItinerary(); });
      }

      // Bind calendar button tracking
      container.addEventListener('click', function(e) {
        var calBtn = e.target.closest('.itinerary-stop-calendar-btn, [href*="calendar.google.com"]');
        if (calBtn) {
          var analytics = window.CulturalMapAnalytics;
          if (analytics) {
            analytics.track('itinerary:calendar', {
              itinerary_title: (calBtn.getAttribute('data-itinerary-title') || '').substring(0, 100),
              stop_name: (calBtn.getAttribute('data-stop-name') || calBtn.textContent || '').substring(0, 100)
            });
          }
        }
      });

      // Bind day tabs
      var accent = (itinerary.theme && itinerary.theme.accent) || '#2a8c8c';
      var tabs = container.querySelectorAll('.itinerary-day-tab');
      var dayContents = container.querySelectorAll('.itinerary-day-content');
      for (var t = 0; t < tabs.length; t++) {
        tabs[t].addEventListener('click', (function(tab) {
          return function() {
            var dayIndex = tab.getAttribute('data-day-index');
            // Track day tab switch
            var analytics = window.CulturalMapAnalytics;
            if (analytics) {
              analytics.track('itinerary:day-tab', {
                itinerary_id: (id || '').substring(0, 100),
                day: parseInt(dayIndex, 10) + 1
              });
            }
            // Update tab active state
            for (var tt = 0; tt < tabs.length; tt++) {
              tabs[tt].classList.remove('active');
              tabs[tt].style.borderBottomColor = 'transparent';
            }
            tab.classList.add('active');
            tab.style.borderBottomColor = accent;
            // Show corresponding day content
            for (var dc = 0; dc < dayContents.length; dc++) {
              if (dayContents[dc].getAttribute('data-day-index') === dayIndex) {
                dayContents[dc].classList.add('active');
              } else {
                dayContents[dc].classList.remove('active');
              }
            }
          };
        })(tabs[t]));
      }

      // Bind "Show on Map" buttons
      var mapBtns = container.querySelectorAll('.itinerary-stop-map-btn');
      for (var m = 0; m < mapBtns.length; m++) {
        mapBtns[m].addEventListener('click', (function(btn) {
          return function() {
            var stopIndex = parseInt(btn.getAttribute('data-stop-index'), 10);
            var dayContent = btn.closest('.itinerary-day-content');
            var dayIndex = dayContent ? parseInt(dayContent.getAttribute('data-day-index'), 10) : 0;
            // Find the resolved stop for this day and index
            var dayStops = resolved.filter(function(s) { return (s.dayIndex || 0) === dayIndex; });
            var stop = dayStops[stopIndex];
            if (stop && stop.data && state.map) {
              state.map.flyTo({
                center: [stop.data.x, stop.data.y],
                zoom: 14,
                pitch: 45,
                duration: 1200,
                essential: true
              });
            }
          };
        })(mapBtns[m]));
      }

      // Bind asset name clicks (open detail panel)
      var nameEls = container.querySelectorAll('.itinerary-stop-name');
      for (var n = 0; n < nameEls.length; n++) {
        nameEls[n].addEventListener('click', (function(nameEl) {
          return function() {
            var assetName = nameEl.getAttribute('data-asset-name');
            if (!assetName) return;
            var match = null;
            for (var k = 0; k < state.data.length; k++) {
              if (state.data[k].n === assetName) {
                match = state.data[k];
                break;
              }
            }
            if (match && state.map) {
              state.map.flyTo({
                center: [match.x, match.y],
                zoom: 14,
                pitch: 45,
                duration: 1200,
                essential: true
              });
            }
          };
        })(nameEls[n]));
      }
    }

    // Draw route on map
    activateItineraryOnMap(id, resolved, itinerary);

    // Update URL with itinerary param
    if (window.CulturalMapCoreUtils && window.CulturalMapCoreUtils.serializeDeepLinkSearch) {
      // Let the main app's syncUrlFromApp handle this
    }
  }

  /**
   * Draw itinerary route on the map.
   */
  function activateItineraryOnMap(id, resolved, itinerary) {
    if (!state.map || !resolved || !resolved.length) return;

    // Add order property to resolved stops for corridor-map compatibility
    var withOrder = [];
    for (var i = 0; i < resolved.length; i++) {
      withOrder.push({
        data: resolved[i].data,
        order: i + 1,
        note: resolved[i].narrative ? resolved[i].narrative.slice(0, 60) + '...' : '',
        connector: ''
      });
    }

    var routeCoords = corridorMap.getRouteCoordinates(withOrder);
    var stopsGeoJSON = corridorMap.getStopsGeoJSON(withOrder);

    if (!routeCoords || routeCoords.length < 2) return;

    var routeColor = (itinerary.theme && itinerary.theme.routeColor) || '#b85c38';
    var accentColor = (itinerary.theme && itinerary.theme.accent) || '#2a8c8c';

    // Remove existing corridor layers first
    removeCorridorLayers();

    // Add new layers
    corridorMap.addCorridorLayers({
      map: state.map,
      routeCoords: routeCoords,
      stopsGeoJSON: stopsGeoJSON,
      routeColor: routeColor,
      accentColor: accentColor
    });

    // Animate route
    if (state.routeAnimationId) {
      cancelAnimationFrame(state.routeAnimationId);
      state.routeAnimationId = null;
    }
    corridorMap.animateRoute({
      map: state.map,
      coordinates: routeCoords,
      duration: 2500,
      onFrameId: function(frameId) { state.routeAnimationId = frameId; }
    });

    // Fit bounds
    var bounds = corridorMap.getCorridorBounds(withOrder);
    if (bounds) {
      state.map.fitBounds(bounds, { padding: 80, maxZoom: 13, pitch: 30, duration: 2000 });
    }
  }

  /**
   * Remove corridor map layers (shared layer IDs with experience system).
   */
  function removeCorridorLayers() {
    if (!state.map) return;
    var layerIds = ['corridor-stops-labels', 'corridor-stops-main', 'corridor-stops-glow', 'corridor-route-animated', 'corridor-route-glow'];
    var sourceIds = ['corridor-stops', 'corridor-route-animated', 'corridor-route-glow'];
    for (var i = 0; i < layerIds.length; i++) {
      if (state.map.getLayer(layerIds[i])) {
        state.map.removeLayer(layerIds[i]);
      }
    }
    for (var j = 0; j < sourceIds.length; j++) {
      if (state.map.getSource(sourceIds[j])) {
        state.map.removeSource(sourceIds[j]);
      }
    }
  }

  /**
   * Deactivate the active itinerary.
   */
  function deactivateItinerary() {
    if (!state.activeId) return;

    // Cancel animation
    if (state.routeAnimationId) {
      cancelAnimationFrame(state.routeAnimationId);
      state.routeAnimationId = null;
    }

    // Remove overlay
    var container = state.overlayContainer || document.getElementById('itineraryOverlay');
    if (container) {
      if (window.gsap) {
        window.gsap.to(container, {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.in',
          onComplete: function() {
            container.innerHTML = '';
            container.classList.remove('active');
          }
        });
      } else {
        container.innerHTML = '';
        container.classList.remove('active');
        container.style.opacity = '0';
      }
    }

    // Remove map layers
    removeCorridorLayers();

    state.activeId = null;
  }

  /**
   * Get the active itinerary id.
   * @returns {string|null}
   */
  function getActiveItineraryId() {
    return state.activeId;
  }

  window.CulturalMapItineraryController = {
    initItineraries: initItineraries,
    activateItinerary: activateItinerary,
    deactivateItinerary: deactivateItinerary,
    getActiveItineraryId: getActiveItineraryId
  };

})();
