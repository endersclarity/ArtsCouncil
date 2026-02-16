(function() {
  'use strict';

  function getSearchMatchedEvents({ query, events }) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];
    return events.filter((event) => {
      const tags = Array.isArray(event.tags) ? event.tags.join(' ') : '';
      return (
        String(event.title || '').toLowerCase().includes(q) ||
        String(event.venue_name || '').toLowerCase().includes(q) ||
        String(event.venue_city || '').toLowerCase().includes(q) ||
        String(event.description || '').toLowerCase().includes(q) ||
        tags.toLowerCase().includes(q)
      );
    });
  }

  function getSearchEventMatchesHTML({ matches, escapeHTML, formatEventDateRange }) {
    const items = matches.map((event) => {
      const mapped = Number.isInteger(event.matched_asset_idx);
      const title = escapeHTML(event.title || 'Untitled event');
      const when = escapeHTML(formatEventDateRange(event));
      const venue = escapeHTML(event.venue_name || 'Venue TBD');
      const badge = mapped ? '' : '<span class="map-event-badge">Unmapped</span>';
      var searchTicketUrl = typeof event.ticket_url === 'string' && event.ticket_url ? event.ticket_url : '';
      if (searchTicketUrl && searchTicketUrl.indexOf('http') === 0) {
        var analyticsRef = window.CulturalMapAnalytics;
        if (analyticsRef) { searchTicketUrl = analyticsRef.tagOutboundUrl(searchTicketUrl, 'event-ticket'); }
      }
      const link = searchTicketUrl
        ? `<a class="explore-search-event-link" href="${escapeHTML(searchTicketUrl)}" target="_blank" rel="noopener" data-track-outbound="event-ticket" data-track-title="${title}" data-track-venue="${venue}">Event link</a>`
        : '';
      return `
        <div class="explore-search-event ${mapped ? 'mapped' : ''}" data-event-id="${escapeHTML(event.event_id || '')}">
          <div class="explore-search-event-title">${title}</div>
          <div class="explore-search-event-meta">
            <span>${when}</span>
            <span>${venue}</span>
            ${badge}
          </div>
          ${link}
        </div>
      `;
    }).join('');

    return `
      <div class="explore-search-events-header">
        <div class="explore-search-events-title">Matching Events</div>
        <div class="explore-search-events-count">${matches.length} shown</div>
      </div>
      <div class="explore-search-events-list">${items}</div>
    `;
  }

  window.CulturalMapEventsSearch = {
    getSearchMatchedEvents,
    getSearchEventMatchesHTML
  };
})();
