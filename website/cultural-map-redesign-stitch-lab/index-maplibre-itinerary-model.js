(function() {
  'use strict';

  /**
   * CulturalMapItineraryModel
   * Pure data module for itinerary stop resolution, lookup, and map data extraction.
   * No DOM, no MapLibre, no external dependencies.
   */

  /**
   * Return the full itineraries array (consistent API surface).
   * @param {Array} itineraries - parsed itineraries.json array
   * @returns {Array}
   */
  function getAllItineraries(itineraries) {
    return itineraries || [];
  }

  /**
   * Find an itinerary by its id string.
   * @param {Array} itineraries - parsed itineraries.json array
   * @param {string} id - itinerary id (e.g. "perfect-day")
   * @returns {Object|null}
   */
  function getItineraryById(itineraries, id) {
    if (!itineraries || !id) return null;
    var target = String(id).toLowerCase();
    for (var i = 0; i < itineraries.length; i++) {
      if (itineraries[i].id && itineraries[i].id.toLowerCase() === target) {
        return itineraries[i];
      }
    }
    return null;
  }

  /**
   * Resolve all stops in an itinerary against the data.json asset array.
   * Uses exact case-insensitive match on stop.asset vs asset.n.
   * Returns a flat array of resolved stops with data, dayIndex, and dayLabel.
   * Unresolved stops are skipped with a console warning.
   *
   * @param {Object} itinerary - single itinerary object with days[].stops[]
   * @param {Array} data - parsed data.json array (assets with .n field)
   * @returns {Array} flat array of { ...stop, data: asset, dayIndex: number, dayLabel: string }
   */
  function resolveItineraryStops(itinerary, data) {
    var allStops = [];
    if (!itinerary || !itinerary.days || !data) return allStops;

    var days = itinerary.days;
    for (var dayIdx = 0; dayIdx < days.length; dayIdx++) {
      var day = days[dayIdx];
      var stops = day.stops || [];
      for (var stopIdx = 0; stopIdx < stops.length; stopIdx++) {
        var stop = stops[stopIdx];
        var assetName = String(stop.asset || '').toLowerCase();
        var match = null;

        for (var k = 0; k < data.length; k++) {
          if (data[k].n && data[k].n.toLowerCase() === assetName) {
            match = data[k];
            break;
          }
        }

        if (match) {
          allStops.push({
            asset: stop.asset,
            time: stop.time,
            duration: stop.duration,
            narrative: stop.narrative,
            tip: stop.tip || '',
            data: match,
            dayIndex: dayIdx,
            dayLabel: day.label || ('Day ' + (dayIdx + 1))
          });
        } else {
          console.warn('[ItineraryModel] Unresolved stop: "' + stop.asset + '" in itinerary "' + (itinerary.id || 'unknown') + '"');
        }
      }
    }

    return allStops;
  }

  /**
   * Get itinerary days with stop counts.
   * @param {Object} itinerary - single itinerary object
   * @returns {Array} array of { label, stopCount, stops }
   */
  function getItineraryDays(itinerary) {
    if (!itinerary || !itinerary.days) return [];
    var result = [];
    for (var i = 0; i < itinerary.days.length; i++) {
      var day = itinerary.days[i];
      result.push({
        label: day.label || ('Day ' + (i + 1)),
        stopCount: (day.stops || []).length,
        stops: day.stops || []
      });
    }
    return result;
  }

  /**
   * Flatten resolved stops into a map-friendly coordinate array.
   * Same shape the corridor-map module expects for route rendering.
   *
   * @param {Array} resolved - output of resolveItineraryStops
   * @returns {Array} array of { lng, lat, name, stopNumber }
   */
  function flattenStopsForMap(resolved) {
    if (!resolved) return [];
    var result = [];
    for (var i = 0; i < resolved.length; i++) {
      var stop = resolved[i];
      if (stop.data && typeof stop.data.x === 'number' && typeof stop.data.y === 'number') {
        result.push({
          lng: stop.data.x,
          lat: stop.data.y,
          name: stop.data.n,
          stopNumber: i + 1
        });
      }
    }
    return result;
  }

  window.CulturalMapItineraryModel = {
    getAllItineraries: getAllItineraries,
    getItineraryById: getItineraryById,
    resolveItineraryStops: resolveItineraryStops,
    getItineraryDays: getItineraryDays,
    flattenStopsForMap: flattenStopsForMap
  };

})();
