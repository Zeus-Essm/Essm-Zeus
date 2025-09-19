
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

    const existingItemNames = existingItems.map(i => i.name).join(', ') || 'as roupas que a pessoa já está vestindo na foto';

    const promptText = `Sua tarefa é ser um estilista virtual e especialista em edição de imagem de alta precisão. O objetivo é vestir uma nova peça de roupa em uma pessoa de forma ultra-realista, substituindo a roupa existente se necessário.

IMAGENS FORNECIDAS:
- IMAGEM 1: A foto da pessoa. A pessoa pode já estar vestindo algumas roupas, que podem incluir: ${existingItemNames}.
- IMAGEM 2: A nova peça de roupa que você deve adicionar ao visual: '${newItem.name}'.

SUA MISSÃO:
Analisar a IMAGEM 1 para identificar o que a pessoa está vestindo e, em seguida, integrar a nova peça ('${newItem.name}') da IMAGEM 2 de forma inteligente e realista.

REGRA DE VESTIR INTELIGENTE (ESSENCIAL):
1.  ANÁLISE E SUBSTITUIÇÃO: Primeiro, olhe para a IMAGEM 1 e identifique a peça de roupa principal que a pessoa está usando na parte superior do corpo (ex: uma camisa, uma T-shirt, um casaco). Se a nova peça ('${newItem.name}') for do mesmo tipo (ex: você está adicionando uma T-shirt e a pessoa já usa uma camisa), você DEVE REMOVER COMPLETAMENTE a peça antiga e TROCÁ-LA pela nova. A substituição deve ser perfeita, como se a pessoa tivesse trocado de roupa. NÃO sobreponha uma T-shirt sobre outra T-shirt ou camisa.
2.  SOBREPOSIÇÃO REALISTA: Se a nova peça for um item que se usa POR CIMA dos outros (ex: uma jaqueta sobre uma T-shirt que já foi adicionada), adicione-a realisticamente, criando dobras e sombras corretas sobre a roupa de baixo.
3.  O objetivo final é uma imagem que pareça uma fotografia 100% real, não uma colagem digital. O realismo é a prioridade máxima.

REGRAS CRÍTICAS E INQUEBRÁVEIS:
1.  FIDELIDADE TOTAL AO PRODUTO: Você DEVE usar a imagem EXATA da nova peça da IMAGEM 2. Cor, textura, padrão, e logotipos DEVEM ser idênticos.
2.  PRESERVAÇÃO DA PESSOA E ROUPAS NÃO AFETADAS: O rosto, cabelo, corpo, pose e quaisquer outras roupas que a pessoa esteja vestindo (e que não foram substituídas) devem permanecer COMPLETAMENTE inalterados.
3.  FUNDO INTOCÁVEL: O fundo da IMAGEM 1 deve ser perfeitamente preservado.
4.  REALISMO MÁXIMO: Ajuste a nova peça ao corpo, considerando caimento, dobras, sombras e a iluminação da foto original para uma integração perfeita.
5.  NÃO CORTE A IMAGEM: A imagem final DEVE ter exatamente as mesmas dimensões da IMAGEM 1. A pessoa inteira, dos pés à cabeça, e todo o fundo original DEVEM permanecer visíveis.`;

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
