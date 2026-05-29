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

  function getAssetSearchText(asset) {
    return [
      asset && asset.search_text,
      asset && asset.n,
      asset && asset.c,
      asset && asset.d,
      asset && asset.l,
      ...(Array.isArray(asset && asset.categories) ? asset.categories : []),
      ...(Array.isArray(asset && asset.aliases) ? asset.aliases : [])
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function getFilteredData({
    data,
    activeCategories,
    query,
    openNowMode,
    events14dMode,
    getHoursState,
    getHoursRank,
    getEventCountForAsset14d
  }) {
    let filtered = activeCategories.size > 0
      ? data.filter((d) => assetMatchesCategories(d, activeCategories))
      : [...data];

    const normalizedQuery = String(query || '').toLowerCase().trim();
    if (normalizedQuery) {
      filtered = filtered.filter((d) => getAssetSearchText(d).includes(normalizedQuery));
    }

    if (openNowMode) {
      filtered = filtered.filter((d) => getHoursState(d) !== 'closed');
      filtered = filtered.sort((a, b) => {
        const rankDelta = getHoursRank(getHoursState(a)) - getHoursRank(getHoursState(b));
        if (rankDelta !== 0) return rankDelta;
        return (a.n || '').localeCompare(b.n || '');
      });
    }

    if (events14dMode) {
      filtered = filtered.filter((d) => {
        const idx = data.indexOf(d);
        return getEventCountForAsset14d(idx) > 0;
      });
      filtered = filtered.sort((a, b) => {
        const ai = data.indexOf(a);
        const bi = data.indexOf(b);
        const diff = getEventCountForAsset14d(bi) - getEventCountForAsset14d(ai);
        if (diff !== 0) return diff;
        return (a.n || '').localeCompare(b.n || '');
      });
    }

    return filtered;
  }

  window.CulturalMapExploreModel = {
    getFilteredData
  };
})();
