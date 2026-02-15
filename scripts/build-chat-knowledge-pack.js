#!/usr/bin/env node
/**
 * build-chat-knowledge-pack.js
 *
 * Reads 4 source files and outputs a compressed chat-knowledge-pack.json
 * for the AI Concierge's Gemini system prompt.
 *
 * Usage: node scripts/build-chat-knowledge-pack.js
 * No external dependencies required.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'website', 'cultural-map-redesign');

// ------------------------------------------------------------------
// 1. Asset index compression (data.json → keep n, l, c, d(40), h)
// ------------------------------------------------------------------
function compressAssets(srcPath) {
  const raw = JSON.parse(fs.readFileSync(srcPath, 'utf-8'));
  return raw.map(a => {
    const entry = { n: a.n, l: a.l, c: a.c || '' };
    // Truncate description to 40 chars (budget constraint — full desc too large)
    if (a.d) entry.d = a.d.length > 40 ? a.d.slice(0, 40) : a.d;
    if (a.h) entry.h = a.h;
    return entry;
  });
}

// ------------------------------------------------------------------
// 2. MUSE editorials — keep id, title, dek, lead_quote, deep_links (drop body)
// ------------------------------------------------------------------
function compressEditorials(srcPath) {
  if (!fs.existsSync(srcPath)) {
    console.warn('WARN: muse_editorials.json not found, skipping');
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(srcPath, 'utf-8'));
  return raw.map(e => ({
    id: e.id,
    title: e.title,
    dek: e.dek || '',
    lead_quote: e.lead_quote || '',
    author: e.author || '',
    muse_issue: e.muse_issue || '',
    deep_links: e.deep_links || []
  }));
}

// ------------------------------------------------------------------
// 3. Itinerary summaries — id, title, subtitle, duration, stop names
// ------------------------------------------------------------------
function compressItineraries(srcPath) {
  if (!fs.existsSync(srcPath)) {
    console.warn('WARN: itineraries.json not found, skipping');
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(srcPath, 'utf-8'));
  return raw.map(itin => ({
    id: itin.id,
    title: itin.title,
    subtitle: itin.subtitle || '',
    duration: itin.duration,
    stops: (itin.days || []).flatMap(day =>
      (day.stops || []).map(s => s.asset || s.name || '')
    ).filter(Boolean)
  }));
}

// ------------------------------------------------------------------
// 4. Event titles — title, venue, city, start_date, source
// ------------------------------------------------------------------
function compressEvents(srcPath) {
  if (!fs.existsSync(srcPath)) {
    console.warn('WARN: events-merged-flat.json not found, skipping');
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(srcPath, 'utf-8'));
  return raw.map(e => ({
    title: e.title,
    venue: e.venue_name || e.venue || e.location || '',
    city: e.venue_city || e.city || '',
    start_date: e.start_iso || e.start_date || '',
    source: e.source_type || e.source || ''
  }));
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
function main() {
  const dataPath = path.join(OUT_DIR, 'data.json');
  const editorialsPath = path.join(OUT_DIR, 'muse_editorials.json');
  const itinerariesPath = path.join(OUT_DIR, 'itineraries.json');
  const eventsPath = path.join(OUT_DIR, 'events-merged-flat.json');

  console.log('Building chat knowledge pack...');

  const assets = compressAssets(dataPath);
  console.log(`  Assets: ${assets.length}`);

  const muse_editorials = compressEditorials(editorialsPath);
  console.log(`  MUSE editorials: ${muse_editorials.length}`);

  const itineraries = compressItineraries(itinerariesPath);
  console.log(`  Itineraries: ${itineraries.length}`);

  const events = compressEvents(eventsPath);
  console.log(`  Events: ${events.length}`);

  const pack = {
    generated: new Date().toISOString(),
    assets,
    muse_editorials,
    itineraries,
    events,
    stats: {
      asset_count: assets.length,
      event_count: events.length,
      itinerary_count: itineraries.length,
      editorial_count: muse_editorials.length
    }
  };

  const outPath = path.join(OUT_DIR, 'chat-knowledge-pack.json');
  const json = JSON.stringify(pack);
  fs.writeFileSync(outPath, json, 'utf-8');

  const sizeKB = (Buffer.byteLength(json, 'utf-8') / 1024).toFixed(1);
  console.log(`\nOutput: ${outPath}`);
  console.log(`Size: ${sizeKB} KB (${json.length} bytes)`);

  if (json.length > 200000) {
    console.error('WARNING: Output exceeds 200KB target!');
    process.exit(1);
  }

  console.log('Done.');
}

main();
