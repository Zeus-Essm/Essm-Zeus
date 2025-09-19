import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
import type { Item } from '../types';

// Utility to convert a data URL string into its base64 and mimeType parts.
const getBase64Parts = (dataUrl: string): { base64: string; mimeType: string } => {
  const parts = dataUrl.split(',');
  const mimeType = parts[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const base64 = parts[1];
  return { base64, mimeType };
};

// Helper to get image dimensions from a data URL
const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (err) => {
      reject(new Error("Falha ao carregar a imagem para obter dimensões."));
    };
    img.src = dataUrl;
  });
};


// Fetches an image from a URL and converts it into a data URL (base64 encoded string).
const imageUrlToDataUrl = async (url: string): Promise<string> => {
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  
  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`Falha na rede ao buscar a imagem via proxy: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Erro ao converter a URL da imagem via proxy (${url}):`, error);
    throw new Error('Não foi possível carregar a imagem do item. Pode ser um problema de conexão ou o link da imagem está quebrado.');
  }
};

export const expandImageToSquare = async (userImage: string): Promise<string> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not set. Cannot expand image. Returning original.");
        return userImage;
    }

    const { width, height } = await getImageDimensions(userImage);
    if (width === height) {
        return userImage;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const { base64: userBase64, mimeType: userMimeType } = getBase64Parts(userImage);
        
        const promptText = `Sua tarefa é ser um especialista em edição de imagem para expandir uma imagem retangular para um formato perfeitamente quadrado (proporção 1:1) de forma ultra-realista, com fidelidade absoluta à iluminação original.

IMAGEM FORNECIDA:
- Uma imagem de uma pessoa, que pode ser vertical ou horizontal.

SUA MISSÃO:
1.  **NÃO ALTERE O CONTEÚDO ORIGINAL:** O conteúdo da imagem fornecida deve ser mantido 100% intacto, centralizado na nova imagem quadrada.
2.  **EXPANDA O FUNDO:** Você deve preencher as áreas que faltam (nas laterais para uma imagem vertical, ou em cima/embaixo para uma horizontal) para criar a tela quadrada.
3.  **PREENCHIMENTO INTELIGENTE:** O preenchimento deve ser uma continuação natural e realista do fundo existente na foto. Se o fundo for uma parede, continue a parede. Se for um cenário ao ar livre, estenda o cenário. A transição entre o conteúdo original e o preenchimento gerado deve ser imperceptível.
4.  **FIDELIDADE À ILUMINAÇÃO (CRÍTICO):** Esta é a regra mais importante. A iluminação do fundo expandido (sombras, brilhos, temperatura de cor) deve corresponder **exatamente** à iluminação da foto original. A nova área deve parecer que foi capturada pela mesma câmera, no mesmo instante e com a mesma luz. Evite qualquer mudança de brilho, contraste ou cor.
5.  **MANTENHA O ESTILO:** O preenchimento deve corresponder à textura, cores e estilo geral da foto original.
6.  **RESULTADO FINAL:** A imagem final deve ser uma fotografia quadrada realista, sem bordas ou cortes visíveis, onde o conteúdo original está perfeitamente centralizado e a iluminação é consistente em toda a imagem.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: userBase64,
                            mimeType: userMimeType,
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

        throw new Error('A IA não retornou uma imagem expandida.');
    } catch (error) {
        console.error('Error calling Gemini API for image expansion:', error);
        if (error instanceof Error) {
            throw new Error(`Falha ao expandir a imagem: ${error.message}`);
        }
        throw new Error('Falha ao expandir a imagem. Verifique o console para mais detalhes.');
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

    const promptText = `Sua tarefa é ser um estilista virtual e especialista em edição de imagem de alta precisão. O objetivo é vestir uma nova peça de roupa em uma pessoa de forma ultra-realista, com fidelidade absoluta à iluminação da foto original.

IMAGENS FORNECIDAS:
- IMAGEM 1: A foto da pessoa, com suas condições de iluminação, sombras e ambiente. A pessoa pode já estar vestindo: ${existingItemNames}.
- IMAGEM 2: A nova peça de roupa que você deve adicionar ao visual: '${newItem.name}'.

SUA MISSÃO:
Analisar a IMAGEM 1 para identificar o que a pessoa está vestindo e, em seguida, integrar a nova peça ('${newItem.name}') da IMAGEM 2 de forma inteligente e realista.

REGRA DE VESTIR INTELIGENTE (ESSENCIAL):
1.  ANÁLISE E SUBSTITUIÇÃO: Primeiro, olhe para a IMAGEM 1 e identifique a peça de roupa principal que a pessoa está usando na parte superior do corpo (ex: uma camisa, uma T-shirt, um casaco). Se a nova peça ('${newItem.name}') for do mesmo tipo (ex: você está adicionando uma T-shirt e a pessoa já usa uma camisa), você DEVE REMOVER COMPLETAMENTE a peça antiga e TROCÁ-LA pela nova. A substituição deve ser perfeita, como se a pessoa tivesse trocado de roupa. NÃO sobreponha uma T-shirt sobre outra T-shirt ou camisa.
2.  SOBREPOSIÇÃO REALISTA: Se a nova peça for um item que se usa POR CIMA dos outros (ex: uma jaqueta sobre uma T-shirt que já foi adicionada), adicione-a realisticamente, criando dobras e sombras corretas sobre a roupa de baixo.
3.  O objetivo final é uma imagem que pareça uma fotografia 100% real, não uma colagem digital. O realismo é a prioridade máxima.

REGRAS CRÍTICAS E INQUEBRÁIS:
1.  **FIDELIDADE TOTAL À ILUMINAÇÃO (REGRA MAIS IMPORTANTE):** A nova peça de roupa deve ser integrada à IMAGEM 1 de forma que pareça ter sido fotografada no mesmo ambiente, com a mesma luz. Você DEVE replicar **exatamente** a iluminação da foto original na nova peça. Isso inclui:
    *   **Direção e suavidade das sombras:** As sombras na nova roupa devem corresponder às sombras existentes no corpo e no ambiente.
    *   **Brilhos e reflexos:** Se houver fontes de luz visíveis ou reflexos na foto original, eles devem afetar a nova peça de forma realista.
    *   **Temperatura de cor:** A cor da luz (quente, fria, neutra) deve ser consistente entre a nova peça e o resto da imagem.
    *   **Contraste geral:** A peça não pode parecer mais clara ou mais escura que o resto da cena.
2.  **NÃO CORTE A IMAGEM:** A imagem final que você gera DEVE ter **exatamente as mesmas dimensões (largura e altura em pixels) da IMAGEM 1 original.** É proibido fazer zoom, cortar (crop) ou reenquadrar a imagem. A pessoa inteira, da cabeça aos pés, e todo o fundo original DEVEM ser 100% preservados e visíveis.
3.  FIDELIDADE TOTAL AO PRODUTO: Você DEVE usar a imagem EXATA da nova peça da IMAGEM 2. Cor, textura, padrão, e logotipos DEVEM ser idênticos.
4.  PRESERVAÇÃO DA PESSOA E ROUPAS NÃO AFETADAS: O rosto, cabelo, corpo, pose e quaisquer outras roupas que a pessoa esteja vestindo (e que não foram substituídas) devem permanecer COMPLETAMENTE inalterados.
5.  FUNDO INTOCÁVEL: O fundo da IMAGEM 1 deve ser perfeitamente preservado, sem nenhuma alteração.`;

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