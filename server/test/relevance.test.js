const test = require('node:test');
const assert = require('node:assert/strict');
const { scoreRelevance } = require('../src/services/scoreRelevance.service');
const { thresholds, labels } = require('../src/config/relevance');

test('Relevance Scoring - Default Thresholds', () => {
  assert.equal(scoreRelevance(0), 'Not Related');
  assert.equal(scoreRelevance(-1), 'Not Related');
  assert.equal(scoreRelevance(null), 'Not Related');
  assert.equal(scoreRelevance(undefined), 'Not Related');

  assert.equal(scoreRelevance(1), 'Possibly Related');
  assert.equal(scoreRelevance(2), 'Possibly Related');

  assert.equal(scoreRelevance(3), 'Related');
  assert.equal(scoreRelevance(5), 'Related');
  assert.equal(scoreRelevance(20), 'Related');
});

test('Relevance Scoring - Labels and Thresholds match configuration', () => {
  assert.equal(thresholds.notRelatedMax, 0);
  assert.equal(thresholds.possiblyRelatedMax, 2);
  assert.equal(labels.NOT_RELATED, 'Not Related');
  assert.equal(labels.POSSIBLY_RELATED, 'Possibly Related');
  assert.equal(labels.RELATED, 'Related');
});
