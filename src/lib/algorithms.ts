/**
 * Core pure algorithms for text analysis, readability scoring,
 * N-gram similarity, exact matching, and credit calculations.
 * Decoupled from UI components for unit testing with node:test.
 */

export interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  readingTimeMinutes: number;
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
}

export interface SimilarityMatch {
  id: string;
  matchedText: string;
  sourceText?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  similarityType: 'exact' | 'ngram' | 'semantic';
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface SimilarityReportData {
  overallSimilarityPercent: number;
  exactMatchPercent: number;
  semanticMatchPercent: number;
  totalTokens: number;
  matchedTokens: number;
  matches: SimilarityMatch[];
  citationsDetected: string[];
  disclaimer: string;
}

/**
 * Counts syllables in an English word (heuristic).
 */
export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 1;
  if (clean.length <= 3) return 1;

  const syllables = clean
    .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
    .replace(/^y/, '')
    .match(/[aeiouy]{1,2}/g);

  return syllables ? Math.max(1, syllables.length) : 1;
}

/**
 * Calculates Flesch Reading Ease and Flesch-Kincaid Grade Level.
 */
export function calculateReadability(text: string): ReadabilityMetrics {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      fleschReadingEase: 100,
      fleschKincaidGrade: 0,
      readingTimeMinutes: 0,
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      avgSyllablesPerWord: 0,
    };
  }

  // Sentence split by punctuation (. ! ?)
  const rawSentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const sentenceCount = Math.max(1, rawSentences.length);

  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllables(w);
  }

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;

  // Flesch Reading Ease: 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
  let flesch = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  flesch = Math.max(0, Math.min(100, Math.round(flesch * 10) / 10));

  // Flesch-Kincaid Grade Level: 0.39 * (total_words / total_sentences) + 11.8 * (total_syllables / total_words) - 15.59
  let grade = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
  grade = Math.max(1, Math.min(18, Math.round(grade * 10) / 10));

  const readingTimeMinutes = Math.max(0.1, Math.round((wordCount / 225) * 10) / 10);

  return {
    fleschReadingEase: flesch,
    fleschKincaidGrade: grade,
    readingTimeMinutes,
    wordCount,
    characterCount: text.length,
    sentenceCount,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
  };
}

/**
 * Tokenizes text into lowercase normalized words while stripping punctuation.
 */
export function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Generates N-grams from a list of tokens.
 */
export function generateNgrams(tokens: string[], n: number = 3): string[] {
  if (tokens.length < n) return [];
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Computes Jaccard similarity between two sets of N-grams.
 */
export function computeJaccardSimilarity(ngramsA: string[], ngramsB: string[]): number {
  if (ngramsA.length === 0 || ngramsB.length === 0) return 0;
  const setA = new Set(ngramsA);
  const setB = new Set(ngramsB);

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : Math.round((intersectionCount / unionCount) * 1000) / 1000;
}

/**
 * Detects formal citations and quotations in text to preserve them and avoid false positives.
 */
export function detectCitationsAndQuotes(text: string): { citations: string[]; quotes: string[] } {
  const citations: string[] = [];
  const quotes: string[] = [];

  // Common citation patterns: (Author, 2024), (Smith et al., 2021), [1], [1-3]
  const citationRegex = /\(([A-Z][a-zA-Z\s&.,]+,\s*(?:19|20)\d{2}[a-z]?)\)|\[(\d+(?:[-–,]\s*\d+)*)\]/g;
  let match;
  while ((match = citationRegex.exec(text)) !== null) {
    citations.push(match[0]);
  }

  // Quoted passages in double quotes
  const quoteRegex = /"([^"\n]{10,})"/g;
  let qMatch;
  while ((qMatch = quoteRegex.exec(text)) !== null) {
    quotes.push(qMatch[1]);
  }

  return { citations, quotes };
}

/**
 * Performs local similarity analysis against sample academic/web corpora or reference sources.
 */
export function analyzeSimilarity(
  text: string,
  referenceCorpus: Array<{ title: string; url: string; content: string }>
): SimilarityReportData {
  const textTokens = tokenizeWords(text);
  const totalTokens = textTokens.length;

  if (totalTokens === 0) {
    return {
      overallSimilarityPercent: 0,
      exactMatchPercent: 0,
      semanticMatchPercent: 0,
      totalTokens: 0,
      matchedTokens: 0,
      matches: [],
      citationsDetected: [],
      disclaimer: 'Text similarity analysis is not definitive plagiarism verdict. Context and attribution must be reviewed.',
    };
  }

  const textSentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const matches: SimilarityMatch[] = [];
  const matchedTokensSet = new Set<number>();

  for (const sentence of textSentences) {
    const sTokens = tokenizeWords(sentence);
    if (sTokens.length < 4) continue;
    const sNgrams = generateNgrams(sTokens, 3);

    for (const ref of referenceCorpus) {
      const refTokens = tokenizeWords(ref.content);
      const refNgrams = generateNgrams(refTokens, 3);
      const similarity = computeJaccardSimilarity(sNgrams, refNgrams);

      if (similarity > 0.25 || ref.content.toLowerCase().includes(sentence.toLowerCase().trim())) {
        const isExact = ref.content.toLowerCase().includes(sentence.toLowerCase().trim());
        const startIndex = text.indexOf(sentence);
        const endIndex = startIndex + sentence.length;

        matches.push({
          id: `match_${Math.random().toString(36).substring(2, 9)}`,
          matchedText: sentence,
          sourceTitle: ref.title,
          sourceUrl: ref.url,
          similarityType: isExact ? 'exact' : (similarity > 0.6 ? 'ngram' : 'semantic'),
          confidence: isExact ? 100 : Math.round(similarity * 100),
          startIndex: Math.max(0, startIndex),
          endIndex: Math.max(0, endIndex),
        });

        // Mark tokens matched
        const sStartInTokens = textTokens.indexOf(sTokens[0]);
        if (sStartInTokens >= 0) {
          for (let i = sStartInTokens; i < sStartInTokens + sTokens.length; i++) {
            matchedTokensSet.add(i);
          }
        }
        break; // Match found for this sentence
      }
    }
  }

  const matchedTokensCount = Math.min(totalTokens, matchedTokensSet.size);
  const overallSimilarityPercent = Math.min(100, Math.round((matchedTokensCount / Math.max(1, totalTokens)) * 100));

  const exactMatches = matches.filter(m => m.similarityType === 'exact');
  const exactMatchPercent = Math.min(overallSimilarityPercent, Math.round((exactMatches.length / Math.max(1, textSentences.length)) * 100));
  const semanticMatchPercent = Math.max(0, overallSimilarityPercent - exactMatchPercent);

  const { citations } = detectCitationsAndQuotes(text);

  return {
    overallSimilarityPercent,
    exactMatchPercent,
    semanticMatchPercent,
    totalTokens,
    matchedTokens: matchedTokensCount,
    matches,
    citationsDetected: citations,
    disclaimer: 'Similarity percentage indicates textual and structural overlap with queried sources. This does not represent an academic misconduct ruling.',
  };
}

/**
 * Calculates credit cost for humanization or similarity checks based on word count.
 */
export function calculateCreditCost(wordCount: number, operation: 'humanize' | 'plagiarism'): number {
  if (wordCount <= 0) return 0;
  const baseRate = operation === 'humanize' ? 1 : 2; // 1 credit per 250 words for humanize, 2 for plagiarism
  const units = Math.ceil(wordCount / 250);
  return Math.max(1, units * baseRate);
}
