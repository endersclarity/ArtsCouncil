(function() {
  'use strict';
  const watercolorThumbPath = (slug) => `img/watercolor/thumbs/${slug}.webp`;

  function buildExperienceSelector({
    corridorContainer,
    experienceContainer,
    corridors,
    experiences,
    activeExperienceSlug,
    onCardClick
  }) {
    if (!corridorContainer || !experienceContainer) return;
    corridorContainer.innerHTML = '';
    experienceContainer.innerHTML = '';

    function makeCard(exp, container) {
      const card = document.createElement('div');
      card.className = 'experience-card';
      if (activeExperienceSlug && activeExperienceSlug === exp.slug) card.classList.add('active');
      card.dataset.expType = exp.type || 'experience';
      const stopCount = (exp.stops || []).length;
      card.dataset.slug = exp.slug;
      card.innerHTML = `
        <div class="experience-card-dot" style="background:${exp.color}; color:${exp.color}"></div>
        <div class="experience-card-info">
          <div class="experience-card-title">${exp.title}</div>
          <div class="experience-card-meta">${stopCount} stops</div>
        </div>
        <div class="experience-card-close">&times;</div>
      `;
      card.style.setProperty('--exp-color', exp.color);
      card.addEventListener('click', () => onCardClick(exp));
      window.CulturalMapCoreUtils.makeKeyboardActivatable(card, {
        label: `Open guide: ${exp.title}`
      });
      container.appendChild(card);
    }

    (corridors || []).forEach((exp) => makeCard(exp, corridorContainer));
    (experiences || []).forEach((exp) => makeCard(exp, experienceContainer));
  }

  function getExperienceLayoutState(experiences) {
    const list = experiences || [];
    if (!list.length) {
      return {
        hasData: false,
        hasAny: false,
        corridors: [],
        experiences: [],
        guidesCountText: '0 guides',
        corridorCountText: '0 routes',
        experienceCountText: '0 routes'
      };
    }
    const corridors = list.filter((item) => item.type === 'corridor');
    const nonCorridors = list.filter((item) => item.type !== 'corridor');
    const total = corridors.length + nonCorridors.length;
    return {
      hasData: true,
      hasAny: total > 0,
      corridors,
      experiences: nonCorridors,
      guidesCountText: `${total} guides`,
      corridorCountText: `${corridors.length} route${corridors.length === 1 ? '' : 's'}`,
      experienceCountText: `${nonCorridors.length} route${nonCorridors.length === 1 ? '' : 's'}`
    };
  }

  function buildCategoryGrid({
    gridEl,
    data,
    cats,
    icons,
    hexToRgba,
    onCategoryClick
  }) {
    if (!gridEl) return [];
    gridEl.innerHTML = '';

    const counts = {};
    (data || []).forEach((item) => {
      counts[item.l] = (counts[item.l] || 0) + 1;
    });

    const cardElements = [];
    const sorted = Object.entries(cats || {}).sort((a, b) => (counts[b[0]] || 0) - (counts[a[0]] || 0));

    sorted.forEach(([name, cfg]) => {
      const card = document.createElement('div');
      card.className = 'cat-card';
      card.dataset.category = name;
      card.style.setProperty('--cat-color', cfg.color);
      const wcSlug = cfg.watercolor || 'landmarks';
      card.innerHTML = `
        <div class="cat-icon" style="background:${hexToRgba(cfg.color, 0.1)}; color:${cfg.color}">
          <img src="${watercolorThumbPath(wcSlug)}" alt="" width="32" height="32" class="cat-icon-watercolor" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
          <span class="cat-icon-svg" style="display:none">${icons[name] || ''}</span>
        </div>
        <div class="cat-card-info">
          <div class="cat-card-count">${counts[name] || 0}</div>
          <div class="cat-card-name">${name}</div>
          <div class="cat-card-active-label">Filtered</div>
        </div>
      `;
      card.addEventListener('click', () => onCategoryClick(name));
      window.CulturalMapCoreUtils.makeKeyboardActivatable(card, {
        label: `Filter map by category: ${name}`
      });
      gridEl.appendChild(card);
      cardElements.push({ el: card, name });
    });

    return cardElements;
  }

  window.CulturalMapCatalogView = {
    buildExperienceSelector,
    buildCategoryGrid,
    getExperienceLayoutState
  };
})();
