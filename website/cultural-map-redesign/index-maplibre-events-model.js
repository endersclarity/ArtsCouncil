(function() {
  'use strict';

  function choosePreferredEventAssetIndex(data, indices) {
    const categoryPriority = {
      'Performance Spaces': 0,
      'Arts Organizations': 1,
      'Fairs & Festivals': 2,
      'Galleries & Museums': 3,
      'Preservation & Culture': 4,
      'Historic Landmarks': 5,
      'Cultural Resources': 6,
      'Public Art': 7,
      'Eat, Drink & Stay': 8,
      'Walks & Trails': 9
    };

    return indices
      .slice()
      .sort((a, b) => {
        const ac = data[a] && data[a].l ? data[a].l : '';
        const bc = data[b] && data[b].l ? data[b].l : '';
        const ap = Object.prototype.hasOwnProperty.call(categoryPriority, ac) ? categoryPriority[ac] : 99;
        const bp = Object.prototype.hasOwnProperty.call(categoryPriority, bc) ? categoryPriority[bc] : 99;
        if (ap !== bp) return ap - bp;
        return a - b;
      })[0];
  }

  function buildVenueEventIndex({
    data,
    eventIndex,
    events,
    makeEventVenueKey,
    parseEventDate
  }) {
    const matchedEventsByAsset = new Map();
    const unmatchedEvents = [];

    const byPid = new Map();
    const byKey = new Map();

    data.forEach((asset, idx) => {
      if (asset && typeof asset.pid === 'string' && asset.pid.trim()) {
        if (!byPid.has(asset.pid)) byPid.set(asset.pid, []);
        byPid.get(asset.pid).push(idx);
      }
      const key = makeEventVenueKey(asset && asset.n, asset && asset.c);
      if (key !== '|') {
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key).push(idx);
      }
    });

    const sourceEvents = (eventIndex && Array.isArray(eventIndex.events))
      ? eventIndex.events
      : events;

    const normalized = [];
    sourceEvents.forEach((raw) => {
      if (!raw || typeof raw !== 'object') return;
      const event = { ...raw };
      let matchedIdx = Number.isInteger(event.matched_asset_idx) ? event.matched_asset_idx : null;
      let matchMethod = event.match_method || 'none';

      if (matchedIdx === null) {
        const pid = event.venue_pid;
        if (typeof pid === 'string' && byPid.has(pid)) {
          matchedIdx = choosePreferredEventAssetIndex(data, byPid.get(pid));
          matchMethod = 'pid';
        } else {
          const key = makeEventVenueKey(event.venue_name, event.venue_city);
          if (byKey.has(key)) {
            matchedIdx = choosePreferredEventAssetIndex(data, byKey.get(key));
            matchMethod = 'name_city';
          }
        }
      }

      event.matched_asset_idx = matchedIdx;
      event.match_method = matchMethod;
      event.is_unmatched = matchedIdx === null;
      event._start_ts = parseEventDate(event.start_iso) ? parseEventDate(event.start_iso).getTime() : 0;
      event._end_ts = parseEventDate(event.end_iso) ? parseEventDate(event.end_iso).getTime() : 0;
      normalized.push(event);
    });

    normalized.sort((a, b) => {
      if (a._start_ts !== b._start_ts) return a._start_ts - b._start_ts;
      return String(a.event_id || '').localeCompare(String(b.event_id || ''));
    });

    normalized.forEach((event) => {
      if (Number.isInteger(event.matched_asset_idx)) {
        const idx = event.matched_asset_idx;
        if (!matchedEventsByAsset.has(idx)) matchedEventsByAsset.set(idx, []);
        matchedEventsByAsset.get(idx).push(event);
      } else {
        unmatchedEvents.push(event);
      }
    });

    return {
      events: normalized,
      matchedEventsByAsset,
      unmatchedEvents
    };
  }

  function getUpcomingEventsForAssetIdx({
    matchedEventsByAsset,
    assetIdx,
    isEventWithinDays,
    days
  }) {
    if (!Number.isInteger(assetIdx)) return [];
    const events = matchedEventsByAsset.get(assetIdx) || [];
    return events.filter((event) => isEventWithinDays(event, days));
  }

  function getEventCountForAsset14d({
    matchedEventsByAsset,
    assetIdx,
    isEventWithinDays,
    days
  }) {
    return getUpcomingEventsForAssetIdx({
      matchedEventsByAsset,
      assetIdx,
      isEventWithinDays,
      days
    }).length;
  }

  function getFilteredMapEvents({
    events,
    eventDateFilter,
    eventCategoryFilter,
    data,
    isEventUpcoming,
    isEventToday,
    isWeekendEvent,
    isEventWithinDays,
    eventWindowDays
  }) {
    let filtered = events.filter((event) => isEventUpcoming(event));

    if (eventDateFilter === 'today') {
      filtered = filtered.filter((event) => isEventToday(event));
    } else if (eventDateFilter === 'weekend') {
      filtered = filtered.filter((event) => isWeekendEvent(event));
    } else if (eventDateFilter === '14d') {
      filtered = filtered.filter((event) => isEventWithinDays(event, eventWindowDays));
    }

    if (eventCategoryFilter !== 'all') {
      filtered = filtered.filter((event) => {
        if (!Number.isInteger(event.matched_asset_idx)) return false;
        const asset = data[event.matched_asset_idx];
        return !!asset && asset.l === eventCategoryFilter;
      });
    }

    return filtered;
  }

  window.CulturalMapEventsModel = {
    buildVenueEventIndex,
    getUpcomingEventsForAssetIdx,
    getEventCountForAsset14d,
    getFilteredMapEvents
  };
})();
