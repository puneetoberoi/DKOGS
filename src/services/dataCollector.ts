import { searchTavily, searchTavilyNews } from './tavilyService';
import { searchYoutube } from './youtubeService';
import { searchSerper } from './serperService'; // New Import
import { searchHackerNews } from './hackerNewsService';
import type { SearchParams } from '../schema';

export interface AggregatedData {
  formattedForAI: string;
  totalDataPoints: number;
  sources: Record<string, number>;
}

export const collectMarketData = async (params: SearchParams): Promise<AggregatedData> => {
  console.log(`🔍 Starting data collection for: "${params.keyword}"`);
  
  // Increase limit for Deep Dive? logic can be added here
  const isDeepDive = params.depth === 'Deep Dive';

  try {
    const [tavilyResults, newsResults, youtubeResults, serperResults, hnResults] = await Promise.all([
      searchTavily(`${params.keyword} market trends problems`, isDeepDive ? 'advanced' : 'basic'),
      searchTavilyNews(`${params.keyword} industry news`), // Replaces NewsAPI
      searchYoutube(params.keyword, params.geography),
      searchSerper(`${params.keyword} reviews and complaints`, params.geography), // Replaces SerpAPI
      searchHackerNews(params.keyword)
    ]);

    const allResults = [
      ...tavilyResults,
      ...newsResults,
      ...youtubeResults,
      ...serperResults,
      ...hnResults
    ];

    // Format for Gemini
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
