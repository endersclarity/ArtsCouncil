(function() {
  'use strict';

  function addCountyOutlineLayer({ map, countyOutline }) {
    if (!map || !countyOutline || !Array.isArray(countyOutline.features) || !countyOutline.features.length) {
      return;
    }
    if (map.getLayer('county-outline-core')) return;

    if (!map.getSource('county-outline')) {
      map.addSource('county-outline', {
        type: 'geojson',
        data: countyOutline
      });
    }

    map.addLayer({
      id: 'county-outline-glow',
      type: 'line',
      source: 'county-outline',
      paint: {
        'line-color': 'rgba(74,107,124,0.52)',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 4.5,
          12, 7,
          15, 9.5
        ],
        'line-opacity': 0.65,
        'line-blur': 1.2
      }
    });

    map.addLayer({
      id: 'county-outline-core',
      type: 'line',
      source: 'county-outline',
      paint: {
        'line-color': '#2b566f',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 1.7,
          12, 2.4,
          15, 3.2
        ],
        'line-opacity': 0.92
      }
    });
  }

  function storeOriginalPaints(map) {
    const snapshot = {};
    try {
      const layers = map.getStyle().layers || [];
      layers.forEach((layer) => {
        if (layer.paint) {
          snapshot[layer.id] = { ...layer.paint };
        }
      });
    } catch (err) {}
    return snapshot;
  }

  const CATEGORY_PRIORITY = {
    'Performance Spaces': 0,
    'Eat, Drink & Stay': 1,
    'Galleries & Museums': 2,
    'Walks & Trails': 3,
    'Historic Landmarks': 4,
    'Preservation & Culture': 5,
    'Arts Organizations': 6,
    'Fairs & Festivals': 7,
    'Cultural Resources': 8,
    'Public Art': 9
  };

  const PLACE_NAME_HINT_RE = /\b(fairgrounds|theatre|theater|center|centre|museum|park|library|hotel|saloon|lounge|winery|brewery|gallery|schoolhouse|cafe|pub|studio|trail|foundry|hall|house|garden|gardens|beach)\b/i;
  const SUB_ASSET_HINT_RE = /\b(festival|series|parade|celebration|fireworks|craft fair|car show|brewfest|association|foundation|commission|guild|club|mural|sculpture|memorial|monument|project|tour|event|site|inc)\b/i;

  function normalizeAssetToken(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function getAssetCategories(asset) {
    const categories = [];
    const push = (value) => {
      const category = String(value || '').trim();
      if (category && !categories.includes(category)) categories.push(category);
    };
    if (Array.isArray(asset && asset.categories)) {
      asset.categories.forEach(push);
    }
    push(asset && asset.l);
    return categories;
  }

  function getAssetGroupKey(asset, index) {
    const pid = String(asset && asset.pid || '').trim();
    if (pid) return `pid:${pid}`;

    const name = normalizeAssetToken(asset && asset.n);
    const address = normalizeAssetToken(asset && asset.a);
    const city = normalizeAssetToken(asset && asset.c);
    if (name && address) return `name-address:${name}|${address}|${city}`;

    return `row:${index}`;
  }

  function getCategoryRank(category) {
    return Object.prototype.hasOwnProperty.call(CATEGORY_PRIORITY, category)
      ? CATEGORY_PRIORITY[category]
      : 99;
  }

  function scoreCanonicalAsset(asset) {
    const name = String(asset && asset.n || '');
    const category = String(asset && asset.l || '');
    let score = 100 - (getCategoryRank(category) * 4);
    if (PLACE_NAME_HINT_RE.test(name)) score += 28;
    if (SUB_ASSET_HINT_RE.test(name)) score -= 24;
    if (asset && asset.w) score += 4;
    if (asset && asset.p) score += 2;
    score -= Math.min(name.length, 90) * 0.05;
    return score;
  }

  function chooseCanonicalAsset(group) {
    return group
      .slice()
      .sort((a, b) => {
        const scoreDelta = scoreCanonicalAsset(b.asset) - scoreCanonicalAsset(a.asset);
        if (scoreDelta !== 0) return scoreDelta;
        const categoryDelta = getCategoryRank(a.asset && a.asset.l) - getCategoryRank(b.asset && b.asset.l);
        if (categoryDelta !== 0) return categoryDelta;
        return a.index - b.index;
      })[0];
  }

  function normalizeAssetData(data) {
    if (!Array.isArray(data)) return [];

    const groups = new Map();
    data.forEach((asset, index) => {
      if (!asset || typeof asset !== 'object') return;
      const key = getAssetGroupKey(asset, index);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ asset, index });
    });

    const normalized = [];
    groups.forEach((group) => {
      if (!group.length) return;
      const chosen = chooseCanonicalAsset(group);
      const primary = chosen.asset;
      const categories = [];
      const aliases = [];
      const sourceIndices = [];
      const relatedAssets = [];
      const searchParts = [];

      const pushCategory = (value) => {
        const category = String(value || '').trim();
        if (category && !categories.includes(category)) categories.push(category);
      };
      pushCategory(primary.l);

      group
        .slice()
        .sort((a, b) => a.index - b.index)
        .forEach(({ asset, index }) => {
          sourceIndices.push(index);
          getAssetCategories(asset).forEach(pushCategory);
          const name = String(asset.n || '').trim();
          if (name && name !== primary.n && !aliases.includes(name)) aliases.push(name);
          relatedAssets.push({
            index,
            n: asset.n || '',
            l: asset.l || '',
            a: asset.a || '',
            c: asset.c || '',
            pid: asset.pid || ''
          });
          searchParts.push(asset.n, asset.l, asset.a, asset.c, asset.d);
        });

      normalized.push({
        ...primary,
        l: primary.l || categories[0] || '',
        categories,
        aliases,
        related_assets: relatedAssets,
        source_indices: sourceIndices,
        duplicate_count: group.length,
        search_text: searchParts.filter(Boolean).join(' ')
      });
    });

    return normalized.sort((a, b) => {
      const ai = Array.isArray(a.source_indices) ? a.source_indices[0] : 0;
      const bi = Array.isArray(b.source_indices) ? b.source_indices[0] : 0;
      return ai - bi;
    });
  }

  function buildAssetsGeoJSON({
    data,
    cats,
    getHoursState,
    getHoursLabel,
    getEventCountForAsset14d
  }) {
    return {
      type: 'FeatureCollection',
      features: (data || []).map((item, i) => {
        const lon = Number(item.x);
        const lat = Number(item.y);
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
        const hoursState = getHoursState(item);
        const eventCount14d = getEventCountForAsset14d(i);
        const rawLabel = item.n || '';
        const labelName = rawLabel.length > 26 ? `${rawLabel.slice(0, 23)}...` : rawLabel;
        const categories = getAssetCategories(item);
        return {
          type: 'Feature',
          id: i,
          properties: {
            name: item.n || '',
            label_name: labelName,
            layer: item.l || '',
            layers: categories,
            city: item.c || '',
            address: item.a || '',
            description: item.d || '',
            phone: item.p || '',
            website: item.w || '',
            aliases: Array.isArray(item.aliases) ? item.aliases.join(' | ') : '',
            duplicate_count: Number(item.duplicate_count || 1),
            hours_state: hoursState,
            hours_label: getHoursLabel(hoursState),
            event_count_14d: eventCount14d,
            has_events_14d: eventCount14d > 0,
            color: (cats[item.l] || { color: '#999' }).color,
            idx: i
          },
          geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          }
        };
      }).filter(Boolean)
    };
  }

  function refreshAssetSourceHoursStates({
    map,
    buildAssetsGeoJSON,
    clearMapLabelStates,
    updateMapProgressiveLabels,
    updateMobileLabelLayerVisibility
  }) {
    const source = map && map.getSource('assets');
    if (!source || typeof source.setData !== 'function') return;
    clearMapLabelStates();
    source.setData(buildAssetsGeoJSON());
    requestAnimationFrame(() => {
      updateMapProgressiveLabels();
      updateMobileLabelLayerVisibility();
    });
  }

  function buildFeatureTooltipHTML({
    props,
    cats,
    imageData,
    eventWindowDays
  }) {
    const cfg = cats[props.layer] || { color: '#999' };
    const imgInfo = imageData[props.name];
    const wcSlug = cfg.watercolor || 'landmarks';
    const eventCount14d = Number(props.event_count_14d || 0);
    const layerCount = Array.isArray(props.layers) ? props.layers.length : 1;
    const layerLabel = layerCount > 1 ? `${props.layer} +${layerCount - 1}` : props.layer;
    const eventLine = eventCount14d > 0
      ? `<div class="tooltip-event">${eventCount14d} event${eventCount14d === 1 ? '' : 's'} in next ${eventWindowDays} days</div>`
      : '';
    const imgHTML = imgInfo
      ? `<img class="tooltip-img" src="${imgInfo.img}" alt="${imgInfo.alt || props.name}" onerror="this.parentNode.removeChild(this)">`
      : `<div class="tooltip-placeholder" style="background:linear-gradient(135deg, ${cfg.color}, ${cfg.color}dd)"><img src="img/watercolor/${wcSlug}.png" class="tooltip-watercolor" alt="" onerror="this.style.display='none'"></div>`;
    return `${imgHTML}<div class="tooltip-body"><strong>${props.name}</strong><div class="tooltip-cat"><span class="tooltip-cat-dot" style="background:${cfg.color}"></span>${layerLabel}</div>${props.city ? '<div class="tooltip-city">' + props.city + ', CA</div>' : ''}${eventLine}</div>`;
  }

  function getCategoryIconKey(layerName) {
    return 'cat-icon-' + String(layerName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  }

  window.CulturalMapMapDataModel = {
    addCountyOutlineLayer,
    storeOriginalPaints,
    getCategoryIconKey,
    getAssetCategories,
    normalizeAssetData,
    buildAssetsGeoJSON,
    refreshAssetSourceHoursStates,
    buildFeatureTooltipHTML
  };
})();
