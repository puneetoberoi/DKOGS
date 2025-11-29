const API_KEY = import.meta.env.VITE_TAVILY_API_KEY;

export const searchTavily = async (query: string, depth: 'basic' | 'advanced' = 'basic'): Promise<any[]> => {
  if (!API_KEY) return [];

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: API_KEY,
        query: query,
        search_depth: depth,
        include_domains: [],
        max_results: 10
      }),
    });

    const data = await response.json();
    return data.results.map((r: any) => ({
      title: r.title,
      link: r.url,
      snippet: r.content,
      source: 'Tavily Web'
    }));
  } catch (error) {
    console.error('Tavily Error:', error);
    return [];
  }
};

export const searchTavilyNews = async (query: string): Promise<any[]> => {
  if (!API_KEY) return [];

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: API_KEY,
        query: query,
        topic: "news",
        max_results: 5
      }),
    });

    const data = await response.json();
    return data.results.map((r: any) => ({
      title: r.title,
      link: r.url,
      snippet: r.content,
      source: 'News & Media'
    }));
  } catch (error) {
    console.error('Tavily News Error:', error);
    return [];
  }
};

// NEW: Reddit Search
export const searchReddit = async (query: string): Promise<any[]> => {
  if (!API_KEY) return [];

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: API_KEY,
        query: query,
        include_domains: ['reddit.com', 'old.reddit.com'],
        max_results: 8
      }),
    });

    const data = await response.json();
    return data.results.map((r: any) => ({
      title: r.title,
      link: r.url,
      snippet: r.content,
      source: 'Reddit Discussion'
    }));
  } catch (error) {
    console.error('Reddit Search Error:', error);
    return [];
  }
};
