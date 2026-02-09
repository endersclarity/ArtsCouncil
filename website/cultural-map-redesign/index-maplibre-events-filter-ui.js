(function() {
  'use strict';

  function updateMapEventsFilterUI({ eventDateFilter }) {
    const chips = document.querySelectorAll('[data-event-filter]');
    chips.forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.eventFilter === eventDateFilter);
    });
  }

  function buildMapEventsCategorySelect({
    selectEl,
    data,
    cats,
    escapeHTML,
    eventCategoryFilter,
    getOptionsHTML
  }) {
    if (!selectEl) return;
    selectEl.innerHTML = getOptionsHTML({
      data,
      cats,
      escapeHTML
    });
    selectEl.value = eventCategoryFilter;
  }

  function updateMapEventsCategoryUI({ selectEl, eventCategoryFilter }) {
    if (selectEl && selectEl.value !== eventCategoryFilter) {
      selectEl.value = eventCategoryFilter;
    }
  }

  function normalizeEventCategoryFilter(categoryValue) {
    return categoryValue && categoryValue !== 'all' ? categoryValue : 'all';
  }

  window.CulturalMapEventsFilterUI = {
    updateMapEventsFilterUI,
    buildMapEventsCategorySelect,
    updateMapEventsCategoryUI,
    normalizeEventCategoryFilter
  };
})();
