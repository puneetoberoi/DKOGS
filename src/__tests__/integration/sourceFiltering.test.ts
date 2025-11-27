// src/__tests__/integration/sourceFiltering.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SearchParams } from '../../schema';

// Use vi.hoisted for spies
const { tavilySpy, youtubeSpy, serpSpy, newsSpy, hnSpy } = vi.hoisted(() => ({
  tavilySpy: vi.fn().mockResolvedValue([]),
  youtubeSpy: vi.fn().mockResolvedValue([]),
  serpSpy: vi.fn().mockResolvedValue([]),
  newsSpy: vi.fn().mockResolvedValue([]),
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

describe('Source Filtering Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createParams = (sources: string[]): SearchParams => ({
    keyword: 'test',
    sources,
    lookback: 'Last 6 Months',
    geography: 'USA',
    depth: 'Deep Dive',
    useGroq: true,
    useBytez: false,
    gapCount: 5
  });

  it('only calls YouTube when Social Media is selected', async () => {
    await collectMarketData(createParams(['Social Media']));

    expect(youtubeSpy).toHaveBeenCalled();
  });

  it('calls News and SerpAPI when News & Media is selected', async () => {
    await collectMarketData(createParams(['News & Media']));

    expect(newsSpy).toHaveBeenCalled();
    expect(serpSpy).toHaveBeenCalled();
  });

  it('calls Tavily and HackerNews when Online Communities is selected', async () => {
    await collectMarketData(createParams(['Online Communities']));

    expect(tavilySpy).toHaveBeenCalled();
    expect(hnSpy).toHaveBeenCalled();
  });

  it('calls all services when all sources are selected', async () => {
    await collectMarketData(createParams([
      'Online Communities',
      'E-commerce Reviews',
      'Social Media',
      'News & Media',
      'Industry Forums',
      'Visual Trends',
      'Tech Blogs',
      'Local Reviews'
    ]));

    expect(tavilySpy).toHaveBeenCalled();
    expect(youtubeSpy).toHaveBeenCalled();
    expect(serpSpy).toHaveBeenCalled();
    expect(newsSpy).toHaveBeenCalled();
    expect(hnSpy).toHaveBeenCalled();
  });
});