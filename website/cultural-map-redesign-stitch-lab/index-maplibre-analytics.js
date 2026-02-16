/**
 * CulturalMapAnalytics — Provider-agnostic analytics wrapper
 *
 * Wraps window.umami.track() with dedup throttle and graceful degradation.
 * If Umami is blocked by ad blockers or not loaded, all calls silently no-op.
 *
 * Event Taxonomy (kebab-case feature:action):
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
 *   deeplink:arrive    — Deep link detected on load      { type, value }
 */
(function() {
  'use strict';

  var THROTTLE_MS = 500;
  var _lastKeys = {};

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
      window.umami.track(eventName, data || {});
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
    tagOutboundUrl: tagOutboundUrl
  };
})();
