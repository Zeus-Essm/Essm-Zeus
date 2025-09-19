
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
  // SOLUÇÃO DEFINITIVA PARA CORS:
  // Por que usamos um proxy? Os navegadores implementam uma política de segurança chamada CORS (Cross-Origin Resource Sharing)
  // que impede um site (nosso app) de buscar recursos (como imagens) de um domínio diferente (ex: i.postimg.cc)
  // a menos que esse domínio autorize explicitamente. Sites de hospedagem de imagens raramente dão essa permissão.
  //
  // O proxy CORS atua como um intermediário seguro:
  // 1. Nosso app solicita a imagem ao proxy.
  // 2. O proxy (que é um servidor) busca a imagem no destino original.
  // 3. O proxy nos envia a imagem com os cabeçalhos corretos, contornando a restrição do navegador.
  // Esta é a abordagem padrão e mais robusta da indústria para resolver este problema em aplicações web.
  //
  // NOTA DE ATUALIZAÇÃO: Os proxies anteriores ('codetabs.com', 'allorigins.win') apresentaram instabilidade.
  // Trocamos por um novo serviço ('corsproxy.io') para tentar restaurar a funcionalidade.
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  
  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        // Este erro pode vir tanto da URL da imagem original (ex: 404 Not Found)
        // quanto de um problema com o próprio serviço de proxy.
        throw new Error(`Falha na rede ao buscar a imagem via proxy: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error); // Passa o objeto de erro real
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Erro ao converter a URL da imagem via proxy (${url}):`, error);
    // Mensagem de erro amigável para o usuário final.
    throw new Error('Não foi possível carregar a imagem do item. Pode ser um problema de conexão ou o link da imagem está quebrado.');
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

REGRAS CRÍTICAS E INQUEBRÁIS:
1.  **NÃO CORTE A IMAGEM (REGRA FUNDAMENTAL):** A imagem final que você gera DEVE ter **exatamente as mesmas dimensões (largura e altura em pixels) da IMAGEM 1 original.** É proibido fazer zoom, cortar (crop) ou reenquadrar a imagem. A pessoa inteira, da cabeça aos pés, e todo o fundo original DEVEM ser 100% preservados e visíveis.
2.  FIDELIDADE TOTAL AO PRODUTO: Você DEVE usar a imagem EXATA da nova peça da IMAGEM 2. Cor, textura, padrão, e logotipos DEVEM ser idênticos.
3.  PRESERVAÇÃO DA PESSOA E ROUPAS NÃO AFETADAS: O rosto, cabelo, corpo, pose e quaisquer outras roupas que a pessoa esteja vestindo (e que não foram substituídas) devem permanecer COMPLETAMENTE inalterados.
4.  FUNDO INTOCÁVEL: O fundo da IMAGEM 1 deve ser perfeitamente preservado, sem nenhuma alteração.
5.  REALISMO MÁXIMO: Ajuste a nova peça ao corpo, considerando caimento, dobras, sombras e a iluminação da foto original para uma integração perfeita.`;

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