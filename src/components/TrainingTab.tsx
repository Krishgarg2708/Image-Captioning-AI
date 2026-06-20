import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  Play, 
  Square, 
  CheckCircle2, 
  Copy, 
  Check, 
  Loader2, 
  Settings2, 
  Database,
  Code2,
  TrendingDown,
  BarChart,
  FileCode,
  Zap,
  Bookmark
} from "lucide-react";
import { TrainingParams, MetricScore } from "../types";

// Seeded local copy definitions for user viewing
const CODE_TEMPLATES = {
  train: ``, // We can fetch these statically or define simple placeholders, but let's draw them elegantly using nice template literals of our physical python files created!
  evaluate: ``,
  predict: ``
};

interface TrainingTabProps {
  onNotifyCheckpoint: (name: string, epoch: number, bleu: number) => void;
}

export default function TrainingTab({ onNotifyCheckpoint }: TrainingTabProps) {
  // Config state
  const [params, setParams] = useState<TrainingParams>({
    datasetName: "Flickr8k",
    batchSize: 8,
    learningRate: 5e-5,
    epochs: 5,
    gpuPrecision: "FP16",
    saveCheckpoints: true
  });

  const [activeCodeTab, setActiveCodeTab] = useState<"train" | "evaluate" | "predict">("train");
  const [copiedCode, setCopiedCode] = useState(false);
  const [scriptContents, setScriptContents] = useState<Record<string, string>>({});
  const [isLoadingScript, setIsLoadingScript] = useState(false);

  // Fetch py scripts content from backend
  useEffect(() => {
    if (scriptContents[activeCodeTab]) return;

    const fetchScript = async () => {
      setIsLoadingScript(true);
      try {
        const response = await fetch(`/api/training-script/${activeCodeTab}`);
        if (response.ok) {
          const txt = await response.text();
          setScriptContents(prev => ({ ...prev, [activeCodeTab]: txt }));
        } else {
          setScriptContents(prev => ({ ...prev, [activeCodeTab]: `# Error fetching ${activeCodeTab}.py from server (Status: ${response.status})` }));
        }
      } catch (err: any) {
        setScriptContents(prev => ({ ...prev, [activeCodeTab]: `# Failed to load ${activeCodeTab}.py:\n# ${err.message}` }));
      } finally {
        setIsLoadingScript(false);
      }
    };

    fetchScript();
  }, [activeCodeTab, scriptContents]);

  // Training state simulator
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<MetricScore[]>([]);
  const [activeStepInEpoch, setActiveStepInEpoch] = useState<number>(0);
  const [totalStepsInEpoch] = useState(100);
  const [activeLoss, setActiveLoss] = useState<number | null>(null);
  const [activeBleu, setActiveBleu] = useState<number | null>(null);
  const [activeCider, setActiveCider] = useState<number | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Static info mappings for loaders
  const DATASET_META = {
    "MS COCO": { imgCount: "118,287", size: "18.5 GB", tokens: "42,890", license: "CC BY 4.0 (Academic/Commercial)", desc: "Standard benchmark for common objects scene captions with 5 detailed annotator phrases per image." },
    "Flickr8k": { imgCount: "8,000", size: "1.1 GB", tokens: "12,140", license: "Personal Non-Commercial Use", desc: "Compact collection of everyday sports, animal actions, and nature frames, excellent for fast training epochs." },
    "Flickr30k": { imgCount: "31,783", size: "4.3 GB", tokens: "24,500", license: "Personal Non-Commercial Use", desc: "An expansion of Flickr8k targeting human activities, street scenes, and complex multi-object captures." },
    "Conceptual Captions": { imgCount: "3,300,000", size: "380 GB (web fetched)", tokens: "155,000", license: "Google Research License", desc: "Massive scale web-scraped images with detailed alt-text semantic metadata cleaned by NLP rules." }
  };

  // Auto scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [trainingLogs]);

  // Handle active copy instructions
  const handleCopyCode = () => {
    const scriptContent = scriptContents[activeCodeTab] || `# Loading script content...`;
    navigator.clipboard.writeText(scriptContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Run training flow sequences
  const handleStartTraining = () => {
    if (isTraining) return;

    setIsTraining(true);
    setCurrentEpoch(1);
    setActiveStepInEpoch(0);
    setTrainingLogs([
      `[TIMESTAMP UTC: 2026-06-08] [SYS_INIT] Loading training execution thread...`,
      `[SYS_INFO] CUDA version 12.3 detected. Running on Nvidia A10G Cloud Tensor Core.`,
      `[DATA_LOAD] Initializing ${params.datasetName} dataset iterator...`,
      `[DATA_LOAD] Vocabulary loaded. Total unique vocabulary size: ${DATASET_META[params.datasetName].tokens} tokens.`,
      `[SYS_CONF] Learning Rate adjusted to ${params.learningRate} (Optimizer: AdamW).`,
      `[SYS_CONF] Mixed Precision FP16 Enabled: ${params.gpuPrecision === "FP16" ? "TRUE (using Amp Scaler)" : "FALSE"}`,
      `[TRAINING_START] Starting backpropagation pipeline over ${params.epochs} epochs...`
    ]);
    setMetrics([]);
    
    // Simulate steps sequentially
    runEpochCycle(1);
  };

  const runEpochCycle = (epochNum: number) => {
    if (epochNum > params.epochs) {
      setIsTraining(false);
      setTrainingLogs((prev) => [
        ...prev,
        `\n[COMPLETED] Hot weights compiled successfully!`,
        `[COMPLETED] Model exported to ./checkpoints/best_weight_checkpoint.pt`,
        `[SYS_INFO] Final validation checks complete. Training pipeline closed.`
      ]);
      return;
    }

    setCurrentEpoch(epochNum);
    setActiveStepInEpoch(0);

    // Simulated epoch step loop timer
    let step = 0;
    const initialLoss = 4.0 - (epochNum * 0.45);
    const targetLoss = 4.0 - ((epochNum + 1) * 0.45);

    timerRef.current = setInterval(() => {
      step += 10;
      setActiveStepInEpoch(step);

      // Decrement loss curves
      const stepLoss = Number((initialLoss - ((initialLoss - targetLoss) * (step / 100)) + Math.random() * 0.15).toFixed(4));
      
      setActiveLoss(stepLoss);

      setTrainingLogs((prev) => [
        ...prev,
        `[Epoch ${epochNum}/${params.epochs}] Step ${step}/100 - Categorized loss: ${stepLoss} // Speed: 284 images/sec`
      ]);

      if (step >= 100) {
        clearInterval(timerRef.current!);
        
        // Compile epoch metric evaluations
        const ciderDelta = epochNum * 1.4 + 1.2 + Math.random() * 0.5;
        const bleuDelta = 0.55 + (epochNum * 0.06) + Math.random() * 0.02;
        const meteorDelta = 0.58 + (epochNum * 0.05) + Math.random() * 0.02;
        const rougeDelta = 0.62 + (epochNum * 0.05) + Math.random() * 0.01;
        const spiceDelta = 0.15 + (epochNum * 0.08) + Math.random() * 0.01;

        const scoreItem: MetricScore = {
          epoch: epochNum,
          loss: stepLoss,
          valLoss: Number((stepLoss + 0.15 + Math.random() * 0.05).toFixed(4)),
          bleu: Number((Math.min(0.95, bleuDelta) * 100).toFixed(2)),
          cider: Number(ciderDelta.toFixed(2)),
          meteor: Number((Math.min(0.95, meteorDelta) * 100).toFixed(2)),
          rouge: Number((Math.min(0.95, rougeDelta) * 100).toFixed(2)),
          spice: Number((Math.min(0.90, spiceDelta) * 100).toFixed(2)),
        };

        setMetrics((prev) => [...prev, scoreItem]);
        setActiveBleu(scoreItem.bleu);
        setActiveCider(scoreItem.cider);

        setTrainingLogs((prev) => [
          ...prev,
          `\n--- VALIDATION METRICS EPOCH ${epochNum} ---`,
          `  | BLEU-4 Score: ${scoreItem.bleu}%`,
          `  | CIDEr Consensus Score: ${scoreItem.cider}`,
          `  | METEOR Score: ${scoreItem.meteor}%`,
          `  | ROUGE-L Score: ${scoreItem.rouge}%`,
          `  | SPICE Semantic Score: ${scoreItem.spice}%`,
          `  | State Export: model_state saved to ./checkpoints/checkpoint_epoch_${epochNum}.pt\n`
        ]);

        if (params.saveCheckpoints) {
          // Notify App layout to log a system checkpoint notification
          onNotifyCheckpoint(params.datasetName, epochNum, scoreItem.bleu);
        }

        // Delay starting next epoch
        setTimeout(() => {
          if (isTraining) {
            runEpochCycle(epochNum + 1);
          }
        }, 1500);
      }
    }, 600);
  };

  const handleStopTraining = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsTraining(false);
    setTrainingLogs((prev) => [
      ...prev,
      `[TERMINATED] Training process aborted by user. Safe-weights unbonded.`
    ]);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto p-8">
      
      {/* Top Config Layout sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Hyperparameters and dataset selections */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-amber-500" />
            <span>Hyperparameter Configuration</span>
          </h3>

          {/* Dataset chip selectors */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
               Select Training Dataset Loader
            </label>
            <div className="flex flex-col gap-2">
              {(["MS COCO", "Flickr8k", "Flickr30k", "Conceptual Captions"] as const).map((name) => {
                const isSelected = params.datasetName === name;
                return (
                  <button
                    key={name}
                    id={`dataset-chip-${name}`}
                    disabled={isTraining}
                    onClick={() => setParams({ ...params, datasetName: name })}
                    className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/5 text-amber-900 dark:text-amber-250 font-semibold"
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold block">{name}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">
                        {DATASET_META[name].desc}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-500">
                      {DATASET_META[name].imgCount} imgs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tuning Form */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-semibold block">Learning Rate</label>
                <select
                  value={params.learningRate}
                  disabled={isTraining}
                  onChange={(e) => setParams({ ...params, learningRate: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl"
                >
                  <option value={1e-5}>1e-5 (Cautious)</option>
                  <option value={5e-5}>5e-5 (Standard)</option>
                  <option value={1e-4}>1e-4 (Fast)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-semibold block">Batch Size</label>
                <select
                  value={params.batchSize}
                  disabled={isTraining}
                  onChange={(e) => setParams({ ...params, batchSize: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl"
                >
                  <option value={4}>4 (Low GPU VRAM)</option>
                  <option value={8}>8 (Default)</option>
                  <option value={16}>16 (High Throughput)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-semibold block">Total Epochs</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={params.epochs}
                  disabled={isTraining}
                  onChange={(e) => setParams({ ...params, epochs: Math.max(2, Number(e.target.value)) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-semibold block">GPU precision</label>
                <select
                  value={params.gpuPrecision}
                  disabled={isTraining}
                  onChange={(e) => setParams({ ...params, gpuPrecision: e.target.value as "FP16" | "FP32" })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl"
                >
                  <option value="FP16">Amp FP16 Mixed</option>
                  <option value="FP32">FP32 Standard</option>
                </select>
              </div>
            </div>

            {/* Checkpoints checkbox */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <input
                type="checkbox"
                id="checkpoint-check"
                checked={params.saveCheckpoints}
                disabled={isTraining}
                onChange={(e) => setParams({ ...params, saveCheckpoints: e.target.checked })}
                className="accent-amber-500 rounded"
              />
              <label htmlFor="checkpoint-check" className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                 Save PyTorch weight checkpoint (.pt) each epoch
              </label>
            </div>

            {/* Trigger buttons */}
            <div className="pt-2">
              {!isTraining ? (
                <button
                  id="start-training-btn"
                  onClick={handleStartTraining}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 font-bold text-white text-xs shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Live ML Training Simulation</span>
                </button>
              ) : (
                <button
                  id="stop-training-btn"
                  onClick={handleStopTraining}
                  className="w-full py-3 rounded-2xl bg-rose-650 hover:bg-rose-700 font-bold text-white text-xs shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Square className="h-4 w-4" />
                  <span>Abort Training Session</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right: Live Telemetry output logs and dynamic charts */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-500" />
                <span>NVIDIA CUDA Core Logs (train.py stdout)</span>
              </h3>
              {isTraining && (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Epoch {currentEpoch}/{params.epochs} (Progress: {activeStepInEpoch}%)</span>
                </div>
              )}
            </div>

            {/* Simulated terminal logs screen */}
            <div className="bg-slate-950 text-slate-300 font-mono text-[11px] p-5 h-72 rounded-2xl overflow-y-auto space-y-1 shadow-inner border border-slate-800">
              {trainingLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-20 italic">
                  == Core Ready ==<br />
                  Select parameters and click "Start Live ML Training Simulation" to stream cross-entropy gradients.
                </div>
              ) : (
                trainingLogs.map((log, index) => {
                  let color = "text-slate-300";
                  if (log.includes("[SYS_INFO]") || log.includes("[SYS_CONF]")) color = "text-blue-400";
                  if (log.includes("[TRAINING_START]") || log.includes("[COMPLETED]")) color = "text-amber-400 font-bold";
                  if (log.includes("loss:")) color = "text-slate-400";
                  if (log.includes("VALIDATION METRICS")) color = "text-emerald-400 font-bold";
                  if (log.includes("|")) color = "text-emerald-300";
                  return (
                    <div key={index} className={`${color} leading-relaxed`}>
                      {log}
                    </div>
                  );
                })
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Mini visual summary of epoch training values */}
            {metrics.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-850">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Loss reduction</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
                    {activeLoss ? activeLoss : metrics[metrics.length-1].loss}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">BLEU-4 Peak</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {activeBleu ? `${activeBleu}%` : `${metrics[metrics.length-1].bleu}%`}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">CIDEr Score</span>
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {activeCider ? activeCider : metrics[metrics.length-1].cider}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">CPUTime / Epoch</span>
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                    ~5.4s
                  </span>
                </div>
              </div>
            )}
            
          </div>

        </div>

      </div>

      {/* Code Script viewer for local files train.py, evaluate.py, predict.py */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-100 dark:border-slate-850 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold tracking-wide text-slate-450 uppercase flex items-center gap-2">
              <Code2 className="h-4.5 w-4.5 text-indigo-500" />
              <span>Production Training Script Modules (.py files)</span>
            </h3>
            <p className="text-xs text-slate-400">
               Direct copyable Python source codes deployed on Nvidia cloud GPU cluster machines.
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl gap-1">
            {(["train", "evaluate", "predict"] as const).map((tab) => (
              <button
                key={tab}
                id={`code-tab-button-${tab}`}
                onClick={() => {
                  setActiveCodeTab(tab);
                }}
                className={`text-[10px] font-mono font-bold px-3.5 py-2 rounded-xl border transition-all ${
                  activeCodeTab === tab
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 border-transparent"
                }`}
              >
                {tab}.py
              </button>
            ))}
          </div>
        </div>

        {/* Previews with full text blocks */}
        <div className="relative">
          <button
            id="copy-script-code-btn"
            onClick={handleCopyCode}
            className="absolute top-4 right-4 bg-slate-820 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-800 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 text-[11px]"
            title="Copy script code"
          >
            {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copiedCode ? "Copied script!" : "Copy Python file"}</span>
          </button>

          <pre className="bg-slate-950 border border-slate-900 text-slate-350 p-6 h-80 rounded-2xl font-mono text-[10px] overflow-auto select-text">
            {isLoadingScript && !scriptContents[activeCodeTab] ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-pulse py-12">
                <Loader2 className="h-6 w-6 animate-spin mb-2 text-indigo-400" />
                <span>Streaming training script from server...</span>
              </div>
            ) : (
              <code>{scriptContents[activeCodeTab] || `# Ready to read ${activeCodeTab}.py module`}</code>
            )}
          </pre>
          <div className="mt-3 text-center text-[10px] text-slate-400 font-mono">
            * Note: These are fully functional deployment files saved in your local workspace sandbox folder system.
          </div>
        </div>

      </div>

    </div>
  );
}
