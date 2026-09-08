const test = require('node:test');
const assert = require('node:assert/strict');

// We will import matchKeywords once updated, or test the logic directly.
const { matchKeywords, normalizeText } = require('../src/services/matchKeywords.service');
const { loadKeywords } = require('../src/utils/keywords');

test('Keyword Matching - Case Insensitivity', () => {
  const keywords = ['Hydraulic torque wrench', 'Bolt tensioner'];
  const text = 'HYDRAULIC TORQUE WRENCH and bolt tensioner';
  const result = matchKeywords(text, keywords);

  assert.equal(result.matchCount, 2);
  assert.deepEqual(result.matchedKeywords, ['Hydraulic torque wrench', 'Bolt tensioner']);
});

test('Keyword Matching - Word Boundary Prevention (no substring false positives)', () => {
  const keywords = ['Nut splitter', 'Torque wrench'];
  const text = 'We have a donut splitter and a torque wrench.';
  const result = matchKeywords(text, keywords);

  assert.equal(result.matchCount, 1);
  assert.deepEqual(result.matchedKeywords, ['Torque wrench']);
});

test('Keyword Matching - Singular and Plural Variations', () => {
  const keywords = [
    'Hydraulic torque wrench',
    'Bolt tensioner',
    'Bolting tools',
    'Turnaround services',
    'Plant shutdown',
    'Bolted joint'
  ];
  const text = 'We require hydraulic torque wrenches, bolt tensioners, a bolting tool, turnaround service, plant shutdowns, and bolted joints.';
  const result = matchKeywords(text, keywords);

  assert.equal(result.matchCount, 6);
  assert.deepEqual(result.matchedKeywords, keywords);
});

test('Keyword Matching - Does not duplicate counts for repeated keywords', () => {
  const keywords = ['Bolt tensioner', 'Controlled bolting'];
  const text = 'Bolt tensioner! Another bolt tensioner. Bolt tensioners everywhere. Controlled bolting.';
  const result = matchKeywords(text, keywords);

  assert.equal(result.matchCount, 2);
  assert.deepEqual(result.matchedKeywords, ['Bolt tensioner', 'Controlled bolting']);
});

test('Keyword Matching - Hyphen and Space variations (Pre-tensioning)', () => {
  const keywords = ['Pre-tensioning'];
  const text1 = 'High pressure pre-tensioning required.';
  const text2 = 'High pressure pre tensioning required.';
  const text3 = 'High pressure pre-tensionings required.';

  assert.equal(matchKeywords(text1, keywords).matchCount, 1);
  assert.equal(matchKeywords(text2, keywords).matchCount, 1);
  assert.equal(matchKeywords(text3, keywords).matchCount, 1);
});

test('Keyword Matching - Empty or unrelated text', () => {
  const keywords = loadKeywords();
  const empty = matchKeywords('', keywords);
  assert.equal(empty.matchCount, 0);
  assert.deepEqual(empty.matchedKeywords, []);

  const unrelated = matchKeywords('Painting office walls, software development, catering services.', keywords);
  assert.equal(unrelated.matchCount, 0);
  assert.deepEqual(unrelated.matchedKeywords, []);
});
