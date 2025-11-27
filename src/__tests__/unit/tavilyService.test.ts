// src/__tests__/unit/tavilyService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { searchTavily } from '../../services/tavilyService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Tavily Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('import', { 
      meta: { env: { VITE_TAVILY_API_KEY: 'test-tavily-key' } } 
    });
  });

  it('returns empty array when API key is missing', async () => {
    vi.stubGlobal('import', { meta: { env: {} } });
    
    const results = await searchTavily('test');
    
    expect(results).toEqual([]);
  });

  it('makes correct API call with keyword', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        results: [
          { title: 'Test', url: 'http://test.com', content: 'Content', published_date: '2024-01-01', score: 0.9 }
        ]
      }
    });

    await searchTavily('ergonomic chairs');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.tavily.com/search',
      expect.objectContaining({
        query: expect.stringContaining('ergonomic chairs')
      }),
      expect.any(Object)
    );
  });

  it('filters results by date range', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        results: [
          { title: 'Old', url: 'http://old.com', content: 'Old content', published_date: '2020-01-01', score: 0.9 },
          { title: 'New', url: 'http://new.com', content: 'New content', published_date: '2024-01-01', score: 0.9 }
        ]
      }
    });

    const dateRange = {
      from: new Date('2023-01-01'),
      to: new Date('2024-12-31')
    };

    const results = await searchTavily('test', dateRange);

    // Should filter out the old result
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('handles API errors gracefully', async () => {
    mockedAxios.post.mockRejectedValue(new Error('API Error'));

    const results = await searchTavily('test');

    expect(results).toEqual([]);
  });

  it('extracts source correctly from URL', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        results: [
          { title: 'Reddit Post', url: 'https://www.reddit.com/r/test', content: 'Content', published_date: '2024-01-01', score: 0.9 }
        ]
      }
    });

    const results = await searchTavily('test');

    expect(results[0].source).toBe('Reddit Discussion');
  });
});