// src/schema.ts

// ============================================
// ANALYSIS STATUS
// ============================================
export const AnalysisStatus = {
  IDLE: 'idle',
  SCRAPING: 'scraping',
  GROQ_ANALYSIS: 'groq_analysis',
  BYTEZ_ANALYSIS: 'bytez_analysis',
  CLUSTERING: 'clustering',
  SCORING: 'scoring',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;

export type AnalysisStatus = typeof AnalysisStatus[keyof typeof AnalysisStatus];

// ============================================
// SEARCH PARAMS
// ============================================
export interface SearchParams {
  keyword: string;
  sources: string[];
  lookback: string;
  geography: string;
  depth: string;
  useGroq: boolean;
  useBytez: boolean;
  gapCount?: number;
}

// ============================================
// GAP DATA (Used in charts and filtering)
// ============================================
export interface GapData {
  title: string;
  description: string;
  painPoints: string[];
  sentimentScore: number;
  opportunityScore: number;
  willingnessToPay: string;
  estimatedPrice: number;
  competitionDensity: 'Low' | 'Medium' | 'High' | 'Saturated';
  recommendedSolution: string;
  searchVolume?: string;
  sources: string[];
}

// ============================================
// MARKET GAP (Same as GapData for compatibility)
// ============================================
export interface MarketGap {
  id?: string;
  title: string;
  description: string;
  painPoints: string[];
  painLevel?: number;
  frequency?: number;
  marketSize?: string;
  sentimentScore: number;
  opportunityScore: number;
  willingnessToPay: string;
  estimatedPrice: number;
  competitionDensity: 'Low' | 'Medium' | 'High' | 'Saturated';
  competitors?: string;
  recommendedSolution: string;
  searchVolume?: string;
  sources: string[];
  sampleQuotes?: string[];
  trend?: 'rising' | 'stable' | 'declining';
  difficulty?: 'low' | 'medium' | 'high';
  timeToMarket?: string;
  potentialRevenue?: string;
}

// ============================================
// COMPETITOR
// ============================================
export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
}

// ============================================
// SENTIMENT BREAKDOWN
// ============================================
export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

// ============================================
// SENTIMENT FACTORS
// ============================================
export interface SentimentFactors {
  positive: string[];
  negative: string[];
}

// ============================================
// MARKET TREND
// ============================================
export interface MarketTrend {
  year: string;
  demandIndex: number;
}

// ============================================
// ANALYZED SAMPLE
// ============================================
export interface AnalyzedSample {
  source: string;
  date: string;
  type: string;
  snippet: string;
}

// ============================================
// MARKET REPORT (Main report type)
// ============================================
export interface MarketReport {
  id?: string;
  keyword: string;
  generatedAt?: string;
  geography?: string;
  lookback?: string;
  
  // Core data
  industry: string;
  totalAnalyzed: number;
  summary: string;
  gaps: MarketGap[];
  
  // Sentiment
  overallSentiment: number;
  sentimentBreakdown: SentimentBreakdown;
  sentimentFactors: SentimentFactors;
  
  // Analysis data
  competitors: Competitor[];
  marketTrends: MarketTrend[];
  analyzedSamples: AnalyzedSample[];
  
  // Sources
  dataSources: string[];
  sourcesUsed?: string[];
  methodology?: string;
}

// ============================================
// LOG ENTRY
// ============================================
export interface LogEntry {
  timestamp: string;
  type: 'success' | 'error' | 'query';
  keyword?: string;
  sources?: string[];
  region?: string;
  lookbackDays?: number;
  gapsRequested?: number;
  errorMessage?: string;
  durationMs?: number;
}