(function() {
  'use strict';

  var dreamboardModel = window.CulturalMapDreamboardModel || {};
  var dreamboardView = window.CulturalMapDreamboardView || {};
  var tripModel = window.CulturalMapTripBuilderModel || {};
  var tripView = window.CulturalMapTripBuilderView || {};
  var config = window.CulturalMapConfig || {};

  var MAPTILER_KEY = config.MAPTILER_KEY || 'LrWxywMynJX4Y3SvVJby';
  var HUB_URL = 'index-maplibre-hero-intent-stitch-frontend-design-pass.html';

  var state = {
    data: [],
    map: null,
    mapPins: null,   // GeoJSON source for dream board pins
    initialized: false
  };

  /**
   * Initialize the trip builder page.
   * Called on DOMContentLoaded from trip.html.
   */
  function init() {
    if (state.initialized) return;
    state.initialized = true;

    // Inject CSS
    if (dreamboardView.injectCSS) dreamboardView.injectCSS();
    if (tripView.injectCSS) tripView.injectCSS();

    // Fetch data.json then render everything
    fetch('data.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        state.data = data;
        ensureActiveTrip();
        renderAll();
        initMap();
        bindEvents();
        initBadge();
      })
      .catch(function(err) {
        console.error('[TripBuilder] Failed to load data:', err);
        var content = document.getElementById('trip-content');
        if (content) {
          content.innerHTML = '<div style="text-align:center;padding:3rem;font-family:DM Sans,sans-serif;color:#8a8278;">' +
            'Failed to load data. Please try refreshing the page.</div>';
        }
      });

    // Cross-tab sync: re-render when localStorage changes
    window.addEventListener('storage', function(e) {
      if (e.key === 'ncac-dreamboard' || e.key === 'ncac-user-trips') {
        renderAll();
        refreshMapPins();
      }
    });
  }

  /**
   * Ensure at least one trip exists in the store.
   */
  function ensureActiveTrip() {
    var trips = tripModel.getAllTrips ? tripModel.getAllTrips() : [];
    if (trips.length === 0) {
      tripModel.createTrip('My Trip');
    }
  }

  /**
   * Initialize badge on the nav link.
   */
  function initBadge() {
    var count = dreamboardModel.getItemCount ? dreamboardModel.getItemCount() : 0;
    var badges = document.querySelectorAll('.trip-badge');
    for (var i = 0; i < badges.length; i++) {
      if (count > 0) {
        badges[i].textContent = count;
        badges[i].style.display = '';
      } else {
        badges[i].style.display = 'none';
      }
    }
  }

  /**
   * Render all zones: trip selector, dream board, itinerary, unplanned.
   */
  function renderAll() {
    var store = dreamboardModel.getStore ? dreamboardModel.getStore() : { places: [], events: [] };
    var trips = tripModel.getAllTrips ? tripModel.getAllTrips() : [];
    var activeTrip = tripModel.getActiveTrip ? tripModel.getActiveTrip() : null;
    var activeId = activeTrip ? activeTrip.id : null;

    // Trip selector
    var selectorArea = document.getElementById('trip-selector-area');
    if (selectorArea) {
      selectorArea.innerHTML = tripView.renderTripSelector(trips, activeId);
    }

    // Dream board zone
    var dbZone = document.getElementById('dreamboard-zone');
    if (dbZone) {
      dbZone.innerHTML = tripView.renderDreamBoardZone(store, state.data);
    }

    // Itinerary zone
    var itZone = document.getElementById('itinerary-zone');
    if (itZone) {
      itZone.innerHTML = tripView.renderItineraryZone(activeTrip);
    }

    // Unplanned zone
    var upZone = document.getElementById('unplanned-zone');
    if (upZone) {
      upZone.innerHTML = tripView.renderUnplannedZone(store.places, activeTrip);
    }

    // Update badge
    initBadge();
  }

  /**
   * Bind event handlers via delegation on #trip-content.
   */
  function bindEvents() {
    var content = document.getElementById('trip-content');
    if (!content) return;

    content.addEventListener('click', function(e) {
      var target = e.target;

      // Remove button on dream board card
      var removeBtn = target.closest('.dreamboard-card .remove-btn');
      if (removeBtn) {
        e.stopPropagation();
        var card = removeBtn.closest('.dreamboard-card');
        if (!card) return;

        if (card.classList.contains('tb-card-event')) {
          var evTitle = card.getAttribute('data-event-title');
          var evDate = card.getAttribute('data-event-date');
          if (dreamboardModel.removeEvent) dreamboardModel.removeEvent(evTitle, evDate);
          showToast('"' + (evTitle || 'Event').substring(0, 40) + '" removed');
        } else {
          var assetName = card.getAttribute('data-asset-name');
          if (dreamboardModel.removePlace) dreamboardModel.removePlace(assetName);
          showToast('"' + (assetName || 'Place').substring(0, 40) + '" removed');
        }
        renderAll();
        refreshMapPins();
        return;
      }

      // Dream board card click (navigate to hub detail)
      var dbCard = target.closest('.dreamboard-card');
      if (dbCard) {
        if (dbCard.classList.contains('tb-card-event')) {
          // Events don't have a detail panel deep link -- just navigate to events page
          window.location.href = 'events.html';
        } else {
          var name = dbCard.getAttribute('data-asset-name');
          if (name) {
            window.location.href = HUB_URL + '?pid=' + encodeURIComponent(name);
          }
        }
        return;
      }

      // Plan trip CTA
      if (target.closest('#plan-trip-cta')) {
        window.location.href = HUB_URL + '?chat=trip';
        return;
      }

      // Style card click
      var styleCard = target.closest('.style-card');
      if (styleCard) {
        var plan = styleCard.getAttribute('data-plan') || '';
        window.location.href = HUB_URL + '?chat=trip&plan=' + encodeURIComponent(plan);
        return;
      }

      // Trip selector: new trip button
      if (target.closest('#tb-new-trip-btn')) {
        var trips = tripModel.getAllTrips ? tripModel.getAllTrips() : [];
        tripModel.createTrip('Trip ' + (trips.length + 1));
        renderAll();
        refreshMapPins();
        return;
      }

      // Trip selector: delete trip button
      if (target.closest('#tb-delete-trip-btn')) {
        var active = tripModel.getActiveTrip ? tripModel.getActiveTrip() : null;
        if (active && confirm('Delete "' + active.title + '"?')) {
          tripModel.deleteTrip(active.id);
          renderAll();
          refreshMapPins();
        }
        return;
      }

      // Day tab switching
      var dayTab = target.closest('.tb-day-tab');
      if (dayTab) {
        var dayIndex = dayTab.getAttribute('data-day-index');
        var tabs = content.querySelectorAll('.tb-day-tab');
        var days = content.querySelectorAll('.tb-day-content');
        var activeTrip = tripModel.getActiveTrip ? tripModel.getActiveTrip() : null;
        var accent = (activeTrip && activeTrip.theme && activeTrip.theme.accent) || '#c8943e';
        for (var t = 0; t < tabs.length; t++) {
          tabs[t].classList.remove('tb-tab-active');
          tabs[t].style.borderBottomColor = 'transparent';
        }
        dayTab.classList.add('tb-tab-active');
        dayTab.style.borderBottomColor = accent;
        for (var d = 0; d < days.length; d++) {
          if (days[d].getAttribute('data-day-index') === dayIndex) {
            days[d].classList.add('tb-day-active');
          } else {
            days[d].classList.remove('tb-day-active');
          }
        }
        return;
      }
    });

    // Trip selector: dropdown change
    content.addEventListener('change', function(e) {
      if (e.target.id === 'tb-trip-dropdown') {
        tripModel.setActiveTrip(e.target.value);
        renderAll();
        refreshMapPins();
      }
    });

    // Trip name double-click to rename
    content.addEventListener('dblclick', function(e) {
      if (e.target.id === 'tb-active-trip-name') {
        var active = tripModel.getActiveTrip ? tripModel.getActiveTrip() : null;
        if (!active) return;
        var newName = prompt('Rename trip:', active.title);
        if (newName && newName.trim()) {
          tripModel.renameTrip(active.id, newName.trim());
          renderAll();
        }
      }
    });
  }

  /**
   * Show a simple toast (reuse dreamboard toast if available, else inline).
   */
  function showToast(message) {
    if (dreamboardView.showToast) {
      dreamboardView.showToast(message);
    }
  }

  /**
   * Initialize inline MapLibre map.
   */
  function initMap() {
    var container = document.getElementById('trip-map');
    if (!container) return;

    // Check if there are any items to show
    var store = dreamboardModel.getStore ? dreamboardModel.getStore() : { places: [], events: [] };
    if (store.places.length === 0 && store.events.length === 0) {
      container.style.display = 'none';
      return;
    }
    container.style.display = '';

    var mapInitModel = window.CulturalMapMapInitModel || null;
    var styleUrl = 'https://api.maptiler.com/maps/landscape/style.json?key=' + MAPTILER_KEY;

    state.map = new maplibregl.Map({
      container: 'trip-map',
      style: styleUrl,
      center: [-120.8, 39.22],
      zoom: 9,
      pitch: 30,
      bearing: -10,
      cooperativeGestures: true,
      attributionControl: false
    });

    state.map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    state.map.addControl(new maplibregl.AttributionControl({ compact: true }));

    state.map.on('load', function() {
      // Add 3D terrain
      if (MAPTILER_KEY) {
        state.map.addSource('terrain-dem', {
          type: 'raster-dem',
          url: 'https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=' + MAPTILER_KEY,
          tileSize: 256
        });
        var isMobile = window.matchMedia('(max-width: 600px)').matches;
        if (!isMobile) {
          state.map.setTerrain({ source: 'terrain-dem', exaggeration: 2 });
        }
      }

      addDreamBoardPins();
    });
  }

  /**
   * Build GeoJSON from dream board places by resolving coordinates from data.json.
   */
  function buildPinsGeoJSON() {
    var places = dreamboardModel.getPlaces ? dreamboardModel.getPlaces() : [];
    var features = [];

    // Build lookup
    var lookup = {};
    for (var i = 0; i < state.data.length; i++) {
      lookup[state.data[i].n.toLowerCase()] = state.data[i];
    }

    for (var j = 0; j < places.length; j++) {
      var asset = lookup[(places[j].asset || '').toLowerCase()];
      if (!asset || !asset.x || !asset.y) continue;
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [asset.x, asset.y] },
        properties: {
          name: asset.n,
          layer: asset.l || ''
        }
      });
    }

    return { type: 'FeatureCollection', features: features };
  }

  /**
   * Add dream board pins to the map as gold markers.
   */
  function addDreamBoardPins() {
    if (!state.map) return;
    var geojson = buildPinsGeoJSON();

    if (state.map.getSource('dreamboard-pins')) {
      state.map.getSource('dreamboard-pins').setData(geojson);
    } else {
      state.map.addSource('dreamboard-pins', { type: 'geojson', data: geojson });

      // Gold circle markers
      state.map.addLayer({
        id: 'dreamboard-pins-glow',
        type: 'circle',
        source: 'dreamboard-pins',
        paint: {
          'circle-radius': 12,
          'circle-color': '#c8943e',
          'circle-opacity': 0.2,
          'circle-blur': 0.6
        }
      });

      state.map.addLayer({
        id: 'dreamboard-pins-circle',
        type: 'circle',
        source: 'dreamboard-pins',
        paint: {
          'circle-radius': 7,
          'circle-color': '#c8943e',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Labels
      state.map.addLayer({
        id: 'dreamboard-pins-labels',
        type: 'symbol',
        source: 'dreamboard-pins',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-max-width': 10,
          'text-font': ['Open Sans Regular']
        },
        paint: {
          'text-color': '#1a1612',
          'text-halo-color': '#f5f0e8',
          'text-halo-width': 1.5
        }
      });
    }

    // Fit bounds to pins
    if (geojson.features.length > 0) {
      var bounds = new maplibregl.LngLatBounds();
      for (var i = 0; i < geojson.features.length; i++) {
        bounds.extend(geojson.features[i].geometry.coordinates);
      }
      state.map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 1000 });
    }
  }

  /**
   * Refresh map pins after dream board changes.
   */
  function refreshMapPins() {
    if (!state.map) {
      // If map was hidden because empty, check if we need to show it now
      var container = document.getElementById('trip-map');
      if (container) {
        var store = dreamboardModel.getStore ? dreamboardModel.getStore() : { places: [], events: [] };
        if (store.places.length > 0) {
          container.style.display = '';
          initMap();
        } else {
          container.style.display = 'none';
        }
      }
      return;
    }
    addDreamBoardPins();
  }

  window.CulturalMapTripBuilderController = {
    init: init,
    renderAll: renderAll,
    refreshMapPins: refreshMapPins
  };
})();
