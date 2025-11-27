// src/services/hackerNewsService.ts

import axios from 'axios';

export interface HackerNewsStory {
  title: string;
  url: string;
  score: number;
  commentCount: number;
  author: string;
  createdAt: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

export async function searchHackerNews(keyword: string, dateRange?: DateRange): Promise<HackerNewsStory[]> {
  console.log(`💻 Hacker News: Searching for "${keyword}"...`);

  try {
    // Calculate timestamp for date filtering
    let fromTimestamp: number;
    
    if (dateRange) {
      fromTimestamp = Math.floor(dateRange.from.getTime() / 1000);
    } else {
      // Default to last year
      fromTimestamp = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60);
    }

    const response = await axios.get(
      'https://hn.algolia.com/api/v1/search',
      {
        params: {
          query: keyword,
          tags: 'story',
          hitsPerPage: 10,
          numericFilters: `created_at_i>${fromTimestamp}`
        },
        timeout: 10000
      }
    );

    if (!response.data?.hits) {
      return [];
    }

    const stories = response.data.hits
      .filter((hit: any) => hit.url)
      .map((hit: any) => ({
        title: hit.title || '',
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        score: hit.points || 0,
        commentCount: hit.num_comments || 0,
        author: hit.author || 'Anonymous',
        createdAt: new Date(hit.created_at).toLocaleDateString()
      }));

    console.log(`✅ Hacker News: Found ${stories.length} stories`);
    return stories;

  } catch (error: any) {
    console.warn('⚠️ Hacker News Error:', error.message);
    return [];
  }
}