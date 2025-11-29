import { searchTavily, searchTavilyNews, searchReddit } from './tavilyService'; // Added searchReddit
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

  try {
    const [tavilyResults, newsResults, redditResults, youtubeResults, serperResults, hnResults] = await Promise.all([
      searchTavily(`${params.keyword} market trends problems`, isDeepDive ? 'advanced' : 'basic'),
      searchTavilyNews(`${params.keyword} industry news`),
      searchReddit(`${params.keyword} complaints reviews`), // NEW
      searchYouTube(params.keyword, params.geography), // Includes Transcripts now
      searchSerper(`${params.keyword} reviews and complaints`, params.geography),
      searchHackerNews(params.keyword)
    ]);

    const allResults = [
      ...tavilyResults,
      ...newsResults,
      ...redditResults,
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
        reddit: redditResults.length,
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
