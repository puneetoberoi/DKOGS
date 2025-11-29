import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

export interface YouTubeResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

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
    return '';
  }
}

export const searchYouTube = async (keyword: string, region: string = 'US'): Promise<YouTubeResult[]> => {
  if (!API_KEY) return [];

  try {
    console.log(`🎥 YouTube: Searching for "${keyword}"...`);
    const response = await axios.get(BASE_URL, {
      params: {
        part: 'snippet',
        q: `${keyword} review`,
        type: 'video',
        maxResults: 20, // INCREASED FROM 3
        key: API_KEY,
        relevanceLanguage: 'en',
        regionCode: region === 'Canada' ? 'CA' : 'US',
      },
    });

    const videos = response.data.items;

    // Process videos: Transcribe only top 3 to save time
    const resultsWithTranscripts = await Promise.all(videos.map(async (item: any, index: number) => {
      const videoId = item.id.videoId;
      let transcript = '';
      
      // Only transcribe top 3
      if (index < 3) {
        transcript = await getTranscript(videoId);
      }
      
      const enhancedSnippet = transcript 
        ? `${item.snippet.description}\n\n[VIDEO TRANSCRIPT]: ${transcript}`
        : item.snippet.description;

      return {
        title: item.snippet.title,
        link: `https://www.youtube.com/watch?v=${videoId}`,
        snippet: enhancedSnippet,
        source: index < 3 ? 'YouTube Video & Transcript' : 'YouTube Video',
      };
    }));

    console.log(`✅ YouTube: Found ${resultsWithTranscripts.length} videos`);
    return resultsWithTranscripts;

  } catch (error) {
    console.error('YouTube API Error:', error);
    return [];
  }
};
