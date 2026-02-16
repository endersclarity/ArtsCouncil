(function() {
  'use strict';

  function bindEvents(ctx) {
    document.getElementById('detailClose').addEventListener('click', ctx.closeDetail);
    document.getElementById('panelOverlay').addEventListener('click', ctx.closeDetail);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        ctx.closeDetail();
        ctx.collapseMapOverlays();
      }
    });

    const overlayControls = document.querySelector('.map-overlay-controls');
    const filterToggle = document.getElementById('mapFilterToggle');
    const legendToggle = document.getElementById('mapLegendToggle');
    if (overlayControls) {
      overlayControls.addEventListener('click', (event) => event.stopPropagation());
    }
    if (filterToggle) {
      filterToggle.addEventListener('click', () => {
        ctx.markMapInteracted();
        ctx.toggleMapFiltersExpanded();
      });
    }
    if (legendToggle) {
      legendToggle.addEventListener('click', () => {
        ctx.markMapInteracted();
        ctx.toggleMapLegendExpanded();
      });
    }
    document.addEventListener('click', () => {
      if (ctx.getMapFiltersExpanded()) ctx.setMapFiltersExpanded(false);
      if (ctx.getMapLegendExpanded()) ctx.setMapLegendExpanded(false);
    });

    // Track MUSE editorial card expand/collapse
    document.querySelectorAll('details.muse-card').forEach(function(details) {
      details.addEventListener('toggle', function() {
        if (details.open) {
          var analytics = window.CulturalMapAnalytics;
          if (analytics) {
            var summary = details.querySelector('summary');
            var titleEl = summary ? summary.querySelector('.muse-card-title') : null;
            var title = titleEl ? titleEl.textContent.substring(0, 100) : 'unknown';
            analytics.track('editorial:expand', { title: title });
          }
        }
      });
    });

    document.getElementById('searchInput').addEventListener('input', () => {
      const val = document.getElementById('searchInput').value.trim();
      const wrapper = document.getElementById('exploreListWrapper');
      const catGrid = document.getElementById('exploreCats');
      if (val) {
        wrapper.classList.add('visible');
        catGrid.style.display = 'none';
      } else if (ctx.getActiveCategoryCount() === 0) {
        wrapper.classList.remove('visible');
        catGrid.style.display = '';
      }
      ctx.resetListPage();
      ctx.buildList();
    });

    document.getElementById('loadMoreBtn').addEventListener('click', () => {
      ctx.incrementListPage();
      ctx.buildList();
    });

    document.getElementById('exploreListBack').addEventListener('click', () => {
      ctx.exploreSetCategory(null);
    });

    const eventsFilters = document.getElementById('mapEventsFilters');
    if (eventsFilters) {
      eventsFilters.addEventListener('click', (event) => {
        const chip = event.target.closest('[data-event-filter]');
        if (!chip) return;
        ctx.setEventDateFilter(chip.dataset.eventFilter);
      });
    }

    const eventsCategorySelect = document.getElementById('mapEventsCategory');
    if (eventsCategorySelect) {
      eventsCategorySelect.addEventListener('change', () => {
        ctx.setEventCategoryFilter(eventsCategorySelect.value);
      });
    }

    const eventsPrevBtn = document.getElementById('mapEventsPrev');
    if (eventsPrevBtn) {
      eventsPrevBtn.addEventListener('click', () => {
        ctx.stopEventsRotation();
        const filtered = ctx.getFilteredMapEvents();
        if (ctx.stepEventsSpotlight(-1, true)) {
          ctx.queueEventsRotationResume(filtered.length);
        }
      });
    }

    const eventsNextBtn = document.getElementById('mapEventsNext');
    if (eventsNextBtn) {
      eventsNextBtn.addEventListener('click', () => {
        ctx.stopEventsRotation();
        const filtered = ctx.getFilteredMapEvents();
        if (ctx.stepEventsSpotlight(1, true)) {
          ctx.queueEventsRotationResume(filtered.length);
        }
      });
    }

    const eventsList = document.getElementById('mapEventsList');
    if (eventsList) {
      let eventsScrollLabelFrame = null;
      eventsList.addEventListener('mouseenter', ctx.stopEventsRotation);
      eventsList.addEventListener('mouseleave', () => {
        const filtered = ctx.getFilteredMapEvents();
        ctx.startEventsRotation(filtered.length);
      });
      eventsList.addEventListener('scroll', () => {
        if (eventsScrollLabelFrame !== null) return;
        eventsScrollLabelFrame = requestAnimationFrame(() => {
          eventsScrollLabelFrame = null;
          ctx.updateEventsSpotlightPageLabel(ctx.getFilteredMapEvents().length);
        });
      }, { passive: true });
      eventsList.addEventListener('click', (event) => {
        const link = event.target.closest('.map-event-link');
        if (link) {
          event.stopPropagation();
          return;
        }
        const card = event.target.closest('.map-event-item.mapped');
        if (!card) return;
        const eventId = card.getAttribute('data-event-id');
        if (!eventId) return;
        // Track event card click
        var analytics = window.CulturalMapAnalytics;
        if (analytics) {
          var titleEl = card.querySelector('.map-event-title, .map-event-name');
          var venueEl = card.querySelector('.map-event-venue, .map-event-location');
          analytics.track('event:click', {
            title: (titleEl ? titleEl.textContent : '').substring(0, 100),
            venue: (venueEl ? venueEl.textContent : '').substring(0, 100)
          });
        }
        ctx.focusEvent(eventId);
      });
    }

    const allEventsList = document.getElementById('mapEventsAllList');
    if (allEventsList) {
      allEventsList.addEventListener('click', (event) => {
        const link = event.target.closest('.map-event-link');
        if (link) {
          event.stopPropagation();
          return;
        }
        const card = event.target.closest('.map-event-row.mapped');
        if (!card) return;
        const eventId = card.getAttribute('data-event-id');
        if (!eventId) return;
        ctx.focusEvent(eventId);
      });
    }

    const eventsDetails = document.getElementById('mapEventsDetails');
    if (eventsDetails) {
      eventsDetails.addEventListener('toggle', () => {
        if (eventsDetails.open) {
          ctx.buildMapEventsList({ keepPosition: true });
        } else {
          ctx.stopEventsRotation();
        }
      });
    }

    const searchEventsList = document.getElementById('exploreEventResults');
    if (searchEventsList) {
      searchEventsList.addEventListener('click', (event) => {
        const link = event.target.closest('.explore-search-event-link');
        if (link) {
          event.stopPropagation();
          return;
        }
        const card = event.target.closest('.explore-search-event.mapped');
        if (!card) return;
        const eventId = card.getAttribute('data-event-id');
        if (!eventId) return;
        ctx.focusEvent(eventId);
      });
    }

    var clearBtn = document.getElementById('mapActiveClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        var analytics = window.CulturalMapAnalytics;
        if (analytics) analytics.track('category:clear', {});
        ctx.clearAllMapFilters();
      });
    }
  }

  window.CulturalMapBindings = {
    bindEvents
  };
})();
