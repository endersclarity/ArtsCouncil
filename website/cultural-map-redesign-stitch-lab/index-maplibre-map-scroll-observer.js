(function() {
  'use strict';

  var ZONES = {
    hero: 'map-zone--hero',
    editorial: 'map-zone--editorial',
    expanded: 'map-zone--expanded'
  };
  var currentZone = 'hero';
  var wrap = null;
  var observer = null;

  function setZone(zone) {
    if (zone === currentZone || !wrap) return;
    currentZone = zone;
    Object.values(ZONES).forEach(function(cls) { wrap.classList.remove(cls); });
    wrap.classList.add(ZONES[zone]);
    // Trigger map resize after transition
    setTimeout(function() {
      var mapEl = document.getElementById('map');
      if (mapEl && window.maplibregl) {
        var mapInstance = mapEl._maplibreMap || (window.CulturalMapInitModel && window.CulturalMapInitModel.getMap ? window.CulturalMapInitModel.getMap() : null);
        if (mapInstance && mapInstance.resize) {
          mapInstance.resize();
        }
      }
    }, 450);
  }

  function expandMap() {
    setZone('expanded');
    var mapEl = document.getElementById('map');
    if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function init() {
    wrap = document.querySelector('.adaptive-layout');
    if (!wrap || window.innerWidth < 900) return;

    var sentinels = wrap.querySelectorAll('.scroll-sentinel');
    if (!sentinels.length) return;

    observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var zone = entry.target.getAttribute('data-map-zone');
          if (zone && ZONES[zone]) setZone(zone);
        }
      });
    }, { rootMargin: '-10% 0px -40% 0px' });

    sentinels.forEach(function(s) { observer.observe(s); });
    setZone('hero');

    // Listen for window resize to disable on mobile
    window.addEventListener('resize', function() {
      if (window.innerWidth < 900) {
        wrap.classList.remove(ZONES.hero, ZONES.editorial, ZONES.expanded);
      }
    });
  }

  window.CulturalMapScrollObserver = {
    init: init,
    expandMap: expandMap,
    setZone: setZone
  };
})();
