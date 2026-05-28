(function() {
  'use strict';

  function getAssetCategories(asset) {
    const categories = [];
    const push = (value) => {
      const category = String(value || '').trim();
      if (category && !categories.includes(category)) categories.push(category);
    };
    if (Array.isArray(asset && asset.categories)) asset.categories.forEach(push);
    push(asset && asset.l);
    return categories;
  }

  function assetMatchesCategories(asset, activeCategories) {
    if (!activeCategories || activeCategories.size === 0) return true;
    return getAssetCategories(asset).some((category) => activeCategories.has(category));
  }

  function buildCombinedMapFilterExpr({ activeCategories, openNowMode, events14dMode }) {
    const openNowExpr = ['!=', ['get', 'hours_state'], 'closed'];
    const eventsExpr = ['==', ['get', 'has_events_14d'], true];
    const clauses = [];

    if (activeCategories.size > 0) {
      const selected = Array.from(activeCategories);
      const categoryExpr =
        selected.length === 1
          ? ['in', selected[0], ['get', 'layers']]
          : ['any', ...selected.map((category) => ['in', category, ['get', 'layers']])];
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
      const categoryOk = assetMatchesCategories(d, activeCategories);
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
