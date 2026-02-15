(function() {
  'use strict';

  function preloadWatercolors(categories) {
    const load = () => {
      Object.values(categories || {}).forEach((cfg) => {
        if (cfg.watercolor) {
          const img = new Image();
          img.src = `img/watercolor/${cfg.watercolor}.png`;
        }
      });
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(load);
    } else {
      setTimeout(load, 3000);
    }
  }

  function animateStats({ data, cats, gsap }) {
    if (!document.getElementById('stat-total')) return;
    const cities = new Set((data || []).map((d) => d.c).filter(Boolean));
    const targets = { total: 0, cats: 0, cities: 0 };
    gsap.to(targets, {
      total: (data || []).length,
      cats: Object.keys(cats || {}).length,
      cities: cities.size,
      duration: 1.5,
      ease: 'power2.out',
      delay: 1.2,
      onUpdate: () => {
        document.getElementById('stat-total').textContent = Math.round(targets.total);
        document.getElementById('stat-cats').textContent = Math.round(targets.cats);
        document.getElementById('stat-cities').textContent = Math.round(targets.cities);
      }
    });
  }

  function initScrollReveal({ gsap }) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.fromTo(entry.target,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
          );
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  window.CulturalMapPageEffects = {
    preloadWatercolors,
    animateStats,
    initScrollReveal
  };
})();
