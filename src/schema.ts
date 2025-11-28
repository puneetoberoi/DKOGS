// src/schema.ts

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

export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentFactors {
  positive: string[];
  negative: string[];
}

export interface MarketTrend {
  year: string;
  demandIndex: number;
}

export interface AnalyzedSample {
  source: string;
  date: string;
  type: string;
  snippet: string;
}

// NEW INTERFACE
export interface RelatedOpportunity {
  keyword: string;
  reason: string;
}

export interface MarketReport {
  id?: string;
  keyword: string;
  generatedAt?: string;
  geography?: string;
  lookback?: string;
  
  industry: string;
  totalAnalyzed: number;
  summary: string;
  gaps: MarketGap[];
  
  overallSentiment: number;
  sentimentBreakdown: SentimentBreakdown;
  sentimentFactors: SentimentFactors;
  
  competitors: Competitor[];
  marketTrends: MarketTrend[];
  analyzedSamples: AnalyzedSample[];
  
  // NEW FIELD
  relatedOpportunities?: RelatedOpportunity[];
  
  dataSources: string[];
  sourcesUsed?: string[];
  methodology?: string;
}

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
