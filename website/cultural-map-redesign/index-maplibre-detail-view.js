(function() {
  'use strict';

  function buildDetailHeroHTML({ asset, cfg, imageData }) {
    const imgInfo = imageData[asset.n];
    const wcSlug = cfg.watercolor || 'landmarks';
    if (imgInfo) {
      return `<img class="detail-hero-img" src="${imgInfo.img}" alt="${imgInfo.alt || asset.n}" onerror="this.parentNode.innerHTML='<div class=\\'detail-hero-placeholder\\' style=\\'background:linear-gradient(135deg, ${cfg.color}40, ${cfg.color}20)\\'><img src=\\'img/watercolor/${wcSlug}.png\\' class=\\'detail-hero-watercolor\\' alt=\\'\\'></div>'">`;
    }
    return `<div class="detail-hero-placeholder" style="background:linear-gradient(135deg, ${cfg.color}40, ${cfg.color}20)"><img src="img/watercolor/${wcSlug}.png" class="detail-hero-watercolor" alt="" onerror="this.style.display='none'"></div>`;
  }

  function buildDetailTagHTML({ asset, icons }) {
    return `<span style="display:inline-flex;align-items:center;gap:0.4rem;">${icons[asset.l] ? '<span style="width:14px;height:14px;display:inline-block;vertical-align:middle;">' + icons[asset.l] + '</span>' : ''} ${asset.l}</span>`;
  }

  function buildDetailExperienceBadgesHTML({ matchingExps }) {
    return matchingExps.map((exp) => {
      const expColor = exp.theme ? exp.theme.accent : exp.color;
      return `<span class="detail-exp-pill" style="color:${expColor}" data-exp-slug="${exp.slug}"><span class="detail-exp-pill-dot" style="background:${expColor}"></span>${exp.title}</span>`;
    }).join('');
  }

  function buildDetailMetaHTML({
    asset,
    hoursState,
    hoursLabel,
    todayHours,
    eventCount14d,
    eventWindowDays,
    escapeHTML
  }) {
    let metaHTML = '';
    metaHTML += `<div class="detail-meta-row"><span class="detail-meta-icon">&#9716;</span><div class="detail-meta-value"><span class="hours-pill hours-${hoursState}">${hoursLabel}</span>${todayHours ? `<div class="detail-hours-today">Today: ${escapeHTML(todayHours)}</div>` : ''}</div></div>`;
    if (eventCount14d > 0) {
      metaHTML += `<div class="detail-meta-row"><span class="detail-meta-icon">&#9680;</span><div class="detail-meta-value"><span class="hours-pill" style="color:#934512;background:rgba(180,88,29,0.12);border-color:rgba(180,88,29,0.48)">${eventCount14d} event${eventCount14d === 1 ? '' : 's'} in ${eventWindowDays}d</span></div></div>`;
    }
    if (asset.a) metaHTML += `<div class="detail-meta-row"><span class="detail-meta-icon">&#9675;</span><div class="detail-meta-value">${asset.a}${asset.c ? ', ' + asset.c + ', CA' : ''}</div></div>`;
    if (asset.p) metaHTML += `<div class="detail-meta-row"><span class="detail-meta-icon">&#9743;</span><div class="detail-meta-value"><a href="tel:${asset.p}">${asset.p}</a></div></div>`;
    if (asset.w) {
      let url = asset.w.trim();
      if (!url.startsWith('http')) url = 'https://' + url;
      const display = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      metaHTML += `<div class="detail-meta-row"><span class="detail-meta-icon">&#9741;</span><div class="detail-meta-value"><a href="${url}" target="_blank" rel="noopener">${display}</a></div></div>`;
    }
    if (asset.x && asset.y) {
      metaHTML += `<div class="detail-meta-row"><span class="detail-meta-icon">&#9906;</span><div class="detail-meta-value"><a href="https://www.google.com/maps?q=${asset.y},${asset.x}" target="_blank" rel="noopener">View on Google Maps</a></div></div>`;
    }
    return metaHTML;
  }

  function createDetailFlyToButton(onClick) {
    const flyBtn = document.createElement('button');
    flyBtn.className = 'detail-flyto';
    flyBtn.innerHTML = '<span class="detail-flyto-icon">&#9906;</span> View on map';
    flyBtn.addEventListener('click', onClick);
    return flyBtn;
  }

  function openDetailPanel({ panelEl, overlayEl, gsap }) {
    overlayEl.classList.add('open');
    gsap.to(overlayEl, { opacity: 1, duration: 0.3 });
    gsap.to(panelEl, { right: 0, duration: 0.45, ease: 'power3.out' });
    panelEl.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailPanel({ panelEl, overlayEl, gsap }) {
    gsap.to(panelEl, {
      right: -460, duration: 0.35, ease: 'power2.in',
      onComplete: () => panelEl.classList.remove('open')
    });
    gsap.to(overlayEl, {
      opacity: 0, duration: 0.25,
      onComplete: () => { overlayEl.classList.remove('open'); }
    });
    document.body.style.overflow = '';
  }

  window.CulturalMapDetailView = {
    buildDetailHeroHTML,
    buildDetailTagHTML,
    buildDetailExperienceBadgesHTML,
    buildDetailMetaHTML,
    createDetailFlyToButton,
    openDetailPanel,
    closeDetailPanel
  };
})();
