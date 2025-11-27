// src/__tests__/integration/fullScanFlow.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SearchParams } from '../../schema';

// Use vi.hoisted for all mock data and functions
const { mockGenerateContent, mockCollectData, mockGroqCreate, mockBytezAnalyze, mockReport } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockCollectData: vi.fn(),
  mockGroqCreate: vi.fn(),
  mockBytezAnalyze: vi.fn(),
  mockReport: {
    industry: 'Test Industry',
    totalAnalyzed: 50,
    overallSentiment: 75,
    sentimentBreakdown: { positive: 50, neutral: 30, negative: 20 },
    sentimentFactors: { positive: ['Good'], negative: ['Bad'] },
    analyzedSamples: [],
    competitors: [
      { name: 'Comp1', strength: 'Strong', weakness: 'Weak' },
      { name: 'Comp2', strength: 'Strong', weakness: 'Weak' },
      { name: 'Comp3', strength: 'Strong', weakness: 'Weak' },
      { name: 'Comp4', strength: 'Strong', weakness: 'Weak' },
      { name: 'Comp5', strength: 'Strong', weakness: 'Weak' }
    ],
    marketTrends: [
      { year: '2021', demandIndex: 60 },
      { year: '2022', demandIndex: 70 },
      { year: '2023', demandIndex: 80 },
      { year: '2024', demandIndex: 90 },
      { year: '2025', demandIndex: 95 }
    ],
    gaps: [],
    summary: 'Test summary'
  }
}));

// Mock all dependencies
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: mockGenerateContent
    };
  },
  Type: { 
    OBJECT: 'OBJECT', STRING: 'STRING', NUMBER: 'NUMBER', 
    ARRAY: 'ARRAY', INTEGER: 'INTEGER', BOOLEAN: 'BOOLEAN' 
  }
}));

vi.mock('groq-sdk', () => ({
  default: class {
    chat = {
      completions: {
        create: mockGroqCreate
      }
    };
  }
}));

vi.mock('../../services/dataCollector', () => ({
  collectMarketData: mockCollectData
}));

vi.mock('../../services/bytezService', () => ({
  analyzeBytez: mockBytezAnalyze
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    query: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    perf: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

// Import after mocks
import { analyzeMarket } from '../../services/geminiService';

describe('Full Scan Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.stubGlobal('import', { 
      meta: { 
        env: { 
          VITE_GEMINI_API_KEY: 'test-key',
          VITE_GROQ_API_KEY: 'test-groq-key'
        } 
      } 
    });

    mockCollectData.mockResolvedValue({
      totalDataPoints: 50,
      sources: { tavily: 10, youtube: 20, serpApi: 10, news: 5, hackerNews: 5 },
      rawData: { webArticles: [], videos: [], searchResults: [], newsArticles: [], hnStories: [] },
      collectionTime: 2.5,
      formattedForAI: 'Test data for AI'
    });

    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: 'Groq analysis result' } }]
    });

    mockBytezAnalyze.mockResolvedValue('');

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockReport)
    });
  });

  const baseParams: SearchParams = {
    keyword: 'ergonomic keyboards',
    sources: ['Online Communities', 'Social Media', 'News & Media'],
    lookback: 'Last 6 Months',
    geography: 'USA',
    depth: 'Deep Dive',
    useGroq: true,
    useBytez: false,
    gapCount: 5
  };

  it('completes full analysis flow', async () => {
    const statusUpdates: string[] = [];
    const onStatusUpdate = (status: string) => statusUpdates.push(status);

    const result = await analyzeMarket(baseParams, onStatusUpdate);

    expect(result).toBeDefined();
    expect(result.industry).toBeDefined();
  });

  it('calls data collector with correct params', async () => {
    await analyzeMarket(baseParams);

    expect(mockCollectData).toHaveBeenCalledWith(baseParams);
  });

  it('includes data sources in final report', async () => {
    const result = await analyzeMarket(baseParams);

    expect(result.dataSources).toBeDefined();
    expect(Array.isArray(result.dataSources)).toBe(true);
  });

  it('updates status during analysis', async () => {
    const statusUpdates: string[] = [];
    const onStatusUpdate = (status: string) => statusUpdates.push(status);

    await analyzeMarket(baseParams, onStatusUpdate);

    expect(statusUpdates).toContain('SCRAPING');
    expect(statusUpdates).toContain('GROQ_ANALYSIS');
    expect(statusUpdates).toContain('CLUSTERING');
  });
});