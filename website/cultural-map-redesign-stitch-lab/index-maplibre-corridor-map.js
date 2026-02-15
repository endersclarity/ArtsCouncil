(function() {
  'use strict';

  function getRouteCoordinates(resolved) {
    return (resolved || []).map((stop) => [stop.data.x, stop.data.y]);
  }

  function getStopsGeoJSON(resolved) {
    return {
      type: 'FeatureCollection',
      features: (resolved || []).map((stop) => ({
        type: 'Feature',
        properties: { order: stop.order, name: stop.data.n },
        geometry: { type: 'Point', coordinates: [stop.data.x, stop.data.y] }
      }))
    };
  }

  function addCorridorLayers({ map, routeCoords, stopsGeoJSON, routeColor, accentColor }) {
    map.addSource('corridor-route-glow', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoords } }
    });
    map.addLayer({
      id: 'corridor-route-glow',
      type: 'line',
      source: 'corridor-route-glow',
      paint: {
        'line-color': routeColor,
        'line-width': 10,
        'line-opacity': 0.12,
        'line-blur': 8
      }
    });

    map.addSource('corridor-route-animated', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [routeCoords[0]] } }
    });
    map.addLayer({
      id: 'corridor-route-animated',
      type: 'line',
      source: 'corridor-route-animated',
      paint: {
        'line-color': routeColor,
        'line-width': 3,
        'line-opacity': 0.75,
        'line-dasharray': [2, 3]
      }
    });

    map.addSource('corridor-stops', { type: 'geojson', data: stopsGeoJSON });

    map.addLayer({
      id: 'corridor-stops-glow',
      type: 'circle',
      source: 'corridor-stops',
      paint: {
        'circle-radius': 18,
        'circle-color': accentColor,
        'circle-opacity': 0.08
      }
    });

    map.addLayer({
      id: 'corridor-stops-main',
      type: 'circle',
      source: 'corridor-stops',
      paint: {
        'circle-radius': 8,
        'circle-color': accentColor,
        'circle-opacity': 0.9,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    });

    map.addLayer({
      id: 'corridor-stops-labels',
      type: 'symbol',
      source: 'corridor-stops',
      layout: {
        'text-field': ['to-string', ['get', 'order']],
        'text-size': 11,
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': accentColor,
        'text-halo-width': 8,
        'text-halo-blur': 0
      }
    });
  }

  function getCorridorBounds(resolved) {
    if (!resolved || resolved.length === 0) return null;
    return resolved.reduce((bounds, stop) => bounds.extend([stop.data.x, stop.data.y]),
      new maplibregl.LngLatBounds([resolved[0].data.x, resolved[0].data.y], [resolved[0].data.x, resolved[0].data.y])
    );
  }

  function animateRoute({ map, coordinates, duration, onFrameId }) {
    if (!coordinates || coordinates.length < 2) return;
    const line = turf.lineString(coordinates);
    const totalLength = turf.length(line, { units: 'kilometers' });
    if (totalLength === 0) return;

    const startTime = performance.now();
    function tick(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentLength = Math.max(totalLength * eased, 0.001);
      try {
        const sliced = turf.lineSliceAlong(line, 0, currentLength, { units: 'kilometers' });
        if (map.getSource('corridor-route-animated')) {
          map.getSource('corridor-route-animated').setData(sliced);
        }
      } catch (err) {}

      if (progress < 1) {
        onFrameId(requestAnimationFrame(tick));
      }
    }

    onFrameId(requestAnimationFrame(tick));
  }

  window.CulturalMapCorridorMap = {
    getRouteCoordinates,
    getStopsGeoJSON,
    addCorridorLayers,
    getCorridorBounds,
    animateRoute
  };
})();
