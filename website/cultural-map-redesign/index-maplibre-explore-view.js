(function() {
  'use strict';

  function buildExploreCats({ gridEl, data, cats, onCategorySelect }) {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    const counts = {};
    (data || []).forEach((item) => {
      counts[item.l] = (counts[item.l] || 0) + 1;
    });

    Object.entries(cats || {}).forEach(([name, cfg]) => {
      const card = document.createElement('div');
      card.className = 'explore-cat-card';
      card.style.setProperty('--card-color', cfg.color);
      card.innerHTML = `
        <img class="explore-cat-card-img" src="img/watercolor/${cfg.watercolor || 'landmarks'}.png" alt="">
        <div class="explore-cat-card-name">${cfg.short || name}</div>
        <div class="explore-cat-card-count">${counts[name] || 0} places</div>
      `;
      card.addEventListener('click', () => onCategorySelect(name));
      gridEl.appendChild(card);
    });
  }

  function getExploreResultsText({
    end,
    filteredLength,
    activeCategories,
    openNowMode,
    events14dMode,
    eventWindowDays
  }) {
    const scopeParts = [];
    if (activeCategories.size > 0) {
      const selected = Array.from(activeCategories);
      scopeParts.push(selected.length === 1 ? selected[0] : `${selected.length} categories`);
    }
    if (openNowMode) scopeParts.push('Status: Open now (open highlighted, unknown dimmed)');
    if (events14dMode) scopeParts.push(`Events: next ${eventWindowDays} days`);
    return `Showing ${Math.min(end, filteredLength)} of ${filteredLength} assets` +
      (scopeParts.length ? ` • ${scopeParts.join(' • ')}` : '');
  }

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
    const cfg = cats[asset.l] || { color: '#999' };
    const imgInfo = imageData[asset.n];
    const wcSlug = cfg.watercolor || 'landmarks';
    const thumbSrc = imgInfo ? imgInfo.img : `img/watercolor/${wcSlug}.png`;
    const item = document.createElement('div');
    item.className = 'explore-item';
    item.style.setProperty('--row-color', cfg.color);
    const hoursState = getHoursState(asset);
    const eventCount14d = getEventCount14d(asset);
    if (openNowMode) {
      item.classList.add('hours-mode', `hours-${hoursState}`);
    }
    const desc = asset.d ? asset.d.replace(/<[^>]*>/g, '').slice(0, 120) : '';
    item.innerHTML = `
      <div class="explore-item-bar" style="background:${cfg.color}"></div>
      <img class="explore-item-thumb" src="${thumbSrc}" alt="" loading="lazy" onerror="this.src='img/watercolor/${wcSlug}.png'">
      <div class="explore-item-info">
        <div class="explore-item-name">${asset.n}</div>
        ${desc ? `<div class="explore-item-desc">${desc}</div>` : ''}
        <div class="explore-item-meta">
          <span class="explore-item-city">${asset.c || asset.a || ''}</span>
          <span class="explore-item-cat" style="color:${cfg.color}">
            <span class="explore-item-cat-dot" style="background:${cfg.color}"></span>
            ${cfg.short || asset.l}
          </span>
          ${openNowMode ? `<span class="hours-pill hours-${hoursState} explore-item-hours">${getHoursLabel(hoursState)}</span>` : ''}
          ${events14dMode && eventCount14d > 0 ? `<span class="hours-pill explore-item-hours" style="color:#934512;background:rgba(180,88,29,0.12);border-color:rgba(180,88,29,0.48)">${eventCount14d} event${eventCount14d === 1 ? '' : 's'}</span>` : ''}
        </div>
      </div>
      <span class="explore-item-arrow">&rarr;</span>
    `;
    item.addEventListener('click', () => onOpenDetail(asset));
    return item;
  }

  window.CulturalMapExploreView = {
    buildExploreCats,
    getExploreResultsText,
    createExploreItemElement
  };
})();
