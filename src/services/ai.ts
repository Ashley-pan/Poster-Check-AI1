import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getAI = () => {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
};

export const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER },
    status: { type: Type.STRING, description: "通过 (Pass), 待改进 (Needs Improvement), 或 不通过 (Fail)" },
    metrics: {
      type: Type.OBJECT,
      properties: {
        functionality: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            details: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "对比度, 层级, 版权等" },
                  description: { type: Type.STRING },
                  x: { type: Type.NUMBER, description: "0-100 百分比" },
                  y: { type: Type.NUMBER, description: "0-100 百分比" },
                  width: { type: Type.NUMBER },
                  height: { type: Type.NUMBER }
                }
              }
            }
          }
        },
        alignment: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            details: { type: Type.STRING }
          }
        },
        harmony: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            details: { type: Type.STRING }
          }
        }
      }
    },
    heatmapPoints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER },
          intensity: { type: Type.NUMBER, description: "0-1 强度" }
        }
      }
    },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          actionable: { type: Type.STRING }
        }
      }
    },
    optimizationPrompt: { type: Type.STRING, description: "用于生成优化版海报的详细提示词" }
  },
  required: ["overallScore", "status", "metrics", "heatmapPoints", "suggestions", "optimizationPrompt"]
};
