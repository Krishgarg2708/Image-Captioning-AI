export interface Caption {
  modelName: string;
  text: string;
  confidence: number;
}

export interface DetectedObject {
  name: string;
  box: number[]; // [ymin, xmin, ymax, xmax] relative percentage (0 to 100)
  confidence: number;
}

export interface ExplainableAI {
  scene: string;
  activities: string[];
  objects: DetectedObject[];
}

export interface ImageAnalysis {
  captions: Caption[];
  explainableAi: ExplainableAI;
  ocrText: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  imageUrl: string; // Base64 data URL
  analysis: ImageAnalysis;
  selectedCaption?: string;
  notes?: string;
}

export interface GeneratorConfig {
  defaultModel: string;
  encoderType: "ResNet50" | "ResNet101" | "EfficientNet" | "Vision Transformer (ViT)";
  decoderType: "LSTM" | "GRU" | "Transformer";
  temperature: number;
  topK: number;
  topP: number;
  maxLength: number;
  useOcrContext: boolean;
  useObjectDetectionContext: boolean;
  isMixedPrecision: boolean;
}

export interface TrainingParams {
  datasetName: "MS COCO" | "Flickr8k" | "Flickr30k" | "Conceptual Captions";
  batchSize: number;
  learningRate: number;
  epochs: number;
  gpuPrecision: "FP16" | "FP32";
  saveCheckpoints: boolean;
}

export interface MetricScore {
  epoch: number;
  loss: number;
  valLoss: number;
  bleu: number;
  cider: number;
  meteor: number;
  rouge: number;
  spice: number;
}
