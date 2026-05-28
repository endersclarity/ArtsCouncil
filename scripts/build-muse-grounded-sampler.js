const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const mapDataDir = path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data");
const reportsDir = path.join(repoRoot, "reports");

const articleIndexPath = path.join(repoRoot, "docs/muse-corpus/article-index.json");
const evidenceLinksPath = path.join(mapDataDir, "muse_evidence_links.json");
const placesPath = path.join(mapDataDir, "places.json");
const coordinatePassPath = path.join(mapDataDir, "coordinate_sanity_pass.json");
const samplerPath = path.join(mapDataDir, "muse_grounded_sampler.json");
const reportPath = path.join(reportsDir, "muse-grounded-sampler-summary.json");

const RECOMMENDED_SAMPLER_SIZE = 12;
const SHOWCASE_CITIES = new Set(["Grass Valley", "Nevada City"]);
const SHOWCASE_MAX_PER_CITY = 6;
const SHOWCASE_MAX_PER_CATEGORY = 3;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function countBy(items, keyFn) {
  return items.reduce((counts, item) => {
    const key = keyFn(item) || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function coordinateSummary(decision) {
  if (!decision) {
    return {
      status: "No coordinate decision",
      publicMarker: false,
      coordinateSource: null,
      coordinateConfidence: null,
      matchQuality: null,
      reviewNotes: "No coordinate sanity-pass decision matched this V1 place id.",
    };
  }

  return {
    status: decision.locationReviewStatus,
    publicMarker: Boolean(decision.publicMarker),
    coordinateSource: decision.coordinateSource,
    coordinateConfidence: decision.coordinateConfidence,
    matchQuality: decision.matchQuality,
    reviewNotes: decision.reviewNotes,
  };
}

function directEvidenceCategory(articleTitle) {
  if (/acknowledgement/i.test(articleTitle)) return "acknowledgement";
  if (/^letter from the editor/i.test(articleTitle) || /^a letter from/i.test(articleTitle)) {
    return "editor-letter";
  }
  if (/calendar/i.test(articleTitle)) return "calendar";
  if (/get involved/i.test(articleTitle)) return "get-involved";
  if (/welcome to muse/i.test(articleTitle)) return "administrative";
  return "editorial";
}

function sourceArticle(link) {
  const evidenceCategory = directEvidenceCategory(link.article.title);
  return {
    id: link.article.id,
    title: link.article.title,
    issueYear: link.article.issue_year,
    issue: link.article.issue,
    pageStart: link.article.page_start,
    pageEnd: link.article.page_end,
    matchedOn: link.matched_on,
    sourcePages: link.source_pages,
    sourceConfidence: link.source_confidence,
    evidenceCategory,
    editorialQualifying: evidenceCategory === "editorial",
  };
}

function uniqueArticles(links) {
  const articles = new Map();
  for (const link of links) {
    const key = link.article.id;
    if (!articles.has(key)) articles.set(key, sourceArticle(link));
  }
  return Array.from(articles.values()).sort((a, b) => {
    if (a.issueYear !== b.issueYear) return a.issueYear - b.issueYear;
    if (a.pageStart !== b.pageStart) return a.pageStart - b.pageStart;
    return a.title.localeCompare(b.title);
  });
}

function uniqueArticleCount(links) {
  return new Set(links.map((link) => link.article.id)).size;
}

function buildCandidates() {
  const articleIndex = readJson(articleIndexPath);
  const evidence = readJson(evidenceLinksPath);
  const places = readJson(placesPath);
  const coordinatePass = readJson(coordinatePassPath);

  const placesById = new Map(places.map((place) => [place.id, place]));
  const decisionsByPlaceId = new Map();
  for (const decision of coordinatePass.decisions) {
    const current = decisionsByPlaceId.get(decision.id);
    if (!current || (decision.publicMarker && !current.publicMarker)) {
      decisionsByPlaceId.set(decision.id, decision);
    }
  }

  const directPlaceLinks = evidence.links.filter(
    (link) => link.target_type === "place" && link.is_direct_evidence === true,
  );
  const fuzzyPlaceLinks = evidence.links.filter(
    (link) => link.target_type === "place" && link.is_direct_evidence !== true,
  );
  const themeLinks = evidence.links.filter((link) => link.target_type === "theme");

  const directLinksByPlace = new Map();
  for (const link of directPlaceLinks) {
    if (!directLinksByPlace.has(link.target_id)) directLinksByPlace.set(link.target_id, []);
    directLinksByPlace.get(link.target_id).push(link);
  }

  const directCandidates = Array.from(directLinksByPlace.entries()).map(([placeId, links]) => {
    const place = placesById.get(placeId);
    const decision = decisionsByPlaceId.get(placeId);
    const articles = uniqueArticles(links);
    const editorialLinks = links.filter((link) => directEvidenceCategory(link.article.title) === "editorial");
    const nonEditorialLinks = links.filter((link) => directEvidenceCategory(link.article.title) !== "editorial");
    const editorialArticles = uniqueArticles(editorialLinks);
    const nonEditorialArticles = uniqueArticles(nonEditorialLinks);
    const city = place?.city || "";
    const isInShowcaseScope = SHOWCASE_CITIES.has(city);

    return {
      id: placeId,
      name: place?.name || links[0].target_name,
      city,
      category: place?.category || "",
      intent: place?.intent || "",
      address: place?.address || "",
      lat: typeof place?.lat === "number" ? place.lat : null,
      lng: typeof place?.lng === "number" ? place.lng : null,
      directEvidenceLinkCount: links.length,
      directArticleCount: articles.length,
      editorialDirectEvidenceLinkCount: editorialLinks.length,
      editorialDirectArticleCount: editorialArticles.length,
      nonEditorialDirectEvidenceLinkCount: nonEditorialLinks.length,
      nonEditorialDirectArticleCount: uniqueArticleCount(nonEditorialLinks),
      isInShowcaseScope,
      coordinate: coordinateSummary(decision),
      directMuseArticles: articles,
      editorialDirectMuseArticles: editorialArticles,
      nonEditorialDirectMuseArticles: nonEditorialArticles,
    };
  });

  directCandidates.sort((a, b) => {
    if (b.editorialDirectArticleCount !== a.editorialDirectArticleCount) {
      return b.editorialDirectArticleCount - a.editorialDirectArticleCount;
    }
    if (b.directArticleCount !== a.directArticleCount) return b.directArticleCount - a.directArticleCount;
    if (b.directEvidenceLinkCount !== a.directEvidenceLinkCount) return b.directEvidenceLinkCount - a.directEvidenceLinkCount;
    return a.name.localeCompare(b.name);
  });

  const qualifiedForMapSampler = directCandidates.filter((candidate) => candidate.coordinate.publicMarker);
  const showcaseQualifiedCandidates = directCandidates.filter(
    (candidate) =>
      candidate.coordinate.publicMarker && candidate.isInShowcaseScope && candidate.editorialDirectArticleCount > 0,
  );
  const excludedFromMapSampler = directCandidates
    .filter((candidate) => !candidate.coordinate.publicMarker || !candidate.isInShowcaseScope || candidate.editorialDirectArticleCount === 0)
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      city: candidate.city,
      category: candidate.category,
      directArticleCount: candidate.directArticleCount,
      directEvidenceLinkCount: candidate.directEvidenceLinkCount,
      editorialDirectArticleCount: candidate.editorialDirectArticleCount,
      editorialDirectEvidenceLinkCount: candidate.editorialDirectEvidenceLinkCount,
      reason: [
        !candidate.coordinate.publicMarker ? candidate.coordinate.status : null,
        !candidate.isInShowcaseScope ? "Outside Showcase Sampler Scope" : null,
        candidate.editorialDirectArticleCount === 0 ? "No Editorial Direct MUSE Evidence" : null,
      ]
        .filter(Boolean)
        .join("; "),
    }));

  const showcaseSampler = [];
  const cityCounts = {};
  const categoryCounts = {};

  function canTake(candidate, relaxed = false) {
    if (showcaseSampler.some((item) => item.id === candidate.id)) return false;
    if (relaxed) return true;
    return (
      (cityCounts[candidate.city] || 0) < SHOWCASE_MAX_PER_CITY &&
      (categoryCounts[candidate.category] || 0) < SHOWCASE_MAX_PER_CATEGORY
    );
  }

  function take(candidate) {
    showcaseSampler.push(candidate);
    cityCounts[candidate.city] = (cityCounts[candidate.city] || 0) + 1;
    categoryCounts[candidate.category] = (categoryCounts[candidate.category] || 0) + 1;
  }

  for (const candidate of showcaseQualifiedCandidates) {
    if (showcaseSampler.length >= RECOMMENDED_SAMPLER_SIZE) break;
    if (canTake(candidate)) take(candidate);
  }

  for (const candidate of showcaseQualifiedCandidates) {
    if (showcaseSampler.length >= RECOMMENDED_SAMPLER_SIZE) break;
    if (canTake(candidate, true)) take(candidate);
  }

  const directEvidenceCategoryCounts = countBy(directPlaceLinks, (link) => directEvidenceCategory(link.article.title));

  const sampler = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    source: {
      articleIndex: path.relative(repoRoot, articleIndexPath),
      evidenceLinks: path.relative(repoRoot, evidenceLinksPath),
      places: path.relative(repoRoot, placesPath),
      coordinateSanityPass: path.relative(repoRoot, coordinatePassPath),
    },
    rules: [
      "Broader MUSE enrichment candidates require direct MUSE place evidence.",
      "First-load showcase sampler candidates must be in Showcase Sampler Scope: Grass Valley or Nevada City.",
      "First-load showcase sampler candidates must have Editorial Direct MUSE Evidence.",
      "Administrative, acknowledgement, get-involved, editor-letter, and calendar direct mentions are preserved but excluded as first-load showcase qualifiers.",
      "Fuzzy place links and theme links are counted as exclusions, not qualification evidence.",
      "The MUSE Article Index is seeded and semiautomatic; this artifact does not claim exhaustive MUSE coverage.",
      "First-load showcase sampler entries must have Map-Ready coordinate sanity-pass status.",
      `First-load showcase sampler is capped at ${RECOMMENDED_SAMPLER_SIZE} places with greedy city/category diversity.`,
    ],
    counts: {
      articleIndexArticles: articleIndex.articles.length,
      evidenceLinksTotal: evidence.links.length,
      directPlaceEvidenceLinks: directPlaceLinks.length,
      directMusePlaceCandidatesConsidered: directCandidates.length,
      directEvidenceCategoryCounts,
      editorialDirectPlaceEvidenceLinks: directEvidenceCategoryCounts.editorial || 0,
      nonEditorialDirectPlaceEvidenceLinks: directPlaceLinks.length - (directEvidenceCategoryCounts.editorial || 0),
      fuzzyPlaceLinksExcludedAsQualifiers: fuzzyPlaceLinks.length,
      themeLinksExcludedAsQualifiers: themeLinks.length,
      beforeRefinement: {
        qualifiedMapReadyDirectCandidates: qualifiedForMapSampler.length,
        finalRecommendedSamplerSize: Math.min(RECOMMENDED_SAMPLER_SIZE, qualifiedForMapSampler.length),
      },
      showcaseScopeDirectCandidates: directCandidates.filter((candidate) => candidate.isInShowcaseScope).length,
      showcaseEditorialDirectCandidates: directCandidates.filter(
        (candidate) => candidate.isInShowcaseScope && candidate.editorialDirectArticleCount > 0,
      ).length,
      qualifiedShowcaseCandidates: showcaseQualifiedCandidates.length,
      excludedDirectCandidates: excludedFromMapSampler.length,
      finalRecommendedSamplerSize: showcaseSampler.length,
      coordinateStatusSplit: countBy(directCandidates, (candidate) => candidate.coordinate.status),
      showcaseExclusionReasonSplit: countBy(excludedFromMapSampler, (candidate) => candidate.reason),
      recommendedCitySplit: countBy(showcaseSampler, (candidate) => candidate.city),
      recommendedCategorySplit: countBy(showcaseSampler, (candidate) => candidate.category),
    },
    recommendedSampler: showcaseSampler,
    showcaseSampler,
    showcaseQualifiedCandidates,
    qualifiedCandidates: qualifiedForMapSampler,
    directMuseCandidates: directCandidates,
    excludedDirectCandidates: excludedFromMapSampler,
  };

  return sampler;
}

function buildReport(sampler) {
  return {
    generatedAt: sampler.generatedAt,
    recommendation:
      sampler.counts.finalRecommendedSamplerSize === RECOMMENDED_SAMPLER_SIZE
        ? "Ready to inform the Browse Starting View prototype/UI pass, pending product review of editorial mix and implicit MUSE copy."
        : "Not ready to inform the Browse Starting View prototype/UI pass; sampler did not reach target size.",
    counts: sampler.counts,
    recommendedSampler: sampler.recommendedSampler.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      city: candidate.city,
      category: candidate.category,
      coordinateStatus: candidate.coordinate.status,
      coordinateSource: candidate.coordinate.coordinateSource,
      directArticleCount: candidate.directArticleCount,
      directEvidenceLinkCount: candidate.directEvidenceLinkCount,
      editorialDirectArticleCount: candidate.editorialDirectArticleCount,
      editorialDirectEvidenceLinkCount: candidate.editorialDirectEvidenceLinkCount,
      evidence: candidate.editorialDirectMuseArticles.slice(0, 3).map((article) => ({
        title: article.title,
        issueYear: article.issueYear,
        pages: `${article.pageStart}-${article.pageEnd}`,
        matchedOn: article.matchedOn,
        evidenceCategory: article.evidenceCategory,
      })),
    })),
    caveats: [
      "The MUSE Article Index is seeded and semiautomatic, not exhaustive.",
      "Fuzzy place links and theme-only links were not used as qualifying evidence.",
      "Administrative, acknowledgement, get-involved, editor-letter, and calendar direct mentions were preserved but not used for first-load showcase qualification.",
      "Truckee, Penn Valley, and other outside-scope direct candidates remain available for future MUSE-backed card enrichment.",
      "Coordinate status was joined from the existing coordinate sanity pass; no new geocoding was performed.",
    ],
  };
}

const sampler = buildCandidates();
writeJson(samplerPath, sampler);
writeJson(reportPath, buildReport(sampler));
console.log(
  `MUSE grounded showcase sampler built: ${sampler.counts.finalRecommendedSamplerSize} recommended of ${sampler.counts.qualifiedShowcaseCandidates} showcase-qualified candidates`,
);
