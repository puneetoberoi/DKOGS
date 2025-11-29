const API_KEY = import.meta.env.VITE_SERPER_API_KEY;

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

export const searchSerper = async (query: string, region: string = 'us'): Promise<SearchResult[]> => {
  if (!API_KEY) {
    return [];
  }

  const gl = region.toLowerCase() === 'canada' ? 'ca' : 'us';

  try {
    console.log(`🔍 Serper: Searching for "${query}"...`);
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        gl: gl,
        num: 50 // Attempt 50
      })
    });

    const data = await response.json();
    const results: SearchResult[] = [];

    // 1. Organic Results
    if (data.organic) {
      data.organic.forEach((item: any) => {
        results.push({
          title: item.title,
          link: item.link,
          snippet: item.snippet || '',
          source: 'Google Search (Serper)'
        });
      });
    }

    // 2. People Also Ask (High Value for Gaps)
    if (data.peopleAlsoAsk) {
      data.peopleAlsoAsk.forEach((item: any) => {
        results.push({
          title: item.question,
          link: item.link || '',
          snippet: item.snippet || 'Common Question',
          source: 'Google People Also Ask'
        });
      });
    }

    console.log(`✅ Serper: Found ${results.length} combined results`);
    return results;

  } catch (error) {
    console.error('Serper Error:', error);
    return [];
  }
};
