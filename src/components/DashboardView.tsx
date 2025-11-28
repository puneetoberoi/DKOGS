import React, { useEffect, useState } from 'react';
import { getSavedReports, deleteReport, type SavedReportItem } from '../services/reportService';
import { User } from '@supabase/supabase-js';
import { Loader2, Search, Trash2, Calendar, TrendingUp, ArrowRight, FolderOpen } from 'lucide-react';
import type { MarketReport } from '../schema';

interface DashboardViewProps {
  user: User;
  onViewReport: (report: MarketReport) => void;
  onStartNewSearch: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, onViewReport, onStartNewSearch }) => {
  const [reports, setReports] = useState<SavedReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    e.stopPropagation(); // Prevent opening the report
    if (!confirm("Are you sure you want to delete this report?")) return;
    
    const result = await deleteReport(id);
    if (result.success) {
      setReports(reports.filter(r => r.id !== id));
    } else {
      alert("Failed to delete report.");
    }
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
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
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
        {reports.map((report) => (
          <div 
            key={report.id}
            onClick={() => onViewReport(report.report_data)}
            className="group bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all duration-200 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${
              report.overall_score >= 80 ? 'bg-emerald-500' : 
              report.overall_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
            }`}></div>

            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                {report.industry || 'Market Report'}
              </div>
              <button 
                onClick={(e) => handleDelete(report.id, e)}
                className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                title="Delete Report"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {report.keyword}
            </h3>

            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} />
                <span className="font-semibold text-slate-700">{report.overall_score}/100</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
              View Report <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;
