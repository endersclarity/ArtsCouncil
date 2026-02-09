(function() {
  'use strict';

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
      ? data.filter((d) => activeCategories.has(d.l))
      : [...data];

    const normalizedQuery = String(query || '').toLowerCase().trim();
    if (normalizedQuery) {
      filtered = filtered.filter((d) =>
        (d.n && d.n.toLowerCase().includes(normalizedQuery)) ||
        (d.c && d.c.toLowerCase().includes(normalizedQuery)) ||
        (d.d && d.d.toLowerCase().includes(normalizedQuery)) ||
        (d.l && d.l.toLowerCase().includes(normalizedQuery))
      );
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
