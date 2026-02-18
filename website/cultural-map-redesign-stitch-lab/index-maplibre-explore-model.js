(function() {
  'use strict';

  function getFilteredData({
    data,
    activeCategories,
    query,
    cityFilter,
    openNowMode,
    events14dMode,
    getHoursState,
    getHoursRank,
    getEventCountForAsset14d
  }) {
    var filtered = activeCategories.size > 0
      ? data.filter(function(d) { return activeCategories.has(d.l); })
      : data.slice();

    // City filter
    if (cityFilter) {
      filtered = filtered.filter(function(d) {
        return d.c === cityFilter;
      });
    }

    var normalizedQuery = String(query || '').toLowerCase().trim();
    if (normalizedQuery) {
      filtered = filtered.filter(function(d) {
        return (d.n && d.n.toLowerCase().indexOf(normalizedQuery) !== -1) ||
          (d.c && d.c.toLowerCase().indexOf(normalizedQuery) !== -1) ||
          (d.d && d.d.toLowerCase().indexOf(normalizedQuery) !== -1) ||
          (d.l && d.l.toLowerCase().indexOf(normalizedQuery) !== -1) ||
          (d.l_original && d.l_original.toLowerCase().indexOf(normalizedQuery) !== -1);
      });
    }

    if (openNowMode) {
      filtered = filtered.filter(function(d) { return getHoursState(d) !== 'closed'; });
      filtered = filtered.sort(function(a, b) {
        var rankDelta = getHoursRank(getHoursState(a)) - getHoursRank(getHoursState(b));
        if (rankDelta !== 0) return rankDelta;
        return (a.n || '').localeCompare(b.n || '');
      });
    }

    if (events14dMode) {
      // Pre-build index map for O(1) lookup (S2 fix — replaces O(n) data.indexOf per comparison)
      var dataIndexMap = {};
      for (var i = 0; i < data.length; i++) {
        dataIndexMap[data[i].n] = i;
      }
      filtered = filtered.filter(function(d) {
        var idx = dataIndexMap[d.n] !== undefined ? dataIndexMap[d.n] : -1;
        return getEventCountForAsset14d(idx) > 0;
      });
      filtered = filtered.sort(function(a, b) {
        var ai = dataIndexMap[a.n] !== undefined ? dataIndexMap[a.n] : -1;
        var bi = dataIndexMap[b.n] !== undefined ? dataIndexMap[b.n] : -1;
        var diff = getEventCountForAsset14d(bi) - getEventCountForAsset14d(ai);
        if (diff !== 0) return diff;
        return (a.n || '').localeCompare(b.n || '');
      });
    }

    return filtered;
  }

  /**
   * Extract unique cities from a filtered dataset.
   * Returns cities with 5+ assets in descending count order.
   */
  function getAvailableCities(filtered, minCount) {
    var min = minCount || 5;
    var counts = {};
    filtered.forEach(function(d) {
      var city = d.c;
      if (city) {
        counts[city] = (counts[city] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .filter(function(pair) { return pair[1] >= min; })
      .sort(function(a, b) { return b[1] - a[1]; })
      .map(function(pair) { return pair[0]; });
  }

  window.CulturalMapExploreModel = {
    getFilteredData: getFilteredData,
    getAvailableCities: getAvailableCities
  };
})();
