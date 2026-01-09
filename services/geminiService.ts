
import { GoogleGenAI, Type } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFunnyCallout = async (name: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase curta e muito engraçada em português de Moçambique (usando gírias locais como "txillar", "mamba", "kumbu", "txé", "mambo") dizendo que o ${name} foi sorteado para pagar a próxima rodada de cerveja Laurentina ou 2M. Seja criativo e amigável.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // Accessing .text property directly as per guidelines
    return response.text || `Eish! ${name}, hoje o mamba é contigo! 🍻`;
  } catch (error) {
    console.error("Error generating message:", error);
    return `🍺 Resultado da Rodada 🍺\nHoje quem paga a rodada é: ${name}\nPrepara a carteira! 😄`;
  }
};