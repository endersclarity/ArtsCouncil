const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const modulePath = path.join(
  __dirname,
  '..',
  'website',
  'cultural-map-redesign',
  'index-maplibre-filter-state-model.js'
);

const filterStateModel = require(modulePath);

test('getCategoryResultsOverlayState hides when no category is selected', () => {
  const state = filterStateModel.getCategoryResultsOverlayState({
    activeCategories: new Set(),
    filteredCount: 10,
    dismissed: false,
    hasActiveExperience: false
  });
  assert.equal(state, null);
});

test('getCategoryResultsOverlayState hides when multiple categories are selected', () => {
  const state = filterStateModel.getCategoryResultsOverlayState({
    activeCategories: new Set(['Eat, Drink & Stay', 'Galleries & Museums']),
    filteredCount: 10,
    dismissed: false,
    hasActiveExperience: false
  });
  assert.equal(state, null);
});

test('getCategoryResultsOverlayState hides when there is only one result', () => {
  const state = filterStateModel.getCategoryResultsOverlayState({
    activeCategories: new Set(['Eat, Drink & Stay']),
    filteredCount: 1,
    dismissed: false,
    hasActiveExperience: false
  });
  assert.equal(state, null);
});

test('getCategoryResultsOverlayState hides when user dismissed the overlay', () => {
  const state = filterStateModel.getCategoryResultsOverlayState({
    activeCategories: new Set(['Eat, Drink & Stay']),
    filteredCount: 8,
    dismissed: true,
    hasActiveExperience: false
  });
  assert.equal(state, null);
});

test('getCategoryResultsOverlayState hides when an experience is active', () => {
  const state = filterStateModel.getCategoryResultsOverlayState({
    activeCategories: new Set(['Eat, Drink & Stay']),
    filteredCount: 8,
    dismissed: false,
    hasActiveExperience: true
  });
  assert.equal(state, null);
});

test('getCategoryResultsOverlayState returns state when exactly one category selected', () => {
  const state = filterStateModel.getCategoryResultsOverlayState({
    activeCategories: new Set(['Eat, Drink & Stay']),
    filteredCount: 8,
    dismissed: false,
    hasActiveExperience: false
  });
  assert.deepEqual(state, {
    category: 'Eat, Drink & Stay',
    count: 8
  });
});

