(function() {
  'use strict';

  const VENUE_STOP_WORDS = new Set([
    'the', 'and', 'for', 'with', 'from', 'into', 'onto', 'near', 'inside', 'outside',
    'at', 'in', 'on', 'of', 'to', 'by', 'via',
    'city', 'county', 'downtown',
    'street', 'st', 'road', 'rd', 'avenue', 'ave', 'blvd', 'boulevard', 'way', 'wy', 'drive', 'dr',
    'center', 'centre', 'hall', 'plaza', 'park', 'building'
  ]);

  function getInferredEventCategories(event) {
    const categories = new Set();
    const tagsText = Array.isArray(event && event.tags)
      ? event.tags.join(' ').toLowerCase()
      : '';
    const eventCategoryText = String(event && event.event_category || '').toLowerCase();
    const titleText = String(event && event.title || '').toLowerCase();
    const descriptionText = String(event && event.description || '').toLowerCase();
    const venueText = String(event && event.venue_name || '').toLowerCase();
    const text = `${tagsText} ${eventCategoryText} ${titleText} ${descriptionText} ${venueText}`.trim();
    if (!text) return categories;

    if (/(^|[^a-z])(fair|festival|gala|wild\s*&\s*scenic|wsff)([^a-z]|$)/.test(text)) categories.add('Fairs & Festivals');
    if (/(^|[^a-z])(music|concert|dance|theatre|theater|film|comedy|improv|spoken word|poetry)([^a-z]|$)/.test(text)) categories.add('Performance Spaces');
    if (/(^|[^a-z])(art|gallery|museum|visual|craft)([^a-z]|$)/.test(text)) categories.add('Galleries & Museums');
    if (/(^|[^a-z])(beer|wine|food|culinary)([^a-z]|$)/.test(text)) categories.add('Eat, Drink & Stay');
    if (/(^|[^a-z])(outdoors|recreation|trail|walk|hike)([^a-z]|$)/.test(text)) categories.add('Walks & Trails');
    if (/(^|[^a-z])(history|heritage|culture)([^a-z]|$)/.test(text)) categories.add('Preservation & Culture');
    if (/(^|[^a-z])(organization|facilit)([^a-z]|$)/.test(text)) categories.add('Arts Organizations');

    return categories;
  }

  function getEventCategorySet(event, data) {
    const categories = new Set();

    if (Number.isInteger(event && event.matched_asset_idx)) {
      const asset = data[event.matched_asset_idx];
      if (asset && typeof asset.l === 'string' && asset.l) categories.add(asset.l);
    }

    const primary = event && event.event_category;
    if (typeof primary === 'string' && primary) categories.add(primary);

    const list = event && event.event_categories;
    if (Array.isArray(list)) {
      list.forEach((cat) => {
        if (typeof cat === 'string' && cat) categories.add(cat);
      });
    }

    const inferred = getInferredEventCategories(event);
    inferred.forEach((cat) => categories.add(cat));

    return categories;
  }

  function tokenizeVenueName(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3 && !VENUE_STOP_WORDS.has(token));
  }

  function scoreVenueTokenOverlap(eventTokens, assetTokens) {
    if (!eventTokens.length || !assetTokens.length) return 0;
    const assetSet = new Set(assetTokens);
    let overlap = 0;
    let longest = 0;
    for (const token of eventTokens) {
      if (assetSet.has(token)) {
        overlap += 1;
        if (token.length > longest) longest = token.length;
      }
    }
    // Require stronger evidence than a short 1-token overlap.
    if (overlap >= 2) return overlap * 10 + longest;
    if (overlap === 1 && longest >= 4) return overlap * 10 + longest;
    return 0;
  }

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

  function normalizeSeriesToken(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function buildEventSeriesKey(event) {
    const title = normalizeSeriesToken(event && event.title);
    const venue = normalizeSeriesToken(event && event.venue_name);
    const city = normalizeSeriesToken(event && event.venue_city);
    return `${title}|${venue}|${city}`;
  }

  function dedupeRecurringEvents(events) {
    if (!Array.isArray(events) || events.length <= 1) return Array.isArray(events) ? events.slice() : [];

    const grouped = new Map();
    events.forEach((event) => {
      const key = buildEventSeriesKey(event);
      if (!key || key === '||') {
        const fallbackKey = `event:${normalizeSeriesToken(event && event.event_id) || 'unknown'}`;
        grouped.set(fallbackKey, [event]);
        return;
      }
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(event);
    });

    const collapsed = [];
    grouped.forEach((group) => {
      if (!group || !group.length) return;
      const sorted = group.slice().sort((a, b) => {
        if (a._start_ts !== b._start_ts) return a._start_ts - b._start_ts;
        return String(a.event_id || '').localeCompare(String(b.event_id || ''));
      });
      const first = { ...sorted[0] };
      const seriesCount = sorted.length;
      first.series_count = seriesCount;
      if (seriesCount > 1) {
        first.series_start_iso = sorted[0].start_iso || null;
        first.series_end_iso = sorted[seriesCount - 1].start_iso || null;
      }
      collapsed.push(first);
    });

    collapsed.sort((a, b) => {
      if (a._start_ts !== b._start_ts) return a._start_ts - b._start_ts;
      return String(a.event_id || '').localeCompare(String(b.event_id || ''));
    });

    return collapsed;
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
    const byCity = new Map();
    const assetNameTokensByIdx = data.map((asset) => tokenizeVenueName(asset && asset.n));

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

      const cityKey = makeEventVenueKey('', asset && asset.c).split('|')[1] || '';
      if (cityKey) {
        if (!byCity.has(cityKey)) byCity.set(cityKey, []);
        byCity.get(cityKey).push(idx);
      }
    });

    const canonicalEvents = Array.isArray(events) ? events.filter((event) => event && typeof event === 'object') : [];
    const indexedEvents = (eventIndex && Array.isArray(eventIndex.events))
      ? eventIndex.events.filter((event) => event && typeof event === 'object')
      : [];

    let sourceEvents = canonicalEvents;
    if (canonicalEvents.length > 0 && indexedEvents.length > 0) {
      const indexedById = new Map();
      indexedEvents.forEach((event) => {
        const id = typeof event.event_id === 'string' ? event.event_id.trim() : '';
        if (id) indexedById.set(id, event);
      });

      sourceEvents = canonicalEvents.map((event) => {
        const id = typeof event.event_id === 'string' ? event.event_id.trim() : '';
        if (!id || !indexedById.has(id)) return event;
        const indexed = indexedById.get(id);
        return {
          ...event,
          venue_pid: event.venue_pid || indexed.venue_pid || null,
          matched_asset_idx: Number.isInteger(indexed.matched_asset_idx) ? indexed.matched_asset_idx : null,
          match_method: indexed.match_method || null,
          match_confidence: indexed.match_confidence || null,
          match_status: indexed.match_status || null,
          event_category: indexed.event_category || event.event_category || null,
          event_categories: Array.isArray(indexed.event_categories) ? indexed.event_categories : (Array.isArray(event.event_categories) ? event.event_categories : null),
          is_unmatched: typeof indexed.is_unmatched === 'boolean' ? indexed.is_unmatched : null
        };
      });
    } else if (canonicalEvents.length === 0) {
      sourceEvents = indexedEvents;
    }

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
          } else {
            const cityKey = makeEventVenueKey('', event.venue_city).split('|')[1] || '';
            const candidateIdxs = byCity.get(cityKey) || [];
            const eventNameTokens = tokenizeVenueName(event.venue_name);
            let bestScore = 0;
            let bestIdxs = [];

            candidateIdxs.forEach((idx) => {
              const score = scoreVenueTokenOverlap(eventNameTokens, assetNameTokensByIdx[idx]);
              if (score <= 0) return;
              if (score > bestScore) {
                bestScore = score;
                bestIdxs = [idx];
                return;
              }
              if (score === bestScore) bestIdxs.push(idx);
            });

            if (bestIdxs.length > 0) {
              matchedIdx = choosePreferredEventAssetIndex(data, bestIdxs);
              matchMethod = 'name_city_fuzzy';
            }
          }
        }
      }

      event.matched_asset_idx = matchedIdx;
      event.match_method = matchMethod;
      event.match_status = matchedIdx === null ? 'needs_mapping' : 'mapped';
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
    eventWindowDays,
    dedupeRecurring = true
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
        const categories = getEventCategorySet(event, data);
        return categories.has(eventCategoryFilter);
      });
    }

    if (dedupeRecurring) {
      filtered = dedupeRecurringEvents(filtered);
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
