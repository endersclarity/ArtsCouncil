(function() {
  'use strict';

  function createExploreController(ctx) {
    var data = ctx.data;
    var cats = ctx.cats;
    var imageData = ctx.imageData;
    var categoryHeroes = ctx.categoryHeroes || {};
    var exploreModel = ctx.exploreModel;
    var exploreView = ctx.exploreView;
    var eventsSearch = ctx.eventsSearch;
    var escapeHTML = ctx.escapeHTML;
    var formatEventDateRange = ctx.formatEventDateRange;
    var getFilteredMapEvents = ctx.getFilteredMapEvents;
    var getActiveCategories = ctx.getActiveCategories;
    var getOpenNowMode = ctx.getOpenNowMode;
    var getEvents14dMode = ctx.getEvents14dMode;
    var getHoursState = ctx.getHoursState;
    var getHoursRank = ctx.getHoursRank;
    var getEventCountForAsset14d = ctx.getEventCountForAsset14d;
    var getHoursLabel = ctx.getHoursLabel;
    var setCategory = ctx.setCategory;
    var openDetail = ctx.openDetail;
    var getListPage = ctx.getListPage;
    var setListPage = ctx.setListPage;
    var listPageSize = ctx.listPageSize;
    var eventWindowDays = ctx.eventWindowDays;

    var activeCityFilter = '';

    function getFilteredData() {
      return exploreModel.getFilteredData({
        data: data,
        activeCategories: getActiveCategories(),
        query: document.getElementById('searchInput').value || '',
        cityFilter: activeCityFilter,
        openNowMode: getOpenNowMode(),
        events14dMode: getEvents14dMode(),
        getHoursState: getHoursState,
        getHoursRank: getHoursRank,
        getEventCountForAsset14d: getEventCountForAsset14d
      });
    }

    function getSearchMatchedEvents(query) {
      return eventsSearch.getSearchMatchedEvents({
        query: query,
        events: getFilteredMapEvents()
      });
    }

    function renderSearchEventMatches(query) {
      var wrap = document.getElementById('exploreEventResults');
      if (!wrap) return;
      var q = (query || '').trim();
      if (!q) {
        wrap.hidden = true;
        wrap.innerHTML = '';
        return;
      }

      var matches = getSearchMatchedEvents(q).slice(0, 6);
      if (!matches.length) {
        wrap.hidden = true;
        wrap.innerHTML = '';
        return;
      }

      wrap.innerHTML = eventsSearch.getSearchEventMatchesHTML({
        matches: matches,
        escapeHTML: escapeHTML,
        formatEventDateRange: formatEventDateRange
      });
      wrap.hidden = false;
    }

    function buildExploreCats() {
      var grid = document.getElementById('exploreCats');
      exploreView.buildExploreCats({
        gridEl: grid,
        data: data,
        cats: cats,
        imageData: imageData,
        categoryHeroes: categoryHeroes,
        onCategorySelect: function(name) {
          exploreSetCategory(name);
        }
      });
    }

    function exploreSetCategory(cat) {
      var wrapper = document.getElementById('exploreListWrapper');
      var catGrid = document.getElementById('exploreCats');

      activeCityFilter = '';

      if (cat) {
        wrapper.classList.add('visible');
        catGrid.style.display = 'none';
        setCategory(cat, { exclusive: true });
        // Build header + city pills
        buildDirectoryHeaderAndFilters(cat);
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

    function buildDirectoryHeaderAndFilters(cat) {
      var headerEl = document.getElementById('directoryHeaderArea');
      if (!headerEl) return;

      var cfg = cats[cat] || { color: '#999' };
      var categoryData = data.filter(function(d) { return d.l === cat; });
      var cities = exploreModel.getAvailableCities(categoryData, 3);

      var html = exploreView.buildDirectoryHeader({
        name: cat,
        count: categoryData.length,
        color: cfg.color
      });
      html += exploreView.buildCityFilterPills({
        cities: cities,
        activeCity: activeCityFilter,
        onCitySelect: null // we'll bind via event delegation
      });
      headerEl.innerHTML = html;

      // Bind city filter pill clicks via delegation
      headerEl.querySelectorAll('.directory-filter-pill').forEach(function(pill) {
        pill.addEventListener('click', function() {
          activeCityFilter = pill.dataset.city || '';
          // Update active state
          headerEl.querySelectorAll('.directory-filter-pill').forEach(function(p) {
            p.classList.toggle('active', (p.dataset.city || '') === activeCityFilter);
          });
          setListPage(0);
          buildList();
        });
      });
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
      var list = document.getElementById('exploreList');
      var wrapper = document.getElementById('exploreListWrapper');
      var searchVal = document.getElementById('searchInput').value.trim();
      renderSearchEventMatches(searchVal);

      if (searchVal && getActiveCategories().size === 0) {
        wrapper.classList.add('visible');
        document.getElementById('exploreCats').style.display = 'none';
      }

      var filtered = getFilteredData();

      // Debounced search tracking
      if (searchVal) {
        if (_searchTrackTimer) clearTimeout(_searchTrackTimer);
        _searchTrackTimer = setTimeout(function() {
          _trackSearch(searchVal, filtered.length);
        }, 800);
      }
      var end = (getListPage() + 1) * listPageSize;
      var visible = filtered.slice(0, end);

      // Update results count
      var countEl = document.getElementById('resultsCount');
      if (countEl) {
        countEl.textContent = exploreView.getExploreResultsText({
          end: end,
          filteredLength: filtered.length,
          activeCategories: getActiveCategories(),
          openNowMode: getOpenNowMode(),
          events14dMode: getEvents14dMode(),
          eventWindowDays: eventWindowDays
        });
      }

      list.innerHTML = '';
      visible.forEach(function(asset) {
        list.appendChild(exploreView.createExploreItemElement({
          asset: asset,
          cats: cats,
          imageData: imageData,
          openNowMode: getOpenNowMode(),
          events14dMode: getEvents14dMode(),
          getHoursState: getHoursState,
          getEventCount14d: function(item) { return getEventCountForAsset14d(data.indexOf(item)); },
          getHoursLabel: getHoursLabel,
          onOpenDetail: function(item) { openDetail(item); }
        }));
      });

      var loadMoreBtn = document.getElementById('loadMoreBtn');
      if (loadMoreBtn) {
        loadMoreBtn.style.display = end >= filtered.length ? 'none' : 'block';
      }
    }

    return {
      buildExploreCats: buildExploreCats,
      exploreSetCategory: exploreSetCategory,
      buildList: buildList,
      getFilteredData: getFilteredData,
      getSearchMatchedEvents: getSearchMatchedEvents
    };
  }

  window.CulturalMapExploreController = {
    createExploreController: createExploreController
  };
})();
