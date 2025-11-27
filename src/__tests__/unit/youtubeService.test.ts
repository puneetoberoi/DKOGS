// src/__tests__/unit/youtubeService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { searchYouTube } from '../../services/youtubeService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('YouTube Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('import', { 
      meta: { env: { VITE_GOOGLE_API_KEY: 'test-google-key' } } 
    });
  });

  it('returns empty array when API key is missing', async () => {
    vi.stubGlobal('import', { meta: { env: {} } });
    
    const results = await searchYouTube('test');
    
    expect(results).toEqual([]);
  });

  it('uses correct region code', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { items: [] }
    });

    await searchYouTube('test', undefined, 'ca');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          regionCode: 'ca'
        })
      })
    );
  });

  it('uses date filtering when provided', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { items: [] }
    });

    const dateRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-12-31')
    };

    await searchYouTube('test', dateRange, 'us');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          publishedAfter: expect.any(String),
          publishedBefore: expect.any(String)
        })
      })
    );
  });

  it('handles API quota errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 403 }
    });

    const results = await searchYouTube('test');

    expect(results).toEqual([]);
  });

  it('returns correct video structure', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: { videoId: 'abc123' },
              snippet: {
                title: 'Test Video',
                description: 'Description',
                channelTitle: 'Channel',
                publishedAt: '2024-01-01T00:00:00Z'
              }
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          items: [{ statistics: { viewCount: '1000', likeCount: '100' } }]
        }
      })
      .mockResolvedValueOnce({
        data: { items: [] }
      });

    const results = await searchYouTube('test');

    expect(results[0]).toMatchObject({
      id: 'abc123',
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=abc123'
    });
  });
});