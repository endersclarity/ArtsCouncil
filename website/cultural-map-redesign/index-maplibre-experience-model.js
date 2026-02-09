(function() {
  'use strict';

  function resolveStops(experience, data) {
    return (experience.stops || []).map((stop) => {
      const match = (data || []).find((asset) =>
        asset.n && asset.n.toLowerCase().includes(String(stop.asset || '').toLowerCase())
      );
      return { ...stop, data: match || null };
    }).filter((stop) => stop.data);
  }

  function removeCorridorMapLayers(map) {
    if (!map) return;
    ['corridor-route-glow', 'corridor-route-animated', 'corridor-stops-labels', 'corridor-stops-glow', 'corridor-stops-main'].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    ['corridor-route-glow', 'corridor-route-animated', 'corridor-stops'].forEach((id) => {
      if (map.getSource(id)) map.removeSource(id);
    });
  }

  function applyTheme({ theme, fallbackColor, map, maptilerKey, hexToRgba }) {
    const root = document.documentElement;
    root.style.setProperty('--theme-accent', theme.accent || fallbackColor);
    root.style.setProperty('--theme-route', theme.routeColor || fallbackColor);

    if (theme.basemap === 'terrain' && maptilerKey !== 'GET_YOUR_FREE_KEY_AT_MAPTILER_COM') {
      try {
        const layers = map.getStyle().layers || [];
        layers.forEach((layer) => {
          if (layer.id === 'background' || layer.id.includes('land') || layer.id.includes('earth')) {
            if (layer.type === 'background') {
              map.setPaintProperty(layer.id, 'background-color', theme.background || '#f2ece4');
            } else if (layer.type === 'fill') {
              map.setPaintProperty(layer.id, 'fill-color', theme.background || '#f2ece4');
            }
          }
          if (layer.id.includes('water') && layer.type === 'fill') {
            map.setPaintProperty(layer.id, 'fill-color', '#b8d4e3');
          }
          if (layer.type === 'symbol') {
            try { map.setPaintProperty(layer.id, 'text-color', theme.text || '#2c2c2c'); } catch (err) {}
          }
        });
      } catch (err) {}
    }

    const mapSection = document.getElementById('mapSection');
    const accentColor = theme.accent || fallbackColor;
    mapSection.style.background = hexToRgba(accentColor, 0.06);
    mapSection.classList.add('themed');
  }

  function removeTheme({ map, maptilerKey, originalPaintValues }) {
    const root = document.documentElement;
    root.style.removeProperty('--theme-accent');
    root.style.removeProperty('--theme-route');

    if (maptilerKey !== 'GET_YOUR_FREE_KEY_AT_MAPTILER_COM') {
      try {
        const layers = map.getStyle().layers || [];
        layers.forEach((layer) => {
          if (originalPaintValues[layer.id]) {
            const orig = originalPaintValues[layer.id];
            if (layer.type === 'background' && orig['background-color']) {
              map.setPaintProperty(layer.id, 'background-color', orig['background-color']);
            }
            if (layer.type === 'fill' && orig['fill-color']) {
              map.setPaintProperty(layer.id, 'fill-color', orig['fill-color']);
            }
            if (layer.type === 'symbol' && orig['text-color']) {
              try { map.setPaintProperty(layer.id, 'text-color', orig['text-color']); } catch (err) {}
            }
          }
        });
      } catch (err) {}
    }

    const mapSection = document.getElementById('mapSection');
    mapSection.style.background = '';
    mapSection.classList.remove('themed');
  }

  window.CulturalMapExperienceModel = {
    resolveStops,
    removeCorridorMapLayers,
    applyTheme,
    removeTheme
  };
})();
