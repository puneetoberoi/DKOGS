import React, { useEffect, useState } from 'react';
import { getSavedReports, deleteReport, type SavedReportItem } from '../services/reportService';
import { User } from '@supabase/supabase-js';
import { Loader2, Search, Trash2, Calendar, TrendingUp, ArrowRight, FolderOpen, CheckSquare, Square, BarChart2, X, RefreshCw, AlertTriangle } from 'lucide-react';
import type { MarketReport } from '../schema';

interface DashboardViewProps {
  user: User;
  onViewReport: (report: MarketReport) => void;
  onStartNewSearch: () => void;
  onCompare: (reports: MarketReport[]) => void;
  onRefreshReport: (report: MarketReport) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, onViewReport, onStartNewSearch, onCompare, onRefreshReport }) => {
  const [reports, setReports] = useState<SavedReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    const result = await getSavedReports(user.id);
    if (result.success && result.data) {
      setReports(result.data);
    } else {
      setError("Failed to load your reports.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [user.id]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this report?")) return;
    
    const result = await deleteReport(id);
    if (result.success) {
      setReports(reports.filter(r => r.id !== id));
      setSelectedIds(prev => prev.filter(sid => sid !== id));
    } else {
      alert("Failed to delete report.");
    }
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(sid => sid !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert("You can compare up to 3 reports at a time.");
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleCompareClick = () => {
    const selectedReports = reports
      .filter(r => selectedIds.includes(r.id))
      .map(r => r.report_data);
    onCompare(selectedReports);
  };

  const getDecayStatus = (dateString: string) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    
    const isStale = diffDays > 30;
    
    // LINEAR 30 DAY DECAY
    // Day 0 = 0% gray. Day 30 = 100% gray.
    const grayPercent = Math.min(100, (diffDays / 30) * 100);
    
    // VISIBILITY BOOST: Also drop opacity so it "fades away"
    // Day 0 = 1.0 opacity. Day 30 = 0.6 opacity.
    const opacity = Math.max(0.6, 1 - (diffDays / 75));

    console.log(`Report Age: ${diffDays} days. Decay: ${grayPercent}%. Opacity: ${opacity}`);
    return { diffDays, isStale, grayPercent, opacity };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
        <p>Loading your intelligence hub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-rose-500">
        <p>{error}</p>
        <button onClick={fetchReports} className="mt-4 text-indigo-600 underline hover:text-indigo-800">Retry</button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center text-slate-500 animate-fade-in">
        <div className="bg-slate-100 p-6 rounded-full mb-6">
          <FolderOpen size={48} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Your Dashboard is Empty</h2>
        <p className="max-w-md mb-8">
          You haven't saved any market reports yet. Start a scan to identify your next big opportunity.
        </p>
        <button 
          onClick={onStartNewSearch}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <Search size={18} />
          Start New Scan
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in relative pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Intelligence Hub</h1>
          <p className="text-slate-500 text-sm">You have {reports.length} saved reports</p>
        </div>
        <button 
          onClick={onStartNewSearch}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Search size={16} />
          New Scan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const isSelected = selectedIds.includes(report.id);
          const { diffDays, isStale, grayPercent, opacity } = getDecayStatus(report.created_at);

          return (
            <div 
              key={report.id}
              className={`group relative bg-white rounded-xl border p-5 cursor-pointer transition-all duration-500 overflow-hidden ${
                isSelected ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
              } ${isStale ? 'bg-slate-50' : 'bg-white'}`}
              onClick={() => onViewReport(report.report_data)}
            >
              {/* CONTENT WRAPPER WITH DECAY */}
              <div 
                style={{ 
                  filter: `grayscale(${grayPercent}%)`, 
                  opacity: opacity 
                }} 
                className="transition-all duration-500"
              >
                
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  report.overall_score >= 80 ? 'bg-emerald-500' : 
                  report.overall_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}></div>

                <div className="flex justify-between items-start mb-4 pl-2">
                  <div className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                    {report.industry || 'Market Report'}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => toggleSelection(report.id, e)}
                      className={`p-1 transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-500'}`}
                      title="Select to Compare"
                    >
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                    <button 
                      onClick={(e) => handleDelete(report.id, e)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      title="Delete Report"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors pl-2">
                  {report.keyword}
                </h3>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 pl-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} />
                    <span className="font-semibold text-slate-700">{report.overall_score}/100</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pl-2">
                  <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                    View Report <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </div>

              {/* ELEMENTS OUTSIDE DECAY (Always Vibrant) */}
              
              {isStale && (
                <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1 shadow-sm animate-pulse">
                  <AlertTriangle size={10} /> STALE ({diffDays}d)
                </div>
              )}

              {/* Show Refresh button if older than 30 days (Use 0 to test) */}
              {diffDays > 30 && (
                <div className="absolute bottom-4 right-4 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefreshReport(report.report_data);
                    }}
                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-lg"
                  >
                    <RefreshCw size={12} /> Refresh Data with 50% off!
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <span className="font-medium text-sm">{selectedIds.length} Selected</span>
          <div className="h-4 w-px bg-slate-700"></div>
          <button 
            onClick={handleCompareClick}
            disabled={selectedIds.length < 2}
            className={`flex items-center gap-2 font-bold text-sm transition-colors ${
              selectedIds.length < 2 ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-300'
            }`}
          >
            <BarChart2 size={18} />
            Compare
          </button>
          <button 
            onClick={() => setSelectedIds([])}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
