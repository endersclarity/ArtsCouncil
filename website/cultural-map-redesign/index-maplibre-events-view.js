(function() {
  'use strict';

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
    return `Category: ${eventCategoryFilter}`;
  }

  function getEventsCardsHTML({ events, escapeHTML, formatEventDateRange, getEventDisplayDescription }) {
    return events.map((event) => {
      const mapped = Number.isInteger(event.matched_asset_idx);
      const title = escapeHTML(event.title || 'Untitled event');
      const venueName = escapeHTML(event.venue_name || 'Venue TBD');
      const eventTime = escapeHTML(formatEventDateRange(event));
      const rawDesc = getEventDisplayDescription(event);
      const shortDesc = escapeHTML(rawDesc.length > 180 ? `${rawDesc.slice(0, 177)}...` : rawDesc);
      const imageURL = typeof event.image_url === 'string' ? event.image_url.trim() : '';
      const imageHTML = imageURL
        ? `<img class="map-event-image" src="${escapeHTML(imageURL)}" alt="${title}" width="320" height="104" loading="lazy" decoding="async" onerror="this.outerHTML='<div class=&quot;map-event-image placeholder&quot;>No image</div>'">`
        : '<div class="map-event-image placeholder">No image</div>';
      const ticket = typeof event.ticket_url === 'string' && event.ticket_url
        ? `<a class="map-event-link" href="${escapeHTML(event.ticket_url)}" target="_blank" rel="noopener">Tickets / Details</a>`
        : '';
      const badge = mapped ? '' : '<span class="map-event-badge">Unmapped</span>';
      const seriesCount = Number.isInteger(event.series_count) ? event.series_count : 1;
      const seriesBadge = seriesCount > 1
        ? `<span class="map-event-badge series">${seriesCount} dates</span>`
        : '';
      return `
        <div class="map-event-item ${mapped ? 'mapped' : 'unmapped'}" data-event-id="${escapeHTML(event.event_id || '')}">
          ${imageHTML}
          <div class="map-event-title">${title}</div>
          <div class="map-event-desc">${shortDesc}</div>
          <div class="map-event-meta">
            <span>${eventTime}</span>
            <span class="map-event-venue">${venueName}</span>
            ${seriesBadge}
            ${badge}
          </div>
          ${ticket}
        </div>
      `;
    }).join('');
  }

  function getEventsRowsHTML({ events, escapeHTML, formatEventDateRange }) {
    return events.map((event) => {
      const mapped = Number.isInteger(event.matched_asset_idx);
      const title = escapeHTML(event.title || 'Untitled event');
      const venueName = escapeHTML(event.venue_name || 'Venue TBD');
      const eventTime = escapeHTML(formatEventDateRange(event));
      const ticket = typeof event.ticket_url === 'string' && event.ticket_url
        ? `<a class="map-event-link" href="${escapeHTML(event.ticket_url)}" target="_blank" rel="noopener">Tickets / Details</a>`
        : '';
      const badge = mapped ? '' : '<span class="map-event-badge">Unmapped</span>';
      const seriesCount = Number.isInteger(event.series_count) ? event.series_count : 1;
      const seriesBadge = seriesCount > 1
        ? `<span class="map-event-badge series">${seriesCount} dates</span>`
        : '';
      return `
        <div class="map-event-row ${mapped ? 'mapped' : 'unmapped'}" data-event-id="${escapeHTML(event.event_id || '')}">
          <div class="map-event-row-title">${title}</div>
          <div class="map-event-row-meta">
            <span>${eventTime}</span>
            <span class="map-event-venue">${venueName}</span>
            ${seriesBadge}
            ${badge}
          </div>
          ${ticket}
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
