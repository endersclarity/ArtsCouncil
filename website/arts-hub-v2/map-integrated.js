/**
 * map-integrated.js — Arts Hub V2 Map-Centric Homepage
 * MapLibre GL JS integration with event-aware venue highlighting.
 *
 * Two layers:
 *   1. cultural-assets: all 1783 background dots (muted gray)
 *   2. venue-events: foreground pulsing dots for venues with active events
 *
 * Exposes window.ArtsHubMapV2 for cross-module communication.
 */

(function () {
  'use strict';

  // ─── CONFIG ───────────────────────────────────────────────────────────────

  const MAP_CENTER = [-121.05, 39.22];
  const MAP_ZOOM = 11;
  const TILE_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

  // Category colors from the base map (used for background dots)
  const CATEGORY_MAP = {
    'Gallery Studio Museum':              'Galleries & Museums',
    'Performance Spaces / Entertainment': 'Performing Arts',
    'Artisan Places to Eat, Drink or Stay': 'Eat, Drink & Stay',
    'Artisan Places to Shop':             'Artisan Shopping',
    'Public Art':                         'Public Art',
    'Historic Landmarks':                 'Historic',
    'Arts Organization':                  'Arts Organizations',
    'Fairs and Festivals':                'Festivals',
    'MUSE BD':                            'Featured in MUSE',
    'Walks and Trails':                   'Trails & Walks',
    'Cultural Resources and Media':       'Cultural Resources',
    'Preservation & Cultural Organiz':    'Preservation',
    'Services':                           'Services',
    'Parking':                            null,
  };

  // Filter groups → which mapped categories belong to each
  const FILTER_GROUPS = {
    'Arts & Culture':    ['Galleries & Museums', 'Performing Arts', 'Arts Organizations', 'Public Art', 'Festivals', 'Cultural Resources', 'Preservation'],
    'Food & Drink':      ['Eat, Drink & Stay', 'Featured in MUSE'],
    'Outdoors':          ['Trails & Walks'],
    'Historic':          ['Historic'],
    'Shopping & Makers': ['Artisan Shopping'],
  };

  // Color per filter group
  const GROUP_COLORS = {
    'Arts & Culture':    '#9B59B6',
    'Food & Drink':      '#E67E22',
    'Outdoors':          '#27AE60',
    'Historic':          '#8B7355',
    'Shopping & Makers': '#3498DB',
  };

  // Build reverse lookup: mapped category → filter group
  const CATEGORY_TO_GROUP = {};
  Object.entries(FILTER_GROUPS).forEach(function(entry) {
    entry[1].forEach(function(cat) { CATEGORY_TO_GROUP[cat] = entry[0]; });
  });

  // Active filter groups (all on by default)
  let activeGroups = new Set(Object.keys(FILTER_GROUPS));

  // ─── STATE ────────────────────────────────────────────────────────────────

  let map = null;
  let hoverPopup = null;      // Reusable desktop hover tooltip
  let allAssetFeatures = [];
  let venueEventsGeoJSON = { type: 'FeatureCollection', features: [] };
  let highlightedVenueId = null;
  let pulseAnimFrame = null;
  let venueLetterMap = {}; // { "Miners Foundry": "A", ... }

  // ─── DATA HELPERS ─────────────────────────────────────────────────────────

  function mapCategory(sheet) {
    return CATEGORY_MAP[sheet] || 'Services';
  }

  function buildAssetGeoJSON(assets) {
    var features = [];
    for (var i = 0; i < assets.length; i++) {
      var asset = assets[i];
      var lng = parseFloat(asset.lng);
      var lat = parseFloat(asset.lat);
      if (!lng || !lat || isNaN(lng) || isNaN(lat)) continue;
      // Skip projected coordinates (not WGS84 decimal degrees)
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;

      var category = mapCategory(asset.sheet);
      if (category === null) continue;

      features.push({
        type: 'Feature',
        id: i,
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          name: asset.name || '',
          category: category,
          city: asset.city || '',
        }
      });
    }
    return { type: 'FeatureCollection', features: features };
  }

  /**
   * Build venue-events GeoJSON from matched events data.
   * Groups events by asset_name (venue), creating one feature per venue.
   */
  function toLetter(idx) {
    var s = '';
    var n = idx;
    do {
      s = String.fromCharCode(65 + (n % 26)) + s;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return s;
  }

  function buildVenueEventsGeoJSON(matchedEvents) {
    var venueMap = {};
    var venueOrder = [];
    for (var i = 0; i < matchedEvents.length; i++) {
      var ev = matchedEvents[i];
      var key = ev.asset_name || ev.venue || (ev.community_event && ev.city ? ev.city + ' Community Events' : null);
      if (!key) continue;
      if (!venueMap[key]) {
        venueMap[key] = {
          name: key,
          city: ev.city || '',
          lat: ev.asset_lat,
          lng: ev.asset_lng,
          events: []
        };
        venueOrder.push(key);
      }
      venueMap[key].events.push(ev);
    }

    var features = [];
    venueLetterMap = {};
    for (var idx = 0; idx < venueOrder.length; idx++) {
      var venueName = venueOrder[idx];
      var v = venueMap[venueName];
      if (!v.lat || !v.lng) continue;
      var letter = toLetter(idx);
      venueLetterMap[venueName] = letter;
      features.push({
        type: 'Feature',
        id: idx,
        geometry: { type: 'Point', coordinates: [v.lng, v.lat] },
        properties: {
          venue_name: v.name,
          city: v.city,
          marker_letter: letter,
          event_count: v.events.length,
          event_titles: v.events.map(function(e) { return e.title; }).join(' | '),
          events_json: JSON.stringify(v.events),
        }
      });
    }

    return { type: 'FeatureCollection', features: features };
  }

  // ─── MAP INITIALIZATION ───────────────────────────────────────────────────

  function init() {
    var container = document.getElementById('map-main');
    if (!container || !window.maplibregl) {
      console.error('[map-integrated.js] Missing container or MapLibre GL JS.');
      return;
    }

    map = new maplibregl.Map({
      container: 'map-main',
      style: TILE_STYLE,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Reusable hover tooltip popup (desktop only — mouseenter never fires on touch)
    hoverPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'map-hover-tooltip',
      offset: [0, -10]
    });

    map.on('load', function () {
      loadBackgroundAssets();
      // Venue events layer added later via setVenueEvents()
      addVenueEventsSource();
      setupInteractions();
      startPulseAnimation();
      // Check for deep link after assets load
      setTimeout(handleDeepLink, 2000);
    });
  }

  // ─── BACKGROUND ASSET LAYER ───────────────────────────────────────────────

  var assetImageMap = {}; // { "Venue Name": "https://..." }

  function loadBackgroundAssets() {
    // Load images in parallel with assets
    fetch('data/image_data.json')
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (imgData) {
        Object.entries(imgData).forEach(function(entry) {
          if (entry[1] && entry[1].img) assetImageMap[entry[0]] = entry[1].img;
        });
      })
      .catch(function () { /* no images, fine */ });

    fetch('data/cultural-assets.json')
      .then(function (r) { return r.json(); })
      .then(function (assets) {
        var geojson = buildAssetGeoJSON(assets);
        allAssetFeatures = geojson.features;

        map.addSource('cultural-assets', {
          type: 'geojson',
          data: geojson,
        });

        // Build color match expression from CATEGORY_TO_GROUP + GROUP_COLORS
        var colorExpr = ['match', ['get', 'category']];
        Object.entries(CATEGORY_TO_GROUP).forEach(function(entry) {
          colorExpr.push(entry[0], GROUP_COLORS[entry[1]] || '#CCCCCC');
        });
        colorExpr.push('#CCCCCC'); // fallback

        map.addLayer({
          id: 'cultural-assets-dots',
          type: 'circle',
          source: 'cultural-assets',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              8, 2.5,
              12, 4.5,
              15, 7,
            ],
            'circle-color': colorExpr,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#FFFFFF',
            'circle-opacity': 0.75,
          }
        });

        // Click handler for asset dots
        map.on('click', 'cultural-assets-dots', function(e) {
          if (!e.features || !e.features.length) return;
          var f = e.features[0];
          var coords = f.geometry.coordinates.slice();
          var props = f.properties;
          var group = CATEGORY_TO_GROUP[props.category] || '';
          var color = GROUP_COLORS[group] || '#999';

          var imgUrl = assetImageMap[props.name] || '';
          var imgHtml = imgUrl
            ? '<img src="' + imgUrl + '" style="width:100%;max-height:120px;object-fit:cover;margin-bottom:6px;" onerror="this.style.display=\'none\'">'
            : '';

          var dirLink = 'directory.html?q=' + encodeURIComponent(props.name);
          new maplibregl.Popup({ offset: 10, closeButton: true, maxWidth: '240px' })
            .setLngLat(coords)
            .setHTML(
              '<div style="font-family:Nunito,sans-serif;min-width:160px;">' +
              imgHtml +
              '<div style="padding:4px;">' +
              '<strong style="font-size:14px;">' + escapeHtml(props.name) + '</strong>' +
              '<br><span style="font-size:12px;color:' + color + ';font-weight:700;">' + escapeHtml(props.category) + '</span>' +
              (props.city ? '<br><span style="color:#666;font-size:12px;">' + escapeHtml(props.city) + '</span>' : '') +
              '<br><a href="' + dirLink + '" style="display:inline-block;margin-top:6px;font-size:12px;color:#1A1A1A;font-weight:700;text-decoration:underline;">Full Details &rarr;</a>' +
              '</div></div>'
            )
            .addTo(map);
        });

        // ── Hover tooltip (desktop) ─────────────────────────────────────
        map.on('mouseenter', 'cultural-assets-dots', function(e) {
          map.getCanvas().style.cursor = 'pointer';
          if (!e.features || !e.features.length) return;
          var props = e.features[0].properties;
          var name = props.name || 'Unknown';
          var category = props.category || '';
          var city = props.city || '';
          var tooltipHtml = '<strong>' + escapeHtml(name) + '</strong>';
          if (category && city) tooltipHtml += '<br>' + escapeHtml(category) + ' &middot; ' + escapeHtml(city);
          else if (category) tooltipHtml += '<br>' + escapeHtml(category);
          else if (city) tooltipHtml += '<br>' + escapeHtml(city);
          hoverPopup.setLngLat(e.lngLat).setHTML(tooltipHtml).addTo(map);
        });
        map.on('mouseleave', 'cultural-assets-dots', function() {
          map.getCanvas().style.cursor = '';
          hoverPopup.remove();
        });

        // ── Zoom-based auto-labels (MapLibre collision detection) ───────
        var isTouchDevice = !window.matchMedia('(hover: hover)').matches;
        var labelMinZoom = isTouchDevice ? 14 : 13;

        map.addLayer({
          id: 'asset-labels',
          type: 'symbol',
          source: 'cultural-assets',
          minzoom: labelMinZoom,
          layout: {
            'text-field': ['get', 'name'],
            'text-anchor': 'top',
            'text-offset': [0, 0.8],
            'text-size': ['interpolate', ['linear'], ['zoom'], 13, 11, 16, 14],
            'text-max-width': 8,
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            // text-allow-overlap defaults to false — collision detection ON
          },
          paint: {
            'text-color': '#3F3F3F',
            'text-halo-color': '#FFFFFF',
            'text-halo-width': 1.5
          }
        });
      })
      .catch(function (err) {
        console.error('[map-integrated.js] Failed to load cultural-assets.json:', err);
      });
  }

  // ─── ASSET CATEGORY FILTERING ─────────────────────────────────────────────

  function applyAssetFilter() {
    if (!map || !map.getLayer('cultural-assets-dots')) return;
    // Build a list of all visible categories
    var visibleCats = [];
    activeGroups.forEach(function(group) {
      var cats = FILTER_GROUPS[group];
      if (cats) cats.forEach(function(c) { visibleCats.push(c); });
    });
    var filterExpr;
    if (visibleCats.length === 0) {
      filterExpr = ['==', ['get', 'category'], '__none__'];
    } else {
      filterExpr = ['in', ['get', 'category'], ['literal', visibleCats]];
    }
    map.setFilter('cultural-assets-dots', filterExpr);
    // Keep labels in sync with circle layer filter
    if (map.getLayer('asset-labels')) {
      map.setFilter('asset-labels', filterExpr);
    }
  }

  // ─── VENUE-EVENTS LAYER ───────────────────────────────────────────────────

  function addVenueEventsSource() {
    map.addSource('venue-events', {
      type: 'geojson',
      data: venueEventsGeoJSON,
    });

    // Glow halo layer (behind the main dot)
    map.addLayer({
      id: 'venue-events-glow',
      type: 'circle',
      source: 'venue-events',
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          8, 10,
          12, 16,
          15, 22,
        ],
        'circle-color': 'rgba(255, 36, 0, 0.15)',
        'circle-stroke-width': 0,
        'circle-opacity': 0.6,
      }
    });

    // Main venue-event dot
    map.addLayer({
      id: 'venue-events-circles',
      type: 'circle',
      source: 'venue-events',
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          8, 10,
          12, 14,
          15, 16,
        ],
        'circle-color': '#FF2400',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF',
        'circle-opacity': 0.9,
      }
    });

    // Letter label on each pin
    map.addLayer({
      id: 'venue-events-labels',
      type: 'symbol',
      source: 'venue-events',
      layout: {
        'text-field': ['get', 'marker_letter'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 8, 10, 12, 12, 15, 14],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-allow-overlap': true,
        'icon-allow-overlap': true,
      },
      paint: {
        'text-color': '#FFFFFF',
      }
    });
  }

  /**
   * Update the venue-events layer with new data.
   * Called by event-sidebar.js when time filters change.
   */
  function setVenueEvents(matchedEvents) {
    venueEventsGeoJSON = buildVenueEventsGeoJSON(matchedEvents);
    if (map && map.getSource('venue-events')) {
      map.getSource('venue-events').setData(venueEventsGeoJSON);
    }
  }

  // ─── PULSE ANIMATION ─────────────────────────────────────────────────────

  function startPulseAnimation() {
    var startTime = performance.now();

    function animate() {
      if (!map || !map.getLayer('venue-events-glow')) {
        pulseAnimFrame = requestAnimationFrame(animate);
        return;
      }

      var elapsed = (performance.now() - startTime) / 1000;
      var pulse = 0.4 + 0.25 * Math.sin(elapsed * 2.5);

      map.setPaintProperty('venue-events-glow', 'circle-opacity', pulse);

      pulseAnimFrame = requestAnimationFrame(animate);
    }

    pulseAnimFrame = requestAnimationFrame(animate);
  }

  // ─── INTERACTIONS ─────────────────────────────────────────────────────────

  function setupInteractions() {
    // Pointer cursor on venue-event dots
    map.on('mouseenter', 'venue-events-circles', function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'venue-events-circles', function () {
      map.getCanvas().style.cursor = '';
    });

    // Click venue-event dot: show detail panel
    map.on('click', 'venue-events-circles', function (e) {
      if (!e.features || e.features.length === 0) return;
      var props = e.features[0].properties;
      showDetailPanel(props);
    });

    // Click empty space: close detail panel
    map.on('click', function (e) {
      var features = map.queryRenderedFeatures(e.point, { layers: ['venue-events-circles'] });
      if (!features || features.length === 0) {
        closeDetailPanel();
      }
    });

    // Listen for sidebar hover events
    document.addEventListener('v2:highlight-venue', function (e) {
      highlightVenue(e.detail.venueName);
    });

    document.addEventListener('v2:unhighlight-venue', function () {
      unhighlightVenue();
    });

    document.addEventListener('v2:fly-to-venue', function (e) {
      flyToVenue(e.detail.lng, e.detail.lat);
    });
  }

  // ─── DETAIL PANEL ─────────────────────────────────────────────────────────

  function showDetailPanel(props) {
    var panel = document.getElementById('detail-panel');
    if (!panel) return;

    var events = [];
    try {
      events = JSON.parse(props.events_json);
    } catch (err) {
      events = [];
    }

    var letter = venueLetterMap[props.venue_name] || '';
    var html = '<h3 class="v2-detail-venue-name">';
    if (letter) html += '<span class="v2-venue-letter">' + letter + '</span>';
    html += escapeHtml(props.venue_name) + '</h3>';
    if (props.city) {
      html += '<p class="v2-detail-venue-address">' + escapeHtml(props.city) + '</p>';
    }

    html += '<div class="v2-detail-events-list">';
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      var time = formatTime(ev.date || ev.start);
      html += '<div class="v2-detail-event-item">';
      html += '<div>';
      html += '<h4>' + escapeHtml(ev.title) + '</h4>';
      html += '<p>' + time + '</p>';
      if (ev.description) {
        html += '<p>' + escapeHtml(ev.description.substring(0, 120)) + '...</p>';
      }
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';

    document.getElementById('detail-panel-content').innerHTML = html;
    panel.classList.add('open');
  }

  function closeDetailPanel() {
    var panel = document.getElementById('detail-panel');
    if (panel) panel.classList.remove('open');
  }

  // ─── VENUE HIGHLIGHT (from sidebar hover) ─────────────────────────────────

  function highlightVenue(venueName) {
    if (!map || !map.getLayer('venue-events-circles')) return;

    // Increase circle size for matching venue
    map.setPaintProperty('venue-events-circles', 'circle-radius', [
      'case',
      ['==', ['get', 'venue_name'], venueName],
      ['interpolate', ['linear'], ['zoom'], 8, 9, 12, 14, 15, 18],
      ['interpolate', ['linear'], ['zoom'], 8, 5, 12, 8, 15, 11],
    ]);

    map.setPaintProperty('venue-events-circles', 'circle-stroke-width', [
      'case',
      ['==', ['get', 'venue_name'], venueName],
      3,
      2,
    ]);

    highlightedVenueId = venueName;
  }

  function unhighlightVenue() {
    if (!map || !map.getLayer('venue-events-circles')) return;

    map.setPaintProperty('venue-events-circles', 'circle-radius', [
      'interpolate', ['linear'], ['zoom'],
      8, 5,
      12, 8,
      15, 11,
    ]);

    map.setPaintProperty('venue-events-circles', 'circle-stroke-width', 2);
    highlightedVenueId = null;
  }

  // ─── FLY TO VENUE ─────────────────────────────────────────────────────────

  function flyToVenue(lng, lat) {
    if (!map) return;
    map.flyTo({
      center: [lng, lat],
      zoom: 14,
      duration: 800,
    });
  }

  // ─── UTILITIES ────────────────────────────────────────────────────────────

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatTime(isoStr) {
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
        ' at ' +
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      return isoStr;
    }
  }

  // ─── DEEP LINK (from story pages) ────────────────────────────────────────

  var deepLinkPopup = null;

  function handleDeepLink() {
    var params = new URLSearchParams(window.location.search);
    var venueName = params.get('venue');
    if (!venueName) return;

    // Search in loaded asset features
    var match = null;
    var searchLower = venueName.toLowerCase();
    for (var i = 0; i < allAssetFeatures.length; i++) {
      var f = allAssetFeatures[i];
      if (f.properties.name && f.properties.name.toLowerCase() === searchLower) {
        match = f;
        break;
      }
    }

    // Also try partial match
    if (!match) {
      for (var j = 0; j < allAssetFeatures.length; j++) {
        var f2 = allAssetFeatures[j];
        if (f2.properties.name && f2.properties.name.toLowerCase().indexOf(searchLower) !== -1) {
          match = f2;
          break;
        }
      }
    }

    if (match) {
      var coords = match.geometry.coordinates;
      map.flyTo({ center: coords, zoom: 15, duration: 1200 });

      // Show a popup at the venue
      if (deepLinkPopup) deepLinkPopup.remove();
      deepLinkPopup = new maplibregl.Popup({ offset: 12, closeButton: true })
        .setLngLat(coords)
        .setHTML(
          '<div style="font-family:Nunito,sans-serif;padding:4px;">' +
          '<strong style="font-size:14px;">' + escapeHtml(match.properties.name) + '</strong>' +
          (match.properties.city ? '<br><span style="color:#666;font-size:12px;">' + escapeHtml(match.properties.city) + '</span>' : '') +
          '</div>'
        )
        .addTo(map);
    }
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  function toggleAssetGroup(groupName) {
    if (activeGroups.has(groupName)) {
      activeGroups.delete(groupName);
    } else {
      activeGroups.add(groupName);
    }
    applyAssetFilter();
  }

  window.ArtsHubMapV2 = {
    init: init,
    setVenueEvents: setVenueEvents,
    flyToVenue: flyToVenue,
    highlightVenue: highlightVenue,
    unhighlightVenue: unhighlightVenue,
    getMap: function () { return map; },
    getVenueLetters: function () { return venueLetterMap; },
    toggleAssetGroup: toggleAssetGroup,
    getActiveGroups: function () { return activeGroups; },
    FILTER_GROUPS: FILTER_GROUPS,
    GROUP_COLORS: GROUP_COLORS,
  };

  // ─── AUTO-INIT ────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('map-main')) {
      init();
    }
  });

})();
