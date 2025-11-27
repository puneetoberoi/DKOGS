// src/services/youtubeService.ts

import axios from 'axios';

export interface YouTubeComment {
  text: string;
  author: string;
  likeCount: number;
  publishedAt: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelName: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  url: string;
  topComments: YouTubeComment[];
}

interface DateRange {
  from: Date;
  to: Date;
}

export async function searchYouTube(
  keyword: string, 
  dateRange?: DateRange,
  regionCode?: string
): Promise<YouTubeVideo[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    console.log('ℹ️ YouTube: Not configured, skipping');
    return [];
  }

  console.log(`🎥 YouTube: Searching for "${keyword}" in ${regionCode || 'US'}...`);

  try {
    // Build search params
    const searchParams: any = {
      part: 'snippet',
      q: keyword,
      type: 'video',
      maxResults: 5,
      order: 'relevance',
      key: apiKey,
      regionCode: regionCode || 'US'
    };

    // Add date filtering
    if (dateRange) {
      searchParams.publishedAfter = dateRange.from.toISOString();
      searchParams.publishedBefore = dateRange.to.toISOString();
    }

    const searchResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: searchParams,
        timeout: 10000
      }
    );

    if (!searchResponse.data?.items?.length) {
      console.log('⚠️ YouTube: No videos found');
      return [];
    }

    const videos: YouTubeVideo[] = [];

    for (const item of searchResponse.data.items) {
      const videoId = item.id?.videoId;
      if (!videoId) continue;

      // Get video statistics
      let stats = { viewCount: '0', likeCount: '0' };
      try {
        const statsResponse = await axios.get(
          'https://www.googleapis.com/youtube/v3/videos',
          {
            params: {
              part: 'statistics',
              id: videoId,
              key: apiKey
            }
          }
        );
        stats = statsResponse.data?.items?.[0]?.statistics || stats;
      } catch {
        // Stats not critical, continue
      }

      // Get comments (gracefully handle failures)
      const comments = await fetchCommentsSafe(videoId, apiKey);

      videos.push({
        id: videoId,
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        channelName: item.snippet?.channelTitle || '',
        publishedAt: item.snippet?.publishedAt || '',
        viewCount: stats.viewCount || '0',
        likeCount: stats.likeCount || '0',
        url: `https://youtube.com/watch?v=${videoId}`,
        topComments: comments
      });
    }

    console.log(`✅ YouTube: Found ${videos.length} videos`);
    return videos;

  } catch (error: any) {
    if (error.response?.status === 403) {
      console.warn('⚠️ YouTube API: Quota exceeded or not enabled');
    } else {
      console.warn('⚠️ YouTube Error:', error.message);
    }
    return [];
  }
}

async function fetchCommentsSafe(videoId: string, apiKey: string): Promise<YouTubeComment[]> {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/commentThreads',
      {
        params: {
          part: 'snippet',
          videoId: videoId,
          order: 'relevance',
          maxResults: 5,
          key: apiKey
        },
        timeout: 5000
      }
    );

    if (!response.data?.items) return [];

    return response.data.items.map((item: any) => {
      const comment = item.snippet?.topLevelComment?.snippet;
      return {
        text: comment?.textDisplay || '',
        author: comment?.authorDisplayName || 'Anonymous',
        likeCount: comment?.likeCount || 0,
        publishedAt: comment?.publishedAt || ''
      };
    });

  } catch {
    // Comments disabled or API limit - silently continue
    return [];
  }
}