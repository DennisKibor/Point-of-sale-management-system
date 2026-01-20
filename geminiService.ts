
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Sale, AIInsight, StockPrediction } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (sales: Sale[], products: Product[]): Promise<AIInsight[]> => {
  const prompt = `Analyze this POS data and return 3-4 key business insights as a JSON array.
  Sales: ${JSON.stringify(sales.slice(-20))}
  Inventory: ${JSON.stringify(products)}
  
  Each insight must have:
  - title (string)
  - description (string)
  - impact ('positive' | 'negative' | 'neutral')
  - recommendation (string)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              impact: { type: Type.STRING },
              recommendation: { type: Type.STRING },
            },
            required: ["title", "description", "impact", "recommendation"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Insight error:", error);
    return [];
  }
};

export const getStockPredictions = async (products: Product[]): Promise<StockPrediction[]> => {
  const prompt = `Analyze this inventory and predict low-stock issues. Return a JSON array.
  Inventory: ${JSON.stringify(products)}
  
  Include fields:
  - productId
  - productName
  - currentStock
  - predictedDaysLeft (estimate)
  - status ('critical' | 'warning' | 'safe')`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productId: { type: Type.STRING },
              productName: { type: Type.STRING },
              currentStock: { type: Type.NUMBER },
              predictedDaysLeft: { type: Type.NUMBER },
              status: { type: Type.STRING },
            },
            required: ["productId", "productName", "currentStock", "predictedDaysLeft", "status"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Prediction error:", error);
    return [];
  }
};

export const chatWithPOS = async (query: string, sales: Sale[], products: Product[]) => {
  const context = `Context: You are an AI business advisor for a POS system. 
  Current Products: ${JSON.stringify(products)}
  Recent Sales Summary: Total ${sales.length} transactions, Last sale: ${sales[sales.length-1]?.timestamp || 'N/A'}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${context}\n\nUser Question: ${query}`,
  });

  return response.text;
};
