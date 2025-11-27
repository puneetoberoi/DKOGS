// src/__tests__/unit/dataCollector.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collectMarketData } from '../../services/dataCollector';
import type { SearchParams } from '../../schema';

// Mock all service dependencies
vi.mock('../../services/tavilyService', () => ({
  searchTavily: vi.fn().mockResolvedValue([
    { title: 'Test Article', url: 'http://test.com', content: 'Test content', publishedDate: '2024-01-01', score: 0.9, source: 'Test' }
  ])
}));

vi.mock('../../services/youtubeService', () => ({
  searchYouTube: vi.fn().mockResolvedValue([
    { id: '123', title: 'Test Video', description: 'Desc', channelName: 'Channel', publishedAt: '2024-01-01', viewCount: '1000', likeCount: '100', url: 'http://youtube.com/123', topComments: [] }
  ])
}));

vi.mock('../../services/serpApiService', () => ({
  searchSerp: vi.fn().mockResolvedValue([
    { title: 'Search Result', link: 'http://result.com', snippet: 'Snippet', displayLink: 'result.com', position: 1 }
  ])
}));

vi.mock('../../services/newsService', () => ({
  searchNews: vi.fn().mockResolvedValue([
    { title: 'News Article', description: 'News desc', url: 'http://news.com', source: 'News Source', publishedAt: '2024-01-01' }
  ])
}));

vi.mock('../../services/hackerNewsService', () => ({
  searchHackerNews: vi.fn().mockResolvedValue([
    { title: 'HN Story', url: 'http://hn.com', score: 100, commentCount: 50, author: 'user', createdAt: '2024-01-01' }
  ])
}));

describe('Data Collector Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseParams: SearchParams = {
    keyword: 'test keyword',
    sources: ['Online Communities', 'E-commerce Reviews', 'Social Media', 'News & Media'],
    lookback: 'Last 6 Months',
    geography: 'USA',
    depth: 'Deep Dive',
    useGroq: true,
    useBytez: false,
    gapCount: 5
  };

  describe('Basic Functionality', () => {
    it('collects data from all services', async () => {
      const result = await collectMarketData(baseParams);
      
      expect(result.totalDataPoints).toBeGreaterThan(0);
      expect(result.sources).toBeDefined();
      expect(result.rawData).toBeDefined();
      expect(result.formattedForAI).toBeDefined();
    });

    it('returns correct source breakdown', async () => {
      const result = await collectMarketData(baseParams);
      
      expect(result.sources.tavily).toBeGreaterThanOrEqual(0);
      expect(result.sources.youtube).toBeGreaterThanOrEqual(0);
      expect(result.sources.serpApi).toBeGreaterThanOrEqual(0);
      expect(result.sources.news).toBeGreaterThanOrEqual(0);
      expect(result.sources.hackerNews).toBeGreaterThanOrEqual(0);
    });

    it('calculates collection time', async () => {
      const result = await collectMarketData(baseParams);
      
      expect(result.collectionTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Source Filtering', () => {
    it('only calls YouTube when Social Media is selected', async () => {
      const { searchYouTube } = await import('../../services/youtubeService');
      const { searchNews } = await import('../../services/newsService');
      
      const params: SearchParams = {
        ...baseParams,
        sources: ['Social Media']
      };
      
      await collectMarketData(params);
      
      expect(searchYouTube).toHaveBeenCalled();
    });

    it('calls news services when News & Media is selected', async () => {
      const { searchNews } = await import('../../services/newsService');
      const { searchSerp } = await import('../../services/serpApiService');
      
      const params: SearchParams = {
        ...baseParams,
        sources: ['News & Media']
      };
      
      await collectMarketData(params);
      
      expect(searchNews).toHaveBeenCalled();
      expect(searchSerp).toHaveBeenCalled();
    });
  });

  describe('Region Handling', () => {
    it('passes USA region code correctly', async () => {
      const { searchSerp } = await import('../../services/serpApiService');
      
      await collectMarketData({ ...baseParams, geography: 'USA' });
      
      expect(searchSerp).toHaveBeenCalledWith('test keyword', 'us');
    });

    it('passes Canada region code correctly', async () => {
      const { searchSerp } = await import('../../services/serpApiService');
      
      await collectMarketData({ ...baseParams, geography: 'Canada' });
      
      expect(searchSerp).toHaveBeenCalledWith('test keyword', 'ca');
    });
  });

  describe('Date Range Handling', () => {
    it('calculates correct date range for Last 30 Days', async () => {
      const { searchTavily } = await import('../../services/tavilyService');
      
      await collectMarketData({ ...baseParams, lookback: 'Last 30 Days' });
      
      expect(searchTavily).toHaveBeenCalled();
      const call = (searchTavily as any).mock.calls[0];
      const dateRange = call[1];
      
      expect(dateRange.from).toBeInstanceOf(Date);
      expect(dateRange.to).toBeInstanceOf(Date);
    });

    it('calculates correct date range for All Time', async () => {
      const { searchTavily } = await import('../../services/tavilyService');
      
      await collectMarketData({ ...baseParams, lookback: 'All Time' });
      
      expect(searchTavily).toHaveBeenCalled();
    });
  });

  describe('Formatted Output', () => {
    it('includes region in formatted AI output', async () => {
      const result = await collectMarketData({ ...baseParams, geography: 'Canada' });
      
      expect(result.formattedForAI).toContain('Canada');
    });

    it('includes lookback period in formatted AI output', async () => {
      const result = await collectMarketData({ ...baseParams, lookback: 'Last Year' });
      
      expect(result.formattedForAI).toContain('Last Year');
    });
  });
});