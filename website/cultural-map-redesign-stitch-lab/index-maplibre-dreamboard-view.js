(function() {
  'use strict';

  var model = null;
  var cssInjected = false;
  var activeToastTimer = null;
  var activeToastEl = null;

  function getModel() {
    if (!model) model = window.CulturalMapDreamboardModel || {};
    return model;
  }

  /**
   * Render a bookmark button for a place (venue/asset).
   * @param {string} assetName - the asset name from data.json .n
   * @param {number} [size] - icon size in px (default 24)
   * @returns {string} HTML string
   */
  function renderBookmarkButton(assetName, size) {
    var s = size || 24;
    var m = getModel();
    var active = m.hasPlace ? m.hasPlace(assetName) : false;
    var escaped = String(assetName || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    var fillColor = active ? '#c8943e' : 'none';
    var strokeColor = active ? '#c8943e' : '#8a8278';
    var label = active ? 'Remove from trip' : 'Save to trip';
    return '<button class="bookmark-btn' + (active ? ' active' : '') + '" ' +
      'data-asset-name="' + escaped + '" ' +
      'aria-label="' + label + '" title="' + label + '" type="button">' +
      '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '">' +
      '<path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" ' +
      'fill="' + fillColor + '" stroke="' + strokeColor + '" stroke-width="2"/>' +
      '</svg></button>';
  }

  /**
   * Render a bookmark button for an event.
   * @param {string} title - event title
   * @param {string} date - event date (ISO string)
   * @param {number} [size] - icon size in px (default 24)
   * @returns {string} HTML string
   */
  function renderEventBookmarkButton(title, date, size) {
    var s = size || 24;
    var m = getModel();
    var active = m.hasEvent ? m.hasEvent(title, date) : false;
    var escapedTitle = String(title || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    var escapedDate = String(date || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    var fillColor = active ? '#c8943e' : 'none';
    var strokeColor = active ? '#c8943e' : '#8a8278';
    var label = active ? 'Remove from trip' : 'Save to trip';
    return '<button class="event-bookmark-btn' + (active ? ' active' : '') + '" ' +
      'data-event-title="' + escapedTitle + '" ' +
      'data-event-date="' + escapedDate + '" ' +
      'aria-label="' + label + '" title="' + label + '" type="button">' +
      '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '">' +
      '<path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" ' +
      'fill="' + fillColor + '" stroke="' + strokeColor + '" stroke-width="2"/>' +
      '</svg></button>';
  }

  /**
   * Show a toast notification at the bottom center of the viewport.
   * Auto-dismisses after 3 seconds. Supports an undo callback.
   * @param {string} message - the message text
   * @param {Function} [undoCallback] - if provided, shows an "Undo" link
   */
  function showToast(message, undoCallback) {
    // Remove existing toast
    if (activeToastEl && activeToastEl.parentNode) {
      activeToastEl.parentNode.removeChild(activeToastEl);
    }
    if (activeToastTimer) {
      clearTimeout(activeToastTimer);
      activeToastTimer = null;
    }

    var toast = document.createElement('div');
    toast.className = 'dreamboard-toast';
    var html = '<span class="dreamboard-toast-msg">' + message + '</span>';
    if (typeof undoCallback === 'function') {
      html += ' <button class="dreamboard-toast-undo" type="button">Undo</button>';
    }
    toast.innerHTML = html;
    document.body.appendChild(toast);
    activeToastEl = toast;

    // Wire undo
    if (typeof undoCallback === 'function') {
      var undoBtn = toast.querySelector('.dreamboard-toast-undo');
      if (undoBtn) {
        undoBtn.addEventListener('click', function() {
          undoCallback();
          dismissToast(toast);
        });
      }
    }

    // Animate in with GSAP if available, otherwise simple show
    var gsap = window.gsap;
    if (gsap) {
      gsap.fromTo(toast,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }
      );
    } else {
      toast.style.opacity = '1';
    }

    // Auto-dismiss after 3 seconds
    activeToastTimer = setTimeout(function() {
      dismissToast(toast);
    }, 3000);
  }

  function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    var gsap = window.gsap;
    if (gsap) {
      gsap.to(toast, {
        opacity: 0, y: 10, duration: 0.2,
        onComplete: function() {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }
      });
    } else {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }
    if (activeToastEl === toast) {
      activeToastEl = null;
      activeToastTimer = null;
    }
  }

  /**
   * Update the "My Trip" badge count in the nav bar.
   * Shows/hides the badge based on item count.
   */
  function updateBadge() {
    var m = getModel();
    var count = m.getItemCount ? m.getItemCount() : 0;
    var badges = document.querySelectorAll('.trip-badge');
    for (var i = 0; i < badges.length; i++) {
      var badge = badges[i];
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = '';
        // Pulse animation on increment
        var gsap = window.gsap;
        if (gsap) {
          gsap.fromTo(badge,
            { scale: 1 },
            { scale: 1.25, duration: 0.15, ease: 'back.out',
              onComplete: function() { gsap.to(badge, { scale: 1, duration: 0.15 }); }
            }
          );
        }
      } else {
        badge.style.display = 'none';
        badge.textContent = '0';
      }
    }
  }

  /**
   * Render the first-use "Save to Trip" label.
   * Returns empty string if user has already bookmarked something.
   * @returns {string} HTML string
   */
  function renderFirstUseLabel() {
    if (localStorage.getItem('ncac-bookmark-seen') === '1') return '';
    return '<span class="bookmark-first-use-label">Save to Trip</span>';
  }

  /**
   * Mark first-use as seen.
   */
  function markFirstUseSeen() {
    localStorage.setItem('ncac-bookmark-seen', '1');
    // Hide any visible first-use labels
    var labels = document.querySelectorAll('.bookmark-first-use-label');
    for (var i = 0; i < labels.length; i++) {
      labels[i].style.display = 'none';
    }
  }

  /**
   * Refresh all visible bookmark buttons to match current model state.
   * Called after undo or cross-tab sync.
   */
  function refreshAllBookmarkButtons() {
    var m = getModel();
    // Place bookmarks
    var btns = document.querySelectorAll('.bookmark-btn[data-asset-name]');
    for (var i = 0; i < btns.length; i++) {
      var name = btns[i].getAttribute('data-asset-name');
      var active = m.hasPlace ? m.hasPlace(name) : false;
      updateButtonVisual(btns[i], active);
    }
    // Event bookmarks
    var evBtns = document.querySelectorAll('.event-bookmark-btn[data-event-title]');
    for (var j = 0; j < evBtns.length; j++) {
      var title = evBtns[j].getAttribute('data-event-title');
      var date = evBtns[j].getAttribute('data-event-date');
      var evActive = m.hasEvent ? m.hasEvent(title, date) : false;
      updateButtonVisual(evBtns[j], evActive);
    }
  }

  /**
   * Update a single bookmark button's visual state.
   */
  function updateButtonVisual(btn, active) {
    var path = btn.querySelector('path');
    if (path) {
      path.setAttribute('fill', active ? '#c8943e' : 'none');
      path.setAttribute('stroke', active ? '#c8943e' : '#8a8278');
    }
    if (active) {
      btn.classList.add('active');
      btn.setAttribute('aria-label', 'Remove from trip');
      btn.setAttribute('title', 'Remove from trip');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-label', 'Save to trip');
      btn.setAttribute('title', 'Save to trip');
    }
  }

  /**
   * Inject CSS for bookmark buttons, toast, and badge into <head>.
   * Safe to call multiple times (no-ops after first).
   */
  function injectCSS() {
    if (cssInjected) return;
    cssInjected = true;
    var style = document.createElement('style');
    style.id = 'dreamboard-styles';
    style.textContent = [
      /* Bookmark button */
      '.bookmark-btn, .event-bookmark-btn {',
      '  cursor: pointer; background: none; border: none; padding: 4px;',
      '  display: inline-flex; align-items: center; justify-content: center;',
      '  transition: transform 0.2s ease; vertical-align: middle; position: relative; z-index: 2;',
      '}',
      '.bookmark-btn:hover, .event-bookmark-btn:hover { transform: scale(1.15); }',
      '.bookmark-btn svg path, .event-bookmark-btn svg path { transition: fill 0.2s ease, stroke 0.2s ease; }',

      /* Card-level bookmark positioning */
      '.card-bookmark-wrap {',
      '  position: absolute; top: 8px; right: 8px; z-index: 3;',
      '}',

      /* First-use label */
      '.bookmark-first-use-label {',
      '  font-family: "DM Sans", sans-serif; font-size: 0.72rem; color: #8a8278;',
      '  margin-left: 4px; white-space: nowrap;',
      '}',

      /* Toast */
      '.dreamboard-toast {',
      '  position: fixed; bottom: 60px; left: 50%; transform: translateX(-50%);',
      '  background: rgba(26,22,18,0.92); color: #fff; padding: 0.65rem 1.2rem;',
      '  border-radius: 8px; font-family: "DM Sans", sans-serif; font-size: 0.85rem;',
      '  display: flex; align-items: center; gap: 0.75rem; z-index: 9999;',
      '  box-shadow: 0 4px 16px rgba(0,0,0,0.25); max-width: 90vw;',
      '}',
      '@media (max-width: 600px) {',
      '  .dreamboard-toast { left: 1rem; right: 1rem; transform: none; width: auto; }',
      '}',
      '.dreamboard-toast-undo {',
      '  background: none; border: none; color: #c8943e; cursor: pointer;',
      '  font-family: "DM Sans", sans-serif; font-size: 0.85rem; font-weight: 600;',
      '  padding: 0; text-decoration: underline;',
      '}',
      '.dreamboard-toast-undo:hover { color: #e0a94a; }',

      /* Nav badge */
      '.trip-nav-link { position: relative; }',
      '.trip-badge {',
      '  display: inline-flex; align-items: center; justify-content: center;',
      '  background: #c8943e; color: #fff; border-radius: 50%;',
      '  width: 18px; height: 18px; font-family: "DM Sans", sans-serif;',
      '  font-size: 0.68rem; font-weight: 700; line-height: 1;',
      '  position: absolute; top: -6px; right: -10px;',
      '}',

      /* Tooltip bookmark offset */
      '.tooltip-bookmark-wrap { display: inline-block; margin-left: 4px; vertical-align: middle; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  window.CulturalMapDreamboardView = {
    renderBookmarkButton: renderBookmarkButton,
    renderEventBookmarkButton: renderEventBookmarkButton,
    showToast: showToast,
    updateBadge: updateBadge,
    renderFirstUseLabel: renderFirstUseLabel,
    markFirstUseSeen: markFirstUseSeen,
    refreshAllBookmarkButtons: refreshAllBookmarkButtons,
    updateButtonVisual: updateButtonVisual,
    injectCSS: injectCSS
  };
})();
