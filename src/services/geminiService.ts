import { Type } from "@google/genai";

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
  const response = await fetch('/api/mirror', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch mirror data');
  }

  return response.json();
}

export async function generateVisual(prompt: string): Promise<string> {
  // Since Gemini generateContent doesn't natively return image data in the response body 
  // without a specific image-gen model (like Imagen), we use a high-quality 
  // placeholder service with the prompt as a seed for consistent thematic visuals.
  const seed = encodeURIComponent(prompt.substring(0, 100));
  return `https://picsum.photos/seed/${seed}/1920/1080`;
}
