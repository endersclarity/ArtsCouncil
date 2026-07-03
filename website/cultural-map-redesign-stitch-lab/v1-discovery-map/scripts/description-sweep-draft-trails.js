#!/usr/bin/env node
// Drafts descriptions for the remaining Walks & Trails boilerplate records.
// Reads .planning/sweep-batches/trails-grounding.json, emits batch files of ~40.
// Hand-written overrides carry Tier A (fetched) and MUSE-heavy copy; everything
// else gets record-grounded Tier B/C copy per the voice guide.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const recs = JSON.parse(fs.readFileSync(path.join(ROOT, '.planning/sweep-batches/trails-grounding.json'), 'utf8'));

const F = '2026-07-03';
const overrides = {
  'pioneer-park-nevada-city': { d: "Nevada City's Pioneer Park, on Nimrod Street — a recurring MUSE stop, from the annual Calendar of Events to 'A Filmmaking Tradition' and 'Lucky Little Towns.'", b: ['muse', 'record'] },
  'west-end-beach-truckee': { d: "Truckee's West End Beach, on South Shore Drive — featured in MUSE's 'Seasons in the Truckee Cultural District' and 'Mountain Heart. Small-Town Soul.'", b: ['muse', 'record'] },
  'south-yuba-river-state-park-penn-valley': { d: "South Yuba River State Park, off Pleasant Valley Road in Penn Valley — one of the outings in MUSE's 'Seasons in the GVNC Cultural District.'", b: ['muse', 'record'] },
  'deer-creek-tribute-trail': { d: "A walking trail in Nevada County whose route is drawn on this map — a stop in MUSE's '48 Hours in GVNC: Exploring Culture & Art.'", b: ['muse', 'record'] },
  'pioneer-trail': { d: "A walking trail in Nevada County; its route is drawn on this map, and it appears in MUSE's '48 Hours in GVNC: Exploring Culture & Art.'", b: ['muse', 'record'] },
  'wolf-creek-trail': { d: "A walking trail in Nevada County whose route is drawn on this map — featured in MUSE's '48 Hours in GVNC: Exploring Culture & Art' and the 'Truckee Public Art Master Plan Vision.'", b: ['muse', 'record'] },
  'boca-reservoir-truckee': { d: "A reservoir off Stampede Dam Road near Truckee, with camping managed through recreation.gov.", b: ['record'] },
  'donner-summit-petroglyphs-and-bridge-truckee': { d: "Dozens of sites around Donner Summit where petroglyphs were incised into granite, within view of the surrounding peaks — no one knows what the abstract symbols mean. Reached from Donner Pass Road near Truckee.", b: ['website'], f: F },
  'dewbeyumuwe-park-at-west-river-street-truckee': { d: "Truckee's riverfront park on West River Street — Dewbeyúmuweɂ is a Washoe name meaning 'the water running out,' honoring the Truckee River as Lake Tahoe's outlet. It opened to the public in October 2025.", b: ['website'], f: F },
  'bear-river-historic-bridge-grass-valley': { d: "A Bear River site on the Colfax Highway near Grass Valley, named for the 1908 narrow-gauge railroad bridge that once crossed here — the highest railway bridge in California in its day, demolished in 1963 for the Rollins Dam project.", b: ['website'], f: F },
  'walking-tour-of-historic-grass-valley-self-guided-and-guided-grass-valley': { d: "A self-guided walking tour of Grass Valley, beginning at Neal and South Church Streets and taking in the Del Oro Theatre, the Holbrooke Hotel, and the Mill Street historic district.", b: ['website'], f: F },
  'fall-colors-in-nevada-city-self-guided-tour-nevada-city': { d: "A self-guided fall-colors tour of Nevada City starting from Broad Street; the Nevada City Chamber publishes the route.", b: ['record'] },
  'scotts-flat-lake-and-trails-nevada-city': { d: "Scotts Flat Lake and its trails, off Scotts Flat Road near Nevada City; the Scotts Flat Trail's route is drawn on this map.", b: ['record'] },
  'emerald-pools-south-yuba-river-nevada-city': { d: "A stretch of the South Yuba River known as the Emerald Pools, reached from Forest Route 18 near Nevada City.", b: ['record'] },
  'champion-mine-rd-trails-nevada-city': { d: "A network of trails off Champion Mine Road in Nevada City; their routes aren't drawn on this map yet.", b: ['record'] },
  'bailey-trail-grass-valley': { d: "A walking trail in Grass Valley, reached from 1000 Cooley Drive.", b: ['record'] },
  'coldstream-trailhead-truckee': { d: "A trailhead on Cold Stream Road in Truckee; the Coldstream Trail's route is drawn on this map.", b: ['record'] },
  'pacific-crest-trail-castle-peak-trailhead-soda-springs': { d: "A trailhead on Boreal Ridge Road at Soda Springs where the Pacific Crest Trail sets off toward Castle Peak.", b: ['record'] },
  'sawtooth-trailhead-truckee': { d: "A trailhead off Fire Road 06 in Truckee; its exact location is still being reviewed.", b: ['record'] },
  'point-defiance-trail-penn-valley': { d: "A walking trail off Pleasant Valley Road in Penn Valley; its route isn't drawn on this map yet.", b: ['record'] },
  'buttermilk-bend-trail-penn-valley': null, // already done in pilot (guard)
};

function kindOf(name) {
  if (/trailhead/i.test(name)) return 'trailhead';
  if (/ohv|atv/i.test(name)) return 'off-highway vehicle (OHV) trail';
  if (/motorcycle|\bmc\b|moto\b/i.test(name)) return 'motorcycle trail';
  if (/jeep/i.test(name)) return 'jeep trail';
  if (/bike/i.test(name)) return 'bike path';
  if (/powerline|road\b/i.test(name)) return 'trail';
  if (/path/i.test(name)) return 'walking path';
  if (/connector|tie trail/i.test(name)) return 'connector trail';
  if (/loop/i.test(name)) return 'loop trail';
  return 'walking trail';
}
const an = k => (/^[aeiou]/i.test(k) ? 'An' : 'A');

const geomTails = [
  '; its route is drawn on this map.',
  ' — its route is traced on this map.',
  ', with its route drawn on this map.',
];

let gi = 0;
const out = [];
for (const r of recs) {
  if (r.id in overrides) {
    const o = overrides[r.id];
    if (o) out.push({ id: r.id, description: o.d, basis: o.b, ...(o.f ? { fetched: o.f } : {}) });
    continue;
  }
  const kind = kindOf(r.name);
  const loc = r.city ? `in ${r.city}` : 'in Nevada County';
  const addr = r.address ? `, off ${r.address}` : '';
  let first = `${an(kind)} ${kind} ${loc}${addr}`;
  let tail;
  if (r.trail && r.trail.hasLine) tail = geomTails[gi++ % geomTails.length];
  else if (r.status === 'Needs Location Review') tail = '; its exact location is still being reviewed.';
  else tail = "; its route isn't drawn on this map yet.";
  let d = first + tail;
  if (r.muse && r.muse.length) d += ` Featured in MUSE's '${r.muse[0]}.'`;
  out.push({ id: r.id, description: d, basis: (r.trail && r.trail.hasLine) || (r.muse && r.muse.length) ? ['record', 'muse'].filter((b, i) => i === 0 || (r.muse && r.muse.length)) : ['record'] });
}
// normalize basis: record always; muse only if joined
for (const o of out) {
  if (!overrides[o.id]) {
    const r = recs.find(x => x.id === o.id);
    o.basis = r.muse && r.muse.length ? ['muse', 'record'] : ['record'];
  }
}

const SIZE = 40;
let n = 0;
for (let i = 0; i < out.length; i += SIZE) {
  n++;
  const f = path.join(ROOT, `.planning/sweep-batches/trails-batch-${String(n).padStart(2, '0')}.json`);
  fs.writeFileSync(f, JSON.stringify(out.slice(i, i + SIZE), null, 1) + '\n');
  console.log(f, out.slice(i, i + SIZE).length);
}
console.log('total drafted', out.length);
