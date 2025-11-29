// src/services/geminiService.ts

import { GoogleGenAI, Type } from "@google/genai";
import Groq from "groq-sdk";
import { type MarketReport, type SearchParams, AnalysisStatus } from "../schema";
import { collectMarketData } from './dataCollector';
import { analyzeBytez } from './bytezService';
import { logSuccess, logError, logQuery } from '../utils/logger';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

async function fetchGroqSentiment(keyword: string): Promise<string> {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    console.log('ℹ️ Groq: Not configured, skipping');
    return "";
  }

  console.log(`⚡ Groq: Analyzing "${keyword}"...`);

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Analyze market sentiment and trends for: ${keyword}. 
          
          Provide insights on:
          1. Consumer sentiment (positive/negative factors)
          2. Market opportunities
          3. Potential challenges
          4. Competitor landscape overview
          
          Be specific and actionable.`
        }
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 1000
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      console.log('✅ Groq: Analysis complete');
      return `GROQ (LLAMA 3) ANALYSIS:\n${content}`;
    }
    return "";

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn("⚠️ Groq analysis skipped:", errorMessage);
    return "";
  }
}

function getLookbackDays(lookback: string): number {
  switch (lookback) {
    case 'Last 30 Days': return 30;
    case 'Last 6 Months': return 180;
    case 'Last Year': return 365;
    case 'All Time': return 730;
    default: return 180;
  }
}

export const analyzeMarket = async (
  params: SearchParams, 
  onStatusUpdate?: (status: string) => void
): Promise<MarketReport> => {
  const modelId = 'gemini-2.0-flash';
  const gapCount = params.gapCount || 5;
  const startTime = Date.now();

  logQuery({
    keyword: params.keyword,
    sources: params.sources,
    region: params.geography,
    lookbackDays: getLookbackDays(params.lookback),
    gapsRequested: gapCount,
  });
  
  try {
    if (onStatusUpdate) onStatusUpdate(AnalysisStatus.SCRAPING);
    const realData = await collectMarketData(params);
    
    console.log(`📊 Collected ${realData.totalDataPoints} real data points`);
    console.log(`📁 Sources breakdown:`, JSON.stringify(realData.sources, null, 2)); // FORCE READABLE LOG
    
    let externalContext = "";
    const usedSources = ["Gemini 2.0 Flash"];

    if (onStatusUpdate) onStatusUpdate(AnalysisStatus.GROQ_ANALYSIS);
    const groqData = await fetchGroqSentiment(params.keyword);
    if (groqData) {
      externalContext += `\n\n${groqData}`;
      usedSources.push("Groq (Llama 3)");
    }

    if (onStatusUpdate) onStatusUpdate(AnalysisStatus.BYTEZ_ANALYSIS);
    const bytezData = await analyzeBytez(params.keyword);
    if (bytezData) {
      externalContext += `\n\n${bytezData}`;
      usedSources.push("Bytez AI");
    }

    if (onStatusUpdate) onStatusUpdate(AnalysisStatus.CLUSTERING);

    const prompt = `
      Act as a world-class GapSpotter specializing in market research for ${params.geography}. 
      
      ## CONTEXT
      ANALYSIS TARGET: "${params.keyword}"
      GEOGRAPHY: ${params.geography}
      TIME PERIOD: ${params.lookback}
      REQUESTED GAPS: ${gapCount}
      
      === REAL MARKET DATA (${realData.totalDataPoints} items) ===
      ${realData.formattedForAI}
      
      === EXTERNAL AI ANALYSIS ===
      ${externalContext || "No additional AI context available"}
      
      ## TASK
      Generate a structured market report based STRICTLY on the REAL MARKET DATA provided above.
      
      ## CRITICAL RULES (ZERO HALLUCINATION)
      1. SOURCE OF TRUTH: Analyze ONLY the text provided in the REAL MARKET DATA block. Do not invent competitors or statistics.
      2. UNMET NEEDS: Focus on what is MISSING. Look for complaints ("hate", "broken", "wish"), negative sentiment, and feature requests in the data.
      3. QUOTES: The 'analyzedSamples' array MUST contain verbatim quotes from the data. Do not paraphrase.
      4. ESTIMATION: If specific numbers (market size, trends) are not in the text, infer reasonable estimates based on the context and label them as "(estimated)".
      
      ## FIELD INSTRUCTIONS
      - GAPS: Identify exactly ${gapCount} distinct market opportunities. If fewer are found, create specific variations based on user pain points.
      - PAIN POINTS: Provide at least 3 specific, distinct pain points for EACH gap.
      - COMPETITORS: Extract explicit brand names found in the text.
      - TRENDS: Generate trend data for years 2021-2025 based on the sentiment trajectory in the data.
      - SEARCH VOLUME: Return a specific number or range string (e.g., "12,500/mo"). Infer from context if necessary.
      - SOURCES: Return ONLY platform names (e.g., "Reddit", "YouTube"), not URLs.
      - RECOMMENDATIONS: Suggest 3 specific related niche keywords.
      - COMPETITION DENSITY: Must be one of: "Low", "Medium", "High", "Saturated". Infer this based on the number of competitors mentioned.
    `;

    const schema = {
      type: Type.OBJECT,
      properties: {
        industry: { type: Type.STRING },
        totalAnalyzed: { type: Type.INTEGER },
        overallSentiment: { type: Type.INTEGER, description: "Integer 0-100" },
        sentimentBreakdown: {
          type: Type.OBJECT,
          properties: {
            positive: { type: Type.INTEGER },
            neutral: { type: Type.INTEGER },
            negative: { type: Type.INTEGER }
          },
          required: ["positive", "neutral", "negative"]
        },
        sentimentFactors: {
          type: Type.OBJECT,
          properties: {
            positive: { type: Type.ARRAY, items: { type: Type.STRING } },
            negative: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        analyzedSamples: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              source: { type: Type.STRING },
              date: { type: Type.STRING },
              type: { type: Type.STRING },
              snippet: { type: Type.STRING }
            },
            required: ["source", "date", "type", "snippet"]
          }
        },
        competitors: { 
          type: Type.ARRAY, 
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              strength: { type: Type.STRING },
              weakness: { type: Type.STRING }
            },
            required: ["name", "strength", "weakness"]
          }
        },
        marketTrends: {
          type: Type.ARRAY,
          description: "Must contain exactly 5 items representing 5 years",
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.STRING },
              demandIndex: { type: Type.NUMBER }
            },
            required: ["year", "demandIndex"]
          }
        },
        summary: { type: Type.STRING },
        relatedOpportunities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["keyword", "reason"]
          }
        },
        gaps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              sentimentScore: { type: Type.INTEGER },
              willingnessToPay: { type: Type.STRING },
              estimatedPrice: { type: Type.NUMBER },
              competitionDensity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Saturated"] },
              opportunityScore: { type: Type.INTEGER },
              recommendedSolution: { type: Type.STRING },
              searchVolume: { type: Type.STRING },
              sources: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "painPoints", "sentimentScore", "willingnessToPay", "estimatedPrice", "competitionDensity", "opportunityScore", "recommendedSolution", "sources"]
          }
        }
      },
      required: ["industry", "totalAnalyzed", "overallSentiment", "sentimentBreakdown", "sentimentFactors", "analyzedSamples", "competitors", "marketTrends", "gaps", "summary", "relatedOpportunities"]
    };

    if (onStatusUpdate) onStatusUpdate(AnalysisStatus.SCORING);

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (!response.text) {
      throw new Error("Failed to generate analysis");
    }

    const result = JSON.parse(response.text) as MarketReport;
    
    result.keyword = params.keyword;
    result.totalAnalyzed = realData.totalDataPoints; 
    result.dataSources = usedSources.concat(params.sources); 

    logSuccess({
      keyword: params.keyword,
      sources: params.sources,
      region: params.geography,
      lookbackDays: getLookbackDays(params.lookback),
      gapsRequested: gapCount,
      durationMs: Date.now() - startTime,
    });
    
    return result;

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logError({
      keyword: params.keyword,
      sources: params.sources,
      region: params.geography,
      errorMessage: errorMessage,
    });
    
    throw error;
  }
};
