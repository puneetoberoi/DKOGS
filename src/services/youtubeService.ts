import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

export interface YouTubeResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

// Helper to get transcript via our API
async function getTranscript(videoId: string): Promise<string> {
  try {
    const response = await fetch('/api/transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    });
    const data = await response.json();
    return data.transcript || '';
  } catch (e) {
    console.warn(`Failed to get transcript for ${videoId}`, e);
    return '';
  }
}

export const searchYouTube = async (keyword: string, region: string = 'US'): Promise<YouTubeResult[]> => {
  if (!API_KEY) return [];

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        part: 'snippet',
        q: `${keyword} review`,
        type: 'video',
        maxResults: 3, // Keep low to allow time for transcript fetching
        key: API_KEY,
        relevanceLanguage: 'en',
        regionCode: region === 'Canada' ? 'CA' : 'US',
      },
    });

    const videos = response.data.items;

    // Fetch transcripts in parallel
    const resultsWithTranscripts = await Promise.all(videos.map(async (item: any) => {
      const videoId = item.id.videoId;
      const transcript = await getTranscript(videoId);
      
      // Append transcript to snippet if available
      const enhancedSnippet = transcript 
        ? `${item.snippet.description}\n\n[VIDEO TRANSCRIPT]: ${transcript}`
        : item.snippet.description;

      return {
        title: item.snippet.title,
        link: `https://www.youtube.com/watch?v=${videoId}`,
        snippet: enhancedSnippet,
        source: 'YouTube Video & Transcript',
      };
    }));

    return resultsWithTranscripts;

  } catch (error) {
    console.error('YouTube API Error:', error);
    return [];
  }
};
