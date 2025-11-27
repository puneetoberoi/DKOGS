// src/services/tavilyService.ts

import axios from 'axios';

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  publishedDate: string;
  score: number;
  source: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

export async function searchTavily(keyword: string, dateRange?: DateRange): Promise<TavilyResult[]> {
  const apiKey = import.meta.env.VITE_TAVILY_API_KEY;
  
  if (!apiKey) {
    console.log('ℹ️ Tavily: Not configured, skipping');
    return [];
  }

  console.log(`🔍 Tavily: Searching for "${keyword}"...`);

  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        api_key: apiKey,
        query: `${keyword} complaints problems issues reviews frustrated`,
        search_depth: 'advanced',
        include_domains: [
          'reddit.com',
          'medium.com',
          'trustpilot.com',
          'productreview.com.au',
          'consumeraffairs.com',
          'g2.com',
          'capterra.com'
        ],
        max_results: 10,
        include_answer: false,
        include_raw_content: false
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    if (!response.data?.results) {
      return [];
    }

    let results = response.data.results.map((item: any) => ({
      title: item.title || 'Untitled',
      url: item.url || '',
      content: item.content?.substring(0, 500) || '',
      publishedDate: item.published_date || 'Recent',
      score: item.score || 0,
      source: extractSource(item.url)
    }));

    // Filter by date if dateRange provided
    if (dateRange) {
      results = results.filter((item: TavilyResult) => {
        if (item.publishedDate === 'Recent') return true;
        try {
          const itemDate = new Date(item.publishedDate);
          return itemDate >= dateRange.from && itemDate <= dateRange.to;
        } catch {
          return true; // Include if date parsing fails
        }
      });
    }

    console.log(`✅ Tavily: Found ${results.length} results`);
    return results;

  } catch (error: any) {
    console.warn('⚠️ Tavily Error:', error.message);
    return [];
  }
}

function extractSource(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    if (domain.includes('reddit.com')) return 'Reddit Discussion';
    if (domain.includes('medium.com')) return 'Medium Article';
    if (domain.includes('trustpilot')) return 'Trustpilot Review';
    if (domain.includes('g2.com')) return 'G2 Review';
    if (domain.includes('capterra')) return 'Capterra Review';
    return domain;
  } catch {
    return 'Web Article';
  }
}