/**
 * event-sidebar.js — Arts Hub V2 Event Sidebar
 * Loads events-matched.json, applies time filters, renders sidebar cards
 * grouped by venue, and renders unmatched events in "More Events" section.
 *
 * Communicates with map-integrated.js via:
 *   - ArtsHubMapV2.setVenueEvents(matchedEvents) — update map pins
 *   - Custom events: v2:highlight-venue, v2:unhighlight-venue, v2:fly-to-venue
 */

(function () {
  'use strict';

  // ─── STATE ────────────────────────────────────────────────────────────────

  var allMatched = [];
  var allUnmatched = [];
  var activeTimeFilter = 'this-weekend'; // default

  // ─── DATE HELPERS ─────────────────────────────────────────────────────────

  var now = new Date();
  var todayStr = now.toISOString().slice(0, 10);
  var monthStr = todayStr.slice(0, 7);

  // Weekend window: Friday through Sunday
  var dayOfWeek = now.getDay();
  var fri = new Date(now);
  var sun = new Date(now);
  if (dayOfWeek === 0) { fri.setDate(now.getDate() - 2); }
  else if (dayOfWeek === 6) { fri.setDate(now.getDate() - 1); sun.setDate(now.getDate() + 1); }
  else { fri.setDate(now.getDate() + (5 - dayOfWeek)); sun.setDate(now.getDate() + (7 - dayOfWeek)); }
  var friStr = fri.toISOString().slice(0, 10);
  var sunStr = sun.toISOString().slice(0, 10);

  function getEventDate(ev) {
    var raw = ev.date || ev.start || '';
    if (!raw) return '';
    return raw.slice(0, 10);
  }

  function filterByTime(events, timeKey) {
    return events.filter(function (ev) {
      var d = getEventDate(ev);
      if (!d) return false;
      if (timeKey === 'tonight') return d === todayStr;
      if (timeKey === 'this-weekend') return d >= friStr && d <= sunStr;
      if (timeKey === 'this-month') return d.slice(0, 7) === monthStr;
      return true;
    });
  }

  var timeLabels = {
    'tonight': 'tonight',
    'this-weekend': 'this weekend',
    'this-month': 'this month',
  };

  // ─── GROUP BY VENUE ───────────────────────────────────────────────────────

  function groupByVenue(events) {
    var groups = {};
    var order = [];
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      var key = ev.asset_name || ev.venue || (ev.community_event ? (ev.title || ev.city || 'Community Event') : 'Unknown Venue');
      if (!groups[key]) {
        groups[key] = {
          venue: key,
          city: ev.city || '',
          lat: ev.asset_lat,
          lng: ev.asset_lng,
          events: [],
        };
        order.push(key);
      }
      groups[key].events.push(ev);
    }
    return order.map(function (k) { return groups[k]; });
  }

  // ─── RENDERING ────────────────────────────────────────────────────────────

  function render() {
    var filtered = filterByTime(allMatched, activeTimeFilter);
    var filteredUnmatched = filterByTime(allUnmatched, activeTimeFilter);
    var groups = groupByVenue(filtered);

    // Update map
    if (window.ArtsHubMapV2) {
      window.ArtsHubMapV2.setVenueEvents(filtered);
    }

    // Count
    var venueCount = groups.length;
    var eventCount = filtered.length;
    var countLabel = document.getElementById('event-count-label');
    if (countLabel) {
      countLabel.innerHTML = 'Showing <strong>' + eventCount + '</strong> event' +
        (eventCount !== 1 ? 's' : '') + ' ' + timeLabels[activeTimeFilter] +
        ' at <strong>' + venueCount + '</strong> venue' + (venueCount !== 1 ? 's' : '');
    }

    // Sidebar
    renderSidebar(groups, filtered);

    // More events
    renderMoreEvents(filteredUnmatched);
  }

  function renderSidebar(groups, filtered) {
    var sidebar = document.getElementById('event-sidebar');
    if (!sidebar) return;

    if (groups.length === 0) {
      var monthCount = filterByTime(allMatched, 'this-month').length;
      var hint = monthCount > 0
        ? '<p>' + monthCount + ' events this month — try <strong>This Month</strong> above.</p>'
        : '<p>Check back soon for upcoming events.</p>';
      sidebar.innerHTML =
        '<div class="v2-sidebar-heading">Events</div>' +
        '<div class="v2-sidebar-empty">' +
          '<span class="v2-sidebar-empty-icon">&#10022;</span>' +
          '<h3>Nothing scheduled ' + timeLabels[activeTimeFilter] + '</h3>' +
          hint +
        '</div>';
      return;
    }

    var letters = (window.ArtsHubMapV2 && window.ArtsHubMapV2.getVenueLetters) ? window.ArtsHubMapV2.getVenueLetters() : {};
    var html = '<div class="v2-sidebar-heading">Events at Venues</div>';

    for (var g = 0; g < groups.length; g++) {
      var group = groups[g];
      var letter = letters[group.venue] || '';
      html += '<div class="v2-venue-group" data-venue="' + escapeAttr(group.venue) + '">';

      // Venue header
      html += '<div class="v2-venue-group-header" ' +
        'data-lat="' + (group.lat || '') + '" data-lng="' + (group.lng || '') + '">';
      if (letter) html += '<span class="v2-venue-letter">' + letter + '</span>';
      html += '<span class="v2-venue-group-name">' + escapeHtml(group.venue) + '</span>';
      html += '<span class="v2-venue-group-city">' + escapeHtml(group.city) + '</span>';
      html += '<span class="v2-venue-group-fly">&#9656;</span>';
      html += '</div>';

      // Event cards
      for (var e = 0; e < group.events.length; e++) {
        var ev = group.events[e];
        var cats = ev.categories || (ev.category ? [ev.category] : []);
        var imgStyle = ev.image_url
          ? "background-image:url('" + ev.image_url + "');background-size:cover;background-position:center;"
          : "background:" + getCategoryGradient(cats) + ";";

        html += '<div class="v2-event-card" data-venue="' + escapeAttr(group.venue) + '" ' +
          'data-url="' + escapeAttr(ev.url || '#') + '" ' +
          'data-lat="' + (group.lat || '') + '" data-lng="' + (group.lng || '') + '">';

        html += '<div class="v2-event-card-image"><div style="' + imgStyle + '"></div></div>';

        html += '<div class="v2-event-card-body">';
        html += '<h4>' + escapeHtml(ev.title) + '</h4>';
        html += '<p class="v2-event-time">' + formatTime(ev.date || ev.start) + '</p>';
        var cat = ev.category || (ev.categories && ev.categories[0]) || '';
        if (cat) {
          html += '<span class="v2-event-category">' + escapeHtml(cat) + '</span>';
        }
        // Share button
        if (ev.url && ev.url !== '#') {
          html += '<button class="v2-sidebar-share-btn" data-url="' + escapeAttr(ev.url) + '" data-title="' + escapeAttr(ev.title || '') + '">Share</button>';
        }
        html += '</div>';

        html += '</div>';
      }

      html += '</div>';
    }

    sidebar.innerHTML = html;

    // Wire up interactions
    wireUpSidebarEvents();
  }

  function renderMoreEvents(unmatchedFiltered) {
    var moreEl = document.getElementById('more-events');
    if (!moreEl) return;

    if (unmatchedFiltered.length === 0) {
      moreEl.innerHTML = '';
      moreEl.style.display = 'none';
      return;
    }

    moreEl.style.display = '';

    var html = '<div class="section-label">More Events ' + timeLabels[activeTimeFilter] + '</div>';
    html += '<div class="v2-more-events-grid">';

    for (var i = 0; i < unmatchedFiltered.length; i++) {
      var ev = unmatchedFiltered[i];
      html += '<div class="v2-unmatched-card" data-url="' + escapeAttr(ev.url || '#') + '">';
      html += '<h3>' + escapeHtml(ev.title) + '</h3>';
      html += '<p class="v2-unmatched-meta">' + formatTime(ev.date || ev.start);
      if (ev.city) html += ' &middot; ' + escapeHtml(ev.city);
      html += '</p>';
      if (ev.description) {
        html += '<p class="v2-unmatched-desc">' + escapeHtml(ev.description) + '</p>';
      }
      html += '<a href="' + escapeAttr(ev.url || '#') + '" target="_blank" rel="noopener" class="read-more">Details &rarr;</a>';
      html += '</div>';
    }

    html += '</div>';
    moreEl.innerHTML = html;

    // Click on unmatched card
    moreEl.querySelectorAll('.v2-unmatched-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var url = card.dataset.url;
        if (url && url !== '#') {
          window.open(url, '_blank', 'noopener');
        }
      });
    });
  }

  // ─── SIDEBAR INTERACTIONS ─────────────────────────────────────────────────

  function wireUpSidebarEvents() {
    // Venue header click: fly to venue
    document.querySelectorAll('.v2-venue-group-header').forEach(function (header) {
      header.addEventListener('click', function () {
        var lat = parseFloat(header.dataset.lat);
        var lng = parseFloat(header.dataset.lng);
        if (lat && lng) {
          document.dispatchEvent(new CustomEvent('v2:fly-to-venue', {
            detail: { lat: lat, lng: lng }
          }));
        }
      });
    });

    // Event card hover: highlight venue on map
    document.querySelectorAll('.v2-event-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        var venue = card.dataset.venue;
        if (venue) {
          document.dispatchEvent(new CustomEvent('v2:highlight-venue', {
            detail: { venueName: venue }
          }));
        }
      });

      card.addEventListener('mouseleave', function () {
        document.dispatchEvent(new CustomEvent('v2:unhighlight-venue'));
      });

      // Click: open event URL (but not if they clicked the share button)
      card.addEventListener('click', function (e) {
        if (e.target.closest('.v2-sidebar-share-btn')) return; // share button handles itself
        var url = card.dataset.url;
        if (url && url !== '#') {
          window.open(url, '_blank', 'noopener');
        }
      });
    });

    // Share buttons in sidebar
    document.querySelectorAll('.v2-sidebar-share-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var url = btn.dataset.url;
        var title = btn.dataset.title;
        if (navigator.share) {
          navigator.share({ title: title + ' — Nevada County', url: url });
        } else {
          navigator.clipboard.writeText(url).then(function () {
            var orig = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(function () { btn.textContent = orig; }, 2000);
          });
        }
      });
    });
  }

  // ─── FILTER PILL WIRING ───────────────────────────────────────────────────

  function initFilters() {
    var container = document.getElementById('time-filter-pills');
    if (!container) return;

    var pills = container.querySelectorAll('.category-pill');

    pills.forEach(function (pill) {
      pill.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        activeTimeFilter = pill.dataset.time;
        render();
      });
    });
  }

  // ─── AUTO-SELECT BEST DEFAULT ─────────────────────────────────────────────

  function autoSelectBestFilter() {
    var container = document.getElementById('time-filter-pills');
    if (!container) return;
    var pills = container.querySelectorAll('.category-pill');

    var tonightCount = filterByTime(allMatched, 'tonight').length;
    var weekendCount = filterByTime(allMatched, 'this-weekend').length;

    if (tonightCount >= 3) {
      activeTimeFilter = 'tonight';
    } else if (weekendCount >= 3) {
      activeTimeFilter = 'this-weekend';
    } else {
      activeTimeFilter = 'this-month';
    }

    // Update pill active state
    pills.forEach(function (p) {
      p.classList.toggle('active', p.dataset.time === activeTimeFilter);
    });
  }

  // ─── UTILITIES ────────────────────────────────────────────────────────────

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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

  var categoryGradients = {
    'Music': 'linear-gradient(135deg, #457B9D, #A8DADC)',
    'Art & Gallery': 'linear-gradient(135deg, #E63946, #FF6B6B)',
    'Theater': 'linear-gradient(135deg, #6A4C93, #B8A9C9)',
    'Film': 'linear-gradient(135deg, #1D3557, #457B9D)',
    'Community': 'linear-gradient(135deg, #2A9D8F, #76C893)',
    'Workshop': 'linear-gradient(135deg, #E9C46A, #F4A261)',
    'Food & Drink': 'linear-gradient(135deg, #2A9D8F, #264653)',
    'Historic': 'linear-gradient(135deg, #8B5E3C, #C49B2A)',
    'Outdoors': 'linear-gradient(135deg, #588157, #A3B18A)',
  };

  function getCategoryGradient(categories) {
    if (!categories || categories.length === 0) return 'linear-gradient(135deg, #3F3F3F, #6B6B6B)';
    for (var i = 0; i < categories.length; i++) {
      for (var key in categoryGradients) {
        if (categories[i].toLowerCase().indexOf(key.toLowerCase()) !== -1) {
          return categoryGradients[key];
        }
      }
    }
    return 'linear-gradient(135deg, #3F3F3F, #6B6B6B)';
  }

  // ─── DATA SANITIZATION & VENUE RESOLUTION ───────────────────────────────

  // Manual venue mapping for events the pipeline missed.
  // Key: substring to match in title OR description (case-insensitive).
  // Value: { asset_name, city, asset_lat, asset_lng }
  //
  // NOTE: A trimmed version of this table (no lat/lng) also exists in the
  // inline <script> block of events.html. If you update entries here, update
  // that copy too. The two files differ intentionally: this copy carries
  // lat/lng coordinates needed for map pins; events.html only needs city.
  var VENUE_FIXES = [
    { match: ['Ceramics', 'Pottery', 'Spoon', 'Welding', 'Mosaic', 'Needle Felting', 'Mingle & Make',
              'Woodshop', 'Glass Flameworking', 'Sewing Basics', 'CosPlay', 'Digital Arts Exploration',
              'Youth Maker XD', 'Polymer Clay', 'Custom Hat Making', 'Watercolor Exploration',
              'Make a Tiny Grief', 'Curious Forge'],
      venue: { asset_name: 'The Curious Forge', city: 'Nevada City', asset_lat: 39.254933782504, asset_lng: -121.134189389754 } },
    { match: ['Odd Fellows Open Mic'],
      venue: { asset_name: 'Nevada City Odd Fellows Lodge', city: 'Nevada City', asset_lat: 39.2618, asset_lng: -121.0178 } },
    { match: ['Church Street'],
      venue: { asset_name: 'Church Street Art Gallery', city: 'Grass Valley', asset_lat: 39.2200, asset_lng: -121.0621 } },
    { match: ['Empire Mine'],
      venue: { asset_name: 'Empire Mine', city: 'Grass Valley', asset_lat: 39.2071, asset_lng: -121.0468 } },
    { match: ['Spring Street Swing'],
      venue: { asset_name: 'Miners Foundry', city: 'Nevada City', asset_lat: 39.2626, asset_lng: -121.0177 } },
    { match: ['Decendants', 'Descendants', 'Astonishing Theater'],
      venue: { asset_name: 'Center for the Arts', city: 'Grass Valley', asset_lat: 39.2186, asset_lng: -121.0606 } },
    { match: ['Seasonal Invocations', 'St. Joseph'],
      venue: { asset_name: 'St. Joseph Cultural Center', city: 'Grass Valley', asset_lat: 39.2145, asset_lng: -121.0674 } },
    { match: ['STEAM Exploration', 'Kids Night Out'],
      venue: { asset_name: 'Truckee Community Arts Center', city: 'Truckee', asset_lat: 39.3279, asset_lng: -120.1852 } },
    { match: ['Cars and coffee'],
      venue: { asset_name: 'Downtown Grass Valley', city: 'Grass Valley', asset_lat: 39.2193, asset_lng: -121.0610 } },
    { match: ['Word Jam', 'Literary Crawl', '#socialsketch', 'First Fridays'],
      venue: { asset_name: 'Word After Word Books', city: 'Truckee', asset_lat: 39.3279, asset_lng: -120.1852 } },
    { match: ['Poetry in Parks'],
      venue: { asset_name: 'Empire Mine', city: 'Grass Valley', asset_lat: 39.2071, asset_lng: -121.0468 } },
    { match: ['Seniors Pancake'],
      venue: { asset_name: 'Truckee Donner Senior Apartments', city: 'Truckee', asset_lat: 39.3280, asset_lng: -120.1830 } },
    { match: ['Poetry Open Mic', 'Poetry Crawl', 'UNESCO World Poetry'],
      venue: { asset_name: 'Nevada County Poetry', city: 'Nevada City', asset_lat: 39.2618, asset_lng: -121.0178 } },
    { match: ['Good Morning Truckee'],
      venue: { asset_name: 'Truckee Chamber of Commerce', city: 'Truckee', asset_lat: 39.3279, asset_lng: -120.1852 } },
    { match: ['Dancing the Decades'],
      venue: { asset_name: 'Veterans Memorial Hall', city: 'Grass Valley', asset_lat: 39.2193, asset_lng: -121.0610 } },
    { match: ['Motion Theater'],
      venue: { asset_name: 'Miners Foundry', city: 'Nevada City', asset_lat: 39.2626, asset_lng: -121.0177 } },
    { match: ['Sound Blessings'],
      venue: { asset_name: 'The Healing Center', city: 'Nevada City', asset_lat: 39.2618, asset_lng: -121.0178 } },
    { match: ['Poetry Workshop', 'Imagination and Resistance'],
      venue: { asset_name: 'Word After Word Books', city: 'Truckee', asset_lat: 39.3279, asset_lng: -120.1852 } },
    { match: ['Spanish story time'],
      venue: { asset_name: 'Truckee Library', city: 'Truckee', asset_lat: 39.3279, asset_lng: -120.1852 } },
    { match: ['North Woods', 'On North Woods'],
      venue: { asset_name: 'Word After Word Books', city: 'Truckee', asset_lat: 39.3279, asset_lng: -120.1852 } },
    { match: ['Sounds from Darkness'],
      venue: { asset_name: 'Center for the Arts', city: 'Grass Valley', asset_lat: 39.2186, asset_lng: -121.0606 } },
    { match: ['Bear Yuba Land Trust'],
      venue: { asset_name: 'Bear Yuba Land Trust', city: 'Grass Valley', asset_lat: 39.2193, asset_lng: -121.0610 } },
    { match: ['Mythos of the Feminine'],
      venue: { asset_name: 'Private Gallery', city: 'Nevada City', asset_lat: 39.2618, asset_lng: -121.0178 } },
  ];

  function resolveVenue(ev) {
    if (ev.asset_name) return ev; // already matched
    var text = ((ev.title || '') + ' ' + (ev.description || '')).toLowerCase();
    for (var i = 0; i < VENUE_FIXES.length; i++) {
      var fix = VENUE_FIXES[i];
      for (var j = 0; j < fix.match.length; j++) {
        if (text.indexOf(fix.match[j].toLowerCase()) !== -1) {
          ev.asset_name = fix.venue.asset_name;
          ev.city = fix.venue.city;
          ev.asset_lat = fix.venue.asset_lat;
          ev.asset_lng = fix.venue.asset_lng;
          ev.community_event = false;
          return ev;
        }
      }
    }
    return ev;
  }

  function sanitizeEvents(events) {
    return events.map(function (ev) {
      // Fix dirty city fields: "Nevada City Price : $5..." → "Nevada City"
      if (ev.city) {
        var priceIdx = ev.city.indexOf(' Price : ');
        var detailIdx = ev.city.indexOf(' Event details : ');
        var cutIdx = -1;
        if (priceIdx !== -1) cutIdx = priceIdx;
        if (detailIdx !== -1 && (cutIdx === -1 || detailIdx < cutIdx)) cutIdx = detailIdx;
        if (cutIdx !== -1) {
          if (!ev.price) ev.price = ev.city.slice(cutIdx).replace(/^ *(Price|Event details) *: */, '');
          ev.city = ev.city.slice(0, cutIdx);
        }
      }
      // Resolve unmatched events to known venues
      resolveVenue(ev);
      return ev;
    });
  }

  // ─── LOAD DATA & BOOT ────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    initFilters();

    fetch('data/events-matched.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        allMatched = sanitizeEvents(data.matched || []);
        allUnmatched = sanitizeEvents(data.unmatched || []);
        autoSelectBestFilter();
        render();
      })
      .catch(function (err) {
        console.error('[event-sidebar.js] Failed to load events-matched.json:', err);
        var sidebar = document.getElementById('event-sidebar');
        if (sidebar) {
          sidebar.innerHTML =
            '<div class="v2-sidebar-heading">Events</div>' +
            '<div class="v2-sidebar-empty">' +
              '<span class="v2-sidebar-empty-icon">&#10022;</span>' +
              '<h3>Unable to load events</h3>' +
              '<p>Please try refreshing the page.</p>' +
            '</div>';
        }
      });
  });

})();
