// src/services/newsService.ts

import axios from 'axios';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

export async function searchNews(
  keyword: string, 
  dateRange?: DateRange,
  countryCode?: string
): Promise<NewsArticle[]> {
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;
  
  if (!apiKey) {
    console.log('ℹ️ News API: Not configured, skipping');
    return [];
  }

  console.log(`📰 News API: Searching for "${keyword}" in ${countryCode?.toUpperCase() || 'US'}...`);

  try {
    // Build params
    const params: any = {
      q: keyword,
      language: 'en',
      sortBy: 'relevancy',
      pageSize: 10,
      apiKey: apiKey
    };

    // Add date filtering
    if (dateRange) {
  	const thirtyDaysAgo = new Date();
  	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  	// Use the later of: requested from date OR 30 days ago
  	const effectiveFrom = dateRange.from > thirtyDaysAgo ? dateRange.from : thirtyDaysAgo;
  
  	params.from = effectiveFrom.toISOString().split('T')[0];
  	params.to = dateRange.to.toISOString().split('T')[0];
  
  	console.log(`📰 News API: Date limited to last 30 days (free tier)`);
     }

    const response = await axios.get(
      'https://newsapi.org/v2/everything',
      {
        params,
        timeout: 10000
      }
    );

    if (!response.data?.articles) {
      return [];
    }

    const articles = response.data.articles.map((article: any) => ({
      title: article.title || '',
      description: article.description || '',
      url: article.url || '',
      source: article.source?.name || 'Unknown',
      publishedAt: article.publishedAt || ''
    }));

    console.log(`✅ News API: Found ${articles.length} articles`);
    return articles;

  } catch (error: any) {
    console.warn('⚠️ News API Error:', error.message);
    return [];
  }
}