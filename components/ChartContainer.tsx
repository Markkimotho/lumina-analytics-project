import React, { useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { Download, Maximize2, Trash2 } from 'lucide-react';
import { ChartConfig, ChartType, DataPoint } from '../types';

interface ChartContainerProps {
  data: DataPoint[];
  config: ChartConfig;
  onRemove?: () => void;
  onExpand?: () => void;
  className?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ChartContainer: React.FC<ChartContainerProps> = ({ data, config, onRemove, onExpand, className }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    // Simple SVG download logic
    if (chartRef.current) {
      const svg = chartRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${config.title.replace(/\s+/g, '_')}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const formatYAxis = (value: any) => {
    if (typeof value === 'number') {
      if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return parseFloat(value.toFixed(2)).toString();
    }
    return value;
  };

  const renderChart = () => {
    const axisProps = {
      stroke: "#475569",
      tick: { fill: '#cbd5e1', fontSize: 11, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 },
      tickLine: { stroke: '#334155' }
    };

    const yAxisProps = {
      ...axisProps,
      width: 70,
      tickFormatter: formatYAxis,
      label: { 
        value: config.yAxisKey, 
        angle: -90, 
        position: 'insideLeft' as const, 
        offset: 5,
        style: { 
          textAnchor: 'middle', 
          fill: '#e2e8f0', 
          fontSize: 13, 
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', 
          fontWeight: 600,
          letterSpacing: '0.5px'
        } 
      }
    };

    const xAxisProps = {
      ...axisProps,
      dataKey: config.xAxisKey,
      height: 60,
      angle: data.length > 8 ? -45 : 0,
      textAnchor: data.length > 8 ? "end" : "middle",
      interval: data.length > 15 ? Math.floor(data.length / 10) : 0,
      label: { 
        value: config.xAxisKey, 
        position: 'bottom' as const, 
        offset: 10, 
        style: { 
          textAnchor: 'middle', 
          fill: '#e2e8f0', 
          fontSize: 13, 
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', 
          fontWeight: 600,
          letterSpacing: '0.5px'
        } 
      }
    };

    const commonProps = {
      data: data,
      margin: { top: 25, right: 40, left: 15, bottom: 50 }
    };

    const tooltipStyle = {
      backgroundColor: '#0f172a',
      borderColor: '#64748b',
      border: '1px solid #64748b',
      color: '#f1f5f9',
      borderRadius: '8px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '12px',
      padding: '8px 12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
    };

    const tooltipFormatter = (value: any) => {
      return [formatYAxis(value), ''];
    };

    const tooltipLabelFormatter = (label: any) => {
      return `${label}`;
    };

    const legendProps = {
      verticalAlign: 'top' as const,
      height: 35,
      wrapperStyle: { 
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', 
        color: '#cbd5e1',
        fontSize: '12px',
        fontWeight: 500,
        paddingBottom: '10px'
      }
    };

    switch (config.type) {
      case ChartType.LINE:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip 
              contentStyle={tooltipStyle} 
              formatter={tooltipFormatter}
              labelFormatter={tooltipLabelFormatter}
              cursor={{ stroke: '#475569', strokeWidth: 1 }}
            />
            <Legend {...legendProps}/>
            <Line type="monotone" dataKey={config.yAxisKey} stroke={config.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} isAnimationActive={true} />
          </LineChart>
        );
      case ChartType.BAR:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip 
              contentStyle={tooltipStyle} 
              formatter={tooltipFormatter}
              labelFormatter={tooltipLabelFormatter}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Legend {...legendProps}/>
            <Bar dataKey={config.yAxisKey} fill={config.color} radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={800} />
          </BarChart>
        );
      case ChartType.AREA:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip 
              contentStyle={tooltipStyle} 
              formatter={tooltipFormatter}
              labelFormatter={tooltipLabelFormatter}
              cursor={{ stroke: '#475569', strokeWidth: 1 }}
            />
            <Legend {...legendProps}/>
            <Area type="monotone" dataKey={config.yAxisKey} stroke={config.color} fill={config.color} fillOpacity={0.25} isAnimationActive={true} />
          </AreaChart>
        );
      case ChartType.PIE:
        // Create aggregated data for pie chart
        const pieDataMap = new Map<string, number>();
        data.forEach(row => {
          const key = String(row[config.xAxisKey]);
          const value = Number(row[config.yAxisKey]) || 0;
          pieDataMap.set(key, (pieDataMap.get(key) || 0) + value);
        });
        
        const aggregatedPieData = Array.from(pieDataMap.entries())
          .slice(0, 12)
          .map(([name, value]) => ({
            name,
            value
          }));

        const renderCustomLabel = (entry: any) => {
          const percent = entry.percent ? (entry.percent * 100).toFixed(1) : '0';
          return `${percent}%`;
        };
        return (
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <Tooltip 
              contentStyle={tooltipStyle}
              formatter={(value) => formatYAxis(value)}
              labelFormatter={(label) => `${label}`}
            />
            <Legend 
              {...legendProps}
              verticalAlign="bottom"
              layout="horizontal"
              wrapperStyle={{ ...legendProps.wrapperStyle, paddingTop: '15px' }}
            />
            <Pie
              data={aggregatedPieData}
              cx="50%"
              cy="42%"
              innerRadius={45}
              outerRadius={85}
              paddingAngle={1.5}
              dataKey="value"
              nameKey="name"
              label={{
                fill: '#f1f5f9',
                fontSize: 11,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 600,
                formatter: renderCustomLabel
              }}
              isAnimationActive={true}
              animationDuration={800}
            >
              {aggregatedPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      case ChartType.SCATTER:
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              {...xAxisProps} 
              type="number" 
              dataKey={config.xAxisKey}
              name={config.xAxisKey}
            />
            <YAxis 
              {...yAxisProps}
              type="number"
              name={config.yAxisKey}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }} 
              contentStyle={tooltipStyle}
              formatter={tooltipFormatter}
              labelFormatter={tooltipLabelFormatter}
            />
            <Legend {...legendProps}/>
            <Scatter name={config.yAxisKey} data={data} fill={config.color} isAnimationActive={true} />
          </ScatterChart>
        );
      default:
        return <div>Unsupported Chart Type</div>;
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4 shadow-lg flex flex-col transition-all duration-300 hover:border-slate-600 ${className || 'h-[280px] md:h-[400px]'}`}>
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h3 className="font-semibold text-slate-200 text-sm md:text-base">{config.title}</h3>
        <div className="flex space-x-1 md:space-x-2">
          <button onClick={handleDownload} title="Export SVG" className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
            <Download size={16} className="md:w-5 md:h-5" />
          </button>
          {onExpand && (
            <button onClick={onExpand} title="Expand Chart" className="p-1.5 md:p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors">
               <Maximize2 size={16} className="md:w-5 md:h-5" /> 
            </button>
          )}
          {onRemove && (
            <button onClick={() => { if (window.confirm('Remove this chart?')) onRemove(); }} title="Remove Chart" className="p-1.5 md:p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors">
              <Trash2 size={16} className="md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 w-full min-h-0" ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};