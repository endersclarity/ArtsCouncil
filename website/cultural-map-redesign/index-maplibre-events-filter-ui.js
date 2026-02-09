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
    if (!categoryValue || categoryValue === 'all') return 'all';
    const alias = String(categoryValue).trim().toLowerCase();
    if (alias === 'festivals' || alias === 'fairs and festivals') return 'Fairs & Festivals';
    return categoryValue;
  }

  window.CulturalMapEventsFilterUI = {
    updateMapEventsFilterUI,
    buildMapEventsCategorySelect,
    updateMapEventsCategoryUI,
    normalizeEventCategoryFilter
  };
})();
