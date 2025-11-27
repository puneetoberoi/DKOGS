// src/services/dataCollector.ts

import { searchTavily } from './tavilyService';
import type { TavilyResult } from './tavilyService';

import { searchYouTube } from './youtubeService';
import type { YouTubeVideo } from './youtubeService';

import { searchSerp } from './serpApiService';
import type { SerpSearchResult } from './serpApiService';

import { searchNews } from './newsService';
import type { NewsArticle } from './newsService';

import { searchHackerNews } from './hackerNewsService';
import type { HackerNewsStory } from './hackerNewsService';

import type { SearchParams } from '../schema';

// ============================================
// INTERFACES
// ============================================
export interface AggregatedData {
  totalDataPoints: number;
  sources: {
    tavily: number;
    youtube: number;
    serpApi: number;
    news: number;
    hackerNews: number;
  };
  rawData: {
    webArticles: TavilyResult[];
    videos: YouTubeVideo[];
    searchResults: SerpSearchResult[];
    newsArticles: NewsArticle[];
    hnStories: HackerNewsStory[];
  };
  collectionTime: number;
  formattedForAI: string;
}

// ============================================
// SOURCE MAPPING
// ============================================
// Maps UI source names to internal service names
const SOURCE_SERVICE_MAP: Record<string, string[]> = {
  'Online Communities': ['tavily', 'hackerNews'],
  'E-commerce Reviews': ['tavily'],
  'Social Media': ['youtube'],
  'Local Reviews': ['tavily'],
  'News & Media': ['news', 'serpApi'],
  'Industry Forums': ['hackerNews', 'tavily'],
  'Visual Trends': ['youtube'],
  'Tech Blogs': ['serpApi', 'tavily']
};

// ============================================
// DATE CALCULATION
// ============================================
function calculateDateRange(lookback: string): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();

  switch (lookback) {
    case 'Last 30 Days':
      from.setDate(from.getDate() - 30);
      break;
    case 'Last 6 Months':
      from.setMonth(from.getMonth() - 6);
      break;
    case 'Last Year':
      from.setFullYear(from.getFullYear() - 1);
      break;
    case 'All Time':
      from.setFullYear(from.getFullYear() - 5); // 5 years max
      break;
    default:
      from.setMonth(from.getMonth() - 6); // Default 6 months
  }

  return { from, to };
}

// ============================================
// REGION MAPPING
// ============================================
function getRegionCode(geography: string): { countryCode: string; regionName: string } {
  switch (geography) {
    case 'USA':
      return { countryCode: 'us', regionName: 'United States' };
    case 'Canada':
      return { countryCode: 'ca', regionName: 'Canada' };
    default:
      return { countryCode: 'us', regionName: 'United States' };
  }
}

// ============================================
// DETERMINE WHICH SERVICES TO CALL
// ============================================
function getServicesToCall(selectedSources: string[]): Set<string> {
  const services = new Set<string>();
  
  selectedSources.forEach(source => {
    const mappedServices = SOURCE_SERVICE_MAP[source];
    if (mappedServices) {
      mappedServices.forEach(service => services.add(service));
    }
  });

  // If no valid sources selected, call all services
  if (services.size === 0) {
    return new Set(['tavily', 'youtube', 'serpApi', 'news', 'hackerNews']);
  }

  return services;
}

// ============================================
// MAIN DATA COLLECTION FUNCTION
// ============================================
export async function collectMarketData(params: SearchParams): Promise<AggregatedData> {
  const startTime = Date.now();
  const { keyword, sources, lookback, geography } = params;

  console.log(`🔍 Starting data collection for: "${keyword}"`);
  console.log(`📅 Lookback: ${lookback}`);
  console.log(`🌍 Region: ${geography}`);
  console.log(`📁 Selected sources: ${sources.join(', ')}`);

  // Calculate date range and region
  const dateRange = calculateDateRange(lookback);
  const region = getRegionCode(geography);
  const servicesToCall = getServicesToCall(sources);

  console.log(`🔧 Services to call: ${Array.from(servicesToCall).join(', ')}`);

  // Build API calls based on selected sources
  const apiCalls: Promise<any>[] = [];
  const callOrder: string[] = [];

  if (servicesToCall.has('tavily')) {
    apiCalls.push(searchTavily(keyword, dateRange));
    callOrder.push('tavily');
  } else {
    apiCalls.push(Promise.resolve([]));
    callOrder.push('tavily');
  }

  if (servicesToCall.has('youtube')) {
    apiCalls.push(searchYouTube(keyword, dateRange, region.countryCode));
    callOrder.push('youtube');
  } else {
    apiCalls.push(Promise.resolve([]));
    callOrder.push('youtube');
  }

  if (servicesToCall.has('serpApi')) {
    apiCalls.push(searchSerp(keyword, region.countryCode));
    callOrder.push('serpApi');
  } else {
    apiCalls.push(Promise.resolve([]));
    callOrder.push('serpApi');
  }

  if (servicesToCall.has('news')) {
    apiCalls.push(searchNews(keyword, dateRange, region.countryCode));
    callOrder.push('news');
  } else {
    apiCalls.push(Promise.resolve([]));
    callOrder.push('news');
  }

  if (servicesToCall.has('hackerNews')) {
    apiCalls.push(searchHackerNews(keyword, dateRange));
    callOrder.push('hackerNews');
  } else {
    apiCalls.push(Promise.resolve([]));
    callOrder.push('hackerNews');
  }

  // Execute all API calls in parallel
  const results = await Promise.allSettled(apiCalls);

  // Extract results
  const webArticles = results[0].status === 'fulfilled' ? results[0].value : [];
  const videos = results[1].status === 'fulfilled' ? results[1].value : [];
  const searchResults = results[2].status === 'fulfilled' ? results[2].value : [];
  const newsArticles = results[3].status === 'fulfilled' ? results[3].value : [];
  const hnStories = results[4].status === 'fulfilled' ? results[4].value : [];

  // Calculate totals
  const commentCount = videos.reduce((sum: number, v: YouTubeVideo) => sum + v.topComments.length, 0);
  const totalDataPoints = 
    webArticles.length +
    videos.length +
    commentCount +
    searchResults.length +
    newsArticles.length +
    hnStories.length;

  const collectionTime = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`✅ Collection complete: ${totalDataPoints} data points in ${collectionTime}s`);

  // Format data for AI consumption
  const formattedForAI = formatDataForGemini({
    webArticles,
    videos,
    searchResults,
    newsArticles,
    hnStories
  }, geography, lookback);

  return {
    totalDataPoints,
    sources: {
      tavily: webArticles.length,
      youtube: videos.length + commentCount,
      serpApi: searchResults.length,
      news: newsArticles.length,
      hackerNews: hnStories.length
    },
    rawData: {
      webArticles,
      videos,
      searchResults,
      newsArticles,
      hnStories
    },
    collectionTime: parseFloat(collectionTime),
    formattedForAI
  };
}

// ============================================
// FORMAT DATA FOR AI
// ============================================
function formatDataForGemini(data: any, geography: string, lookback: string): string {
  let formatted = `=== REAL MARKET DATA COLLECTED ===\n`;
  formatted += `Region: ${geography} | Time Period: ${lookback}\n\n`;

  // Web Articles
  if (data.webArticles.length > 0) {
    formatted += '--- WEB ARTICLES & REVIEWS ---\n';
    data.webArticles.forEach((article: TavilyResult, i: number) => {
      formatted += `${i + 1}. "${article.title}"\n`;
      formatted += `   Source: ${article.source} (${article.url})\n`;
      formatted += `   Content: ${article.content}\n`;
      formatted += `   Published: ${article.publishedDate}\n\n`;
    });
  }

  // YouTube
  if (data.videos.length > 0) {
    formatted += '--- YOUTUBE VIDEO REVIEWS ---\n';
    data.videos.forEach((video: YouTubeVideo, i: number) => {
      formatted += `${i + 1}. "${video.title}" by ${video.channelName}\n`;
      formatted += `   URL: ${video.url}\n`;
      formatted += `   Published: ${video.publishedAt}\n`;
      if (video.topComments.length > 0) {
        formatted += `   Top Comments:\n`;
        video.topComments.forEach((comment) => {
          formatted += `   - "${comment.text.substring(0, 200)}" (${comment.likeCount} likes)\n`;
        });
      }
      formatted += '\n';
    });
  }

  // SerpAPI Search Results
  if (data.searchResults.length > 0) {
    formatted += '--- SEARCH ENGINE RESULTS ---\n';
    data.searchResults.forEach((result: SerpSearchResult, i: number) => {
      formatted += `${i + 1}. "${result.title}"\n`;
      formatted += `   ${result.snippet}\n`;
      formatted += `   Source: ${result.displayLink}\n\n`;
    });
  }

  // News
  if (data.newsArticles.length > 0) {
    formatted += '--- NEWS & MEDIA COVERAGE ---\n';
    data.newsArticles.forEach((article: NewsArticle, i: number) => {
      formatted += `${i + 1}. "${article.title}" - ${article.source}\n`;
      formatted += `   ${article.description}\n`;
      formatted += `   Published: ${new Date(article.publishedAt).toLocaleDateString()}\n\n`;
    });
  }

  // Hacker News
  if (data.hnStories.length > 0) {
    formatted += '--- TECH COMMUNITY DISCUSSIONS ---\n';
    data.hnStories.forEach((story: HackerNewsStory, i: number) => {
      formatted += `${i + 1}. "${story.title}"\n`;
      formatted += `   ${story.score} points | ${story.commentCount} comments | by ${story.author}\n`;
      formatted += `   URL: ${story.url}\n\n`;
    });
  }

  return formatted;
}