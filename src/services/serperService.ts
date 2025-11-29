const API_KEY = import.meta.env.VITE_SERPER_API_KEY;

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

export const searchSerper = async (query: string, region: string = 'us'): Promise<SearchResult[]> => {
  if (!API_KEY) {
    console.warn('Serper API key missing');
    return [];
  }

  const gl = region.toLowerCase() === 'canada' ? 'ca' : 'us';

  try {
    console.log(`🔍 Serper: Searching for "${query}"...`); // ADD LOG
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        gl: gl,
        num: 80 // MAX DATA
      })
    });

    const data = await response.json();
    
    if (!data.organic) return [];

    const results = data.organic.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || '',
      source: 'Google Search (Serper)'
    }));
    
    console.log(`✅ Serper: Found ${results.length} results`); // ADD LOG
    return results;

  } catch (error) {
    console.error('Serper Error:', error);
    return [];
  }
};
