import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { GapData } from '../schema';

interface GapChartProps {
  data: GapData[];
}

const GapChart: React.FC<GapChartProps> = ({ data }) => {
  // Transform data for the chart: We want to show Opportunity Score vs Sentiment (Pain)
  const chartData = data.map(item => ({
    name: item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title,
    fullTitle: item.title,
    score: item.opportunityScore,
    pain: item.sentimentScore * 10, // Scale to 100 for comparison
  }));

  return (
    <div className="h-64 w-full bg-white rounded-lg border border-slate-100 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 mb-4">Opportunity vs. Pain Intensity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="score" name="Opportunity Score" fill="#4f46e5" radius={[4, 4, 0, 0]}>
             {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#10b981' : '#4f46e5'} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GapChart;