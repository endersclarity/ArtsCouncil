(function() {
  'use strict';

  function getEventsCarouselVisibleSlots() {
    if (window.matchMedia('(max-width: 600px)').matches) return 1;
    if (window.matchMedia('(max-width: 900px)').matches) return 2;
    return 3;
  }

  function getEventsCarouselStep(listEl) {
    const first = listEl ? listEl.querySelector('.map-event-item') : null;
    if (!first) return listEl ? listEl.clientWidth : 0;
    const styles = getComputedStyle(listEl);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return first.getBoundingClientRect().width + gap;
  }

  function createEventsCarouselController(options = {}) {
    const listId = options.listId || 'mapEventsList';
    const pageId = options.pageId || 'mapEventsPage';
    const detailsId = options.detailsId || 'mapEventsDetails';
    const onPageIndexChange = typeof options.onPageIndexChange === 'function'
      ? options.onPageIndexChange
      : () => {};

    let rotateRaf = null;
    let rotateLastTs = 0;
    let resumeTimer = null;

    function getListEl() {
      return document.getElementById(listId);
    }

    function getPageEl() {
      return document.getElementById(pageId);
    }

    function isDetailsOpen() {
      const details = document.getElementById(detailsId);
      return !details || details.open;
    }

    function stop() {
      if (rotateRaf) {
        cancelAnimationFrame(rotateRaf);
        rotateRaf = null;
      }
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
      rotateLastTs = 0;
    }

    function updatePageLabel(totalCards) {
      const listEl = getListEl();
      const pageEl = getPageEl();
      if (!listEl || !pageEl) return;
      if (!totalCards) {
        pageEl.textContent = 'Spotlight 0 / 0';
        onPageIndexChange(0);
        return;
      }
      const step = getEventsCarouselStep(listEl);
      const idx = step > 0 ? Math.round(listEl.scrollLeft / step) : 0;
      const normalized = Math.max(0, Math.min(totalCards - 1, idx));
      onPageIndexChange(normalized);
      pageEl.textContent = `Spotlight ${normalized + 1} / ${totalCards}`;
    }

    function step(direction = 1, smooth = true) {
      const listEl = getListEl();
      if (!listEl) return false;
      const cards = listEl.querySelectorAll('.map-event-item');
      const totalCards = cards.length;
      const visibleSlots = getEventsCarouselVisibleSlots();
      if (totalCards <= visibleSlots) return false;

      const stepSize = getEventsCarouselStep(listEl);
      if (stepSize <= 0) return false;
      const maxLeft = Math.max(0, listEl.scrollWidth - listEl.clientWidth);
      if (maxLeft <= 1) return false;
      const current = listEl.scrollLeft;

      if (direction > 0) {
        if (current + stepSize >= maxLeft - 2) {
          listEl.scrollTo({ left: 0, behavior: 'auto' });
        } else {
          listEl.scrollTo({ left: current + stepSize, behavior: smooth ? 'smooth' : 'auto' });
        }
      } else if (current <= 2) {
        listEl.scrollTo({ left: maxLeft, behavior: 'auto' });
      } else {
        listEl.scrollTo({ left: Math.max(0, current - stepSize), behavior: smooth ? 'smooth' : 'auto' });
      }

      setTimeout(() => updatePageLabel(totalCards), smooth ? 420 : 0);
      return true;
    }

    function start(totalCards) {
      stop();
      if (totalCards <= getEventsCarouselVisibleSlots()) return;
      const listEl = getListEl();
      if (!listEl || !isDetailsOpen()) return;

      const speedPxPerSecond = 22;
      let lastLabelUpdate = 0;

      const tick = (ts) => {
        if (!isDetailsOpen()) {
          stop();
          return;
        }
        if (!rotateLastTs) rotateLastTs = ts;
        const dt = Math.min(0.05, (ts - rotateLastTs) / 1000);
        rotateLastTs = ts;

        const maxLeft = Math.max(0, listEl.scrollWidth - listEl.clientWidth);
        if (maxLeft <= 1) {
          stop();
          return;
        }

        let nextLeft = listEl.scrollLeft + speedPxPerSecond * dt;
        if (nextLeft >= maxLeft) nextLeft = 0;
        listEl.scrollLeft = nextLeft;

        if (ts - lastLabelUpdate >= 170) {
          updatePageLabel(totalCards);
          lastLabelUpdate = ts;
        }
        rotateRaf = requestAnimationFrame(tick);
      };

      rotateRaf = requestAnimationFrame(tick);
    }

    function queueResume(totalCards, delayMs = 520) {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        resumeTimer = null;
        start(totalCards);
      }, delayMs);
    }

    return {
      stop,
      queueResume,
      step,
      start,
      updatePageLabel
    };
  }

  window.CulturalMapEventsCarousel = {
    createEventsCarouselController,
    getEventsCarouselVisibleSlots,
    getEventsCarouselStep
  };
})();
