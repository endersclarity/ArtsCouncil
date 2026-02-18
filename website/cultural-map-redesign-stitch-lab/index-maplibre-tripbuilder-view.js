(function() {
  'use strict';

  var cssInjected = false;

  var HUB_URL = 'index-maplibre-hero-intent-stitch-frontend-design-pass.html';

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Render the dream board zone with cards for all bookmarked places and events.
   * @param {Object} store - dreamboard store { places: [], events: [] }
   * @param {Array} data - full data.json array for resolving asset details
   * @returns {string} HTML string
   */
  function renderDreamBoardZone(store, data) {
    var places = (store && store.places) || [];
    var events = (store && store.events) || [];
    var totalCount = places.length + events.length;

    var config = window.CulturalMapConfig || {};
    var CATS = config.CATS || {};

    var html = '<div class="tb-zone tb-dreamboard">';
    html += '<h2 class="tb-zone-title">Dream Board';
    if (totalCount > 0) {
      html += ' <span class="tb-count">' + totalCount + '</span>';
    }
    html += '</h2>';

    // Empty state
    if (totalCount === 0) {
      html += '<div class="tb-empty-state">';
      html += '<svg class="tb-empty-icon" viewBox="0 0 64 64" width="64" height="64">';
      html += '<path d="M20 8a6 6 0 0 0-6 6v40l18-8 18 8V14a6 6 0 0 0-6-6H20z" fill="none" stroke="#c8943e" stroke-width="2.5" opacity="0.5"/>';
      html += '<path d="M32 22v16M24 30h16" stroke="#c8943e" stroke-width="2" stroke-linecap="round" opacity="0.4"/>';
      html += '</svg>';
      html += '<p class="tb-empty-title">Your dream board is empty</p>';
      html += '<p class="tb-empty-desc">Save places and events you love while exploring, and they\'ll appear here.</p>';
      html += '<a href="' + HUB_URL + '" class="tb-empty-cta">Start exploring</a>';
      html += '</div>';
      html += '</div>';
      return html;
    }

    // Build a lookup by name for asset data
    var dataLookup = {};
    if (data) {
      for (var d = 0; d < data.length; d++) {
        dataLookup[data[d].n.toLowerCase()] = data[d];
      }
    }

    html += '<div class="tb-cards-grid">';

    // Place cards
    for (var i = 0; i < places.length; i++) {
      var place = places[i];
      var catCfg = CATS[place.layer] || {};
      var catColor = catCfg.color || '#8a8278';
      var escapedName = escapeHtml(place.asset);

      html += '<div class="dreamboard-card tb-card-place" data-asset-name="' + escapedName + '">';
      html += '<div class="tb-card-accent" style="background:' + catColor + '"></div>';
      html += '<button class="remove-btn" type="button" aria-label="Remove ' + escapedName + ' from dream board" title="Remove">&times;</button>';
      html += '<div class="tb-card-body">';
      html += '<span class="tb-card-name">' + escapedName + '</span>';
      if (place.city) {
        html += '<span class="tb-card-city">' + escapeHtml(place.city) + '</span>';
      }
      html += '<span class="tb-card-cat" style="color:' + catColor + '">' + escapeHtml(place.layer) + '</span>';
      html += '</div>';
      html += '</div>';
    }

    // Event cards
    var DateTime = (window.luxon && window.luxon.DateTime) || null;
    var nowDt = DateTime ? DateTime.now().setZone('America/Los_Angeles') : null;

    for (var j = 0; j < events.length; j++) {
      var ev = events[j];
      var evCatCfg = CATS[ev.layer] || {};
      var evCatColor = evCatCfg.color || '#8a8278';
      var isPast = false;
      var dateDisplay = '';

      if (ev.date && DateTime) {
        var evDt = DateTime.fromISO(ev.date, { zone: 'America/Los_Angeles' });
        if (evDt.isValid) {
          dateDisplay = evDt.toFormat('EEE, MMM d');
          if (nowDt && evDt < nowDt.startOf('day')) {
            isPast = true;
          }
        }
      }

      var escapedTitle = escapeHtml(ev.title);
      var escapedDate = escapeHtml(ev.date || '');
      var pastClass = isPast ? ' tb-card-past' : '';

      html += '<div class="dreamboard-card tb-card-event' + pastClass + '" data-event-title="' + escapedTitle + '" data-event-date="' + escapedDate + '">';
      html += '<div class="tb-card-accent" style="background:' + evCatColor + '"></div>';
      html += '<button class="remove-btn" type="button" aria-label="Remove event from dream board" title="Remove">&times;</button>';
      html += '<div class="tb-card-body">';
      html += '<span class="tb-card-name">' + escapedTitle + '</span>';
      if (ev.venue) {
        html += '<span class="tb-card-city">' + escapeHtml(ev.venue) + '</span>';
      }
      if (dateDisplay) {
        html += '<span class="tb-card-date' + (isPast ? ' tb-date-past' : '') + '">' + escapeHtml(dateDisplay) + '</span>';
      }
      if (isPast) {
        html += '<span class="tb-badge-past">Past</span>';
      }
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';

    // Soft/hard limit messages
    if (totalCount >= 30) {
      html += '<p class="tb-limit-note tb-limit-hard">Dream board full -- remove a place to add more</p>';
    } else if (totalCount >= 20) {
      html += '<p class="tb-limit-note">Great collection! Ready to let the concierge organize it?</p>';
    }

    html += '</div>';
    return html;
  }

  /**
   * Render the itinerary zone showing the active trip's itinerary or an empty state.
   * @param {Object} trip - itinerary-schema-compatible trip object
   * @returns {string} HTML string
   */
  function renderItineraryZone(trip) {
    var html = '<div class="tb-zone tb-itinerary">';
    html += '<h2 class="tb-zone-title">Your Itinerary</h2>';

    if (!trip || !trip.days || trip.days.length === 0) {
      html += '<div class="tb-empty-state tb-empty-itinerary">';
      html += '<p class="tb-empty-title">No itinerary yet</p>';
      html += '<p class="tb-empty-desc">Ask the local concierge to organize your dream board into a day-by-day plan.</p>';
      html += '<button class="tb-plan-cta" id="plan-trip-cta" type="button">Plan this trip</button>';
      html += '<div class="tb-style-cards">';
      html += '<button class="style-card" data-plan="1day" type="button"><span class="style-card-icon">1</span><span class="style-card-label">1-day plan</span></button>';
      html += '<button class="style-card" data-plan="2day" type="button"><span class="style-card-icon">2</span><span class="style-card-label">2-day plan</span></button>';
      html += '<button class="style-card" data-plan="organize" type="button"><span class="style-card-icon">&varr;</span><span class="style-card-label">Just organize</span></button>';
      html += '</div>';
      html += '</div>';
    } else {
      // Render trip days using simple built-in rendering
      // (The full itinerary view reuse happens via the controller on the hub page)
      html += '<div class="tb-itinerary-content" id="tb-itinerary-content">';
      html += renderSimpleTripDays(trip);
      html += '</div>';
      html += '<div class="tb-attribution">Built with the Local Concierge</div>';
    }

    html += '</div>';
    return html;
  }

  /**
   * Simple rendering of trip days for the trip page (without hub's full overlay system).
   * @param {Object} trip
   * @returns {string} HTML
   */
  function renderSimpleTripDays(trip) {
    if (!trip || !trip.days) return '';
    var accent = (trip.theme && trip.theme.accent) || '#c8943e';
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

    // Day contents
    for (var d = 0; d < trip.days.length; d++) {
      var day = trip.days[d];
      var dayActive = d === 0 ? ' tb-day-active' : '';
      html += '<div class="tb-day-content' + dayActive + '" data-day-index="' + d + '">';
      if (trip.days.length <= 1 && day.label) {
        html += '<h3 class="tb-day-label">' + escapeHtml(day.label) + '</h3>';
      }
      for (var s = 0; s < (day.stops || []).length; s++) {
        var stop = day.stops[s];
        html += '<div class="tb-stop-card">';
        html += '<span class="tb-stop-number" style="background:' + accent + '">' + (s + 1) + '</span>';
        html += '<div class="tb-stop-body">';
        html += '<span class="tb-stop-name">' + escapeHtml(stop.asset) + '</span>';
        if (stop.time) {
          html += '<span class="tb-stop-time">' + escapeHtml(stop.time) + '</span>';
        }
        if (stop.duration) {
          html += '<span class="tb-stop-duration">' + stop.duration + ' min</span>';
        }
        if (stop.narrative) {
          html += '<p class="tb-stop-narrative">' + escapeHtml(stop.narrative) + '</p>';
        }
        html += '</div>';
        html += '</div>';
      }
      html += '</div>';
    }

    return html;
  }

  /**
   * Render the unplanned zone showing dream board items not in the active trip.
   * @param {Array} dreamBoardPlaces - places from dream board store
   * @param {Object} trip - active trip object (with .days[].stops[].asset)
   * @returns {string} HTML string
   */
  function renderUnplannedZone(dreamBoardPlaces, trip) {
    if (!dreamBoardPlaces || dreamBoardPlaces.length === 0) return '';

    // Collect all trip stop asset names (lowercase for comparison)
    var tripAssets = {};
    if (trip && trip.days) {
      for (var d = 0; d < trip.days.length; d++) {
        var stops = trip.days[d].stops || [];
        for (var s = 0; s < stops.length; s++) {
          tripAssets[(stops[s].asset || '').toLowerCase()] = true;
        }
      }
    }

    // Filter to unplanned items
    var unplanned = dreamBoardPlaces.filter(function(p) {
      return !tripAssets[(p.asset || '').toLowerCase()];
    });

    if (unplanned.length === 0) {
      if (trip && trip.days && trip.days.length > 0) {
        return '<div class="tb-zone tb-unplanned"><p class="tb-all-planned">Everything made the cut!</p></div>';
      }
      return '';
    }

    var config = window.CulturalMapConfig || {};
    var CATS = config.CATS || {};

    var html = '<div class="tb-zone tb-unplanned">';
    html += '<h2 class="tb-zone-title">Still on Your Radar</h2>';
    html += '<ul class="tb-unplanned-list">';

    for (var i = 0; i < unplanned.length; i++) {
      var item = unplanned[i];
      var catCfg = CATS[item.layer] || {};
      var catColor = catCfg.color || '#8a8278';
      html += '<li class="tb-unplanned-item">';
      html += '<span class="tb-unplanned-dot" style="background:' + catColor + '"></span>';
      html += '<span class="tb-unplanned-name">' + escapeHtml(item.asset) + '</span>';
      if (item.city) {
        html += '<span class="tb-unplanned-city">' + escapeHtml(item.city) + '</span>';
      }
      html += '</li>';
    }

    html += '</ul>';
    html += '</div>';
    return html;
  }

  /**
   * Render the trip selector dropdown/tabs for multi-trip management.
   * @param {Array} trips - array of trip objects
   * @param {string} activeId - id of active trip
   * @returns {string} HTML string
   */
  function renderTripSelector(trips, activeId) {
    if (!trips || trips.length === 0) return '';

    var activeTrip = null;
    for (var i = 0; i < trips.length; i++) {
      if (trips[i].id === activeId) { activeTrip = trips[i]; break; }
    }

    var html = '<div class="tb-trip-selector">';

    // Active trip name (double-click to rename)
    html += '<span class="tb-trip-name" id="tb-active-trip-name" title="Double-click to rename">';
    html += escapeHtml(activeTrip ? activeTrip.title : 'My Trip');
    html += '</span>';

    // Trip switcher dropdown (only if multiple trips)
    if (trips.length > 1) {
      html += '<select class="tb-trip-dropdown" id="tb-trip-dropdown" aria-label="Switch trip">';
      for (var j = 0; j < trips.length; j++) {
        var selected = trips[j].id === activeId ? ' selected' : '';
        html += '<option value="' + escapeHtml(trips[j].id) + '"' + selected + '>' + escapeHtml(trips[j].title) + '</option>';
      }
      html += '</select>';
    }

    // Action buttons
    html += '<div class="tb-trip-actions">';
    html += '<button class="tb-trip-btn" id="tb-new-trip-btn" type="button" title="Create new trip">+ New Trip</button>';
    if (trips.length > 1) {
      html += '<button class="tb-trip-btn tb-trip-delete-btn" id="tb-delete-trip-btn" type="button" title="Delete this trip">Delete</button>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  /**
   * Inject CSS for trip builder page styles.
   */
  function injectCSS() {
    if (cssInjected) return;
    cssInjected = true;
    var style = document.createElement('style');
    style.id = 'tripbuilder-styles';
    style.textContent = [
      /* Trip selector */
      '.tb-trip-selector {',
      '  display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; margin-bottom: 1rem;',
      '  border-bottom: 1px solid rgba(138,130,120,0.15); flex-wrap: wrap;',
      '}',
      '.tb-trip-name {',
      '  font-family: "Playfair Display", serif; font-size: 1.3rem; font-weight: 700;',
      '  color: var(--ink, #1a1612); cursor: default;',
      '}',
      '.tb-trip-dropdown {',
      '  font-family: "DM Sans", sans-serif; font-size: 0.85rem; padding: 0.3rem 0.5rem;',
      '  border: 1px solid rgba(138,130,120,0.25); border-radius: 6px;',
      '  background: var(--cream, #f5f0e8); color: var(--ink, #1a1612); cursor: pointer;',
      '}',
      '.tb-trip-actions { display: flex; gap: 0.5rem; margin-left: auto; }',
      '.tb-trip-btn {',
      '  font-family: "DM Sans", sans-serif; font-size: 0.78rem; font-weight: 600;',
      '  padding: 0.35rem 0.75rem; border: 1px solid #c8943e; border-radius: 6px;',
      '  background: transparent; color: #c8943e; cursor: pointer; transition: all 0.2s;',
      '}',
      '.tb-trip-btn:hover { background: #c8943e; color: #fff; }',
      '.tb-trip-delete-btn { border-color: #b85c38; color: #b85c38; }',
      '.tb-trip-delete-btn:hover { background: #b85c38; color: #fff; }',

      /* Zones */
      '.tb-zone { margin-bottom: 1.5rem; }',
      '.tb-zone-title {',
      '  font-family: "Playfair Display", serif; font-size: 1.15rem; font-weight: 700;',
      '  color: var(--ink, #1a1612); margin: 0 0 0.75rem; display: flex; align-items: center; gap: 0.5rem;',
      '}',
      '.tb-count {',
      '  display: inline-flex; align-items: center; justify-content: center;',
      '  background: #c8943e; color: #fff; border-radius: 50%; width: 22px; height: 22px;',
      '  font-family: "DM Sans", sans-serif; font-size: 0.72rem; font-weight: 700;',
      '}',

      /* Two-column layout */
      '.tb-columns { display: grid; grid-template-columns: 55% 45%; gap: 1.5rem; }',
      '@media (max-width: 900px) { .tb-columns { grid-template-columns: 1fr; } }',

      /* Empty states */
      '.tb-empty-state {',
      '  text-align: center; padding: 2rem 1.5rem; border: 2px dashed rgba(200,148,62,0.3);',
      '  border-radius: 12px; background: rgba(200,148,62,0.04);',
      '}',
      '.tb-empty-icon { margin-bottom: 0.75rem; }',
      '.tb-empty-title {',
      '  font-family: "DM Sans", sans-serif; font-size: 1rem; font-weight: 600;',
      '  color: var(--ink, #1a1612); margin: 0 0 0.5rem;',
      '}',
      '.tb-empty-desc {',
      '  font-family: "DM Sans", sans-serif; font-size: 0.85rem; color: #8a8278;',
      '  margin: 0 0 1rem; line-height: 1.5;',
      '}',
      '.tb-empty-cta, .tb-plan-cta {',
      '  display: inline-block; font-family: "DM Sans", sans-serif; font-size: 0.85rem; font-weight: 600;',
      '  padding: 0.55rem 1.25rem; border-radius: 8px; background: #c8943e; color: #fff;',
      '  text-decoration: none; border: none; cursor: pointer; transition: background 0.2s;',
      '}',
      '.tb-empty-cta:hover, .tb-plan-cta:hover { background: #b07e2e; }',

      /* Style cards */
      '.tb-style-cards { display: flex; gap: 0.75rem; justify-content: center; margin-top: 1rem; }',
      '.style-card {',
      '  display: flex; flex-direction: column; align-items: center; gap: 0.35rem;',
      '  padding: 0.75rem 1rem; border: 1px solid rgba(200,148,62,0.3); border-radius: 10px;',
      '  background: transparent; cursor: pointer; transition: all 0.2s;',
      '  font-family: "DM Sans", sans-serif; min-width: 80px;',
      '}',
      '.style-card:hover { border-color: #c8943e; background: rgba(200,148,62,0.06); }',
      '.style-card-icon {',
      '  font-size: 1.4rem; font-weight: 700; color: #c8943e; line-height: 1;',
      '}',
      '.style-card-label { font-size: 0.72rem; color: #8a8278; }',

      /* Dream board cards grid */
      '.tb-cards-grid {',
      '  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem;',
      '}',
      '@media (max-width: 600px) { .tb-cards-grid { grid-template-columns: 1fr 1fr; } }',

      /* Dream board card */
      '.dreamboard-card {',
      '  position: relative; background: #fff; border-radius: 10px; overflow: hidden;',
      '  box-shadow: 0 1px 6px rgba(0,0,0,0.08); cursor: pointer; transition: box-shadow 0.2s, transform 0.2s;',
      '}',
      '.dreamboard-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,0.12); transform: translateY(-1px); }',
      '.tb-card-accent { height: 4px; width: 100%; }',
      '.tb-card-body { padding: 0.65rem 0.75rem; }',
      '.tb-card-name {',
      '  display: block; font-family: "DM Sans", sans-serif; font-size: 0.82rem; font-weight: 600;',
      '  color: var(--ink, #1a1612); line-height: 1.3; margin-bottom: 0.2rem;',
      '}',
      '.tb-card-city {',
      '  display: block; font-family: "DM Sans", sans-serif; font-size: 0.72rem; color: #8a8278;',
      '}',
      '.tb-card-cat {',
      '  display: block; font-family: "DM Sans", sans-serif; font-size: 0.68rem;',
      '  font-weight: 500; margin-top: 0.2rem; text-transform: uppercase; letter-spacing: 0.04em;',
      '}',
      '.tb-card-date {',
      '  display: block; font-family: "DM Sans", sans-serif; font-size: 0.72rem; color: #8a8278; margin-top: 0.15rem;',
      '}',
      '.tb-date-past { text-decoration: line-through; }',
      '.tb-badge-past {',
      '  display: inline-block; font-family: "DM Sans", sans-serif; font-size: 0.62rem;',
      '  font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;',
      '  background: rgba(184,92,56,0.12); color: #b85c38; padding: 0.15rem 0.45rem;',
      '  border-radius: 4px; margin-top: 0.25rem;',
      '}',
      '.tb-card-past { opacity: 0.5; }',

      /* Remove button */
      '.dreamboard-card .remove-btn {',
      '  position: absolute; top: 8px; right: 8px; width: 22px; height: 22px;',
      '  display: flex; align-items: center; justify-content: center;',
      '  background: rgba(26,22,18,0.7); color: #fff; border: none; border-radius: 50%;',
      '  font-size: 14px; line-height: 1; cursor: pointer; z-index: 3;',
      '  opacity: 0; transition: opacity 0.2s;',
      '}',
      '.dreamboard-card:hover .remove-btn { opacity: 1; }',

      /* Limit notes */
      '.tb-limit-note {',
      '  font-family: "DM Sans", sans-serif; font-size: 0.82rem; color: #8a8278;',
      '  text-align: center; margin-top: 0.75rem; font-style: italic;',
      '}',
      '.tb-limit-hard { color: #b85c38; font-style: normal; font-weight: 500; }',

      /* Itinerary zone */
      '.tb-itinerary-content { padding: 0; }',
      '.tb-attribution {',
      '  font-family: "DM Sans", sans-serif; font-size: 0.72rem; color: #8a8278;',
      '  text-align: center; margin-top: 0.75rem; padding-top: 0.5rem;',
      '  border-top: 2px solid #c8943e;',
      '}',

      /* Day tabs */
      '.tb-day-tabs { display: flex; gap: 0; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(138,130,120,0.15); }',
      '.tb-day-tab {',
      '  font-family: "DM Sans", sans-serif; font-size: 0.82rem; font-weight: 600;',
      '  padding: 0.5rem 1rem; border: none; background: none; cursor: pointer;',
      '  color: #8a8278; border-bottom: 2px solid transparent; transition: all 0.2s;',
      '}',
      '.tb-day-tab:hover { color: var(--ink, #1a1612); }',
      '.tb-tab-active { color: var(--ink, #1a1612); }',
      '.tb-day-content { display: none; }',
      '.tb-day-active { display: block; }',
      '.tb-day-label {',
      '  font-family: "DM Sans", sans-serif; font-size: 0.9rem; font-weight: 600;',
      '  color: var(--ink, #1a1612); margin: 0 0 0.5rem;',
      '}',

      /* Stop cards */
      '.tb-stop-card {',
      '  display: flex; gap: 0.65rem; align-items: flex-start; padding: 0.65rem 0;',
      '  border-bottom: 1px solid rgba(138,130,120,0.08);',
      '}',
      '.tb-stop-number {',
      '  flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%;',
      '  display: flex; align-items: center; justify-content: center;',
      '  color: #fff; font-family: "DM Sans", sans-serif; font-size: 0.72rem; font-weight: 700;',
      '}',
      '.tb-stop-body { flex: 1; min-width: 0; }',
      '.tb-stop-name {',
      '  display: block; font-family: "DM Sans", sans-serif; font-size: 0.85rem; font-weight: 600;',
      '  color: var(--ink, #1a1612);',
      '}',
      '.tb-stop-time, .tb-stop-duration {',
      '  font-family: "DM Sans", sans-serif; font-size: 0.72rem; color: #8a8278; margin-right: 0.5rem;',
      '}',
      '.tb-stop-narrative {',
      '  font-family: "DM Sans", sans-serif; font-size: 0.78rem; color: #6b645c;',
      '  line-height: 1.45; margin: 0.25rem 0 0;',
      '}',

      /* Unplanned zone */
      '.tb-unplanned-list { list-style: none; padding: 0; margin: 0; }',
      '.tb-unplanned-item {',
      '  display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0;',
      '  font-family: "DM Sans", sans-serif; font-size: 0.82rem;',
      '}',
      '.tb-unplanned-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }',
      '.tb-unplanned-name { color: var(--ink, #1a1612); font-weight: 500; }',
      '.tb-unplanned-city { color: #8a8278; font-size: 0.75rem; }',
      '.tb-all-planned {',
      '  font-family: "DM Sans", sans-serif; font-size: 0.85rem; color: #4a7c5f;',
      '  text-align: center; font-style: italic; padding: 0.5rem 0;',
      '}',

      /* Share button */
      '.tb-itinerary-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }',
      '.tb-share-btn {',
      '  display: inline-flex; align-items: center; gap: 0.3rem;',
      '  font-family: "DM Sans", sans-serif; font-size: 0.78rem; font-weight: 600;',
      '  padding: 0.4rem 0.85rem; border: 1px solid #c8943e; border-radius: 6px;',
      '  background: transparent; color: #c8943e; cursor: pointer; transition: all 0.2s;',
      '}',
      '.tb-share-btn:hover { background: #c8943e; color: #fff; }',

      /* Calendar button in trip stop */
      '.tb-stop-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.35rem; }',
      '.tb-stop-calendar-btn {',
      '  display: inline-flex; align-items: center; gap: 0.3rem;',
      '  font-family: "DM Sans", sans-serif; font-size: 0.68rem; font-weight: 600;',
      '  letter-spacing: 0.04em; text-transform: uppercase; text-decoration: none;',
      '  padding: 0.3rem 0.6rem; border-radius: 5px;',
      '  background: rgba(200,148,62,0.1); border: 1px solid rgba(200,148,62,0.25); color: #c8943e;',
      '  transition: background 0.15s;',
      '}',
      '.tb-stop-calendar-btn:hover { background: rgba(200,148,62,0.2); }',

      /* Map container */
      '#trip-map {',
      '  width: 100%; height: 400px; border-radius: 12px; overflow: hidden;',
      '  box-shadow: 0 2px 12px rgba(0,0,0,0.1); margin-top: 1.5rem;',
      '}',
      '@media (max-width: 600px) { #trip-map { height: 300px; border-radius: 8px; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  window.CulturalMapTripBuilderView = {
    renderDreamBoardZone: renderDreamBoardZone,
    renderItineraryZone: renderItineraryZone,
    renderUnplannedZone: renderUnplannedZone,
    renderTripSelector: renderTripSelector,
    renderSimpleTripDays: renderSimpleTripDays,
    injectCSS: injectCSS
  };
})();
