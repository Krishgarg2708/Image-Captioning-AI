import React from "react";
import { 
  Settings, 
  Cpu, 
  Sliders, 
  Layers, 
  CheckCircle2, 
  Info,
  SlidersHorizontal,
  Bookmark
} from "lucide-react";
import { GeneratorConfig } from "../types";

interface SettingsTabProps {
  config: GeneratorConfig;
  setConfig: (cfg: GeneratorConfig) => void;
}

export default function SettingsTab({ config, setConfig }: SettingsTabProps) {
  const handleToggle = (key: keyof GeneratorConfig) => {
    setConfig({
      ...config,
      [key]: !config[key],
    });
  };

  const handleSelect = (key: keyof GeneratorConfig, val: any) => {
    setConfig({
      ...config,
      [key]: val,
    });
  };

  const handleSlider = (key: keyof GeneratorConfig, val: number) => {
    setConfig({
      ...config,
      [key]: val,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto p-8">
      
      {/* Settings Grid Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-8">
        
        {/* Architectures */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold tracking-wide text-slate-400 uppercase flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-indigo-500" />
            <span>AI Backbone Architecture Option (Salesforce BLIP / ViT-GPT2)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Vision CNN-Transformer Encoder Options
              </label>
              <select
                value={config.encoderType}
                onChange={(e) => handleSelect("encoderType", e.target.value)}
                className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl"
              >
                <option value="Vision Transformer (ViT)">Vision Transformer (ViT) [Recommended]</option>
                <option value="ResNet50">ResNet50 (Deep Residual Bottleneck)</option>
                <option value="ResNet101">ResNet101 (Extra Residual Layers)</option>
                <option value="EfficientNet">EfficientNet-B4 (Compound Scaling)</option>
              </select>
              <p className="text-[10px] text-slate-455 hover:text-slate-500 font-mono">
                * Extracts image spatial features for downstream language model decoding layers.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                NLP Language Decoder Options
              </label>
              <select
                value={config.decoderType}
                onChange={(e) => handleSelect("decoderType", e.target.value)}
                className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl"
              >
                <option value="Transformer">Transformer Decoder (Self-Attention Layer) [Standard]</option>
                <option value="LSTM">LSTM Decoder (Long Short-Term Memory)</option>
                <option value="GRU">GRU Decoder (Gated Recurrent Unit)</option>
              </select>
              <p className="text-[10px] text-slate-455 hover:text-slate-500 font-mono">
                * Assembles auto-regressive text sequence output from the spatial features mapped.
              </p>
            </div>
          </div>
        </div>

        {/* Hyperparameters panel */}
        <div className="space-y-5 border-t border-slate-100 dark:border-slate-800 pt-6">
          <h4 className="text-sm font-semibold tracking-wide text-slate-400 uppercase flex items-center gap-2">
            <SlidersHorizontal className="h-4.5 w-4.5 text-indigo-500" />
            <span>Generation Hyperparameters</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Temperature</span>
                <span className="font-mono text-indigo-650 bg-indigo-50/50 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                  {config.temperature}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={config.temperature}
                onChange={(e) => handleSlider("temperature", Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-slate-400 font-medium">
                Higher temperature values increase output diversity but can lower grammatical precision.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Maximum String Length</span>
                <span className="font-mono text-indigo-650 bg-indigo-50/50 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                  {config.maxLength} tokens
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={config.maxLength}
                onChange={(e) => handleSlider("maxLength", Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-slate-400 font-medium">
                Establishes memory padding thresholds before completing decodings.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Top-K Filter Target</span>
                <span className="font-mono text-indigo-650 bg-indigo-50/50 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                  K = {config.topK}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={config.topK}
                onChange={(e) => handleSlider("topK", Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Top-P (Nucleus Sampling)</span>
                <span className="font-mono text-indigo-650 bg-indigo-50/50 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                  P = {config.topP}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={config.topP}
                onChange={(e) => handleSlider("topP", Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

          </div>
        </div>

        {/* Feature toggles */}
        <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <h4 className="text-sm font-semibold tracking-wide text-slate-400 uppercase flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-indigo-500" />
            <span>Feature Context Enhancements</span>
          </h4>

          <div className="space-y-3">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 transition-all">
              <input
                type="checkbox"
                id="ocr-toggle"
                checked={config.useOcrContext}
                onChange={() => handleToggle("useOcrContext")}
                className="accent-indigo-600 rounded h-4 w-4 mt-1"
              />
              <div className="space-y-0.5">
                <label htmlFor="ocr-toggle" className="text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer">
                  Synthesize OCR Text context with visual caption
                </label>
                <p className="text-[10px] text-slate-500">
                  When active, any textual objects transcript identified by Tesseract OCR are contextualized by the generator LLM and automatically integrated into the primary captions output.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 transition-all">
              <input
                type="checkbox"
                id="object-toggle"
                checked={config.useObjectDetectionContext}
                onChange={() => handleToggle("useObjectDetectionContext")}
                className="accent-indigo-600 rounded h-4 w-4 mt-1"
              />
              <div className="space-y-0.5">
                <label htmlFor="object-toggle" className="text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer">
                  Utilize YOLOv8 Object labels as attention matrices
                </label>
                <p className="text-[10px] text-slate-500">
                  Embeds the class names of yolo detected objects inside attention heads of the model to avoid hallucinating incorrect objects.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="p-4 bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/65 rounded-2xl text-[11px] text-indigo-800 dark:text-indigo-300 flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-indigo-500" />
          <div className="space-y-1">
            <span className="font-bold block">Hardware Acceleration and State Preservation</span>
            <span>All spatial configuration parameters, selections, and theme files are automatically stored in the client browser's local state storage to maintain coherence across dev session restarts. Dedicated cloud container clusters load configuration details dynamically.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
