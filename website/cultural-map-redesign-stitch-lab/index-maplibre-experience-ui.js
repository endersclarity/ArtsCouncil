(function() {
  'use strict';

  function openExperienceSections(experienceType) {
    const guidesSection = document.getElementById('mapGuides');
    const corridorSection = document.getElementById('corridorAddon');
    const exploreSection = document.getElementById('experienceAddon');
    if (guidesSection) guidesSection.open = true;
    if (experienceType === 'corridor') {
      if (corridorSection) corridorSection.open = true;
    } else if (exploreSection) {
      exploreSection.open = true;
    }
  }

  function setActiveExperienceCard(slug) {
    document.querySelectorAll('.experience-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.slug === slug);
    });
  }

  function clearActiveExperienceCards() {
    document.querySelectorAll('.experience-card').forEach((card) => card.classList.remove('active'));
  }

  function startExperienceCardPulse({ gsap, previousTween, color }) {
    if (previousTween) previousTween.kill();
    const activeDot = document.querySelector('.experience-card.active .experience-card-dot');
    if (!activeDot) return null;
    return gsap.to(activeDot, {
      boxShadow: `0 0 14px ${color}`,
      scale: 1.2,
      duration: 0.7,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });
  }

  function clearExperienceCardPulse({ gsap, tween }) {
    if (tween) tween.kill();
    document.querySelectorAll('.experience-card-dot').forEach((dot) => {
      gsap.set(dot, { clearProps: 'all' });
    });
  }

  function hideCorridorPanel({ panelEl, gsap }) {
    if (!panelEl) return;
    gsap.to(panelEl, {
      opacity: 0, y: 12, duration: 0.3,
      onComplete: () => {
        panelEl.classList.remove('visible');
        panelEl.style.cssText = '';
      }
    });
  }

  window.CulturalMapExperienceUI = {
    openExperienceSections,
    setActiveExperienceCard,
    clearActiveExperienceCards,
    startExperienceCardPulse,
    clearExperienceCardPulse,
    hideCorridorPanel
  };
})();
