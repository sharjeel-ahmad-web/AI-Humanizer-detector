import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateReadability,
  countSyllables,
  tokenizeWords,
  generateNgrams,
  computeJaccardSimilarity,
  detectCitationsAndQuotes,
  analyzeSimilarity,
  calculateCreditCost
} from './algorithms.ts';

test('countSyllables handles simple and complex words', () => {
  assert.equal(countSyllables('cat'), 1);
  assert.equal(countSyllables('banana'), 3);
  assert.equal(countSyllables('algorithmic'), 4);
});

test('calculateReadability handles empty string safely', () => {
  const result = calculateReadability('');
  assert.equal(result.wordCount, 0);
  assert.equal(result.fleschReadingEase, 100);
});

test('calculateReadability calculates Flesch score on standard passage', () => {
  const passage = 'The quick brown fox jumps over the lazy dog. It was a very sunny and bright morning.';
  const result = calculateReadability(passage);
  assert.ok(result.wordCount > 10);
  assert.ok(result.fleschReadingEase > 50);
  assert.ok(result.fleschKincaidGrade >= 1);
});

test('tokenizeWords strips punctuation and normalizes casing', () => {
  const tokens = tokenizeWords('Hello, World! This is AI-assisted writing (2025).');
  assert.deepEqual(tokens, ['hello', 'world', 'this', 'is', 'ai', 'assisted', 'writing', '2025']);
});

test('generateNgrams produces valid 3-grams', () => {
  const tokens = ['artificial', 'intelligence', 'improves', 'human', 'clarity'];
  const ngrams = generateNgrams(tokens, 3);
  assert.equal(ngrams.length, 3);
  assert.equal(ngrams[0], 'artificial intelligence improves');
  assert.equal(ngrams[1], 'intelligence improves human');
  assert.equal(ngrams[2], 'improves human clarity');
});

test('computeJaccardSimilarity detects identical and disjoint sets', () => {
  const setA = ['neural network', 'deep learning'];
  const setB = ['neural network', 'deep learning'];
  const setC = ['different topic', 'nothing alike'];

  assert.equal(computeJaccardSimilarity(setA, setB), 1);
  assert.equal(computeJaccardSimilarity(setA, setC), 0);
});

test('detectCitationsAndQuotes finds academic citations and quotations', () => {
  const text = 'According to recent findings (Vaswani et al., 2017), the transformer model revolutionized NLP. Smith states: "attention is all you need for sequence modeling" in his landmark paper [42].';
  const { citations, quotes } = detectCitationsAndQuotes(text);
  assert.ok(citations.length >= 2, 'Should find (Vaswani et al., 2017) and [42]');
  assert.ok(quotes.length >= 1, 'Should find quoted passage');
});

test('analyzeSimilarity identifies matching passages against reference corpus', () => {
  const corpus = [
    {
      title: 'Wikipedia: Machine Learning',
      url: 'https://en.wikipedia.org/wiki/Machine_learning',
      content: 'Machine learning algorithms build a mathematical model based on sample data to make predictions or decisions.',
    }
  ];
  const query = 'Machine learning algorithms build a mathematical model based on sample data to make predictions or decisions without being explicitly programmed.';
  const report = analyzeSimilarity(query, corpus);

  assert.ok(report.matches.length > 0, 'Should detect match from Wikipedia reference');
  assert.ok(report.overallSimilarityPercent > 30);
  assert.equal(report.matches[0].sourceTitle, 'Wikipedia: Machine Learning');
});

test('calculateCreditCost scales with word count', () => {
  assert.equal(calculateCreditCost(150, 'humanize'), 1);
  assert.equal(calculateCreditCost(550, 'humanize'), 3);
  assert.equal(calculateCreditCost(500, 'plagiarism'), 4);
});
