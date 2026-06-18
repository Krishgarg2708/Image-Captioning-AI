import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload bounds for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path for storing history data locally/persistently
const HISTORY_FILE = path.join(process.cwd(), "data", "history.json");

// Ensure data directory exists
if (!fs.existsSync(path.dirname(HISTORY_FILE))) {
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
}
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}

// Lazy initializer for Gemini client
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}

// REST API PATHS

// Retrieve full processing history
app.get("/api/history", (req, res) => {
  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    const history = JSON.parse(raw);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to read history data: " + error.message });
  }
});

// Create a history item explicitly or store a record
app.post("/api/history", (req, res) => {
  try {
    const item = req.body;
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    const history = JSON.parse(raw);
    
    const newItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...item
    };
    
    history.unshift(newItem);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    res.json(newItem);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save to history: " + error.message });
  }
});

// Delete history item
app.delete("/api/history/:id", (req, res) => {
  try {
    const { id } = req.params;
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    let history = JSON.parse(raw);
    history = history.filter((x: any) => x.id !== id);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete history item: " + error.message });
  }
});

// Clear entire history
app.delete("/api/history-clear", (req, res) => {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to clear history: " + error.message });
  }
});

// Retrieve Python script content for the training panel securely
app.get("/api/training-script/:script", (req, res) => {
  try {
    const { script } = req.params;
    if (!["train", "evaluate", "predict"].includes(script)) {
      return res.status(400).json({ error: "Invalid script name" });
    }
    const filePath = path.join(process.cwd(), "training", `${script}.py`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      res.setHeader("Content-Type", "text/plain");
      return res.send(content);
    } else {
      return res.status(404).json({ error: "Script file not found on server" });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Failed to read script file: " + error.message });
  }
});

// Process image & generate caption using Gemini LLM
app.post("/api/generate-caption", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is a required parameter." });
    }

    const ai = getGeminiClient();
    
    // Clean binary base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    };

    const promptText = `
      Analyze this image thoroughly. You represent an advanced multimodal AI captioning engine with support for CNN-Transformer, Vision-Transformer, and OCR components.
      Please output a valid JSON and ONLY a valid JSON.
      The JSON object must follow this structure EXACTLY:
      {
        "captions": [
          {
            "modelName": "Salesforce BLIP (Default)",
            "text": "A concise, grammatically correct, human-like caption of what is happening in the foreground.",
            "confidence": 92.5
          },
          {
            "modelName": "BLIP-2 (High-Fidelity)",
            "text": "A highly descriptive, context-aware, detailed caption focusing on composition, colors, and background context.",
            "confidence": 95.8
          },
          {
            "modelName": "ViT-GPT2 Image Captioner",
            "text": "A fluent, expressive, NLP-optimized caption that highlights actions and relationships.",
            "confidence": 88.2
          },
          {
            "modelName": "GIT (Generative Image-to-Text)",
            "text": "An compact, object-dense caption suitable for web indexes and visual search engines.",
            "confidence": 91.0
          },
          {
            "modelName": "OFA Multimodal Model",
            "text": "A functional caption combining identified objects, scenes, and action tokens.",
            "confidence": 86.4
          }
        ],
        "explainableAi": {
          "scene": "A brief 2-4 word classification of the setting/scene style (e.g. Indoor Gym, Cozy Cafe, Sunny Park, City Street)",
          "activities": ["List", "of", "detected", "actions/activities"],
          "objects": [
            {
              "name": "Object Name (e.g. Dog, Sofa, Coffee Cup, Laptop)",
              "box": [ymin, xmin, ymax, xmax],
              "confidence": 94.5
            }
          ]
        },
        "ocrText": "Any textual signs, typography, handwriting, posters, signboard, labels, or screen displays visible in the image. Put empty string if no letters are present."
      }

      Important details:
      - The box array inside explainableAi.objects should represent bounding box coordinates in percentage integers relative to top-left corner: [ymin, xmin, ymax, xmax] where each range from 0 to 100. Provide at least 2-5 prominent objects with their coordinates so we can draw YOLOv8 SVG bounding boxes on the frontend.
      - Ensure all fields are fully populated and realistic. Apply deep context-aware detection. 
    `;

    const textPart = { text: promptText };

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["captions", "explainableAi", "ocrText"],
          properties: {
            captions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["modelName", "text", "confidence"],
                properties: {
                  modelName: { type: Type.STRING },
                  text: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                }
              }
            },
            explainableAi: {
              type: Type.OBJECT,
              required: ["scene", "activities", "objects"],
              properties: {
                scene: { type: Type.STRING },
                activities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                objects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["name", "box", "confidence"],
                    properties: {
                      name: { type: Type.STRING },
                      box: {
                        type: Type.ARRAY,
                        items: { type: Type.NUMBER }
                      },
                      confidence: { type: Type.NUMBER }
                    }
                  }
                }
              }
            },
            ocrText: { type: Type.STRING }
          }
        }
      }
    });

    const parsedData = JSON.parse(result.text.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error generating caption via Gemini SDK:", error);
    res.status(500).json({ error: error.message || "Failed to analyze image content." });
  }
});

// Vite & Static file servers mapping
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server loaded successfully and running on port ${PORT}`);
  });
}

startServer();
