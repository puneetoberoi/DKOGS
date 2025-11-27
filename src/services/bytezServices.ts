// src/services/bytezService.ts

import axios from 'axios';

export interface BytezAnalysis {
  marketInsights: string;
  competitorAnalysis: string;
  trendPredictions: string;
  confidence: number;
}

export async function analyzeBytez(keyword: string): Promise<string> {
  const apiKey = import.meta.env.VITE_BYTEZ_API_KEY;

  if (!apiKey) {
    console.log('ℹ️ Bytez: Not configured, skipping');
    return "";
  }

  console.log(`🤖 Bytez: Analyzing "${keyword}"...`);

  try {
    // Bytez API endpoint - adjust based on actual API documentation
    const response = await axios.post(
      'https://api.bytez.com/v1/analyze',
      {
        query: keyword,
        type: 'market_research',
        depth: 'comprehensive'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data?.analysis) {
      console.log('✅ Bytez: Analysis complete');
      return `BYTEZ ANALYSIS:\n${response.data.analysis}`;
    }

    return "";

  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn('⚠️ Bytez: Invalid API key');
    } else if (error.response?.status === 429) {
      console.warn('⚠️ Bytez: Rate limit exceeded');
    } else {
      console.warn('⚠️ Bytez Error:', error.message);
    }
    return "";
  }
}

// Alternative: If Bytez uses a different API structure
export async function analyzeBytezChat(keyword: string): Promise<string> {
  const apiKey = import.meta.env.VITE_BYTEZ_API_KEY;

  if (!apiKey) {
    return "";
  }

  try {
    const response = await axios.post(
      'https://api.bytez.com/v1/chat/completions',
      {
        model: 'bytez-market-analyzer',
        messages: [
          {
            role: 'system',
            content: 'You are a market research analyst. Provide detailed insights about market gaps, competitor analysis, and opportunities.'
          },
          {
            role: 'user',
            content: `Analyze the market for: ${keyword}. Focus on:
              1. Current market gaps and unmet needs
              2. Key competitors and their weaknesses
              3. Emerging trends and opportunities
              4. Consumer pain points`
          }
        ],
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (content) {
      console.log('✅ Bytez: Analysis complete');
      return `BYTEZ MARKET ANALYSIS:\n${content}`;
    }

    return "";

  } catch (error: any) {
    console.warn('⚠️ Bytez Error:', error.message);
    return "";
  }
}