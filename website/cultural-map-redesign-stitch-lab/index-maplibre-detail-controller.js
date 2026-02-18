(function() {
  'use strict';

  function openDetail(ctx) {
    const {
      asset,
      panelEl,
      overlayEl,
      cats,
      imageData,
      icons,
      experiences,
      closeDetail,
      activateExperience,
      detailView,
      getHoursState,
      getTodayHoursDisplay,
      resolveAssetIndex,
      getEventCountForAsset14d,
      eventWindowDays,
      getHoursLabel,
      escapeHTML,
      renderDetailEvents,
      map,
      gsap
    } = ctx;

    // Track detail panel open
    var analytics = window.CulturalMapAnalytics;
    if (analytics) {
      analytics.track('detail:open', {
        category: asset.l || '',
        name: (asset.n || '').substring(0, 100),
        city: asset.c || ''
      });
    }

    const cfg = cats[asset.l] || { color: '#999' };
    document.getElementById('detailCatBar').style.background = cfg.color;

    const heroEl = document.getElementById('detailHero');
    heroEl.innerHTML = detailView.buildDetailHeroHTML({
      asset,
      cfg,
      imageData
    });

    document.getElementById('detailTag').innerHTML = detailView.buildDetailTagHTML({
      asset,
      icons
    });
    document.getElementById('detailTag').style.color = cfg.color;

    const expBadge = document.getElementById('detailExpBadge');
    const matchingExps = experiences.filter((exp) => exp.stops.some((s) => s.asset === asset.n));
    if (matchingExps.length > 0) {
      expBadge.innerHTML = detailView.buildDetailExperienceBadgesHTML({
        matchingExps
      });
      expBadge.querySelectorAll('.detail-exp-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          closeDetail();
          const slug = pill.dataset.expSlug;
          const exp = experiences.find((entry) => entry.slug === slug);
          if (exp) {
            activateExperience(exp);
            document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    } else {
      expBadge.innerHTML = '';
    }

    var detailNameEl = document.getElementById('detailName');
    detailNameEl.textContent = asset.n;
    // Inject bookmark button next to venue name
    var dbView = window.CulturalMapDreamboardView;
    if (dbView) {
      dbView.injectCSS();
      var bookmarkWrap = document.createElement('span');
      bookmarkWrap.style.cssText = 'display:inline-block;vertical-align:middle;margin-left:6px;';
      bookmarkWrap.innerHTML = dbView.renderBookmarkButton(asset.n, 24) + dbView.renderFirstUseLabel();
      detailNameEl.appendChild(bookmarkWrap);
    }
    document.getElementById('detailDesc').textContent = asset.d || 'No description available.';
    document.getElementById('detailDesc').style.display = asset.d ? 'block' : 'none';

    const hoursState = getHoursState(asset);
    const todayHours = getTodayHoursDisplay(asset);
    const assetIdx = resolveAssetIndex(asset);
    const eventCount14d = Number.isInteger(assetIdx) ? getEventCountForAsset14d(assetIdx) : 0;
    const metaHTML = detailView.buildDetailMetaHTML({
      asset,
      hoursState,
      hoursLabel: getHoursLabel(hoursState),
      todayHours,
      eventCount14d,
      eventWindowDays,
      escapeHTML
    });

    document.getElementById('detailMeta').innerHTML = metaHTML;
    renderDetailEvents(asset);

    const existingFlyto = panelEl.querySelector('.detail-flyto');
    if (existingFlyto) existingFlyto.remove();
    if (asset.x && asset.y) {
      const flyBtn = detailView.createDetailFlyToButton(() => {
        closeDetail();
        document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          map.flyTo({ center: [asset.x, asset.y], zoom: 15, pitch: 50, bearing: -20, duration: 2000 });
        }, 600);
      });
      document.querySelector('.detail-content').appendChild(flyBtn);
    }

    detailView.openDetailPanel({
      panelEl,
      overlayEl,
      gsap
    });
  }

  function closeDetail({ panelEl, overlayEl, detailView, gsap }) {
    detailView.closeDetailPanel({
      panelEl,
      overlayEl,
      gsap
    });
  }

  window.CulturalMapDetailController = {
    openDetail,
    closeDetail
  };
})();
