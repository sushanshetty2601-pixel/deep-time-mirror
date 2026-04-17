import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI lazily
  let ai: GoogleGenAI | null = null;
  function getAI() {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required");
      }
      ai = new GoogleGenAI({ apiKey });
    }
    return ai;
  }

  // API Route for Gemini Mirror Data
  app.post("/api/mirror", async (req, res) => {
    try {
      const { location } = req.body;
      if (!location) {
        return res.status(400).json({ error: "Location is required" });
      }

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

      const genAI = getAI();
      const response = await genAI.models.generateContent({
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
          },
          tools: [{ googleSearch: {} }]
        }
      });

      res.json(JSON.parse(response.text || "[]"));
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
