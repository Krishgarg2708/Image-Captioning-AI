import React, { useState } from "react";
import { 
  Search, 
  Trash2, 
  Trash,
  ExternalLink,
  PlusCircle, 
  Calendar,
  AlertCircle,
  FileCode,
  Layers,
  Sparkles,
  RefreshCw,
  Database
} from "lucide-react";
import { HistoryItem } from "../types";

interface HistoryTabProps {
  history: HistoryItem[];
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onReuseHistoryItem: (item: HistoryItem) => void;
}

export default function HistoryTab({
  history,
  onDeleteHistory,
  onClearHistory,
  onReuseHistoryItem
}: HistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModel, setFilterModel] = useState("all");

  const filteredHistory = history.filter((item) => {
    const caps = item.analysis.captions;
    const notesStr = item.notes?.toLowerCase() || "";
    const activeText = item.selectedCaption?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    
    // Check search term matching caption selection, scene class, activity labels, or notes
    const matchesSearch = 
      activeText.includes(query) ||
      notesStr.includes(query) ||
      item.analysis.explainableAi.scene.toLowerCase().includes(query) ||
      item.analysis.explainableAi.activities.some((act) => act.toLowerCase().includes(query)) ||
      item.analysis.explainableAi.objects.some((obj) => obj.name.toLowerCase().includes(query));

    // Check filter select matches
    if (filterModel === "all") return matchesSearch;
    // e.g. finding if specific model names exist in results list
    return matchesSearch && caps.some((c) => c.modelName.includes(filterModel));
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto p-8">
      
      {/* Filters and search headers */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search captions, scenes, objects, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Action controls */}
        <div className="flex w-full md:w-auto items-center justify-end gap-3">
          <select
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-700 dark:text-slate-300 font-medium focus:outline-indigo-500"
          >
            <option value="all">⚡ All Vision Models</option>
            <option value="Salesforce BLIP">Salesforce BLIP</option>
            <option value="BLIP-2">Salesforce BLIP-2</option>
            <option value="ViT-GPT2">ViT-GPT2</option>
            <option value="GIT">GIT (Generative Image)</option>
            <option value="OFA">OFA Multimodal</option>
          </select>

          {history.length > 0 && (
            <button
              id="clear-all-history-btn"
              onClick={() => {
                if (confirm("Are you sure you want to permanently delete your entire caption history archives? This action cannot be undone.")) {
                  onClearHistory();
                }
              }}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/40 active:scale-95 transition-all"
            >
              <Trash className="h-4 w-4" />
              <span>Clear History Database</span>
            </button>
          )}
        </div>

      </div>

      {/* Grid container */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {history.length === 0 ? "Caption Database Empty" : "No Records Match Search Terms"}
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-[320px]">
            {history.length === 0 
              ? "Analyze custom digital assets or loaded sandboxed samples in the vision workstation and click 'Save to Caption History' to store records here."
              : "Try adjusting your search query, model filter, or input terms to retrieve active item cells."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => {
            const date = new Date(item.timestamp).toLocaleString();
            const confidenceMax = item.analysis.captions[0]?.confidence || 90;
            return (
              <div
                key={item.id}
                id={`history-card-tile-${item.id}`}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col hover:border-indigo-400 dark:hover:border-indigo-800 hover:shadow-md transition-all duration-200"
              >
                {/* Visual container */}
                <div className="h-44 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative border-b border-slate-100 dark:border-slate-800">
                  <img
                    src={item.imageUrl}
                    alt="Processed visual history"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none select-none"
                  />
                  
                  {/* Score pill */}
                  <div className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono text-emerald-400 flex items-center gap-1">
                    <Database className="h-3 w-3 text-indigo-400" />
                    <span>Avg Conf: {confidenceMax}%</span>
                  </div>

                  {/* Scene classifier style */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase letters-wide">
                    {item.analysis.explainableAi.scene}
                  </div>
                </div>

                {/* Text body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{date}</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-3">
                      "{item.selectedCaption || item.analysis.captions[0].text}"
                    </p>

                    {item.notes && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/10 px-2 py-1.5 rounded-lg border border-indigo-100/20 italic truncate">
                        <b>User Note:</b> {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Badges line info */}
                  <div className="flex flex-wrap gap-1 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {item.analysis.explainableAi.objects.slice(0, 3).map((obj, i) => (
                      <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {obj.name}
                      </span>
                    ))}
                    {item.analysis.explainableAi.objects.length > 3 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300">
                        +{item.analysis.explainableAi.objects.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <button
                      id={`reuse-history-item-${item.id}`}
                      onClick={() => onReuseHistoryItem(item)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 active:scale-95 transition-all text-center"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Load to Stage</span>
                    </button>

                    <button
                      id={`delete-history-item-${item.id}`}
                      onClick={() => onDeleteHistory(item.id)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-500 dark:border-slate-800 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50/20 active:scale-95 transition-all"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
