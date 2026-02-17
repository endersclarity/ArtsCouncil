(function() {
  'use strict';

  var state = {
    focusableEls: [],
    focusTrapListener: null
  };

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupSearchToggle() {
    var toggle = qs('.mast-search-toggle');
    var wrap = qs('.mast-search-field');
    var input = qs('.mast-search-input');
    var close = qs('.mast-search-close');
    if (!toggle || !wrap || !input || !close) return;

    function openSearch() {
      wrap.hidden = false;
      wrap.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      setTimeout(function() {
        input.focus();
      }, 20);
    }

    function closeSearch() {
      wrap.classList.remove('is-open');
      wrap.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }

    toggle.addEventListener('click', function() {
      if (wrap.hidden) openSearch();
      else closeSearch();
    });

    close.addEventListener('click', closeSearch);

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && !wrap.hidden) closeSearch();
    });
  }

  function setupHamburger() {
    var overlay = qs('#hamburgerOverlay');
    var panel = qs('.hamburger-panel', overlay);
    var toggle = qs('.mast-hamburger');
    var close = qs('.hamburger-close', overlay);
    if (!overlay || !panel || !toggle || !close) return;

    function openMenu() {
      cloneCategoryGrid();
      overlay.hidden = false;
      requestAnimationFrame(function() {
        panel.classList.add('is-open');
      });
      toggle.setAttribute('aria-expanded', 'true');
      cacheFocusable(panel);
      if (state.focusableEls.length) {
        state.focusableEls[0].focus();
      }
      attachFocusTrap();
    }

    function closeMenu() {
      panel.classList.remove('is-open');
      overlay.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      detachFocusTrap();
      toggle.focus();
    }

    toggle.addEventListener('click', function() {
      if (overlay.hidden) openMenu();
      else closeMenu();
    });

    close.addEventListener('click', closeMenu);

    overlay.addEventListener('click', function(event) {
      if (event.target === overlay) closeMenu();
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && !overlay.hidden) closeMenu();
    });

    setupMapAction(closeMenu);
  }

  function cacheFocusable(root) {
    state.focusableEls = qsa(
      'a[href], button:not([disabled]), textarea, input, select, summary',
      root
    ).filter(function(el) {
      return !el.hasAttribute('hidden') && !el.getAttribute('aria-hidden');
    });
  }

  function attachFocusTrap() {
    detachFocusTrap();
    state.focusTrapListener = function(event) {
      if (event.key !== 'Tab' || !state.focusableEls.length) return;
      var first = state.focusableEls[0];
      var last = state.focusableEls[state.focusableEls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', state.focusTrapListener);
  }

  function detachFocusTrap() {
    if (!state.focusTrapListener) return;
    document.removeEventListener('keydown', state.focusTrapListener);
    state.focusTrapListener = null;
  }

  function cloneCategoryGrid() {
    var source = qs('#categoryGrid');
    var target = qs('#hamburgerCategoryGrid');
    if (!source || !target) return;

    if (!source.children.length) {
      target.innerHTML = '<p class="hamburger-empty">Categories are loading...</p>';
      return;
    }
    target.innerHTML = source.innerHTML;
  }

  function setupMapAction(onCloseMenu) {
    var mapSection = qs('#mapSection');
    if (!mapSection) return;

    document.addEventListener('click', function(event) {
      var trigger = event.target.closest('[data-nav-action="expand-map"]');
      if (!trigger) return;
      event.preventDefault();
      if (typeof onCloseMenu === 'function') onCloseMenu();
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMapExpanded(true);
    });

    var mapToggle = qs('#mapExpandToggle');
    if (mapToggle) {
      mapToggle.addEventListener('click', function() {
        var expanded = mapToggle.getAttribute('aria-expanded') === 'true';
        setMapExpanded(!expanded);
      });
    }
  }

  function setMapExpanded(expanded) {
    var wrap = qs('.adaptive-layout');
    var mapToggle = qs('#mapExpandToggle');
    var mapSection = qs('#mapSection');
    if (wrap && wrap.classList) {
      wrap.classList.toggle('map-zone--expanded', !!expanded);
    }
    if (mapToggle) {
      mapToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      mapToggle.textContent = expanded ? 'Map Expanded' : 'Expand Map';
    }
    if (expanded && mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ── Hero Photo Carousel ── */

  var carousel = {
    slides: [],
    current: 0,
    timer: null,
    INTERVAL: 6000
  };

  function initCarousel() {
    carousel.slides = qsa('.hero-slide');
    if (carousel.slides.length < 2) return;
    carousel.timer = setInterval(advanceSlide, carousel.INTERVAL);

    var wrap = qs('.hero-carousel');
    if (wrap) {
      wrap.addEventListener('mouseenter', pauseCarousel);
      wrap.addEventListener('mouseleave', resumeCarousel);
    }
  }

  function advanceSlide() {
    var prev = carousel.current;
    carousel.current = (carousel.current + 1) % carousel.slides.length;

    carousel.slides[prev].classList.remove('hero-slide--active');
    carousel.slides[prev].classList.add('hero-slide--exiting');

    carousel.slides[carousel.current].classList.remove('hero-slide--exiting');
    carousel.slides[carousel.current].classList.add('hero-slide--active');

    setTimeout(function () {
      carousel.slides[prev].classList.remove('hero-slide--exiting');
    }, 1300);
  }

  function pauseCarousel() {
    if (carousel.timer) { clearInterval(carousel.timer); carousel.timer = null; }
  }

  function resumeCarousel() {
    if (!carousel.timer && carousel.slides.length > 1) {
      carousel.timer = setInterval(advanceSlide, carousel.INTERVAL);
    }
  }

  /* ── Init ── */

  function init() {
    setupSearchToggle();
    setupHamburger();
    initCarousel();
  }

  window.CulturalMapPhotoCarousel = {
    init: init,
    pauseCarousel: pauseCarousel,
    resumeCarousel: resumeCarousel
  };
})();
