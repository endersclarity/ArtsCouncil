(function() {
  'use strict';

  const MAPTILER_KEY = 'LrWxywMynJX4Y3SvVJby';

  // Category consolidation: 10 raw categories + 1 orphan → 8 display categories
  // Maps old category names to new merged names. Unmapped categories keep their name.
  const CATEGORY_MAP = {
    'Arts Organizations':     'Cultural Organizations',
    'Cultural Resources':     'Cultural Organizations',
    'Preservation & Culture': 'Cultural Organizations',
    'Performing Arts':        'Performance Spaces'
  };

  // SVG icons per category (inline, 18x18 viewBox) — 8 consolidated categories
  const ICONS = {
    'Historic Landmarks': '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 2L2 7h14L9 2z"/><rect x="4" y="7" width="10" height="8"/><rect x="7" y="10" width="4" height="5"/><line x1="2" y1="15" x2="16" y2="15"/></svg>',
    'Eat, Drink & Stay': '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 2v6c0 2 2 3 4 3v5M14 2v4c0 1.5-1.5 2.5-3 2.5V14m0 0v2m0-2h0M14 2c0 2-1 3-3 3"/><circle cx="7" cy="14" r="1.5"/></svg>',
    'Cultural Organizations': '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="9" cy="9" r="6"/><path d="M6 9c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5-1.5 3.5-3 3.5S6 11 6 9z"/><path d="M9 5.5v7"/></svg>',
    'Fairs & Festivals': '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 2l1.5 3 3.5.5-2.5 2.5.5 3.5L9 10l-3 1.5.5-3.5L4 5.5l3.5-.5z"/></svg>',
    'Galleries & Museums': '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="4" width="14" height="11" rx="1"/><path d="M2 8h14"/><circle cx="7" cy="11" r="2"/><path d="M11 9l3 4"/></svg>',
    'Walks & Trails': '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 15c2-3 4-5 6-8s3-3 6-5"/><circle cx="14" cy="4" r="1.5"/><path d="M5 13l-2 1m4-3l-2 1"/></svg>',
    'Public Art': '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 3c-4 0-6 3-6 6 0 2 1 3 2 3 1.5 0 1.5-2 3-2s1.5 2 3 2 2-1 2-3c0-3-2-6-4-6z"/><circle cx="6" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="7" r="1" fill="currentColor"/><circle cx="8" cy="10" r="1" fill="currentColor"/></svg>',
    'Performance Spaces': '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 3h10l2 3v1H2V6l2-3z"/><path d="M3 7v7c0 1 1 2 2 2h8c1 0 2-1 2-2V7"/><path d="M7 10h4v3H7z"/></svg>',
  };

  // 8 consolidated categories
  const CATS = {
    'Historic Landmarks':        { color: '#8b2500', short: 'Landmarks', watercolor: 'landmarks' },
    'Eat, Drink & Stay':         { color: '#a67830', short: 'Eat & Drink', watercolor: 'eat-drink' },
    'Cultural Organizations':    { color: '#2d4a3e', short: 'Culture & Community', watercolor: 'arts' },
    'Galleries & Museums':       { color: '#6b4e71', short: 'Galleries', watercolor: 'galleries' },
    'Fairs & Festivals':         { color: '#a0522d', short: 'Festivals', watercolor: 'fairs' },
    'Walks & Trails':            { color: '#4a7c5f', short: 'Trails', watercolor: 'walks' },
    'Public Art':                { color: '#c45d3e', short: 'Public Art', watercolor: 'publicart' },
    'Performance Spaces':        { color: '#2a6496', short: 'Performance', watercolor: 'performance' },
  };

  // Hero images for each category (hand-picked from image_data.json)
  const CATEGORY_HEROES = {
    'Historic Landmarks':     'Bridgeport Covered Bridge',
    'Eat, Drink & Stay':      'Broad Street Bistro and Gallery',
    'Cultural Organizations': 'North Star Historic Conservancy',
    'Galleries & Museums':    'Art Works Gallery Co-op',
    'Fairs & Festivals':      'Victorian Christmas',
    'Walks & Trails':         'South Yuba River State Park',
    'Public Art':             'Sculpture - Western Gateway Park',
    'Performance Spaces':     'Nevada Theatre',
  };

  // Hand-curated demo picks for Wednesday Feb 18 committee presentation
  // Showcases 5-source aggregation: MUSE, KVMR, GVDA, LibCal, Local assets
  var DEMO_FEATURED_PICKS = [
    {
      type: 'editorial',
      name: 'Our Cultural Corridors',
      source: 'MUSE',
      tagline: 'Three highways, centuries of stories \u2014 from Nisenan petroglyphs to Gold Rush foundries',
      category: 'Routes & Heritage',
      museIndex: 0
    },
    {
      type: 'editorial',
      name: 'Rural is the New Cool',
      source: 'MUSE',
      tagline: 'More galleries per capita than anywhere in the Northern Sierra, and the locals know it',
      category: 'Community & Place',
      museIndex: 1
    },
    {
      type: 'event',
      name: 'Carnaval a la Brazil: Nevada City Mardi Gras Fest at the Miners Foundry',
      source: 'KVMR',
      tagline: 'KVMR brings samba, brass, and revelry to the Foundry \u2014 Nevada City\u2019s biggest night out',
      category: 'Music & Performance',
      eventId: 'kvmr-347612-1771153200-1771185600-20260215'
    },
    {
      type: 'event',
      name: 'Spring Street Swing Out',
      source: 'GVDA',
      tagline: 'Mill Street closes to cars, opens to swing bands \u2014 downtown Grass Valley dances',
      category: 'Dance & Community',
      eventId: 'gvda-191708164'
    },
    {
      type: 'event',
      name: 'Baby Storytime',
      source: 'LibCal',
      tagline: 'Grass Valley Library\u2019s free Tuesday morning circle for babies and caregivers',
      category: 'Family & Kids',
      eventId: 'libcal-LibCal-20247-14841924-20260217'
    },
    {
      type: 'asset',
      name: 'Miners Foundry',
      source: 'Local',
      tagline: 'Built in 1856 to forge mining equipment \u2014 you\u2019ll find live music, theater, and weddings now',
      category: 'Performance Spaces'
    },
    {
      type: 'asset',
      name: 'Nevada Theatre',
      source: 'Local',
      tagline: 'California\u2019s oldest original-use theater, showing films and hosting bands since 1865',
      category: 'Performance Spaces'
    },
    {
      type: 'asset',
      name: 'Broad Street Bistro and Gallery',
      source: 'Local',
      tagline: 'Farm-to-table plates under rotating local art on Broad Street \u2014 Nevada City\u2019s creative corner',
      category: 'Eat, Drink & Stay'
    }
  ];

  // Source badge colors for demo picks
  var DEMO_SOURCE_COLORS = {
    'MUSE': '#c8943e',
    'KVMR': '#2a8a7a',
    'GVDA': '#b5533e',
    'LibCal': '#3a5f7c',
    'Local': '#2d4a3e'
  };

  window.CulturalMapConfig = {
    MAPTILER_KEY,
    ICONS,
    CATS,
    CATEGORY_MAP,
    CATEGORY_HEROES,
    DEMO_FEATURED_PICKS: DEMO_FEATURED_PICKS,
    DEMO_SOURCE_COLORS: DEMO_SOURCE_COLORS
  };
})();
