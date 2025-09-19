
import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
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
    // FIX: Use a CORS proxy to bypass browser restrictions on fetching images from other domains.
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`Falha ao buscar a imagem: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Erro ao converter a URL da imagem para data URL (${url}):`, error);
    throw new Error(`Não foi possível carregar a imagem do item. Verifique sua conexão.`);
  }
};


export const generateTryOnImage = async (userImage: string, newItem: Item, existingItems: Item[]): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is not set. Returning original image as a placeholder.");
    return new Promise(resolve => setTimeout(() => resolve(userImage), 2000));
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Process both the user's image and the item's image into base64 format.
    const { base64: userBase64, mimeType: userMimeType } = getBase64Parts(userImage);
    const itemDataUrl = await imageUrlToDataUrl(newItem.image);
    const { base64: itemBase64, mimeType: itemMimeType } = getBase64Parts(itemDataUrl);

    let promptText = '';
    if (existingItems.length > 0) {
        const existingItemNames = existingItems.map(i => i.name).join(', ');
        promptText = `Sua tarefa é uma edição de imagem de alta precisão. IMAGEM 1: uma pessoa vestindo ${existingItemNames}. IMAGEM 2: uma nova peça de roupa ('${newItem.name}'). Sua única tarefa é ADICIONAR a peça de roupa da IMAGEM 2 na pessoa da IMAGEM 1, sobre as roupas existentes.

REGRAS CRÍTICAS E INQUEBRÁVEIS:
1.  USE A IMAGEM EXATA: Você DEVE usar a imagem exata da nova peça de roupa da IMAGEM 2. NÃO redesenhe, reinterprete ou modifique a peça. Cor, textura, padrão, e logotipos DEVEM ser idênticos. Pense nisso como recortar a peça da IMAGEM 2 e colá-la sobre a pessoa na IMAGEM 1.
2.  NÃO ALTERE A PESSOA OU AS ROUPAS EXISTENTES: O rosto, cabelo, corpo, pose e as roupas que a pessoa já está vestindo na IMAGEM 1 devem permanecer COMPLETAMENTE inalterados, exceto onde a nova peça os cobre.
3.  NÃO ALTERE O FUNDO: O fundo da IMAGEM 1 deve ser perfeitamente preservado.
4.  SEJA REALISTA: Ajuste a nova peça sobre as roupas existentes, considerando camadas, dobras, sombras e iluminação para que se integre perfeitamente à foto original.
5.  NÃO CORTE A IMAGEM EM HIPÓTESE ALGUMA: A imagem de saída DEVE ter exatamente as mesmas dimensões da IMAGEM 1. A pessoa inteira, dos pés à cabeça, e todo o fundo original DEVEM permanecer visíveis. Qualquer corte, especialmente na parte inferior, é estritamente proibido.`;
    } else {
        promptText = `Sua tarefa é uma edição de imagem de alta precisão. IMAGEM 1: uma pessoa. IMAGEM 2: uma peça de roupa ('${newItem.name}'). Sua única tarefa é pegar a peça de roupa da IMAGEM 2 e colocá-la na pessoa da IMAGEM 1.

REGRAS CRÍTICAS E INQUEBRÁVEIS:
1.  USE A IMAGEM EXATA: Você DEVE usar a imagem exata da peça de roupa da IMAGEM 2. NÃO redesenhe, reinterprete ou modifique a peça. Cor, textura, padrão, e logotipos DEVEM ser idênticos. Pense nisso como recortar a peça da IMAGEM 2 e colá-la na IMAGEM 1.
2.  NÃO ALTERE A PESSOA: O rosto, cabelo, corpo e pose da pessoa na IMAGEM 1 devem permanecer COMPLETAMENTE inalterados.
3.  NÃO ALTERE O FUNDO: O fundo da IMAGEM 1 deve ser perfeitamente preservado.
4.  SEJA REALISTA: Ajuste a peça colada ao corpo da pessoa, adicionando dobras, sombras e iluminação realistas para que se integre perfeitamente à foto original.
5.  NÃO CORTE A IMAGEM EM HIPÓTESE ALGUMA: A imagem de saída DEVE ter exatamente as mesmas dimensões da IMAGEM 1. A pessoa inteira, dos pés à cabeça, e todo o fundo original DEVEM permanecer visíveis. Qualquer corte, especialmente na parte inferior, é estritamente proibido.`;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          { // 1. The person's image
            inlineData: {
              data: userBase64,
              mimeType: userMimeType,
            },
          },
          { // 2. The item's image
            inlineData: {
              data: itemBase64,
              mimeType: itemMimeType,
            },
          },
          { // 3. The detailed text prompt
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
    if (error instanceof Error) {
        throw new Error(`Falha ao gerar a imagem: ${error.message}`);
    }
    throw new Error('Falha ao gerar a imagem. Verifique o console para mais detalhes.');
  }
};