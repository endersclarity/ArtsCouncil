(function() {
  'use strict';

  function computeNextCategories({ activeCategories, cat, exclusive = false }) {
    const next = new Set(activeCategories || []);
    if (cat === null) {
      next.clear();
      return next;
    }
    if (exclusive) {
      return new Set([cat]);
    }
    if (next.has(cat)) {
      next.delete(cat);
    } else {
      next.add(cat);
    }
    return next;
  }

  function getActiveBannerState({
    data,
    activeCategories,
    openNowMode,
    events14dMode,
    getHoursState,
    getEventCountForAsset14d,
    cats
  }) {
    const selected = Array.from(activeCategories || []);
    const hasActive = selected.length > 0 || openNowMode || events14dMode;
    if (!hasActive) return null;

    const count = (data || []).filter((venue, idx) => {
      const categoryOk = selected.length === 0 || activeCategories.has(venue.l);
      const openOk = !openNowMode || getHoursState(venue) !== 'closed';
      const eventsOk = !events14dMode || getEventCountForAsset14d(idx) > 0;
      return categoryOk && openOk && eventsOk;
    }).length;

    const oneCategory = selected.length === 1 ? selected[0] : null;
    const cfg = oneCategory ? (cats[oneCategory] || {}) : null;
    const label = oneCategory
      || (selected.length > 1 ? `${selected.length} categories` : (events14dMode ? 'venues with events' : 'all assets'));

    return {
      count,
      label,
      dotColor: oneCategory ? cfg.color : 'rgba(26,22,18,0.55)'
    };
  }

  function getCategoryResultsOverlayState({
    activeCategories,
    filteredCount,
    dismissed = false,
    hasActiveExperience = false
  }) {
    if (dismissed) return null;
    if (hasActiveExperience) return null;
    const selected = Array.from(activeCategories || []);
    if (selected.length !== 1) return null;
    const count = Number(filteredCount);
    if (!Number.isFinite(count) || count <= 1) return null;
    return {
      category: selected[0],
      count
    };
  }

  const api = {
    computeNextCategories,
    getActiveBannerState,
    getCategoryResultsOverlayState
  };

  if (typeof window !== 'undefined') {
    window.CulturalMapFilterStateModel = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
