(function() {
  'use strict';

  // Tag-based fallback images (watercolor assets from Arts Council 2019 deck)
  var TAG_FALLBACK_IMAGES = {
    'live-music': 'img/watercolor/performance.png',
    'arts-gallery': 'img/watercolor/galleries.png',
    'community': 'img/watercolor/cultural.png',
    'family-kids': 'img/watercolor/fairs.png'
  };
  var DEFAULT_FALLBACK_IMAGE = 'img/watercolor/arts.png';

  /**
   * Resolve the best available image for an event using layered fallback:
   * 1. event.image_url (from scraper/feed)
   * 2. Matched venue hero image (from image_data.json)
   * 3. Tag-based placeholder (watercolor asset)
   */
  function resolveEventImage(event, data, imageData) {
    // Layer 1: event's own image
    var url = typeof event.image_url === 'string' ? event.image_url.trim() : '';
    if (url) return { src: url, isPlaceholder: false };

    // Layer 2: matched venue image
    if (Number.isInteger(event.matched_asset_idx) && data && imageData) {
      var asset = data[event.matched_asset_idx];
      if (asset && asset.n && imageData[asset.n]) {
        var venueImg = imageData[asset.n].img;
        if (venueImg) return { src: venueImg, isPlaceholder: false };
      }
    }

    // Layer 3: tag-based fallback
    var tags = event.event_tags;
    if (Array.isArray(tags)) {
      for (var i = 0; i < tags.length; i++) {
        if (TAG_FALLBACK_IMAGES[tags[i]]) {
          return { src: TAG_FALLBACK_IMAGES[tags[i]], isPlaceholder: true };
        }
      }
    }

    // Layer 4: generic fallback
    return { src: DEFAULT_FALLBACK_IMAGE, isPlaceholder: true };
  }

  function getEventsCategoryOptionsHTML({ data, cats, escapeHTML }) {
    const seen = new Set();
    const categories = data
      .map((d) => d && d.l)
      .filter((name) => typeof name === 'string' && name && !seen.has(name) && seen.add(name));

    return '<option value="all">All categories</option>' +
      categories.map((name) => {
        // Use canonical names in Events UI to avoid ambiguity (e.g. "Festivals" vs "Fairs & Festivals").
        return `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`;
      }).join('');
  }

  function getEventsScopeLabel({ eventCategoryFilter, cats }) {
    if (eventCategoryFilter === 'all') return 'All categories';
    if (eventCategoryFilter.indexOf('tag:') === 0) {
      var tagLabels = { 'live-music': 'Live Music', 'arts-gallery': 'Arts & Gallery', 'community': 'Community' };
      var slug = eventCategoryFilter.replace('tag:', '');
      return 'Type: ' + (tagLabels[slug] || slug);
    }
    if (eventCategoryFilter.indexOf('source:') === 0) {
      var sourceLabels = { trumba: 'Arts Council', kvmr: 'KVMR', gvda: 'GVDA', crazyhorse: 'Crazy Horse', goldenera: 'Golden Era', bodhihive: 'Bodhi Hive', community: 'Community' };
      var src = eventCategoryFilter.replace('source:', '');
      return 'Source: ' + (sourceLabels[src] || src);
    }
    return `Category: ${eventCategoryFilter}`;
  }

  function getEventsCardsHTML({ events, escapeHTML, formatEventDateRange, getEventDisplayDescription, getDistanceLabelForEvent }) {
    const event = Array.isArray(events) && events.length ? events[0] : null;
    if (!event) return '';

    const mapped = Number.isInteger(event.matched_asset_idx);
    const title = escapeHTML(event.title || 'Untitled event');
    const venueName = escapeHTML(event.venue_name || 'Venue TBD');
    const eventTime = escapeHTML(formatEventDateRange(event));
    const rawDesc = getEventDisplayDescription(event);
    const shortDesc = escapeHTML(rawDesc.length > 260 ? `${rawDesc.slice(0, 257)}...` : rawDesc);
    var imgResolved = resolveEventImage(event, window.__culturalMapData, window.__culturalMapImageData);
    const imageHTML = imgResolved.src
      ? `<img class="map-event-image map-event-feature-media${imgResolved.isPlaceholder ? ' fallback' : ''}" src="${escapeHTML(imgResolved.src)}" alt="${title}" loading="lazy" onerror="this.outerHTML='<div class=&quot;map-event-image map-event-feature-media placeholder&quot;>No image</div>'">`
      : '<div class="map-event-image map-event-feature-media placeholder">No image</div>';
    var cardTicketUrl = typeof event.ticket_url === 'string' && event.ticket_url ? event.ticket_url : '';
    if (cardTicketUrl && cardTicketUrl.indexOf('http') === 0) {
      var analyticsRef = window.CulturalMapAnalytics;
      if (analyticsRef) { cardTicketUrl = analyticsRef.tagOutboundUrl(cardTicketUrl, 'event-ticket'); }
    }
    const ticket = cardTicketUrl
      ? `<a class="map-event-link map-event-feature-link" href="${escapeHTML(cardTicketUrl)}" target="_blank" rel="noopener" data-track-outbound="event-ticket" data-track-title="${title}" data-track-venue="${venueName}">See Details</a>`
      : '';
    const badge = mapped ? '' : '<span class="map-event-badge">Unmapped</span>';
    const seriesCount = Number.isInteger(event.series_count) ? event.series_count : 1;
    const seriesBadge = seriesCount > 1
      ? `<span class="map-event-badge series">${seriesCount} dates</span>`
      : '';
    const distanceLabel = typeof getDistanceLabelForEvent === 'function'
      ? getDistanceLabelForEvent(event)
      : '';
    const distanceBadge = distanceLabel
      ? `<span class="map-event-badge distance">${escapeHTML(distanceLabel)}</span>`
      : '';
    const sourceLabel = event.source_label || '';
    const sourceBadge = sourceLabel && sourceLabel !== 'Nevada County Arts Council'
      ? `<span class="map-event-badge source">${escapeHTML(sourceLabel)}</span>`
      : '';

    return `
      <div class="map-event-item map-event-feature ${mapped ? 'mapped' : 'unmapped'}" data-event-id="${escapeHTML(event.event_id || '')}">
        ${imageHTML}
        <div class="map-event-feature-date">${eventTime}</div>
        <h4 class="map-event-title map-event-feature-title">${title}</h4>
        <p class="map-event-desc map-event-feature-desc">${shortDesc}</p>
        <div class="map-event-meta map-event-feature-meta">
          <span class="map-event-venue">${venueName}</span>
          ${seriesBadge}
          ${distanceBadge}
          ${sourceBadge}
          ${badge}
        </div>
        ${ticket}
      </div>
    `;
  }

  function getEventsRowsHTML({ events, featuredEventId, escapeHTML, formatEventDateRange, getDistanceLabelForEvent }) {
    return events.map((event) => {
      const mapped = Number.isInteger(event.matched_asset_idx);
      const eventId = String(event.event_id || '');
      const isActive = featuredEventId && eventId === String(featuredEventId);
      const title = escapeHTML(event.title || 'Untitled event');
      const venueName = escapeHTML(event.venue_name || 'Venue TBD');
      const eventTime = escapeHTML(formatEventDateRange(event));
      var rowTicketUrl = typeof event.ticket_url === 'string' && event.ticket_url ? event.ticket_url : '';
      if (rowTicketUrl && rowTicketUrl.indexOf('http') === 0) {
        var analyticsRef2 = window.CulturalMapAnalytics;
        if (analyticsRef2) { rowTicketUrl = analyticsRef2.tagOutboundUrl(rowTicketUrl, 'event-ticket'); }
      }
      var thumbResolved = resolveEventImage(event, window.__culturalMapData, window.__culturalMapImageData);
      const thumbHTML = thumbResolved.src
        ? `<img class="map-event-row-thumb${thumbResolved.isPlaceholder ? ' fallback' : ''}" src="${escapeHTML(thumbResolved.src)}" alt="${title}" loading="lazy" onerror="this.outerHTML='<div class=&quot;map-event-row-thumb placeholder&quot;></div>'">`
        : '<div class="map-event-row-thumb placeholder"></div>';
      const ticket = rowTicketUrl
        ? `<a class="map-event-link map-event-row-link" href="${escapeHTML(rowTicketUrl)}" target="_blank" rel="noopener" data-track-outbound="event-ticket" data-track-title="${title}" data-track-venue="${venueName}">Details</a>`
        : '';
      const badge = mapped ? '' : '<span class="map-event-badge">Unmapped</span>';
      const seriesCount = Number.isInteger(event.series_count) ? event.series_count : 1;
      const seriesBadge = seriesCount > 1
        ? `<span class="map-event-badge series">${seriesCount} dates</span>`
        : '';
      const distanceLabel = typeof getDistanceLabelForEvent === 'function'
        ? getDistanceLabelForEvent(event)
        : '';
      const distanceBadge = distanceLabel
        ? `<span class="map-event-badge distance">${escapeHTML(distanceLabel)}</span>`
        : '';
      const sourceLabel = event.source_label || '';
      const sourceBadge = sourceLabel && sourceLabel !== 'Nevada County Arts Council'
        ? `<span class="map-event-badge source">${escapeHTML(sourceLabel)}</span>`
        : '';
      return `
        <div class="map-event-row ${mapped ? 'mapped' : 'unmapped'} ${isActive ? 'is-active' : ''}" data-event-id="${escapeHTML(eventId)}">
          ${thumbHTML}
          <div class="map-event-row-copy">
            <div class="map-event-row-date">${eventTime}</div>
            <div class="map-event-row-title">${title}</div>
            <div class="map-event-row-meta">
              <span class="map-event-venue">${venueName}</span>
              ${seriesBadge}
              ${distanceBadge}
              ${sourceBadge}
              ${badge}
            </div>
            ${ticket}
          </div>
        </div>
      `;
    }).join('');
  }

  window.CulturalMapEventsView = {
    getEventsCategoryOptionsHTML,
    getEventsScopeLabel,
    getEventsCardsHTML,
    getEventsRowsHTML
  };
})();
