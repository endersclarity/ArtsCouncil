(function() {
  'use strict';

  /**
   * Build the 8 photo-hero category cards (collapsed state).
   * 4x2 grid on desktop, 3-col tablet, 2-col mobile.
   */
  function buildExploreCats({ gridEl, data, cats, imageData, categoryHeroes, onCategorySelect }) {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    var counts = {};
    (data || []).forEach(function(item) {
      counts[item.l] = (counts[item.l] || 0) + 1;
    });

    Object.entries(cats || {}).forEach(function([name, cfg]) {
      var heroAssetName = categoryHeroes[name];
      var heroImg = heroAssetName && imageData[heroAssetName] ? imageData[heroAssetName].img : '';
      var fallback = 'img/watercolor/' + (cfg.watercolor || 'landmarks') + '.png';

      var card = document.createElement('article');
      card.className = 'directory-card';
      card.dataset.category = name;
      card.style.setProperty('--card-accent', cfg.color);
      card.innerHTML =
        '<div class="directory-card-photo">' +
          '<img src="' + (heroImg || fallback) + '" alt="' + name + '" loading="lazy" onerror="this.src=\'' + fallback + '\'">' +
          '<div class="directory-card-overlay"></div>' +
          '<div class="directory-card-content">' +
            '<h3 class="directory-card-name">' + name + '</h3>' +
            '<span class="directory-card-count">' + (counts[name] || 0) + ' places</span>' +
          '</div>' +
        '</div>';
      card.addEventListener('click', function() { onCategorySelect(name); });
      gridEl.appendChild(card);
    });
  }

  /**
   * Build the category header for expanded view.
   */
  function buildDirectoryHeader({ name, count, color }) {
    return '<div class="directory-header">' +
      '<button class="directory-back-btn" aria-label="Back to all categories">&larr;</button>' +
      '<div class="directory-header-badge" style="background:' + color + '"></div>' +
      '<div class="directory-header-text">' +
        '<h2 class="directory-header-title">Explore ' + name + '</h2>' +
        '<span class="directory-header-count">' + count + ' places</span>' +
      '</div>' +
      '<a href="directory.html?cat=' + encodeURIComponent(name) + '" class="directory-map-link">Explore on map &rarr;</a>' +
    '</div>';
  }

  /**
   * Build city filter pills row.
   */
  function buildCityFilterPills({ cities, activeCity, onCitySelect }) {
    var html = '<div class="directory-filters">';
    html += '<button class="directory-filter-pill' + (!activeCity ? ' active' : '') + '" data-city="">All Locations</button>';
    cities.forEach(function(city) {
      html += '<button class="directory-filter-pill' + (activeCity === city ? ' active' : '') + '" data-city="' + city + '">' + city + '</button>';
    });
    html += '</div>';
    return html;
  }

  function getExploreResultsText({
    end,
    filteredLength,
    activeCategories,
    openNowMode,
    events14dMode,
    eventWindowDays
  }) {
    var scopeParts = [];
    if (activeCategories.size > 0) {
      var selected = Array.from(activeCategories);
      scopeParts.push(selected.length === 1 ? selected[0] : selected.length + ' categories');
    }
    if (openNowMode) scopeParts.push('Open now');
    if (events14dMode) scopeParts.push('Events: next ' + eventWindowDays + ' days');
    return 'Showing ' + Math.min(end, filteredLength) + ' of ' + filteredLength + ' places' +
      (scopeParts.length ? ' \u2022 ' + scopeParts.join(' \u2022 ') : '');
  }

  /**
   * Create a single directory item card (photo-forward design).
   */
  function createExploreItemElement({
    asset,
    cats,
    imageData,
    openNowMode,
    events14dMode,
    getHoursState,
    getEventCount14d,
    getHoursLabel,
    onOpenDetail
  }) {
    var cfg = cats[asset.l] || { color: '#999' };
    var imgInfo = imageData[asset.n];
    var wcSlug = cfg.watercolor || 'landmarks';
    var fallback = 'img/watercolor/' + wcSlug + '.png';
    var photoSrc = imgInfo ? imgInfo.img : fallback;
    var hoursState = getHoursState(asset);
    var eventCount14d = getEventCount14d(asset);

    var item = document.createElement('article');
    item.className = 'directory-item';
    if (openNowMode) {
      item.classList.add('hours-mode', 'hours-' + hoursState);
    }

    var subBadge = asset.l_original ? asset.l_original : '';
    var desc = asset.d ? asset.d.replace(/<[^>]*>/g, '').slice(0, 100) : '';
    var cityLabel = asset.c || '';

    // Bookmark icon in top-right corner
    var bookmarkCorner = '';
    var dbView = window.CulturalMapDreamboardView;
    if (dbView) {
      bookmarkCorner = '<div class="card-bookmark-wrap">' + dbView.renderBookmarkButton(asset.n, 20) + '</div>';
    }

    var html = '<div class="directory-item-photo">' +
        '<img src="' + photoSrc + '" alt="" loading="lazy" onerror="this.src=\'' + fallback + '\'">';
    if (subBadge) {
      html += '<span class="directory-item-badge" style="background:' + cfg.color + '">' + subBadge + '</span>';
    }
    html += bookmarkCorner + '</div>' +
      '<div class="directory-item-body">';
    if (cityLabel) {
      html += '<span class="directory-item-city">' + cityLabel + '</span>';
    }
    html += '<h3 class="directory-item-name">' + asset.n + '</h3>';
    if (desc) {
      html += '<p class="directory-item-desc">' + desc + '</p>';
    }
    // Status pills
    var pills = '';
    if (openNowMode) {
      pills += '<span class="hours-pill hours-' + hoursState + '">' + getHoursLabel(hoursState) + '</span>';
    }
    if (events14dMode && eventCount14d > 0) {
      pills += '<span class="directory-item-events">' + eventCount14d + ' event' + (eventCount14d === 1 ? '' : 's') + '</span>';
    }
    if (pills) {
      html += '<div class="directory-item-pills">' + pills + '</div>';
    }
    html += '</div>';

    item.innerHTML = html;
    item.addEventListener('click', function() { onOpenDetail(asset); });
    return item;
  }

  window.CulturalMapExploreView = {
    buildExploreCats,
    buildDirectoryHeader,
    buildCityFilterPills,
    getExploreResultsText,
    createExploreItemElement
  };
})();
