

import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
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
        promptText = `Task: Add to Virtual Try-On. Goal: Photorealistic result. The person is already wearing: ${existingItemNames}. Now, add this new item to their outfit: '${newItem.name}: ${newItem.description}'. Key instructions: 1. **Harmonious fit**: The new item must fit realistically over or under the existing clothes, creating natural layers, folds, and interactions. 2. **Match the pose and body shape**: The item must drape naturally, respecting posture and contours. 3. **Replicate lighting and shadows**: Analyze the original photo's lighting and apply it to the new item. Ensure shadows are cast correctly between the new item, the existing items, and the person's body. 4. **Maintain perspective**: The item must align with the camera angle and perspective. 5. **Seamless integration**: Blend the new item seamlessly. The final image should look like a single, authentic photograph.`;
    } else {
        promptText = `Task: Virtual Try-On. Goal: Photorealistic result. Superimpose the following item onto the person in the image: '${newItem.name}: ${newItem.description}'. Key instructions: 1. **Match the pose and body shape**: The item must drape naturally on the person's body, respecting their posture and contours. 2. **Replicate lighting and shadows**: Carefully analyze the original photo's lighting (direction, softness, color) and apply it to the new item. Create realistic shadows cast by the item on the body and by the body on the item. 3. **Maintain perspective**: The item must align perfectly with the camera angle and perspective of the original image. 4. **Seamless integration**: Blend the new item seamlessly with the person and background. Avoid any "cut-out" or "pasted-on" look. The final image should look like a single, authentic photograph.`;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
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

    // FIX: Corrected misleading comment. The code correctly iterates through response candidates
    // to find the image data, which is the proper method for image generation models.
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