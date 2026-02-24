import { GoogleGenAI } from "@google/genai";
import { Dataset, AIInsight, ChatMessage, ChartConfig, ChartType } from '../types';

const MODEL_ID = 'gemini-2.5-flash';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const analyzeData = async (dataset: Dataset): Promise<AIInsight> => {
  try {
    const ai = getClient();
    const sampleSize = 30;
    const head = dataset.data.slice(0, sampleSize);
    const sampleData = JSON.stringify(head);
    const columns = dataset.columns.join(', ');

    const prompt = `
      Act as a senior data analyst. Dataset: "${dataset.name}".
      Columns: ${columns}.
      Sample Data (JSON): ${sampleData}

      Provide a JSON object with:
      1. "summary": Brief description.
      2. "trends": Array of 3 trends.
      3. "anomalies": Array of potential outliers.
      4. "recommendation": Best chart type suggestion.
      
      Return raw JSON only.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as AIInsight;
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      summary: "Analysis unavailable.",
      trends: [],
      anomalies: [],
      recommendation: "Check API configuration."
    };
  }
};

export const chatWithAI = async (
  message: string, 
  history: ChatMessage[], 
  dataset: Dataset,
  currentCharts: ChartConfig[]
): Promise<{ content: string; suggestedChart?: Partial<ChartConfig> }> => {
  try {
    const ai = getClient();
    
    // Context preparation
    const sampleSize = 20;
    const sampleData = JSON.stringify(dataset.data.slice(0, sampleSize));
    const columns = dataset.columns.join(', ');
    const existingChartsSummary = currentCharts.map(c => `${c.title} (${c.type})`).join(', ');
    
    // Format history for analysis
    const previousTurns = history.slice(-6).map(msg => 
      `${msg.role === 'user' ? 'User' : 'Model'}: ${msg.content}`
    ).join('\n');

    const systemPrompt = `
      You are Lumina, an expert data analyst assistant.
      Dataset Context:
      - Name: ${dataset.name}
      - Columns: ${columns}
      - Existing Charts: ${existingChartsSummary}
      - Sample Data: ${sampleData}

      Your Goal: Answer user questions about the data, suggest insights, and help visualize data.
      
      IMPORTANT: If the user asks to visualize data or creates a chart, you MUST include a JSON block at the END of your response with the specific schema below.
      
      Chart JSON Schema:
      \`\`\`json
      {
        "chartConfig": {
          "type": "Line" | "Bar" | "Area" | "Scatter" | "Pie",
          "xAxisKey": "column_name",
          "yAxisKey": "column_name",
          "title": "Chart Title",
          "color": "#hexcode"
        }
      }
      \`\`\`

      If no chart is needed, do not include the JSON block.
      Keep responses concise and professional. Markdown is supported.
    `;

    const fullPrompt = `${systemPrompt}\n\nConversation History:\n${previousTurns}\n\nUser: ${message}\nModel:`;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: fullPrompt
    });

    let text = response.text || "I couldn't process that request.";
    let suggestedChart: Partial<ChartConfig> | undefined;

    // Extract JSON if present
    const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.chartConfig) {
            suggestedChart = parsed.chartConfig;
            // Clean the JSON out of the text for display
            text = text.replace(jsonMatch[0], '').trim();
        }
      } catch (e) {
        console.error("Failed to parse chart config from AI");
      }
    } else {
        // Fallback: look for raw JSON at end if code block missing
        const lastBrace = text.lastIndexOf('}');
        const firstBrace = text.indexOf('{');
        if (lastBrace > firstBrace && firstBrace > -1) {
             try {
                const potentialJson = text.substring(firstBrace, lastBrace + 1);
                const parsed = JSON.parse(potentialJson);
                if (parsed.chartConfig) {
                    suggestedChart = parsed.chartConfig;
                    text = text.substring(0, firstBrace).trim();
                }
             } catch (e) { /* ignore */ }
        }
    }

    return { content: text, suggestedChart };

  } catch (error) {
    console.error("Chat Error:", error);
    return { content: "I'm having trouble connecting to the analysis engine right now." };
  }
};