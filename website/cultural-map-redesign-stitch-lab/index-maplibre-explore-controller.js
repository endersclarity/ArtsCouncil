(function() {
  'use strict';

  function createExploreController(ctx) {
    const {
      data,
      cats,
      imageData,
      exploreModel,
      exploreView,
      eventsSearch,
      escapeHTML,
      formatEventDateRange,
      getFilteredMapEvents,
      getActiveCategories,
      getOpenNowMode,
      getEvents14dMode,
      getHoursState,
      getHoursRank,
      getEventCountForAsset14d,
      getHoursLabel,
      setCategory,
      openDetail,
      getListPage,
      setListPage,
      listPageSize,
      eventWindowDays
    } = ctx;

    function getFilteredData() {
      return exploreModel.getFilteredData({
        data,
        activeCategories: getActiveCategories(),
        query: document.getElementById('searchInput').value || '',
        openNowMode: getOpenNowMode(),
        events14dMode: getEvents14dMode(),
        getHoursState,
        getHoursRank,
        getEventCountForAsset14d
      });
    }

    function getSearchMatchedEvents(query) {
      return eventsSearch.getSearchMatchedEvents({
        query,
        events: getFilteredMapEvents()
      });
    }

    function renderSearchEventMatches(query) {
      const wrap = document.getElementById('exploreEventResults');
      if (!wrap) return;
      const q = (query || '').trim();
      if (!q) {
        wrap.hidden = true;
        wrap.innerHTML = '';
        return;
      }

      const matches = getSearchMatchedEvents(q).slice(0, 6);
      if (!matches.length) {
        wrap.hidden = true;
        wrap.innerHTML = '';
        return;
      }

      wrap.innerHTML = eventsSearch.getSearchEventMatchesHTML({
        matches,
        escapeHTML,
        formatEventDateRange
      });
      wrap.hidden = false;
    }

    function buildExploreCats() {
      const grid = document.getElementById('exploreCats');
      exploreView.buildExploreCats({
        gridEl: grid,
        data,
        cats,
        onCategorySelect: (name) => {
          exploreSetCategory(name);
        }
      });
    }

    function exploreSetCategory(cat) {
      const wrapper = document.getElementById('exploreListWrapper');
      const catGrid = document.getElementById('exploreCats');
      const cards = document.querySelectorAll('.explore-cat-card');

      if (cat) {
        wrapper.classList.add('visible');
        cards.forEach((card) => card.classList.remove('active'));
        setCategory(cat, { exclusive: true });
      } else {
        wrapper.classList.remove('visible');
        catGrid.style.display = '';
        document.getElementById('searchInput').value = '';
        setCategory(null);
      }
      setListPage(0);
      buildList();
      document.getElementById('exploreSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    var _searchTrackTimer = null;

    function _trackSearch(query, resultCount) {
      var analytics = window.CulturalMapAnalytics;
      if (!analytics) return;
      var q = (query || '').substring(0, 100);
      if (q.length < 2) return;
      if (resultCount === 0) {
        analytics.track('search:zero', { query: q, zero_results: true });
      } else {
        analytics.track('search:query', { query: q, results: resultCount, zero_results: false });
      }
    }

    function buildList() {
      const list = document.getElementById('exploreList');
      const wrapper = document.getElementById('exploreListWrapper');
      const searchVal = document.getElementById('searchInput').value.trim();
      renderSearchEventMatches(searchVal);

      if (searchVal && getActiveCategories().size === 0) {
        wrapper.classList.add('visible');
      }

      const filtered = getFilteredData();

      // Debounced search tracking (800ms after user stops typing)
      if (searchVal) {
        if (_searchTrackTimer) clearTimeout(_searchTrackTimer);
        _searchTrackTimer = setTimeout(function() {
          _trackSearch(searchVal, filtered.length);
        }, 800);
      }
      const end = (getListPage() + 1) * listPageSize;
      const visible = filtered.slice(0, end);

      document.getElementById('resultsCount').textContent = exploreView.getExploreResultsText({
        end,
        filteredLength: filtered.length,
        activeCategories: getActiveCategories(),
        openNowMode: getOpenNowMode(),
        events14dMode: getEvents14dMode(),
        eventWindowDays
      });

      list.innerHTML = '';
      visible.forEach((asset) => {
        list.appendChild(exploreView.createExploreItemElement({
          asset,
          cats,
          imageData,
          openNowMode: getOpenNowMode(),
          events14dMode: getEvents14dMode(),
          getHoursState,
          getEventCount14d: (item) => getEventCountForAsset14d(data.indexOf(item)),
          getHoursLabel,
          onOpenDetail: (item) => openDetail(item)
        }));
      });

      document.getElementById('loadMoreBtn').style.display = end >= filtered.length ? 'none' : 'block';
    }

    return {
      buildExploreCats,
      exploreSetCategory,
      buildList,
      getFilteredData,
      getSearchMatchedEvents
    };
  }

  window.CulturalMapExploreController = {
    createExploreController
  };
})();
