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
    const commonProps = {
      data: data,
      margin: { top: 10, right: 30, left: 10, bottom: 10 }
    };

    const commonYAxisProps = {
      stroke: "#94a3b8",
      tick: { fill: '#94a3b8', fontSize: 12 },
      width: 65,
      tickFormatter: formatYAxis,
      label: { 
        value: config.yAxisKey, 
        angle: -90, 
        position: 'insideLeft' as const, 
        style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 12 } 
      }
    };

    const commonXAxisProps = {
      dataKey: config.xAxisKey,
      stroke: "#94a3b8",
      tick: { fill: '#94a3b8', fontSize: 12 },
      height: 50,
      label: { 
        value: config.xAxisKey, 
        position: 'insideBottom' as const, 
        offset: -5, 
        style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 12 } 
      }
    };

    switch (config.type) {
      case ChartType.LINE:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis {...commonXAxisProps} />
            <YAxis {...commonYAxisProps} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey={config.yAxisKey} stroke={config.color} strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
          </LineChart>
        );
      case ChartType.BAR:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis {...commonXAxisProps} />
            <YAxis {...commonYAxisProps} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} />
            <Legend verticalAlign="top" height={36}/>
            <Bar dataKey={config.yAxisKey} fill={config.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case ChartType.AREA:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis {...commonXAxisProps} />
            <YAxis {...commonYAxisProps} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} />
            <Legend verticalAlign="top" height={36}/>
            <Area type="monotone" dataKey={config.yAxisKey} stroke={config.color} fill={config.color} fillOpacity={0.3} />
          </AreaChart>
        );
      case ChartType.PIE:
         const pieData = data.slice(0, 10); // Limit slices for readability
         return (
          <PieChart>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} />
            <Legend verticalAlign="bottom" />
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey={config.yAxisKey} // Value
              nameKey={config.xAxisKey} // Label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
         );
      case ChartType.SCATTER:
        return (
           <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis {...commonXAxisProps} type="category" name={config.xAxisKey} />
            <YAxis 
              dataKey={config.yAxisKey} 
              type="number" 
              name={config.yAxisKey}
              {...commonYAxisProps}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} />
            <Legend verticalAlign="top" height={36}/>
            <Scatter name={config.title} data={data} fill={config.color} />
          </ScatterChart>
        );
      default:
        return <div>Unsupported Chart Type</div>;
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col transition-all duration-300 hover:border-slate-600 ${className || 'h-[400px]'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-200">{config.title}</h3>
        <div className="flex space-x-2">
          <button onClick={handleDownload} title="Export SVG" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
            <Download size={18} />
          </button>
          {onExpand && (
            <button onClick={onExpand} title="Expand Chart" className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors">
               <Maximize2 size={18} /> 
            </button>
          )}
          {onRemove && (
            <button onClick={onRemove} title="Remove Chart" className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors">
               <Trash2 size={18} /> 
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