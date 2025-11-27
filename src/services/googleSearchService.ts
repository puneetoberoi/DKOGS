// googleSearchService.ts

import axios from 'axios';

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export async function searchGoogle(keyword: string): Promise<GoogleSearchResult[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const cseId = import.meta.env.VITE_GOOGLE_CSE_ID;
  
  // Skip if not configured
  if (!apiKey || !cseId) {
    console.log('ℹ️ Google Search: Not configured, skipping');
    return [];
  }

  // Log for debugging
  console.log('🔍 Attempting Google Search...');
  console.log('   CSE ID:', cseId);
  console.log('   Query:', keyword);

  try {
    const response = await axios.get(
      'https://www.googleapis.com/customsearch/v1',
      {
        params: {
          key: apiKey,
          cx: cseId,
          q: keyword,
          num: 10
        },
        timeout: 10000 // 10 second timeout
      }
    );

    if (!response.data?.items) {
      console.log('⚠️ Google Search: No results');
      return [];
    }

    console.log(`✅ Google Search: ${response.data.items.length} results`);
    
    return response.data.items.map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      displayLink: item.displayLink || ''
    }));

  } catch (error: any) {
    // Silent fail - don't break the app
    console.warn('⚠️ Google Search unavailable:', 
      error.response?.data?.error?.message || error.message
    );
    return []; // Return empty, let other data sources work
  }
}