import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Activity, BarChart2, Database, Settings, Play, Pause, BrainCircuit, FileText, Plus, Trash2, Filter, X, Calculator, MessageSquare } from 'lucide-react';
import { Dataset, ChartConfig, ChartType, DataPoint, AIInsight } from './types';
import { db } from './services/db';
import { ChartContainer } from './components/ChartContainer';
import { Modal } from './components/Modal';
import { Spinner } from './components/Spinner';
import { analyzeData } from './services/geminiService';
import { ChatPanel } from './components/ChatPanel';
import { StatisticsPanel } from './components/StatisticsPanel';

// Helper to access papaparse from global script
declare const Papa: any;

export default function App() {
  // App State
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'insights' | 'stats'>('dashboard');
  
  // UI State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);
  const [expandedChartId, setExpandedChartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // AI Analysis State
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);

  // New Chart Form State
  const [newChartType, setNewChartType] = useState<ChartType>(ChartType.LINE);
  const [newChartX, setNewChartX] = useState('');
  const [newChartY, setNewChartY] = useState('');

  // Filtering State
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');

  const activeDataset = datasets.find(d => d.id === activeDatasetId);

  // Initialize
  useEffect(() => {
    const loadData = async () => {
      const stored = db.getDatasets();
      setDatasets(stored);
      if (stored.length > 0) {
        setActiveDatasetId(stored[0].id);
      }
    };
    loadData();
  }, []);

  // Real-time simulation
  useEffect(() => {
    let interval: any;
    if (isLive && activeDataset && activeDataset.numericColumns.length > 0) {
      interval = setInterval(() => {
        setDatasets(prev => {
          return prev.map(ds => {
            if (ds.id === activeDatasetId) {
              const lastPoint = ds.data[ds.data.length - 1];
              const newPoint = { ...lastPoint };
              
              ds.numericColumns.forEach(col => {
                const val = Number(newPoint[col]);
                if (!isNaN(val)) {
                  const change = (Math.random() - 0.5) * (val * 0.1); 
                  newPoint[col] = Number((val + change).toFixed(2));
                }
              });
              
              if (ds.columns.includes('timestamp')) {
                  newPoint['timestamp'] = new Date().toISOString();
              }

              const newData = [...ds.data.slice(1), newPoint]; 
              return { ...ds, data: newData };
            }
            return ds;
          });
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLive, activeDataset, activeDatasetId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const data: DataPoint[] = results.data;
        const columns = results.meta.fields || [];
        
        const numericColumns = columns.filter((col: string) => 
          data.length > 0 && typeof data[0][col] === 'number'
        );
        const categoricalColumns = columns.filter((col: string) => 
          data.length > 0 && typeof data[0][col] === 'string'
        );

        const newDataset: Dataset = {
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          data,
          columns,
          numericColumns,
          categoricalColumns,
          createdAt: Date.now()
        };

        db.saveDataset(newDataset);
        setDatasets(prev => [...prev, newDataset]);
        setActiveDatasetId(newDataset.id);
        
        // Create default charts
        if (numericColumns.length >= 2) {
             const defaultChart: ChartConfig = {
                id: crypto.randomUUID(),
                type: ChartType.LINE,
                xAxisKey: numericColumns[0], 
                yAxisKey: numericColumns[1],
                color: '#3b82f6',
                title: `${numericColumns[1]} vs ${numericColumns[0]}`
            };
            setCharts(prev => [...prev, defaultChart]);
        } else if (numericColumns.length === 1 && categoricalColumns.length > 0) {
            const defaultChart: ChartConfig = {
                id: crypto.randomUUID(),
                type: ChartType.BAR,
                xAxisKey: categoricalColumns[0],
                yAxisKey: numericColumns[0],
                color: '#10b981',
                title: `${numericColumns[0]} by ${categoricalColumns[0]}`
            };
            setCharts(prev => [...prev, defaultChart]);
        }

        setLoading(false);
        setIsUploadModalOpen(false);
      },
      error: (err: any) => {
          console.error(err);
          setLoading(false);
          alert("Error parsing CSV");
      }
    });
  };

  const handleAddChart = () => {
    if (!newChartX || !newChartY) return;
    
    const config: ChartConfig = {
      id: crypto.randomUUID(),
      type: newChartType,
      xAxisKey: newChartX,
      yAxisKey: newChartY,
      color: '#8b5cf6', 
      title: `${newChartY} vs ${newChartX}`
    };
    
    setCharts([...charts, config]);
    setIsAddChartModalOpen(false);
  };

  const handleAIAddChart = (config: Partial<ChartConfig>) => {
    if (!config.type || !config.xAxisKey || !config.yAxisKey) return;
    const newConfig: ChartConfig = {
        id: crypto.randomUUID(),
        type: config.type as ChartType,
        xAxisKey: config.xAxisKey,
        yAxisKey: config.yAxisKey,
        title: config.title || 'AI Generated Chart',
        color: config.color || '#ec4899'
    };
    setCharts(prev => [...prev, newConfig]);
    setActiveTab('dashboard');
  };

  const runAIAnalysis = async () => {
    if (!activeDataset) return;
    setAiLoading(true);
    const insight = await analyzeData(activeDataset);
    setAiInsight(insight);
    setAiLoading(false);
  };

  const getFilteredData = useCallback(() => {
    if (!activeDataset) return [];
    if (!filterColumn || !filterValue) return activeDataset.data;

    return activeDataset.data.filter(row => {
        const val = row[filterColumn];
        if (val === null) return false;
        return String(val).toLowerCase().includes(filterValue.toLowerCase());
    });
  }, [activeDataset, filterColumn, filterValue]);

  const filteredData = getFilteredData();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
             <Activity className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Lumina</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Navigation */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-2">Menu</p>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <BarChart2 size={18} />
              <span>Dashboard</span>
            </button>
            <button 
               onClick={() => setActiveTab('stats')}
               className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'stats' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Calculator size={18} />
              <span>Statistics</span>
            </button>
            <button 
               onClick={() => setActiveTab('data')}
               className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'data' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Database size={18} />
              <span>Data Inspector</span>
            </button>
            <button 
               onClick={() => setActiveTab('insights')}
               className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'insights' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <BrainCircuit size={18} />
              <span>AI Insights</span>
            </button>
          </div>

          {/* Datasets List */}
          <div>
             <div className="flex items-center justify-between mb-2 ml-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Datasets</p>
                <button onClick={() => setIsUploadModalOpen(true)} className="text-blue-400 hover:text-blue-300"><Plus size={14}/></button>
             </div>
             <div className="space-y-1">
                {datasets.map(ds => (
                  <button
                    key={ds.id}
                    onClick={() => setActiveDatasetId(ds.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeDatasetId === ds.id ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}
                  >
                    <span className="truncate">{ds.name}</span>
                    {activeDatasetId === ds.id && <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>}
                  </button>
                ))}
                {datasets.length === 0 && (
                  <div className="text-sm text-slate-600 italic px-3">No datasets</div>
                )}
             </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>v2.0.0</span>
              <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div> Online</span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 z-10 bg-slate-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-semibold text-white">
                {activeTab === 'dashboard' && 'Visual Analytics'}
                {activeTab === 'stats' && 'Statistical Analysis'}
                {activeTab === 'data' && 'Data Inspector'}
                {activeTab === 'insights' && 'AI Analyst'}
             </h2>
             {activeDataset && (
                <span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-400 border border-slate-700">
                   {activeDataset.name}
                </span>
             )}
          </div>
          
          <div className="flex items-center space-x-4">
             {/* Live Mode Toggle */}
             <button 
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isLive ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
             >
                {isLive ? <Pause size={14} /> : <Play size={14} />}
                <span>{isLive ? 'Live Stream' : 'Static Data'}</span>
             </button>

             <div className="h-6 w-px bg-slate-800"></div>
             
             <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
                <Settings size={20} />
             </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative z-0">
            {!activeDataset ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <div className="p-6 bg-slate-900 rounded-full border border-slate-800 animate-bounce">
                     <Upload size={48} className="text-slate-600" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-300">No Dataset Selected</h3>
                  <p>Upload a CSV file to get started.</p>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20"
                  >
                    Upload Data
                  </button>
               </div>
            ) : (
               <>
                 {/* Dashboard View */}
                 {activeTab === 'dashboard' && (
                    <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 h-full">
                       {/* Filters Bar */}
                       <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                          <div className="flex items-center space-x-4">
                             <div className="flex items-center space-x-2 text-slate-400">
                                <Filter size={16} />
                                <span className="text-sm font-medium">Filter:</span>
                             </div>
                             <select 
                                className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500"
                                value={filterColumn}
                                onChange={(e) => setFilterColumn(e.target.value)}
                             >
                                <option value="">Select Column</option>
                                {activeDataset.columns.map(col => <option key={col} value={col}>{col}</option>)}
                             </select>
                             <input 
                                type="text" 
                                placeholder="Value..." 
                                className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                             />
                             {(filterColumn || filterValue) && (
                                <button 
                                   onClick={() => { setFilterColumn(''); setFilterValue(''); }}
                                   className="text-xs text-red-400 hover:underline"
                                >
                                   Clear
                                </button>
                             )}
                          </div>
                          <button 
                             onClick={() => setIsAddChartModalOpen(true)}
                             className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
                          >
                             <Plus size={16} />
                             <span>Add Chart</span>
                          </button>
                       </div>

                       {/* Stats Cards */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                             <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wide">Total Records</h4>
                             <p className="text-3xl font-bold text-white mt-2">{filteredData.length.toLocaleString()}</p>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                             <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wide">Columns</h4>
                             <p className="text-3xl font-bold text-white mt-2">{activeDataset.columns.length}</p>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                             <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wide">Last Updated</h4>
                             <p className="text-3xl font-bold text-white mt-2">
                                {isLive ? 'Now' : new Date(activeDataset.createdAt).toLocaleDateString()}
                             </p>
                          </div>
                       </div>

                       {/* Charts Grid */}
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                          {charts.map(config => (
                             <ChartContainer 
                                key={config.id} 
                                config={config} 
                                data={filteredData}
                                onRemove={() => setCharts(charts.filter(c => c.id !== config.id))}
                                onExpand={() => setExpandedChartId(config.id)}
                             />
                          ))}
                       </div>
                    </div>
                 )}
                 
                 {/* Statistics View */}
                 {activeTab === 'stats' && (
                     <div className="p-6 overflow-y-auto custom-scrollbar h-full">
                        <StatisticsPanel dataset={activeDataset} />
                     </div>
                 )}

                 {/* Data Grid View */}
                 {activeTab === 'data' && (
                    <div className="p-6 h-full flex flex-col">
                       <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
                          <div className="overflow-auto custom-scrollbar flex-1">
                             <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-800 text-slate-200 sticky top-0 z-10">
                                   <tr>
                                      {activeDataset.columns.map(col => (
                                         <th key={col} className="px-6 py-3 font-medium whitespace-nowrap border-b border-slate-700">
                                            {col}
                                         </th>
                                      ))}
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                   {filteredData.slice(0, 100).map((row, i) => (
                                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                         {activeDataset.columns.map(col => (
                                            <td key={`${i}-${col}`} className="px-6 py-3 whitespace-nowrap">
                                               {row[col] !== null ? String(row[col]) : '-'}
                                            </td>
                                         ))}
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                             {filteredData.length > 100 && (
                                <div className="p-4 text-center text-slate-500 text-xs border-t border-slate-800">
                                   Showing first 100 of {filteredData.length} rows.
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 )}

                 {/* AI Insights View */}
                 {activeTab === 'insights' && (
                    <div className="flex h-full">
                        {/* Main Insights / Summary Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                          <div className="flex flex-col items-start mb-4">
                             <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                   <BrainCircuit size={24} className="text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Executive Summary</h3>
                             </div>
                             <p className="text-slate-400">
                                AI-generated analysis of <span className="text-slate-200 font-medium">{activeDataset.name}</span>.
                             </p>
                          </div>

                          {!aiInsight && !aiLoading && (
                             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
                                <p className="text-slate-400 mb-6">Generate an automated report or start chatting with the assistant.</p>
                                <button 
                                   onClick={runAIAnalysis}
                                   className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-indigo-600/25 inline-flex items-center space-x-2"
                                >
                                   <span>Generate Report</span>
                                   <BrainCircuit size={18} />
                                </button>
                             </div>
                          )}

                          {aiLoading && (
                             <div className="flex flex-col items-center py-20 space-y-4">
                                <Spinner className="w-10 h-10 text-indigo-500" />
                                <p className="text-slate-400 animate-pulse">Analyzing patterns...</p>
                             </div>
                          )}

                          {aiInsight && !aiLoading && (
                             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                   <h4 className="text-indigo-400 font-semibold uppercase tracking-wide text-sm mb-3">Overview</h4>
                                   <p className="text-slate-200 leading-relaxed text-lg">{aiInsight.summary}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-6">
                                   <div className="bg-emerald-950/30 p-6 rounded-xl border border-emerald-500/20">
                                      <h4 className="text-emerald-400 font-semibold uppercase tracking-wide text-sm mb-4 flex items-center gap-2">
                                         <Activity size={16}/> Key Trends
                                      </h4>
                                      <ul className="space-y-3">
                                         {aiInsight.trends.map((t, i) => (
                                            <li key={i} className="flex items-start gap-2 text-slate-300">
                                               <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                                               {t}
                                            </li>
                                         ))}
                                      </ul>
                                   </div>
                                   <div className="bg-orange-950/30 p-6 rounded-xl border border-orange-500/20">
                                      <h4 className="text-orange-400 font-semibold uppercase tracking-wide text-sm mb-4 flex items-center gap-2">
                                         <Activity size={16}/> Anomalies
                                      </h4>
                                       <ul className="space-y-3">
                                         {aiInsight.anomalies.length > 0 ? aiInsight.anomalies.map((a, i) => (
                                             <li key={i} className="flex items-start gap-2 text-slate-300">
                                               <span className="mt-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></span>
                                               {a}
                                            </li>
                                         )) : <li className="italic text-slate-500">No critical anomalies detected.</li>}
                                      </ul>
                                   </div>
                                </div>
                                <div className="flex justify-end">
                                   <button onClick={runAIAnalysis} className="text-sm text-slate-500 hover:text-white underline">
                                      Refresh Analysis
                                   </button>
                                </div>
                             </div>
                          )}
                        </div>

                        {/* Chat Sidebar */}
                        <div className="w-[400px] h-full shrink-0">
                            <ChatPanel 
                                dataset={activeDataset} 
                                charts={charts} 
                                onAddChart={handleAIAddChart} 
                            />
                        </div>
                    </div>
                 )}
               </>
            )}
        </div>
      </main>
      
      {/* Expanded Chart Overlay */}
      {expandedChartId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8">
            <div className="relative w-full h-full max-w-7xl mx-auto flex flex-col">
                <button 
                    onClick={() => setExpandedChartId(null)} 
                    className="absolute -top-3 -right-3 z-10 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700 transition-colors shadow-lg"
                >
                    <X size={24} />
                </button>
                {(() => {
                    const chartConfig = charts.find(c => c.id === expandedChartId);
                    if (!chartConfig) return null;
                    return (
                        <ChartContainer 
                            config={chartConfig} 
                            data={filteredData}
                            className="h-full w-full border-slate-700 shadow-2xl bg-slate-900"
                        />
                    );
                })()}
            </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Dataset">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-800/30 transition-colors hover:border-blue-500/50 hover:bg-slate-800/50">
            <Upload className="w-12 h-12 text-slate-500 mb-4" />
            <label className="block text-center cursor-pointer">
              <span className="text-slate-200 font-medium">Click to upload CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <p className="text-sm text-slate-500 mt-1">or drag and drop</p>
            </label>
          </div>
          {loading && <div className="text-center text-blue-400 flex items-center justify-center space-x-2"><Spinner className="w-4 h-4" /><span>Parsing data...</span></div>}
          <div className="text-xs text-slate-500">
             <p>Supported formats: CSV</p>
             <p>First row must contain headers.</p>
          </div>
        </div>
      </Modal>

      {/* Add Chart Modal */}
      <Modal isOpen={isAddChartModalOpen} onClose={() => setIsAddChartModalOpen(false)} title="Create Visualization">
         <div className="space-y-5">
            <div>
               <label className="block text-sm font-medium text-slate-400 mb-1">Chart Type</label>
               <div className="grid grid-cols-3 gap-2">
                  {Object.values(ChartType).map(type => (
                     <button
                        key={type}
                        onClick={() => setNewChartType(type)}
                        className={`px-3 py-2 rounded-lg text-sm border ${newChartType === type ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                     >
                        {type}
                     </button>
                  ))}
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">X Axis (Category/Time)</label>
                  <select 
                     className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                     value={newChartX}
                     onChange={(e) => setNewChartX(e.target.value)}
                  >
                     <option value="">Select Column</option>
                     {activeDataset?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Y Axis (Value)</label>
                  <select 
                     className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                     value={newChartY}
                     onChange={(e) => setNewChartY(e.target.value)}
                  >
                     <option value="">Select Column</option>
                     {activeDataset?.numericColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
            </div>

            <button 
               onClick={handleAddChart}
               disabled={!newChartX || !newChartY}
               className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium rounded-lg transition-colors"
            >
               Add Visualization
            </button>
         </div>
      </Modal>
    </div>
  );
}