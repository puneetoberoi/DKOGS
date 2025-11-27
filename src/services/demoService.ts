// src/services/demoService.ts

import type { MarketReport } from '../schema';

/**
 * Generates a complete demo report with dummy data
 * 
 * ⚠️ IMPORTANT: This function makes ZERO API calls
 * All data is generated locally for Quick Scan preview
 */
export function generateDemoReport(keyword: string, geography: string): MarketReport {
  const currentYear = new Date().getFullYear();
  const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
  
  // Log to confirm no API calls
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎭 DEMO MODE - Generating Local Data');
  console.log(`   Keyword: "${keyword}"`);
  console.log(`   Region: ${geography}`);
  console.log('   API Calls: 0 (Zero)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const demoReport: MarketReport = {
    keyword: keyword,
    industry: `${capitalizedKeyword} Industry`,
    totalAnalyzed: 127,
    overallSentiment: 68,
    sentimentBreakdown: {
      positive: 45,
      neutral: 35,
      negative: 20
    },
    sentimentFactors: {
      positive: [
        `Growing demand for ${capitalizedKeyword.toLowerCase()} solutions`,
        'Increasing consumer awareness in the market',
        'Innovation opportunities remain untapped',
        'Strong online community engagement'
      ],
      negative: [
        'High competition in premium segments',
        'Price sensitivity among consumers',
        'Supply chain challenges reported',
        'Customer service complaints common'
      ]
    },
    analyzedSamples: [
      {
        source: 'Sample Reddit Discussion',
        date: '2024-01-15',
        type: 'Forum',
        snippet: `"I've been looking for a better ${capitalizedKeyword.toLowerCase()} solution but can't find anything that fits my needs..."`
      },
      {
        source: 'Sample Product Review',
        date: '2024-02-20',
        type: 'Review',
        snippet: `"The current ${capitalizedKeyword.toLowerCase()} options are either too expensive or lack the quality I'm looking for..."`
      },
      {
        source: 'Sample News Article',
        date: '2024-03-10',
        type: 'News',
        snippet: `"The ${capitalizedKeyword.toLowerCase()} market in ${geography} is projected to grow 15% annually..."`
      },
      {
        source: 'Sample YouTube Comment',
        date: '2024-03-25',
        type: 'Social',
        snippet: `"Why doesn't anyone make a ${capitalizedKeyword.toLowerCase()} that actually works as advertised?"`
      }
    ],
    competitors: [
      { 
        name: 'Market Leader Inc.', 
        strength: 'Strong brand recognition and market presence', 
        weakness: 'Premium pricing limits market reach' 
      },
      { 
        name: 'Budget Solutions Co.', 
        strength: 'Competitive pricing strategy', 
        weakness: 'Quality concerns and limited features' 
      },
      { 
        name: 'Innovation Labs', 
        strength: 'Cutting-edge technology and features', 
        weakness: 'Limited distribution network' 
      },
      { 
        name: 'Traditional Corp.', 
        strength: 'Established customer base and trust', 
        weakness: 'Slow to adopt new technologies' 
      },
      { 
        name: 'Startup Disruptor', 
        strength: 'Agile and customer-focused approach', 
        weakness: 'Limited resources and brand awareness' 
      }
    ],
    marketTrends: [
      { year: String(currentYear - 4), demandIndex: 42 },
      { year: String(currentYear - 3), demandIndex: 51 },
      { year: String(currentYear - 2), demandIndex: 63 },
      { year: String(currentYear - 1), demandIndex: 74 },
      { year: String(currentYear), demandIndex: 88 }
    ],
    summary: `📋 SAMPLE REPORT PREVIEW

This is a demonstration report for "${capitalizedKeyword}" in the ${geography} market. 

⚠️ The data shown here is ILLUSTRATIVE ONLY and does not reflect real market conditions.

🔓 UPGRADE TO DEEP DIVE TO UNLOCK:

✅ Real-time data from multiple online sources
✅ AI-powered sentiment analysis from actual consumer discussions  
✅ Genuine competitor insights based on market research
✅ Actionable opportunities backed by real data points
✅ Export capabilities (PDF & CSV)

The Deep Dive analysis uses advanced AI to scan thousands of real online discussions, reviews, and news articles to identify genuine market gaps.

This preview demonstrates the report format you'll receive with a full analysis.`,
    gaps: [
      {
        title: `Sample Gap: Affordable ${capitalizedKeyword}`,
        description: `This is a sample market gap. Real analysis would identify specific opportunities based on actual consumer complaints in the ${capitalizedKeyword.toLowerCase()} market.`,
        painPoints: [
          'Sample: Price concerns among consumers',
          'Sample: Quality vs. cost trade-offs',
          'Sample: Limited budget-friendly options'
        ],
        sentimentScore: 72,
        willingnessToPay: '$50-150/month',
        estimatedPrice: 99,
        competitionDensity: 'Medium' as const,
        opportunityScore: 78,
        recommendedSolution: `A sample solution recommendation would appear here based on real market research.`,
        searchVolume: '5,000/mo (sample)',
        sources: ['Demo Source 1', 'Demo Source 2']
      },
      {
        title: `Sample Gap: Premium ${capitalizedKeyword} Service`,
        description: `Another sample gap showing premium segment opportunity. Real data would reveal specific frustrations.`,
        painPoints: [
          'Sample: Lack of personalized service',
          'Sample: Quality inconsistency issues'
        ],
        sentimentScore: 65,
        willingnessToPay: '$200-500/month',
        estimatedPrice: 299,
        competitionDensity: 'Low' as const,
        opportunityScore: 85,
        recommendedSolution: `Premium service recommendation would be detailed here.`,
        searchVolume: '2,500/mo (sample)',
        sources: ['Demo Source 3']
      },
      {
        title: `Sample Gap: ${capitalizedKeyword} for Beginners`,
        description: `A sample niche opportunity targeting newcomers who need simpler solutions.`,
        painPoints: [
          'Sample: Overwhelming complexity',
          'Sample: Lack of educational resources'
        ],
        sentimentScore: 58,
        willingnessToPay: '$25-75/month',
        estimatedPrice: 49,
        competitionDensity: 'Low' as const,
        opportunityScore: 72,
        recommendedSolution: `Beginner-friendly solution with educational components.`,
        searchVolume: '8,000/mo (sample)',
        sources: ['Demo Source 4', 'Demo Source 5']
      }
    ],
    dataSources: ['📌 Demo Data - Upgrade for Real Sources']
  };

  console.log('✅ Demo report generated successfully');
  return demoReport;
}