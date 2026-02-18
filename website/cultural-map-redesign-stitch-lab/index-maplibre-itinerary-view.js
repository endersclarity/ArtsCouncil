(function() {
  'use strict';

  // Inject styles once
  var stylesInjected = false;
  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    var style = document.createElement('style');
    style.textContent = [
      /* Hero cards row */
      '.itinerary-hero-cards { display: flex; gap: 0.75rem; padding: 0.5rem 0; }',
      '.itinerary-hero-card { flex: 1; min-width: 0; background: var(--card-bg, rgba(255,255,255,0.85)); border: 1px solid rgba(217,212,202,0.6); border-radius: var(--card-radius, 14px); box-shadow: var(--card-shadow, 0 8px 24px rgba(11,15,23,0.08)); padding: 1rem 1.1rem; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; position: relative; overflow: hidden; }',
      '.itinerary-hero-card:hover { transform: translateY(-3px); box-shadow: var(--card-shadow-hover, 0 16px 34px rgba(11,15,23,0.13)); }',
      '.itinerary-hero-card-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }',
      '.itinerary-hero-card-duration { display: inline-block; font-family: var(--font-body, "DM Sans", sans-serif); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.2rem 0.5rem; border-radius: 999px; margin-bottom: 0.5rem; color: #fff; }',
      '.itinerary-hero-card-title { font-family: var(--font-display, "Archivo", sans-serif); font-size: 1rem; font-weight: 700; line-height: 1.25; margin: 0 0 0.25rem; color: var(--color-ink, #1a1612); }',
      '.itinerary-hero-card-desc { font-family: var(--font-body, "DM Sans", sans-serif); font-size: 0.78rem; line-height: 1.45; color: rgba(26,22,18,0.65); margin: 0 0 0.75rem; }',
      '.itinerary-hero-card-cta { display: inline-block; font-family: var(--font-body, "DM Sans", sans-serif); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; border: none; background: transparent; padding: 0; cursor: pointer; }',

      /* Overlay */
      '.itinerary-overlay { position: fixed; inset: 0; z-index: 9000; display: flex; align-items: center; justify-content: center; pointer-events: none; opacity: 0; }',
      '.itinerary-overlay.active { pointer-events: auto; }',
      '.itinerary-overlay-backdrop { position: absolute; inset: 0; background: rgba(26,22,18,0.55); }',
      '.itinerary-overlay-content { position: relative; background: var(--card-bg, #f5f0e8); border-radius: var(--card-radius, 14px); box-shadow: 0 24px 64px rgba(11,15,23,0.22); max-width: 680px; width: calc(100% - 2rem); max-height: 85vh; overflow-y: auto; padding: 2rem 2rem 1.5rem; }',
      '.itinerary-overlay-close { position: absolute; top: 1rem; right: 1rem; background: transparent; border: 1px solid rgba(26,22,18,0.18); border-radius: 50%; width: 36px; height: 36px; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; color: var(--color-ink, #1a1612); }',
      '.itinerary-overlay-close:hover { background: rgba(26,22,18,0.06); }',

      /* Overlay header */
      '.itinerary-overlay-header { margin-bottom: 1.5rem; }',
      '.itinerary-overlay-title { font-family: var(--font-display, "Archivo", sans-serif); font-size: 1.5rem; font-weight: 800; margin: 0 0 0.25rem; color: var(--color-ink, #1a1612); }',
      '.itinerary-overlay-subtitle { font-family: var(--font-body, "DM Sans", sans-serif); font-size: 0.88rem; color: rgba(26,22,18,0.55); margin: 0 0 0.5rem; }',
      '.itinerary-overlay-badge { display: inline-block; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.2rem 0.5rem; border-radius: 999px; color: #fff; }',
      '.itinerary-make-mine-btn { display: inline-block; font-family: var(--font-body, "DM Sans", sans-serif); font-size: 0.78rem; font-weight: 600; padding: 0.45rem 1rem; border: 2px solid #c8943e; border-radius: 8px; background: transparent; color: #c8943e; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; }',
      '.itinerary-make-mine-btn:hover { background: #c8943e; color: #fff; }',

      /* Day tabs */
      '.itinerary-day-tabs { display: flex; gap: 0; border-bottom: 2px solid rgba(217,212,202,0.5); margin-bottom: 1.25rem; }',
      '.itinerary-day-tab { font-family: var(--font-body, "DM Sans", sans-serif); font-size: 0.82rem; font-weight: 600; padding: 0.6rem 1rem; background: none; border: none; cursor: pointer; color: rgba(26,22,18,0.45); border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color 0.2s, border-color 0.2s; }',
      '.itinerary-day-tab:hover { color: rgba(26,22,18,0.7); }',
      '.itinerary-day-tab.active { color: var(--color-ink, #1a1612); }',

      /* Day content */
      '.itinerary-day-content { display: none; }',
      '.itinerary-day-content.active { display: block; }',

      /* Stop card */
      '.itinerary-stop-card { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid rgba(217,212,202,0.35); }',
      '.itinerary-stop-card:last-child { border-bottom: none; }',
      '.itinerary-stop-num { flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; color: #fff; font-family: var(--font-body, "DM Sans", sans-serif); font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 0.15rem; }',
      '.itinerary-stop-body { flex: 1; min-width: 0; }',
      '.itinerary-stop-name { font-family: var(--font-display, "Archivo", sans-serif); font-size: 0.95rem; font-weight: 700; margin: 0 0 0.15rem; color: var(--color-ink, #1a1612); cursor: pointer; }',
      '.itinerary-stop-name:hover { text-decoration: underline; }',
      '.itinerary-stop-time { font-family: var(--font-body, "DM Sans", sans-serif); font-size: 0.72rem; color: rgba(26,22,18,0.5); margin-bottom: 0.4rem; }',
      '.itinerary-stop-narrative { font-family: var(--font-body, "DM Sans", sans-serif); font-size: 0.82rem; line-height: 1.55; color: rgba(26,22,18,0.72); margin-bottom: 0.4rem; }',
      '.itinerary-stop-tip { font-family: var(--font-body, "DM Sans", sans-serif); font-size: 0.75rem; line-height: 1.45; background: rgba(42,140,140,0.06); border-left: 3px solid rgba(42,140,140,0.4); padding: 0.5rem 0.65rem; border-radius: 0 6px 6px 0; color: rgba(26,22,18,0.62); margin-bottom: 0.4rem; }',
      '.itinerary-stop-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }',
      '.itinerary-stop-calendar-btn, .itinerary-stop-map-btn { font-family: var(--font-body, "DM Sans", sans-serif); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 0.35rem 0.7rem; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem; transition: background 0.15s; }',
      '.itinerary-stop-calendar-btn { background: rgba(42,140,140,0.1); border: 1px solid rgba(42,140,140,0.25); color: #2a8c8c; }',
      '.itinerary-stop-calendar-btn:hover { background: rgba(42,140,140,0.18); }',
      '.itinerary-stop-map-btn { background: rgba(26,22,18,0.05); border: 1px solid rgba(26,22,18,0.15); color: rgba(26,22,18,0.6); }',
      '.itinerary-stop-map-btn:hover { background: rgba(26,22,18,0.1); }',

      /* Mobile swipe */
      '@media (max-width: 600px) {',
      '  .itinerary-hero-cards { flex-direction: column; }',
      '  .itinerary-overlay-content { padding: 1.25rem 1rem 1rem; max-height: 90vh; width: calc(100% - 1rem); }',
      '  .itinerary-stops-mobile { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 0.75rem; padding: 0.5rem 0; -webkit-overflow-scrolling: touch; }',
      '  .itinerary-stops-mobile .itinerary-stop-card { min-width: 85vw; flex-shrink: 0; scroll-snap-align: start; flex-direction: column; border: 1px solid rgba(217,212,202,0.35); border-radius: 10px; padding: 1rem; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /**
   * Format 24h time string to 12h AM/PM.
   * @param {string} time24 - "HH:MM"
   * @returns {string} e.g. "9:00 AM"
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
   * Calculate end time from start + duration.
   * @param {string} time24 - "HH:MM"
   * @param {number} durationMin - minutes
   * @returns {string} e.g. "10:30 AM"
   */
  function getEndTime(time24, durationMin) {
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

  /**
   * Truncate text to maxLen characters.
   */
  function truncate(text, maxLen) {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
  }

  /**
   * Get duration label from itinerary duration field.
   */
  function getDurationLabel(duration) {
    if (!duration) return '';
    if (duration === '1-day') return '1 Day';
    if (duration === '2-day') return '2 Days';
    if (duration === '3-day') return '3 Days';
    return duration;
  }

  /**
   * Render hero cards for itineraries.
   * @param {Array} itineraries - parsed itineraries.json
   * @returns {string} HTML string
   */
  function renderHeroCards(itineraries) {
    injectStyles();
    if (!itineraries || !itineraries.length) return '';
    var html = '';
    for (var i = 0; i < itineraries.length; i++) {
      var it = itineraries[i];
      var accent = (it.theme && it.theme.accent) || '#2a8c8c';
      var desc = truncate(it.description || '', 85);
      var durLabel = getDurationLabel(it.duration);
      html += '<div class="itinerary-hero-card" data-itinerary-id="' + (it.id || '') + '">' +
        '<div class="itinerary-hero-card-accent" style="background:' + accent + ';"></div>' +
        '<span class="itinerary-hero-card-duration" style="background:' + accent + ';">' + durLabel + '</span>' +
        '<h3 class="itinerary-hero-card-title">' + (it.title || '') + '</h3>' +
        '<p class="itinerary-hero-card-desc">' + desc + '</p>' +
        '<span class="itinerary-hero-card-cta" style="color:' + accent + ';">Plan Your Visit &rarr;</span>' +
        '</div>';
    }
    return html;
  }

  /**
   * Render a single stop card.
   * @param {Object} stop - resolved stop with .data, .time, .duration, .narrative, .tip
   * @param {number} index - 0-based stop index within the day
   * @param {Object} itinerary - parent itinerary
   * @param {string} dateStr - 'YYYY-MM-DD' for calendar link
   * @param {string} accent - accent color hex
   * @returns {string} HTML string
   */
  function renderStopCard(stop, index, itinerary, dateStr, accent) {
    var cal = window.CulturalMapItineraryCalendar;
    var calUrl = cal ? cal.buildStopCalendarUrl(stop, itinerary, dateStr) : '';
    var startLabel = formatTime12h(stop.time);
    var endLabel = getEndTime(stop.time, stop.duration);
    var timeRange = startLabel && endLabel ? startLabel + ' \u2013 ' + endLabel : startLabel;
    var accentColor = accent || '#2a8c8c';
    var tipHTML = stop.tip ? '<div class="itinerary-stop-tip">' + stop.tip + '</div>' : '';

    return '<div class="itinerary-stop-card" data-stop-index="' + index + '">' +
      '<div class="itinerary-stop-num" style="background:' + accentColor + ';">' + (index + 1) + '</div>' +
      '<div class="itinerary-stop-body">' +
        '<div class="itinerary-stop-name" data-asset-name="' + (stop.data ? stop.data.n : '') + '">' + (stop.data ? stop.data.n : stop.asset) + '</div>' +
        '<div class="itinerary-stop-time">' + timeRange + ' &middot; ' + (stop.duration || 60) + ' min</div>' +
        '<div class="itinerary-stop-narrative">' + (stop.narrative || '') + '</div>' +
        tipHTML +
        '<div class="itinerary-stop-actions">' +
          (calUrl ? '<a class="itinerary-stop-calendar-btn" href="' + calUrl + '" target="_blank" rel="noopener" data-itinerary-title="' + (itinerary.title || '') + '" data-stop-name="' + (stop.data ? stop.data.n : stop.asset || '') + '">&#128197; Add to Calendar</a>' : '') +
          '<button class="itinerary-stop-map-btn" type="button" data-stop-index="' + index + '">&#128204; Show on Map</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /**
   * Render the detail overlay for an itinerary.
   * @param {Object} itinerary - the itinerary object
   * @param {Array} resolvedStops - output of resolveItineraryStops
   * @returns {string} HTML string
   */
  function renderDetailOverlay(itinerary, resolvedStops) {
    injectStyles();
    if (!itinerary) return '';

    var accent = (itinerary.theme && itinerary.theme.accent) || '#2a8c8c';
    var durLabel = getDurationLabel(itinerary.duration);
    var cal = window.CulturalMapItineraryCalendar;
    var dateStr = cal ? cal.getNextSaturday() : '';

    // Group stops by dayIndex
    var dayGroups = {};
    var dayLabels = [];
    for (var i = 0; i < resolvedStops.length; i++) {
      var s = resolvedStops[i];
      var di = s.dayIndex || 0;
      if (!dayGroups[di]) {
        dayGroups[di] = [];
        dayLabels.push({ index: di, label: s.dayLabel || ('Day ' + (di + 1)) });
      }
      dayGroups[di].push(s);
    }

    var multiDay = dayLabels.length > 1;
    var isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

    // Day tabs (only for multi-day)
    var tabsHTML = '';
    if (multiDay) {
      tabsHTML = '<div class="itinerary-day-tabs">';
      for (var t = 0; t < dayLabels.length; t++) {
        var activeClass = t === 0 ? ' active' : '';
        tabsHTML += '<button class="itinerary-day-tab' + activeClass + '" type="button" data-day-index="' + dayLabels[t].index + '" style="' + (t === 0 ? 'border-bottom-color:' + accent + ';' : '') + '">' + dayLabels[t].label + '</button>';
      }
      tabsHTML += '</div>';
    }

    // Day content blocks
    var daysHTML = '';
    for (var d = 0; d < dayLabels.length; d++) {
      var dayIdx = dayLabels[d].index;
      var stops = dayGroups[dayIdx] || [];
      var activeDay = d === 0 ? ' active' : '';

      // Calculate date for this day (next saturday + day offset)
      var dayDate = dateStr;
      if (dayIdx > 0 && dateStr) {
        var baseParts = dateStr.split('-');
        var base = new Date(parseInt(baseParts[0], 10), parseInt(baseParts[1], 10) - 1, parseInt(baseParts[2], 10));
        base.setDate(base.getDate() + dayIdx);
        dayDate = base.getFullYear() + '-' + String(base.getMonth() + 1).padStart(2, '0') + '-' + String(base.getDate()).padStart(2, '0');
      }

      var stopsHTML = '';
      for (var si = 0; si < stops.length; si++) {
        stopsHTML += renderStopCard(stops[si], si, itinerary, dayDate, accent);
      }

      var mobileClass = isMobile ? ' itinerary-stops-mobile' : '';
      daysHTML += '<div class="itinerary-day-content' + activeDay + '" data-day-index="' + dayIdx + '">' +
        '<div class="itinerary-day-stops' + mobileClass + '">' + stopsHTML + '</div>' +
      '</div>';
    }

    return '<div class="itinerary-overlay-backdrop"></div>' +
      '<div class="itinerary-overlay-content">' +
        '<button class="itinerary-overlay-close" type="button" aria-label="Close itinerary">&times;</button>' +
        '<div class="itinerary-overlay-header">' +
          '<span class="itinerary-overlay-badge" style="background:' + accent + ';">' + durLabel + '</span>' +
          '<h2 class="itinerary-overlay-title">' + (itinerary.title || '') + '</h2>' +
          '<p class="itinerary-overlay-subtitle">' + (itinerary.subtitle || '') + '</p>' +
          ((!itinerary.id || itinerary.id.indexOf('usr-') !== 0) ? '<button class="itinerary-make-mine-btn" type="button" style="border-color:' + accent + ';color:' + accent + ';">Make it mine</button>' : '') +
        '</div>' +
        tabsHTML +
        daysHTML +
      '</div>';
  }

  window.CulturalMapItineraryView = {
    renderHeroCards: renderHeroCards,
    renderDetailOverlay: renderDetailOverlay,
    renderStopCard: renderStopCard
  };

})();
