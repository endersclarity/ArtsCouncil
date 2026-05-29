// canonicalizePlaces — collapse records that are the SAME place under different
// slugs, which id-dedupe (dedupePlaces) cannot see. The slug was derived from the
// name, so "The Center for the Arts" and "Center for the Arts" became different
// ids; likewise apostrophe variants ("McGee's" vs "McGees").
//
// Grouping key: normalized name + normalized city (strip a leading article, fold
// apostrophes/punctuation, collapse whitespace). Within a group:
//  - Co-location guard: only merge if every pair is within MERGE_THRESHOLD_MILES.
//    Two genuinely-different places that share a name in one town stay separate.
//  - Merge with the shared mergePlaceGroup rule (Diana coordinate wins, enrichment
//    unioned, conflicts flagged) — identical to id-dedupe.
//  - Surviving id: if any id in the group is referenced by an anchor card or a path
//    stop, keep THAT id (so references never orphan); otherwise keep the merge
//    winner's id.

import { mergePlaceGroup, haversineMiles, hasCoords } from "./dedupe.mjs";

const MERGE_THRESHOLD_MILES = 0.5;
const ARTICLES = new Set(["the", "a", "an"]);
const CITY_ALIASES = { "grass vally": "grass valley" };

function normName(name) {
  let n = String(name ?? "").toLowerCase().trim();
  n = n.replace(/[’'".,()]/g, "").replace(/&/g, " and ").replace(/\s+/g, " ").trim();
  const parts = n.split(" ");
  if (parts.length > 1 && ARTICLES.has(parts[0])) parts.shift();
  return parts.join(" ");
}

function normCity(city) {
  const c = String(city ?? "").trim().toLowerCase();
  return CITY_ALIASES[c] ?? c;
}

export function canonicalKey(place) {
  return normName(place.name) + " | " + normCity(place.city);
}

// True if any pair of coordinate-bearing rows is farther apart than the threshold.
function tooFarApart(group) {
  const located = group.filter(hasCoords);
  for (let i = 0; i < located.length; i++) {
    for (let j = i + 1; j < located.length; j++) {
      if (haversineMiles(located[i], located[j]) > MERGE_THRESHOLD_MILES) return true;
    }
  }
  return false;
}

function survivingId(group, merged, referencedIds) {
  const referenced = group.map((r) => r.id).filter((id) => referencedIds.has(id));
  return referenced.length ? referenced[0] : merged.id;
}

export function canonicalizePlaces(rows, { referencedIds = new Set() } = {}) {
  const groups = new Map();
  for (const row of rows) {
    const k = canonicalKey(row);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(row);
  }

  const out = [];
  for (const group of groups.values()) {
    if (group.length === 1 || tooFarApart(group)) {
      out.push(...group); // distinct places — leave them alone
      continue;
    }
    const merged = mergePlaceGroup(group);
    merged.id = survivingId(group, merged, referencedIds);
    out.push(merged);
  }
  return out;
}
