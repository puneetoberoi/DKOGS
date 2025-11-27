// src/App.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisStatus } from './schema';
import type { SearchParams, MarketReport } from './schema';
import { analyzeMarket } from './services/geminiService';
import { generateDemoReport } from './services/demoService';
import LoadingScreen from './components/LoadingScreen';
import ResultsDashboard from './components/ResultsDashboard';
import TrendingView from './components/TrendingView';
import { FirstTimeUserModal } from './components/LegalDisclaimers';
import { PaymentModal } from './components/PaymentModal';
import { Search, Globe, Clock, MapPin, Sliders, ArrowRight, Sparkles, LayoutDashboard, Flame, Layers, Lock, ChevronDown } from 'lucide-react';
import {
  getDefaultLocation,
  detectUserLocation,
} from './utils/currencyDetector';
import type { LocationData } from './utils/currencyDetector';

// REBRANDED SOURCES
const AVAILABLE_SOURCES = [
  'Online Communities', 
  'E-commerce Reviews', 
  'Social Media',       
  'Local Reviews',      
  'News & Media',       
  'Industry Forums',    
  'Visual Trends',      
  'Tech Blogs'          
];

// LIMITED REGIONS (US & Canada only)
const AVAILABLE_REGIONS = [
  { value: 'USA', label: 'United States' },
  { value: 'Canada', label: 'Canada' }
];

// LOOKBACK OPTIONS
const LOOKBACK_OPTIONS = [
  { value: 'Last 30 Days', label: 'Last 30 Days' },
  { value: 'Last 6 Months', label: 'Last 6 Months' },
  { value: 'Last Year', label: 'Last Year' },
  { value: 'All Time', label: 'All Time' }
];

// DEPTH OPTIONS
const DEPTH_OPTIONS = [
  { value: 'Quick Scan', label: 'Quick Scan (Free)' },
  { value: 'Deep Dive', label: 'Deep Dive (Full)' }
];

// GAP COUNT OPTIONS
const GAP_OPTIONS = [
  { value: 3, label: '3 Gaps' },
  { value: 5, label: '5 Gaps' },
  { value: 10, label: '10 Gaps' },
  { value: 15, label: '15 Gaps' },
  { value: 20, label: '20 Gaps' }
];

// ============================================
// CUSTOM SELECT COMPONENT (Clean Dropdowns)
// ============================================
interface SelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  disabled?: boolean;
  className?: string;
}

const CustomSelect: React.FC<SelectProps> = ({ value, onChange, options, disabled = false, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full py-2 pl-3 pr-8 
          bg-slate-50 border border-slate-200 rounded-lg 
          text-xs sm:text-sm text-slate-700 
          outline-none appearance-none
          transition-all duration-200
          ${disabled 
            ? 'cursor-not-allowed opacity-60' 
            : 'cursor-pointer hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
          }
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDown className={`w-4 h-4 ${disabled ? 'text-slate-300' : 'text-slate-400'}`} />
      </div>
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [report, setReport] = useState<MarketReport | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'trending'>('search');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Payment & Location state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [locationData, setLocationData] = useState<LocationData>(getDefaultLocation());
  
  // Check for first-time user
  useEffect(() => {
    const hasSeenLegal = localStorage.getItem('gapspotter_legal_accepted');
    if (!hasSeenLegal) {
      setShowLegalModal(true);
    }
  }, []);

  const handleLegalAccept = async (locationConsent: boolean) => {
    localStorage.setItem('gapspotter_legal_accepted', 'true');
    setShowLegalModal(false);
    
    if (locationConsent) {
      localStorage.setItem('gapspotter_location_consent', 'true');
      try {
        const location = await detectUserLocation();
        setLocationData(location);
      } catch (error) {
        console.error('Location detection failed:', error);
        setLocationData(getDefaultLocation());
      }
    } else {
      localStorage.setItem('gapspotter_location_consent', 'false');
      setLocationData(getDefaultLocation());
    }
  };

  // Payment handlers
  const handlePaymentSuccess = (gaps: number) => {
    setShowPaymentModal(false);
    setGapCount(gaps);
    runAnalysisAfterPayment(gaps);
  };

  const runAnalysisAfterPayment = async (paidGapCount: number) => {
    console.log(`🎯 Starting PAID analysis for: "${form.keyword}" with ${paidGapCount} gaps`);
    console.log(`📊 Mode: Deep Dive (Real) - PAID`);

    setStatus(AnalysisStatus.SCRAPING);
    setIsDemoMode(false);

    try {
      const result = await analyzeMarket({ ...form, gapCount: paidGapCount }, (newStatus: string) => {
  	setStatus(newStatus as AnalysisStatus);
      });
      console.log('✅ Paid analysis completed');
      
      setReport(result);
      setStatus(AnalysisStatus.COMPLETE);
      
    } catch (error) {
      console.error("❌ Analysis failed:", error);
      setStatus(AnalysisStatus.ERROR);
      setTimeout(() => setStatus(AnalysisStatus.IDLE), 3000);
    }
  };
  
  // Form state - Quick Scan is default
  const [form, setForm] = useState<SearchParams>({
    keyword: '',
    sources: ['Online Communities', 'E-commerce Reviews', 'Social Media'],
    lookback: 'Last 6 Months',
    geography: 'USA',
    depth: 'Quick Scan',
    useGroq: true,
    useBytez: true
  });

  // Gap Count state
  const [gapCount, setGapCount] = useState(5);
  
  // Derived state
  const isQuickScan = form.depth === 'Quick Scan';
  const hasKeyword = form.keyword.trim().length > 0;

  const handleInputChange = (field: keyof SearchParams, value: string | boolean | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleSource = (source: string) => {
    setForm(prev => {
      const current = prev.sources;
      if (current.includes(source)) {
        return { ...prev, sources: current.filter(s => s !== source) };
      } else {
        return { ...prev, sources: [...current, source] };
      }
    });
  };

  const handleTrendingSelect = (topic: string) => {
    setForm(prev => ({ ...prev, keyword: topic }));
    setActiveTab('search');
  };

  // ============================================
  // MAIN ANALYSIS FUNCTION
  // ============================================
  const runAnalysis = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!hasKeyword) {
      console.log('❌ No keyword entered');
      return;
    }

    console.log(`🎯 Starting analysis for: "${form.keyword}"`);
    console.log(`📊 Mode: ${isQuickScan ? 'Quick Scan (Demo)' : 'Deep Dive (Real)'}`);

    // If Deep Dive, show payment modal first
    if (!isQuickScan) {
      setShowPaymentModal(true);
      return;
    }

    // Quick Scan continues as before (no payment required)
    setStatus(AnalysisStatus.SCRAPING);

    try {
      let result: MarketReport;
      
      setIsDemoMode(true);
      console.log('🎭 Demo Mode: Generating sample data (NO API calls)');
      
      await new Promise(r => setTimeout(r, 1000));
      setStatus(AnalysisStatus.CLUSTERING);
      await new Promise(r => setTimeout(r, 800));
      setStatus(AnalysisStatus.SCORING);
      await new Promise(r => setTimeout(r, 600));
      
      result = generateDemoReport(form.keyword, form.geography);
      console.log('✅ Demo report generated successfully');
      
      setReport(result);
      setStatus(AnalysisStatus.COMPLETE);
      
    } catch (error) {
      console.error("❌ Analysis failed:", error);
      setStatus(AnalysisStatus.ERROR);
      setTimeout(() => setStatus(AnalysisStatus.IDLE), 3000);
    }
  }, [form, isQuickScan, hasKeyword]); 

  const handleReset = () => {
    setReport(null);
    setStatus(AnalysisStatus.IDLE);
    setIsDemoMode(false);
    setForm(prev => ({ ...prev, keyword: '' }));
  };

  const handleUpgradeToDeepDive = () => {
    setForm(prev => ({ ...prev, depth: 'Deep Dive' }));
    handleReset();
  };

  // ============================================
  // SEARCH CONTENT COMPONENT
  // ============================================
  const SearchContent = () => {
    if (status === AnalysisStatus.COMPLETE && report) {
      return (
        <ResultsDashboard 
          report={report} 
          onReset={handleReset} 
          isDemoMode={isDemoMode}
          onUpgrade={handleUpgradeToDeepDive}
        />
      );
    }

    if (status !== AnalysisStatus.IDLE && status !== AnalysisStatus.ERROR) {
      return <LoadingScreen status={status} useGroq={form.useGroq} useBytez={form.useBytez} />;
    }

    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 w-full">
        <div className="max-w-xl w-full space-y-5 sm:space-y-8">
          
          {/* Hero Copy */}
          <div className="text-center space-y-2 sm:space-y-4 px-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Find Your Next <br/>
              <span className="text-indigo-600 relative inline-block">
                Big Idea
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 absolute -top-2 -right-4 sm:-top-4 sm:-right-6 animate-bounce" />
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-600">
              Don't guess what people want. Let AI scan thousands of real discussions to find the gaps.
            </p>
          </div>

          {/* Input Form */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
            <form onSubmit={runAnalysis} className="space-y-4 sm:space-y-6">
              
              {/* Keyword Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center">
                  <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-indigo-500"/> 
                  Industry / Keyword / Product / Service
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Ergonomic Chairs, Camping Gear, CRM..." 
                  className="w-full p-3 sm:p-4 rounded-lg border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm sm:text-lg bg-slate-900 text-white placeholder-slate-400"
                  value={form.keyword}
                  onChange={(e) => handleInputChange('keyword', e.target.value)}
                  autoFocus
                />
              </div>

              {/* Sources */}
              <div className="space-y-1.5 sm:space-y-2">
                 <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase flex items-center">
                   <Globe className="w-3 h-3 mr-1"/> Data Sources
                 </label>
                 <div className="flex flex-wrap gap-1 sm:gap-2">
                    {AVAILABLE_SOURCES.map(src => {
                      const isActive = form.sources.includes(src);
                      return (
                        <button
                          key={src}
                          type="button"
                          onClick={() => toggleSource(src)}
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-full border transition-all ${
                            isActive 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                        >
                          {src}
                        </button>
                      );
                    })}
                 </div>
              </div>
              
              {/* Settings Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                
                {/* Lookback */}
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase flex items-center">
                    <Clock className="w-3 h-3 mr-1"/> Lookback
                  </label>
                  <CustomSelect
                    value={form.lookback}
                    onChange={(val) => handleInputChange('lookback', val)}
                    options={LOOKBACK_OPTIONS}
                  />
                </div>

                {/* Region */}
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase flex items-center">
                    <MapPin className="w-3 h-3 mr-1"/> Region
                  </label>
                  <CustomSelect
                    value={form.geography}
                    onChange={(val) => handleInputChange('geography', val)}
                    options={AVAILABLE_REGIONS}
                  />
                </div>

                {/* Depth */}
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase flex items-center">
                    <Sliders className="w-3 h-3 mr-1"/> Analysis Depth
                  </label>
                  <CustomSelect
                    value={form.depth}
                    onChange={(val) => handleInputChange('depth', val)}
                    options={DEPTH_OPTIONS}
                  />
                </div>

                {/* Opportunities - Locked for Quick Scan */}
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase flex items-center">
                    <Layers className="w-3 h-3 mr-1"/> Opportunities
                    {isQuickScan && <Lock className="w-3 h-3 ml-1 text-amber-500" />}
                  </label>
                  
                  <div className="relative">
                    <CustomSelect
                      value={isQuickScan ? 3 : gapCount}
                      onChange={(val) => setGapCount(Number(val))}
                      options={GAP_OPTIONS}
                      disabled={isQuickScan}
                    />
                    
                    {isQuickScan && (
                      <div className="absolute inset-0 bg-slate-100/70 backdrop-blur-[1px] rounded-lg flex items-center justify-center cursor-not-allowed">
                        <span className="text-[9px] sm:text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Upgrade
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Scan Info Banner */}
              {isQuickScan && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-amber-800 leading-relaxed">
                    <strong>Quick Scan Preview:</strong> See a sample report with demo data. 
                    Select <strong>Deep Dive</strong> for real AI-powered market analysis.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={!hasKeyword}
                className={`
                  w-full py-3 sm:py-4 rounded-lg 
                  text-white font-bold text-sm sm:text-lg 
                  flex items-center justify-center 
                  transition-all duration-200 
                  transform active:scale-[0.98]
                  ${!hasKeyword 
                    ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
                    : isQuickScan 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-200/50 hover:shadow-amber-300/50' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/50'
                  }
                `}
              >
                {!hasKeyword 
                  ? 'Enter a keyword to start' 
                  : isQuickScan 
                    ? 'Preview Sample Report' 
                    : 'Scan Market'
                }
                {hasKeyword && <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Legal Modal (Merged with Location Consent) */}
      {showLegalModal && <FirstTimeUserModal onAccept={handleLegalAccept} />}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        locationData={locationData}
        searchParams={{
          keyword: form.keyword,
          sources: form.sources,
          region: form.geography,
          lookbackDays: form.lookback === 'Last 30 Days' ? 30 : form.lookback === 'Last 6 Months' ? 180 : form.lookback === 'Last Year' ? 365 : 730,
        }}
      />

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 py-2 sm:py-3 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-1.5 sm:gap-2 text-indigo-600 font-bold text-base sm:text-xl cursor-pointer"
            onClick={() => {
              handleReset();
              setActiveTab('search');
            }}
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>GapSpotter</span>
          </div>
          
          <nav className="flex bg-slate-100 p-0.5 sm:p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('search')}
              className={`flex items-center px-2 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === 'search' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Search
            </button>
            <button 
              onClick={() => setActiveTab('trending')}
              className={`flex items-center px-2 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === 'trending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Flame className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Trending
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'trending' ? (
          <TrendingView onSelectTopic={handleTrendingSelect} />
        ) : (
          <SearchContent />
        )}
      </main>
    </div>
  );
};

export default App;