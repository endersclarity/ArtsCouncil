/**
 * Haptic feedback for Arts Hub V2
 * Loads web-haptics from CDN, attaches to interactive elements via event delegation.
 * Silently no-ops on unsupported browsers (desktop, older devices).
 */

import('https://cdn.jsdelivr.net/npm/web-haptics@0.0.6/dist/index.mjs')
  .then(function (module) {
    var WebHaptics = module.default || module.WebHaptics || module;

    // Initialize — check what's available in the module export
    var haptics;
    try {
      if (typeof WebHaptics === 'function' && WebHaptics.prototype) {
        haptics = new WebHaptics();
      } else if (typeof WebHaptics === 'object' && typeof WebHaptics.trigger === 'function') {
        haptics = WebHaptics;
      } else {
        // Try to find the trigger function in the module
        var keys = Object.keys(module);
        for (var i = 0; i < keys.length; i++) {
          if (typeof module[keys[i]] === 'function') {
            haptics = module[keys[i]];
            break;
          }
        }
      }
    } catch (e) {
      // Haptics not supported — silent no-op
      return;
    }

    if (!haptics) return;

    // Helper to trigger a pattern safely
    function triggerHaptic(pattern) {
      try {
        if (typeof haptics.trigger === 'function') {
          haptics.trigger(pattern);
        } else if (typeof haptics === 'function') {
          haptics(pattern);
        }
      } catch (e) {
        // Silent fail
      }
    }

    // ─── EVENT DELEGATION ─────────────────────────────────────────────
    // One listener on document, pattern matched by element type/class

    document.addEventListener('click', function (e) {
      var target = e.target.closest(
        'button, .btn-subscribe, .v2-submit-btn, .category-pill, .v2-asset-pill, ' +
        '.v2-event-card, .v2-stories-card, .v2-stories-editorial, ' +
        '.v2-stories-hero-cta, .v2-story-back, .v2-event-share-btn, ' +
        '.nav-hamburger, .nav-mobile-overlay a, ' +
        '.v2-dir-card, .v2-share-bar a, .v2-share-bar button'
      );

      if (!target) return;

      // CTA buttons — strong success haptic
      if (target.matches('.btn-subscribe, .v2-submit-btn, .v2-stories-hero-cta')) {
        triggerHaptic('success');
        return;
      }

      // Filter pills — light tap
      if (target.matches('.category-pill, .v2-asset-pill')) {
        triggerHaptic('click');
        return;
      }

      // Cards — medium tap
      if (
        target.matches('.v2-event-card, .v2-stories-card, .v2-stories-editorial, .v2-dir-card') ||
        target.closest('.v2-event-card, .v2-stories-card, .v2-stories-editorial, .v2-dir-card')
      ) {
        triggerHaptic('click');
        return;
      }

      // Share buttons — light confirmation
      if (target.matches('.v2-event-share-btn, .v2-share-bar button')) {
        triggerHaptic('success');
        return;
      }

      // Nav hamburger — medium
      if (target.matches('.nav-hamburger') || target.closest('.nav-hamburger')) {
        triggerHaptic('click');
        return;
      }

      // Mobile nav links — light
      if (target.matches('.nav-mobile-overlay a')) {
        triggerHaptic('click');
        return;
      }

      // Any other button — default light tap
      if (target.matches('button')) {
        triggerHaptic('click');
        return;
      }
    });

    // ─── MAP DETAIL PANEL OPEN ────────────────────────────────────────
    // Watch for the detail panel opening (class change)
    var detailPanel = document.getElementById('detail-panel');
    if (detailPanel) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.attributeName === 'class' && detailPanel.classList.contains('open')) {
            triggerHaptic('success');
          }
        });
      });
      observer.observe(detailPanel, { attributes: true });
    }
  })
  .catch(function () {
    // CDN load failed or haptics not supported — silent no-op
  });
