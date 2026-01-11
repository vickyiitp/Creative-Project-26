import { GoogleGenAI, Type } from "@google/genai";
import { GRID_SIZE, DEFAULT_GRID } from "../constants";
import { Grid, CellType } from "../types";

export const generateCityLayout = async (difficulty: 'easy' | 'medium' | 'hard'): Promise<Grid> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("No API Key found, using default grid.");
      return DEFAULT_GRID;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let densityPrompt = "sparse buildings";
    if (difficulty === 'medium') densityPrompt = "balanced mix of skyscrapers and small buildings";
    if (difficulty === 'hard') densityPrompt = "dense skyline with many tall skyscrapers blocking signals";

    const prompt = `
      Generate a ${GRID_SIZE}x${GRID_SIZE} city grid layout for a game.
      0 = Street (Empty)
      1 = Low Building (1 story)
      2 = High Skyscraper (Block signals)
      3 = Park (Open area)
      
      Style: ${densityPrompt}.
      Ensure there are enough streets to place towers.
      Return ONLY the 2D integer array in JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            layout: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    const grid: Grid = data.layout;

    // Validate grid dimensions
    if (grid.length !== GRID_SIZE || grid[0].length !== GRID_SIZE) {
      console.warn("AI returned invalid grid size, falling back.");
      return DEFAULT_GRID;
    }

    return grid;

  } catch (error) {
    console.error("Failed to generate city:", error);
    return DEFAULT_GRID;
  }
};
