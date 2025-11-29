import React, { useEffect, useState } from 'react';
import { TrendingUp, ArrowRight, Search, Flame, Loader2 } from 'lucide-react';
import { getTrendingReports } from '../services/reportService';

// Fallback data for when DB is empty
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
          <Flame className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Trending Market Gaps</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          High-potential opportunities recently identified by the GapSpotter community. 
          Click any topic to start your own deep dive analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trends.map((item, index) => (
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

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {item.keyword}
            </h3>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className={item.overall_score > 80 ? "text-emerald-500" : "text-amber-500"} />
                <span className="font-bold text-slate-700 text-sm">Score: {item.overall_score}/100</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors text-slate-400">
                <Search size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingView;
