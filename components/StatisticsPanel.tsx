import React, { useMemo } from 'react';
import { Dataset, NumericSummary, CorrelationResult } from '../types';
import { calculateNumericSummary, calculateCorrelations, getHistogramData } from '../services/statisticsService';
import { BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts';

interface StatisticsPanelProps {
  dataset: Dataset;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ dataset }) => {
  const summaries = useMemo(() => calculateNumericSummary(dataset), [dataset]);
  const correlations = useMemo(() => calculateCorrelations(dataset), [dataset]);

  // Create a matrix for the heatmap
  const uniqueCols = useMemo(() => Array.from(new Set(correlations.flatMap(c => [c.col1, c.col2]))).sort(), [correlations]);
  
  const getCorrelationColor = (value: number) => {
    if (value > 0.7) return 'bg-blue-600 text-white font-semibold';
    if (value > 0.3) return 'bg-blue-500/70 text-white font-semibold';
    if (value > -0.3) return 'bg-slate-700 text-slate-300 font-medium';
    if (value > -0.7) return 'bg-red-500/70 text-white font-semibold';
    return 'bg-red-600 text-white font-semibold';
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10 p-3 md:p-0">
      {/* Univariate Statistics */}
      <section>
        <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
          Numeric Summaries
        </h3>
        <div className="bg-slate-900 border border-slate-800 rounded-lg md:rounded-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs md:text-sm text-slate-400">
              <thead className="bg-slate-800/80 text-slate-200 sticky top-0">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 font-semibold text-slate-300 text-xs md:text-sm">Column</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 font-semibold text-slate-300 text-xs md:text-sm text-right">Mean</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 font-semibold text-slate-300 text-xs md:text-sm text-right">Median</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 font-semibold text-slate-300 text-xs md:text-sm text-right">Std Dev</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 font-semibold text-slate-300 text-xs md:text-sm text-right">Min</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 font-semibold text-slate-300 text-xs md:text-sm text-right">Max</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 font-semibold text-slate-300 text-xs md:text-sm text-right">Missing</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 font-semibold text-slate-300 text-xs md:text-sm text-center">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {summaries.map((stat) => (
                  <tr key={stat.column} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-3 md:px-6 py-2 md:py-3 font-medium text-slate-300 text-xs md:text-sm">{stat.column}</td>
                    <td className="px-3 md:px-6 py-2 md:py-3 text-right text-slate-400 text-xs md:text-sm">{stat.mean.toFixed(2)}</td>
                    <td className="px-3 md:px-6 py-2 md:py-3 text-right text-slate-400 text-xs md:text-sm">{stat.median.toFixed(2)}</td>
                    <td className="px-3 md:px-6 py-2 md:py-3 text-right text-slate-400 text-xs md:text-sm">{stat.stdDev.toFixed(2)}</td>
                    <td className="px-3 md:px-6 py-2 md:py-3 text-right text-slate-400 text-xs md:text-sm">{stat.min}</td>
                    <td className="px-3 md:px-6 py-2 md:py-3 text-right text-slate-400 text-xs md:text-sm">{stat.max}</td>
                    <td className="px-3 md:px-6 py-2 md:py-3 text-right text-slate-400 text-xs md:text-sm">{stat.nullCount}</td>
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
          <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
            Correlation Matrix (Pearson)
          </h3>
          <div className="bg-slate-900 border border-slate-800 rounded-lg md:rounded-xl p-3 md:p-6 overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid" style={{ gridTemplateColumns: `auto repeat(${uniqueCols.length}, minmax(60px, 1fr))` }}>
                
                {/* Matrix Rows */}
                {uniqueCols.map((rowCol) => (
                  <React.Fragment key={rowCol}>
                    <div className="p-2 text-xs font-semibold text-slate-300 whitespace-nowrap flex items-center justify-end pr-4">
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
                          className={`m-1 rounded-md flex items-center justify-center text-[11px] h-12 font-semibold ${getCorrelationColor(corr)} transition-all hover:scale-105 cursor-pointer shadow-sm`}
                          title={`${rowCol} vs ${colCol}: ${corr.toFixed(3)}`}
                        >
                          {corr.toFixed(2)}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}

                {/* X-Axis Header Row at Bottom */}
                <div className="p-2"></div>
                {uniqueCols.map(col => (
                  <div key={`header-${col}`} className="p-2 text-xs font-semibold text-slate-300 flex items-center justify-center">
                    {col}
                  </div>
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
  const data = useMemo(() => getHistogramData(dataset, column, 6), [dataset, column]);
  
  const tooltipStyle = {
    backgroundColor: '#0f172a',
    borderColor: '#64748b',
    border: '1px solid #64748b',
    color: '#f1f5f9',
    borderRadius: '6px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '10px',
    padding: '4px 8px'
  };

  if (!data || data.length === 0) {
    return <div className="text-xs text-slate-500">No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 2, right: 2, left: 0, bottom: 2 }}>
        <Tooltip 
          contentStyle={tooltipStyle}
          cursor={{ fill: 'rgba(99, 102, 241, 0.2)' }}
          formatter={(value) => {
            if (typeof value === 'number') return value.toString();
            return value;
          }}
          contentFormatter={() => ''}
        />
        <Bar dataKey="count" fill="#6366f1" radius={[1, 1, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
};