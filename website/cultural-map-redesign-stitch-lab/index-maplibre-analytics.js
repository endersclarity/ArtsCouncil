/**
 * CulturalMapAnalytics — Provider-agnostic analytics wrapper
 *
 * Wraps window.umami.track() with dedup throttle and graceful degradation.
 * If Umami is blocked by ad blockers or not loaded, all calls silently no-op.
 *
 * All events automatically include { session_hash } for cross-event attribution.
 *
 * Event Taxonomy (kebab-case feature:action):
 *   session:start      — Page load (once per load)        { referrer }
 *   page:section-visibility — Section scrolled into view  { section }
 *   category:filter    — Category pill clicked          { category }
 *   category:clear     — All/clear triggered             {}
 *   toggle:open-now    — Open Now toggled                { state: "on"|"off" }
 *   toggle:events-14d  — Events 14d toggled              { state: "on"|"off" }
 *   detail:open        — Detail panel opened             { category, name, city }
 *   experience:start   — Experience/corridor activated   { slug, title, type }
 *   experience:tour    — Auto-tour started               { slug }
 *   event:click        — Event card clicked              { title, venue }
 *   search:query       — Search with results             { query, results, zero_results }
 *   search:zero        — Search with no results          { query, zero_results }
 *   editorial:expand   — MUSE editorial toggled open     { title }
 *   outbound:website   — Website link clicked            { venue, url }
 *   outbound:phone     — Phone link clicked              { venue }
 *   outbound:directions — Directions link clicked        { venue }
 *   outbound:lodging-vrbo — VRBO CTA clicked             { url }
 *   lodging:card-click — Lodging card clicked            { name, city }
 *   deeplink:arrive    — Deep link detected on load      { type, value }
 *   chat:open          — Chat panel opened                {}
 *   chat:close         — Chat panel closed                {}
 *   chat:query-sent    — Chat query submitted             { query_length }
 *   chat:deeplink-click — Chat venue link clicked         { venue, pid }
 *   explore:search     — Directory search executed        { query, results_count }
 *   explore:card-expand — Directory card expanded         { name, category, city }
 *   trip:bookmark-add  — Place/event bookmarked           { name, source }
 *   trip:bookmark-remove — Bookmark removed               { name }
 *   trip:created       — New trip created via model        { title }
 *   trip:itinerary-generated — {{ITINERARY}} parsed       { title, stops, days }
 *   trip:shared        — Share URL copied to clipboard     { title, stops }
 *   trip:calendar-export — Calendar link clicked (trip)    { stop_name, trip_title }
 *   trip:make-it-mine  — Curated itinerary cloned         { itinerary_id, stops_added }
 */
(function() {
  'use strict';

  var THROTTLE_MS = 500;
  var _lastKeys = {};

  /**
   * Generate or retrieve a per-session hash for cross-event attribution.
   * Uses sessionStorage so the hash persists across page navigation but
   * resets when the tab/window is closed.
   */
  function _getSessionHash() {
    var key = 'gvnc_session_hash';
    var existing = sessionStorage.getItem(key);
    if (existing) return existing;
    var hash = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem(key, hash);
    return hash;
  }

  function _dedupKey(eventName, data) {
    return eventName + '|' + JSON.stringify(data || {});
  }

  /**
   * Track an analytics event with 500ms dedup throttle.
   * @param {string} eventName — kebab-case feature:action
   * @param {Object} [data] — event properties
   */
  function track(eventName, data) {
    if (!window.umami || typeof window.umami.track !== 'function') return;
    var key = _dedupKey(eventName, data);
    var now = Date.now();
    if (_lastKeys[key] && (now - _lastKeys[key]) < THROTTLE_MS) return;
    _lastKeys[key] = now;
    try {
      var payload = Object.assign({ session_hash: _getSessionHash() }, data || {});
      window.umami.track(eventName, payload);
    } catch (e) {
      // Silently ignore — analytics should never break the app
    }
  }

  /**
   * Append UTM parameters to an outbound URL.
   * @param {string} url — the original URL
   * @param {string} campaign — utm_campaign value (e.g., 'venue-detail', 'directions')
   * @returns {string} URL with UTM params appended
   */
  function tagOutboundUrl(url, campaign) {
    if (!url) return url;
    var sep = url.indexOf('?') >= 0 ? '&' : '?';
    return url + sep +
      'utm_source=exploregvnc' +
      '&utm_medium=referral' +
      '&utm_campaign=' + encodeURIComponent(campaign || 'general');
  }

  window.CulturalMapAnalytics = {
    track: track,
    tagOutboundUrl: tagOutboundUrl,
    getSessionHash: _getSessionHash
  };
})();
