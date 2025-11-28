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
  Save, LayoutGrid
} from 'lucide-react';
import { DataTransparencyBanner, InvestmentDisclaimer, DemoModeBanner } from './LegalDisclaimers';

// Interfaces
interface ResultsDashboardProps {
  report: MarketReport;
  onReset: () => void;
  isDemoMode?: boolean;
  onUpgrade?: () => void;
  onSave: () => void; // NEW PROP
}

// ... (Keep helper functions getCategoryForSource and normalizeScore exactly as is) ...
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

// ... (Keep DetailModal, StatCard, OpportunityCard sub-components exactly as is) ...
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
              {gap.sources && gap.sources.length > 0 && (
                 <div className="mt-4">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Data Sources</h4>
                   <div className="flex flex-wrap gap-1">
                     {gap.sources.map(s => (
                       <span key={s} className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
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

// ============================================
// MAIN COMPONENT
// ============================================
const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  report, 
  onReset,
  isDemoMode = false,
  onUpgrade,
  onSave // NEW
}) => {
  const [modalType, setModalType] = useState<'metrics' | 'competitors' | 'sentiment' | 'score' | null>(null);
  const [activeSources, setActiveSources] = useState<string[]>(report.dataSources || []);

  // --- FILTER LOGIC ---
  const filteredAndSortedGaps = useMemo(() => {
    let gaps = report.gaps;
    const isFiltering = activeSources.length < (report.dataSources?.length || 0);

    if (isFiltering) {
      gaps = gaps.filter(gap => {
        if (!gap.sources || gap.sources.length === 0) return true;
        
        return gap.sources.some(gapSource => {
          const category = getCategoryForSource(gapSource);
          return activeSources.some(active => active.includes(gapSource) || active === category);
        });
      });
    }
    
    return [...gaps].sort((a, b) => {
      const scoreA = normalizeScore(a.opportunityScore);
      const scoreB = normalizeScore(b.opportunityScore);
      return scoreB - scoreA;
    });
  }, [report.gaps, activeSources, report.dataSources]);

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

  // REMOVED GENERATE PDF AND CSV FUNCTIONS

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* DEMO MODE BANNER */}
      {isDemoMode && <DemoModeBanner onUpgrade={onUpgrade} />}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Market Gap Report
            {isDemoMode && <span className="ml-2 text-sm font-normal text-amber-600">(Sample Preview)</span>}
          </h1>
          <p className="text-slate-500 mt-1">Deep analysis for <span className="font-semibold text-indigo-600">{report.industry}</span></p>
        </div>
        <div className="flex gap-3">
          {!isDemoMode && (
            // Replaced CSV/PDF/New Search with "Save to Dashboard"
            <button 
              onClick={onSave} 
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <LayoutGrid size={18} />
              Save to Dashboard
            </button>
          )}
          {isDemoMode && onUpgrade && (
            <button onClick={onUpgrade} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center shadow-sm">
              Upgrade to Deep Dive
            </button>
          )}
        </div>
      </div>

      {/* DATA TRANSPARENCY BANNER */}
      <DataTransparencyBanner />

      {/* ... (Rest of the component remains EXACTLY the same, starting from Stats Grid) ... */}
      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Data Points Analyzed" value={report.totalAnalyzed.toLocaleString()} icon={Activity} color="bg-blue-500" onClick={() => setModalType('metrics')} />
        <StatCard label="Competitors Found" value={report.competitors.length.toString()} icon={Users} color="bg-amber-500" onClick={() => setModalType('competitors')} />
        <StatCard label="Market Sentiment" value={`${normalizeScore(report.overallSentiment)}%`} icon={AlertCircle} color="bg-rose-500" onClick={() => setModalType('sentiment')} />
        <StatCard label="Top Opportunity Score" value={topScore.toString()} icon={TrendingUp} color="bg-emerald-500" onClick={() => setModalType('score')} />
      </div>

      {/* SOURCE FILTER */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase mr-2 flex items-center"><Filter className="w-3 h-3 mr-1" /> Filter by Source:</span>
          {report.dataSources?.map((source, i) => {
            const isActive = activeSources.includes(source);
            return (
              <button key={i} onClick={() => toggleSource(source)} className={`flex items-center text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-400'}`}>
                 {isActive ? <CheckCircle className="w-3 h-3 mr-1.5" /> : <div className="w-3 h-3 rounded-full border border-slate-300 mr-1.5"></div>}
                 {source}
              </button>
            )
          })}
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

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         {/* Sentiment */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center justify-between">
              <span>Sentiment Distribution</span>
              <button onClick={() => setModalType('sentiment')} className="text-indigo-600 hover:text-indigo-700" title="Expand Details"><Maximize2 className="w-3 h-3" /></button>
            </h4>
            <div className="w-full h-56 mb-4 flex justify-center">
              <SentimentDistribution report={report} />
            </div>
            <div className="text-center pb-4 mb-4 border-b border-slate-100 mt-4">
              <p className="text-xs text-slate-500 mb-1">Overall Market Score</p>
              <p className="text-3xl font-bold text-slate-900">{normalizeScore(report.overallSentiment)}<span className="text-sm text-slate-500 ml-1">/100</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h5 className="text-[10px] font-bold text-emerald-600 uppercase mb-2 flex items-center"><ThumbsUp className="w-3 h-3 mr-1"/> Loved</h5>
                <ul className="space-y-1">
                  {report.sentimentFactors?.positive?.slice(0, 3).map((factor, i) => (
                    <li key={i} className="text-[10px] text-slate-600 flex items-start leading-tight"><span className="text-emerald-400 mr-1 flex-shrink-0">•</span><span className="line-clamp-2">{factor}</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-[10px] font-bold text-rose-600 uppercase mb-2 flex items-center"><ThumbsDown className="w-3 h-3 mr-1"/> Hated</h5>
                <ul className="space-y-1">
                  {report.sentimentFactors?.negative?.slice(0, 3).map((factor, i) => (
                    <li key={i} className="text-[10px] text-slate-600 flex items-start leading-tight"><span className="text-rose-400 mr-1 flex-shrink-0">•</span><span className="line-clamp-2">{factor}</span></li>
                  ))}
                </ul>
              </div>
            </div>
            {((report.sentimentFactors?.positive?.length || 0) > 3 || (report.sentimentFactors?.negative?.length || 0) > 3) && (
              <button onClick={() => setModalType('sentiment')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-3 text-center">View All Factors →</button>
            )}
         </div>

         {/* Trend */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">5-Year Demand Trend</h4>
            <div className="flex-1 min-h-[200px]">
              <MarketTrendChart report={report} />
            </div>
         </div>

         {/* Market Leaders */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
             <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold flex items-center text-sm uppercase text-slate-700">
                  <Users className="w-4 h-4 mr-2 text-amber-500"/> Market Leaders
                </h3>
                <button onClick={() => setModalType('competitors')} className="p-1 hover:bg-slate-100 rounded transition-colors" title="View Details"><Maximize2 className="w-4 h-4 text-slate-400" /></button>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
               {report.competitors.map((c, i) => (
                 <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-slate-900">{c.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">#{i + 1}</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Opportunity Matrix</h3>
              <span className="text-xs text-slate-500">Pain vs. Value</span>
            </div>
            <OpportunityScatter report={report} filteredGaps={filteredAndSortedGaps} />
          </div>

           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Willingness to Pay</h3>
              <span className="text-xs text-slate-500">Est. Monthly Price</span>
            </div>
            <WillingnessToPayChart report={report} filteredGaps={filteredAndSortedGaps} />
          </div>
      </div>
      
      {/* EXECUTIVE SUMMARY */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
         <h3 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
           <FileText className="w-5 h-5 mr-2 text-indigo-500"/> Executive Summary
         </h3>
         <div className="prose prose-slate max-w-none">
           <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{report.summary}</p>
         </div>
      </div>

      {/* INVESTMENT DISCLAIMER */}
      <InvestmentDisclaimer />

      {/* ============================================ */}
      {/* MODALS */}
      {/* ============================================ */}

      {modalType === 'metrics' && (
        <DetailModal title="Analyzed Data Sources" onClose={() => setModalType(null)}>
          <div className="space-y-6">
             <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
               <p className="text-indigo-900 font-medium">
                 Processing Summary: <span className="font-bold">{report.totalAnalyzed.toLocaleString()}</span> real data points analyzed.
               </p>
               <p className="text-xs text-indigo-700 mt-2">
                 Note: Analysis based on real-time data retrieved from web search, news, and social platforms.
               </p>
             </div>
             
             {report.analyzedSamples && report.analyzedSamples.length > 0 ? (
               <>
                 <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Direct Source Citations:</h4>
                 <div className="space-y-3">
                    {report.analyzedSamples.map((sample, i) => (
                      <div key={i} className="bg-slate-50 p-3 rounded border border-slate-200 hover:border-indigo-300 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              sample.type === 'Complaint' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {sample.type || 'Evidence'}
                            </span>
                            <span className="text-xs font-bold text-slate-700">{sample.source}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{sample.date}</span>
                        </div>
                        <p className="text-sm text-slate-800 italic leading-relaxed">"{sample.snippet}"</p>
                      </div>
                    ))}
                 </div>
               </>
             ) : (
               <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                 <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                 <p className="text-xs">Aggregated data used for analysis. No specific text snippets returned for this query.</p>
               </div>
             )}
          </div>
        </DetailModal>
      )}

      {modalType === 'competitors' && (
        <DetailModal title="Deep Competitor Analysis" onClose={() => setModalType(null)}>
          <div className="space-y-6">
            {report.competitors.map((c, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-lg text-slate-900">{c.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-emerald-50 p-3 rounded">
                    <span className="text-xs font-bold text-emerald-700 uppercase block mb-1">Core Strength</span>
                    <p className="text-sm text-emerald-900 leading-relaxed">{c.strength}</p>
                  </div>
                   <div className="bg-rose-50 p-3 rounded">
                    <span className="text-xs font-bold text-rose-700 uppercase block mb-1">Critical Weakness</span>
                    <p className="text-sm text-rose-900 leading-relaxed">{c.weakness}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DetailModal>
      )}
      
      {modalType === 'sentiment' && (
         <DetailModal title="Sentiment Drivers" onClose={() => setModalType(null)}>
           <div className="space-y-6">
             <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-100">
               <div className="w-64 h-72 mb-8">
                 <SentimentDistribution report={report} />
               </div>
               <p className="text-center text-slate-600 text-sm mt-4">
                 Overall Market Score: <b className="text-slate-900 text-lg">{normalizeScore(report.overallSentiment)}/100</b>
               </p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <h4 className="text-xs font-bold text-emerald-600 uppercase mb-3 flex items-center"><ThumbsUp className="w-3 h-3 mr-1"/> What Users Love</h4>
                 <ul className="space-y-2">
                   {report.sentimentFactors?.positive?.map((factor, i) => (
                     <li key={i} className="text-sm text-slate-600 flex items-start leading-relaxed"><span className="mr-2 text-emerald-400 flex-shrink-0">•</span><span>{factor}</span></li>
                   ))}
                 </ul>
               </div>
               <div>
                 <h4 className="text-xs font-bold text-rose-600 uppercase mb-3 flex items-center"><ThumbsDown className="w-3 h-3 mr-1"/> What Users Hate</h4>
                 <ul className="space-y-2">
                   {report.sentimentFactors?.negative?.map((factor, i) => (
                     <li key={i} className="text-sm text-slate-600 flex items-start leading-relaxed"><span className="mr-2 text-rose-400 flex-shrink-0">•</span><span>{factor}</span></li>
                   ))}
                 </ul>
               </div>
             </div>
           </div>
         </DetailModal>
      )}
      
      {modalType === 'score' && (
         <DetailModal title="Opportunity Scoring Logic" onClose={() => setModalType(null)}>
           <div className="space-y-4">
             <p className="text-slate-600">The Opportunity Score (0-100) is a composite metric derived from:</p>
             <ul className="list-disc pl-5 space-y-2 text-slate-700 leading-relaxed">
               <li><b>Pain Intensity (40%)</b>: How angry or frustrated are the users?</li>
               <li><b>Competition Density (30%)</b>: Are there existing solutions?</li>
               <li><b>Willingness to Pay (20%)</b>: Is the problem expensive?</li>
               <li><b>Search Volume (10%)</b>: Is the market growing?</li>
             </ul>
             <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
               <p className="text-sm text-indigo-900">
                 <b>Top Gap:</b> {report.gaps?.[0]?.title || 'N/A'}
               </p>
             </div>
           </div>
         </DetailModal>
      )}

    </div>
  );
};

export default ResultsDashboard;
