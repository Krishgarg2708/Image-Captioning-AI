import React from "react";
import { 
  BookOpen, 
  Cpu, 
  Terminal, 
  FileText, 
  Folders, 
  Key, 
  ChevronRight,
  Database
} from "lucide-react";

export default function DocsTab() {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto p-8">
      
      {/* Guide Header Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-500 animate-pulse" />
            <span>Image Captioning AI System Manual</span>
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
             An in-depth review of the underlying neural algorithms, folder layout definitions, training codebases, and production deployment.
          </p>
        </div>

        {/* Directory structure diagram block */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Folders className="h-4.5 w-4.5 text-blue-500" />
            <span>Project Folder Structure</span>
          </h4>
          <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-900 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`image-captioning-ai/
├── server.ts                  # Cloud Run custom Express entrypoint + Gemini Gateway
├── package.json               # Node workspace dev modules & scripts mapping
├── metadata.json              # Applet capabilities & permissions
├── training/                  # GPU Training Module (.py scripts)
│   ├── train.py               # ViT-GPT2 trainer loop (PyTorch)
│   ├── evaluate.py            # Bleuk, CIDEr, METEOR accuracy metrics evaluator
│   └── predict.py             # CLI Inference predictor script
├── data/
│   └── history.json           # Durable local file persistent store index
└── src/                       # Frontend SPA (React + Tailwind V4.0 + Recharts)
    ├── App.tsx                # Context controller block
    ├── types.ts               # Shared Interfaces
    ├── main.tsx               # Client entrypoint mount
    └── components/            # Visual tabs controls`}
          </pre>
        </div>

        {/* AI Pipeline Architecture explanations */}
        <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-emerald-500" />
            <span>Under-The-Hood AI Model Architecture</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/60 space-y-2">
              <span className="text-[11px] font-bold text-indigo-600 uppercase font-mono tracking-wider block">
                1. Vision Encoder (ViT)
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Transforms structural image matrices into deep high-dimensional spatial embeddings, capturing geometric context, contrast lines, and objects.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/60 space-y-2">
              <span className="text-[11px] font-bold text-emerald-600 uppercase font-mono tracking-wider block">
                2. YOLOv8 & Tesseract
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Processes auxiliary text layers and parses localized boundaries with bounding coordinates to compose detailed prompt matrices.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/60 space-y-2">
              <span className="text-[11px] font-bold text-amber-600 uppercase font-mono tracking-wider block">
                3. Transformer Decoder
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Applies cross-attention vectors to synthetically construct fluent human-like caption sequences, choosing optimized dictionary vocabulary.
              </p>
            </div>
          </div>
        </div>

        {/* Quickstart deployment guides */}
        <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Terminal className="h-4.5 w-4.5 text-indigo-500" />
            <span>Local Machine Quickstart & Deployment Guidelines</span>
          </h4>

          <div className="space-y-3 font-sans text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <ChevronRight className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                <b>Configure Environment:</b> Generate a <code>.env</code> file containing your workspace credentials:
                <pre className="bg-slate-950 text-indigo-300 p-2.5 rounded-lg font-mono text-[11px] mt-1 text-left">
                  GEMINI_API_KEY="YOUR_KEY"\nAPP_URL="http://localhost:3000"
                </pre>
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <ChevronRight className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                <b>Launch local server:</b> Trigger standard dependency installation and run dev command sequences:
                <pre className="bg-slate-950 text-indigo-300 p-2.5 rounded-lg font-mono text-[11px] mt-1 text-left">
                  npm install\nnpm run dev
                </pre>
                This boots your local Express gateway with integrated Vite assets at port 3000!
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <ChevronRight className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                <b>Run Python ML scripts:</b> Launch native model training sessions directly on PyTorch CUDA nodes:
                <pre className="bg-slate-950 text-indigo-300 p-2.5 rounded-lg font-mono text-[11px] mt-1 text-left">
                  pip install torch transformers pillow nltk rouge-score\npython training/train.py --dataset flickr8k --epochs 10 --lr 5e-5 --fp16
                </pre>
              </span>
            </div>
          </div>
        </div>

        {/* Security parameters */}
        <div className="p-4 bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/60 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <Key className="h-5 w-5 shrink-0 text-amber-500" />
          <div className="space-y-1">
            <span className="font-bold block">Production-Ready API Key Security Guarantee</span>
            <span>All Gemini SDK invocations are executed exclusively in container server space. Safe environment keys are unbonded from client bundles and never exposed via client network packages.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
