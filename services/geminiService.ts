import { GoogleGenAI } from "@google/genai";
import { DailyChallenge, Game } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyChallenge = async (games: Game[]): Promise<DailyChallenge> => {
  try {
    const gameList = games.map(g => g.title).join(", ");
    
    const prompt = `
      Create a fun, short daily challenge for a casual gaming hub.
      Pick one game from this list: ${gameList}.
      
      Return a JSON object with these fields:
      - title: A catchy name for the challenge (e.g., "Speed Demon", "Tactical Master").
      - description: A 1-sentence instruction on what to do (e.g., "Win a match in under 2 minutes").
      - reward: A number between 50 and 200 (credits).
      - gameId: The exact name of the game chosen.

      Make it sound exciting and competitive for a group of friends on Discord.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    
    // Fallback logic to ensure we map back to an ID
    const selectedGame = games.find(g => g.title.includes(data.gameId) || data.gameId.includes(g.title)) || games[0];

    return {
      title: data.title,
      description: data.description,
      reward: data.reward,
      gameId: selectedGame.id
    };

  } catch (error) {
    console.error("Failed to generate challenge:", error);
    return {
      title: "Daily Grinder",
      description: "Play 3 games of your choice to earn bonus credits.",
      reward: 100,
      gameId: games[0].id
    };
  }
};
