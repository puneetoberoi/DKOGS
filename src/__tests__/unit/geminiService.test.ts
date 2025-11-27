// src/__tests__/unit/geminiService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted for variables used in vi.mock
const { mockGenerateContent, mockCollectData, mockGroqCreate, mockBytezAnalyze } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockCollectData: vi.fn(),
  mockGroqCreate: vi.fn(),
  mockBytezAnalyze: vi.fn()
}));

// Mock dependencies
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: mockGenerateContent
    };
  },
  Type: { 
    OBJECT: 'OBJECT', 
    STRING: 'STRING', 
    NUMBER: 'NUMBER', 
    ARRAY: 'ARRAY', 
    INTEGER: 'INTEGER', 
    BOOLEAN: 'BOOLEAN' 
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
import type { SearchParams } from '../../schema';

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.stubGlobal('import', { 
      meta: { 
        env: { 
          VITE_GEMINI_API_KEY: 'test-gemini-key',
          VITE_GROQ_API_KEY: 'test-groq-key'
        } 
      } 
    });

    // Default mock implementations
    mockCollectData.mockResolvedValue({
      totalDataPoints: 50,
      sources: { tavily: 10, youtube: 20, serpApi: 10, news: 5, hackerNews: 5 },
      rawData: { webArticles: [], videos: [], searchResults: [], newsArticles: [], hnStories: [] },
      collectionTime: 2.5,
      formattedForAI: 'Test market data'
    });

    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: 'Groq analysis result' } }]
    });

    mockBytezAnalyze.mockResolvedValue('');

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
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
        gaps: [
          { title: 'Gap 1', description: 'Desc', painPoints: [], sentimentScore: 70, willingnessToPay: '$100', estimatedPrice: 100, competitionDensity: 'Low', opportunityScore: 80, recommendedSolution: 'Sol', sources: [] },
          { title: 'Gap 2', description: 'Desc', painPoints: [], sentimentScore: 70, willingnessToPay: '$100', estimatedPrice: 100, competitionDensity: 'Low', opportunityScore: 80, recommendedSolution: 'Sol', sources: [] },
          { title: 'Gap 3', description: 'Desc', painPoints: [], sentimentScore: 70, willingnessToPay: '$100', estimatedPrice: 100, competitionDensity: 'Low', opportunityScore: 80, recommendedSolution: 'Sol', sources: [] },
          { title: 'Gap 4', description: 'Desc', painPoints: [], sentimentScore: 70, willingnessToPay: '$100', estimatedPrice: 100, competitionDensity: 'Low', opportunityScore: 80, recommendedSolution: 'Sol', sources: [] },
          { title: 'Gap 5', description: 'Desc', painPoints: [], sentimentScore: 70, willingnessToPay: '$100', estimatedPrice: 100, competitionDensity: 'Low', opportunityScore: 80, recommendedSolution: 'Sol', sources: [] }
        ],
        summary: 'Test summary'
      })
    });
  });

  const baseParams: SearchParams = {
    keyword: 'test keyword',
    sources: ['Online Communities', 'Social Media'],
    lookback: 'Last 6 Months',
    geography: 'USA',
    depth: 'Deep Dive',
    useGroq: true,
    useBytez: false,
    gapCount: 5
  };

  describe('Basic Functionality', () => {
    it('returns a complete market report', async () => {
      const result = await analyzeMarket(baseParams);

      expect(result).toHaveProperty('industry');
      expect(result).toHaveProperty('totalAnalyzed');
      expect(result).toHaveProperty('overallSentiment');
      expect(result).toHaveProperty('gaps');
      expect(result).toHaveProperty('competitors');
      expect(result).toHaveProperty('summary');
    });

    it('calls data collector with params', async () => {
      await analyzeMarket(baseParams);

      expect(mockCollectData).toHaveBeenCalledWith(baseParams);
    });

    it('calls Gemini API with generated prompt', async () => {
      await analyzeMarket(baseParams);

      expect(mockGenerateContent).toHaveBeenCalled();
      const call = mockGenerateContent.mock.calls[0][0];
      expect(call.contents).toContain('test keyword');
    });

    it('includes geography in the prompt', async () => {
      await analyzeMarket({ ...baseParams, geography: 'Canada' });

      const call = mockGenerateContent.mock.calls[0][0];
      expect(call.contents).toContain('Canada');
    });

    it('includes gap count in the prompt', async () => {
      await analyzeMarket({ ...baseParams, gapCount: 10 });

      const call = mockGenerateContent.mock.calls[0][0];
      expect(call.contents).toContain('10');
    });
  });

  describe('External AI Integration', () => {
    it('calls Groq for sentiment analysis', async () => {
      await analyzeMarket(baseParams);

      expect(mockGroqCreate).toHaveBeenCalled();
    });

    it('includes Groq analysis in sources when successful', async () => {
      mockGroqCreate.mockResolvedValue({
        choices: [{ message: { content: 'Groq sentiment analysis' } }]
      });

      const result = await analyzeMarket(baseParams);

      expect(result.dataSources).toContain('Groq (Llama 3)');
    });

    it('handles Groq failure gracefully', async () => {
      mockGroqCreate.mockRejectedValue(new Error('Groq error'));

      const result = await analyzeMarket(baseParams);

      expect(result).toBeDefined();
      expect(result.industry).toBeDefined();
    });
  });

  describe('Status Updates', () => {
    it('calls status update callback during analysis', async () => {
      const statusUpdates: string[] = [];
      const onStatusUpdate = (status: string) => statusUpdates.push(status);

      await analyzeMarket(baseParams, onStatusUpdate);

      expect(statusUpdates).toContain('SCRAPING');
      expect(statusUpdates).toContain('GROQ_ANALYSIS');
      expect(statusUpdates).toContain('CLUSTERING');
    });
  });

  describe('Error Handling', () => {
    it('throws error when Gemini returns no text', async () => {
      mockGenerateContent.mockResolvedValue({ text: null });

      await expect(analyzeMarket(baseParams)).rejects.toThrow('Failed to generate analysis');
    });

    it('throws error when Gemini API fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(analyzeMarket(baseParams)).rejects.toThrow('API Error');
    });
  });

  describe('Data Sources', () => {
    it('includes selected sources in final report', async () => {
      const result = await analyzeMarket(baseParams);

      expect(result.dataSources).toContain('Online Communities');
      expect(result.dataSources).toContain('Social Media');
    });

    it('always includes Gemini in data sources', async () => {
      const result = await analyzeMarket(baseParams);

      expect(result.dataSources).toContain('Gemini 2.0 Flash');
    });
  });

  describe('Total Analyzed Override', () => {
    it('uses real data point count from collector', async () => {
      mockCollectData.mockResolvedValue({
        totalDataPoints: 123,
        sources: { tavily: 50, youtube: 50, serpApi: 10, news: 8, hackerNews: 5 },
        rawData: { webArticles: [], videos: [], searchResults: [], newsArticles: [], hnStories: [] },
        collectionTime: 3.0,
        formattedForAI: 'Test data'
      });

      const result = await analyzeMarket(baseParams);

      expect(result.totalAnalyzed).toBe(123);
    });
  });
});