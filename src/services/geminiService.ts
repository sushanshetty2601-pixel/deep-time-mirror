import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    ADDITIONALLY, for the PRESENT period, include a "Recent Pulse" section...
    
    For each main period, provide:
    - A evocative title.
    - A narrative description.
    - 3-4 key species.
    - 2-3 specific climate/ecological stats.
    - For the future, a "restorationGoal".
    - A very detailed "visualPrompt" for an AI image generator. 
      - PAST: Should be cinematic, primeval, lush ancient version of the location with extinct species.
      - PRESENT: Gritty, urbanized, or climate-impacted version of the current location.
      - FUTURE: Solar-punk, green, architecture integrated with nature, clean energy, vibrant.

    Format as a JSON array where each object has fields: period, title, narrative, keySpecies, climateStats, restorationGoal (optional), visualPrompt, and for the CURRENT period, a recentEvents array with { timeframe, description }.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
            visualPrompt: { type: Type.STRING }
          },
          required: ['period', 'title', 'narrative', 'keySpecies', 'climateStats', 'visualPrompt']
        }
      },
      tools: [{ googleSearch: {} }]
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}

export async function generateVisual(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `Cinematic 3D render, highly detailed, photorealistic, environmental art: ${prompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data in response");
  } catch (err) {
    console.error("Failed to generate visual", err);
    // Fallback to a themed placeholder if generation fails
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1920/1080`;
  }
}
