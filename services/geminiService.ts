
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Category, Priority, SubTask, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const taskSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'The name of the task.' },
      priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: 'Urgency level.' },
      estimatedTime: { type: Type.STRING, description: 'Time estimate, e.g., "1 hour".' },
      category: { type: Type.STRING, enum: ['Work', 'Personal', 'Health', 'Finance', 'Other'], description: 'Task category.' },
      dueDate: { type: Type.STRING, description: 'Due date in YYYY-MM-DD format. If today is mentioned, use today\'s actual date. If a day of the week is mentioned, use the date for that upcoming day.' }
    },
    required: ['name', 'priority', 'estimatedTime', 'category']
  }
};

export async function extractTasksFromInput(input: string, imageBase64?: string): Promise<{tasks: Partial<Task>[], sources: GroundingSource[]}> {
  const model = 'gemini-3-flash-preview';
  const today = new Date().toISOString().split('T')[0];
  
  const contents: any[] = [{ 
    text: `Today's date is ${today}. Analyze input for tasks: ${input || "Analyze this image for actionable tasks."}` 
  }];
  
  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        systemInstruction: `You are LifeOS. Extract tasks. 
        IMPORTANT: Always provide the "dueDate" in YYYY-MM-DD format based on the relative time mentioned (e.g. "tomorrow", "this Friday"). 
        If no specific date is mentioned, leave it empty.
        If the user asks to "find" or "search" something, use your tools. Return JSON array of tasks.`,
        responseMimeType: "application/json",
        responseSchema: taskSchema,
        tools: [{ googleSearch: {} }, { googleMaps: {} }]
      },
    });

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
      if (chunk.maps) sources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
    });

    const jsonStr = response.text;
    if (!jsonStr) return { tasks: [], sources };
    
    const rawTasks = JSON.parse(jsonStr);
    const tasks = rawTasks.map((t: any) => ({
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      completed: false,
      createdAt: Date.now(),
      subTasks: [],
      sources: sources
    }));

    return { tasks, sources };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { tasks: [], sources: [] };
  }
}

export async function generateSubTasks(taskName: string): Promise<SubTask[]> {
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Break down: "${taskName}" into 3 actionable steps.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING } },
            required: ['name']
          }
        }
      }
    });
    const items = JSON.parse(response.text);
    return items.map((item: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: item.name,
      completed: false
    }));
  } catch (e) {
    return [];
  }
}

export async function generateVisionBoardImage(tasks: Task[]): Promise<string> {
  const priorities = tasks.filter(t => !t.completed).slice(0, 2).map(t => t.name).join(", ");
  const prompt = `A futuristic, aesthetic 16:9 4K wallpaper of a balanced life focusing on: ${priorities}. Minimalist design.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return '';
  } catch (e) {
    return '';
  }
}

export async function generateBriefing(tasks: Task[]): Promise<string> {
  const model = 'gemini-3-flash-preview';
  const taskSummary = tasks.map(t => `- ${t.name} (Due: ${t.dueDate || 'No date'})`).join('\n');
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Provide a quick morning summary of: ${taskSummary}. Keep it short and encouraging.`,
    });
    return response.text;
  } catch (error) {
    return "Summary error.";
  }
}
