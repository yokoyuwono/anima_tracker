import { GoogleGenAI, Type } from "@google/genai";
import { MediaItem, MediaType, AIEnrichmentResponse, AIRecommendation } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to determine model based on complexity, though we stick to flash for speed/cost in this demo
const MODEL_NAME = 'gemini-3-flash-preview';

export const enrichMediaData = async (title: string, type: MediaType): Promise<AIEnrichmentResponse | null> => {
  if (!apiKey) return null;

  try {
    const prompt = `Berikan informasi detail untuk ${type} dengan judul "${title}". 
    Output HARUS dalam format JSON valid berisi:
    - genres: array string
    - description: deskripsi singkat (bahasa Indonesia)
    - totalEpisodesOrChapters: number (estimasi jika belum tamat)
    
    Jangan gunakan markdown formatting.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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
  if (!apiKey || userList.length === 0) return [];

  // Construct a summary of user preferences
  const favorites = userList
    .filter(i => i.rating >= 8)
    .map(i => `${i.title} (${i.type})`)
    .slice(0, 15) // Limit to top 15 to save context
    .join(", ");

  const prompt = `Berdasarkan daftar favorit pengguna ini: [${favorites}], berikan 3 rekomendasi Anime atau Manga yang mungkin mereka sukai. 
  Pastikan judulnya belum ada di daftar tersebut. 
  Output JSON array of objects with keys: title, type (Anime/Manga), reason (Indonesian), genres.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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