const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const EDITORIALS_PATH = path.join(__dirname, '..', 'website', 'cultural-map-redesign', 'muse_editorials.json');

function collectStrings(value, out) {
  if (value === null || value === undefined) return;
  if (typeof value === 'string') {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => collectStrings(v, out));
    return;
  }
  if (typeof value === 'object') {
    Object.values(value).forEach((v) => collectStrings(v, out));
  }
}

function loadEditorials() {
  const raw = fs.readFileSync(EDITORIALS_PATH, 'utf8');
  const data = JSON.parse(raw);
  assert.ok(Array.isArray(data), 'muse_editorials.json must be an array');
  assert.ok(data.length > 0, 'muse_editorials.json must not be empty');
  return data;
}

test('muse_editorials.json: basic invariants', () => {
  const editorials = loadEditorials();
  for (const e of editorials) {
    assert.ok(e && typeof e === 'object', 'each editorial must be an object');
    assert.ok(e.id && typeof e.id === 'string', 'editorial.id must be a string');
    assert.ok(e.title && typeof e.title === 'string', 'editorial.title must be a string');
    assert.ok(e.heyzine_url && typeof e.heyzine_url === 'string', 'editorial.heyzine_url must be a string');
    assert.ok(e.heyzine_url.startsWith('https://'), 'editorial.heyzine_url must be https://');

    const deepLinks = Array.isArray(e.deep_links) ? e.deep_links : [];
    for (const l of deepLinks) {
      assert.ok(l && typeof l === 'object', 'deep_links entry must be object');
      assert.ok(typeof l.label === 'string' && l.label.length > 0, 'deep_links.label must be non-empty string');
      assert.ok(typeof l.url === 'string' && l.url.length > 0, 'deep_links.url must be non-empty string');
      assert.ok(!l.url.includes('localhost'), 'deep_links.url must not include localhost');
    }

    const quotes = Array.isArray(e.quotes) ? e.quotes : [];
    for (const q of quotes) {
      assert.ok(q && typeof q === 'object', 'quotes entry must be object');
      assert.ok(typeof q.text === 'string' && q.text.length > 0, 'quotes.text must be non-empty string');
      assert.ok(typeof q.attribution === 'string' && q.attribution.length > 0, 'quotes.attribution must be non-empty string');
      assert.ok(typeof q.context === 'string' && q.context.length > 0, 'quotes.context must be non-empty string');
      if (q.target !== undefined && q.target !== null) {
        assert.ok(typeof q.target === 'object', 'quotes.target must be object when present');
        const keys = Object.keys(q.target);
        assert.ok(keys.length > 0, 'quotes.target must not be empty when present');
      }
    }
  }
});

test('muse_editorials.json: no local windows paths in user-facing strings', () => {
  const editorials = loadEditorials();
  const strings = [];
  collectStrings(editorials, strings);
  const offenders = strings.filter((s) => s.includes('C:\\Users\\'));
  assert.deepEqual(offenders, [], `found Windows local paths in muse_editorials.json: ${offenders.join(', ')}`);
});

