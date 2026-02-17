(function() {
  'use strict';

  function buildMapEventsList({
    listEl,
    allListEl,
    countEl,
    scopeEl,
    prevBtn,
    nextBtn,
    pageEl,
    filtered,
    featuredEventId = null,
    scopeLabel,
    eventsView,
    escapeHTML,
    formatEventDateRange,
    getEventDisplayDescription,
    stopEventsRotation,
    keepPosition = false
  }) {
    if (!listEl || !allListEl || !countEl || !pageEl) return {
      featuredEventId: null,
      total: 0
    };
    countEl.textContent = `${filtered.length} event${filtered.length === 1 ? '' : 's'}`;
    if (scopeEl) scopeEl.textContent = scopeLabel;

    if (!filtered.length) {
      const msg = 'No upcoming events for this filter.';
      listEl.innerHTML = `<div class="map-events-empty">${msg}</div>`;
      allListEl.innerHTML = `<div class="map-events-empty">${msg}</div>`;
      pageEl.textContent = 'Spotlight 0 / 0';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      stopEventsRotation();
      return {
        featuredEventId: null,
        total: 0
      };
    }

    // Broadsheet layout is date-chronological and editorial-led.
    const byDate = filtered.slice().sort((a, b) => {
      if (a._start_ts !== b._start_ts) return a._start_ts - b._start_ts;
      return String(a.event_id || '').localeCompare(String(b.event_id || ''));
    });
    const hasEventImage = (event) => typeof (event && event.image_url) === 'string' && event.image_url.trim().length > 0;
    const preferredId = String(featuredEventId || '');
    let featuredEvent = byDate.find((event) => hasEventImage(event)) || byDate[0];
    if (preferredId) {
      const matched = byDate.find((event) => String(event.event_id || '') === preferredId);
      if (matched) featuredEvent = matched;
    }
    const resolvedFeaturedId = String(featuredEvent.event_id || '');
    const featured = [featuredEvent];
    const schedule = byDate;

    listEl.innerHTML = eventsView.getEventsCardsHTML({
      events: featured,
      escapeHTML,
      formatEventDateRange,
      getEventDisplayDescription
    });

    if (!keepPosition) {
      listEl.scrollTo({ left: 0, behavior: 'auto' });
    }

    allListEl.innerHTML = eventsView.getEventsRowsHTML({
      events: schedule,
      featuredEventId: resolvedFeaturedId,
      escapeHTML,
      formatEventDateRange
    });

    if (!schedule.length) {
      allListEl.innerHTML = '<div class="map-events-empty">No additional upcoming events for this filter.</div>';
    }

    const featuredIndex = byDate.findIndex((event) => String(event.event_id || '') === resolvedFeaturedId);
    const canStep = byDate.length > 1;
    if (prevBtn) prevBtn.disabled = !canStep;
    if (nextBtn) nextBtn.disabled = !canStep;
    pageEl.textContent = `Event ${Math.max(0, featuredIndex) + 1} of ${byDate.length}`;
    stopEventsRotation();
    return {
      featuredEventId: resolvedFeaturedId,
      total: byDate.length
    };
  }

  function getDetailEventsHTML({
    upcoming,
    eventWindowDays,
    escapeHTML,
    formatEventDateRange
  }) {
    if (!upcoming.length) {
      return `<div class="detail-events-title">Upcoming Events</div><div class="detail-events-empty">No curated events in the next ${eventWindowDays} days.</div>`;
    }
    const cards = upcoming.slice(0, 5).map((event) => {
      const title = escapeHTML(event.title || 'Untitled event');
      const time = escapeHTML(formatEventDateRange(event));
      var detailTicketUrl = typeof event.ticket_url === 'string' && event.ticket_url ? event.ticket_url : '';
      if (detailTicketUrl && detailTicketUrl.indexOf('http') === 0) {
        var analyticsRef = window.CulturalMapAnalytics;
        if (analyticsRef) { detailTicketUrl = analyticsRef.tagOutboundUrl(detailTicketUrl, 'event-ticket'); }
      }
      const link = detailTicketUrl
        ? `<a class="detail-event-link" href="${escapeHTML(detailTicketUrl)}" target="_blank" rel="noopener" data-track-outbound="event-ticket" data-track-title="${title}" data-track-venue="">${'Tickets / Details'}</a>`
        : '';
      return `<div class="detail-event-card"><div class="detail-event-title">${title}</div><div class="detail-event-time">${time}</div>${link}</div>`;
    }).join('');
    return `<div class="detail-events-title">Upcoming Events</div>${cards}`;
  }

  window.CulturalMapEventsController = {
    buildMapEventsList,
    getDetailEventsHTML
  };
})();
