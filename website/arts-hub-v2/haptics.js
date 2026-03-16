/**
 * Haptic feedback for Arts Hub V2
 * Loads web-haptics from CDN, attaches to interactive elements via event delegation.
 * Silently no-ops on unsupported browsers (desktop, older devices).
 */

import('https://cdn.jsdelivr.net/npm/web-haptics@0.0.6/dist/index.mjs')
  .then(function (module) {
    var WebHaptics = module.WebHaptics;
    if (!WebHaptics) return;

    var haptics = new WebHaptics();

    // Available presets: success, warning, error, light, medium, heavy, soft, rigid, selection, nudge, buzz

    document.addEventListener('click', function (e) {
      var target = e.target.closest(
        'button, a, .btn-subscribe, .v2-submit-btn, .category-pill, .v2-asset-pill, ' +
        '.v2-event-card, .v2-stories-card, .v2-stories-editorial, ' +
        '.v2-stories-hero-cta, .v2-story-back, .v2-event-share-btn, ' +
        '.nav-hamburger, .nav-mobile-overlay a, ' +
        '.v2-share-bar a, .v2-share-bar button, .dir-pill, .dir-az-btn, .dir-entry'
      );

      if (!target) return;

      // CTA buttons — strong
      if (target.matches('.btn-subscribe, .v2-submit-btn, .v2-stories-hero-cta')) {
        haptics.trigger('success');
        return;
      }

      // Filter pills — selection tap
      if (target.matches('.category-pill, .v2-asset-pill, .dir-pill, .dir-az-btn')) {
        haptics.trigger('selection');
        return;
      }

      // Share / copy — success
      if (target.matches('.v2-event-share-btn, .v2-share-bar button')) {
        haptics.trigger('light');
        return;
      }

      // Nav hamburger
      if (target.matches('.nav-hamburger') || target.closest('.nav-hamburger')) {
        haptics.trigger('medium');
        return;
      }

      // Any other interactive element — light tap
      haptics.trigger('light');
    });

    // Map detail panel open
    var detailPanel = document.getElementById('detail-panel');
    if (detailPanel) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.attributeName === 'class' && detailPanel.classList.contains('open')) {
            haptics.trigger('medium');
          }
        });
      });
      observer.observe(detailPanel, { attributes: true });
    }
  })
  .catch(function () {
    // CDN load failed or haptics not supported — silent no-op
  });
