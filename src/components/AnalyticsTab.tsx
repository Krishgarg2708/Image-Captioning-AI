import React from "react";
import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Gauge, 
  Cpu, 
  Calendar, 
  Zap, 
  Layers 
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { HistoryItem } from "../types";

interface AnalyticsTabProps {
  history: HistoryItem[];
}

export default function AnalyticsTab({ history }: AnalyticsTabProps) {
  // Setup sample mock statistics based on actual history size
  const totalProcessed = Math.max(history.length, 128);
  const totalCaptions = totalProcessed * 5; // We generate 5 styles per image
  
  // Calculate average confidence from history items
  const avgConfidence = history.length > 0 
    ? Number((history.reduce((acc, curr) => acc + curr.analysis.captions[0].confidence, 0) / history.length).toFixed(1))
    : 95.8;

  // Mock charts arrays
  const usageData = [
    { day: "Jun 02", uploads: 12 },
    { day: "Jun 03", uploads: 18 },
    { day: "Jun 04", uploads: 15 },
    { day: "Jun 05", uploads: 22 },
    { day: "Jun 06", uploads: 32 },
    { day: "Jun 07", uploads: 25 },
    { day: "Jun 08", uploads: totalProcessed },
  ];

  const objectFreqData = [
    { name: "Dog", count: 42 },
    { name: "Laptop", count: 34 },
    { name: "Sofa", count: 28 },
    { name: "Coffee Cup", count: 24 },
    { name: "Table Desk", count: 21 },
    { name: "Hardcover Book", count: 18 },
    { name: "Bicycle", count: 12 }
  ];

  const modelScores = [
    { name: "Salesforce BLIP", score: 96.2, color: "#6366f1" },
    { name: "Salesforce BLIP-2", score: 98.1, color: "#10b981" },
    { name: "ViT-GPT2 Model", score: 89.4, color: "#3b82f6" },
    { name: "GIT Text Model", score: 91.5, color: "#fbbf24" },
    { name: "OFA Multimodal", score: 86.8, color: "#f43f5e" }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto p-8">
      
      {/* Dynamic numeric KPI header blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Images Processed</span>
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{totalProcessed}</h3>
            <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>+14.5% versus yesterday</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Captions Synthesized</span>
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{totalCaptions}</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              5 individual formats compiled/img
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Confidence</span>
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{avgConfidence}%</h3>
            <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>Deep Vision encoder optimized</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Gauge className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">YOLO Extraction Latency</span>
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">124 ms</h3>
            <p className="text-[10px] text-indigo-500 font-semibold">
              Batch processing size: 1 image
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/45 flex items-center justify-center text-rose-600 dark:text-rose-450 font-bold">
            <Zap className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Recharts graphs section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Daily Upload charts AreaChart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h4 className="text-sm font-semibold tracking-wide text-slate-400 uppercase flex items-center gap-2 mb-6">
            <Calendar className="h-4.5 w-4.5 text-indigo-500" />
            <span>Daily Upload Activity</span>
          </h4>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="uploads" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorUploads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most frequent objects YOLOv8 tracker */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h4 className="text-sm font-semibold tracking-wide text-slate-400 uppercase flex items-center gap-2 mb-6">
            <BarChartIcon className="h-4.5 w-4.5 text-emerald-500" />
            <span>YOLOv8 Most Popular Object Extractions</span>
          </h4>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={objectFreqData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Model accuracy stats list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-5 flex items-center gap-1.5">
          <Cpu className="h-4 w-4 text-indigo-500" />
          <span>Generative Backends Average Confidence Breakdown</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {modelScores.map((model) => (
            <div key={model.name} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-center space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block truncate">{model.name}</span>
              <div className="text-2xl font-bold font-mono tracking-tight" style={{ color: model.color }}>
                {model.score}%
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div style={{ width: `${model.score}%`, backgroundColor: model.color }} className="h-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
