import { MarketReport } from '../schema';

export function generateDemoReport(keyword: string, region: string): MarketReport {
  // Deterministic randomization based on keyword length
  const seed = keyword.length;
  const getScore = (base: number, variance: number) => Math.min(100, Math.max(0, base + (seed % variance) - variance/2));

  const demoReport: MarketReport = {
    keyword: keyword,
    industry: `${keyword} Market Analysis`,
    totalAnalyzed: 1247,
    summary: `Analysis of the ${keyword} market in ${region} reveals significant unmet needs in durability and customization. While current solutions are abundant, user sentiment indicates frustration with "planned obsolescence" and lack of sustainable options. The market shows a strong upward trend for premium, eco-friendly alternatives.`,
    
    overallSentiment: 45,
    
    sentimentBreakdown: {
      positive: 20,
      neutral: 35,
      negative: 45
    },
    
    sentimentFactors: {
      positive: ["Availability", "Variety of options", "Low entry price"],
      negative: ["Poor durability", "Lack of customization", "Customer support issues", "Safety concerns"]
    },
    
    competitors: [
      { name: "MarketLeader Inc.", strength: "Distribution network", weakness: "Slow innovation" },
      { name: "BudgetChoice", strength: "Price point", weakness: "Quality control" },
      { name: "PremiumSelect", strength: "Brand loyalty", weakness: "High cost" }
    ],
    
    marketTrends: [
      { year: "2021", demandIndex: 40 },
      { year: "2022", demandIndex: 55 },
      { year: "2023", demandIndex: 65 },
      { year: "2024", demandIndex: 85 },
      { year: "2025", demandIndex: 95 }
    ],
    
    analyzedSamples: [
      { source: "Reddit", date: "2024-02-15", type: "Complaint", snippet: "Why do all these break after one week? I'd pay double for something that lasts." },
      { source: "YouTube", date: "2024-01-20", type: "Review", snippet: "The features are great but the build quality feels cheap." },
      { source: "Amazon", date: "2024-03-01", type: "Review", snippet: "Customer service never replied to my warranty claim." }
    ],

    relatedOpportunities: [
      { keyword: `Sustainable ${keyword}`, reason: "Growing demand for eco-friendly materials." },
      { keyword: `Premium ${keyword} Accessories`, reason: "High margin add-ons often overlooked." },
      { keyword: `Smart ${keyword}`, reason: "Tech integration trend is rising." }
    ],
    
    dataSources: ["Online Communities", "Social Media", "E-commerce Reviews"],
    
    gaps: [
      {
        title: `Eco-Friendly ${keyword} Alternatives`,
        description: `Users are actively searching for sustainable versions of ${keyword} but finding limited options.`,
        painPoints: ["Plastic waste concerns", "Short lifespan", "Chemical smells"],
        sentimentScore: 30,
        opportunityScore: 85,
        willingnessToPay: "$50 - $80",
        estimatedPrice: 65,
        competitionDensity: "Low",
        recommendedSolution: "Launch a biodegradable line with a lifetime guarantee.",
        searchVolume: "15k/mo",
        sources: ["Reddit", "Twitter"]
      },
      {
        title: `Customizable ${keyword} Kits`,
        description: "Enthusiasts want to modify and repair their own units but lack official parts.",
        painPoints: ["Hard to repair", "Generic designs", "Voiding warranty"],
        sentimentScore: 40,
        opportunityScore: 78,
        willingnessToPay: "$100+",
        estimatedPrice: 120,
        competitionDensity: "Medium",
        recommendedSolution: "Sell a modular kit with interchangeable parts.",
        searchVolume: "8k/mo",
        sources: ["YouTube", "Forums"]
      },
      {
        title: `${keyword} Subscription Service`,
        description: "A recurring model for consumables related to this market.",
        painPoints: ["Forgetting to reorder", "Bulk buying storage", "Inconsistent quality"],
        sentimentScore: 55,
        opportunityScore: 65,
        willingnessToPay: "$20/mo",
        estimatedPrice: 20,
        competitionDensity: "High",
        recommendedSolution: "Monthly curated box with auto-ship.",
        searchVolume: "22k/mo",
        sources: ["Instagram", "TikTok"]
      }
    ]
  };

  return demoReport;
}
