(function() {
  'use strict';

  function updateMapEventsFilterUI({ eventDateFilter }) {
    const chips = document.querySelectorAll('[data-event-filter]');
    chips.forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.eventFilter === eventDateFilter);
    });
  }

  function updateMapEventsAudienceUI({ toggleEl, eventAudienceFilter }) {
    if (!toggleEl) return;
    const includeKidsLibrary = eventAudienceFilter === 'all';
    toggleEl.classList.toggle('active', includeKidsLibrary);
    toggleEl.setAttribute('aria-pressed', includeKidsLibrary ? 'true' : 'false');
    toggleEl.textContent = includeKidsLibrary ? 'Hide Kids/Library' : 'Show Kids/Library';
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
    var baseHTML = getOptionsHTML({
      data,
      cats,
      escapeHTML
    });
    selectEl.innerHTML = baseHTML + '\n' + getTagAndSourceOptionsHTML();
    selectEl.value = eventCategoryFilter;
  }

  function updateMapEventsCategoryUI({ selectEl, eventCategoryFilter }) {
    if (selectEl && selectEl.value !== eventCategoryFilter) {
      selectEl.value = eventCategoryFilter;
    }
  }

  function getTagAndSourceOptionsHTML() {
    return [
      '<optgroup label="By Type">',
      '  <option value="tag:live-music">Live Music</option>',
      '  <option value="tag:arts-gallery">Arts &amp; Gallery</option>',
      '  <option value="tag:community">Community</option>',
      '</optgroup>',
      '<optgroup label="By Source">',
      '  <option value="source:trumba">Arts Council</option>',
      '  <option value="source:kvmr">KVMR</option>',
      '  <option value="source:gvda">GVDA</option>',
      '  <option value="source:crazyhorse">Crazy Horse</option>',
      '  <option value="source:goldenera">Golden Era</option>',
      '  <option value="source:bodhihive">Bodhi Hive</option>',
      '  <option value="source:community">Community</option>',
      '</optgroup>'
    ].join('\n');
  }

  function normalizeEventCategoryFilter(categoryValue) {
    if (!categoryValue || categoryValue === 'all') return 'all';
    // Pass through tag: and source: prefixed values without normalization
    var strValue = String(categoryValue).trim();
    if (strValue.indexOf('tag:') === 0 || strValue.indexOf('source:') === 0) return strValue;
    var alias = strValue.toLowerCase();
    if (alias === 'festivals' || alias === 'fairs and festivals') return 'Fairs & Festivals';
    return categoryValue;
  }

  window.CulturalMapEventsFilterUI = {
    updateMapEventsFilterUI,
    updateMapEventsAudienceUI,
    buildMapEventsCategorySelect,
    updateMapEventsCategoryUI,
    normalizeEventCategoryFilter,
    getTagAndSourceOptionsHTML
  };
})();
