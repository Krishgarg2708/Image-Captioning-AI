import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX,
  FileText, 
  Download, 
  Eye, 
  EyeOff, 
  Loader2, 
  BookMarked, 
  FileCode, 
  RefreshCw,
  Sparkles,
  Clipboard,
  Layers
} from "lucide-react";
import { SAMPLE_IMAGES, SampleImage } from "../data/samples";
import { HistoryItem, ImageAnalysis, GeneratorConfig } from "../types";

interface UploadTabProps {
  onAddHistory: (item: Partial<HistoryItem>) => void;
  config: GeneratorConfig;
}

export default function UploadTab({ onAddHistory, config }: UploadTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [imageSizeMB, setImageSizeMB] = useState<number>(0);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Custom controls state
  const [selectedCaptionIdx, setSelectedCaptionIdx] = useState<number>(0);
  const [showYolo, setShowYolo] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isAllCopied, setIsAllCopied] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [hasAddedToHistory, setHasAddedToHistory] = useState(false);

  // Speech Synthesizer state
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // File drag & hover flags
  const [isDragging, setIsDragging] = useState(false);

  // Refs for tracking image dimensions & calculations
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Retrieve Speech voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0) {
          // Prefer premium English voices if present
          const engVoice = availableVoices.find(v => v.lang.startsWith("en-"));
          setSelectedVoice(engVoice ? engVoice.name : availableVoices[0].name);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Listen for Clipboard pasting
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Convert uploaded file to base64, validate types, calculate details
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setApiError("Unsupported file type selected. Please upload a PNG, JPG, or JPEG file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setApiError("File size exceeds 10MB limit. Please select an optimized image.");
      return;
    }

    setMimeType(file.type);
    setImageSizeMB(Number((file.size / (1024 * 1024)).toFixed(2)));
    setApiError(null);
    setAnalysis(null);
    setHasAddedToHistory(false);
    setUserNotes("");

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        triggerCaptionGeneration(event.target.result as string, file.type);
      }
    };
    reader.onerror = () => {
      setApiError("Error reading image contents on local device.");
    };
    reader.readAsDataURL(file);
  };

  // Run Real Server-Side Image Captioning using Gemini SDK!
  const triggerCaptionGeneration = async (imageBase64Str: string, currentMimeType: string) => {
    setIsProcessing(true);
    setApiError(null);
    
    try {
      const response = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64Str,
          mimeType: currentMimeType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server failed to process image content.");
      }

      const parsedResult: ImageAnalysis = await response.json();
      setAnalysis(parsedResult);
      setSelectedCaptionIdx(0); // Default to first (Salesforce BLIP)
    } catch (err: any) {
      console.error("Caption processing failed:", err);
      setApiError(err.message || "An unexpected network error occurred while contacting the processing servers.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Load Seed sample immediately to bypass upload friction
  const handleLoadSample = (sample: SampleImage) => {
    setApiError(null);
    setIsProcessing(false);
    setSelectedImage(sample.imageUrl);
    setMimeType("image/svg+xml");
    setImageSizeMB(0.12);
    setAnalysis(sample.analysis);
    setSelectedCaptionIdx(0);
    setUserNotes("");
    setHasAddedToHistory(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
    }
  };

  // Interactive Copy logic
  const handleCopyToClipboard = (text: string, isAll = false) => {
    navigator.clipboard.writeText(text);
    if (isAll) {
      setIsAllCopied(true);
      setTimeout(() => setIsAllCopied(false), 2000);
    } else {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCopyAll = () => {
    if (!analysis) return;
    const block = analysis.captions.map((c) => `[${c.modelName}] ${c.text} (Confidence: ${c.confidence}%)`).join("\n");
    handleCopyToClipboard(block, true);
  };

  // Browser SpeechSynthesis Readout Handler
  const handleSpeechOutput = () => {
    if (typeof window === "undefined" || !window.speechSynthesis || !analysis) return;

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    const textToRead = analysis.captions[selectedCaptionIdx].text;
    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Apply voice settings configured by user
    if (selectedVoice) {
      const activeVoice = voices.find(v => v.name === selectedVoice);
      if (activeVoice) utterance.voice = activeVoice;
    }
    utterance.pitch = speechPitch;
    utterance.rate = speechRate;

    utterance.onend = () => {
      setIsPlayingSpeech(false);
    };

    utterance.onerror = () => {
      setIsPlayingSpeech(false);
    };

    setIsPlayingSpeech(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop sound if tab shifts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Multi-format Downloader generators
  const triggerDownload = (format: "txt" | "json" | "report") => {
    if (!analysis || !selectedImage) return;

    let content = "";
    let fileExtension = "";
    let mime = "text/plain";

    const dateStr = new Date().toLocaleString();
    const activeCap = analysis.captions[selectedCaptionIdx];

    if (format === "txt") {
      fileExtension = "txt";
      mime = "text/plain";
      content = `==================================================\n`;
      content += `IMAGE CAPTIONING AI ANALYSIS REPORT\n`;
      content += `Generated: ${dateStr}\n`;
      content += `==================================================\n\n`;
      content += `SELECTED CAPTION (${activeCap.modelName}):\n`;
      content += `"${activeCap.text}" (Confidence: ${activeCap.confidence}%)\n\n`;
      content += `OTHER GENERATED CAPTIONS:\n`;
      analysis.captions.forEach((c) => {
        content += `- [${c.modelName}]: "${c.text}" (${c.confidence}%)\n`;
      });
      content += `\nEXPLAINABLE AI CLASSIFICATIONS:\n`;
      content += `- Detected Scene: ${analysis.explainableAi.scene}\n`;
      content += `- Activities: ${analysis.explainableAi.activities.join(", ")}\n`;
      content += `- Target Objects:\n`;
      analysis.explainableAi.objects.forEach((o) => {
        content += `  * ${o.name} (Confidence: ${o.confidence}%) - Box: [${o.box.join(", ")}]\n`;
      });
      content += `\nOCR EXTRACTED TEXT:\n`;
      content += analysis.ocrText ? `"${analysis.ocrText}"\n` : "None identified.\n";
      if (userNotes) {
        content += `\nUSER CORRECTION NOTES:\n"${userNotes}"\n`;
      }
    } else if (format === "json") {
      fileExtension = "json";
      mime = "application/json";
      content = JSON.stringify({
        timestamp: dateStr,
        selectedCaption: activeCap,
        allCaptions: analysis.captions,
        explainableAi: analysis.explainableAi,
        ocrText: analysis.ocrText,
        userNotes
      }, null, 2);
    } else if (format === "report") {
      fileExtension = "html";
      mime = "text/html";
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Caption AI Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 40px; margin: 0; }
            .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            h1 { color: #4f46e5; margin-top: 0; font-size: 24px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; }
            .caption-box { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 16px; border-radius: 12px; font-size: 18px; font-weight: 500; margin-bottom: 24px; }
            .section { margin-top: 24px; }
            .section h3 { margin-bottom: 8px; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
            .tag { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 9999px; font-size: 12px; margin-right: 6px; font-weight: 500; }
            .object-item { display: flex; justify-content: space-between; padding: 8px 12px; background: #f8fafc; margin-bottom: 4px; border-radius: 8px; font-size: 13px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Image Captioning AI Analysis</h1>
            <p style="color:#64748b; font-size:12px;">Generated on: ${dateStr}</p>
            <div class="caption-box">"${activeCap.text}"<br><span style="font-size:12px; color:#16a34a; font-weight:normal;">Active Choice - ${activeCap.modelName} (Confidence: ${activeCap.confidence}%)</span></div>
            
            <div class="section">
              <h3>Identified Scene</h3>
              <div><b>${analysis.explainableAi.scene}</b></div>
            </div>

            <div class="section">
              <h3>Detected Activities</h3>
              <div>${analysis.explainableAi.activities.map(a => `<span class="tag">${a}</span>`).join("")}</div>
            </div>

            <div class="section">
              <h3>Detected Objects (YOLOv8 Structure)</h3>
              <div>
                ${analysis.explainableAi.objects.map(o => `
                  <div class="object-item">
                    <span>${o.name}</span>
                    <span>Confidence: ${o.confidence}% (Box: [${o.box.join(",")}])</span>
                  </div>
                `).join("")}
              </div>
            </div>

            <div class="section">
              <h3>OCR Transcribed Text</h3>
              <p style="font-style:italic; background:#f1f5f9; padding:12px; border-radius:8px; margin:0; font-size:14px;">${analysis.ocrText || "No text identified in visual."}</p>
            </div>
            
            ${userNotes ? `<div class="section"><h3>User Corrections</h3><p>${userNotes}</p></div>` : ""}
          </div>
        </body>
        </html>
      `;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `caption_analysis_${Date.now()}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Push to local data storage (via server persistence API)
  const handleAddToHistoryLogs = async () => {
    if (!selectedImage || !analysis || hasAddedToHistory) return;

    try {
      const payload = {
        imageUrl: selectedImage,
        analysis: analysis,
        selectedCaption: analysis.captions[selectedCaptionIdx].text,
        notes: userNotes || undefined
      };

      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to store analysis in History database.");
      }

      const storedItem = await response.json();
      onAddHistory(storedItem);
      setHasAddedToHistory(true);
    } catch (err: any) {
      console.error(err);
      alert("Error saving record: " + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto p-4 sm:p-8 transition-all">
      
      {/* Top Section: Master Visual Stage + Sandbox Controls */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span>Image Stage Canvas</span>
          </h3>

          {/* If no image selected: Dropzone */}
          {!selectedImage && (
            <div
              id="file-dropzone-frame"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl h-80 flex flex-col items-center justify-center text-center p-6 cursor-pointer select-none transition-all ${
                isDragging
                  ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20"
                  : "border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-800"
              }`}
            >
              <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-slate-500 dark:text-slate-400 animate-bounce" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                Drag and drop your image here, or browse
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Supports PNG, JPG, JPEG. (Max size 10MB per image).
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400">
                <Clipboard className="h-3.5 w-3.5" />
                <span>Tip: You can also copy & paste image from clipboard!</span>
              </div>
            </div>
          )}

          {/* Image Canvas with YOLO Overlays */}
          {selectedImage && (
            <div className="space-y-4">
              <div id="canvas-aspect-frame" ref={imageContainerRef} className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[320px]">
                <img
                  src={selectedImage}
                  alt="Uploaded workspace"
                  className="max-h-[460px] max-w-full object-contain pointer-events-none select-none animate-fade-in"
                />

                {/* YOLO Bounding boxes simulation overlay */}
                {showYolo && analysis?.explainableAi?.objects && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                    {analysis.explainableAi.objects.map((obj, i) => {
                      const [ymin, xmin, ymax, xmax] = obj.box;
                      const colors = ['#f43f5e', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
                      const strokeColor = colors[i % colors.length];

                      return (
                        <g key={i} className="group cursor-pointer">
                          {/* SVG Box boundaries using percentages */}
                          <rect
                            x={`${xmin}%`}
                            y={`${ymin}%`}
                            width={`${xmax - xmin}%`}
                            height={`${ymax - ymin}%`}
                            fill="transparent"
                            stroke={strokeColor}
                            strokeWidth="2.5"
                            strokeDasharray="4 2"
                            className="group-hover:stroke-4 group-hover:fill-indigo-500/10 transition-all duration-150"
                          />
                          {/* Hover label tag */}
                          <foreignObject
                            x={`${xmin}%`}
                            y={`${ymin > 8 ? ymin - 8 : ymin}%`}
                            width="180"
                            height="28"
                            className="overflow-visible pointer-events-none"
                          >
                            <div
                              style={{ backgroundColor: strokeColor }}
                              className="text-[10px] text-white font-mono rounded px-1.5 py-0.5 whitespace-nowrap shadow-md inline-block transform -translate-y-full font-bold opacity-80 group-hover:opacity-100 transition-opacity"
                            >
                              {obj.name} ({obj.confidence}%)
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                )}

                {/* Loading status panel overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                    <Loader2 className="h-10 w-10 text-indigo-400 animate-spin mb-4" />
                    <h4 className="text-sm font-semibold text-white">Generating Human-Like Captions</h4>
                    <p className="text-xs text-indigo-200 mt-1 max-w-xs animate-pulse">
                      CNN Feature extraction &rarr; Transformer decoder sequence assembly (Salesforce BLIP)...
                    </p>
                  </div>
                )}
              </div>

              {/* Control utility line */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                  <button
                    id="yolo-toggle-btn"
                    disabled={!analysis}
                    onClick={() => setShowYolo(!showYolo)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold select-none transition-all active:scale-95 ${
                      showYolo && analysis
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {showYolo ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span>{showYolo ? "YOLO Bounding Boxes: ON" : "YOLO Bounding Boxes: OFF"}</span>
                  </button>
                  {imageSizeMB > 0 && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {imageSizeMB} MB // {mimeType.split("/")[1].toUpperCase()}
                    </span>
                  )}
                </div>

                <button
                  id="trigger-reclear-btn"
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysis(null);
                    if (typeof window !== "undefined" && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      setIsPlayingSpeech(false);
                    }
                  }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-95 transition-all"
                >
                  Remove Image
                </button>
              </div>
            </div>
          )}

          {/* Error notifications */}
          {apiError && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-1 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400">
              <span className="font-semibold">Generation Error</span>
              <span>{apiError}</span>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
          />
        </div>

        {/* Seed gallery picker for rapid sandbox evaluation */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Sandbox Instant Sample Library (Preseeded Analyses)</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                id={`sample-button-${sample.id}`}
                onClick={() => handleLoadSample(sample)}
                className="group flex flex-col text-left border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-800 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 active:scale-95 bg-slate-50/50 dark:bg-slate-950"
              >
                <div className="h-20 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                  <img
                    src={sample.imageUrl}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200 pointer-events-none"
                  />
                </div>
                <div className="p-2.5">
                  <h5 className="text-[11px] font-bold truncate text-slate-800 dark:text-slate-200">
                    {sample.name}
                  </h5>
                  <p className="text-[9px] text-slate-550 truncate mt-0.5">
                    {sample.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Dynamic Content and Text Analysis panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* COLUMN A: CAPTION RESULTS & AUDIO TTS CORES */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span>Generated AI Captions</span>
            </h3>
            {analysis && (
              <button
                id="copy-all-caption-btn"
                onClick={handleCopyAll}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 active:scale-95 transition-all"
              >
                {isAllCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{isAllCopied ? "Copied All!" : "Copy All Versions"}</span>
              </button>
            )}
          </div>

          {/* Loading placeholders if no analysis selected */}
          {!analysis ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-850">
                <ImageIcon className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-850 dark:text-slate-150">Awaiting Image Selection</p>
                <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 max-w-[280px] mx-auto">
                  Provide a photograph to activate the CNN feature transformer pipeline.
                </p>
              </div>

              {/* Educational info for the user */}
              <div className="w-full text-left bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Caption Capabilities</span>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-800 dark:text-slate-200">Salesforce BLIP</strong>: Captures main actions, subjects, and scenes with high semantic accuracy.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-800 dark:text-slate-200">Vision Transformer (ViT)</strong>: Deep feature extraction projections configured on the server.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.captions.map((cap, idx) => {
                const isSelected = selectedCaptionIdx === idx;
                const scoreColor = cap.confidence > 90 
                  ? "bg-emerald-500 text-emerald-700 dark:text-emerald-400" 
                  : cap.confidence > 75 
                  ? "bg-amber-500 text-amber-700 dark:text-amber-400" 
                  : "bg-rose-500 text-rose-700 dark:text-rose-400";
                
                return (
                  <div
                    key={idx}
                    id={`caption-version-card-${idx}`}
                    onClick={() => {
                      setSelectedCaptionIdx(idx);
                      if (typeof window !== "undefined" && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                        setIsPlayingSpeech(false);
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20"
                        : "border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {cap.modelName}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {/* Confidence Score badge and progress bar */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono">
                          <span>Confidence:</span>
                          <span className={`px-1.5 py-0.5 rounded ${scoreColor} bg-opacity-10 font-bold`}>
                            {cap.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-slate-800 dark:text-slate-250 leading-relaxed">
                      "{cap.text}"
                    </p>

                    {/* Score visualization progress meter */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div 
                        style={{ width: `${cap.confidence}%` }}
                        className={`h-full rounded-full ${
                          cap.confidence > 90 ? "bg-emerald-500" : cap.confidence > 75 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}

              {/* COPY AND TEXT SPEECH QUICK PANEL */}
              <div className="border-t border-slate-150 dark:border-slate-800 pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    id="speech-synthesis-play-btn"
                    onClick={handleSpeechOutput}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-semibold active:scale-98 transition-all ${
                      isPlayingSpeech
                        ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900"
                        : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isPlayingSpeech ? <VolumeX className="h-4 w-4 animate-bounce" /> : <Volume2 className="h-4 w-4" />}
                    <span>{isPlayingSpeech ? "Mute Speech Synthesis" : "🔊 Read Active (TTS)"}</span>
                  </button>

                  <button
                    id="copy-text-btn"
                    onClick={() => handleCopyToClipboard(analysis.captions[selectedCaptionIdx].text)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-[11px] active:scale-98 transition-all hover:bg-indigo-700 shadow-sm"
                  >
                    {isCopied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                    <span>{isCopied ? "Success! Copied" : "Copy Active Caption"}</span>
                  </button>
                </div>

                {/* Speech synthesis options */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-[11px]">
                  <div className="space-y-1">
                    <label className="text-slate-500 dark:text-slate-400">Voice</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1 py-0.5 text-[10px] truncate"
                    >
                      {voices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                      {voices.length === 0 && <option>Default Browser Agent</option>}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 justify-between">
                    <div className="space-y-1 w-1/2">
                      <label className="text-slate-500 dark:text-slate-400">Pitch ({speechPitch}x)</label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={speechPitch}
                        onChange={(e) => setSpeechPitch(Number(e.target.value))}
                        className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1 w-1/2">
                      <label className="text-slate-500 dark:text-slate-400">Speed ({speechRate}x)</label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(Number(e.target.value))}
                        className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUMN B: COGNITIVE INSIGHTS, OCR TEXT & ACTIONS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          
          {!analysis ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-850">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-850 dark:text-slate-150">Cognitive Vision Services</p>
                <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 max-w-[280px] mx-auto">
                  Scene classifications, OCR alphanumeric extractions, and object segmentation are pending.
                </p>
              </div>

              {/* Informative tips box */}
              <div className="w-full text-left bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Built-in Services</span>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300">YOLOv8 Bbox Coordinates</strong>: Dynamic coordinates overlays rendered live on the image above.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300">Tesseract OCR engine</strong>: Scans and aggregates structural text layers with instant clipboard copies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Scene and activities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileCode className="h-4 w-4 text-emerald-500" />
                  <span>Explainable AI Classifications</span>
                </h4>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Estimated Scene Style:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded leading-tight">
                      {analysis.explainableAi.scene}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Detected Key Activities:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.explainableAi.activities.map((act, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* OCR Segment */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <span>Tesseract-OCR Typography Reader</span>
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                  {analysis.ocrText ? (
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/40 p-2.5 rounded-lg text-center break-words selection:bg-indigo-300">
                        "{analysis.ocrText}"
                      </p>
                      <button
                        id="copy-ocr-text-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(analysis.ocrText);
                          alert("OCR Text block successfully copied to clipboard.");
                        }}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                      >
                        Copy Transcribed OCR Text block
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-2 select-none">
                      No textual layers or signboards identified.
                    </p>
                  )}
                </div>
              </div>

              {/* Save or Download Actions */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                     Correction Notes / User Annotations (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Enter manual corrections or descriptive metadata notes to bundle with this history card..."
                    className="w-full text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 justify-between items-center bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                    <Download className="h-4 w-4 text-indigo-400" />
                    <span>Report:</span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <button
                      id="download-as-txt-btn"
                      onClick={() => triggerDownload("txt")}
                      className="text-[10px] font-bold px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg active:scale-95 transition-all"
                    >
                      TXT
                    </button>
                    <button
                      id="download-as-json-btn"
                      onClick={() => triggerDownload("json")}
                      className="text-[10px] font-bold px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg active:scale-95 transition-all"
                    >
                      JSON
                    </button>
                    <button
                      id="download-as-html-btn"
                      onClick={() => triggerDownload("report")}
                      className="text-[10px] font-bold px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded-lg active:scale-95 transition-all"
                    >
                      HTML
                    </button>
                  </div>
                </div>

                <button
                  id="archive-record-btn"
                  disabled={hasAddedToHistory}
                  onClick={handleAddToHistoryLogs}
                  className={`w-full py-3 rounded-2xl font-semibold text-xs active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm ${
                    hasAddedToHistory
                      ? "bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  <BookMarked className="h-4 w-4" />
                  <span>{hasAddedToHistory ? "Record Saved & Persisted" : "Save Analysis to Caption History DB"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
