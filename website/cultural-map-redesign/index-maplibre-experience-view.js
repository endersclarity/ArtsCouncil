(function() {
  'use strict';
  const watercolorThumbPath = (slug) => `img/watercolor/thumbs/${slug}.webp`;

  function getTourPopupHTML({ stop, cats, imageData }) {
    const d = stop.data;
    const cfg = cats[d.l] || { color: '#999' };
    const imgInfo = imageData[d.n];
    const wcSlug = cfg.watercolor || 'landmarks';
    const imgHTML = imgInfo
      ? `<img class="tooltip-img" src="${imgInfo.img}" alt="${imgInfo.alt || d.n}" width="280" height="120" loading="lazy" onerror="this.parentNode.removeChild(this)">`
      : `<div class="tooltip-placeholder" style="background:linear-gradient(135deg, ${cfg.color}, ${cfg.color}dd)"><img src="${watercolorThumbPath(wcSlug)}" class="tooltip-watercolor" alt="" width="120" height="120" loading="lazy" onerror="this.style.display='none'"></div>`;
    const stopNum = stop.index != null
      ? `<span style="background:${cfg.color};color:#fff;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;margin-right:0.3rem;">${stop.index + 1}</span>`
      : '';
    return `${imgHTML}<div class="tooltip-body"><strong>${stopNum}${d.n}</strong><div class="tooltip-cat"><span class="tooltip-cat-dot" style="background:${cfg.color}"></span>${d.l}</div>${d.c ? '<div class="tooltip-city">' + d.c + ', CA</div>' : ''}</div>`;
  }

  function buildCorridorPanel({
    panelEl,
    experience,
    resolved,
    hexToRgba,
    onStopClick,
    onTourClick,
    gsap
  }) {
    if (!panelEl) return;
    const accentColor = experience.theme ? experience.theme.accent : experience.color;

    let stopsHTML = '';
    resolved.forEach((stop, i) => {
      stopsHTML += `
        <div class="corridor-stop" data-stop-idx="${i}">
          <div class="corridor-stop-num" style="background:${accentColor};color:#fff;">${stop.order}</div>
          <div class="corridor-stop-info">
            <div class="corridor-stop-name">${stop.data.n}</div>
            <div class="corridor-stop-note">${stop.note}</div>
          </div>
        </div>
      `;
      if (stop.connector && i < resolved.length - 1) {
        stopsHTML += `<div class="corridor-connector" style="color:${hexToRgba(accentColor, 0.4)}">${stop.connector}</div>`;
      }
    });

    panelEl.innerHTML = `
      <div class="corridor-panel-header">
        <div class="corridor-panel-eyebrow" style="color:${accentColor}">Curated Experience &bull; ${resolved.length} stops</div>
        <div class="corridor-panel-title">${experience.title}</div>
        <button class="corridor-tour-btn" type="button">&#9654; Tour</button>
        <div class="corridor-panel-desc">${experience.description}</div>
      </div>
      <div class="corridor-panel-stops">${stopsHTML}</div>
    `;

    panelEl.querySelectorAll('.corridor-stop').forEach((el) => {
      window.CulturalMapCoreUtils.makeKeyboardActivatable(el, {
        label: `Open stop ${el.dataset.stopIdx ? Number(el.dataset.stopIdx) + 1 : ''}`
      });
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.stopIdx, 10);
        onStopClick(idx);
      });
    });

    const tourBtn = panelEl.querySelector('.corridor-tour-btn');
    if (tourBtn) {
      tourBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        onTourClick(tourBtn);
      });
    }

    panelEl.classList.add('visible');
    gsap.fromTo(panelEl,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );

    gsap.fromTo('.corridor-stop',
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out', delay: 0.3 }
    );
  }

  window.CulturalMapExperienceView = {
    getTourPopupHTML,
    buildCorridorPanel
  };
})();
