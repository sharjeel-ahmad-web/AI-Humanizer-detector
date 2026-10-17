export type UserRole = 'student' | 'researcher' | 'business' | 'admin';
export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: PlanTier;
  credits: number;
  totalWordsProcessed: number;
  createdAt: string;
}

export type WritingStyle = 'academic' | 'professional' | 'conversational' | 'simple' | 'formal';
export type RewriteIntensity = 'light' | 'balanced' | 'extensive';

export interface HumanizeOptions {
  style: WritingStyle;
  intensity: RewriteIntensity;
  preserveCitations: boolean;
  preserveTerminology: boolean;
  language?: string;
}

export interface SentenceComparison {
  original: string;
  rewritten: string;
  changeType: 'unchanged' | 'clarified' | 'rephrased' | 'simplified';
  reason?: string;
}

export interface HumanizeResult {
  jobId: string;
  originalText: string;
  rewrittenText: string;
  sentenceComparisons: SentenceComparison[];
  originalMetrics: {
    fleschReadingEase: number;
    fleschKincaidGrade: number;
    wordCount: number;
  };
  improvedMetrics: {
    fleschReadingEase: number;
    fleschKincaidGrade: number;
    wordCount: number;
  };
  preservedCitations: string[];
  creditsDeducted: number;
  remainingCredits: number;
  processingTimeMs: number;
}

export interface SimilarityMatchItem {
  id: string;
  matchedText: string;
  sourceTitle: string;
  sourceUrl: string;
  similarityType: 'exact' | 'ngram' | 'semantic';
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface PlagiarismResult {
  jobId: string;
  overallSimilarityPercent: number;
  exactMatchPercent: number;
  semanticMatchPercent: number;
  totalTokens: number;
  matchedTokens: number;
  matches: SimilarityMatchItem[];
  detectedCitations: string[];
  queriedSourcesCount: number;
  disclaimer: string;
  creditsDeducted: number;
  remainingCredits: number;
}

export interface SavedDocument {
  id: string;
  userId: string;
  title: string;
  originalText: string;
  rewrittenText?: string;
  similarityScore?: number;
  wordCount: number;
  style?: WritingStyle;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deduction' | 'grant' | 'refund';
  description: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalWordsProcessed: number;
  totalHumanizeJobs: number;
  totalPlagiarismScans: number;
  activeSubscriptions: number;
  avgSimilarityScore: number;
}
