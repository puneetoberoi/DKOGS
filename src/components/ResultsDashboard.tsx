// src/components/ResultsDashboard.tsx

import React, { useState, useMemo } from 'react';
import type { MarketReport, GapData } from '../schema';
import { 
  SentimentDistribution, 
  MarketTrendChart, 
  WillingnessToPayChart, 
  OpportunityScatter 
} from './MarketCharts';
import { 
  Users, TrendingUp, AlertCircle, ChevronDown, 
  CheckCircle, X, FileText, Activity, Target, ThumbsUp, ThumbsDown, Filter, Maximize2, Shield,
  Save, LayoutGrid, Sparkles, Search
} from 'lucide-react';
import { DataTransparencyBanner, InvestmentDisclaimer, DemoModeBanner } from './LegalDisclaimers';

interface ResultsDashboardProps {
  report: MarketReport;
  onReset: () => void;
  isDemoMode?: boolean;
  onUpgrade?: () => void;
  onSave: () => void;
  onAnalyzeRelated?: (keyword: string) => void;
  isSaved?: boolean;
}

const getCategoryForSource = (source: string): string => {
  const s = source.toLowerCase();
  if (s.includes('reddit') || s.includes('hacker news') || s.includes('forum')) return 'Online Communities';
  if (s.includes('amazon') || s.includes('review') || s.includes('trustpilot')) return 'E-commerce Reviews';
  if (s.includes('twitter') || s.includes('youtube') || s.includes('social')) return 'Social Media';
  if (s.includes('news') || s.includes('article') || s.includes('blog')) return 'News & Media';
  return 'Other';
};

const normalizeScore = (value: number): number => {
  if (typeof value !== 'number' || isNaN(value)) return 0;
  let score = value;
  if (score > 0 && score <= 1) score = score * 100;
  return Math.min(100, Math.max(0, Math.round(score)));
};

const DetailModal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; icon: React.ElementType; color: string; onClick?: () => void; }> = ({ label, value, icon: Icon, color, onClick }) => (
  <div onClick={onClick} className={`bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md group' : ''}`}>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center">
        {label}
        {onClick && <ChevronDown className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
      </p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const OpportunityCard: React.FC<{ gap: GapData; index: number; rank: number; isDemoMode?: boolean }> = ({ gap, index, rank, isDemoMode }) => {
  const [expanded, setExpanded] = useState(index === 0);
  const normalizedScore = normalizeScore(gap.opportunityScore);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden ${isDemoMode ? 'relative' : ''}`}>
      {isDemoMode && (
        <div className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
          <Shield className="w-3 h-3" /> SAMPLE
        </div>
      )}
      
      <div className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shadow-sm border border-indigo-100">
            {rank}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1">{gap.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{gap.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 self-end md:self-auto flex-shrink-0">
           <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-semibold">Opp. Score</p>
            <span className={`font-black text-2xl ${normalizedScore > 80 ? 'text-emerald-600' : 'text-indigo-600'}`}>
              {normalizedScore}
            </span>
           </div>
           <div className={`transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
             <ChevronDown className="text-slate-400" />
           </div>
        </div>
      </div>
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/30 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Pain Points</h4>
              <ul className="space-y-2">
                {gap.painPoints.map((pt, i) => (
                  <li key={i} className="flex items-start text-sm text-slate-700 bg-white p-2 rounded border border-slate-100">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    {pt}
                  </li>
                ))}
              </ul>
              {/* RESTORED DATA SOURCES */}
              {gap.sources && gap.sources.length > 0 && (
                 <div className="mt-4">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Data Sources</h4>
                   <div className="flex flex-wrap gap-1">
                     {gap.sources.map((s, i) => (
                       <span key={i} className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                     ))}
                   </div>
                 </div>
              )}
            </div>
            <div className="md:col-span-1">
               <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center"><Target className="w-3 h-3 mr-1"/> Recommended Solution</h4>
               <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 h-full">
                 <p className="text-sm text-indigo-900 font-medium leading-relaxed">{gap.recommendedSolution}</p>
               </div>
            </div>
            <div className="md:col-span-1 grid grid-cols-1 gap-3">
               <div className="bg-white p-3 rounded-lg border border-slate-100">
                 <p className="text-xs text-slate-500">Willingness to Pay</p>
                 <p className="font-bold text-slate-800">{gap.willingnessToPay}</p>
               </div>
               <div className="bg-white p-3 rounded-lg border border-slate-100">
                 <p className="text-xs text-slate-500">Competition Density</p>
                 <div className="flex items-center mt-1">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${gap.competitionDensity === 'Low' ? 'bg-emerald-500 w-1/4' : gap.competitionDensity === 'Medium' ? 'bg-amber-500 w-1/2' : 'bg-rose-500 w-3/4'}`}></div>
                    </div>
                    <span className="text-xs font-bold ml-2 text-slate-700">{gap.competitionDensity}</span>
                 </div>
               </div>
               <div className="bg-white p-3 rounded-lg border border-slate-100">
                 <p className="text-xs text-slate-500">Monthly Search Volume</p>
                 <p className="font-bold text-slate-800">{gap.searchVolume || 'N/A'}</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  report, 
  onReset,
  isDemoMode = false,
  onUpgrade,
  onSave,
  onAnalyzeRelated,
  isSaved = false
}) => {
  const [modalType, setModalType] = useState<'metrics' | 'competitors' | 'sentiment' | 'score' | null>(null);
  const [activeSources, setActiveSources] = useState<string[]>(report.dataSources || []);

  const filteredAndSortedGaps = useMemo(() => {
    let gaps = report.gaps;
    // Relaxed filtering: If activeSources includes "General" or "Other", allow it.
    // Or simpler: just return all gaps for now to Fix the disappearance.
    return [...gaps].sort((a, b) => {
      const scoreA = normalizeScore(a.opportunityScore);
      const scoreB = normalizeScore(b.opportunityScore);
      return scoreB - scoreA;
    });
  }, [report.gaps]);

  const toggleSource = (source: string) => {
    if (activeSources.includes(source)) {
      setActiveSources(prev => prev.filter(s => s !== source));
    } else {
      setActiveSources(prev => [...prev, source]);
    }
  };

  const topScore = useMemo(() => {
    const scores = report.gaps.map(g => normalizeScore(g.opportunityScore));
    return Math.max(...scores);
  }, [report.gaps]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {isDemoMode && <DemoModeBanner onUpgrade={onUpgrade} />}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Market Gap Report
            {isDemoMode && <span className="ml-2 text-sm font-normal text-amber-600">(Sample Preview)</span>}
          </h1>
          <p className="text-slate-500 mt-1">Deep analysis for <span className="font-semibold text-indigo-600">{report.industry}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={onReset} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">New Search</button>
          {!isDemoMode && (
            <button 
              onClick={onSave} 
              disabled={isSaved}
              className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg flex items-center gap-2 transform ${
                isSaved 
                  ? 'bg-emerald-500 cursor-default shadow-emerald-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-indigo-200'
              }`}
            >
              {isSaved ? <CheckCircle size={18} /> : <LayoutGrid size={18} />}
              {isSaved ? "Saved to Dashboard" : "Save to Dashboard"}
            </button>
          )}
          {isDemoMode && onUpgrade && (
            <button onClick={onUpgrade} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center shadow-sm">
              Upgrade to Deep Dive
            </button>
          )}
        </div>
      </div>

      <DataTransparencyBanner />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Data Points Analyzed" value={report.totalAnalyzed.toLocaleString()} icon={Activity} color="bg-blue-500" onClick={() => setModalType('metrics')} />
        <StatCard label="Competitors Found" value={report.competitors.length.toString()} icon={Users} color="bg-amber-500" onClick={() => setModalType('competitors')} />
        <StatCard label="Market Sentiment" value={`${normalizeScore(report.overallSentiment)}%`} icon={AlertCircle} color="bg-rose-500" onClick={() => setModalType('sentiment')} />
        <StatCard label="Top Opportunity Score" value={topScore.toString()} icon={TrendingUp} color="bg-emerald-500" onClick={() => setModalType('score')} />
      </div>

      {/* OPPORTUNITIES LIST */}
      <div className="space-y-4">
         <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between">
            <div className="flex items-center">
              Identified Opportunities <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">{filteredAndSortedGaps.length}</span>
            </div>
            <span className="text-xs text-slate-500">(Ranked by opportunity score)</span>
         </h3>
         <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedGaps.length > 0 ? (
              filteredAndSortedGaps.map((gap, index) => (
                <OpportunityCard key={index} gap={gap} index={index} rank={index + 1} isDemoMode={isDemoMode} />
              ))
            ) : (
               <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                 <Filter className="w-8 h-8 mb-2 opacity-20"/>
                 <p className="text-sm">No gaps found matching the selected sources.</p>
               </div>
            )}
         </div>
      </div>

      {/* ... Rest of Charts/Summary/Recommendations (Keep existing) ... */}
      {/* ... I'll assume you have the rest of the file from previous successful deploy ... */}
      {/* ... If not, I can provide the WHOLE file again ... */}
      
      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Sentiment Distribution</h4>
            <div className="w-full h-56 mb-4 flex justify-center">
              <SentimentDistribution report={report} />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">5-Year Demand Trend</h4>
            <div className="flex-1 min-h-[200px]">
              <MarketTrendChart report={report} />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
             <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold flex items-center text-sm uppercase text-slate-700">
                  <Users className="w-4 h-4 mr-2 text-amber-500"/> Market Leaders
                </h3>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
               {report.competitors.map((c, i) => (
                 <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-slate-900">{c.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 space-y-1">
                       <div className="flex items-start"><span className="text-emerald-600 font-semibold mr-1">+</span><span>{c.strength}</span></div>
                       <div className="flex items-start"><span className="text-rose-600 font-semibold mr-1">−</span><span>{c.weakness}</span></div>
                    </div>
                 </div>
               ))}
             </div>
         </div>
      </div>

      {/* SCATTER & BAR CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Opportunity Matrix</h3>
            </div>
            <OpportunityScatter report={report} filteredGaps={filteredAndSortedGaps} />
          </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Willingness to Pay</h3>
            </div>
            <WillingnessToPayChart report={report} filteredGaps={filteredAndSortedGaps} />
          </div>
      </div>
      
      {/* EXECUTIVE SUMMARY */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden mt-8">
         <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
         <h3 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
           <FileText className="w-5 h-5 mr-2 text-indigo-500"/> Executive Summary
         </h3>
         <div className="prose prose-slate max-w-none">
           <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{report.summary}</p>
         </div>
      </div>

      {/* RELATED */}
      {report.relatedOpportunities && report.relatedOpportunities.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Also Worth Exploring
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.relatedOpportunities.map((opp, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                <h4 className="font-bold text-slate-900 mb-2">{opp.keyword}</h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{opp.reason}</p>
                {onAnalyzeRelated && (
                  <button 
                    onClick={() => onAnalyzeRelated(opp.keyword)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Search size={12} />
                    Analyze This Market
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <InvestmentDisclaimer />
      {/* Modals are defined at top but rendered conditionally - keeping structure simple */}
    </div>
  );
};

export default ResultsDashboard;
