
import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
import type { Item } from '../types';

// The Google GenAI client is initialized here.
// As per the guidelines, it securely uses the API_KEY from the environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utility to convert a data URL string into its base64 and mimeType parts.
const getBase64Parts = (dataUrl: string): { base64: string; mimeType: string } => {
  const parts = dataUrl.split(',');
  const mimeType = parts[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const base64 = parts[1];
  return { base64, mimeType };
};

// Fetches an image from a URL and converts it into a data URL (base64 encoded string).
const imageUrlToDataUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
        // Fallback to proxy if direct fetch fails (CORS)
        console.warn(`Direct fetch failed for ${url}, trying CORS proxy.`);
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);
        if (!proxyResponse.ok) {
            throw new Error(`Falha na rede ao buscar a imagem via proxy: ${proxyResponse.status} ${proxyResponse.statusText}`);
        }
        const blob = await proxyResponse.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(blob);
        });
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Erro ao converter a URL da imagem (${url}):`, error);
    throw new Error('Não foi possível carregar a imagem do item. Pode ser um problema de conexão ou o link da imagem está quebrado.');
  }
};

/**
 * Normalizes the image to a square aspect ratio (1:1) by adding black bars.
 * This is crucial for consistent results from the image generation model.
 */
export const normalizeImageAspectRatio = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const size = Math.max(img.width, img.height);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Não foi possível obter o contexto do canvas.'));
            }
            // Fill background with black
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, size, size);

            // Center the image
            const x = (size - img.width) / 2;
            const y = (size - img.height) / 2;
            ctx.drawImage(img, x, y);

            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = () => reject(new Error('Falha ao carregar a imagem para normalização.'));
        img.src = dataUrl;
    });
};

const extractImageFromResponse = (response: GenerateContentResponse): string => {
    if (!response.candidates || response.candidates.length === 0) {
        throw new Error("A IA não retornou candidatos válidos.");
    }
    const candidate = response.candidates[0];
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    // Check for text part which might contain an error from the model
    const textPart = candidate.content.parts.find(part => part.text);
    if (textPart && textPart.text) {
        throw new Error(`A IA retornou uma mensagem em vez de uma imagem: "${textPart.text}"`);
    }
    throw new Error("A resposta da IA não continha uma imagem válida.");
};


export const generateTryOnImage = async (userImage: string, newItem: Item, existingItems: Item[]): Promise<string> => {
    try {
        const itemImage = await imageUrlToDataUrl(newItem.image);
        const { base64: userBase64, mimeType: userMime } = getBase64Parts(userImage);
        const { base64: itemBase64, mimeType: itemMime } = getBase64Parts(itemImage);

        const prompt = `
            Take the user's image and realistically place the clothing item on them.
            - The user is wearing: ${existingItems.map(i => i.name).join(', ') || 'their original clothes'}.
            - The new item to add is: a ${newItem.name}.
            - The output should be a photorealistic image of the person wearing all the items, including the new one.
            - Maintain the original background and the person's pose and appearance.
            - Ensure the new clothing item fits naturally, with correct lighting, shadows, and perspective.
            - Do NOT change the person's face or body.
            - The final image should be the same size and aspect ratio as the original user image.
            - Do not include any text, logos, or watermarks in the output image.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: userMime, data: userBase64 } },
                    { inlineData: { mimeType: itemMime, data: itemBase64 } },
                    { text: prompt },
                ]
            },
        });

        return extractImageFromResponse(response);

    } catch (error: any) {
        console.error("Error in generateTryOnImage:", error);
        throw new Error(`Falha ao gerar o look. Detalhes: ${error.message}`);
    }
};

export const generateBeautyTryOnImage = async (userImage: string, newItem: Item): Promise<string> => {
     try {
        const { base64: userBase64, mimeType: userMime } = getBase64Parts(userImage);

        let prompt = '';
        switch(newItem.beautyType) {
            case 'lipstick':
                prompt = `Apply this lipstick color to the person's lips in the image. The product is named '${newItem.name}'. Maintain the person's original face and expression. The result should be photorealistic. Do not add any text.`;
                break;
            case 'wig':
                prompt = `Replace the hair of the person in the image with this wig, named '${newItem.name}'. The fit should be natural and realistic, matching the lighting and head angle. Do not change the person's face. Do not add any text.`;
                break;
            case 'eyeshadow':
            default:
                prompt = `Apply this makeup style, named '${newItem.name}', to the person's face in the image. Focus on eyes, but include complementary blush and lip color if appropriate for the style. The result should be photorealistic and blend naturally with the person's features. Do not change their face shape. Do not add any text.`;
                break;
        }
        
        const itemImage = await imageUrlToDataUrl(newItem.image);
        const { base64: itemBase64, mimeType: itemMime } = getBase64Parts(itemImage);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: userMime, data: userBase64 } },
                    { inlineData: { mimeType: itemMime, data: itemBase64 } },
                    { text: prompt },
                ]
            },
        });

        return extractImageFromResponse(response);

    } catch (error: any) {
        console.error("Error in generateBeautyTryOnImage:", error);
        throw new Error(`Falha ao aplicar o item de beleza. Detalhes: ${error.message}`);
    }
};

export const generateFashionVideo = async (
    generatedImage: string,
    onProgress: (message: string) => void
): Promise<string> => {
    try {
        onProgress("Preparando para criar seu vídeo...");
        const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const { base64, mimeType } = getBase64Parts(generatedImage);

        onProgress("Enviando solicitação para o modelo de vídeo...");
        let operation = await veoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: 'A short, stylish video of this person showing off their fashion look. The camera moves slightly, like a professional fashion shoot. The background should remain consistent with the input image.',
            image: {
                imageBytes: base64,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16'
            }
        });

        onProgress("Seu vídeo está sendo gerado. Isso pode levar alguns minutos...");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            onProgress("Verificando o progresso da geração do vídeo...");
            operation = await veoAi.operations.getVideosOperation({ operation: operation });
        }

        onProgress("Vídeo gerado! Fazendo o download...");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("O link de download do vídeo não foi encontrado na resposta.");
        }
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Falha ao baixar o vídeo: ${response.statusText}`);
        }

        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        onProgress("Download concluído!");
        return videoUrl;

    } catch (error: any) {
        console.error("Error in generateFashionVideo:", error);
        throw error;
    }
};

export const generateDecorationImage = async (compositeImage: string): Promise<string> => {
    try {
        const { base64, mimeType } = getBase64Parts(compositeImage);

        // Prompt otimizado para o modelo Gemini 3 Pro Image Preview
        // Focado em realismo extremo e correção de iluminação/perspectiva
        const prompt = `
            You are a professional interior design visualizer. 
            The input image is a composite showing a piece of furniture placed in a room. 
            Your task is to render this into a single, cohesive, high-quality photorealistic image.
            
            Instructions:
            1.  **Analyze Lighting:** Identify the direction, intensity, and temperature of the light sources in the room. Apply this lighting to the furniture item so it matches perfectly.
            2.  **Cast Shadows:** Create realistic drop shadows and contact shadows where the furniture meets the floor/wall, matching the room's lighting logic.
            3.  **Refine Perspective:** Ensure the furniture's perspective lines align perfectly with the room's geometry and vanishing points.
            4.  **Blend Edges:** Eliminate any "cut-out" artifacts. The furniture should look like it physically belongs in the space.
            5.  **Maintain Background:** Do NOT alter the room's existing details or structure significantly. Focus on the integration of the new item.
            6.  **High Quality:** The final output must be crisp, clear, and indistinguishable from a real photo.
        `;
        
        // Use Gemini 3 Pro Image Preview for superior quality and interpretation
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64 } },
                    { text: prompt },
                ]
            },
            config: {
                imageConfig: {
                    imageSize: "2K", // High resolution output
                    aspectRatio: "1:1"
                }
            }
        });
        
        return extractImageFromResponse(response);

    } catch (error: any) {
        console.error("Error in generateDecorationImage:", error);
        throw new Error(`Falha ao decorar o ambiente. Detalhes: ${error.message}`);
    }
};
