import { ImageAnalysis } from "../types";

export interface SampleImage {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // Base64 or Data URI
  analysis: ImageAnalysis;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: "sample_dog_park",
    name: "Golden Retriever with Ball",
    description: "A joyful canine playing in a sunny grassy field.",
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23e2f0d9'/><circle cx='300' cy='200' r='120' fill='%23fce4d6'/><circle cx='420' cy='180' r='30' fill='%23ffc000'/><rect x='0' y='300' width='600' height='100' fill='%23c6e0b4'/><text x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23385723' font-weight='bold'>Sunny Dog Park (Sample)</text><text x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23548235'>Hover over boxes to trigger YOLO-v8 detection</text></svg>",
    analysis: {
      captions: [
        { modelName: "Salesforce BLIP (Default)", text: "A playful golden retriever holding a small yellow tennis ball on a grassy lawn.", confidence: 97.4 },
        { modelName: "BLIP-2 (High-Fidelity)", text: "A bright close-up shot of an energetic dog standing on green grass with a toy under the vibrant sunlight.", confidence: 98.1 },
        { modelName: "ViT-GPT2 Image Captioner", text: "A happy retriever canine playing in a grassy park setting during the daytime.", confidence: 91.2 },
        { modelName: "GIT (Generative Image-to-Text)", text: "Dog with yellow ball in mouth on green grass.", confidence: 93.5 },
        { modelName: "OFA Multimodal Model", text: "A young playful golden retriever, grassy lawn, yellow ball, outdoor sunny scene.", confidence: 88.9 }
      ],
      explainableAi: {
        scene: "Sunny Public Park",
        activities: ["Playing Fetch", "Running", "Panting"],
        objects: [
          { name: "Golden Retriever (Dog)", box: [15, 20, 85, 75], confidence: 98.4 },
          { name: "Tennis Ball", box: [35, 65, 50, 78], confidence: 99.2 },
          { name: "Grassy Park", box: [70, 0, 100, 100], confidence: 94.0 }
        ]
      },
      ocrText: "PARK REGULATIONS: LEAD REQUIREMENT IN EFFECT"
    }
  },
  {
    id: "sample_cozy_cafe",
    name: "Cozy Study Desk",
    description: "A dark wooden workspace with a steaming coffee cup and laptop.",
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23fceddb'/><rect x='100' y='120' width='320' height='200' fill='%231f2937' rx='8'/><circle cx='480' cy='260' r='45' fill='%23fff' stroke='%23d97706' stroke-width='4'/><path d='M470 215 Q460 200 470 190 T470 170 M485 215 Q475 200 485 190 T485 170 M500 215 Q490 200 500 190 T500 170' fill='none' stroke='%23a1a1aa' stroke-width='3'/><text x='50%25' y='92%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%237c2d12' font-weight='bold'>Workspace Cafe (Sample)</text></svg>",
    analysis: {
      captions: [
        { modelName: "Salesforce BLIP (Default)", text: "A modern workspace setting with a silver laptop screen on and a warm mug of steaming latte coffee nearby.", confidence: 96.1 },
        { modelName: "BLIP-2 (High-Fidelity)", text: "A sleek workspace displaying an open laptop computer adjacent to a porcelain cup with latte art on a rustic wooden table.", confidence: 97.4 },
        { modelName: "ViT-GPT2 Image Captioner", text: "An elegant workstation containing an laptop device and coffee morning cup in a quiet room setting.", confidence: 89.6 },
        { modelName: "GIT (Generative Image-to-Text)", text: "Laptop and warm coffee cup flat lay on dark desk.", confidence: 92.0 },
        { modelName: "OFA Multimodal Model", text: "Productive setup with open computer notebook, ceramic hot beverage, ambient table.", confidence: 84.7 }
      ],
      explainableAi: {
        scene: "Quiet Workspace Cafe",
        activities: ["Remote Working", "Drinking Coffee", "Software Development"],
        objects: [
          { name: "MacBook Pro (Laptop)", box: [30, 15, 80, 70], confidence: 97.8 },
          { name: "Coffee Cup (Latte)", box: [45, 70, 85, 95], confidence: 98.9 },
          { name: "Wooden Table Desk", box: [65, 0, 100, 100], confidence: 96.3 }
        ]
      },
      ocrText: "DESIGN IDEAS 2026 // COFFEE & CODE"
    }
  },
  {
    id: "sample_city_crosswalk",
    name: "Crowded City Crosswalk",
    description: "Pedestrians walking along a busy metropolitan road under tall buildings.",
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23d1d5db'/><rect x='80' y='50' width='80' height='300' fill='%234b5563'/><rect x='220' y='50' width='80' height='300' fill='%234b5563'/><rect x='360' y='50' width='80' height='300' fill='%234b5563'/><path d='M10 280 L590 280' stroke='white' stroke-width='16' stroke-dasharray='30 20'/><circle cx='180' cy='220' r='25' fill='%23f43f5e'/><circle cx='380' cy='200' r='22' fill='%230ea5e9'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23111827' font-weight='bold'>Shibuya Crosswalk (Sample)</text></svg>",
    analysis: {
      captions: [
        { modelName: "Salesforce BLIP (Default)", text: "A multitude of urban pedestrians crossing a wide city street on a painted zebra walk during daytime.", confidence: 94.8 },
        { modelName: "BLIP-2 (High-Fidelity)", text: "Packs of people carrying bags and umbrellas walking down a highly crowded asphalt crosswalk between tall commercial high-rises.", confidence: 96.2 },
        { modelName: "ViT-GPT2 Image Captioner", text: "Many walking pedestrians navigating a busy metropolitan boulevard with crosswalk elements.", confidence: 90.5 },
        { modelName: "GIT (Generative Image-to-Text)", text: "Urban crowds on zebra walk crossing city road.", confidence: 91.8 },
        { modelName: "OFA Multimodal Model", text: "Commuters crossing a metropolitan street, outdoor street scenes, skyline blocks.", confidence: 85.1 }
      ],
      explainableAi: {
        scene: "Busy Midtown Crosswalk",
        activities: ["Walking", "Crossing Street", "Commuting"],
        objects: [
          { name: "Pedestrian Person 1", box: [40, 20, 95, 45], confidence: 94.5 },
          { name: "Pedestrian Person 2", box: [35, 55, 90, 75], confidence: 92.1 },
          { name: "Crosswalk (Zebra Lines)", box: [65, 0, 100, 100], confidence: 98.7 },
          { name: "Tall Skyscrapers", box: [5, 5, 60, 40], confidence: 89.4 }
        ]
      },
      ocrText: "ONE WAY // WALK SIGN ACTIVE // SONY BROADCASTING"
    }
  },
  {
    id: "sample_bookshelf",
    name: "Aged Library Bookshelf",
    description: "Classic old bound leather books aligned neatly in a warm wooden case.",
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%2378350f'/><rect x='20' y='40' width='80' height='320' fill='%23b45309' rx='4'/><rect x='110' y='60' width='70' height='300' fill='%239e2a2b' rx='4'/><rect x='190' y='20' width='90' height='340' fill='%23457b9d' rx='4'/><rect x='290' y='80' width='75' height='280' fill='%233a5a40' rx='4'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='24' fill='%23fef3c7' font-weight='bold'>Historic Archives (Sample)</text></svg>",
    analysis: {
      captions: [
        { modelName: "Salesforce BLIP (Default)", text: "A close-up of dynamic antique books in leather binding arranged neatly on shelves in a vintage library room.", confidence: 95.7 },
        { modelName: "BLIP-2 (High-Fidelity)", text: "Rows of highly detailed old books with gold-embossed spines standing stacked inside a dark mahogany bookshelf.", confidence: 97.0 },
        { modelName: "ViT-GPT2 Image Captioner", text: "Detailed antique volume books on vintage library shelves.", confidence: 91.5 },
        { modelName: "GIT (Generative Image-to-Text)", text: "Gold letter ancient book spines on dark wood shelf.", confidence: 93.1 },
        { modelName: "OFA Multimodal Model", text: "Close shot of hardcover literature volumes in rustic cabinet.", confidence: 86.8 }
      ],
      explainableAi: {
        scene: "Vintage Antique Library",
        activities: ["Archiving", "Classifying Books", "Studying"],
        objects: [
          { name: "Leatherbound Book (Brown)", box: [10, 5, 90, 20], confidence: 98.2 },
          { name: "Antique Book (Crimson)", box: [15, 22, 90, 42], confidence: 96.9 },
          { name: "Historical Volume (Blue)", box: [5, 45, 90, 68], confidence: 97.4 },
          { name: "Mahogany Shelf", box: [0, 0, 100, 100], confidence: 99.1 }
        ]
      },
      ocrText: "VOL. II // ENCYCLOPEDIA OF NATURAL PHILOSOPHY // MDCCCXLVI (1846)"
    }
  }
];
