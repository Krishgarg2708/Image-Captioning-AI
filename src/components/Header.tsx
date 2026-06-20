import React, { useState, useEffect } from "react";
import { Clock, Database, Globe, RefreshCw } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  processedCount: number;
}

export default function Header({ activeTab, processedCount }: HeaderProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTitle = () => {
    switch (activeTab) {
      case "workstation":
        return "AI Vision Workstation";
      case "history":
        return "Caption History Archives";
      case "training":
        return "Machine Learning Training Labs";
      case "analytics":
        return "Metrics & Performance Analytics";
      case "settings":
        return "Advanced Generator Configurations";
      case "docs":
        return "System Manual & Developer Guide";
      default:
        return "Dashboard";
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case "workstation":
        return "Upload digital assets to trigger visual analysis, YOLO-v8 object detection, and multiversal caption generators.";
      case "history":
        return "Manage, search, preview, and delete previously processed data structures.";
      case "training":
        return "Load MS COCO or Flickr8k datasets, tune checkpoints, and inspect train.py metrics.";
      case "analytics":
        return "Inspect performance dashboards, daily speed charts, confidence distributions, and target tokens.";
      case "settings":
        return "Calibrate temperature, top-k filters, OCR text injections, and visual encoders.";
      case "docs":
        return "A comprehensive architecture overview detailing hardware scopes, python training files, and deployment guidelines.";
      default:
        return "";
    }
  };

  return (
    <header id="upper-header" className="h-20 border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 px-8 flex items-center justify-between transition-colors duration-300">
      <div>
        <h2 id="header-view-title" className="font-display font-bold text-xl text-slate-900 dark:text-white">
          {getTitle()}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {getSubtitle()}
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* UTC live time indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-400">
          <Clock className="h-3.5 w-3.5 text-indigo-500" />
          <span>{time}</span>
        </div>

        {/* Database state indicator */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Database className="h-3.5 w-3.5 text-emerald-500" />
          <span>
            DB State: <b className="text-slate-900 dark:text-slate-200">{processedCount} Saved</b>
          </span>
        </div>
      </div>
    </header>
  );
}
