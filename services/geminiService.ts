
import { GoogleGenAI, Modality, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from '@google/genai';
import type { Item } from '../types';

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
        console.warn("Model text response:", textPart.text);
        throw new Error(`A IA retornou texto em vez de imagem. Pode ter recusado o pedido.`);
    }
    throw new Error("A resposta da IA não continha uma imagem válida.");
};


export const generateTryOnImage = async (userImage: string, newItem: Item, existingItems: Item[]): Promise<string> => {
    try {
        // Initialize AI client here to ensure it picks up the latest API key from the environment/dialog
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
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
        // Initialize AI client here to ensure it picks up the latest API key from the environment/dialog
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        // Initialize AI client here to ensure it picks up the latest API key from the environment/dialog
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
        // Initialize AI client here to ensure it picks up the latest API key from the environment/dialog
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const { base64, mimeType } = getBase64Parts(compositeImage);

        // Prompt avançado para alcançar a qualidade do Gemini (Image 2)
        const proPrompt = `
            You are a professional interior designer and CGI artist.
            The input image contains a room with a decoration item roughly placed on it.
            
            **YOUR TASK:** Seamlessly integrate the decoration item into the room to create a photorealistic photo.
            
            **CRITICAL DETAILS TO FIX:**
            1.  **Perspective & Angle:** The item is currently flat. You MUST warp/tilt it to perfectly match the perspective of the wall or surface it's attached to. It should look like it was physically mounted there.
            2.  **Lighting Match:** Analyze the light sources in the room (windows, lamps). Apply the EXACT same lighting direction and color temperature to the item.
            3.  **Reflections (Material):** If the item has a frame (e.g., gold, wood) or glass, add realistic reflections from the room environment. The gold frame should gleam correctly.
            4.  **Shadows:** Add realistic contact shadows where the item meets the wall, and subtle drop shadows based on the light direction to show depth.
            5.  **Color Grading:** Match the contrast and saturation of the item to the rest of the room.
            
            **Output:** A single, high-resolution, indistinguishable-from-reality photograph.
        `;

        try {
            // Tentativa Principal: Usar o modelo PRO para máxima qualidade (perspectiva e luz corretas)
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: mimeType, data: base64 } },
                        { text: proPrompt },
                    ]
                },
                config: {
                    // Configuração para garantir que o modelo use a capacidade total de processamento de imagem
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                }
            });
            return extractImageFromResponse(response);

        } catch (proError: any) {
            console.warn("Falha no Gemini 3 Pro (provavelmente limite de cota). Usando fallback...", proError);
            
            // Fallback robusto para o modelo Flash (mais rápido, qualidade aceitável)
            const fallbackResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { mimeType: mimeType, data: base64 } },
                        { text: proPrompt }, // Usa o mesmo prompt detalhado
                    ]
                },
                config: {
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                }
            });
            return extractImageFromResponse(fallbackResponse);
        }

    } catch (error: any) {
        console.error("Error in generateDecorationImage:", error);
        throw new Error(`Falha ao decorar o ambiente. Detalhes: ${error.message}`);
    }
};
