(function() {
  'use strict';

  var dreamboardModel = window.CulturalMapDreamboardModel || {};
  var dreamboardView = window.CulturalMapDreamboardView || {};
  var tripModel = window.CulturalMapTripBuilderModel || {};
  var tripView = window.CulturalMapTripBuilderView || {};
  var itineraryModel = window.CulturalMapItineraryModel || {};
  var itineraryView = window.CulturalMapItineraryView || {};
  var itineraryCalendar = window.CulturalMapItineraryCalendar || {};
  var corridorMap = window.CulturalMapCorridorMap || {};
  var config = window.CulturalMapConfig || {};

  var MAPTILER_KEY = config.MAPTILER_KEY || 'LrWxywMynJX4Y3SvVJby';
  var HUB_URL = 'index-maplibre-hero-intent-stitch-frontend-design-pass.html';

  var state = {
    data: [],
    map: null,
    mapPins: null,   // GeoJSON source for dream board pins
    routeAnimationId: null,
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

    // Check for shared trip deep link first
    handleSharedTripDeepLink();

    // Fetch data.json then render everything
    fetch('data.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        state.data = data;
        ensureActiveTrip();
        renderAll();
        renderFinalizedItinerary();
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

      // Share trip button
      if (target.closest('#tb-share-trip-btn')) {
        handleShareTrip();
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
        var newTitle = 'Trip ' + (trips.length + 1);
        tripModel.createTrip(newTitle);
        var analytics = window.CulturalMapAnalytics;
        if (analytics) analytics.track('trip:created', { title: newTitle });
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

    // Check if there are any items to show (dream board places or trip stops)
    var store = dreamboardModel.getStore ? dreamboardModel.getStore() : { places: [], events: [] };
    var activeTrip = tripModel.getActiveTrip ? tripModel.getActiveTrip() : null;
    var hasTripStops = activeTrip && activeTrip.days && activeTrip.days.some(function(d) {
      return d.stops && d.stops.length > 0;
    });
    if (store.places.length === 0 && store.events.length === 0 && !hasTripStops) {
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

      // Draw route if active trip has stops
      var activeTrip = tripModel.getActiveTrip ? tripModel.getActiveTrip() : null;
      if (activeTrip && activeTrip.days && activeTrip.days.length > 0) {
        var hasStops = activeTrip.days.some(function(d) { return d.stops && d.stops.length > 0; });
        if (hasStops) {
          drawRouteOnMap(activeTrip);
        }
      }
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

  /**
   * Handle ?trip=<encoded> deep link on trip.html.
   * Decodes the shared trip and saves it as the active trip.
   */
  function handleSharedTripDeepLink() {
    try {
      var params = new URLSearchParams(window.location.search);
      var encoded = params.get('trip');
      if (!encoded) return;
      var sharedTrip = tripModel.decodeFromUrl ? tripModel.decodeFromUrl(encoded) : null;
      if (sharedTrip) {
        // Save shared trip to localStorage so it persists
        if (tripModel.saveTrip) tripModel.saveTrip(sharedTrip);
        if (tripModel.setActiveTrip) tripModel.setActiveTrip(sharedTrip.id);
        // Track analytics
        var analytics = window.CulturalMapAnalytics;
        if (analytics) {
          var totalStops = 0;
          for (var i = 0; i < (sharedTrip.days || []).length; i++) {
            totalStops += (sharedTrip.days[i].stops || []).length;
          }
          analytics.track('deeplink:arrive', { type: 'shared-trip', value: (sharedTrip.title || '').substring(0, 100) });
        }
      }
    } catch (e) {
      console.warn('[TripBuilder] Deep link parse error:', e);
    }
  }

  /**
   * Render finalized itinerary using the existing itinerary view pipeline.
   * This replaces the simple trip-day rendering with the full overlay-quality view.
   */
  function renderFinalizedItinerary() {
    var activeTrip = tripModel.getActiveTrip ? tripModel.getActiveTrip() : null;
    if (!activeTrip || !activeTrip.days || activeTrip.days.length === 0) return;

    // Check if there are any stops at all
    var hasStops = activeTrip.days.some(function(d) { return d.stops && d.stops.length > 0; });
    if (!hasStops) return;

    // Resolve stops against data.json
    var resolved = itineraryModel.resolveItineraryStops ? itineraryModel.resolveItineraryStops(activeTrip, state.data) : [];
    if (!resolved || !resolved.length) return;

    // Render the itinerary zone using the full itinerary view pipeline
    var itZone = document.getElementById('itinerary-zone');
    if (itZone && itineraryView.renderDetailOverlay) {
      var html = '<div class="tb-zone tb-itinerary">';
      html += '<div class="tb-itinerary-header">';
      html += '<h2 class="tb-zone-title">Your Itinerary</h2>';
      html += '<button class="tb-share-btn" id="tb-share-trip-btn" type="button" title="Share this trip">';
      html += '<svg viewBox="0 0 24 24" width="18" height="18" style="vertical-align:middle;margin-right:4px;"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 0 0 21 5a3 3 0 1 0-5.91.7L8.04 9.81A2.99 2.99 0 0 0 5 8a3 3 0 0 0 0 6c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 0 0 2.92 2.92 2.92 2.92 0 0 0 0-5.84z" fill="currentColor"/></svg>';
      html += 'Share Trip</button>';
      html += '</div>';
      // Use the existing overlay content renderer (just the inner content, not the full overlay wrapper)
      html += '<div class="tb-itinerary-content" id="tb-itinerary-content">';
      html += renderItineraryContent(activeTrip, resolved);
      html += '</div>';
      html += '<div class="tb-attribution"><span style="color:#c8943e;">&#9830;</span> Built with the <strong>Local Concierge</strong></div>';
      html += '</div>';
      itZone.innerHTML = html;

      // Bind day tab clicks
      bindItineraryDayTabs(itZone, activeTrip);
      // Bind calendar export clicks with analytics
      bindCalendarExportTracking(itZone, activeTrip);
    }
  }

  /**
   * Render the itinerary content (day tabs + stop cards) using the full pipeline.
   * This generates HTML similar to itinerary-view's renderDetailOverlay but without the overlay wrapper.
   */
  function renderItineraryContent(trip, resolved) {
    if (!trip || !trip.days) return '';
    var accent = (trip.theme && trip.theme.accent) || '#c8943e';
    var cal = window.CulturalMapItineraryCalendar;
    var html = '';

    // Day tabs if multi-day
    if (trip.days.length > 1) {
      html += '<div class="tb-day-tabs">';
      for (var t = 0; t < trip.days.length; t++) {
        var tabActive = t === 0 ? ' tb-tab-active' : '';
        html += '<button class="tb-day-tab' + tabActive + '" data-day-index="' + t + '" type="button" style="' + (t === 0 ? 'border-bottom-color:' + accent : '') + '">';
        html += escapeHtml(trip.days[t].label || ('Day ' + (t + 1)));
        html += '</button>';
      }
      html += '</div>';
    }

    // Day contents with stop cards
    for (var d = 0; d < trip.days.length; d++) {
      var day = trip.days[d];
      var dayActive = d === 0 ? ' tb-day-active' : '';
      html += '<div class="tb-day-content' + dayActive + '" data-day-index="' + d + '">';
      if (trip.days.length <= 1 && day.label) {
        html += '<h3 class="tb-day-label">' + escapeHtml(day.label) + '</h3>';
      }
      var dayStops = resolved.filter(function(s) { return s.dayIndex === d; });
      for (var s = 0; s < dayStops.length; s++) {
        var stop = dayStops[s];
        var startLabel = formatTime12h(stop.time);
        var endLabel = getEndTime12h(stop.time, stop.duration);
        var timeRange = startLabel && endLabel ? startLabel + ' \u2013 ' + endLabel : startLabel;

        html += '<div class="tb-stop-card">';
        html += '<span class="tb-stop-number" style="background:' + accent + '">' + (s + 1) + '</span>';
        html += '<div class="tb-stop-body">';
        html += '<span class="tb-stop-name">' + escapeHtml(stop.asset) + '</span>';
        if (timeRange) {
          html += '<span class="tb-stop-time">' + timeRange + '</span>';
        }
        if (stop.duration) {
          html += '<span class="tb-stop-duration">' + stop.duration + ' min</span>';
        }
        if (stop.narrative) {
          html += '<p class="tb-stop-narrative">' + escapeHtml(stop.narrative) + '</p>';
        }
        // Calendar export link
        if (cal && cal.buildStopCalendarUrl) {
          var calUrl = cal.buildStopCalendarUrl(stop, trip);
          if (calUrl) {
            html += '<div class="tb-stop-actions">';
            html += '<a href="' + calUrl + '" target="_blank" rel="noopener" class="tb-stop-calendar-btn" data-stop-name="' + escapeHtml(stop.asset) + '" data-trip-title="' + escapeHtml(trip.title) + '">';
            html += '&#128197; Add to Calendar</a>';
            html += '</div>';
          }
        }
        html += '</div>';
        html += '</div>';
      }
      html += '</div>';
    }

    return html;
  }

  /**
   * Format 24h time to 12h AM/PM display.
   */
  function formatTime12h(time24) {
    if (!time24) return '';
    var parts = time24.split(':');
    var h = parseInt(parts[0], 10) || 0;
    var m = parseInt(parts[1], 10) || 0;
    var suffix = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ':' + String(m).padStart(2, '0') + ' ' + suffix;
  }

  /**
   * Calculate end time from start + duration in 12h format.
   */
  function getEndTime12h(time24, durationMin) {
    if (!time24) return '';
    var parts = time24.split(':');
    var h = parseInt(parts[0], 10) || 0;
    var m = parseInt(parts[1], 10) || 0;
    var total = h * 60 + m + (durationMin || 60);
    if (total >= 24 * 60) total = 23 * 60 + 59;
    var endH = Math.floor(total / 60);
    var endM = total % 60;
    var pad = String(endH).padStart(2, '0') + ':' + String(endM).padStart(2, '0');
    return formatTime12h(pad);
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Bind day tab click switching in the itinerary zone.
   */
  function bindItineraryDayTabs(container, trip) {
    var accent = (trip && trip.theme && trip.theme.accent) || '#c8943e';
    container.addEventListener('click', function(e) {
      var dayTab = e.target.closest('.tb-day-tab');
      if (!dayTab) return;
      var dayIndex = dayTab.getAttribute('data-day-index');
      var tabs = container.querySelectorAll('.tb-day-tab');
      var days = container.querySelectorAll('.tb-day-content');
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
    });
  }

  /**
   * Bind calendar export click tracking in the itinerary zone.
   */
  function bindCalendarExportTracking(container, trip) {
    container.addEventListener('click', function(e) {
      var calBtn = e.target.closest('.tb-stop-calendar-btn');
      if (!calBtn) return;
      var analytics = window.CulturalMapAnalytics;
      if (analytics) {
        analytics.track('trip:calendar-export', {
          stop_name: (calBtn.getAttribute('data-stop-name') || '').substring(0, 100),
          trip_title: (calBtn.getAttribute('data-trip-title') || '').substring(0, 100)
        });
      }
    });
  }

  /**
   * Handle "Share Trip" button click.
   * Encodes the active trip and copies the URL to clipboard.
   */
  function handleShareTrip() {
    var activeTrip = tripModel.getActiveTrip ? tripModel.getActiveTrip() : null;
    if (!activeTrip) return;

    var encoded = tripModel.encodeForUrl ? tripModel.encodeForUrl(activeTrip) : null;
    if (!encoded) {
      showToast('This trip is too long to share via link. Try a shorter itinerary.');
      return;
    }

    var url = window.location.origin + '/trip.html?trip=' + encoded;

    // Copy to clipboard with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function() {
        showToast('Trip link copied! Share it with friends.');
      }).catch(function() {
        fallbackCopyToClipboard(url);
      });
    } else {
      fallbackCopyToClipboard(url);
    }

    // Track analytics
    var analytics = window.CulturalMapAnalytics;
    if (analytics) {
      var totalStops = 0;
      for (var i = 0; i < (activeTrip.days || []).length; i++) {
        totalStops += (activeTrip.days[i].stops || []).length;
      }
      analytics.track('trip:shared', {
        title: (activeTrip.title || '').substring(0, 100),
        stops: totalStops
      });
    }
  }

  /**
   * Fallback clipboard copy using textarea method.
   */
  function fallbackCopyToClipboard(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('Trip link copied! Share it with friends.');
    } catch (e) {
      showToast('Could not copy link. URL: ' + text.substring(0, 60) + '...');
    }
    document.body.removeChild(textarea);
  }

  /**
   * Draw the itinerary route on the trip page inline map.
   */
  function drawRouteOnMap(trip) {
    if (!state.map || !trip || !trip.days) return;
    if (!corridorMap.getRouteCoordinates || !corridorMap.addCorridorLayers) return;

    var resolved = itineraryModel.resolveItineraryStops ? itineraryModel.resolveItineraryStops(trip, state.data) : [];
    if (!resolved || !resolved.length) return;

    // Build withOrder array for corridor-map compatibility
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

    var routeColor = (trip.theme && trip.theme.routeColor) || '#7a9e7e';
    var accentColor = (trip.theme && trip.theme.accent) || '#c8943e';

    // Remove existing corridor layers if any
    removeRouteFromMap();

    // Add corridor layers
    corridorMap.addCorridorLayers({
      map: state.map,
      routeCoords: routeCoords,
      stopsGeoJSON: stopsGeoJSON,
      routeColor: routeColor,
      accentColor: accentColor
    });

    // Animate route
    if (corridorMap.animateRoute) {
      corridorMap.animateRoute({
        map: state.map,
        coordinates: routeCoords,
        duration: 2500,
        onFrameId: function(frameId) { state.routeAnimationId = frameId; }
      });
    }

    // Fit bounds to include the route
    var bounds = corridorMap.getCorridorBounds ? corridorMap.getCorridorBounds(withOrder) : null;
    if (bounds) {
      state.map.fitBounds(bounds, { padding: 60, maxZoom: 13, pitch: 30, duration: 2000 });
    }
  }

  /**
   * Remove route layers from the trip page map.
   */
  function removeRouteFromMap() {
    if (!state.map) return;
    var layerIds = ['corridor-stops-labels', 'corridor-stops-main', 'corridor-stops-glow', 'corridor-route-animated', 'corridor-route-glow'];
    var sourceIds = ['corridor-stops', 'corridor-route-animated', 'corridor-route-glow'];
    for (var i = 0; i < layerIds.length; i++) {
      if (state.map.getLayer(layerIds[i])) state.map.removeLayer(layerIds[i]);
    }
    for (var j = 0; j < sourceIds.length; j++) {
      if (state.map.getSource(sourceIds[j])) state.map.removeSource(sourceIds[j]);
    }
    if (state.routeAnimationId) {
      cancelAnimationFrame(state.routeAnimationId);
      state.routeAnimationId = null;
    }
  }

  window.CulturalMapTripBuilderController = {
    init: init,
    renderAll: renderAll,
    refreshMapPins: refreshMapPins,
    handleShareTrip: handleShareTrip
  };
})();
