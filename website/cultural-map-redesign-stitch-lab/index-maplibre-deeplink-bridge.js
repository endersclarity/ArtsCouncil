(function() {
  'use strict';

  function normalizeName(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function findAssetName(name) {
    var target = normalizeName(name);
    if (!target) return '';

    var places = [];
    if (Array.isArray(window.__culturalMapData)) {
      places = window.__culturalMapData;
    } else if (window.CulturalMapConfig && Array.isArray(window.CulturalMapConfig.PLACES)) {
      places = window.CulturalMapConfig.PLACES;
    }

    for (var i = 0; i < places.length; i++) {
      var place = places[i];
      var placeName = String((place && (place.n || place.name)) || '');
      if (!placeName) continue;
      if (normalizeName(placeName) === target) return placeName;
    }

    for (var j = 0; j < places.length; j++) {
      var fuzzy = places[j];
      var fuzzyName = String((fuzzy && (fuzzy.n || fuzzy.name)) || '');
      if (!fuzzyName) continue;
      var normalized = normalizeName(fuzzyName);
      if (normalized.indexOf(target) >= 0 || target.indexOf(normalized) >= 0) return fuzzyName;
    }

    return name;
  }

  function fallbackNavigate(target) {
    var pid = String((target && target.pid) || '').trim();
    var name = String((target && target.name) || '').trim();
    if (!pid && !name) return { ok: false, reason: 'empty-target' };

    var params = new URLSearchParams(window.location.search || '');
    params.set('pid', pid || findAssetName(name));
    params.delete('idx');
    params.delete('muse');
    params.delete('event');
    history.pushState(null, '', window.location.pathname + '?' + params.toString() + (window.location.hash || ''));
    window.dispatchEvent(new PopStateEvent('popstate'));
    return { ok: true, target: { pid: params.get('pid') } };
  }

  function navigate(target) {
    var next = target || {};
    var normalizedTarget = {
      pid: String(next.pid || '').trim(),
      name: findAssetName(next.name || '')
    };

    if (window.CulturalMapDeepLink && typeof window.CulturalMapDeepLink.navigateFromChatAsset === 'function') {
      var result = window.CulturalMapDeepLink.navigateFromChatAsset(normalizedTarget);
      if (result && result.ok) return result;
    }

    return fallbackNavigate(normalizedTarget);
  }

  function handleBodyClick(event) {
    var link = event.target.closest('[data-asset-name]');
    if (!link) return;
    event.preventDefault();
    navigate({
      name: link.getAttribute('data-asset-name') || '',
      pid: link.getAttribute('data-pid') || ''
    });
  }

  function init() {
    document.body.addEventListener('click', handleBodyClick);
  }

  window.CulturalMapDeepLinkBridge = {
    init: init,
    navigate: navigate
  };
})();

