import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, PlusCircle, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatMessage, Dataset, ChartConfig } from '../types';
import { chatWithAI } from '../services/geminiService';
import { Spinner } from './Spinner';

interface ChatPanelProps {
  dataset: Dataset;
  charts: ChartConfig[];
  onAddChart: (config: Partial<ChartConfig>) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ dataset, charts, onAddChart, isCollapsed = false, onToggleCollapse }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: `Hello! I'm Lumina. I've analyzed **${dataset.name}**. Ask me about trends, statistics, or ask me to create a chart for you!`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await chatWithAI(input, messages, dataset, charts);
    
    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      content: response.content,
      timestamp: Date.now(),
      suggestedActions: response.suggestedChart ? [{
        label: `Create ${response.suggestedChart.title}`,
        action: 'create_chart',
        payload: response.suggestedChart
      }] : undefined
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col ${isCollapsed ? 'h-auto' : 'h-full'} w-full bg-slate-900 border-l border-slate-800 transition-all duration-300`}>
      <div className="p-3 md:p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur text-slate-200 font-semibold flex items-center gap-2 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-indigo-400"/>
          <span className="text-sm md:text-base">AI Assistant</span>
        </div>
        <button
          onClick={() => onToggleCollapse?.(!isCollapsed)}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors md:hidden"
          title={isCollapsed ? "Expand AI Assistant" : "Collapse AI Assistant"}
        >
          {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 md:p-3.5 text-xs md:text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm'}`}>
                  <div className="whitespace-pre-wrap leading-relaxed">
                 {msg.content}
              </div>
              {msg.suggestedActions?.map((action, idx) => (
                <div key={idx} className="mt-3 pt-3 border-t border-slate-700/50">
                   <button 
                      onClick={() => onAddChart(action.payload)}
                      className="flex items-center space-x-2 text-xs font-medium bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-3 py-2 rounded-lg transition-colors w-full justify-center"
                   >
                      <PlusCircle size={14} />
                      <span>{action.label}</span>
                   </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl p-4 rounded-tl-sm flex items-center space-x-2">
                 <Spinner className="w-4 h-4 text-indigo-400" />
                 <span className="text-xs text-slate-400">Analyzing data...</span>
              </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>
        </>
      )}

      {!isCollapsed && (
        <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-900 shrink-0">
          <div className="relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your data..."
              className="w-full bg-slate-800 text-white rounded-lg pl-3 md:pl-4 pr-10 md:pr-12 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none border border-slate-700 placeholder-slate-500"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 bottom-1.5 md:right-2 md:bottom-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send size={14} className="md:w-4 md:h-4" />
            </button>
          </div>
          <div className="mt-1.5 md:mt-2 text-xs text-center text-slate-500 flex items-center justify-center gap-1">
              <Terminal size={10} />
              <span className="hidden md:inline">Press Enter to send, Shift+Enter for new line</span>
              <span className="md:hidden">Press Enter to send</span>
          </div>
        </div>
      )}
    </div>
  );
};