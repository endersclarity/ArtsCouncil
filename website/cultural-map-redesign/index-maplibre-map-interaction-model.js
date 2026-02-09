(function() {
  'use strict';

  function getUniqueAssetFeatures(renderedFeatures) {
    const seen = new Set();
    const unique = [];
    (renderedFeatures || []).forEach((feature) => {
      if (!feature || feature.id === undefined || feature.id === null || seen.has(feature.id)) return;
      seen.add(feature.id);
      unique.push(feature);
    });
    return unique;
  }

  function getVisibleAssetFeatureCount(renderedFeatures) {
    return getUniqueAssetFeatures(renderedFeatures).length;
  }

  function chooseProgressiveLabelFeatures({
    uniqueFeatures,
    map,
    openNowMode,
    labelAllThreshold,
    labelSubsetCount
  }) {
    const visibleCount = uniqueFeatures.length;
    const limit = visibleCount <= labelAllThreshold ? visibleCount : Math.min(labelSubsetCount, visibleCount);
    const center = map.getCenter();

    uniqueFeatures.sort((a, b) => {
      if (openNowMode) {
        const ra = (a.properties && a.properties.hours_state) === 'open' ? 0 : 1;
        const rb = (b.properties && b.properties.hours_state) === 'open' ? 0 : 1;
        if (ra !== rb) return ra - rb;
      }
      const ac = (a.geometry && a.geometry.type === 'Point' && Array.isArray(a.geometry.coordinates))
        ? a.geometry.coordinates
        : [center.lng, center.lat];
      const bc = (b.geometry && b.geometry.type === 'Point' && Array.isArray(b.geometry.coordinates))
        ? b.geometry.coordinates
        : [center.lng, center.lat];
      const da = new maplibregl.LngLat(ac[0], ac[1]).distanceTo(center);
      const db = new maplibregl.LngLat(bc[0], bc[1]).distanceTo(center);
      return da - db;
    });

    const candidateFeatures = uniqueFeatures
      .map((feature) => {
        const coords = (feature.geometry && feature.geometry.type === 'Point' && Array.isArray(feature.geometry.coordinates))
          ? feature.geometry.coordinates
          : null;
        if (!coords) return null;
        const point = map.project(coords);
        return { feature, point };
      })
      .filter(Boolean);

    const spreadPx = visibleCount <= labelAllThreshold ? 34 : 56;
    const distributed = [];
    candidateFeatures.forEach((entry) => {
      if (distributed.length >= limit) return;
      const tooClose = distributed.some((picked) => {
        const dx = picked.point.x - entry.point.x;
        const dy = picked.point.y - entry.point.y;
        return Math.hypot(dx, dy) < spreadPx;
      });
      if (!tooClose) distributed.push(entry);
    });

    if (distributed.length < limit) {
      candidateFeatures.forEach((entry) => {
        if (distributed.length >= limit) return;
        if (!distributed.includes(entry)) distributed.push(entry);
      });
    }

    return distributed.slice(0, limit).map((entry) => entry.feature);
  }

  function boxesOverlap(a, b, padding = 8) {
    return !(
      (a.x + a.w + padding) < b.x ||
      (b.x + b.w + padding) < a.x ||
      (a.y + a.h + padding) < b.y ||
      (b.y + b.h + padding) < a.y
    );
  }

  function buildSmartLabelHTML({ features, map, cats, escapeHTML }) {
    const mapBox = map.getCanvas().getBoundingClientRect();
    const mapW = mapBox.width;
    const mapH = mapBox.height;
    const placed = [];
    let html = '';

    features.forEach((feature) => {
      const props = feature.properties || {};
      const idx = Number(props.idx);
      const coords = (feature.geometry && feature.geometry.type === 'Point' && Array.isArray(feature.geometry.coordinates))
        ? feature.geometry.coordinates
        : null;
      if (!coords) return;
      const projected = map.project(coords);
      const anchorX = projected.x;
      const anchorY = projected.y;
      if (anchorX < -24 || anchorX > mapW + 24 || anchorY < -24 || anchorY > mapH + 24) return;

      const name = String(props.name || '').trim();
      if (!name) return;
      const cfg = cats[props.layer] || { color: '#6f6a60' };
      const width = Math.min(176, Math.max(78, (name.length * 6.1) + 22));
      const height = 24;
      const slots = [
        [0, -14],
        [18, -18],
        [-18, -18],
        [24, -8],
        [-24, -8],
        [0, 8],
        [30, 4],
        [-30, 4],
        [42, -12],
        [-42, -12],
        [46, 2],
        [-46, 2]
      ];
      const rings = [0, 8, 14, 22, 32, 44, 58];
      let placedBox = null;

      for (const ring of rings) {
        for (const slot of slots) {
          const centerX = anchorX + slot[0] + (slot[0] < 0 ? -ring : ring);
          const centerY = anchorY + slot[1] + (slot[1] < 0 ? -ring * 0.55 : ring * 0.45);
          const x = Math.max(8, Math.min(mapW - width - 8, centerX - (width / 2)));
          const y = Math.max(10, Math.min(mapH - height - 10, centerY - height));
          const candidate = { x, y, w: width, h: height };
          const hasOverlap = placed.some((box) => boxesOverlap(candidate, box, 4));
          if (!hasOverlap) {
            placedBox = candidate;
            break;
          }
        }
        if (placedBox) break;
      }

      if (!placedBox) return;
      placed.push(placedBox);
      const safeName = escapeHTML(name);
      html += `<button type="button" class="smart-label-card" data-idx="${idx}" style="left:${(placedBox.x + placedBox.w / 2).toFixed(1)}px;top:${(placedBox.y + placedBox.h).toFixed(1)}px;border-left-color:${cfg.color};"><span class="smart-label-dot" style="background:${cfg.color};"></span><span class="smart-label-name">${safeName}</span></button>`;
    });

    return html;
  }

  function getSmartLabelRenderPlan({
    renderedFeatures,
    map,
    openNowMode,
    labelMaxVisible,
    labelAllThreshold,
    labelSubsetCount,
    cats,
    escapeHTML
  }) {
    const unique = getUniqueAssetFeatures(renderedFeatures);
    const visibleCount = unique.length;
    if (!visibleCount || visibleCount > labelMaxVisible) {
      return { shouldRender: false, html: '' };
    }

    const selected = chooseProgressiveLabelFeatures({
      uniqueFeatures: unique,
      map,
      openNowMode,
      labelAllThreshold,
      labelSubsetCount
    });

    return {
      shouldRender: true,
      html: buildSmartLabelHTML({
        features: selected,
        map,
        cats,
        escapeHTML
      })
    };
  }

  function pickIdlePreviewFeature({ renderedFeatures, maxPool = 28 }) {
    const unique = getUniqueAssetFeatures(renderedFeatures);
    if (!unique.length) return null;
    const pickPool = unique.slice(0, Math.min(unique.length, maxPool));
    return pickPool[Math.floor(Math.random() * pickPool.length)];
  }

  window.CulturalMapMapInteractionModel = {
    getUniqueAssetFeatures,
    getVisibleAssetFeatureCount,
    getSmartLabelRenderPlan,
    pickIdlePreviewFeature
  };
})();
