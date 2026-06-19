import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UploadTab from "./components/UploadTab";
import HistoryTab from "./components/HistoryTab";
import TrainingTab from "./components/TrainingTab";
import AnalyticsTab from "./components/AnalyticsTab";
import SettingsTab from "./components/SettingsTab";
import DocsTab from "./components/DocsTab";
import { HistoryItem, GeneratorConfig } from "./types";
import { 
  Bell, 
  Check, 
  X, 
  Info, 
  Flame, 
  Sparkles,
  Layers,
  Database
} from "lucide-react";

interface ToastNotification {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  message: string;
}

export default function App() {
  // Global Tabs state controls
  const [activeTab, setActiveTab] = useState<string>("workstation");

  // Application theme toggles (Stored persistently)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("caption_ai_dark");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Generator Hyperparameter details
  const [config, setConfig] = useState<GeneratorConfig>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("caption_ai_config");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback to defaults
        }
      }
    }
    return {
      defaultModel: "Salesforce BLIP",
      encoderType: "Vision Transformer (ViT)",
      decoderType: "Transformer",
      temperature: 0.8,
      topK: 40,
      topP: 0.9,
      maxLength: 60,
      useOcrContext: true,
      useObjectDetectionContext: true,
      isMixedPrecision: true
    };
  });

  // History state array
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Floating notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Synchronize darkMode class on HTML root DOM nodes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("caption_ai_dark", JSON.stringify(darkMode));
  }, [darkMode]);

  // Save config setting variables persistently
  useEffect(() => {
    localStorage.setItem("caption_ai_config", JSON.stringify(config));
  }, [config]);

  // Initial database sync loading
  useEffect(() => {
    const fetchHistoryFromDb = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await fetch("/api/history");
        if (response.ok) {
          const fileHistory = await response.json();
          setHistory(fileHistory);
        }
      } catch (err) {
        console.error("Failed to sync client history with server storage:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistoryFromDb();
  }, []);

  // Dispatch Toast messaging alerts
  const showToast = (type: "success" | "info" | "warning", title: string, message: string) => {
    const id = Date.now().toString();
    const newToast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto purge toast targets after 5000ms
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add history handlers
  const handleAddHistory = (newItem: any) => {
    setHistory((prev) => [newItem, ...prev]);
    showToast("success", "Record Saved Successfully", "Captions, YOLO objects, and OCR texts archived.");
  };

  // Delete history items
  const handleDeleteHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setHistory((prev) => prev.filter((x) => x.id !== id));
        showToast("info", "Record Removed", "Item successfully deleted from physical SQLite/JS file storage.");
      } else {
        throw new Error("Failed to delete record.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Clear full database contents
  const handleClearHistory = async () => {
    try {
      const response = await fetch("/api/history-clear", {
        method: "DELETE"
      });
      if (response.ok) {
        setHistory([]);
        showToast("warning", "Database Cleared", "All history logs have been safely flushed.");
      } else {
        throw new Error("Failed to clear database.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Re-load a history item back to workbench instantly
  const handleReuseHistoryItem = (item: HistoryItem) => {
    showToast("info", "Stage Loaded", "Loading analysis results back into Vision Canvas.");
    // Simulating loading back to workstation
    setActiveTab("workstation");
  };

  // Checkpoints triggered during simulated training epoch completions
  const handleNotifyCheckpoint = (datasetName: string, epoch: number, bleu: number) => {
    showToast(
      "success", 
      `Weight Checkpoint Compiled!`, 
      `Successfully saved model checkpoint_epoch_${epoch}.pt with validation BLEU score of ${bleu}%.`
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans leading-relaxed dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Visual Menu Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        processedCount={history.length}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Universal Top Controls Header */}
        <Header activeTab={activeTab} processedCount={history.length} />

        {/* Dynamic Inner Tab Screens */}
        <div id="core-tab-viewports" className="flex-1 pb-16">
          {activeTab === "workstation" && (
            <UploadTab 
              onAddHistory={handleAddHistory} 
              config={config} 
            />
          )}

          {activeTab === "history" && (
            <HistoryTab 
              history={history} 
              onDeleteHistory={handleDeleteHistory}
              onClearHistory={handleClearHistory}
              onReuseHistoryItem={handleReuseHistoryItem}
            />
          )}

          {activeTab === "training" && (
            <TrainingTab onNotifyCheckpoint={handleNotifyCheckpoint} />
          )}

          {activeTab === "analytics" && (
            <AnalyticsTab history={history} />
          )}

          {activeTab === "settings" && (
            <SettingsTab config={config} setConfig={setConfig} />
          )}

          {activeTab === "docs" && (
            <DocsTab />
          )}
        </div>
      </main>

      {/* FLOATING SYSTEM TOASTS INJECTOR */}
      <div id="sys-toast-container" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => {
          let styles = "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-white";
          let icon = <Info className="h-4.5 w-4.5 text-indigo-500" />;

          if (toast.type === "success") {
            styles = "bg-emerald-500 text-white border-transparent shadow-emerald-500/10";
            icon = <Check className="h-4.5 w-4.5 text-white" />;
          } else if (toast.type === "warning") {
            styles = "bg-rose-600 text-white border-transparent shadow-rose-500/10";
            icon = <X className="h-4.5 w-4.5 text-white" />;
          }

          return (
            <div
              key={toast.id}
              className={`p-4 rounded-2xl border flex items-start gap-3.5 shadow-lg animate-slide-up transition-all ${styles}`}
            >
              <div className="p-1 rounded-lg bg-white/10 shrink-0">
                {icon}
              </div>
              <div className="flex-1 space-y-0.5">
                <h5 className="text-xs font-bold leading-tight">{toast.title}</h5>
                <p className="text-[10px] opacity-90">{toast.message}</p>
              </div>
              <button
                onClick={() => handleRemoveToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
