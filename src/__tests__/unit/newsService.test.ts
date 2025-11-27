// src/__tests__/unit/newsService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { searchNews } from '../../services/newsService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('News API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('import', { 
      meta: { env: { VITE_NEWS_API_KEY: 'test-news-key' } } 
    });
  });

  it('returns empty array when API key is missing', async () => {
    vi.stubGlobal('import', { meta: { env: {} } });
    
    const results = await searchNews('test');
    
    expect(results).toEqual([]);
  });

  it('passes date parameters to API', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { articles: [] }
    });

    const dateRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-12-31')
    };

    await searchNews('test', dateRange);

    expect(mockedAxios.get).toHaveBeenCalled();
    const call = mockedAxios.get.mock.calls[0];
    const params = call[1]?.params;
    
    // Should have from and to params
    expect(params).toHaveProperty('from');
    expect(params).toHaveProperty('to');
  });

    it('limits old dates to 30 days for free tier', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { articles: [] }
    });

    // Request 1 year of data
    const dateRange = {
      from: new Date('2020-01-01'),
      to: new Date()
    };

    await searchNews('test', dateRange);

    const call = mockedAxios.get.mock.calls[0];
    const params = call[1]?.params;
    
    // The from date should be limited to within 30 days
    const fromDate = new Date(params.from);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Allow 31 days (30 + 1 for timezone buffer)
    expect(daysDiff).toBeLessThanOrEqual(32);
  });

  it('returns correctly formatted articles', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        articles: [
          {
            title: 'News Title',
            description: 'News description',
            url: 'http://news.com/article',
            source: { name: 'News Source' },
            publishedAt: '2024-01-15T00:00:00Z'
          }
        ]
      }
    });

    const results = await searchNews('test');

    expect(results[0]).toMatchObject({
      title: 'News Title',
      description: 'News description',
      url: 'http://news.com/article',
      source: 'News Source'
    });
  });

  it('handles API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API Error'));

    const results = await searchNews('test');

    expect(results).toEqual([]);
  });
});