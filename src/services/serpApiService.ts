// src/services/serpApiService.ts

import axios from 'axios';

export interface SerpSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  position: number;
}

export async function searchSerp(keyword: string, regionCode?: string): Promise<SerpSearchResult[]> {
  const apiKey = import.meta.env.VITE_SERPAPI_KEY;

  if (!apiKey) {
    console.log('ℹ️ SerpAPI: Not configured, skipping');
    return [];
  }

  const region = regionCode || 'us';
  console.log(`🔍 SerpAPI: Searching for "${keyword}" in ${region.toUpperCase()}...`);

  try {
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev 
      ? '/api/serp/search.json'
      : 'https://serpapi.com/search.json';

    const response = await axios.get(baseUrl, {
      params: {
        api_key: apiKey,
        q: keyword,
        engine: 'google',
        num: 10,
        gl: region, // Dynamic region
        hl: 'en'
      },
      timeout: 15000
    });

    const results: SerpSearchResult[] = [];

    if (response.data?.organic_results) {
      response.data.organic_results.forEach((item: any, index: number) => {
        results.push({
          title: item.title || '',
          link: item.link || '',
          snippet: item.snippet || '',
          displayLink: item.displayed_link || item.link || '',
          position: index + 1
        });
      });
    }

    console.log(`✅ SerpAPI: Found ${results.length} results`);
    return results;

  } catch (error: any) {
    console.warn('⚠️ SerpAPI Error:', error.message);
    return [];
  }
}