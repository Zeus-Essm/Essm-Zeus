
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
 * Updated: Now returns the original image to avoid black bars as requested.
 */
export const normalizeImageAspectRatio = async (dataUrl: string): Promise<string> => {
    return dataUrl; // Mantém a imagem original sem adicionar barras pretas
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

        // Detectar se é um vestido de noiva ou roupa formal para aplicar regras mais estritas
        const isWeddingDress = newItem.category.includes('noivas') || newItem.name.toLowerCase().includes('noiva') || newItem.category.includes('vestido');

        let specificInstructions = "";
        
        if (isWeddingDress) {
            specificInstructions = `
                **CRITICAL INSTRUCTION FOR WEDDING DRESS/GOWN:**
                - The item is a WEDDING DRESS. It MUST completely replace the user's current outfit from the neck down.
                - Do NOT blend the dress with existing clothes. The existing clothes must be gone.
                - Pay extreme attention to the fabric texture (lace, satin, tulle, white/ivory color) and the skirt volume.
                - Ensure the dress fits the waist and bust line naturally based on the user's pose.
                - If the dress has a long skirt or train, render it naturally draping towards the floor/bottom of the frame.
                - Keep the user's arms and shoulders visible/bare if the dress design is sleeveless/strapless.
                - The look must be elegant, premium, and photorealistic.
            `;
        }

        const prompt = `
            Act as a professional virtual try-on AI.
            Your task is to realistically generate an image of the user wearing the new clothing item.

            - **User:** The person in the first image.
            - **Clothing Item:** The product in the second image (${newItem.name}).
            - **Context:** ${existingItems.length > 0 ? `The user is already wearing: ${existingItems.map(i => i.name).join(', ')}.` : 'The user is wearing their original clothes.'}

            **EXECUTION RULES:**
            1. **Replacement:** Seamlessly overlay/swap the user's current clothes with the [Clothing Item].
            2. **Fit & Physics:** Ensure the clothing folds, shadows, and fit are realistic for the user's body pose.
            3. **Preservation:** You MUST preserve the user's face, hair, head shape, and the original background exactly as they are. Only change the clothing.
            4. **Lighting:** Match the lighting of the clothing to the user's environment.
            
            ${specificInstructions}

            **Output:** A high-quality photorealistic image of the user wearing the new item. No text, no watermarks.
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

/**
 * Removes the background of an image using AI.
 */
export const removeImageBackground = async (imageDataUrl: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const { base64, mimeType } = getBase64Parts(imageDataUrl);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64 } },
                    { text: "Remove the background of this image. The subject should remain exactly as it is, but on a clean, solid pure white background. No other changes." },
                ]
            },
        });

        return extractImageFromResponse(response);
    } catch (error: any) {
        console.error("Error in removeImageBackground:", error);
        throw new Error(`Falha ao remover fundo: ${error.message}`);
    }
};

/**
 * Generates a high-quality product image from a title and description.
 */
export const generateProductImage = async (title: string, description: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
            Generate a high-end, professional commercial product photograph.
            Product: ${title}
            Description: ${description}
            Style: Minimalist, soft professional studio lighting, clean white background, 8k resolution.
            The product should be perfectly focused and look premium.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            }
        });

        return extractImageFromResponse(response);
    } catch (error: any) {
        console.error("Error in generateProductImage:", error);
        throw new Error(`Falha ao gerar imagem do produto: ${error.message}`);
    }
};
