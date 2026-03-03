
import { GoogleGenAI, Type } from "@google/genai";

export const generateCarouselContent = async (topic: string) => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    throw new Error("API key must be set when using the Gemini API. Please set GEMINI_API_KEY in your .env file.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `أنت خبير محتوى تسويقي ومصمم إنفوجرافيك. قم بإنشاء محتوى لكاروسيل (3 شرائح) حول الموضوع التالي: "${topic}". 
  يجب أن يكون الأسلوب مهنياً وموجهاً للجمهور السعودي بلهجة فصحى مبسطة.
  كل شريحة تحتاج إلى: عنوان رئيسي، كلمة مميزة في العنوان (يتم تلوينها بالذهبي)، عنوان فرعي، و 4 نقاط توضيحية قصيرة.
  اجعل النقاط قصيرة جداً (أقل من 5 كلمات لكل نقطة).
  اللغة: العربية.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                header: { type: Type.STRING },
                highlightedHeader: { type: Type.STRING },
                subHeader: { type: Type.STRING },
                points: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      icon: { type: Type.STRING, description: "اسم الأيقونة من: FileText, UserCheck, AlertCircle, Zap, Database, ShieldCheck" }
                    },
                    required: ["title", "icon"]
                  }
                }
              },
              required: ["header", "highlightedHeader", "subHeader", "points"]
            }
          }
        },
        required: ["slides"]
      }
    }
  });

  return JSON.parse(response.text);
};
