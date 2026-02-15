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
    scopeLabel,
    eventsView,
    escapeHTML,
    formatEventDateRange,
    getEventDisplayDescription,
    getEventsCarouselVisibleSlots,
    updateEventsSpotlightPageLabel,
    startEventsRotation,
    stopEventsRotation,
    keepPosition = false,
    skipRotationRestart = false
  }) {
    if (!listEl || !allListEl || !countEl || !pageEl) return;
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
      return;
    }

    listEl.innerHTML = eventsView.getEventsCardsHTML({
      events: filtered,
      escapeHTML,
      formatEventDateRange,
      getEventDisplayDescription
    });

    if (!keepPosition) {
      listEl.scrollTo({ left: 0, behavior: 'auto' });
    }

    allListEl.innerHTML = eventsView.getEventsRowsHTML({
      events: filtered,
      escapeHTML,
      formatEventDateRange
    });

    const canStep = filtered.length > getEventsCarouselVisibleSlots();
    if (prevBtn) prevBtn.disabled = !canStep;
    if (nextBtn) nextBtn.disabled = !canStep;
    updateEventsSpotlightPageLabel(filtered.length);
    if (!skipRotationRestart) startEventsRotation(filtered.length);
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
      const link = typeof event.ticket_url === 'string' && event.ticket_url
        ? `<a class="detail-event-link" href="${escapeHTML(event.ticket_url)}" target="_blank" rel="noopener">Tickets / Details</a>`
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
