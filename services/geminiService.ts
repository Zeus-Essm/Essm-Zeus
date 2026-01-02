
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
 */
export const normalizeImageAspectRatio = async (dataUrl: string): Promise<string> => {
    return dataUrl; 
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
    
    const textPart = candidate.content.parts.find(part => part.text);
    if (textPart && textPart.text) {
        console.warn("Model text response:", textPart.text);
        throw new Error(`A IA retornou texto em vez de imagem. Pode ter recusado o pedido.`);
    }
    throw new Error("A resposta da IA não continha uma imagem válida.");
};


export const generateTryOnImage = async (userImage: string, newItem: Item, existingItems: Item[]): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const itemImage = await imageUrlToDataUrl(newItem.image);
        const { base64: userBase64, mimeType: userMime } = getBase64Parts(userImage);
        const { base64: itemBase64, mimeType: itemMime } = getBase64Parts(itemImage);

        const prompt = `
            Act as a professional virtual try-on AI.
            Your task is to realistically generate an image of the user wearing the new clothing item.
            - **User:** The person in the first image.
            - **Clothing Item:** The product in the second image (${newItem.name}).
            - **Context:** ${existingItems.length > 0 ? `Wearing: ${existingItems.map(i => i.name).join(', ')}.` : 'Original clothes.'}
            **RULES:**
            1. Seamless replacement of current outfit.
            2. Preserve face, hair, and background exactly.
            3. Photorealistic lighting and body fit.
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
        throw new Error(`Falha ao gerar o look: ${error.message}`);
    }
};

export const generateStyleTip = async (items: Item[]): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analise este look: ${items.map(i => i.name).join(', ')}. Dê uma dica de estilo curta (máximo 15 palavras) e elegante em português de Angola.`,
        });
        return response.text?.trim() || "Um visual impecável para qualquer ocasião.";
    } catch (e) {
        console.error("Error generating style tip:", e);
        return "Este look combina perfeitamente com a sua atitude.";
    }
};

export const generateFashionVideo = async (
    generatedImage: string,
    onProgress: (message: string) => void
): Promise<string> => {
    try {
        onProgress("Preparando sua passarela virtual...");
        const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const { base64, mimeType } = getBase64Parts(generatedImage);

        let operation = await veoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: 'A short, stylish video of this person showing off their fashion look. Professional camera movements. The background should remain consistent.',
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

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            onProgress("Refinando os frames do vídeo...");
            operation = await veoAi.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("Link de download não encontrado.");
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) throw new Error(`Falha no download: ${response.statusText}`);

        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error: any) {
        console.error("Error in generateFashionVideo:", error);
        throw error;
    }
};
