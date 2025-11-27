// src/__tests__/unit/serpApiService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { searchSerp } from '../../services/serpApiService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('SerpAPI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('import', { 
      meta: { env: { VITE_SERPAPI_KEY: 'test-serp-key', DEV: true } } 
    });
  });

  it('returns empty array when API key is missing', async () => {
    vi.stubGlobal('import', { meta: { env: { DEV: true } } });
    
    const results = await searchSerp('test');
    
    expect(results).toEqual([]);
  });

  it('uses correct region parameter', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { organic_results: [] }
    });

    await searchSerp('test', 'ca');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          gl: 'ca'
        })
      })
    );
  });

  it('defaults to US region', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { organic_results: [] }
    });

    await searchSerp('test');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          gl: 'us'
        })
      })
    );
  });

  it('returns correctly formatted results', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        organic_results: [
          {
            title: 'Result 1',
            link: 'http://result1.com',
            snippet: 'Snippet 1',
            displayed_link: 'result1.com'
          }
        ]
      }
    });

    const results = await searchSerp('test');

    expect(results[0]).toMatchObject({
      title: 'Result 1',
      link: 'http://result1.com',
      snippet: 'Snippet 1',
      displayLink: 'result1.com',
      position: 1
    });
  });

  it('handles API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    const results = await searchSerp('test');

    expect(results).toEqual([]);
  });
});