(function() {
  'use strict';

  // ============================================================
  // CONFIG
  // ============================================================
  const cfg = window.CulturalMapConfig || {};
  const coreUtils = window.CulturalMapCoreUtils || {};
  const MAPTILER_KEY = cfg.MAPTILER_KEY || 'GET_YOUR_FREE_KEY_AT_MAPTILER_COM';
  const ICONS = cfg.ICONS || {};
  const CATS = cfg.CATS || {};
  const hexToRgba = coreUtils.hexToRgba;
  const escapeHTML = coreUtils.escapeHTML;
  const sanitizeCountyOutline = coreUtils.sanitizeCountyOutline;
  const parseDeepLinkSearch = coreUtils.parseDeepLinkSearch;
  const serializeDeepLinkSearch = coreUtils.serializeDeepLinkSearch;
  const eventsUtils = window.CulturalMapEventsUtils || {};
  const eventsModel = window.CulturalMapEventsModel || {};
  const eventsCarousel = window.CulturalMapEventsCarousel || {};
  const eventsView = window.CulturalMapEventsView || {};
  const eventsSearch = window.CulturalMapEventsSearch || {};
  const eventsFilterUI = window.CulturalMapEventsFilterUI || {};
  const eventsController = window.CulturalMapEventsController || {};
  const hoursUtils = window.CulturalMapHoursUtils || {};
  const exploreModel = window.CulturalMapExploreModel || {};
  const exploreView = window.CulturalMapExploreView || {};
  const exploreControllerModule = window.CulturalMapExploreController || {};
  const filterUI = window.CulturalMapFilterUI || {};
  const filterStateModel = window.CulturalMapFilterStateModel || {};
  const mapFilterModel = window.CulturalMapMapFilterModel || {};
  const mapStyleModel = window.CulturalMapMapStyleModel || {};
  const mapInteractionModel = window.CulturalMapMapInteractionModel || {};
  const mapInitModel = window.CulturalMapMapInitModel || {};
  // Optional: the site can run without geolocation support. When the module is
  // present, we use it; otherwise we fall back to no-op helpers.
  const geolocationModel = window.CulturalMapGeolocationModel || {
    getGeolocateControlOptions: () => ({}),
    shouldAutoTriggerGeolocation: () => false,
    autoTriggerGeolocation: () => false,
    distanceMiles: () => null,
    formatDistanceMiles: () => '',
    compareDistanceMiles: () => 0
  };
  const mapDataModel = window.CulturalMapMapDataModel || {};
  const mapRenderController = window.CulturalMapMapRenderController || {};
  const mapLabelControllerModule = window.CulturalMapMapLabelController || {};
  const assetLayerDefs = window.CulturalMapAssetLayerDefs || {};
  const assetInteractions = window.CulturalMapAssetInteractions || {};
  const catalogView = window.CulturalMapCatalogView || {};
  const experienceModel = window.CulturalMapExperienceModel || {};
  const corridorMap = window.CulturalMapCorridorMap || {};
  const tourUtils = window.CulturalMapTourUtils || {};
  const experienceView = window.CulturalMapExperienceView || {};
  const experienceUI = window.CulturalMapExperienceUI || {};
  const experienceControllerModule = window.CulturalMapExperienceController || {};
  const detailView = window.CulturalMapDetailView || {};
  const detailController = window.CulturalMapDetailController || {};
  const pageEffects = window.CulturalMapPageEffects || {};
  const bindings = window.CulturalMapBindings || {};
  const normalizeEventToken = eventsUtils.normalizeEventToken;
  const makeEventVenueKey = eventsUtils.makeEventVenueKey;
  const parseEventDate = eventsUtils.parseEventDate;
  const isEventUpcoming = eventsUtils.isEventUpcoming;
  const isEventWithinDays = eventsUtils.isEventWithinDays;
  const isWeekendEvent = (event) => (eventsUtils.isWeekendEvent || (() => false))(event, PACIFIC_TZ);
  const isEventToday = (event) => (eventsUtils.isEventToday || (() => false))(event, PACIFIC_TZ);
  const formatEventDateRange = (event) => (eventsUtils.formatEventDateRange || (() => 'Schedule pending'))(event, PACIFIC_TZ);
  const getEventDisplayDescription = eventsUtils.getEventDisplayDescription;
  const getHoursState = (venue) => (hoursUtils.getHoursState || (() => 'unknown'))(venue, PACIFIC_TZ);
  const getHoursLabel = hoursUtils.getHoursLabel || (() => 'Hours unknown');
  const getHoursRank = hoursUtils.getHoursRank || (() => 2);
  const getTodayHoursDisplay = (venue) => (hoursUtils.getTodayHoursDisplay || (() => null))(venue, PACIFIC_TZ);
  function assertValues(values, errorMessage) {
    if (values.some((value) => !value)) throw new Error(errorMessage);
  }

  function assertModuleMethods(moduleRef, methods, errorMessage) {
    if (!moduleRef || methods.some((method) => typeof moduleRef[method] !== 'function')) {
      throw new Error(errorMessage);
    }
  }

  assertValues(
    [hexToRgba, escapeHTML, sanitizeCountyOutline, parseDeepLinkSearch, serializeDeepLinkSearch],
    'Missing CulturalMapCoreUtils. Ensure index-maplibre-core-utils.js loads before index-maplibre.js'
  );
  assertValues(
    [normalizeEventToken, makeEventVenueKey, parseEventDate, isEventUpcoming, isEventWithinDays, getEventDisplayDescription],
    'Missing CulturalMapEventsUtils. Ensure index-maplibre-events-utils.js loads before index-maplibre.js'
  );
  assertModuleMethods(eventsModel, ['buildVenueEventIndex', 'getUpcomingEventsForAssetIdx', 'getEventCountForAsset14d', 'getFilteredMapEvents'], 'Missing CulturalMapEventsModel. Ensure index-maplibre-events-model.js loads before index-maplibre.js');
  assertModuleMethods(eventsCarousel, ['createEventsCarouselController', 'getEventsCarouselVisibleSlots', 'getEventsCarouselStep'], 'Missing CulturalMapEventsCarousel. Ensure index-maplibre-events-carousel.js loads before index-maplibre.js');
  assertModuleMethods(eventsView, ['getEventsCategoryOptionsHTML', 'getEventsScopeLabel', 'getEventsCardsHTML', 'getEventsRowsHTML'], 'Missing CulturalMapEventsView. Ensure index-maplibre-events-view.js loads before index-maplibre.js');
  assertModuleMethods(eventsSearch, ['getSearchMatchedEvents', 'getSearchEventMatchesHTML'], 'Missing CulturalMapEventsSearch. Ensure index-maplibre-events-search.js loads before index-maplibre.js');
  assertModuleMethods(eventsFilterUI, ['updateMapEventsFilterUI', 'buildMapEventsCategorySelect', 'updateMapEventsCategoryUI', 'normalizeEventCategoryFilter'], 'Missing CulturalMapEventsFilterUI. Ensure index-maplibre-events-filter-ui.js loads before index-maplibre.js');
  assertModuleMethods(eventsController, ['buildMapEventsList', 'getDetailEventsHTML'], 'Missing CulturalMapEventsController. Ensure index-maplibre-events-controller.js loads before index-maplibre.js');
  assertModuleMethods(hoursUtils, ['getHoursState', 'getHoursLabel', 'getHoursRank', 'getTodayHoursDisplay'], 'Missing CulturalMapHoursUtils. Ensure index-maplibre-hours-utils.js loads before index-maplibre.js');
  assertModuleMethods(exploreModel, ['getFilteredData'], 'Missing CulturalMapExploreModel. Ensure index-maplibre-explore-model.js loads before index-maplibre.js');
  assertModuleMethods(exploreView, ['buildExploreCats', 'getExploreResultsText', 'createExploreItemElement'], 'Missing CulturalMapExploreView. Ensure index-maplibre-explore-view.js loads before index-maplibre.js');
  assertModuleMethods(exploreControllerModule, ['createExploreController'], 'Missing CulturalMapExploreController. Ensure index-maplibre-explore-controller.js loads before index-maplibre.js');
  assertModuleMethods(filterUI, ['buildFilterBar', 'buildMapLegend', 'syncMapFilterToggleMeta', 'renderOpenNowUI', 'renderEvents14dUI', 'syncCategoryPills', 'syncCategoryCards'], 'Missing CulturalMapFilterUI. Ensure index-maplibre-filter-ui.js loads before index-maplibre.js');
  assertModuleMethods(filterStateModel, ['computeNextCategories', 'getActiveBannerState'], 'Missing CulturalMapFilterStateModel. Ensure index-maplibre-filter-state-model.js loads before index-maplibre.js');
  assertModuleMethods(mapFilterModel, ['buildCombinedMapFilterExpr', 'getFitCandidates'], 'Missing CulturalMapMapFilterModel. Ensure index-maplibre-map-filter-model.js loads before index-maplibre.js');
  assertModuleMethods(mapStyleModel, ['getAssetPaintStyles', 'shouldShowMobileLabels'], 'Missing CulturalMapMapStyleModel. Ensure index-maplibre-map-style-model.js loads before index-maplibre.js');
  assertModuleMethods(mapInteractionModel, ['getVisibleAssetFeatureCount', 'getSmartLabelRenderPlan', 'pickIdlePreviewFeature'], 'Missing CulturalMapMapInteractionModel. Ensure index-maplibre-map-interaction-model.js loads before index-maplibre.js');
  assertModuleMethods(mapInitModel, ['getMapStyle', 'getMapInitOptions', 'getHoverPopupOptions'], 'Missing CulturalMapMapInitModel. Ensure index-maplibre-map-init-model.js loads before index-maplibre.js');
  // Geolocation module is optional; if it is missing, distance + location UI will be disabled/no-op.
  assertModuleMethods(mapDataModel, ['addCountyOutlineLayer', 'storeOriginalPaints', 'buildAssetsGeoJSON', 'refreshAssetSourceHoursStates', 'buildFeatureTooltipHTML'], 'Missing CulturalMapMapDataModel. Ensure index-maplibre-map-data-model.js loads before index-maplibre.js');
  assertModuleMethods(mapRenderController, ['applyAssetFilters', 'applyAssetPaintStyles', 'recenterAfterFilter'], 'Missing CulturalMapMapRenderController. Ensure index-maplibre-map-render-controller.js loads before index-maplibre.js');
  assertModuleMethods(mapLabelControllerModule, ['createMapLabelController'], 'Missing CulturalMapMapLabelController. Ensure index-maplibre-map-label-controller.js loads before index-maplibre.js');
  assertModuleMethods(assetLayerDefs, ['getAssetsCircleLayerDef', 'getAssetsHitLayerDef', 'getAssetsMobileLabelsLayerDef'], 'Missing CulturalMapAssetLayerDefs. Ensure index-maplibre-asset-layer-defs.js loads before index-maplibre.js');
  assertModuleMethods(assetInteractions, ['bindAssetInteractions'], 'Missing CulturalMapAssetInteractions. Ensure index-maplibre-asset-interactions.js loads before index-maplibre.js');
  assertModuleMethods(catalogView, ['buildExperienceSelector', 'buildCategoryGrid', 'getExperienceLayoutState'], 'Missing CulturalMapCatalogView. Ensure index-maplibre-catalog-view.js loads before index-maplibre.js');
  assertModuleMethods(experienceModel, ['resolveStops', 'removeCorridorMapLayers', 'applyTheme', 'removeTheme'], 'Missing CulturalMapExperienceModel. Ensure index-maplibre-experience-model.js loads before index-maplibre.js');
  assertModuleMethods(corridorMap, ['getRouteCoordinates', 'getStopsGeoJSON', 'addCorridorLayers', 'getCorridorBounds', 'animateRoute'], 'Missing CulturalMapCorridorMap. Ensure index-maplibre-corridor-map.js loads before index-maplibre.js');
  assertModuleMethods(tourUtils, ['getStopFlyToOptions', 'getMoveEndWaitTimeoutMs', 'getTourDwellMs', 'getTourEndFitOptions'], 'Missing CulturalMapTourUtils. Ensure index-maplibre-tour-utils.js loads before index-maplibre.js');
  assertModuleMethods(experienceView, ['getTourPopupHTML', 'buildCorridorPanel'], 'Missing CulturalMapExperienceView. Ensure index-maplibre-experience-view.js loads before index-maplibre.js');
  assertModuleMethods(experienceUI, ['openExperienceSections', 'setActiveExperienceCard', 'clearActiveExperienceCards', 'startExperienceCardPulse', 'clearExperienceCardPulse', 'hideCorridorPanel'], 'Missing CulturalMapExperienceUI. Ensure index-maplibre-experience-ui.js loads before index-maplibre.js');
  assertModuleMethods(experienceControllerModule, ['createExperienceController'], 'Missing CulturalMapExperienceController. Ensure index-maplibre-experience-controller.js loads before index-maplibre.js');
  assertModuleMethods(detailView, ['buildDetailHeroHTML', 'buildDetailTagHTML', 'buildDetailExperienceBadgesHTML', 'buildDetailMetaHTML', 'createDetailFlyToButton', 'openDetailPanel', 'closeDetailPanel'], 'Missing CulturalMapDetailView. Ensure index-maplibre-detail-view.js loads before index-maplibre.js');
  assertModuleMethods(detailController, ['openDetail', 'closeDetail'], 'Missing CulturalMapDetailController. Ensure index-maplibre-detail-controller.js loads before index-maplibre.js');
  assertModuleMethods(pageEffects, ['preloadWatercolors', 'animateStats', 'initScrollReveal'], 'Missing CulturalMapPageEffects. Ensure index-maplibre-page-effects.js loads before index-maplibre.js');
  assertModuleMethods(bindings, ['bindEvents'], 'Missing CulturalMapBindings. Ensure index-maplibre-bindings.js loads before index-maplibre.js');

  // ============================================================
  // STATE
  // ============================================================
  let DATA = [];
  let IMAGE_DATA = {};
  let EXPERIENCES = [];
  let MUSE_EDITORIALS = [];
  let MUSE_EDITORIALS_BY_ID = new Map();
  let MUSE_PLACES = [];
  let MUSE_PLACES_BY_ID = new Map();
  let EVENTS = [];
  let EVENT_INDEX = null;
  let COUNTY_OUTLINE = null;
  let map;
  let geolocateControl = null;
  let userLocationCoords = null;
  let geolocationStatus = 'idle';
  let activeCategories = new Set();
  let openNowMode = false;
  let events14dMode = false;
  let eventDateFilter = 'all';
  let eventCategoryFilter = 'all';
  let eventsListPage = 0;
  let suppressUrlSync = false;
  let deepLinkAppliedOnce = false;
  let lastFocusedAsset = null;
  let lastFocusedEventId = null;
  let lastFocusedMusePlaceId = null;
  const baseDocumentTitle = document.title;
  let exploreController = null;
  let mapFiltersExpanded = false;
  let mapLegendExpanded = false;
  let experienceController = null;
  let mapLabelController = null;
  let cardElements = [];
  let listPage = 0;
  const LIST_PAGE_SIZE = 30;
  const EVENT_WINDOW_DAYS = 14;
  const PACIFIC_TZ = 'America/Los_Angeles';
  let matchedEventsByAsset = new Map();
  let unmatchedEvents = [];
  const eventsCarouselController = eventsCarousel.createEventsCarouselController({
    onPageIndexChange: (idx) => {
      eventsListPage = idx;
    }
  });

  let originalPaintValues = {};

  // Hover popup
  let hoverPopup = null;
  let hoveredFeatureId = null;
  const LABEL_MAX_VISIBLE = 32;
  const LABEL_ALL_THRESHOLD = 16;
  const LABEL_SUBSET_COUNT = 12;
  const MOBILE_LABEL_MAX_VISIBLE = 46;
  const MOBILE_LABEL_MIN_ZOOM = 11.2;
  const MOBILE_LABEL_SIZE_BASE = 10;
  const MOBILE_LABEL_SIZE_LARGE = 13;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const smartLabelsEnabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ============================================================
  // LOAD DATA
  // ============================================================
  Promise.all([
    fetch('data.json').then(r => r.json()),
    fetch('image_data.json').then(r => r.json()).catch(() => ({})),
    fetch('experiences.json').then(r => r.json()).catch(() => []),
    fetch('muse_editorials.json').then((r) => (r.ok ? r.json() : [])).catch(() => []),
    fetch('muse_places.json').then((r) => (r.ok ? r.json() : [])).catch(() => []),
    fetch('events.json').then(r => r.json()).catch(() => []),
    fetch('events.index.json').then(r => r.json()).catch(() => null),
    fetch('nevada-county.geojson')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
  ]).then(([data, images, experiences, museEditorials, musePlaces, events, eventIndex, countyOutline]) => {
    DATA = data;
    IMAGE_DATA = images;
    EXPERIENCES = experiences;
    MUSE_EDITORIALS = Array.isArray(museEditorials) ? museEditorials : [];
    MUSE_EDITORIALS_BY_ID = new Map(
      MUSE_EDITORIALS
        .filter((e) => e && e.id)
        .map((e) => [String(e.id), e])
    );
    MUSE_PLACES = Array.isArray(musePlaces) ? musePlaces : [];
    MUSE_PLACES_BY_ID = new Map(
      MUSE_PLACES
        .filter((p) => p && p.id)
        .map((p) => [String(p.id), p])
    );
    EVENTS = Array.isArray(events) ? events : [];
    EVENT_INDEX = eventIndex;
    COUNTY_OUTLINE = sanitizeCountyOutline(countyOutline);
    buildVenueEventIndex();
    init();
  }).catch(err => {
    console.error('Failed to load data:', err);
  });

  function init() {
    animateStats();
    buildCategoryGrid();
    buildFilterBar();
    buildMapLegend();
    buildExperienceSelector();
    initMapLibre();
    exploreController = exploreControllerModule.createExploreController({
      data: DATA,
      cats: CATS,
      imageData: IMAGE_DATA,
      exploreModel,
      exploreView,
      eventsSearch,
      escapeHTML,
      formatEventDateRange,
      getFilteredMapEvents,
      getActiveCategories: () => activeCategories,
      getOpenNowMode: () => openNowMode,
      getEvents14dMode: () => events14dMode,
      getHoursState,
      getHoursRank,
      getEventCountForAsset14d,
      getHoursLabel,
      getDistanceMilesForAsset,
      getDistanceLabelForAsset,
      compareDistanceMiles: geolocationModel.compareDistanceMiles,
      setCategory,
      openDetail,
      getListPage: () => listPage,
      setListPage: (value) => { listPage = value; },
      listPageSize: LIST_PAGE_SIZE,
      eventWindowDays: EVENT_WINDOW_DAYS,
      gsap
    });
    buildExploreCats();
    buildList();
    buildMapEventsCategorySelect();
    buildMapEventsList();
    initScrollReveal();
    initMuseShowcase();
    bindEvents();
    preloadWatercolors();

    // Deep-linking: allow browser back/forward to restore URL-driven state.
    window.addEventListener('popstate', () => {
      // Map is already loaded at this point in normal flows; if not, load handler will apply once.
      applyDeepLinkFromLocation();
    });
  }

  // Preload watercolor images — deferred until browser is idle
  function preloadWatercolors() {
    pageEffects.preloadWatercolors(CATS);
  }

  // ============================================================
  // MUSE SHOWCASE (Editorials + deep links)
  // ============================================================
  let museStoryOverlayEl = null;
  let museStoryPanelEl = null;
  let museStoryOpenId = null;

  function initMuseShowcase() {
    renderMuseShowcaseSection();
    ensureMuseStoryPanel();
  }

  function ensureMuseStoryPanel() {
    if (museStoryOverlayEl && museStoryPanelEl) return;

    museStoryOverlayEl = document.createElement('div');
    museStoryOverlayEl.id = 'museStoryOverlay';
    museStoryOverlayEl.className = 'muse-story-overlay';
    museStoryOverlayEl.setAttribute('aria-hidden', 'true');

    museStoryPanelEl = document.createElement('div');
    museStoryPanelEl.id = 'museStoryPanel';
    museStoryPanelEl.className = 'muse-story-panel';
    museStoryPanelEl.setAttribute('aria-hidden', 'true');
    museStoryPanelEl.setAttribute('role', 'dialog');
    museStoryPanelEl.setAttribute('aria-modal', 'true');
    museStoryPanelEl.setAttribute('aria-label', 'MUSE story');

    museStoryPanelEl.innerHTML = `
      <button class="muse-story-close" type="button" aria-label="Close story">&times;</button>
      <div class="muse-story-content" id="museStoryContent"></div>
    `;

    document.body.appendChild(museStoryOverlayEl);
    document.body.appendChild(museStoryPanelEl);

    museStoryOverlayEl.addEventListener('click', closeMuseStory);
    museStoryPanelEl.querySelector('.muse-story-close')?.addEventListener('click', closeMuseStory);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && museStoryOpenId) closeMuseStory();
    });
  }

  function parseDeepLinkTargetFromUrl(url) {
    const raw = String(url || '');
    const qIndex = raw.indexOf('?');
    if (qIndex < 0) return {};
    const params = new URLSearchParams(raw.slice(qIndex + 1));
    const pid = params.get('pid');
    const muse = params.get('muse');
    const event = params.get('event');
    const idxRaw = params.get('idx');
    const idx = idxRaw !== null ? Number(idxRaw) : null;
    return {
      pid: pid ? String(pid) : null,
      muse: muse ? String(muse) : null,
      event: event ? String(event) : null,
      idx: Number.isInteger(idx) ? idx : null
    };
  }

  function pushDeepLinkTarget(target) {
    ensureMuseStoryPanel();
    const t = target || {};
    const base = getDeepLinkStateFromApp();
    const next = {
      ...base,
      pid: null,
      idx: null,
      muse: null,
      event: null
    };
    if (t.event) next.event = String(t.event);
    else if (t.muse) next.muse = String(t.muse);
    else if (t.pid) next.pid = String(t.pid);
    else if (Number.isInteger(t.idx)) next.idx = t.idx;

    const search = serializeDeepLinkSearch(next);
    history.pushState(null, '', `${location.pathname}${search}${location.hash || ''}`);
    applyDeepLinkFromLocation({ allowWhenNotLoaded: true });
  }

  function openMuseStory(id) {
    const key = String(id || '');
    if (!key) return;
    const editorial = MUSE_EDITORIALS_BY_ID.get(key);
    if (!editorial) return;

    ensureMuseStoryPanel();
    museStoryOpenId = key;

    const contentEl = museStoryPanelEl.querySelector('#museStoryContent');
    if (!contentEl) return;

    const cover = editorial.cover_image ? String(editorial.cover_image) : '';
    const eyebrow = editorial.eyebrow ? String(editorial.eyebrow) : 'From MUSE';
    const title = editorial.title ? String(editorial.title) : 'Untitled';
    const dek = editorial.dek ? String(editorial.dek) : '';
    const author = editorial.author ? String(editorial.author) : '';
    const issue = editorial.muse_issue ? String(editorial.muse_issue) : '';
    const heyzineUrl = editorial.heyzine_url ? String(editorial.heyzine_url) : '';

    const leadQuote = editorial.lead_quote || null;
    const leadText = leadQuote && leadQuote.text ? String(leadQuote.text) : '';
    const leadAttr = leadQuote && leadQuote.attribution ? String(leadQuote.attribution) : '';

    const quotes = Array.isArray(editorial.quotes) ? editorial.quotes : [];
    // Non-lead quotes must have context; otherwise they read like random factoids.
    const callouts = quotes
      .filter((q) => q && q.text && q.attribution && q.context)
      .slice(0, 3)
      .map((q) => ({
        text: String(q.text),
        attribution: String(q.attribution),
        context: String(q.context),
        target: q && q.target ? q.target : null
      }));

    const bodyParas = Array.isArray(editorial.body) ? editorial.body : [];
    const bodyHTML = bodyParas.length
      ? `<div class="muse-story-bodytext">${bodyParas.map((p) => `<p>${escapeHTML(String(p))}</p>`).join('')}</div>`
      : '';

    const leadHTML = leadText
      ? `
        <figure class="muse-story-lead">
          <blockquote>${escapeHTML(leadText)}</blockquote>
          ${leadAttr ? `<figcaption>${escapeHTML(leadAttr)}</figcaption>` : ''}
        </figure>
      `
      : '';

    const calloutsHTML = callouts.length
      ? `
        <div class="muse-story-callouts">
          ${callouts.map((q) => {
            const encodedTarget = q.target ? encodeURIComponent(JSON.stringify(q.target)) : '';
            return `
              <div class="muse-story-callout">
                <figure class="muse-story-quote">
                  <blockquote>${escapeHTML(q.text)}</blockquote>
                  <figcaption>${escapeHTML(q.attribution)}</figcaption>
                </figure>
                <div class="muse-story-quote-context">
                  <p>${escapeHTML(q.context)}</p>
                  ${q.target ? `<button class="muse-story-quote-link" type="button" data-target="${encodedTarget}">View on map</button>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `
      : '';

    const deepLinks = Array.isArray(editorial.deep_links) ? editorial.deep_links : [];
    const musePlaceIds = Array.isArray(editorial.related_muse_place_ids) ? editorial.related_muse_place_ids : [];

    const stops = [];
    deepLinks.forEach((l) => {
      const label = l && l.label ? String(l.label) : '';
      const url = l && l.url ? String(l.url) : '';
      const target = parseDeepLinkTargetFromUrl(url);
      if (!label) return;
      stops.push({ label, target, meta: 'On the map', url });
    });
	    musePlaceIds.forEach((placeId) => {
	      const place = findMusePlaceById(placeId);
	      const label = place && place.name ? String(place.name) : String(placeId || '');
	      if (!label) return;
	      stops.push({
	        label,
	        target: { muse: String(placeId) },
	        meta: 'On the map',
	        url: `index-maplibre.html?muse=${encodeURIComponent(String(placeId))}`
	      });
	    });

	    const stopsHTML = stops.length
	      ? `
	        <div class="muse-story-stops">
	          <div class="muse-story-stops-head">Places in this story</div>
	          <div class="muse-story-stops-grid">
	            ${stops.map((s) => {
	              const label = s.label ? String(s.label) : '';
	              const meta = s.meta ? String(s.meta) : '';
              const encoded = encodeURIComponent(JSON.stringify(s.target || {}));
              const url = s.url ? String(s.url) : '#';
              return `
                <a class="muse-story-stop" href="${escapeHTML(url)}" data-target="${encoded}">
                  <span class="muse-story-stop-label">${escapeHTML(label)}</span>
                  ${meta ? `<span class="muse-story-stop-meta">${escapeHTML(meta)}</span>` : ''}
                </a>
              `;
            }).join('')}
          </div>
        </div>
      `
      : '';

	    const readMoreHTML = heyzineUrl
	      ? `
	        <a class="muse-story-readmore" href="${escapeHTML(heyzineUrl)}" target="_blank" rel="noopener noreferrer">
	          Read the full original article (Heyzine)
	        </a>
	      `
	      : '';

    contentEl.innerHTML = `
      <div class="muse-story-hero" ${cover ? `style="--muse-cover: url('${escapeHTML(cover)}')"` : ''}>
        <div class="muse-story-hero-scrim"></div>
        <div class="muse-story-hero-inner">
          <div class="muse-story-eyebrow">${escapeHTML(eyebrow)}</div>
          <h2 class="muse-story-title">${escapeHTML(title)}</h2>
          ${dek ? `<p class="muse-story-dek">${escapeHTML(dek)}</p>` : ''}
          <div class="muse-story-meta">
            ${issue ? `<span>${escapeHTML(issue)}</span>` : ''}
            ${author ? `<span>${escapeHTML(author)}</span>` : ''}
          </div>
          ${readMoreHTML}
        </div>
      </div>
      <div class="muse-story-body">
        ${leadHTML}
        ${bodyHTML}
        ${calloutsHTML}
        ${stopsHTML}
      </div>
    `;

    contentEl.querySelectorAll('.muse-story-stop, .muse-story-quote-link').forEach((el) => {
      el.addEventListener('click', (ev) => {
        // Keep SPA behavior, but make stops shareable/copyable via href.
        if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
        const raw = el.getAttribute('data-target') || '';
        try {
          const target = JSON.parse(decodeURIComponent(raw));
          closeMuseStory();
          pushDeepLinkTarget(target);
        } catch (e) {
          // ignore
        }
      });
    });

    document.body.classList.add('muse-story-open');
    museStoryOverlayEl.setAttribute('aria-hidden', 'false');
    museStoryPanelEl.setAttribute('aria-hidden', 'false');
    museStoryOverlayEl.classList.add('is-open');
    museStoryPanelEl.classList.add('is-open');
  }

  function closeMuseStory() {
    museStoryOpenId = null;
    if (museStoryOverlayEl) {
      museStoryOverlayEl.setAttribute('aria-hidden', 'true');
      museStoryOverlayEl.classList.remove('is-open');
    }
    if (museStoryPanelEl) {
      museStoryPanelEl.setAttribute('aria-hidden', 'true');
      museStoryPanelEl.classList.remove('is-open');
    }
    document.body.classList.remove('muse-story-open');
  }

  function renderMuseShowcaseSection() {
    const section = document.querySelector('.muse-section');
    if (!section) return;
    if (!Array.isArray(MUSE_EDITORIALS) || !MUSE_EDITORIALS.length) return;

    const issue = MUSE_EDITORIALS[0] && MUSE_EDITORIALS[0].muse_issue ? String(MUSE_EDITORIALS[0].muse_issue) : "MUSE";
    const cardsHTML = MUSE_EDITORIALS.map((e) => {
      if (!e || !e.id) return '';
      const id = String(e.id);
      const cover = e.cover_image ? String(e.cover_image) : '';
      const eyebrow = e.eyebrow ? String(e.eyebrow) : 'From MUSE';
      const title = e.title ? String(e.title) : 'Untitled';
      const dek = e.dek ? String(e.dek) : '';
      const quote = e.lead_quote && e.lead_quote.text
        ? String(e.lead_quote.text)
        : '';
      return `
        <button class="muse-story-card" type="button" data-editorial-id="${escapeHTML(id)}">
          <div class="muse-story-card-media" ${cover ? `style="--muse-card-cover: url('${escapeHTML(cover)}')"` : ''}></div>
          <div class="muse-story-card-body">
            <div class="muse-story-card-eyebrow">${escapeHTML(eyebrow)}</div>
            <div class="muse-story-card-title">${escapeHTML(title)}</div>
            ${quote ? `<div class="muse-story-card-quote">${escapeHTML(quote)}</div>` : ''}
            ${dek ? `<div class="muse-story-card-dek">${escapeHTML(dek)}</div>` : ''}
            <div class="muse-story-card-cta">Open story</div>
          </div>
        </button>
      `;
    }).join('');

    section.innerHTML = `
      <div class="muse-section-header reveal">
        <div class="muse-section-tag">from ${escapeHTML(issue)}</div>
        <h2 class="muse-section-title">Stories that map to places</h2>
      </div>
      <div class="muse-showcase-row" role="list">
        ${cardsHTML}
      </div>
    `;

    if (!section.dataset.museBound) {
      section.dataset.museBound = '1';
      section.addEventListener('click', (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('.muse-story-card') : null;
        if (!btn) return;
        const id = btn.getAttribute('data-editorial-id') || '';
        openMuseStory(id);
      });
    }
  }

  // ============================================================
  // STATS COUNTER (GSAP)
  // ============================================================
  function animateStats() {
    pageEffects.animateStats({
      data: DATA,
      cats: CATS,
      gsap
    });
  }

  // ============================================================
  // UTILITY
  // ============================================================
  function resolveAssetIndex(venue) {
    let idx = DATA.indexOf(venue);
    if (idx >= 0) return idx;
    idx = DATA.findIndex((d) => d && venue && d.n === venue.n && d.c === venue.c && d.l === venue.l);
    return idx >= 0 ? idx : null;
  }

	  function getDeepLinkStateFromApp() {
	    const activeExp = experienceController ? experienceController.getActiveExperience() : null;
	    const cats = Array.from(activeCategories || []).map(String).sort((a, b) => a.localeCompare(b));

	    let pid = null;
	    let idx = null;
	    let event = lastFocusedEventId ? String(lastFocusedEventId) : null;
	    let muse = lastFocusedMusePlaceId ? String(lastFocusedMusePlaceId) : null;
	    if (!event && lastFocusedAsset) {
	      if (lastFocusedAsset.muse_place_id) {
	        muse = String(lastFocusedAsset.muse_place_id);
	      } else if (lastFocusedAsset.pid) {
	        pid = String(lastFocusedAsset.pid);
	      } else {
	        const resolved = resolveAssetIndex(lastFocusedAsset);
	        if (Number.isInteger(resolved) && resolved >= 0) idx = resolved;
	      }
	    }

	    return {
	      cats,
	      open: !!openNowMode,
	      events14d: !!events14dMode,
	      experience: activeExp && activeExp.slug ? String(activeExp.slug) : null,
	      muse,
	      pid,
	      idx,
	      event,
	      eventDate: eventDateFilter && eventDateFilter !== 'all' ? String(eventDateFilter) : null,
	      eventCat: eventCategoryFilter && eventCategoryFilter !== 'all' ? String(eventCategoryFilter) : null
	    };
	  }

	  function syncUrlFromApp({ replace = false } = {}) {
	    if (suppressUrlSync) return;
	    const state = getDeepLinkStateFromApp();
	    const search = serializeDeepLinkSearch({
	      cats: state.cats,
	      // Always include explicit on/off so the URL is a complete "remote control".
	      open: state.open,
	      events14d: state.events14d,
	      experience: state.experience,
	      muse: state.muse,
	      pid: state.muse ? null : state.pid,
	      idx: state.muse || state.pid ? null : state.idx,
	      event: state.event,
	      eventDate: state.eventDate,
	      eventCat: state.eventCat
	    });
    const url = `${location.pathname}${search}${location.hash || ''}`;
    const current = `${location.pathname}${location.search || ''}${location.hash || ''}`;
    if (url === current) return;
    const fn = replace ? history.replaceState : history.pushState;
    fn.call(history, null, '', url);
  }

  function syncDocumentTitleFromState() {
    if (lastFocusedAsset && lastFocusedAsset.n) {
      document.title = `${lastFocusedAsset.n} — The Culture of Nevada County`;
      return;
    }
    const activeExp = experienceController ? experienceController.getActiveExperience() : null;
    if (activeExp) {
      const label = activeExp.title || activeExp.name || activeExp.slug || 'Experience';
      document.title = `${label} — The Culture of Nevada County`;
      return;
    }
    document.title = baseDocumentTitle;
  }

  function findExperienceBySlug(slug) {
    const s = String(slug || '');
    if (!s) return null;
    return (EXPERIENCES || []).find((e) => e && e.slug === s) || null;
  }

  function findVenueByPid(pid) {
    const p = String(pid || '');
    if (!p) return null;
    return (DATA || []).find((v) => v && v.pid === p) || null;
  }

  function findVenueByIdx(idx) {
    const i = Number(idx);
    if (!Number.isInteger(i) || i < 0 || i >= (DATA || []).length) return null;
    return DATA[i] || null;
  }

  function findMusePlaceById(id) {
    const key = String(id || '');
    if (!key) return null;
    return MUSE_PLACES_BY_ID.get(key) || null;
  }

  function buildMusePseudoAsset(place) {
    if (!place || !place.id || !place.name) return null;
    const cat = place.category_guess && CATS[place.category_guess] ? String(place.category_guess) : 'Cultural Resources';
    const lat = Number(place.lat);
    const lng = Number(place.lng);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

    // Keep this compatible with `data.json`-style fields so the existing detail panel can render it.
    return {
      muse_place_id: String(place.id),
      n: String(place.name),
      l: cat,
      a: place.address_or_access ? String(place.address_or_access) : '',
      c: '',
      p: place.phone ? String(place.phone) : '',
      w: place.website ? String(place.website) : '',
      d: place.notes ? String(place.notes) : '',
      x: hasCoords ? lng : null,
      y: hasCoords ? lat : null,
      pid: place.pid ? String(place.pid) : null,
      h: null
    };
  }

  function focusMusePlaceById(id) {
    const place = findMusePlaceById(id);
    const asset = buildMusePseudoAsset(place);
    if (!asset) return;

    // For places without coordinates, still open the panel (but do not fly).
    document.getElementById('mapSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (Number.isFinite(Number(asset.x)) && Number.isFinite(Number(asset.y))) {
      map.flyTo({
        center: [asset.x, asset.y],
        zoom: Math.max(map.getZoom(), 13.5),
        pitch: Math.max(map.getPitch(), 48),
        bearing: map.getBearing(),
        duration: 850,
        essential: true
      });
    }
    openDetail(asset);
  }

  function applyDeepLinkFromLocation(options = {}) {
    const { allowWhenNotLoaded = false } = options || {};
    if (!map) return;
    // `map.loaded()` can be transiently false even during the map's `load` event in some MapLibre builds.
    // Allow the `load` handler to apply URL state regardless; other callers (popstate) should still guard.
    if (!allowWhenNotLoaded && (typeof map.loaded !== 'function' || !map.loaded())) return;
    const parsed = parseDeepLinkSearch(location.search);
	    const validCats = Array.from(new Set((parsed.cats || []).filter((c) => !!CATS[c])));
	    const openEnabled = parsed.open === '1';
	    const eventsEnabled = parsed.events14d === '1';
	    const expSlug = parsed.experience ? String(parsed.experience) : '';
	    const focusMuse = parsed.muse ? String(parsed.muse) : '';
	    const focusEvent = parsed.event ? String(parsed.event) : '';
	    const focusPid = parsed.pid ? String(parsed.pid) : '';
	    const focusIdx = parsed.idx;
    const eventDateAllowed = new Set(['all', 'today', 'weekend', '14d']);
    const nextEventDate = parsed.eventDate && eventDateAllowed.has(String(parsed.eventDate))
      ? String(parsed.eventDate)
      : 'all';
    const nextEventCat = parsed.eventCat ? String(parsed.eventCat) : 'all';

    suppressUrlSync = true;
    try {
      // Categories: set as a batch to avoid toggle behavior.
      activeCategories = new Set(validCats);
      filterUI.syncCategoryPills({ activeCategories });
      filterUI.syncCategoryCards({
        cardElements,
        activeCategories
      });

      // Toggles + derived UI
      setOpenNowMode(openEnabled);
      setEvents14dMode(eventsEnabled);
      renderOpenNowUI();
      renderEvents14dUI();

      updateActiveBanner();
      updateMapFilters({ recenter: false });
      listPage = 0;
      eventsListPage = 0;
      buildList();
      buildMapEventsList();

      // Events UI filters (always set so back/forward is deterministic)
      setEventDateFilter(nextEventDate);
      setEventCategoryFilter(nextEventCat);

      // Experience (URL is source of truth)
      if (expSlug) {
        const exp = findExperienceBySlug(expSlug);
        if (exp) activateExperience(exp);
      } else if (experienceController && experienceController.getActiveExperience()) {
        deactivateExperience();
      }

	      // Focus target (URL is source of truth)
	      if (focusEvent) {
	        focusEventById(focusEvent);
	      } else if (focusMuse) {
	        focusMusePlaceById(focusMuse);
	      } else {
	        let venue = focusPid ? findVenueByPid(focusPid) : null;
	        if (!venue && focusIdx !== null && focusIdx !== undefined) {
	          venue = findVenueByIdx(Number(focusIdx));
	        }
        if (venue) {
          document.getElementById('mapSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          map.flyTo({
            center: [venue.x, venue.y],
            zoom: Math.max(map.getZoom(), 14),
            pitch: Math.max(map.getPitch(), 48),
            bearing: map.getBearing(),
            duration: 850,
            essential: true
          });
          openDetail(venue);
        } else {
          closeDetail();
        }
      }
    } finally {
      suppressUrlSync = false;
    }

    // Normalize URL after apply (drop invalid/unknown params).
    syncUrlFromApp({ replace: true });
    syncDocumentTitleFromState();
  }

  function getDistanceMilesForAsset(asset) {
    if (!asset || !userLocationCoords) return null;
    return geolocationModel.distanceMiles(
      userLocationCoords,
      { lng: Number(asset.x), lat: Number(asset.y) }
    );
  }

  function getDistanceMilesForAssetIdx(assetIdx) {
    if (!Number.isInteger(assetIdx)) return null;
    return getDistanceMilesForAsset(DATA[assetIdx]);
  }

  function getDistanceLabelForAsset(asset) {
    const miles = getDistanceMilesForAsset(asset);
    return geolocationModel.formatDistanceMiles(miles);
  }

  function getDistanceLabelForEvent(event) {
    if (!event || !Number.isInteger(event.matched_asset_idx)) return '';
    const miles = getDistanceMilesForAssetIdx(event.matched_asset_idx);
    return geolocationModel.formatDistanceMiles(miles);
  }

  function renderGeolocationStatus(text, statusClass) {
    const statusEl = document.getElementById('mapLocationStatus');
    if (!statusEl) return;
    geolocationStatus = statusClass || 'idle';
    statusEl.classList.remove('status-idle', 'status-ready', 'status-locating', 'status-denied', 'status-error');
    statusEl.classList.add(`status-${geolocationStatus}`);
    statusEl.textContent = text;
  }

  function handleGeolocationUpdated() {
    refreshAssetSourceHoursStates();
    if (events14dMode) {
      updateMapFilters({ recenter: false });
    }
    buildMapEventsList({ keepPosition: true });
    buildList();
  }

  function buildVenueEventIndex() {
    const result = eventsModel.buildVenueEventIndex({
      data: DATA,
      eventIndex: EVENT_INDEX,
      events: EVENTS,
      makeEventVenueKey,
      parseEventDate
    });
    EVENTS = result.events;
    matchedEventsByAsset = result.matchedEventsByAsset;
    unmatchedEvents = result.unmatchedEvents;
  }

  function getUpcomingEventsForAssetIdx(assetIdx, days = EVENT_WINDOW_DAYS) {
    return eventsModel.getUpcomingEventsForAssetIdx({
      matchedEventsByAsset,
      assetIdx,
      isEventWithinDays,
      days
    });
  }

  function getEventCountForAsset14d(assetIdx) {
    return eventsModel.getEventCountForAsset14d({
      matchedEventsByAsset,
      assetIdx,
      isEventWithinDays,
      days: EVENT_WINDOW_DAYS
    });
  }

  function getFilteredMapEvents() {
    return eventsModel.getFilteredMapEvents({
      events: EVENTS,
      eventDateFilter,
      eventCategoryFilter,
      data: DATA,
      isEventUpcoming,
      isEventToday,
      isWeekendEvent,
      isEventWithinDays,
      eventWindowDays: EVENT_WINDOW_DAYS,
      getDistanceMilesForAssetIdx,
      compareDistanceMiles: geolocationModel.compareDistanceMiles
    });
  }

  function updateMapEventsFilterUI() {
    eventsFilterUI.updateMapEventsFilterUI({
      eventDateFilter
    });
  }

  // Lifted for deep-linking (apply URL state can reuse these setters).
  function setEventDateFilter(filterValue) {
    eventDateFilter = filterValue;
    eventsListPage = 0;
    buildMapEventsList();
    updateMapEventsFilterUI();
    syncUrlFromApp();
  }

  function buildMapEventsCategorySelect() {
    const select = document.getElementById('mapEventsCategory');
    eventsFilterUI.buildMapEventsCategorySelect({
      selectEl: select,
      data: DATA,
      cats: CATS,
      escapeHTML,
      eventCategoryFilter,
      getOptionsHTML: eventsView.getEventsCategoryOptionsHTML
    });
  }

  function updateMapEventsCategoryUI() {
    const select = document.getElementById('mapEventsCategory');
    eventsFilterUI.updateMapEventsCategoryUI({ selectEl: select, eventCategoryFilter });
  }

  // Lifted for deep-linking (apply URL state can reuse these setters).
  function setEventCategoryFilter(categoryValue) {
    eventCategoryFilter = eventsFilterUI.normalizeEventCategoryFilter(categoryValue);
    eventsListPage = 0;
    updateMapEventsCategoryUI();
    buildMapEventsList();
    syncUrlFromApp();
  }

  function buildMapEventsList(options = {}) {
    const { keepPosition = false, skipRotationRestart = false } = options;
    const listEl = document.getElementById('mapEventsList');
    const allListEl = document.getElementById('mapEventsAllList');
    const countEl = document.getElementById('mapEventsCount');
    const scopeEl = document.getElementById('mapEventsScope');
    const prevBtn = document.getElementById('mapEventsPrev');
    const nextBtn = document.getElementById('mapEventsNext');
    const pageEl = document.getElementById('mapEventsPage');
    if (!listEl || !allListEl || !countEl || !pageEl) return;
    updateMapEventsFilterUI();
    updateMapEventsCategoryUI();

    const filtered = getFilteredMapEvents();
    const scopeLabel = eventsView.getEventsScopeLabel({
      eventCategoryFilter,
      cats: CATS
    });
    eventsController.buildMapEventsList({
      listEl,
      allListEl,
      countEl,
      scopeEl,
      prevBtn,
      nextBtn,
      pageEl,
      filtered,
      scopeLabel,
      eventsView,
      escapeHTML,
      formatEventDateRange,
      getEventDisplayDescription,
      getDistanceLabelForEvent,
      getEventsCarouselVisibleSlots: () => eventsCarousel.getEventsCarouselVisibleSlots(),
      updateEventsSpotlightPageLabel: (totalCards) => eventsCarouselController.updatePageLabel(totalCards),
      startEventsRotation: (totalCards) => eventsCarouselController.start(totalCards),
      stopEventsRotation: () => eventsCarouselController.stop(),
      keepPosition,
      skipRotationRestart
    });
  }

  function renderDetailEvents(venue) {
    const wrapper = document.getElementById('detailEvents');
    if (!wrapper) return;
    const idx = resolveAssetIndex(venue);
    if (!Number.isInteger(idx)) {
      wrapper.innerHTML = '';
      return;
    }
    const upcoming = getUpcomingEventsForAssetIdx(idx, EVENT_WINDOW_DAYS);
    wrapper.innerHTML = eventsController.getDetailEventsHTML({
      upcoming,
      eventWindowDays: EVENT_WINDOW_DAYS,
      escapeHTML,
      formatEventDateRange
    });
  }

  // ============================================================
  // EXPERIENCE SELECTOR
  // ============================================================
  function buildExperienceSelector() {
    const addonsWrap = document.getElementById('mapAddons');
    const guidesSection = document.getElementById('mapGuides');
    const corridorSection = document.getElementById('corridorAddon');
    const exploreSection = document.getElementById('experienceAddon');
    const corridorContainer = document.getElementById('corridorCards');
    const experienceContainer = document.getElementById('experienceCards');
    const guidesCountEl = document.getElementById('mapGuidesCount');
    const corridorCountEl = document.getElementById('corridorAddonCount');
    const experienceCountEl = document.getElementById('experienceAddonCount');
    const layout = catalogView.getExperienceLayoutState(EXPERIENCES);

    if (!layout.hasData) {
      if (addonsWrap) addonsWrap.style.display = 'none';
      if (guidesSection) guidesSection.style.display = 'none';
      if (corridorSection) corridorSection.style.display = 'none';
      if (exploreSection) exploreSection.style.display = 'none';
      return;
    }

    if (corridorContainer) corridorContainer.innerHTML = '';
    if (experienceContainer) experienceContainer.innerHTML = '';

    if (addonsWrap) addonsWrap.style.display = layout.hasAny ? '' : 'none';
    if (guidesSection) {
      guidesSection.style.display = layout.hasAny ? '' : 'none';
      guidesSection.open = false;
    }
    if (corridorSection) {
      corridorSection.style.display = layout.corridors.length ? '' : 'none';
      corridorSection.open = false;
    }
    if (exploreSection) {
      exploreSection.style.display = layout.experiences.length ? '' : 'none';
      exploreSection.open = false;
    }
    if (guidesCountEl) guidesCountEl.textContent = layout.guidesCountText;
    if (corridorCountEl) corridorCountEl.textContent = layout.corridorCountText;
    if (experienceCountEl) experienceCountEl.textContent = layout.experienceCountText;

    catalogView.buildExperienceSelector({
      corridorContainer,
      experienceContainer,
      corridors: layout.corridors,
      experiences: layout.experiences,
      activeExperienceSlug: getActiveExperience() ? getActiveExperience().slug : null,
      onCardClick: (exp) => {
        const activeExperience = getActiveExperience();
        if (activeExperience && activeExperience.slug === exp.slug) {
          deactivateExperience();
        } else {
          activateExperience(exp);
        }
      }
    });
  }

  function getActiveExperience() {
    return experienceController ? experienceController.getActiveExperience() : null;
  }

  // ============================================================
  // MAPLIBRE INITIALIZATION (Steps 2 + 3)
  // ============================================================
  function initMapLibre() {
    const useCooperativeGestures = false;
    const style = mapInitModel.getMapStyle(MAPTILER_KEY);
    map = new maplibregl.Map(mapInitModel.getMapInitOptions({
      style,
      cooperativeGestures: useCooperativeGestures
    }));
    window.__culturalMap = map;

    map.addControl(new maplibregl.NavigationControl({
      visualizePitch: true
    }), 'top-right');

    if (typeof maplibregl.GeolocateControl === 'function') {
      geolocateControl = new maplibregl.GeolocateControl(
        geolocationModel.getGeolocateControlOptions()
      );
      map.addControl(geolocateControl, 'top-right');
      geolocateControl.on('trackuserlocationstart', () => {
        renderGeolocationStatus('Location: locating…', 'locating');
      });
      geolocateControl.on('geolocate', (evt) => {
        const coords = evt && evt.coords
          ? { lng: evt.coords.longitude, lat: evt.coords.latitude }
          : null;
        if (!coords || !Number.isFinite(coords.lng) || !Number.isFinite(coords.lat)) return;
        userLocationCoords = coords;
        renderGeolocationStatus('Location: distance on', 'ready');
        handleGeolocationUpdated();
      });
      geolocateControl.on('error', (err) => {
        const denied = err && (err.code === 1 || /denied/i.test(String(err.message || '')));
        renderGeolocationStatus(denied ? 'Location: blocked' : 'Location: unavailable', denied ? 'denied' : 'error');
      });
    } else {
      renderGeolocationStatus('Location: unsupported', 'error');
    }

    hoverPopup = new maplibregl.Popup(mapInitModel.getHoverPopupOptions());
    mapLabelController = mapLabelControllerModule.createMapLabelController({
      map,
      data: DATA,
      cats: CATS,
      escapeHTML,
      mapInteractionModel,
      mapStyleModel,
      hoverPopup,
      buildFeatureTooltipHTML,
      openDetail,
      getActiveExperience: () => (experienceController ? experienceController.getActiveExperience() : null),
      getOpenNowMode: () => openNowMode,
      getHoveredFeatureId: () => hoveredFeatureId,
      setHoveredFeatureId: (value) => { hoveredFeatureId = value; },
      isCoarsePointer,
      smartLabelsEnabled,
      labelMaxVisible: LABEL_MAX_VISIBLE,
      labelAllThreshold: LABEL_ALL_THRESHOLD,
      labelSubsetCount: LABEL_SUBSET_COUNT,
      mobileLabelMinZoom: MOBILE_LABEL_MIN_ZOOM,
      mobileLabelMaxVisible: MOBILE_LABEL_MAX_VISIBLE
    });
    experienceController = experienceControllerModule.createExperienceController({
      map,
      data: DATA,
      cats: CATS,
      imageData: IMAGE_DATA,
      maptilerKey: MAPTILER_KEY,
      hexToRgba,
      experienceModel,
      corridorMap,
      tourUtils,
      experienceView,
      experienceUI,
      getOriginalPaintValues: () => originalPaintValues,
      clearMapLabelStates,
      updateMobileLabelLayerVisibility,
      updateMapFilters,
      updateMapProgressiveLabels,
      onOpenDetail: openDetail,
      gsap
    });

    map.on('load', () => {
      // Override style's pitch/bearing with our cinematic defaults
      map.jumpTo({ pitch: 35, bearing: -15 });

      // Add 3D terrain if MapTiler key is available
      if (MAPTILER_KEY !== 'GET_YOUR_FREE_KEY_AT_MAPTILER_COM') {
        map.addSource('terrain-dem', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
          encoding: 'mapbox'
        });

        // Add terrain control button (lets user toggle terrain)
        map.addControl(new maplibregl.TerrainControl({
          source: 'terrain-dem',
          exaggeration: 2
        }));

        // Enable terrain
        const isMobile = window.matchMedia('(max-width: 600px)').matches;
        if (!isMobile) {
          map.setTerrain({
            source: 'terrain-dem',
            exaggeration: 2
          });
        }

        console.log('[Terrain] Source added, terrain set, exaggeration: 2');
        console.log('[Terrain] Current terrain:', map.getTerrain());

        // Store original paint values for theme reset
        storeOriginalPaints();
      }

      addCountyOutlineLayer();

      // Add asset data as GeoJSON
      addAssetLayers();

      // Ask once for location and show live user cursor when allowed.
      if (geolocateControl) {
        const autoTriggered = geolocationModel.autoTriggerGeolocation(geolocateControl);
        if (autoTriggered) {
          renderGeolocationStatus('Location: locating…', 'locating');
        } else if (geolocationModel.shouldAutoTriggerGeolocation()) {
          renderGeolocationStatus('Location: tap Locate me', 'idle');
        } else {
          renderGeolocationStatus('Location: requires HTTPS', 'error');
        }
      }

	    // Apply URL state after the map is ready (layers exist, flyTo works).
	    if (!deepLinkAppliedOnce) {
	      deepLinkAppliedOnce = true;
	      applyDeepLinkFromLocation({ allowWhenNotLoaded: true });
	    }
	  });
  }

  function addCountyOutlineLayer() {
    mapDataModel.addCountyOutlineLayer({
      map,
      countyOutline: COUNTY_OUTLINE
    });
  }

  function storeOriginalPaints() {
    originalPaintValues = mapDataModel.storeOriginalPaints(map);
  }

  // ============================================================
  // ASSET LAYERS (Step 3)
  // ============================================================
  function buildAssetsGeoJSON() {
    return mapDataModel.buildAssetsGeoJSON({
      data: DATA,
      cats: CATS,
      getHoursState,
      getHoursLabel,
      getEventCountForAsset14d,
      getDistanceMilesForAssetIdx,
      formatDistanceMiles: geolocationModel.formatDistanceMiles
    });
  }

  function refreshAssetSourceHoursStates() {
    mapDataModel.refreshAssetSourceHoursStates({
      map,
      buildAssetsGeoJSON,
      clearMapLabelStates,
      updateMapProgressiveLabels,
      updateMobileLabelLayerVisibility
    });
  }

  function buildFeatureTooltipHTML(props) {
    return mapDataModel.buildFeatureTooltipHTML({
      props,
      cats: CATS,
      imageData: IMAGE_DATA,
      eventWindowDays: EVENT_WINDOW_DAYS
    });
  }

  function stopIdlePreview() {
    if (!mapLabelController) return;
    mapLabelController.stopIdlePreview();
  }

  function clearMapLabelStates() {
    if (!mapLabelController) return;
    mapLabelController.clearMapLabelStates();
  }

  function scheduleSmartLabelUpdate() {
    if (!mapLabelController) return;
    mapLabelController.scheduleSmartLabelUpdate();
  }

  function updateMapProgressiveLabels() {
    if (!mapLabelController) return;
    mapLabelController.updateMapProgressiveLabels();
  }

  function getVisibleAssetFeatureCount() {
    if (!mapLabelController) return 0;
    return mapLabelController.getVisibleAssetFeatureCount();
  }

  function updateMobileLabelLayerVisibility() {
    if (!mapLabelController) return;
    mapLabelController.updateMobileLabelLayerVisibility();
  }

  function markMapInteracted() {
    if (!mapLabelController) return;
    mapLabelController.markMapInteracted();
  }

  function scheduleIdlePreview() {
    if (!mapLabelController) return;
    mapLabelController.scheduleIdlePreview();
  }

  function addAssetLayers() {
    const geojson = buildAssetsGeoJSON();

    map.addSource('assets', { type: 'geojson', data: geojson });

    map.addLayer(assetLayerDefs.getAssetsCircleLayerDef());
    map.addLayer(assetLayerDefs.getAssetsHitLayerDef());

    if (isCoarsePointer) {
      map.addLayer(assetLayerDefs.getAssetsMobileLabelsLayerDef({
        mobileLabelMinZoom: MOBILE_LABEL_MIN_ZOOM,
        mobileLabelSizeBase: MOBILE_LABEL_SIZE_BASE,
        mobileLabelSizeLarge: MOBILE_LABEL_SIZE_LARGE
      }));
    }
    assetInteractions.bindAssetInteractions({
      map,
      isCoarsePointer,
      data: DATA,
      hoverPopup,
      markMapInteracted,
      getHoveredFeatureId: () => hoveredFeatureId,
      setHoveredFeatureId: (value) => { hoveredFeatureId = value; },
      buildFeatureTooltipHTML,
      openDetail,
      cancelTour,
      showTourPopup,
      hideTourPopup,
      updateMapProgressiveLabels,
      updateMobileLabelLayerVisibility,
      scheduleSmartLabelUpdate,
      updateMapFilters,
      scheduleIdlePreview
    });
  }

  function applyMapVisualState() {
    const styles = mapStyleModel.getAssetPaintStyles({
      openNowMode,
      hasCategoryFilter: activeCategories.size > 0
    });
    mapRenderController.applyAssetPaintStyles({
      map,
      activeExperience: getActiveExperience(),
      styles
    });
  }

  function updateMapFilters(options = {}) {
    const { recenter = false } = options;
    if (!map.getLayer('assets-circle')) return;
    const combinedExpr = mapFilterModel.buildCombinedMapFilterExpr({
      activeCategories,
      openNowMode,
      events14dMode
    });

    mapRenderController.applyAssetFilters({
      map,
      combinedExpr
    });
    applyMapVisualState();

    if (recenter) {
      const filtered = mapFilterModel.getFitCandidates({
        data: DATA,
        activeCategories,
        openNowMode,
        events14dMode,
        getHoursState,
        getEventCountForAsset14d
      });
      mapRenderController.recenterAfterFilter({
        map,
        filtered,
        shouldResetView: activeCategories.size === 0 && !openNowMode && !events14dMode
      });
    }

    if (!recenter) {
      updateMapProgressiveLabels();
    }
    updateMobileLabelLayerVisibility();
  }

  // ============================================================
  // EXPERIENCE SYSTEM (Steps 4 + 5 + 6)
  // ============================================================
  function activateExperience(experience) {
    if (!experienceController) return;
    experienceController.activateExperience(experience);
    updateCategoryResultsOverlay();
    syncUrlFromApp();
    syncDocumentTitleFromState();
  }

  function showTourPopup(stop) {
    if (!experienceController) return;
    experienceController.showTourPopup(stop);
  }

  function hideTourPopup() {
    if (!experienceController) return;
    experienceController.hideTourPopup();
  }

  function flyToStop(stop, index) {
    if (!experienceController) return;
    experienceController.flyToStop(stop, index);
  }

  function cancelTour() {
    if (!experienceController) return;
    experienceController.cancelTour();
  }

  function deactivateExperience() {
    if (!experienceController) return;
    experienceController.deactivateExperience();
    updateCategoryResultsOverlay();
    syncUrlFromApp();
    syncDocumentTitleFromState();
  }

  function clearCorridorLayers() {
    if (!experienceController) return;
    experienceController.clearCorridorLayers();
  }

  // ============================================================
  // CATEGORY GRID
  // ============================================================
  function buildCategoryGrid() {
    const grid = document.getElementById('categoryGrid');
    cardElements = catalogView.buildCategoryGrid({
      gridEl: grid,
      data: DATA,
      cats: CATS,
      icons: ICONS,
      hexToRgba,
      onCategoryClick: (name) => {
        setCategory(name);
        document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ============================================================
  // FILTER BAR
  // ============================================================
  function buildFilterBar() {
    const bar = document.getElementById('filterBar');
    filterUI.buildFilterBar({
      barEl: bar,
      cats: CATS,
      onSetCategory: (cat) => setCategory(cat),
      onToggleOpenNow: () => setOpenNowMode(!openNowMode),
      onToggleEvents: () => setEvents14dMode(!events14dMode)
    });

    renderOpenNowUI();
    renderEvents14dUI();
    syncMapFilterToggleMeta();
  }

  function buildMapLegend() {
    const panel = document.getElementById('mapLegendPanel');
    filterUI.buildMapLegend({ panelEl: panel, cats: CATS });
  }

  function setMapFiltersExpanded(expanded) {
    mapFiltersExpanded = !!expanded;
    const overlay = document.querySelector('.map-overlay-controls');
    const toggle = document.getElementById('mapFilterToggle');
    if (overlay) overlay.classList.toggle('expanded', mapFiltersExpanded);
    if (toggle) toggle.setAttribute('aria-expanded', mapFiltersExpanded ? 'true' : 'false');
  }

  function setMapLegendExpanded(expanded) {
    mapLegendExpanded = !!expanded;
    const overlay = document.querySelector('.map-overlay-controls');
    const toggle = document.getElementById('mapLegendToggle');
    if (overlay) overlay.classList.toggle('legend-expanded', mapLegendExpanded);
    if (toggle) toggle.setAttribute('aria-expanded', mapLegendExpanded ? 'true' : 'false');
  }

  function syncMapFilterToggleMeta() {
    const meta = document.getElementById('mapFilterToggleMeta');
    filterUI.syncMapFilterToggleMeta({
      metaEl: meta,
      activeCategories,
      cats: CATS,
      openNowMode,
      events14dMode
    });
  }

  function renderOpenNowUI() {
    filterUI.renderOpenNowUI({
      openNowPill: document.getElementById('openNowPill'),
      openNowStateBadge: document.getElementById('openNowStateBadge'),
      legendEl: document.getElementById('hoursLegend'),
      openNowMode
    });
    syncMapFilterToggleMeta();
  }

  function renderEvents14dUI() {
    filterUI.renderEvents14dUI({
      eventsPill: document.getElementById('events14dPill'),
      eventsStateBadge: document.getElementById('events14dStateBadge'),
      events14dMode
    });
    syncMapFilterToggleMeta();
  }

  function setOpenNowMode(enabled) {
    markMapInteracted();
    openNowMode = !!enabled;
    if (openNowMode) refreshAssetSourceHoursStates();
    renderOpenNowUI();
    updateActiveBanner();
    updateMapFilters({ recenter: false });
    listPage = 0;
    buildList();
    syncUrlFromApp();
    syncDocumentTitleFromState();
  }

  function setEvents14dMode(enabled) {
    markMapInteracted();
    events14dMode = !!enabled;
    renderEvents14dUI();
    updateActiveBanner();
    updateMapFilters({ recenter: false });
    listPage = 0;
    buildList();
    syncUrlFromApp();
    syncDocumentTitleFromState();
  }

  // ============================================================
  // ACTIVE BANNER
  // ============================================================
  function updateActiveBanner() {
    const banner = document.getElementById('mapActiveBanner');
    const state = filterStateModel.getActiveBannerState({
      data: DATA,
      activeCategories,
      openNowMode,
      events14dMode,
      getHoursState,
      getEventCountForAsset14d,
      cats: CATS
    });
    if (!state) {
      banner.classList.remove('visible');
      return;
    }
    document.getElementById('mapActiveDot').style.background = state.dotColor;
    document.getElementById('mapActiveCount').textContent = state.count;
    document.getElementById('mapActiveName').textContent = state.label;
    banner.classList.add('visible');
  }

	  // ============================================================
	  // MAP RESULTS OVERLAY (Near Me / Events)
	  // ============================================================
  let categoryResultsPanelEl = null;
  let categoryResultsListEl = null;
  let categoryResultsTitleEl = null;
  let categoryResultsCountEl = null;
  let categoryResultsSortEl = null;
  let categoryResultsLocateBtn = null;
  let categoryResultsCloseBtn = null;
  let categoryResultsCurrentKey = null;
  let categoryResultsDismissedKey = null;

	  function ensureCategoryResultsPanel() {
    if (categoryResultsPanelEl) return;
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;

    const panel = document.createElement('div');
    panel.id = 'categoryResultsPanel';
    panel.className = 'category-results-panel';
    panel.setAttribute('aria-hidden', 'true');

	    panel.innerHTML = `
	      <div class="category-results-header">
	        <div>
	          <div class="category-results-eyebrow" id="categoryResultsEyebrow">Near me</div>
	          <div class="category-results-title" id="categoryResultsTitle"></div>
          <div class="category-results-meta">
            <span id="categoryResultsCount"></span>
            <span id="categoryResultsSort"></span>
          </div>
        </div>
        <div class="category-results-actions">
          <button class="category-results-btn locate" type="button" id="categoryResultsLocate">Locate</button>
          <button class="category-results-btn close" type="button" id="categoryResultsClose" aria-label="Close">&times;</button>
        </div>
      </div>
      <div class="category-results-list" id="categoryResultsList" role="list"></div>
    `;

    mapContainer.appendChild(panel);
    categoryResultsPanelEl = panel;
    categoryResultsListEl = panel.querySelector('#categoryResultsList');
    categoryResultsTitleEl = panel.querySelector('#categoryResultsTitle');
    categoryResultsCountEl = panel.querySelector('#categoryResultsCount');
    categoryResultsSortEl = panel.querySelector('#categoryResultsSort');
    categoryResultsLocateBtn = panel.querySelector('#categoryResultsLocate');
    categoryResultsCloseBtn = panel.querySelector('#categoryResultsClose');

    if (categoryResultsCloseBtn) {
      categoryResultsCloseBtn.addEventListener('click', () => {
        categoryResultsDismissedKey = categoryResultsCurrentKey;
        hideCategoryResultsPanel();
      });
    }

    if (categoryResultsLocateBtn) {
      categoryResultsLocateBtn.addEventListener('click', () => {
        if (!geolocateControl || typeof geolocateControl.trigger !== 'function') return;
        try {
          geolocateControl.trigger();
        } catch (err) {
          console.warn('[CategoryResults] Failed to trigger geolocation:', err);
        }
      });
    }
  }

  function hideCategoryResultsPanel() {
    if (!categoryResultsPanelEl) return;
    categoryResultsPanelEl.classList.remove('visible');
    categoryResultsPanelEl.setAttribute('aria-hidden', 'true');
  }

  function showCategoryResultsPanel() {
    if (!categoryResultsPanelEl) return;
    categoryResultsPanelEl.classList.add('visible');
    categoryResultsPanelEl.setAttribute('aria-hidden', 'false');
  }

	  function getCategoryResultsOverlayKey(category) {
	    const q = document.getElementById('searchInput')?.value || '';
	    return [
	      String(category || ''),
	      openNowMode ? 'open=1' : 'open=0',
	      events14dMode ? 'events14d=1' : 'events14d=0',
	      `q=${String(q).trim().toLowerCase()}`
	    ].join('|');
	  }

	  function getNextUpcomingEventForAsset(asset) {
	    const idx = resolveAssetIndex(asset);
	    if (!Number.isInteger(idx)) return null;
	    const upcoming = getUpcomingEventsForAssetIdx(idx, EVENT_WINDOW_DAYS);
	    if (!upcoming || !upcoming.length) return null;
	    // events-model already normalizes `_start_ts`; rely on it if present.
	    const sorted = upcoming.slice().sort((a, b) => {
	      const aTs = Number.isFinite(a && a._start_ts) ? a._start_ts : Date.parse(a && a.start_iso);
	      const bTs = Number.isFinite(b && b._start_ts) ? b._start_ts : Date.parse(b && b.start_iso);
	      if (Number.isFinite(aTs) && Number.isFinite(bTs) && aTs !== bTs) return aTs - bTs;
	      return String((a && a.title) || '').localeCompare(String((b && b.title) || ''));
	    });
	    return sorted[0] || null;
	  }

  function focusAssetFromCategoryResults(asset) {
    if (!asset) return;
    document.getElementById('mapSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const x = Number(asset.x);
    const y = Number(asset.y);
    if (map && Number.isFinite(x) && Number.isFinite(y)) {
      map.flyTo({
        center: [x, y],
        zoom: Math.max(map.getZoom(), 13.5),
        pitch: Math.max(map.getPitch(), 48),
        bearing: map.getBearing(),
        duration: 850,
        essential: true
      });
    }
    openDetail(asset);
  }

	  function updateCategoryResultsOverlay() {
	    ensureCategoryResultsPanel();
	    if (!categoryResultsPanelEl || !categoryResultsListEl) return;

	    const hasActiveExperience = !!(experienceController && experienceController.getActiveExperience && experienceController.getActiveExperience());
	    const rawFiltered = exploreController && typeof exploreController.getFilteredData === 'function'
	      ? exploreController.getFilteredData()
	      : [];

	    const overlayCategoryState = filterStateModel.getCategoryResultsOverlayState({
	      activeCategories,
	      filteredCount: rawFiltered.length,
	      dismissed: false,
	      hasActiveExperience
	    });

	    const overlayEventsState = filterStateModel.getEventsResultsOverlayState({
	      events14dMode,
	      filteredCount: rawFiltered.length,
	      dismissed: false,
	      hasActiveExperience
	    });

	    const eyebrowEl = categoryResultsPanelEl.querySelector('#categoryResultsEyebrow');
	    let mode = null;
	    let overlayKey = null;

	    if (overlayCategoryState) {
	      mode = 'category';
	      overlayKey = `mode=category|${getCategoryResultsOverlayKey(overlayCategoryState.category)}`;
	      if (eyebrowEl) eyebrowEl.textContent = 'Near me';
	    } else if (overlayEventsState) {
	      mode = 'events';
	      overlayKey = `mode=events|${getCategoryResultsOverlayKey('events14d')}`;
	      if (eyebrowEl) eyebrowEl.textContent = 'Venues with events';
	    } else {
	      categoryResultsCurrentKey = null;
	      categoryResultsDismissedKey = null;
	      hideCategoryResultsPanel();
	      return;
	    }

	    const key = overlayKey;
	    categoryResultsCurrentKey = key;

	    if (categoryResultsDismissedKey === key) {
	      hideCategoryResultsPanel();
	      return;
	    }

	    const cfg = mode === 'category' ? (CATS[overlayCategoryState.category] || {}) : {};
	    categoryResultsPanelEl.style.setProperty('--category-accent', (cfg && cfg.color) || 'rgba(245,240,232,0.18)');

	    if (categoryResultsTitleEl) {
	      categoryResultsTitleEl.textContent = mode === 'category'
	        ? (cfg.short || overlayCategoryState.category)
	        : 'Next 14 days';
	    }

	    if (categoryResultsCountEl) {
	      const count = mode === 'category' ? overlayCategoryState.count : overlayEventsState.count;
	      const noun = count === 1 ? 'place' : 'places';
	      categoryResultsCountEl.textContent = `${count} ${noun}`;
	    }

	    const locationReady = !!userLocationCoords;
	    if (categoryResultsLocateBtn) {
	      categoryResultsLocateBtn.hidden = !geolocateControl;
	      categoryResultsLocateBtn.textContent = locationReady ? 'Update' : 'Locate';
	    }

	    if (categoryResultsSortEl) {
	      if (locationReady) {
	        categoryResultsSortEl.textContent = 'Sorted by distance';
	      } else {
	        categoryResultsSortEl.textContent = mode === 'events'
	          ? 'Sorted by next event'
	          : 'Enable location to sort by distance';
	      }
	    }

	    const filtered = rawFiltered.slice();
	    if (mode === 'events') {
	      filtered.sort((a, b) => {
	        if (locationReady && typeof geolocationModel.compareDistanceMiles === 'function') {
	          const diff = geolocationModel.compareDistanceMiles(getDistanceMilesForAsset(a), getDistanceMilesForAsset(b));
	          if (diff !== 0) return diff;
	        }
	        const aEvt = getNextUpcomingEventForAsset(a);
	        const bEvt = getNextUpcomingEventForAsset(b);
	        const aTs = aEvt ? Date.parse(aEvt.start_iso) : Infinity;
	        const bTs = bEvt ? Date.parse(bEvt.start_iso) : Infinity;
	        if (Number.isFinite(aTs) && Number.isFinite(bTs) && aTs !== bTs) return aTs - bTs;
	        return String((a && a.n) || '').localeCompare(String((b && b.n) || ''));
	      });
	    }

	    categoryResultsListEl.innerHTML = '';
	    filtered.forEach((asset, idx) => {
	      if (!asset) return;
	      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'category-result';
      item.setAttribute('role', 'listitem');

      const safeName = escapeHTML(String(asset.n || ''));
      const placeLabel = asset.c ? escapeHTML(String(asset.c)) : (asset.a ? escapeHTML(String(asset.a)) : '');
      const distanceLabel = getDistanceLabelForAsset(asset);

	      const pills = [];
	      if (distanceLabel) {
	        pills.push(`<span class="category-result-pill">${escapeHTML(distanceLabel)}</span>`);
	      }
	      if (mode === 'events') {
	        const nextEvent = getNextUpcomingEventForAsset(asset);
	        if (nextEvent) {
	          pills.push(`<span class="category-result-pill">${escapeHTML(formatEventDateRange(nextEvent))}</span>`);
	        }
	      }
	      if (events14dMode) {
	        const assetIdx = resolveAssetIndex(asset);
	        const eventCount14d = Number.isInteger(assetIdx) ? getEventCountForAsset14d(assetIdx) : 0;
	        if (eventCount14d > 0) {
	          pills.push(`<span class="category-result-pill">${eventCount14d} event${eventCount14d === 1 ? '' : 's'}</span>`);
	        }
	      }
	      if (openNowMode) {
	        const hoursState = getHoursState(asset);
	        pills.push(`<span class="category-result-pill">${escapeHTML(getHoursLabel(hoursState))}</span>`);
	      }

      item.innerHTML = `
        <div class="category-result-num">${idx + 1}</div>
        <div class="category-result-info">
          <div class="category-result-name">${safeName}</div>
          <div class="category-result-note">
            ${placeLabel ? `<span>${placeLabel}</span>` : ''}
            ${pills.join('')}
          </div>
        </div>
      `;

      item.addEventListener('click', () => focusAssetFromCategoryResults(asset));
      categoryResultsListEl.appendChild(item);
    });

    showCategoryResultsPanel();
  }

  // ============================================================
  // SET CATEGORY
  // ============================================================
  function setCategory(cat, options = {}) {
    markMapInteracted();
    const { exclusive = false } = options;
    activeCategories = filterStateModel.computeNextCategories({
      activeCategories,
      cat,
      exclusive
    });
    filterUI.syncCategoryPills({ activeCategories });
    filterUI.syncCategoryCards({
      cardElements,
      activeCategories
    });

    renderOpenNowUI();
    updateActiveBanner();
    updateMapFilters();
    listPage = 0;
    eventsListPage = 0;
    buildList();
    buildMapEventsList();
    syncUrlFromApp();
    syncDocumentTitleFromState();
  }

  // ============================================================
  // DETAIL PANEL (GSAP animated)
  // ============================================================
  function openDetail(d, options = {}) {
    lastFocusedAsset = d || null;
    lastFocusedEventId = options && options.fromEventId ? String(options.fromEventId) : null;
    lastFocusedMusePlaceId = d && d.muse_place_id ? String(d.muse_place_id) : null;
    detailController.openDetail({
      asset: d,
      panelEl: document.getElementById('detailPanel'),
      overlayEl: document.getElementById('panelOverlay'),
      cats: CATS,
      imageData: IMAGE_DATA,
      icons: ICONS,
      experiences: EXPERIENCES,
      closeDetail,
      activateExperience,
      detailView,
      getHoursState,
      getTodayHoursDisplay,
      getDistanceLabelForAsset,
      resolveAssetIndex,
      getEventCountForAsset14d,
      eventWindowDays: EVENT_WINDOW_DAYS,
      getHoursLabel,
      escapeHTML,
      renderDetailEvents,
      map,
      gsap
    });
    syncUrlFromApp();
    syncDocumentTitleFromState();
  }

  function closeDetail() {
    detailController.closeDetail({
      panelEl: document.getElementById('detailPanel'),
      overlayEl: document.getElementById('panelOverlay'),
      detailView,
      gsap
    });
    lastFocusedAsset = null;
    lastFocusedEventId = null;
    lastFocusedMusePlaceId = null;
    syncUrlFromApp();
    syncDocumentTitleFromState();
  }

  // ============================================================
  // EXPLORE LIST
  // ============================================================
  function buildExploreCats() {
    if (!exploreController) return;
    exploreController.buildExploreCats();
  }

  function exploreSetCategory(cat) {
    if (!exploreController) return;
    exploreController.exploreSetCategory(cat);
  }

  function buildList() {
    if (!exploreController) return;
    exploreController.buildList();
    updateCategoryResultsOverlay();
  }

  function focusEventById(eventId) {
    const id = String(eventId || '');
    if (!id) return;
    const event = EVENTS.find((item) => item && item.event_id === id);
    if (!event || !Number.isInteger(event.matched_asset_idx)) return;
    const venue = DATA[event.matched_asset_idx];
    if (!venue || !venue.x || !venue.y) return;
    lastFocusedEventId = id;
    lastFocusedAsset = venue;
    lastFocusedMusePlaceId = null;
    document.getElementById('mapSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    map.flyTo({
      center: [venue.x, venue.y],
      zoom: Math.max(map.getZoom(), 14),
      pitch: Math.max(map.getPitch(), 48),
      bearing: map.getBearing(),
      duration: 850,
      essential: true
    });
    openDetail(venue, { fromEventId: id });
    syncUrlFromApp();
    syncDocumentTitleFromState();
  }

  // ============================================================
  // EVENTS
  // ============================================================
  function bindEvents() {
    bindings.bindEvents({
      closeDetail,
      collapseMapOverlays: () => {
        setMapFiltersExpanded(false);
        setMapLegendExpanded(false);
      },
      markMapInteracted,
      toggleMapFiltersExpanded: () => setMapFiltersExpanded(!mapFiltersExpanded),
      toggleMapLegendExpanded: () => setMapLegendExpanded(!mapLegendExpanded),
      triggerGeolocation: () => {
        if (geolocateControl && typeof geolocateControl.trigger === 'function') {
          renderGeolocationStatus('Location: locating…', 'locating');
          geolocateControl.trigger();
        }
      },
      getMapFiltersExpanded: () => mapFiltersExpanded,
      getMapLegendExpanded: () => mapLegendExpanded,
      setMapFiltersExpanded,
      setMapLegendExpanded,
      getActiveCategoryCount: () => activeCategories.size,
      resetListPage: () => { listPage = 0; },
      incrementListPage: () => { listPage++; },
      buildList,
      exploreSetCategory,
      setEventDateFilter,
      setEventCategoryFilter,
      stopEventsRotation: () => eventsCarouselController.stop(),
      getFilteredMapEvents,
      stepEventsSpotlight: (direction = 1, smooth = true) => eventsCarouselController.step(direction, smooth),
      queueEventsRotationResume: (totalCards, delayMs = 520) => eventsCarouselController.queueResume(totalCards, delayMs),
      startEventsRotation: (totalCards) => eventsCarouselController.start(totalCards),
      updateEventsSpotlightPageLabel: (totalCards) => eventsCarouselController.updatePageLabel(totalCards),
      focusEvent: focusEventById,
      buildMapEventsList,
      clearAllMapFilters: () => {
        setCategory(null);
        if (openNowMode) setOpenNowMode(false);
        if (events14dMode) setEvents14dMode(false);
      }
    });
  }

  // ============================================================
  // SCROLL REVEAL (GSAP)
  // ============================================================
  function initScrollReveal() {
    pageEffects.initScrollReveal({ gsap });
  }

})();
