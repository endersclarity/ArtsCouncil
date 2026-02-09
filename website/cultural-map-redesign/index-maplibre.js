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
    [hexToRgba, escapeHTML, sanitizeCountyOutline],
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
  let EVENTS = [];
  let EVENT_INDEX = null;
  let COUNTY_OUTLINE = null;
  let map;
  let activeCategories = new Set();
  let openNowMode = false;
  let events14dMode = false;
  let eventDateFilter = 'all';
  let eventCategoryFilter = 'all';
  let eventsListPage = 0;
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
    fetch('events.json').then(r => r.json()).catch(() => []),
    fetch('events.index.json').then(r => r.json()).catch(() => null),
    fetch('nevada-county.geojson')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
  ]).then(([data, images, experiences, events, eventIndex, countyOutline]) => {
    DATA = data;
    IMAGE_DATA = images;
    EXPERIENCES = experiences;
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
    bindEvents();
    preloadWatercolors();
  }

  // Preload watercolor images — deferred until browser is idle
  function preloadWatercolors() {
    pageEffects.preloadWatercolors(CATS);
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
      eventWindowDays: EVENT_WINDOW_DAYS
    });
  }

  function updateMapEventsFilterUI() {
    eventsFilterUI.updateMapEventsFilterUI({
      eventDateFilter
    });
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
      getEventCountForAsset14d
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
  }

  function setEvents14dMode(enabled) {
    markMapInteracted();
    events14dMode = !!enabled;
    renderEvents14dUI();
    updateActiveBanner();
    updateMapFilters({ recenter: false });
    listPage = 0;
    buildList();
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
  }

  // ============================================================
  // DETAIL PANEL (GSAP animated)
  // ============================================================
  function openDetail(d) {
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
      resolveAssetIndex,
      getEventCountForAsset14d,
      eventWindowDays: EVENT_WINDOW_DAYS,
      getHoursLabel,
      escapeHTML,
      renderDetailEvents,
      map,
      gsap
    });
  }

  function closeDetail() {
    detailController.closeDetail({
      panelEl: document.getElementById('detailPanel'),
      overlayEl: document.getElementById('panelOverlay'),
      detailView,
      gsap
    });
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
      getMapFiltersExpanded: () => mapFiltersExpanded,
      getMapLegendExpanded: () => mapLegendExpanded,
      setMapFiltersExpanded,
      setMapLegendExpanded,
      getActiveCategoryCount: () => activeCategories.size,
      resetListPage: () => { listPage = 0; },
      incrementListPage: () => { listPage++; },
      buildList,
      exploreSetCategory,
      setEventDateFilter: (filterValue) => {
        eventDateFilter = filterValue;
        eventsListPage = 0;
        buildMapEventsList();
        updateMapEventsFilterUI();
      },
      setEventCategoryFilter: (categoryValue) => {
        eventCategoryFilter = eventsFilterUI.normalizeEventCategoryFilter(categoryValue);
        eventsListPage = 0;
        updateMapEventsCategoryUI();
        buildMapEventsList();
      },
      stopEventsRotation: () => eventsCarouselController.stop(),
      getFilteredMapEvents,
      stepEventsSpotlight: (direction = 1, smooth = true) => eventsCarouselController.step(direction, smooth),
      queueEventsRotationResume: (totalCards, delayMs = 520) => eventsCarouselController.queueResume(totalCards, delayMs),
      startEventsRotation: (totalCards) => eventsCarouselController.start(totalCards),
      updateEventsSpotlightPageLabel: (totalCards) => eventsCarouselController.updatePageLabel(totalCards),
      focusEvent: (eventId) => {
        const event = EVENTS.find((item) => item.event_id === eventId);
        if (!event || !Number.isInteger(event.matched_asset_idx)) return;
        const venue = DATA[event.matched_asset_idx];
        if (!venue || !venue.x || !venue.y) return;
        document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
        map.flyTo({
          center: [venue.x, venue.y],
          zoom: Math.max(map.getZoom(), 14),
          pitch: Math.max(map.getPitch(), 48),
          bearing: map.getBearing(),
          duration: 850,
          essential: true
        });
        openDetail(venue);
      },
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
