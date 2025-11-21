import React, { useMemo } from 'react';
import { Dataset, NumericSummary, CorrelationResult } from '../types';
import { calculateNumericSummary, calculateCorrelations, getHistogramData } from '../services/statisticsService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatisticsPanelProps {
  dataset: Dataset;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ dataset }) => {
  const summaries = useMemo(() => calculateNumericSummary(dataset), [dataset]);
  const correlations = useMemo(() => calculateCorrelations(dataset), [dataset]);

  // Create a matrix for the heatmap
  const uniqueCols = useMemo(() => Array.from(new Set(correlations.flatMap(c => [c.col1, c.col2]))).sort(), [correlations]);
  
  const getCorrelationColor = (value: number) => {
    if (value > 0.7) return 'bg-blue-500 text-white';
    if (value > 0.3) return 'bg-blue-500/50 text-white';
    if (value > -0.3) return 'bg-slate-800 text-slate-400';
    if (value > -0.7) return 'bg-red-500/50 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Univariate Statistics */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
          Numeric Summaries
        </h3>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-800 text-slate-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Column</th>
                  <th className="px-6 py-3 font-medium text-right">Mean</th>
                  <th className="px-6 py-3 font-medium text-right">Median</th>
                  <th className="px-6 py-3 font-medium text-right">Std Dev</th>
                  <th className="px-6 py-3 font-medium text-right">Min</th>
                  <th className="px-6 py-3 font-medium text-right">Max</th>
                  <th className="px-6 py-3 font-medium text-right">Missing</th>
                  <th className="px-6 py-3 font-medium text-center">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {summaries.map((stat) => (
                  <tr key={stat.column} className="hover:bg-slate-800/30">
                    <td className="px-6 py-3 font-medium text-slate-300">{stat.column}</td>
                    <td className="px-6 py-3 text-right">{stat.mean.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right">{stat.median.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right">{stat.stdDev.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right">{stat.min}</td>
                    <td className="px-6 py-3 text-right">{stat.max}</td>
                    <td className="px-6 py-3 text-right">{stat.nullCount}</td>
                    <td className="px-6 py-1 w-32 h-12">
                      <div className="h-10 w-24 mx-auto">
                         <TinyHistogram dataset={dataset} column={stat.column} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Correlation Matrix */}
      {uniqueCols.length > 1 && (
        <section>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
            Correlation Matrix (Pearson)
          </h3>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid" style={{ gridTemplateColumns: `auto repeat(${uniqueCols.length}, minmax(60px, 1fr))` }}>
                {/* Header Row */}
                <div className="p-2"></div>
                {uniqueCols.map(col => (
                  <div key={col} className="p-2 text-xs font-medium text-slate-400 rotate-45 origin-bottom-left translate-x-4 whitespace-nowrap">
                    {col}
                  </div>
                ))}
                
                {/* Matrix Rows */}
                {uniqueCols.map((rowCol) => (
                  <React.Fragment key={rowCol}>
                    <div className="p-2 text-xs font-medium text-slate-400 whitespace-nowrap flex items-center justify-end pr-4">
                      {rowCol}
                    </div>
                    {uniqueCols.map((colCol) => {
                      if (rowCol === colCol) return <div key={`${rowCol}-${colCol}`} className="bg-slate-800 m-0.5 rounded-sm"></div>;
                      
                      const corr = correlations.find(
                        c => (c.col1 === rowCol && c.col2 === colCol) || (c.col1 === colCol && c.col2 === rowCol)
                      )?.correlation || 0;

                      return (
                        <div 
                          key={`${rowCol}-${colCol}`}
                          className={`m-0.5 rounded-sm flex items-center justify-center text-[10px] h-12 ${getCorrelationColor(corr)} transition-all hover:scale-110 cursor-default`}
                          title={`${rowCol} vs ${colCol}: ${corr.toFixed(3)}`}
                        >
                          {corr.toFixed(2)}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const TinyHistogram: React.FC<{ dataset: Dataset, column: string }> = ({ dataset, column }) => {
  const data = useMemo(() => getHistogramData(dataset, column, 8), [dataset, column]);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Tooltip 
           cursor={false}
           content={({ active, payload }) => {
             if (active && payload && payload.length) {
               return <div className="bg-slate-900 text-xs p-1 border border-slate-700 rounded">{payload[0].payload.range}: {payload[0].value}</div>;
             }
             return null;
           }}
        />
        <Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};