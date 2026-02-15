(function() {
  'use strict';

  function buildCombinedMapFilterExpr({ activeCategories, openNowMode, events14dMode }) {
    const openNowExpr = ['!=', ['get', 'hours_state'], 'closed'];
    const eventsExpr = ['==', ['get', 'has_events_14d'], true];
    const clauses = [];

    if (activeCategories.size > 0) {
      const selected = Array.from(activeCategories);
      const categoryExpr =
        selected.length === 1
          ? ['==', ['get', 'layer'], selected[0]]
          : ['in', ['get', 'layer'], ['literal', selected]];
      clauses.push(categoryExpr);
    }
    if (openNowMode) clauses.push(openNowExpr);
    if (events14dMode) clauses.push(eventsExpr);

    return clauses.length === 0
      ? null
      : (clauses.length === 1 ? clauses[0] : ['all', ...clauses]);
  }

  function getFitCandidates({
    data,
    activeCategories,
    openNowMode,
    events14dMode,
    getHoursState,
    getEventCountForAsset14d
  }) {
    return data.filter((d, idx) => {
      const categoryOk = activeCategories.size === 0 || activeCategories.has(d.l);
      const openOk = !openNowMode || getHoursState(d) !== 'closed';
      const eventsOk = !events14dMode || getEventCountForAsset14d(idx) > 0;
      return categoryOk && openOk && eventsOk && d.x && d.y;
    });
  }

  window.CulturalMapMapFilterModel = {
    buildCombinedMapFilterExpr,
    getFitCandidates
  };
})();
