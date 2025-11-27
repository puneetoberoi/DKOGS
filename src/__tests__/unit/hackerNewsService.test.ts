// src/__tests__/unit/hackerNewsService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { searchHackerNews } from '../../services/hackerNewsService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Hacker News Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('makes request to correct API endpoint', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { hits: [] }
    });

    await searchHackerNews('test');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://hn.algolia.com/api/v1/search',
      expect.any(Object)
    );
  });

  it('uses date range for filtering', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { hits: [] }
    });

    const dateRange = {
      from: new Date('2024-01-01'),
      to: new Date()
    };

    await searchHackerNews('test', dateRange);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          numericFilters: expect.stringContaining('created_at_i>')
        })
      })
    );
  });

  it('returns correctly formatted stories', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        hits: [
          {
            title: 'HN Story',
            url: 'http://story.com',
            points: 150,
            num_comments: 75,
            author: 'hnuser',
            created_at: '2024-01-15T00:00:00Z',
            objectID: '12345'
          }
        ]
      }
    });

    const results = await searchHackerNews('test');

    expect(results[0]).toMatchObject({
      title: 'HN Story',
      url: 'http://story.com',
      score: 150,
      commentCount: 75,
      author: 'hnuser'
    });
  });

  it('filters out stories without URLs', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        hits: [
          { title: 'With URL', url: 'http://test.com', points: 100, num_comments: 50, author: 'user', created_at: '2024-01-01', objectID: '1' },
          { title: 'Without URL', url: null, points: 100, num_comments: 50, author: 'user', created_at: '2024-01-01', objectID: '2' }
        ]
      }
    });

    const results = await searchHackerNews('test');

    expect(results.length).toBe(1);
    expect(results[0].title).toBe('With URL');
  });

  it('handles API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    const results = await searchHackerNews('test');

    expect(results).toEqual([]);
  });
});