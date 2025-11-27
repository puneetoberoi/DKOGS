import React, { useState, useMemo } from 'react';
import { TrendingUp, Search, Globe, Filter, Download, ChevronDown, FileText, FileSpreadsheet, Sliders, MapPin, Tag, Calendar } from 'lucide-react';
import { jsPDF } from "jspdf";

interface TrendingViewProps {
  onSelectTopic: (topic: string) => void;
}

// Extended mock data structure to support filtering
interface TrendItem {
  id: string;
  topic: string;
  volume: number;
  volumeDisplay: string;
  growth: number;
  region: string;
  category: string;
  source: string; // Primary source where this is trending
  score: number; // Opportunity Score equivalent
}

const MOCK_COMMUNITY_DATA: TrendItem[] = [
  { id: 'c1', topic: "Micro-SaaS for Plumbers", volume: 1200, volumeDisplay: "1.2k", growth: 12, region: "USA", category: "SaaS", source: "Reddit", score: 85 },
  { id: 'c2', topic: "AI Legal Assistant", volume: 980, volumeDisplay: "980", growth: 8, region: "Europe", category: "AI Tools", source: "LinkedIn", score: 78 },
  { id: 'c3', topic: "Sustainable Coffee Pods", volume: 850, volumeDisplay: "850", growth: 15, region: "Global", category: "E-commerce", source: "Amazon", score: 65 },
  { id: 'c4', topic: "Pet Dating Apps", volume: 720, volumeDisplay: "720", growth: 5, region: "USA", category: "Consumer App", source: "Twitter", score: 45 },
  { id: 'c5', topic: "Remote Team Bonding", volume: 650, volumeDisplay: "650", growth: 22, region: "Global", category: "SaaS", source: "LinkedIn", score: 92 },
  { id: 'c6', topic: "Hyper-local Delivery API", volume: 500, volumeDisplay: "500", growth: 30, region: "India", category: "Logistics", source: "Google", score: 88 },
  { id: 'c7', topic: "Ayurvedic Skincare Subscription", volume: 450, volumeDisplay: "450", growth: 18, region: "India", category: "E-commerce", source: "Instagram", score: 72 },
];

const MOCK_WEB_DATA: TrendItem[] = [
  { id: 'w1', topic: "Generative UI Design", volume: 50000, volumeDisplay: "50k", growth: 450, region: "Global", category: "AI Tools", source: "Twitter", score: 95 },
  { id: 'w2', topic: "Vertical Farming Kits", volume: 25000, volumeDisplay: "25k", growth: 320, region: "USA", category: "AgriTech", source: "Google", score: 82 },
  { id: 'w3', topic: "Personalized Nutrition", volume: 18000, volumeDisplay: "18k", growth: 210, region: "Europe", category: "Health", source: "Pinterest", score: 76 },
  { id: 'w4', topic: "Digital Detox Tourism", volume: 12000, volumeDisplay: "12k", growth: 180, region: "Global", category: "Travel", source: "TikTok", score: 68 },
  { id: 'w5', topic: "Biodegradable Packaging", volume: 15000, volumeDisplay: "15k", growth: 150, region: "Europe", category: "Sustainability", source: "Google", score: 74 },
  { id: 'w6', topic: "Instant Loan Apps", volume: 80000, volumeDisplay: "80k", growth: 80, region: "India", category: "Fintech", source: "Google", score: 60 },
  { id: 'w7', topic: "Cricket Analytics Tools", volume: 40000, volumeDisplay: "40k", growth: 120, region: "India", category: "Sports", source: "Twitter", score: 55 },
];

const TrendingView: React.FC<TrendingViewProps> = ({ onSelectTopic }) => {
  // Filter States
  const [timeRange, setTimeRange] = useState('This Week');
  const [sortBy, setSortBy] = useState<'volume' | 'growth' | 'score'>('growth');
  const [minScore, setMinScore] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Derived Data
  const filterAndSort = (data: TrendItem[]) => {
    return data
      .filter(item => {
        if (minScore > 0 && item.score < minScore) return false;
        if (selectedRegion !== 'All Regions' && item.region !== selectedRegion && item.region !== 'Global') return false;
        if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'volume') return b.volume - a.volume;
        if (sortBy === 'growth') return b.growth - a.growth;
        if (sortBy === 'score') return b.score - a.score;
        return 0;
      });
  };

  const filteredCommunity = useMemo(() => filterAndSort(MOCK_COMMUNITY_DATA), [minScore, selectedRegion, selectedCategory, sortBy]);
  const filteredWeb = useMemo(() => filterAndSort(MOCK_WEB_DATA), [minScore, selectedRegion, selectedCategory, sortBy]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.setFont("helvetica", "bold");
    doc.text("GapSpotter: Market Pulse", margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
    doc.text(`Filters: ${selectedRegion}, ${selectedCategory}`, margin, yPos + 5);
    yPos += 20;

    // Helper function for sections
    const addSection = (title: string, items: TrendItem[]) => {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, yPos - 6, pageWidth - (margin * 2), 10, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin + 4, yPos);
      yPos += 15;

      items.forEach((item, i) => {
         if (yPos > 270) { doc.addPage(); yPos = 20; }
         
         doc.setFontSize(11);
         doc.setTextColor(15, 23, 42);
         doc.setFont("helvetica", "bold");
         doc.text(`${i + 1}. ${item.topic}`, margin, yPos);
         
         doc.setFontSize(10);
         doc.setTextColor(71, 85, 105);
         doc.setFont("helvetica", "normal");
         const metaText = `${item.category}  |  ${item.region}  |  ${item.source}`;
         doc.text(metaText, margin, yPos + 5);

         doc.setFont("courier", "bold");
         doc.setTextColor(5, 150, 105); // Emerald
         doc.text(`+${item.growth}% Growth`, pageWidth - margin - 40, yPos);
         
         yPos += 15;
         doc.setDrawColor(226, 232, 240);
         doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
      });
      yPos += 10;
    };

    addSection("Community Searches (Internal)", filteredCommunity);
    addSection("Global Web Trends (External)", filteredWeb);

    doc.save("gapspotter_market_pulse.pdf");
    setShowExportMenu(false);
  };

  const generateCSV = () => {
    const headers = ["Type", "Topic", "Category", "Region", "Source", "Volume", "Growth %", "Score"];
    
    const communityRows = filteredCommunity.map(i => 
      ["Community", `"${i.topic}"`, i.category, i.region, i.source, i.volume, i.growth, i.score]
    );
    
    const webRows = filteredWeb.map(i => 
      ["Web Trend", `"${i.topic}"`, i.category, i.region, i.source, i.volume, i.growth, i.score]
    );

    const allRows = [...communityRows, ...webRows];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...allRows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gapspotter_trends_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in w-full flex flex-col gap-6">
      
      {/* Header & Top Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Market Pulse</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time insight into high-growth opportunities.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Time Range */}
          <div className="relative group">
             <div className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:border-indigo-300 text-sm font-medium text-slate-700">
               <Calendar className="w-4 h-4 text-slate-400" />
               <span>{timeRange}</span>
               <ChevronDown className="w-3 h-3 text-slate-400" />
             </div>
             <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 rounded-lg shadow-xl hidden group-hover:block z-20">
               {['Today', 'This Week', 'This Month', 'All Time'].map(opt => (
                 <div key={opt} onClick={() => setTimeRange(opt)} className="px-4 py-2 hover:bg-slate-50 text-sm text-slate-600 cursor-pointer">{opt}</div>
               ))}
             </div>
          </div>

          {/* Sort By */}
          <div className="relative group">
             <div className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:border-indigo-300 text-sm font-medium text-slate-700">
               <Sliders className="w-4 h-4 text-slate-400" />
               <span>Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
               <ChevronDown className="w-3 h-3 text-slate-400" />
             </div>
             <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 rounded-lg shadow-xl hidden group-hover:block z-20">
               {[
                 { label: 'Highest Growth', val: 'growth' },
                 { label: 'Highest Volume', val: 'volume' },
                 { label: 'Top Opportunity', val: 'score' }
               ].map(opt => (
                 <div key={opt.val} onClick={() => setSortBy(opt.val as any)} className="px-4 py-2 hover:bg-slate-50 text-sm text-slate-600 cursor-pointer">{opt.label}</div>
               ))}
             </div>
          </div>

          {/* Download */}
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-2 bg-indigo-600 text-white border border-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-lg shadow-xl z-20 animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={generatePDF}
                  className="w-full flex items-center px-4 py-3 hover:bg-slate-50 text-sm text-slate-600 text-left"
                >
                  <FileText className="w-4 h-4 mr-2 text-rose-500" /> Download PDF Report
                </button>
                <button 
                  onClick={generateCSV}
                  className="w-full flex items-center px-4 py-3 hover:bg-slate-50 text-sm text-slate-600 text-left border-t border-slate-50"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" /> Export to CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Feed */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Internal Community */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Community Searches</h3>
                  <p className="text-xs text-slate-500">What users are analyzing</p>
                </div>
              </div>
              <span className="text-xs font-semibold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">{filteredCommunity.length} results</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredCommunity.length > 0 ? filteredCommunity.map((item, i) => (
                <button 
                  key={item.id}
                  onClick={() => onSelectTopic(item.topic)}
                  className="w-full p-4 flex items-center justify-between hover:bg-indigo-50/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-300 w-4 text-center">{i + 1}</span>
                    <div>
                      <span className="font-medium text-slate-700 group-hover:text-indigo-700 block">{item.topic}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide">{item.region} • {item.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">{item.volumeDisplay} searches</div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center">
                      +{item.growth}%
                    </span>
                  </div>
                </button>
              )) : (
                <div className="p-8 text-center text-slate-400 text-sm">No trending topics match your filters.</div>
              )}
            </div>
          </div>

          {/* Column 2: External Web */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-fuchsia-100 text-fuchsia-600 rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Global Web Trends</h3>
                  <p className="text-xs text-slate-500">Signals from Social & Search</p>
                </div>
              </div>
              <span className="text-xs font-semibold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">{filteredWeb.length} results</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredWeb.length > 0 ? filteredWeb.map((item, i) => (
                <button 
                  key={item.id}
                  onClick={() => onSelectTopic(item.topic)}
                  className="w-full p-4 flex items-center justify-between hover:bg-fuchsia-50/50 transition-all group text-left"
                >
                   <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-300 w-4 text-center">{i + 1}</span>
                    <div>
                      <span className="font-medium text-slate-700 group-hover:text-fuchsia-700 block">{item.topic}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide">{item.region} • {item.source}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">{item.volumeDisplay} vol</div>
                    <span className="flex items-center justify-end text-xs font-bold text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded-full">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {item.growth}%
                    </span>
                  </div>
                </button>
              )) : (
                <div className="p-8 text-center text-slate-400 text-sm">No trending topics match your filters.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 text-slate-800 font-semibold">
              <Filter className="w-4 h-4" />
              <span>Refine Trends</span>
            </div>

            <div className="space-y-5">
              {/* Region Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center">
                  <MapPin className="w-3 h-3 mr-1"/> Region
                </label>
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 outline-none focus:border-indigo-400"
                >
                  <option>All Regions</option>
                  <option>Global</option>
                  <option>USA</option>
                  <option>Europe</option>
                  <option>India</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center">
                  <Tag className="w-3 h-3 mr-1"/> Category
                </label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 outline-none focus:border-indigo-400"
                >
                  <option>All Categories</option>
                  <option>SaaS</option>
                  <option>AI Tools</option>
                  <option>E-commerce</option>
                  <option>Health</option>
                  <option>Fintech</option>
                </select>
              </div>

              {/* Min Score Slider */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase">Min Score</label>
                  <span className="text-xs font-mono text-indigo-600">{minScore > 0 ? minScore + '+' : 'Any'}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="90" 
                  step="10"
                  value={minScore} 
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                 <button 
                   onClick={() => {
                     setSelectedRegion('All Regions');
                     setSelectedCategory('All Categories');
                     setMinScore(0);
                     setTimeRange('This Week');
                   }}
                   className="text-xs text-slate-500 hover:text-indigo-600 w-full text-center"
                 >
                   Reset Filters
                 </button>
              </div>

            </div>
          </div>
          
          {/* Promo / Helper */}
          <div className="bg-indigo-600 rounded-xl p-5 text-white shadow-lg shadow-indigo-200">
             <h4 className="font-bold mb-2 text-sm">Want deeper data?</h4>
             <p className="text-xs text-indigo-100 mb-3 leading-relaxed">
               Upgrade to Pro to see full historical data and CSV exports for 10,000+ niche markets.
             </p>
             <button className="w-full py-2 bg-white text-indigo-600 text-xs font-bold rounded hover:bg-indigo-50 transition-colors">
               View Pricing
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrendingView;