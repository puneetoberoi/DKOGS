import React from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
  ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';
import type { MarketReport, GapData } from '../schema'; 

// Interface kept for documentation purposes (used by parent components)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface _MarketChartsProps {
  report: MarketReport;
  filteredGaps?: GapData[];
}

const COLORS = ['#10b981', '#94a3b8', '#f43f5e']; // Success, Slate, Rose
const SCORE_COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

export const SentimentDistribution: React.FC<{ report: MarketReport }> = ({ report }) => {
  const data = [
    { name: 'Positive', value: report.sentimentBreakdown.positive },
    { name: 'Neutral', value: report.sentimentBreakdown.neutral },
    { name: 'Negative', value: report.sentimentBreakdown.negative },
  ];

  return (
    <div className="h-64 w-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-slate-700">
              {report.overallSentiment}%
            </text>
            <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-slate-400">
              Sentiment
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-500 mt-2 px-2">
        <div className="flex items-center whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div> Positive</div>
        <div className="flex items-center whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-slate-400 mr-1"></div> Neutral</div>
        <div className="flex items-center whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-rose-500 mr-1"></div> Negative</div>
      </div>
    </div>
  );
};

export const MarketTrendChart: React.FC<{ report: MarketReport }> = ({ report }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={report.marketTrends} margin={{ top: 10, right: 20, left: 0, bottom: 45 }}>
          <defs>
            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="year" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 11, fill: '#94a3b8', dy: 10}} 
            interval={0}
            padding={{ left: 20, right: 20 }} 
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
            formatter={(value: number) => [`${value}`, 'Demand Index']}
          />
          <Area type="monotone" dataKey="demandIndex" stroke="#4f46e5" fillOpacity={1} fill="url(#colorDemand)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WillingnessToPayChart: React.FC<{ report: MarketReport, filteredGaps?: GapData[] }> = ({ report, filteredGaps }) => {
  const sourceData = filteredGaps || report.gaps;
  const data = sourceData.map(g => ({
    name: g.title.length > 45 ? g.title.substring(0, 45) + '...' : g.title,
    price: g.estimatedPrice
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={220} 
            tick={{fontSize: 10, fill: '#64748b'}} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            cursor={{fill: '#f8fafc'}} 
            formatter={(value: number) => [`$${value}`, 'Est. Price']}
          />
          <Bar dataKey="price" fill="#10b981" radius={[0, 4, 4, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const OpportunityScatter: React.FC<{ report: MarketReport, filteredGaps?: GapData[] }> = ({ report, filteredGaps }) => {
  const sourceData = filteredGaps || report.gaps;
  const data = sourceData.map((g, i) => ({
    x: g.sentimentScore, // Pain (x-axis)
    y: g.opportunityScore, // Opportunity (y-axis)
    z: 300, // Fixed Size for visibility
    name: g.title,
    sourceIndex: i
  }));

  if (data.length === 0) {
    return <div className="h-64 w-full flex items-center justify-center text-slate-400 text-sm">No data for selected sources</div>;
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          
          {/* Quadrant Separators */}
          <ReferenceLine x={5} stroke="#cbd5e1" strokeDasharray="3 3" />
          <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="3 3" />

          <XAxis 
            type="number" 
            dataKey="x" 
            name="Pain Level" 
            unit="" 
            tick={{fontSize: 12, fill: '#94a3b8'}} 
            domain={[0, 10]} 
            label={{ value: 'Customer Pain Intensity (0-10)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} 
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Opp Score" 
            unit="" 
            tick={{fontSize: 12, fill: '#94a3b8', textAnchor: 'middle'}} 
            domain={[0, 100]} 
            label={{ 
              value: 'Opportunity Score (0-100)', 
              angle: -90, 
              position: 'insideLeft', 
              fill: '#94a3b8', 
              fontSize: 12,
              style: { textAnchor: 'middle' }
            }} 
          />
          <ZAxis type="number" dataKey="z" range={[200, 500]} />
          
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload;
              return (
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs z-50 w-48">
                  <p className="font-bold mb-2 text-slate-900 border-b border-slate-100 pb-1">{item.name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                        <span className="text-slate-400 block">Pain</span>
                        <span className="font-mono font-bold text-rose-500">{item.x}/10</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block">Score</span>
                        <span className="font-mono font-bold text-emerald-600">{item.y}/100</span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }} />
          <Scatter name="Gaps" data={data} fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={SCORE_COLORS[entry.sourceIndex % SCORE_COLORS.length]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};