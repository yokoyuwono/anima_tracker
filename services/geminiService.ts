import { GoogleGenAI, Type } from "@google/genai";
import { MediaItem, MediaType, AIEnrichmentResponse, AIRecommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to determine model based on complexity, though we stick to flash for speed/cost in this demo
const MODEL_NAME = 'gemini-3-flash-preview';

export const enrichMediaData = async (title: string, type: MediaType): Promise<AIEnrichmentResponse | null> => {
  if (!process.env.API_KEY) return null;

  try {
    const prompt = `Berikan informasi detail untuk ${type} dengan judul "${title}".`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            genres: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            description: { type: Type.STRING },
            totalEpisodesOrChapters: { type: Type.NUMBER },
          },
          required: ["genres", "description", "totalEpisodesOrChapters"],
        },
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AIEnrichmentResponse;
  } catch (error) {
    console.error("Gemini Enrichment Error:", error);
    return null;
  }
};

export const getRecommendations = async (userList: MediaItem[]): Promise<AIRecommendation[]> => {
  if (!process.env.API_KEY || userList.length === 0) return [];

  // Construct a summary of user preferences
  const favorites = userList
    .filter(i => i.rating >= 8)
    .map(i => `${i.title} (${i.type})`)
    .slice(0, 15) // Limit to top 15 to save context
    .join(", ");

  const prompt = `Berdasarkan daftar favorit pengguna ini: [${favorites}], berikan 3 rekomendasi Anime atau Manga yang mungkin mereka sukai. 
  Pastikan judulnya belum ada di daftar tersebut.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING },
              reason: { type: Type.STRING },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["title", "type", "reason", "genres"],
          },
        },
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as AIRecommendation[];
  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return [];
  }
};