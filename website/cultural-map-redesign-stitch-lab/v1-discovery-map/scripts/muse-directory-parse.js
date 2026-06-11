#!/usr/bin/env node
/**
 * muse-directory-parse.js — Stage 1 of the MUSE business directory layer
 * (PRD: .planning/muse-directory-layer-PRD-2026-06-10.md).
 *
 * Parses the MUSE Business Directory pages (2024, 2025, 2026) from the OCR
 * corpus at docs/muse-corpus/{year}/pages/*.txt into structured listings,
 * then reconciles them against data/places.json (466 musePick flags).
 *
 * The OCR is column-aligned plain text with interleaved columns: each page
 * is 3-4 vertical columns and reading order runs DOWN each column, not
 * across lines. Columns are detected per page by whitespace-frequency
 * profiling, then each column is split into blank-line blocks and each
 * block parsed into { name, museCategory, address, phone, website }.
 *
 * Outputs (both under scripts/, review artifacts — not app data):
 *   scripts/muse-directory-listings.json  — structured listings per issue
 *   scripts/muse-directory-reconcile.md   — human review doc
 *
 * This script changes NOTHING in places.json. Apply step is separate
 * (muse-directory-apply.js) and gated on owner sign-off of the review doc.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const APP_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(APP_DIR, "..", "..", "..");
const CORPUS = path.join(REPO_ROOT, "docs", "muse-corpus");
const PLACES_PATH = path.join(APP_DIR, "data", "places.json");

// Directory page ranges per issue (print page numbers == corpus file numbers;
// verified against "Business Directory | ..." footers in the OCR).
const DIRECTORY_PAGES = {
  2024: range(66, 71),
  2025: range(96, 105),
  2026: range(95, 105),
};

function range(a, b) {
  const out = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

// ---------------------------------------------------------------- column split

/**
 * Detect column boundaries on a page by finding char positions that are
 * whitespace on (nearly) every non-blank line. Runs of such positions at
 * least MIN_GAP wide are treated as gutters between columns.
 */
function detectColumns(lines) {
  const content = lines.filter((l) => l.trim().length > 0);
  if (!content.length) return [];
  const width = Math.max(...content.map((l) => l.length));
  const spaceFrac = new Array(width).fill(0);
  for (const line of content) {
    for (let i = 0; i < width; i++) {
      if (i >= line.length || line[i] === " ") spaceFrac[i] += 1;
    }
  }
  const n = content.length;
  const isGutter = spaceFrac.map((c) => c / n >= 0.97);
  const MIN_GAP = 3;
  const gutters = [];
  let runStart = -1;
  for (let i = 0; i <= width; i++) {
    const g = i < width && isGutter[i];
    if (g && runStart < 0) runStart = i;
    if (!g && runStart >= 0) {
      if (i - runStart >= MIN_GAP) gutters.push([runStart, i]);
      runStart = -1;
    }
  }
  // Column extents: text between gutters (drop leading gutter at pos 0).
  const cols = [];
  let prev = 0;
  for (const [gs, ge] of gutters) {
    if (gs > prev) cols.push([prev, gs]);
    prev = ge;
  }
  if (prev < width) cols.push([prev, width]);
  // Drop slivers (decorative OCR noise columns narrower than 8 chars).
  return cols.filter(([a, b]) => b - a >= 8);
}

function sliceColumns(lines, cols) {
  return cols.map(([a, b]) =>
    lines.map((l) => l.slice(a, b).replace(/\s+$/, ""))
  );
}

// ---------------------------------------------------------------- block parse

const PHONE_RE = /^\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})$/;
const TLD_RE =
  /\.(com|org|net|coop|biz|us|info|co|io|edu|shop|cafe|wine|art|gallery)(\/|$)/i;
const CITY_NAMES = [
  "Nevada City",
  "Grass Valley",
  "Penn Valley",
  "Truckee",
  "Rough and Ready",
  "North San Juan",
  "Cedar Ridge",
  "Chicago Park",
  "Smartsville",
  "Washington",
  "Colfax",
  "Auburn",
  "Soda Springs",
  "Norden",
  "Olympic Valley",
  "Alta Sierra",
  "Floriston",
  "Tahoe City",
];
const STREET_RE =
  /\b(St|Ave|Rd|Way|Dr|Hwy|Blvd|Ln|Ct|Pl|Trail|Street|Avenue|Road|Drive|Lane|Court|Broadway|Pass)\b/;
const CATEGORY_VOCAB =
  /(Restaurant|Bar|Cafe|Coffee|Bakery|Roastery|Grocery|Deli|Market|Winery|Wine|Brewery|Distillery|Tasting|Gallery|Art|Studio|Antiques|Vintage|Apparel|Boutique|Jewelry|Books?|Music|Theater|Theatre|Lodging|Hotel|Inn|Motel|Resort|Spa|Salon|Yoga|Fitness|Gym|Recreation|Outdoor|Gear|Gifts?|Decor|Florist|Photography|Pottery|Ceramics|Glass|Wood|Leather|Candles?|Chocolate|Candy|Candies|Ice Cream|Yogurt|Dispensary|Cannabis|Apothecary|Herbal|Pizzeria|Brewpub|Pub|Tavern|Sushi|Mexican|Thai|Italian|Catering|Butcher|Cheese|Olive|Tea|Juice|Smoothie|Espresso|Sourdough|Tortilleria|Salumeria|Print|Design|Supply|Supplies|Frame|Framing|Museum|Venue|Events?|Live Music|Toys?|Kids|Pet|Garden|Nursery|Hardware|Surplus|Consignment|Thrift|Barber|Tattoo|Cidery|Meadery|Kombucha|Beverages|Snowboard|Skate|Ski|Climbing|Golf|Axe|Cowork|Conference|Production|Video|Film|Exchange|Service)/i;

function isAllCapsHeader(line) {
  const t = line.trim();
  if (t.length < 3) return false;
  const letters = t.replace(/[^A-Za-z]/g, "");
  if (letters.length < 3) return false;
  return letters === letters.toUpperCase();
}

function isPhone(t) {
  return PHONE_RE.test(t.trim());
}

function isWebsite(t) {
  const s = t.trim();
  if (/\s/.test(s) && !s.startsWith("/")) {
    // a website token has no internal spaces (allow OCR'd "  /handle")
    if (!/^\S+$/.test(s)) return false;
  }
  if (TLD_RE.test(s) || /^[@/]\S+$/.test(s)) return true;
  // bare social handle, OCR loses the @/instagram glyph: one lowercase token
  return /^[a-z0-9_.]{6,}$/.test(s) && !CATEGORY_VOCAB.test(s);
}

function isAddressStart(t) {
  const s = t.trim();
  if (!/\d/.test(s)) return false;
  if (isPhone(s) || isWebsite(s)) return false;
  return STREET_RE.test(s) || CITY_NAMES.some((c) => s.includes(c));
}

function isCityOnly(t) {
  const s = t.trim().replace(/,$/, "");
  return CITY_NAMES.includes(s) || /^(Ste|Suite|Unit|#)\s*\S+,?\s/.test(s);
}

function looksLikeCategory(t) {
  const s = t.trim();
  if (!s) return false;
  if (/\//.test(s)) return true;
  return CATEGORY_VOCAB.test(s) && s.length <= 45;
}

/**
 * Build a listing object from accumulated lines. pre = text lines before
 * the first contact line (name + category); contact = address/phone/site.
 */
function finishListing(pre, contact, ctx) {
  const listing = {
    name: "",
    museCategory: "",
    address: "",
    phone: "",
    website: "",
    issue: ctx.year,
    page: ctx.page,
    section: ctx.section,
    parseNotes: [],
  };
  const addrParts = [];
  for (const t of contact) {
    if (isPhone(t)) {
      if (listing.phone) listing.parseNotes.push(`extra phone: ${t}`);
      else listing.phone = t.replace(/[.\s-]+/g, " ").trim();
    } else if (isAddressStart(t) || isCityOnly(t)) {
      addrParts.push(t.replace(/,$/, ""));
    } else if (isWebsite(t)) {
      if (listing.website) listing.website += t; // OCR-wrapped URL
      else listing.website = t;
    } else {
      listing.parseNotes.push(`unclassified: ${t}`);
    }
  }
  listing.address = addrParts.join(", ");

  // split pre into name vs category: trailing contiguous category-looking
  // lines are the category, the rest is the name.
  let catStart = pre.length;
  while (catStart > 1 && looksLikeCategory(pre[catStart - 1])) catStart--;
  listing.name = pre.slice(0, catStart).join(" ").trim();
  listing.museCategory = pre
    .slice(catStart)
    .join(" ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();

  if (!listing.name && listing.museCategory) {
    listing.name = listing.museCategory;
    listing.museCategory = "";
  }
  // discard fragments: no name, or nothing to locate/contact the business by
  if (!listing.name) return null;
  if (!listing.address && !listing.phone && !listing.website) {
    ctx.discarded.push(`${ctx.year} p.${ctx.page}: ${listing.name}`);
    return null;
  }
  return listing;
}

// ---------------------------------------------------------------- page parse

function parsePage(year, page) {
  const file = path.join(
    CORPUS,
    String(year),
    "pages",
    `muse-${year}-page-${String(page).padStart(3, "0")}.txt`
  );
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf8");
  let lines = raw.split(/\r?\n/);
  // strip footer ("Business Directory | ..." line and trailing page number)
  lines = lines.filter((l) => !/Business Directory\s*\|/.test(l));
  const cols = detectColumns(lines);
  const columns = sliceColumns(lines, cols);
  const listings = [];
  const ctx = { year, page, section: "", discarded: discardedGlobal };

  // Streaming state machine per column. The OCR interleaves columns, so
  // after slicing a column its lines contain blank gaps INSIDE listings —
  // blank lines are NOT listing separators. Instead: a new listing starts
  // when a non-contact text line appears after the current listing already
  // has contact info (address/phone/website).
  for (const col of columns) {
    let pre = [];
    let contact = [];
    const flush = () => {
      const li = finishListing(pre, contact, ctx);
      if (li) listings.push(li);
      pre = [];
      contact = [];
    };
    for (const raw of col) {
      const t = raw.trim();
      if (!t) continue;
      if (isAllCapsHeader(t)) {
        if (pre.length || contact.length) flush();
        // headers can wrap two lines ("COFFEE SHOPS /" + "BAKERIES")
        ctx.section = ctx.section.endsWith("/")
          ? `${ctx.section} ${t}`.replace(/\s+/g, " ")
          : t;
        continue;
      }
      const contactLike = isPhone(t) || isAddressStart(t) || isCityOnly(t) || isWebsite(t);
      if (contactLike) {
        contact.push(t);
      } else if (contact.length) {
        flush();
        pre.push(t);
      } else {
        pre.push(t);
      }
    }
    if (pre.length || contact.length) flush();
  }
  return listings;
}

const discardedGlobal = [];

// ---------------------------------------------------------------- normalize

function normName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/['’‘"“”]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|a|an)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normDomain(s) {
  let d = String(s || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "");
  d = d.split(/[/?#]/)[0];
  return d;
}

function listingCity(listing) {
  for (const c of CITY_NAMES) {
    if (listing.address.includes(c)) return c;
  }
  return "";
}

// ---------------------------------------------------------------- reconcile

function main() {
  const places = JSON.parse(fs.readFileSync(PLACES_PATH, "utf8"));

  const allListings = [];
  for (const yearStr of Object.keys(DIRECTORY_PAGES)) {
    const year = Number(yearStr);
    for (const page of DIRECTORY_PAGES[year]) {
      allListings.push(...parsePage(year, page));
    }
  }

  // index places
  const byDomain = new Map();
  const byNameCity = new Map();
  const byName = new Map();
  for (const p of places) {
    const d = normDomain(p.website);
    if (d) {
      if (!byDomain.has(d)) byDomain.set(d, []);
      byDomain.get(d).push(p);
    }
    const n = normName(p.name);
    if (n) {
      const key = `${n}|${(p.city || "").toLowerCase()}`;
      if (!byNameCity.has(key)) byNameCity.set(key, []);
      byNameCity.get(key).push(p);
      if (!byName.has(n)) byName.set(n, []);
      byName.get(n).push(p);
    }
  }

  const matches = []; // { listing, place, method }
  const ambiguous = []; // { listing, candidates, method }
  const unmatched = [];

  for (const li of allListings) {
    let cands = [];
    let method = "";
    const dom = normDomain(li.website);
    if (dom && !dom.startsWith("@") && byDomain.has(dom)) {
      cands = byDomain.get(dom);
      method = "domain";
    }
    if (!cands.length) {
      const key = `${normName(li.name)}|${listingCity(li).toLowerCase()}`;
      if (byNameCity.has(key)) {
        cands = byNameCity.get(key);
        method = "name+city";
      }
    }
    if (!cands.length && byName.has(normName(li.name))) {
      cands = byName.get(normName(li.name));
      method = "name-only";
    }
    if (cands.length > 1) {
      // tie-break shared domains / duplicate names: name-token overlap,
      // then city agreement. Only stays ambiguous if truly tied.
      const liTokens = new Set(normName(li.name).split(" ").filter(Boolean));
      const liCity = listingCity(li).toLowerCase();
      const scored = cands.map((p) => {
        const pt = normName(p.name).split(" ").filter(Boolean);
        let overlap = 0;
        for (const t of pt) if (liTokens.has(t)) overlap++;
        const denom = Math.max(pt.length, liTokens.size, 1);
        let score = overlap / denom;
        if (liCity && (p.city || "").toLowerCase() === liCity) score += 0.15;
        return { p, score };
      });
      scored.sort((a, b) => b.score - a.score);
      if (scored[0].score >= 0.5 && scored[0].score - scored[1].score > 0.1) {
        cands = [scored[0].p];
        method += "+namescore";
      }
    }
    if (cands.length === 1) {
      matches.push({ listing: li, place: cands[0], method });
    } else if (cands.length > 1) {
      ambiguous.push({ listing: li, candidates: cands, method });
    } else {
      unmatched.push(li);
    }
  }

  // aggregate matched listings per place
  const perPlace = new Map(); // id -> { place, listings: [] }
  for (const m of matches) {
    if (!perPlace.has(m.place.id))
      perPlace.set(m.place.id, { place: m.place, listings: [], methods: [] });
    perPlace.get(m.place.id).listings.push(m.listing);
    perPlace.get(m.place.id).methods.push(m.method);
  }

  // flagged places never matched in any issue / absent from 2026
  const flagged = places.filter((p) => p.musePick);
  const matched2026 = new Set(
    matches.filter((m) => m.listing.issue === 2026).map((m) => m.place.id)
  );
  const matchedAny = new Set(matches.map((m) => m.place.id));
  const flaggedAbsent2026 = flagged.filter((p) => !matched2026.has(p.id));
  const flaggedNeverMatched = flagged.filter((p) => !matchedAny.has(p.id));
  const matchedButUnflagged = [...perPlace.values()].filter(
    (e) => !e.place.musePick
  );

  // write listings JSON
  const listingsOut = path.join(__dirname, "muse-directory-listings.json");
  fs.writeFileSync(
    listingsOut,
    JSON.stringify(
      {
        generated: new Date().toISOString().slice(0, 10),
        source: "docs/muse-corpus OCR, directory pages only",
        pages: DIRECTORY_PAGES,
        counts: {
          listings: allListings.length,
          matched: matches.length,
          ambiguous: ambiguous.length,
          unmatched: unmatched.length,
        },
        listings: allListings,
        matches: matches.map((m) => ({
          placeId: m.place.id,
          method: m.method,
          issue: m.listing.issue,
          page: m.listing.page,
          name: m.listing.name,
          museCategory: m.listing.museCategory,
        })),
      },
      null,
      2
    )
  );

  // ------------------------------------------------------------- review doc
  const fmtListing = (li) =>
    `**${li.name}** — ${li.museCategory || "(no category parsed)"} · ` +
    `${li.address || "(no address)"} · ${li.website || li.phone || "(no contact)"} ` +
    `_(MUSE ${li.issue}, p.${li.page}${li.section ? `, section "${li.section}"` : ""})_`;

  const lines = [];
  lines.push("# MUSE Business Directory reconciliation — review doc");
  lines.push("");
  lines.push(`Generated ${new Date().toISOString().slice(0, 10)} by scripts/muse-directory-parse.js.`);
  lines.push("");
  lines.push(
    "This is the human review gate from the PRD (.planning/muse-directory-layer-PRD-2026-06-10.md §4.1)."
  );
  lines.push(
    "Nothing here has changed places.json. The staged data commit that follows applies only the"
  );
  lines.push(
    "matched-place enrichments (museCategory / museIssues / musePage) and the MUSE-Picks category"
  );
  lines.push(
    "re-home — it is a separate, clearly-named commit the owner can drop before merge."
  );
  lines.push("");
  lines.push("## Headline numbers");
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`|---|---|`);
  lines.push(`| OCR listings parsed (3 issues, directory pages only) | ${allListings.length} |`);
  for (const y of [2024, 2025, 2026]) {
    lines.push(
      `| … ${y} issue (pp. ${DIRECTORY_PAGES[y][0]}–${DIRECTORY_PAGES[y][DIRECTORY_PAGES[y].length - 1]}) | ${allListings.filter((l) => l.issue === y).length} |`
    );
  }
  lines.push(`| Listings matched to a place | ${matches.length} |`);
  lines.push(`| … by website domain | ${matches.filter((m) => m.method.startsWith("domain")).length} |`);
  lines.push(`| … by name + city | ${matches.filter((m) => m.method.startsWith("name+city")).length} |`);
  lines.push(`| … by name only (weaker — spot-check) | ${matches.filter((m) => m.method.startsWith("name-only")).length} |`);
  lines.push(`| Ambiguous (multiple candidate places) | ${ambiguous.length} |`);
  lines.push(`| Unmatched listings (no place found) | ${unmatched.length} |`);
  lines.push(`| Distinct places matched | ${perPlace.size} |`);
  lines.push(`| Places flagged musePick today | ${flagged.length} |`);
  lines.push(`| Flagged places NOT in the 2026 directory parse | ${flaggedAbsent2026.length} |`);
  lines.push(`| Flagged places never matched in ANY issue | ${flaggedNeverMatched.length} |`);
  lines.push(`| Matched places NOT currently flagged | ${matchedButUnflagged.length} |`);
  lines.push("");
  lines.push("OCR caveat: the directory pages are multi-column scans; the parser profiles");
  lines.push("whitespace to split columns and blank lines to split listings. A small tail of");
  lines.push("listings is mangled (merged blocks, lost handles); they surface below as");
  lines.push("unmatched or with parse notes rather than being silently guessed.");
  lines.push("");

  lines.push("## 1. Unmatched listings (review: candidate adds or match fixes — PRD §6: no auto-adds)");
  lines.push("");
  for (const y of [2026, 2025, 2024]) {
    const u = unmatched.filter((l) => l.issue === y);
    lines.push(`### ${y} (${u.length})`);
    lines.push("");
    for (const li of u) lines.push(`- ${fmtListing(li)}`);
    lines.push("");
  }

  lines.push("## 2. Ambiguous matches (multiple candidate places — owner picks)");
  lines.push("");
  if (!ambiguous.length) lines.push("(none)");
  for (const a of ambiguous) {
    lines.push(`- ${fmtListing(a.listing)}`);
    for (const c of a.candidates)
      lines.push(`  - candidate: ${c.name} (${c.id}, ${c.city || "no city"}, category ${c.category})`);
  }
  lines.push("");

  lines.push("## 3. Flagged places absent from the 2026 directory (stale flags? annotate, don't unflag — PRD §9 Q6)");
  lines.push("");
  const absentButOlder = flaggedAbsent2026.filter((p) => matchedAny.has(p.id));
  lines.push(`### 3a. Found only in older issues (${absentButOlder.length}) — badge will say the honest year`);
  lines.push("");
  for (const p of absentButOlder) {
    const yrs = [...new Set(matches.filter((m) => m.place.id === p.id).map((m) => m.listing.issue))].sort();
    lines.push(`- ${p.name} (${p.id}, ${p.city || "no city"}) — issues: ${yrs.join(", ")}`);
  }
  lines.push("");
  lines.push(`### 3b. Never matched in any issue parse (${flaggedNeverMatched.length}) — flag provenance unknown; owner review`);
  lines.push("");
  lines.push("These keep musePick (nothing silently unflagged) but get no museCategory/museIssues.");
  lines.push("Likely mix of: OCR misses, name drift, editorial picks outside the business directory.");
  lines.push("");
  for (const p of flaggedNeverMatched) {
    lines.push(`- ${p.name} (${p.id}, ${p.city || "no city"}, category ${p.category})`);
  }
  lines.push("");

  lines.push("## 4. Matched but not currently flagged (candidate flag adds — owner sign-off required)");
  lines.push("");
  for (const e of matchedButUnflagged) {
    const yrs = [...new Set(e.listings.map((l) => l.issue))].sort();
    const weak = e.methods.every((m) => m === "name-only") ? " ⚠ name-only match" : "";
    lines.push(`- ${e.place.name} (${e.place.id}, category ${e.place.category}) — in MUSE ${yrs.join(", ")}${weak}`);
  }
  lines.push("");

  lines.push("## 5. MUSE-Picks category re-home plan (the 186)");
  lines.push("");
  const musePicksCat = places.filter((p) => p.category === "MUSE Picks");
  const rehome = musePicksCat.map((p) => {
    const entry = perPlace.get(p.id);
    const mc = entry
      ? entry.listings.sort((a, b) => b.issue - a.issue)[0].museCategory
      : "";
    return { place: p, museCategory: mc, target: mapCategory(mc, entry) };
  });
  const counts = {};
  for (const r of rehome) counts[r.target] = (counts[r.target] || 0) + 1;
  lines.push("Proposed mapping museCategory → map category (PRD §5). Visibility unchanged");
  lines.push("(markerTier/publicMarker untouched; PRD §9 Q3).");
  lines.push("");
  lines.push("| Target category | Count |");
  lines.push("|---|---|");
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1]))
    lines.push(`| ${k} | ${v} |`);
  lines.push("");
  for (const r of rehome) {
    lines.push(
      `- ${r.place.name} (${r.place.id}) — museCategory "${r.museCategory || "—"}" → **${r.target}**`
    );
  }
  lines.push("");
  lines.push("## 6. Parse notes (lines the parser could not classify — transparency)");
  lines.push("");
  let noteCount = 0;
  for (const li of allListings) {
    if (li.parseNotes.length) {
      noteCount++;
      lines.push(`- ${li.name} (MUSE ${li.issue} p.${li.page}): ${li.parseNotes.join("; ")}`);
    }
  }
  if (!noteCount) lines.push("(none)");
  lines.push("");

  fs.writeFileSync(path.join(__dirname, "muse-directory-reconcile.md"), lines.join("\n"));

  console.log("listings:", allListings.length, "matched:", matches.length, "ambiguous:", ambiguous.length, "unmatched:", unmatched.length);
  console.log("flagged:", flagged.length, "absent-2026:", flaggedAbsent2026.length, "never-matched:", flaggedNeverMatched.length, "matched-unflagged:", matchedButUnflagged.length);
  console.log("wrote", listingsOut, "and muse-directory-reconcile.md");
}

/**
 * Map a MUSE directory category label to a real map category for the
 * 186 MUSE-Picks-category places (PRD §5). Conservative keyword routing;
 * anything unrecognized goes to Shops & Makers (the directory's retail
 * default) and is visible in the review doc for owner override.
 */
function mapCategory(museCategory, entry) {
  const s = (museCategory || "").toLowerCase();
  const section = entry
    ? (entry.listings[0].section || "").toLowerCase()
    : "";
  const both = `${s} ${section}`;
  if (
    /restaurant|bar\b|cafe|coffee|bakery|roastery|grocery|deli|market|winery|wine|brew|distill|tasting|pizzeria|pub|tavern|sushi|mexican|thai|italian|butcher|cheese|olive|tea\b|juice|espresso|sourdough|tortilleria|salumeria|ice cream|yogurt|chocolate|candy|candies|dessert|beverage|lodging|hotel|inn\b|motel|resort|bed and breakfast|b&b|catering/.test(
      both
    )
  )
    return "Eat, Drink & Stay";
  if (/gallery|studio|photograph|pottery|ceramic|glass(?! repair)|sculpt|paint|printmak|art(?!s? council)/.test(both))
    return "Galleries & Studios";
  if (/theater|theatre|music venue|performing|dance|cinema|film(?! lab)|comedy/.test(both))
    return "Performing Arts";
  if (/museum|historic|heritage|library|archive/.test(both))
    return "Historic Places";
  if (/arts council|nonprofit|foundation|guild|association/.test(both))
    return "Arts Organizations";
  if (/book|record|music shop|instrument/.test(both)) return "Shops & Makers";
  return "Shops & Makers";
}

module.exports = { mapCategory, normName, normDomain };

if (require.main === module) main();
