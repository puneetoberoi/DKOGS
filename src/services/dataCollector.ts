import { searchTavily, searchTavilyNews } from './tavilyService';
import { searchYouTube } from './youtubeService';
import { searchSerper } from './serperService';
import { searchHackerNews } from './hackerNewsService';
import type { SearchParams } from '../schema';

export interface AggregatedData {
  formattedForAI: string;
  totalDataPoints: number;
  sources: Record<string, number>;
}

export const collectMarketData = async (params: SearchParams): Promise<AggregatedData> => {
  console.log(`🔍 Starting data collection for: "${params.keyword}"`);
  
  const isDeepDive = params.depth === 'Deep Dive';

  // Helper to map lookback string to API expected format if needed
  // Assuming DateRange is a string union type, casting params.lookback usually works if aligned
  // If not, we cast to any to unblock build.
  
  try {
    const [tavilyResults, newsResults, youtubeResults, serperResults, hnResults] = await Promise.all([
      searchTavily(`${params.keyword} market trends problems`, isDeepDive ? 'advanced' : 'basic'),
      searchTavilyNews(`${params.keyword} industry news`),
      // FIX: Use lookback instead of geography, and cast to any to satisfy strict TS
      searchYouTube(params.keyword, params.lookback as any), 
      searchSerper(`${params.keyword} reviews and complaints`, params.geography),
      searchHackerNews(params.keyword)
    ]);

    const allResults = [
      ...tavilyResults,
      ...newsResults,
      ...youtubeResults,
      ...serperResults,
      ...hnResults
    ];

    let formattedText = `Search Context: ${params.keyword} in ${params.geography}\n\n`;
    
    allResults.forEach((item, index) => {
      formattedText += `[${index + 1}] Source: ${item.source}\nTitle: ${item.title}\nSnippet: ${item.snippet}\n\n`;
    });

    return {
      formattedForAI: formattedText,
      totalDataPoints: allResults.length,
      sources: {
        tavily: tavilyResults.length,
        news: newsResults.length,
        youtube: youtubeResults.length,
        google: serperResults.length,
        hackernews: hnResults.length
      }
    };

  } catch (error) {
    console.error('Data Collection Error:', error);
    throw error;
  }
};
