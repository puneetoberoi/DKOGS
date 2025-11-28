import React from 'react';
import { ArrowLeft, Trophy, TrendingUp, DollarSign, Users, Search, Target } from 'lucide-react';
import type { MarketReport } from '../schema';

interface ComparisonViewProps {
  reports: MarketReport[];
  onBack: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ reports, onBack }) => {
  
  // Helper to get top gap data
  const getTopGap = (r: MarketReport) => r.gaps[0];

  // Helper to highlight winner (returns class)
  const getScoreClass = (score: number, allScores: number[]) => {
    const max = Math.max(...allScores);
    return score === max ? "text-emerald-600 font-bold bg-emerald-50" : "text-slate-600";
  };

  const scores = reports.map(r => r.overallSentiment); // Using sentiment as proxy for overall score if separate score missing

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Market Comparison</h1>
          <p className="text-slate-500 text-sm">Comparing {reports.length} market opportunities</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-6 text-left w-48 text-xs font-bold text-slate-400 uppercase tracking-wider">Metric</th>
              {reports.map((r, i) => (
                <th key={i} className="p-6 text-left min-w-[200px]">
                  <span className="block text-lg font-bold text-slate-900">{r.keyword}</span>
                  <span className="text-xs text-slate-500 font-medium">{r.industry}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            
            {/* Overall Score */}
            <tr>
              <td className="p-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Trophy size={16} className="text-amber-500" /> Overall Score
              </td>
              {reports.map((r, i) => (
                <td key={i} className="p-6">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg ${getScoreClass(r.overallSentiment, scores)}`}>
                    {r.overallSentiment}/100
                  </div>
                </td>
              ))}
            </tr>

            {/* Top Gap */}
            <tr>
              <td className="p-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Target size={16} className="text-indigo-500" /> Top Opportunity
              </td>
              {reports.map((r, i) => {
                const top = getTopGap(r);
                return (
                  <td key={i} className="p-6">
                    <p className="font-medium text-slate-900 mb-1">{top.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{top.description}</p>
                  </td>
                );
              })}
            </tr>

            {/* Pricing Power */}
            <tr>
              <td className="p-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <DollarSign size={16} className="text-emerald-500" /> Est. Price
              </td>
              {reports.map((r, i) => (
                <td key={i} className="p-6 text-slate-700 font-mono">
                  ${getTopGap(r).estimatedPrice}
                </td>
              ))}
            </tr>

            {/* Competition */}
            <tr>
              <td className="p-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users size={16} className="text-rose-500" /> Competition
              </td>
              {reports.map((r, i) => {
                const density = getTopGap(r).competitionDensity;
                const color = density === 'Low' ? 'text-emerald-600 bg-emerald-50' : density === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';
                return (
                  <td key={i} className="p-6">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${color}`}>
                      {density}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Search Volume */}
            <tr>
              <td className="p-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Search size={16} className="text-blue-500" /> Search Vol.
              </td>
              {reports.map((r, i) => (
                <td key={i} className="p-6 text-slate-700">
                  {getTopGap(r).searchVolume || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Trend */}
            <tr>
              <td className="p-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <TrendingUp size={16} className="text-purple-500" /> 5-Year Trend
              </td>
              {reports.map((r, i) => {
                const start = r.marketTrends[0]?.demandIndex || 0;
                const end = r.marketTrends[r.marketTrends.length - 1]?.demandIndex || 0;
                const growth = end - start;
                return (
                  <td key={i} className="p-6">
                    <span className={`font-medium ${growth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {growth > 0 ? '+' : ''}{growth}% Demand
                    </span>
                  </td>
                );
              })}
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonView;
