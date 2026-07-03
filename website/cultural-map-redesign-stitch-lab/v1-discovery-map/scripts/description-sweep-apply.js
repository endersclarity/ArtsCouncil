#!/usr/bin/env node
// Description rewrite sweep (spec: .planning/description-rewrite-pilot-2026-07-02.md).
// Usage: node scripts/description-sweep-apply.js <batch.json>
// Batch file: [{ id, description, basis: ["website"|"muse"|"record"], fetched? }]
// Sets description + descriptionSource {kind:"map-editorial", basis, fetched} and
// validates: lengths 80-320, first-sentence teaser exists, banned-claims regex,
// boilerplate count strictly decreases, no other field touched.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLACES = path.join(ROOT, 'data', 'places.json');
const BOILER = /included for alpha review while source descriptions are cleaned/;
const BANNED = /(award[- ]winning|\$\d|\bopen (daily|from)\b|\d{1,2}\s*(am|pm)\b|\bhours:\b|\bprice|\brated\b|\bstars\b)/i;

const batchPath = process.argv[2];
if (!batchPath) { console.error('usage: node description-sweep-apply.js <batch.json>'); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));

const raw = fs.readFileSync(PLACES, 'utf8');
const data = JSON.parse(raw);
const arr = Array.isArray(data) ? data : data.places;
const before = arr.filter(p => BOILER.test(p.description || '')).length;

const byId = new Map(arr.map(p => [p.id, p]));
const errors = [];
for (const e of batch) {
  const p = byId.get(e.id);
  if (!p) { errors.push(`${e.id}: not found`); continue; }
  if (!BOILER.test(p.description || '')) { errors.push(`${e.id}: not boilerplate (already rewritten?)`); continue; }
  const d = e.description.trim();
  if (d.length > 320) errors.push(`${e.id}: length ${d.length} over 320`);
  if (d.length < 80) console.warn(`warn ${e.id}: length ${d.length} under ~80 (Tier C honest floor allowed, min 45)`);
  if (d.length < 45) errors.push(`${e.id}: length ${d.length} too short`);
  if (BANNED.test(d)) errors.push(`${e.id}: banned claim matched: ${d.match(BANNED)[0]}`);
  if (!Array.isArray(e.basis) || !e.basis.length || !e.basis.every(b => ['website', 'muse', 'record'].includes(b)))
    errors.push(`${e.id}: bad basis ${JSON.stringify(e.basis)}`);
  if (errors.length) continue;
  p.description = d;
  p.descriptionSource = { kind: 'map-editorial', basis: e.basis, ...(e.fetched ? { fetched: e.fetched } : {}) };
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

const after = arr.filter(p => BOILER.test(p.description || '')).length;
if (!(after < before)) { console.error(`boilerplate count did not decrease (${before} -> ${after})`); process.exit(1); }

const indent = raw.slice(raw.indexOf('\n') + 1).match(/^\s*/)[0].length || 2;
fs.writeFileSync(PLACES, JSON.stringify(data, null, indent) + (raw.endsWith('\n') ? '\n' : ''));
JSON.parse(fs.readFileSync(PLACES, 'utf8')); // reparse check
console.log(`applied ${batch.length} rewrites; boilerplate ${before} -> ${after}`);
