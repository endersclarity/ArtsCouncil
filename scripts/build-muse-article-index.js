#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const corpusDir = path.join(repoRoot, "docs/muse-corpus");
const outPath = path.join(corpusDir, "article-index.json");
const placesPath = path.join(
  repoRoot,
  "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/places.json",
);

const articleSeeds = {
  2024: [
    { page: 2, title: "Land and Peoples Acknowledgement", confidence: "high" },
    { page: 4, title: "Letter from the Editor", confidence: "high" },
    { page: 7, title: "Get Involved", confidence: "medium" },
    { page: 8, title: "A Letter from the Nevada County Arts Council", confidence: "high" },
    { page: 10, title: "In Nevada County, the Arts Are Essential", confidence: "medium" },
    { page: 16, title: "Culture Connection: Local Arts News for 2024", confidence: "high" },
    { page: 20, title: "Calendar of Events 2024", confidence: "high" },
    { page: 26, title: "48 Hours in Truckee: Exploring Culture & Art", confidence: "high" },
    { page: 28, title: "48 Hours in GVNC: Exploring Culture & Art", confidence: "high" },
    { page: 32, title: "Laid Down by the Underground", confidence: "high" },
    { page: 36, title: "A Filmmaking Tradition", confidence: "high" },
    { page: 38, title: "Railyard Tesserae", confidence: "high" },
    { page: 40, title: "A Mural, A Podcast", confidence: "high" },
    { page: 42, title: "P.E.A.C.E. for Positive Elevation Arts Culture Education", confidence: "high" },
    { page: 43, title: "Sagehen: A Proving Ground", confidence: "high" },
    { page: 44, title: "Arts in Education", confidence: "high" },
  ],
  2025: [
    { page: 4, title: "Welcome to MUSE", confidence: "high" },
    { page: 12, title: "Culture Connection: Local Arts News for 2025", confidence: "high" },
    { page: 14, title: "Improv... More than Just Fun & Games", confidence: "high" },
    { page: 20, title: "Calendar of Events 2025", confidence: "high" },
    { page: 26, title: "Seasons in the GVNC Cultural District", confidence: "medium" },
    { page: 29, title: "Seasons in the Truckee Cultural District", confidence: "medium" },
    { page: 32, title: "Shining Light on Dark Skies Above Nevada County", confidence: "high" },
    { page: 36, title: "The Culture of Food in Nevada County", confidence: "high" },
    { page: 39, title: "Nevada City and Grass Valley: A Dance Lover's Haven", confidence: "high" },
    { page: 41, title: "No Somos Animales Exoticos", confidence: "high" },
    { page: 43, title: "For Teens by Teens: The Aspen Collective & Leo Murrell in Truckee", confidence: "high" },
    { page: 45, title: "No Place to Show: Fostering Film in Truckee", confidence: "high" },
    { page: 49, title: "Building the House of Your Dreams", confidence: "medium" },
    { page: 50, title: "The Sisters Who Married Stars", author: "Sadie Jo Smokey-Crews", confidence: "high" },
    { page: 54, title: "From Visibility through Art to Homeland Return", confidence: "high" },
    { page: 63, title: "Truckee Public Art Master Plan Vision", confidence: "medium" },
  ],
  2026: [
    { page: 10, title: "Culture Connection: Local Arts News for 2026", confidence: "high" },
    { page: 28, title: "Rural is the New Cool", author: "Diana Arbex", confidence: "high" },
    { page: 31, title: "Mountain Heart. Small-Town Soul.", author: "Kellie Cutler", confidence: "high" },
    { page: 34, title: "Off The Wall: Explorations of Art In Nature", author: "Annette Muller", confidence: "high" },
    { page: 36, title: "Pathways to Careers in Art", author: "Karen Terrey", confidence: "high" },
    { page: 38, title: "Culture Forward", author: "Eliza Tudor", confidence: "high" },
    { page: 42, title: "Architect Julia Morgan's Legacy in Nevada County", author: "Kyle Winters", confidence: "high" },
    { page: 44, title: "Our Cultural Corridors", author: "Jesse Locks", confidence: "high" },
    { page: 46, title: "Where Art Meets Leadership", author: "Hilary Hodge", confidence: "high" },
    { page: 48, title: "Be Many and Be Loud", author: "Karen Terrey", confidence: "high" },
    { page: 50, title: "New Gold in Nevada County", author: "Catharine Bramkamp", confidence: "high" },
    { page: 54, title: "Latinx Culture: At Home in the Mountains", author: "Leslie Caratachea", confidence: "high" },
    { page: 56, title: "Paved with Passion", author: "Cru Dorsey", confidence: "high" },
    { page: 58, title: "Lucky Little Towns", confidence: "high" },
    { page: 60, title: "On and Off the Stage", author: "John Deaderick", confidence: "high" },
    { page: 64, title: "The Art of Herbalism", author: "Priya Hutner", confidence: "high" },
    { page: 65, title: "Art on the Walls: Nevada City's Creative Trend", author: "Erika Peterson", confidence: "high" },
    { page: 66, title: "Story of Place", confidence: "high" },
  ],
};

const themeRules = [
  ["arts-education", /\b(arts? education|students?|school|teens?|workshops?|classes)\b/i],
  ["cultural-districts", /\b(cultural district|grass valley-nevada city|truckee cultural)\b/i],
  ["events-programming", /\b(calendar|events?|festival|concert|performance|programming)\b/i],
  ["food-wine", /\b(food|wine|winery|restaurant|cooking|market)\b/i],
  ["heritage-history", /\b(history|historic|heritage|legacy|mining|gold rush|Julia Morgan|Washoe|Nisenan)\b/i],
  ["literary-open-mics", /\b(literary|poetry|open mic|writers?|storytelling)\b/i],
  ["makers-artists", /\b(artists?|makers?|studio|gallery|craft|creative)\b/i],
  ["music-nightlife", /\b(music|bands?|nightlife|stage|open mic)\b/i],
  ["public-art", /\b(public art|mural|sculpture|installation)\b/i],
  ["theatre-film", /\b(theatre|theater|film|cinema|stage productions?)\b/i],
  ["trails-nature", /\b(trail|nature|outdoor|forest|river|dark skies|herbalism)\b/i],
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readPageText(year, page) {
  const name = `muse-${year}-page-${String(page).padStart(3, "0")}.txt`;
  return fs.readFileSync(path.join(corpusDir, String(year), "pages", name), "utf8");
}

function pagePair(year, page) {
  const stem = `muse-${year}-page-${String(page).padStart(3, "0")}`;
  return {
    page,
    image: `pages/${stem}.jpg`,
    text: `pages/${stem}.txt`,
  };
}

function deriveAuthor(seed, text) {
  if (seed.author) return seed.author;
  const match = text.match(/\bWORDS\s*\/\s*([A-Z][A-Z .,'’&-]+)/i);
  if (!match) return "";
  return match[1].replace(/\s+/g, " ").trim().replace(/\s{2,}.*/, "");
}

function buildPlaceAliases() {
  const places = readJson(placesPath);
  const aliases = new Map();
  for (const place of places) {
    const name = place.name;
    if (!name || name.length < 4) continue;
    aliases.set(name, { place_id: place.id, name });
  }
  aliases.set("Center for the Arts", {
    place_id: "the-center-for-the-arts-grass-valley",
    name: "The Center for the Arts",
  });
  aliases.set("CFTA", {
    place_id: "the-center-for-the-arts-grass-valley",
    name: "The Center for the Arts",
  });
  aliases.set("GVNC Cultural District", {
    place_id: "",
    name: "Grass Valley-Nevada City Cultural District",
  });
  return aliases;
}

function exactPlaceMatches(text, aliases) {
  const matches = [];
  for (const [alias, place] of aliases) {
    if (alias.length < 10 || alias.trim().split(/\s+/).length < 2) continue;
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(text)) {
      matches.push({
        match_type: "exact",
        name: place.name,
        alias,
        place_id: place.place_id,
      });
    }
  }
  return matches
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((match, index, arr) => arr.findIndex((other) => other.name === match.name) === index);
}

function thematicMatches(text) {
  return themeRules
    .filter(([, pattern]) => pattern.test(text))
    .map(([theme]) => ({
      match_type: "theme",
      theme,
    }));
}

function sourceConfidence(seed, text, exactMatches) {
  const notes = [];
  if (!seed.author && !/\bWORDS\s*\//i.test(text)) notes.push("author not detected");
  if (seed.confidence !== "high") notes.push("article boundary seeded with medium confidence");
  if (exactMatches.length === 0) notes.push("no exact V1 place match detected");
  return {
    level: seed.confidence,
    notes,
  };
}

function buildIndex() {
  const aliases = buildPlaceAliases();
  const articles = [];
  const years = Object.keys(articleSeeds).sort();
  for (const year of years) {
    const manifest = readJson(path.join(corpusDir, year, "manifest.json"));
    const seeds = articleSeeds[year].sort((a, b) => a.page - b.page);
    for (const [index, seed] of seeds.entries()) {
      const next = seeds[index + 1];
      const page_start = seed.page;
      const page_end = Math.min(next ? next.page - 1 : page_start + 1, manifest.page_count);
      const pages = [];
      let articleText = "";
      for (let page = page_start; page <= page_end; page += 1) {
        pages.push(pagePair(year, page));
        articleText += "\n" + readPageText(year, page);
      }
      const exact = exactPlaceMatches(articleText, aliases);
      articles.push({
        id: `muse-${year}-${slugify(seed.title)}`,
        issue_year: Number(year),
        issue: manifest.issue,
        title: seed.title,
        author: deriveAuthor(seed, articleText),
        page_start,
        page_end,
        source_pages: pages,
        exact_place_matches: exact,
        thematic_matches: thematicMatches(articleText),
        source_confidence: sourceConfidence(seed, articleText, exact),
      });
    }
  }
  return {
    schema_version: 1,
    source: {
      corpus_dir: "docs/muse-corpus",
      method: "Semiautomatic seed list over MUSE Page Pairs; place/theme matches generated from OCR text.",
    },
    articles,
  };
}

fs.writeFileSync(outPath, JSON.stringify(buildIndex(), null, 2) + "\n");
console.log(`Wrote ${path.relative(repoRoot, outPath)}`);
