(function() {
  'use strict';
  const watercolorThumbPath = (slug) => `img/watercolor/thumbs/${slug}.webp`;

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
        return {
          type: 'Feature',
          id: i,
          properties: {
            name: item.n || '',
            label_name: labelName,
            layer: item.l || '',
            city: item.c || '',
            address: item.a || '',
            description: item.d || '',
            phone: item.p || '',
            website: item.w || '',
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
    const eventLine = eventCount14d > 0
      ? `<div class="tooltip-event">${eventCount14d} event${eventCount14d === 1 ? '' : 's'} in next ${eventWindowDays} days</div>`
      : '';
    const imgHTML = imgInfo
      ? `<img class="tooltip-img" src="${imgInfo.img}" alt="${imgInfo.alt || props.name}" width="280" height="120" loading="lazy" onerror="this.parentNode.removeChild(this)">`
      : `<div class="tooltip-placeholder" style="background:linear-gradient(135deg, ${cfg.color}, ${cfg.color}dd)"><img src="${watercolorThumbPath(wcSlug)}" class="tooltip-watercolor" alt="" width="120" height="120" loading="lazy" onerror="this.style.display='none'"></div>`;
    return `${imgHTML}<div class="tooltip-body"><strong>${props.name}</strong><div class="tooltip-cat"><span class="tooltip-cat-dot" style="background:${cfg.color}"></span>${props.layer}</div>${props.city ? '<div class="tooltip-city">' + props.city + ', CA</div>' : ''}${eventLine}</div>`;
  }

  window.CulturalMapMapDataModel = {
    addCountyOutlineLayer,
    storeOriginalPaints,
    buildAssetsGeoJSON,
    refreshAssetSourceHoursStates,
    buildFeatureTooltipHTML
  };
})();
