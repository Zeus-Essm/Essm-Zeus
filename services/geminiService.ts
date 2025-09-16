import { GoogleGenAI, Modality } from '@google/genai';
import type { Item } from '../types';

// Utility to convert data URL to base64 and get mimeType
const getBase64Parts = (dataUrl: string): { base64: string; mimeType: string } => {
  const parts = dataUrl.split(',');
  const mimeType = parts[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const base64 = parts[1];
  return { base64, mimeType };
};

export const generateTryOnImage = async (userImage: string, newItem: Item, existingItems: Item[]): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is not set. Returning original image as a placeholder.");
    return new Promise(resolve => setTimeout(() => resolve(userImage), 2000));
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const { base64, mimeType } = getBase64Parts(userImage);

    let promptText = '';
    if (existingItems.length > 0) {
        const existingItemNames = existingItems.map(i => i.name).join(', ');
        promptText = `This person is already wearing: ${existingItemNames}. Now, realistically add the following new item to their outfit, making it fit with the existing clothes: a ${newItem.name} (${newItem.description}). Superimpose the new item onto them, matching their body shape, pose, and the lighting of the photo.`;
    } else {
        promptText = `Imagine this person is trying on a piece of clothing. Superimpose the following item onto them realistically, matching their body shape, pose, and the lighting of the photo. The item is a ${newItem.name}: ${newItem.description}.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType: mimeType,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error('A IA não retornou uma imagem. Tente novamente.');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Falha ao gerar a imagem. Verifique o console para mais detalhes.');
  }
};