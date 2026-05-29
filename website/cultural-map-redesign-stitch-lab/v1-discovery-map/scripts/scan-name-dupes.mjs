// One-off diagnostic: find same-place records that survived id-dedup because their
// slugs differ (e.g. "The Center for the Arts" vs "Center for the Arts").
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const rows = JSON.parse(readFileSync(join(HERE, "..", "data", "places.json"), "utf8"));

const STOPWORDS = new Set(["the", "a", "an"]);
function normName(s) {
  let n = String(s || "").toLowerCase().trim();
  n = n.replace(/[’'".,()]/g, "").replace(/&/g, " and ").replace(/\s+/g, " ").trim();
  // drop leading article
  const parts = n.split(" ");
  if (STOPWORDS.has(parts[0])) parts.shift();
  return parts.join(" ");
}
function normCity(s) {
  const c = String(s || "").toLowerCase().trim();
  return c === "grass vally" ? "grass valley" : c;
}
function mi(a, b) {
  if (!Number.isFinite(a.lat) || !Number.isFinite(b.lat)) return null;
  const R = 3958.8, t = (x) => (x * Math.PI) / 180;
  const dLa = t(b.lat - a.lat), dLo = t(b.lng - a.lng);
  return 2 * R * Math.asin(Math.sqrt(Math.sin(dLa / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dLo / 2) ** 2));
}

const groups = new Map();
for (const r of rows) {
  const k = normName(r.name) + " | " + normCity(r.city);
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(r);
}

const dups = [...groups.entries()].filter(([, v]) => v.length > 1);
const extra = dups.reduce((n, [, v]) => n + v.length - 1, 0);
console.log("normalized name+city clusters with >1 record:", dups.length);
console.log("extra records hidden in those clusters:", extra);
console.log("");

const report = dups.map(([k, v]) => {
  const dists = [];
  for (let i = 1; i < v.length; i++) { const m = mi(v[0], v[i]); if (m != null) dists.push(+m.toFixed(2)); }
  return {
    name: k.split(" | ")[0],
    city: k.split(" | ")[1],
    n: v.length,
    maxMi: dists.length ? Math.max(...dists) : null,
    tiers: v.map((r) => r.markerTier).join(","),
    ids: v.map((r) => r.id),
  };
}).sort((a, b) => b.n - a.n || (b.maxMi ?? -1) - (a.maxMi ?? -1));

for (const r of report) {
  console.log(`(${r.n}) ${r.name} [${r.city}]  maxΔ=${r.maxMi ?? "—"}mi  tiers=${r.tiers}`);
  for (const id of r.ids) console.log(`      ${id}`);
}
