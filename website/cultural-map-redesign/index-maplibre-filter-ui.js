(function() {
  'use strict';

  function buildFilterBar({
    barEl,
    cats,
    onSetCategory,
    onToggleOpenNow,
    onToggleEvents
  }) {
    if (!barEl) return;
    barEl.innerHTML = '';

    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'map-filter-group category-group';
    const categoryLabel = document.createElement('span');
    categoryLabel.className = 'map-filter-group-label';
    categoryLabel.textContent = 'Categories';
    categoryGroup.appendChild(categoryLabel);

    const allPill = document.createElement('button');
    allPill.className = 'filter-pill all-pill active';
    allPill.textContent = 'All';
    allPill.addEventListener('click', () => onSetCategory(null));
    categoryGroup.appendChild(allPill);

    Object.entries(cats).forEach(([name, cfg]) => {
      const pill = document.createElement('button');
      pill.className = 'filter-pill';
      pill.dataset.category = name;
      pill.style.setProperty('--pill-color', cfg.color);
      pill.innerHTML = `<span class="filter-dot" style="background:${cfg.color}"></span>${cfg.short}`;
      pill.addEventListener('click', () => onSetCategory(name));
      categoryGroup.appendChild(pill);
    });
    barEl.appendChild(categoryGroup);

    const statusGroup = document.createElement('div');
    statusGroup.className = 'map-filter-group status-group';
    const statusLabel = document.createElement('span');
    statusLabel.className = 'map-filter-group-label';
    statusLabel.textContent = 'Status';
    statusGroup.appendChild(statusLabel);

    const openNowPill = document.createElement('button');
    openNowPill.id = 'openNowPill';
    openNowPill.className = 'filter-pill open-now-pill';
    openNowPill.style.setProperty('--pill-color', '#2fa35b');
    openNowPill.innerHTML = '<span class="status-toggle-indicator" aria-hidden="true"></span><span class="status-icon" aria-hidden="true">◷</span><span class="status-text">Open now mode</span><span class="status-state-badge" id="openNowStateBadge">Off</span>';
    openNowPill.addEventListener('click', () => onToggleOpenNow());
    statusGroup.appendChild(openNowPill);

    const eventsPill = document.createElement('button');
    eventsPill.id = 'events14dPill';
    eventsPill.className = 'filter-pill events-pill';
    eventsPill.style.setProperty('--pill-color', '#b4581d');
    eventsPill.innerHTML = '<span class="status-toggle-indicator" aria-hidden="true"></span><span class="status-icon" aria-hidden="true">◫</span><span class="status-text">Events (14d)</span><span class="status-state-badge" id="events14dStateBadge">Off</span>';
    eventsPill.addEventListener('click', () => onToggleEvents());
    statusGroup.appendChild(eventsPill);

    const legend = document.createElement('div');
    legend.className = 'hours-legend';
    legend.id = 'hoursLegend';
    legend.innerHTML = `
      <span class="hours-legend-item"><span class="hours-legend-dot open"></span>Open</span>
      <span class="hours-legend-item"><span class="hours-legend-dot unknown"></span>Unknown</span>
    `;
    statusGroup.appendChild(legend);
    barEl.appendChild(statusGroup);
  }

  function buildMapLegend({ panelEl, cats }) {
    if (!panelEl) return;
    panelEl.innerHTML = '';
    Object.entries(cats).forEach(([name, cfg]) => {
      const item = document.createElement('div');
      item.className = 'map-legend-item';
      item.innerHTML = `<span class="map-legend-swatch" style="background:${cfg.color}"></span><span>${cfg.short || name}</span>`;
      panelEl.appendChild(item);
    });
  }

  function syncMapFilterToggleMeta({
    metaEl,
    activeCategories,
    cats,
    openNowMode,
    events14dMode
  }) {
    if (!metaEl) return;
    const parts = [];
    if (activeCategories.size > 0) {
      const selected = Array.from(activeCategories);
      if (selected.length === 1) {
        const cfg = cats[selected[0]];
        parts.push((cfg && cfg.short) ? cfg.short : selected[0]);
      } else {
        parts.push(`${selected.length} cats`);
      }
    } else {
      parts.push('All');
    }
    if (openNowMode) parts.push('Open');
    if (events14dMode) parts.push('Events');
    metaEl.textContent = parts.join(' • ');
  }

  function renderOpenNowUI({
    openNowPill,
    openNowStateBadge,
    legendEl,
    openNowMode
  }) {
    if (openNowPill) {
      openNowPill.classList.toggle('active', openNowMode);
      openNowPill.setAttribute('aria-pressed', openNowMode ? 'true' : 'false');
      openNowPill.setAttribute('aria-label', openNowMode ? 'Disable open now status mode' : 'Enable open now status mode');
      openNowPill.setAttribute('title', openNowMode ? 'Click to disable open now status mode' : 'Click to enable open now status mode');
    }
    if (openNowStateBadge) {
      openNowStateBadge.textContent = openNowMode ? 'On' : 'Off';
    }
    if (legendEl) legendEl.classList.toggle('visible', openNowMode);
  }

  function renderEvents14dUI({
    eventsPill,
    eventsStateBadge,
    events14dMode
  }) {
    if (eventsPill) {
      eventsPill.classList.toggle('active', events14dMode);
      eventsPill.setAttribute('aria-pressed', events14dMode ? 'true' : 'false');
      eventsPill.setAttribute('aria-label', events14dMode ? 'Disable events-in-14-days mode' : 'Enable events-in-14-days mode');
      eventsPill.setAttribute('title', events14dMode ? 'Click to disable events-in-14-days mode' : 'Click to enable events-in-14-days mode');
    }
    if (eventsStateBadge) {
      eventsStateBadge.textContent = events14dMode ? 'On' : 'Off';
    }
  }

  function syncCategoryPills({ activeCategories }) {
    document.querySelectorAll('.filter-pill').forEach((pill) => {
      if (pill.classList.contains('open-now-pill') || pill.classList.contains('events-pill')) return;
      if (pill.classList.contains('all-pill')) {
        pill.classList.toggle('active', activeCategories.size === 0);
      } else {
        pill.classList.toggle('active', activeCategories.has(pill.dataset.category));
      }
    });
  }

  function syncCategoryCards({ cardElements, activeCategories }) {
    (cardElements || []).forEach(({ el, name }) => {
      const isActive = activeCategories.has(name);
      el.classList.toggle('active', isActive);
      el.style.opacity = (activeCategories.size > 0 && !isActive) ? '0.45' : '1';
    });
  }

  window.CulturalMapFilterUI = {
    buildFilterBar,
    buildMapLegend,
    syncMapFilterToggleMeta,
    renderOpenNowUI,
    renderEvents14dUI,
    syncCategoryPills,
    syncCategoryCards
  };
})();
