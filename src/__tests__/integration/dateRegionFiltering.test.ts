// src/__tests__/integration/dateRegionFiltering.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SearchParams } from '../../schema';

// Use vi.hoisted for spies
const { youtubeSpy, serpSpy, newsSpy, tavilySpy, hnSpy } = vi.hoisted(() => ({
  youtubeSpy: vi.fn().mockResolvedValue([]),
  serpSpy: vi.fn().mockResolvedValue([]),
  newsSpy: vi.fn().mockResolvedValue([]),
  tavilySpy: vi.fn().mockResolvedValue([]),
  hnSpy: vi.fn().mockResolvedValue([])
}));

vi.mock('../../services/tavilyService', () => ({
  searchTavily: tavilySpy
}));

vi.mock('../../services/youtubeService', () => ({
  searchYouTube: youtubeSpy
}));

vi.mock('../../services/serpApiService', () => ({
  searchSerp: serpSpy
}));

vi.mock('../../services/newsService', () => ({
  searchNews: newsSpy
}));

vi.mock('../../services/hackerNewsService', () => ({
  searchHackerNews: hnSpy
}));

// Import after mocks
import { collectMarketData } from '../../services/dataCollector';

describe('Date and Region Filtering Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createParams = (geography: string, lookback: string): SearchParams => ({
    keyword: 'test',
    sources: ['Social Media', 'News & Media'],
    lookback,
    geography,
    depth: 'Deep Dive',
    useGroq: true,
    useBytez: false,
    gapCount: 5
  });

  describe('Region Filtering', () => {
    it('passes US region code correctly', async () => {
      await collectMarketData(createParams('USA', 'Last 6 Months'));

      expect(youtubeSpy).toHaveBeenCalledWith(
        'test',
        expect.any(Object),
        'us'
      );
      expect(serpSpy).toHaveBeenCalledWith('test', 'us');
    });

    it('passes Canada region code correctly', async () => {
      await collectMarketData(createParams('Canada', 'Last 6 Months'));

      expect(youtubeSpy).toHaveBeenCalledWith(
        'test',
        expect.any(Object),
        'ca'
      );
      expect(serpSpy).toHaveBeenCalledWith('test', 'ca');
    });
  });

  describe('Date Filtering', () => {
    it('passes date range to YouTube', async () => {
      await collectMarketData(createParams('USA', 'Last 30 Days'));

      expect(youtubeSpy).toHaveBeenCalled();
      const call = youtubeSpy.mock.calls[0];
      const dateRange = call[1];

      expect(dateRange).toHaveProperty('from');
      expect(dateRange).toHaveProperty('to');
      expect(dateRange.from).toBeInstanceOf(Date);
      expect(dateRange.to).toBeInstanceOf(Date);
    });

    it('passes date range to News API', async () => {
      await collectMarketData(createParams('USA', 'Last 6 Months'));

      expect(newsSpy).toHaveBeenCalled();
      const call = newsSpy.mock.calls[0];
      const dateRange = call[1];

      expect(dateRange).toHaveProperty('from');
      expect(dateRange).toHaveProperty('to');
    });
  });
});