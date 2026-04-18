import { GoogleGenAI, Type } from "@google/genai";

// 1. Get the raw keys from the environment
const manualKey = (process.env as any).GEMINI_API_KEY_;
const standardKey = process.env.GEMINI_API_KEY;

// 2. Clean and prioritize: Use the manual key if it looks like a real key, otherwise fallback
const rawKey = (manualKey && manualKey.startsWith('AIza')) ? manualKey : standardKey;
const apiKey = rawKey ? rawKey.trim() : "";

const ai = new GoogleGenAI({ apiKey });

export type TimePeriod = 'PAST' | 'PRESENT' | 'FUTURE';

export interface EnvironmentalInsight {
  period: TimePeriod;
  title: string;
  narrative: string;
  keySpecies: string[];
  climateStats: {
    label: string;
    value: string;
  }[];
  recentEvents?: {
    timeframe: string;
    description: string;
  }[];
  visualPrompt: string;
  restorationGoal?: string;
}

export async function fetchMirrorData(location: string): Promise<EnvironmentalInsight[]> {
  const prompt = `
    Analyze the environmental and ecological history and future of this location: ${location}.
    Provide a detailed perspective for three distinct time periods:
    1. THE DEEP PAST (approx. 10,000 BCE): Focus on the untouched ecosystem.
    2. THE PRESENT (Today): Focus on urban impact and climate challenges.
    3. THE RESTORED FUTURE (approx. 2100 CE): Focus on a successful "Solar-punk" restoration.

    ADDITIONALLY, for the PRESENT period, include a "Recent Pulse" section:
    - Something that changed or was observed 1 day ago (e.g., local air quality, a specific bird sighting, or weather pattern).
    - Something that happened 1 week ago (e.g., a local conservation update or a seasonal shift).
    
    For each main period, provide:
    - A evocative title.
    - A long, immersive, and highly detailed narrative (3-4 paragraphs, approx 400-500 words). 
      - The narrative should explore the specific flora, fauna, atmospheric conditions, and the human relationship with the land in great depth.
      - Use evocative, sensory language to make the reader feel present in that era.
    - 3-4 key species.
    - 2-3 specific climate/ecological stats.
    - For the future, a "restorationGoal".
    - A very detailed "visualPrompt" for an AI image generator. 
      - PAST: Should be cinematic, primeval, lush ancient version of the location with extinct species.
      - PRESENT: Gritty, urbanized, or climate-impacted version of the current location.
      - FUTURE: Solar-punk, green, architecture integrated with nature, clean energy, vibrant.

    Format as a JSON array where each object has fields: period, title, narrative, keySpecies, climateStats, restorationGoal (optional), visualPrompt, and for the CURRENT period, a recentEvents array with { timeframe, description }.
  `;

  if (!apiKey || apiKey === "AI Studio Free Tier") {
    throw new Error("Missing or invalid API key. Please ensure GEMINI_API_KEY is correctly set in your Secrets and then click 'Apply Changes' and 'Deploy'.");
  }

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            period: { type: Type.STRING, enum: ['PAST', 'PRESENT', 'FUTURE'] },
            title: { type: Type.STRING },
            narrative: { type: Type.STRING },
            keySpecies: { type: Type.ARRAY, items: { type: Type.STRING } },
            climateStats: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING }
                },
                required: ['label', 'value']
              }
            },
            restorationGoal: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
            recentEvents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeframe: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['timeframe', 'description']
              }
            }
          },
          required: ['period', 'title', 'narrative', 'keySpecies', 'climateStats', 'visualPrompt']
        }
      }
    }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    // If it's a quote error, let it throw to the UI
    if (response && (response as any).error) throw new Error(JSON.stringify((response as any).error));
    return [];
  }
}

export async function generateVisual(prompt: string): Promise<string> {
  // Since Gemini generateContent doesn't natively return image data in the response body 
  // without a specific image-gen model (like Imagen), we use a high-quality 
  // placeholder service with the prompt as a seed for consistent thematic visuals.
  const seed = encodeURIComponent(prompt.substring(0, 100));
  return `https://picsum.photos/seed/${seed}/1920/1080`;
}
