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
        if (catGrid) catGrid.style.display = 'none';
      } else if (ctx.getActiveCategoryCount() === 0) {
        wrapper.classList.remove('visible');
        if (catGrid) catGrid.style.display = '';
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
        var analytics = window.CulturalMapAnalytics;
        if (analytics) {
          analytics.track('events:date-filter', { filter: chip.dataset.eventFilter || '' });
        }
        ctx.setEventDateFilter(chip.dataset.eventFilter);
      });
    }

    const eventsAudienceToggle = document.getElementById('mapEventsAudienceToggle');
    if (eventsAudienceToggle) {
      eventsAudienceToggle.addEventListener('click', () => {
        const current = typeof ctx.getEventAudienceFilter === 'function'
          ? String(ctx.getEventAudienceFilter() || '')
          : 'exclude-kids-library';
        const next = current === 'all' ? 'exclude-kids-library' : 'all';
        var analytics = window.CulturalMapAnalytics;
        if (analytics) {
          analytics.track('events:audience-filter', { filter: next });
        }
        if (typeof ctx.setEventAudienceFilter === 'function') {
          ctx.setEventAudienceFilter(next);
        }
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
        ctx.stepFeaturedEvent(-1);
      });
    }

    const eventsNextBtn = document.getElementById('mapEventsNext');
    if (eventsNextBtn) {
      eventsNextBtn.addEventListener('click', () => {
        ctx.stepFeaturedEvent(1);
      });
    }

    const eventsList = document.getElementById('mapEventsList');
    if (eventsList) {
      eventsList.addEventListener('click', (event) => {
        var ticketLink = event.target.closest('[data-track-outbound="event-ticket"]');
        if (ticketLink) {
          var analytics = window.CulturalMapAnalytics;
          if (analytics) {
            analytics.track('outbound:event-ticket', {
              title: (ticketLink.getAttribute('data-track-title') || '').substring(0, 100),
              venue: (ticketLink.getAttribute('data-track-venue') || '').substring(0, 100),
              url: (ticketLink.href || '').substring(0, 200)
            });
          }
          return; // Let the link navigate naturally
        }
        const link = event.target.closest('.map-event-link');
        if (link) {
          event.stopPropagation();
          return;
        }
      });
    }

    const allEventsList = document.getElementById('mapEventsAllList');
    if (allEventsList) {
      allEventsList.addEventListener('click', (event) => {
        var ticketLink = event.target.closest('[data-track-outbound="event-ticket"]');
        if (ticketLink) {
          var analytics = window.CulturalMapAnalytics;
          if (analytics) {
            analytics.track('outbound:event-ticket', {
              title: (ticketLink.getAttribute('data-track-title') || '').substring(0, 100),
              venue: (ticketLink.getAttribute('data-track-venue') || '').substring(0, 100),
              url: (ticketLink.href || '').substring(0, 200)
            });
          }
          return;
        }
        const link = event.target.closest('.map-event-link');
        if (link) {
          event.stopPropagation();
          return;
        }
        const card = event.target.closest('.map-event-row');
        if (!card) return;
        const eventId = card.getAttribute('data-event-id');
        if (!eventId) return;
        ctx.setFeaturedEvent(eventId);
      });
    }

    const eventsDetails = document.getElementById('mapEventsDetails');
    if (eventsDetails) {
      eventsDetails.addEventListener('toggle', () => {
        var analytics = window.CulturalMapAnalytics;
        if (analytics) {
          analytics.track('events:toggle', { state: eventsDetails.open ? 'open' : 'closed' });
        }
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
        var ticketLink = event.target.closest('[data-track-outbound="event-ticket"]');
        if (ticketLink) {
          var analytics = window.CulturalMapAnalytics;
          if (analytics) {
            analytics.track('outbound:event-ticket', {
              title: (ticketLink.getAttribute('data-track-title') || '').substring(0, 100),
              venue: (ticketLink.getAttribute('data-track-venue') || '').substring(0, 100),
              url: (ticketLink.href || '').substring(0, 200)
            });
          }
          return;
        }
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

    // ---- Dream Board bookmark delegation ----
    var dbModel = window.CulturalMapDreamboardModel;
    var dbView = window.CulturalMapDreamboardView;
    if (dbModel && dbView) {
      dbView.injectCSS();

      // Place bookmark clicks (detail panel, directory cards, map tooltips)
      document.body.addEventListener('click', function(e) {
        var btn = e.target.closest('.bookmark-btn');
        if (!btn) return;
        e.stopPropagation();
        e.preventDefault();
        var assetName = btn.getAttribute('data-asset-name');
        if (!assetName) return;

        if (dbModel.hasPlace(assetName)) {
          // Remove
          dbModel.removePlace(assetName);
          dbView.updateButtonVisual(btn, false);
          dbView.showToast(assetName + ' removed from your trip', function() {
            // Undo: re-add
            var fakeAsset = { n: assetName, l: '', c: '' };
            dbModel.addPlace(fakeAsset);
            dbView.updateButtonVisual(btn, true);
            dbView.updateBadge();
            dbView.refreshAllBookmarkButtons();
          });
        } else {
          // Add
          var assetData = null;
          // Try to find full asset data for denormalization
          if (window.__culturalMapData) {
            for (var i = 0; i < window.__culturalMapData.length; i++) {
              if (window.__culturalMapData[i].n && window.__culturalMapData[i].n.toLowerCase() === assetName.toLowerCase()) {
                assetData = window.__culturalMapData[i];
                break;
              }
            }
          }
          if (!assetData) assetData = { n: assetName, l: '', c: '' };
          var added = dbModel.addPlace(assetData);
          if (added) {
            dbView.updateButtonVisual(btn, true);
            dbView.markFirstUseSeen();
            dbView.showToast(assetName + ' added to your trip', function() {
              // Undo: remove
              dbModel.removePlace(assetName);
              dbView.updateButtonVisual(btn, false);
              dbView.updateBadge();
              dbView.refreshAllBookmarkButtons();
            });
          } else {
            dbView.showToast('Trip is full (30 items max). Remove something first.');
          }
        }
        dbView.updateBadge();
        dbView.refreshAllBookmarkButtons();
      });

      // Event bookmark clicks
      document.body.addEventListener('click', function(e) {
        var btn = e.target.closest('.event-bookmark-btn');
        if (!btn) return;
        e.stopPropagation();
        e.preventDefault();
        var title = btn.getAttribute('data-event-title');
        var date = btn.getAttribute('data-event-date');
        if (!title) return;

        if (dbModel.hasEvent(title, date)) {
          dbModel.removeEvent(title, date);
          dbView.updateButtonVisual(btn, false);
          dbView.showToast('Event removed from your trip', function() {
            dbModel.addEvent({ title: title, date: date, venue: '', layer: '' });
            dbView.updateButtonVisual(btn, true);
            dbView.updateBadge();
          });
        } else {
          var added = dbModel.addEvent({ title: title, date: date, venue: '', layer: '' });
          if (added) {
            dbView.updateButtonVisual(btn, true);
            dbView.markFirstUseSeen();
            dbView.showToast('Event added to your trip', function() {
              dbModel.removeEvent(title, date);
              dbView.updateButtonVisual(btn, false);
              dbView.updateBadge();
            });
          } else {
            dbView.showToast('Trip is full (30 items max). Remove something first.');
          }
        }
        dbView.updateBadge();
      });

      // Page-load badge init
      dbView.updateBadge();

      // Cross-tab sync via storage event
      window.addEventListener('storage', function(e) {
        if (e.key === 'ncac-dreamboard') {
          dbView.updateBadge();
          dbView.refreshAllBookmarkButtons();
        }
      });
    }
  }

  function initScrollObserver() {
    if (window.CulturalMapScrollObserver) {
      window.CulturalMapScrollObserver.init();
    }
  }

  window.CulturalMapBindings = {
    bindEvents: function(ctx) {
      bindEvents(ctx);
      initScrollObserver();
    }
  };
})();
