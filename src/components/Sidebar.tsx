import React from "react";
import { 
  Camera, 
  History, 
  Settings, 
  BookOpen, 
  Activity, 
  Gauge, 
  Cpu, 
  Eye 
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  processedCount: number;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  processedCount,
  darkMode, 
  setDarkMode 
}: SidebarProps) {
  const menuItems = [
    { id: "workstation", label: "AI Workstation", icon: Camera, color: "text-emerald-500" },
    { id: "history", label: "Caption History", icon: History, color: "text-blue-500" },
    { id: "training", label: "ML Training Lab", icon: Cpu, color: "text-amber-500" },
    { id: "analytics", label: "Analytics Center", icon: Gauge, color: "text-indigo-500" },
    { id: "settings", label: "Generator Settings", icon: Settings, color: "text-rose-500" },
    { id: "docs", label: "System Manual", icon: BookOpen, color: "text-teal-500" },
  ];

  return (
    <aside id="sidebar-panel" className="w-80 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 transition-colors duration-300">
      {/* App brand header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none font-bold">
            <Eye className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-slate-900 dark:text-white">
              CaptionAI <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">PRO</span>
            </h1>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Vision & NLP Pipeline
            </p>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav id="sidebar-nav" className="flex-1 space-y-1.5 p-4 py-6 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? item.color : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                <span>{item.label}</span>
              </div>
              {item.id === "history" && processedCount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {processedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer statistics and theme switcher */}
      <div id="sidebar-footer" className="p-4 border-t border-slate-100 dark:border-slate-900 space-y-4">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            <span>Active Device Core</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold">
              CUDA GPU ENABLED
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              FP16 Mixed
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Appearance
          </span>
          <button
            id="theme-toggler-btn"
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 active:scale-95 transition-all w-24 justify-center"
          >
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </div>
    </aside>
  );
}
