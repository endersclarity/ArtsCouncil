const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const articleIndexPath = path.join(repoRoot, "docs/muse-corpus/article-index.json");
const mapDataDir = path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data");
const placesPath = path.join(mapDataDir, "places.json");
const anchorCardsPath = path.join(mapDataDir, "anchor_cards.json");
const outPath = path.join(mapDataDir, "muse_evidence_links.json");

const THEME_LABELS = {
  "arts-education": "Arts education",
  "cultural-districts": "Cultural districts",
  "events-programming": "Events and programming",
  "food-wine": "Food and wine",
  "heritage-history": "Heritage and history",
  "literary-open-mics": "Literary arts and open mics",
  "makers-artists": "Makers and artists",
  "music-nightlife": "Music and nightlife",
  "public-art": "Public art",
  "theatre-film": "Theatre and film",
  "trails-nature": "Trails and nature",
};

const ANCHOR_THEME_HINTS = [
  [/performance|theatre|night-out/i, ["theatre-film", "music-nightlife", "events-programming"]],
  [/event/i, ["events-programming"]],
  [/heritage|historic|public memory|design legacy|architecture/i, ["heritage-history"]],
  [/landscape|nature/i, ["trails-nature", "heritage-history"]],
  [/gallery|artist|maker|making|creative technology/i, ["makers-artists"]],
  [/class|workshop|education/i, ["arts-education", "makers-artists"]],
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function slugPart(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sourcePages(article) {
  return article.source_pages.map((page) => ({
    issue_year: article.issue_year,
    page: page.page,
    image: `docs/muse-corpus/${article.issue_year}/${page.image}`,
    text: `docs/muse-corpus/${article.issue_year}/${page.text}`,
  }));
}

function articleSummary(article) {
  return {
    id: article.id,
    issue_year: article.issue_year,
    issue: article.issue,
    title: article.title,
    page_start: article.page_start,
    page_end: article.page_end,
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function themesForAnchor(card) {
  const text = [card.pathMembership, ...(card.themeTags || [])].filter(Boolean).join(" ");
  const themes = [];
  for (const [pattern, themeIds] of ANCHOR_THEME_HINTS) {
    if (pattern.test(text)) themes.push(...themeIds);
  }
  return unique(themes);
}

function directPlaceLinks(article, placesById) {
  return article.exact_place_matches
    .filter((match) => match.place_id && placesById.has(match.place_id))
    .map((match) => ({
      id: `place:${match.place_id}:${article.id}:exact:${slugPart(match.alias)}`,
      target_type: "place",
      target_id: match.place_id,
      target_name: match.name,
      match_type: "exact",
      is_direct_evidence: true,
      matched_on: match.alias,
      article: articleSummary(article),
      source_pages: sourcePages(article),
      source_confidence: article.source_confidence,
    }));
}

function themeLinks(article) {
  return article.thematic_matches.map((match) => ({
    id: `theme:${match.theme}:${article.id}:theme`,
    target_type: "theme",
    target_id: match.theme,
    target_name: THEME_LABELS[match.theme] || match.theme,
    match_type: "theme",
    is_direct_evidence: true,
    matched_on: match.theme,
    article: articleSummary(article),
    source_pages: sourcePages(article),
    source_confidence: article.source_confidence,
  }));
}

function fuzzyAnchorLinks(article, anchorsByTheme) {
  const articleThemes = article.thematic_matches.map((match) => match.theme);
  const links = [];
  for (const theme of articleThemes) {
    for (const anchor of anchorsByTheme.get(theme) || []) {
      const alreadyDirect = article.exact_place_matches.some((match) => match.place_id === anchor.placeId);
      if (alreadyDirect) continue;
      links.push({
        id: `place:${anchor.placeId}:${article.id}:fuzzy-theme:${theme}`,
        target_type: "place",
        target_id: anchor.placeId,
        target_name: anchor.name,
        match_type: "fuzzy",
        is_direct_evidence: false,
        matched_on: theme,
        article: articleSummary(article),
        source_pages: sourcePages(article),
        source_confidence: article.source_confidence,
        notes: [
          "Fuzzy thematic support from Primary Anchor theme tags/path membership; not direct place evidence.",
        ],
      });
    }
  }
  return links;
}

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter((link) => {
    if (seen.has(link.id)) return false;
    seen.add(link.id);
    return true;
  });
}

function buildEvidenceLinks() {
  const articleIndex = readJson(articleIndexPath);
  const places = readJson(placesPath);
  const anchorCards = readJson(anchorCardsPath);
  const placesById = new Map(places.map((place) => [place.id, place]));
  const anchors = anchorCards
    .filter((card) => card.promoteAsAnchor && card.placeId && placesById.has(card.placeId))
    .map((card) => ({ ...card, evidence_theme_ids: themesForAnchor(card) }));

  const anchorsByTheme = new Map();
  for (const anchor of anchors) {
    for (const theme of anchor.evidence_theme_ids) {
      if (!anchorsByTheme.has(theme)) anchorsByTheme.set(theme, []);
      anchorsByTheme.get(theme).push(anchor);
    }
  }

  const links = [];
  for (const article of articleIndex.articles) {
    links.push(...directPlaceLinks(article, placesById));
    links.push(...themeLinks(article));
    links.push(...fuzzyAnchorLinks(article, anchorsByTheme));
  }

  return {
    schema_version: 1,
    source: {
      article_index: "docs/muse-corpus/article-index.json",
      places: "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/places.json",
      anchor_cards: "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/anchor_cards.json",
      method:
        "Direct place links use MUSE exact_place_matches. Theme links use MUSE thematic_matches. Fuzzy Primary Anchor links use anchor theme/path hints and are not direct evidence.",
    },
    generated_counts: {
      articles: articleIndex.articles.length,
      links: dedupeLinks(links).length,
      direct_place_links: links.filter((link) => link.target_type === "place" && link.is_direct_evidence).length,
      fuzzy_place_links: links.filter((link) => link.target_type === "place" && !link.is_direct_evidence).length,
      theme_links: links.filter((link) => link.target_type === "theme").length,
    },
    primary_anchor_theme_map: anchors.map((anchor) => ({
      place_id: anchor.placeId,
      name: anchor.name,
      evidence_theme_ids: anchor.evidence_theme_ids,
    })),
    links: dedupeLinks(links).sort((a, b) => a.id.localeCompare(b.id)),
  };
}

fs.writeFileSync(outPath, JSON.stringify(buildEvidenceLinks(), null, 2) + "\n");
console.log(`Wrote ${path.relative(repoRoot, outPath)}`);
