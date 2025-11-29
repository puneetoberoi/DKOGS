import React, { useEffect, useState } from 'react';
import { TrendingUp, ArrowRight, Search, Flame, Loader2, AlertTriangle, Trophy, Clock } from 'lucide-react';
import { getTrendingReports } from '../services/reportService';

// Fallback data
const FALLBACK_TRENDS = [
  { keyword: "Sustainable Packaging", industry: "Logistics", overall_score: 85, created_at: new Date().toISOString() },
  { keyword: "AI Legal Assistant", industry: "Legal Tech", overall_score: 92, created_at: new Date().toISOString() },
  { keyword: "Vertical Farming", industry: "Agriculture", overall_score: 78, created_at: new Date().toISOString() },
  { keyword: "Pet Insurance", industry: "Fintech", overall_score: 88, created_at: new Date().toISOString() },
  { keyword: "Micro-SaaS", industry: "Software", overall_score: 75, created_at: new Date().toISOString() },
  { keyword: "Smart Home Security", industry: "Consumer Electronics", overall_score: 82, created_at: new Date().toISOString() }
];

interface TrendingViewProps {
  onSelectTopic: (topic: string) => void;
}

const TrendingView: React.FC<TrendingViewProps> = ({ onSelectTopic }) => {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrends = async () => {
      setLoading(true);
      const result = await getTrendingReports();
      
      if (result.success && result.data && result.data.length > 0) {
        setTrends(result.data);
      } else {
        setTrends(FALLBACK_TRENDS);
      }
      setLoading(false);
    };
    
    loadTrends();
  }, []);

  // Segment Data
  // High Pain = Low Sentiment Score (e.g. < 50) -> High Opportunity
  const highPainOpportunities = trends.filter(t => t.overall_score < 60).slice(0, 3);
  
  // Top Rated = High Score
  const topRated = trends.filter(t => t.overall_score >= 70).slice(0, 3);
  
  // Recent = Just the first few
  const recent = trends.slice(0, 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const Section = ({ title, icon: Icon, data, color }: any) => (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item: any, index: number) => (
          <div 
            key={index}
            onClick={() => onSelectTopic(item.keyword)}
            className="group bg-white rounded-xl border border-slate-200 p-6 cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
              {new Date(item.created_at).toLocaleDateString()}
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {item.industry || 'General'}
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
              {item.keyword}
            </h3>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <span className="flex items-center gap-1">
                  <Search size={12} /> Analyze
                </span>
              </div>
              <div className="flex items-center text-indigo-600 font-bold text-xs gap-1 group-hover:translate-x-1 transition-transform">
                Unlock Report <ArrowRight size={12} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.length === 0 && <p className="text-slate-400 text-sm italic">No opportunities found in this category yet.</p>}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
          <Flame className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Trending Market Gaps</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Discover high-potential opportunities identified by the GapSpotter community.
        </p>
      </div>

      <Section 
        title="High Pain Points (Best Opportunities)" 
        icon={AlertTriangle} 
        data={highPainOpportunities} 
        color="bg-rose-500" 
      />

      <Section 
        title="Fresh Discoveries" 
        icon={Clock} 
        data={recent} 
        color="bg-indigo-500" 
      />

      <Section 
        title="Top Rated Markets" 
        icon={Trophy} 
        data={topRated} 
        color="bg-emerald-500" 
      />
    </div>
  );
};

export default TrendingView;
