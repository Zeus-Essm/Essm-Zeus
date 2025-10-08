
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
        
        const promptText = `Sua tarefa é ser um especialista em edição de imagem para expandir uma imagem retangular para um formato perfeitamente quadrado (proporção 1:1) de forma ultra-realista.

**A REGRA MAIS IMPORTANTE E INQUEBRÁVEL É SOBRE A DIREÇÃO DA EXPANSÃO:**
- A expansão SÓ PODE acontecer NAS LATERAIS (esquerda e direita).
- É ABSOLUTAMENTE PROIBIDO adicionar qualquer conteúdo na parte SUPERIOR ou INFERIOR.
- A ALTURA da imagem original deve ser 100% PRESERVADA. A imagem final deve ter exatamente a mesma altura da original.

**SUA MISSÃO DETALHADA:**
1.  **MANTER A ALTURA ORIGINAL:** A imagem que você gerar deve ter exatamente a mesma altura da imagem fornecida. Nenhuma expansão vertical.
2.  **CRIAR UM QUADRADO:** A largura da imagem final deve ser igual à altura, resultando em um quadrado perfeito.
3.  **EXPANDIR APENAS PARA OS LADOS:** Centralize a imagem original. Sua tarefa é preencher de forma realista as áreas vazias que agora existem APENAS nas laterais.
4.  **PREENCHIMENTO REALISTA:** O preenchimento lateral deve ser uma continuação natural e imperceptível do fundo existente na foto.
5.  **FIDELIDADE TOTAL À ILUMINAÇÃO (CRÍTICO):** A iluminação do fundo expandido (sombras, brilhos, etc.) deve corresponder **exatamente** à iluminação da foto original.
6.  **NÃO ALTERE O CONTEÚDO ORIGINAL:** A pessoa e os objetos na imagem original devem ser mantidos 100% intactos.
7.  **RESULTADO FINAL:** Uma fotografia quadrada, com a imagem original ocupando toda a altura, centralizada, e com as laterais expandidas de forma ultra-realista.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
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

        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
            const blockReason = response.promptFeedback?.blockReason || candidate?.finishReason;
            if (blockReason) {
                throw new Error(`Falha ao expandir a imagem. Motivo: ${blockReason}. Tente uma imagem diferente.`);
            }
            throw new Error('A IA não retornou uma imagem expandida válida. A resposta pode ter sido bloqueada ou estar vazia.');
        }

        for (const part of candidate.content.parts) {
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

const getBeautyPrompt = (item: Item): string => {
       const basePrompt = `Sua tarefa é ser um especialista em edição de imagem de alta precisão e maquiagem/estilo virtual. O objetivo é aplicar o produto da IMAGEM 2 na pessoa da IMAGEM 1 de forma ultra-realista.

REGRA MAIS IMPORTANTE E INQUEBRÁVEL: FIDELIDADE TOTAL À ILUMINAÇÃO
A iluminação da foto original (IMAGEM 1) é a verdade absoluta. A nova aplicação DEVE parecer que foi fotografada no mesmo local, no mesmo instante e com a mesma câmera. Replique EXATAMENTE:
- **Direção e Suavidade das Sombras:** As sombras projetadas pelo produto devem corresponder perfeitamente às sombras existentes no rosto e no ambiente.
- **Brilhos e Reflexos:** Qualquer brilho de fonte de luz deve ser aplicado de forma realista ao produto.
- **Temperatura de Cor e Contraste:** O produto não pode parecer artificialmente mais claro, escuro ou com cor diferente do resto da cena.

IMAGENS FORNECIDAS:
- IMAGEM 1: A foto da pessoa, com suas condições de iluminação.
- IMAGEM 2: O produto a ser aplicado: '${item.name}'.

REGRAS ADICIONAIS:
1.  **NÃO CORTE A IMAGEM:** A imagem final DEVE ter **exatamente as mesmas dimensões da IMAGEM 1 original.**
2.  **PRESERVAÇÃO TOTAL:** O rosto (exceto a área de aplicação), corpo, roupas, pose e fundo devem permanecer COMPLETAMENTE inalterados.`;

       switch (item.beautyType) {
           case 'lipstick':
               return `${basePrompt}

**MISSÃO ESPECÍFICA: APLICAR BATOM**
1.  **Identifique os Lábios:** Localize com precisão os lábios da pessoa na IMAGEM 1.
2.  **Aplicação Realista:** Aplique a cor e a textura do batom da IMAGEM 2 aos lábios. Respeite os contornos naturais, incluindo o arco do cupido. A cobertura deve ser uniforme mas com variações sutis de luz e sombra para parecer real.
3.  **Integração Perfeita:** O acabamento (matte, brilhante, etc.) deve interagir realisticamente com a luz da foto.`;
           case 'wig':
               return `${basePrompt}

**MISSÃO ESPECÍFICA: APLICAR PERUCA**
1.  **Posicionamento Natural:** Coloque a peruca da IMAGEM 2 na cabeça da pessoa. A linha do cabelo da peruca deve parecer natural e se fundir de forma crível com a testa.
2.  **Cobertura Total:** O cabelo original da pessoa deve ser completamente coberto pela peruca.
3.  **Sombreamento Crítico:** Crie sombras realistas que a peruca projetaria no rosto, pescoço e ombros da pessoa, consistentes com a fonte de luz da IMAGEM 1.
4.  **Fios Realistas:** Certifique-se de que alguns fios de cabelo finos e imperfeições sutis estejam presentes para evitar uma aparência de "capacete".`;
           case 'eyeshadow':
               return `${basePrompt}

**MISSÃO ESPECÍFICA: APLICAR SOMBRA DE OLHOS**
1.  **Identifique os Olhos:** Localize com precisão as pálpebras e a área dos olhos da pessoa na IMAGEM 1.
2.  **Aplicação Suave:** Aplique os tons de sombra da IMAGEM 2 nas pálpebras, esfumando as bordas para uma transição suave com a pele. A aplicação deve seguir o formato natural dos olhos.
3.  **Não Altere Outros Traços:** Mantenha cílios, sobrancelhas e a cor dos olhos inalterados, a menos que seja para integrar a sombra de forma mais realista (ex: uma leve sombra nos cílios inferiores).`;
           default:
               return `${basePrompt}

**MISSÃO:** Aplique o produto de beleza da IMAGEM 2 na pessoa da IMAGEM 1 da forma mais realista possível.`;
       }
};

export const generateBeautyTryOnImage = async (userImage: string, newItem: Item): Promise<string> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY is not set. Returning original image as a placeholder.");
        return new Promise(resolve => setTimeout(() => resolve(userImage), 2000));
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const { base64: userBase64, mimeType: userMimeType } = getBase64Parts(userImage);
        const itemDataUrl = await imageUrlToDataUrl(newItem.image);
        const { base64: itemBase64, mimeType: itemMimeType } = getBase64Parts(itemDataUrl);

        const promptText = getBeautyPrompt(newItem);

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: { data: userBase64, mimeType: userMimeType },
                    },
                    {
                        inlineData: { data: itemBase64, mimeType: itemMimeType },
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

        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
            const blockReason = response.promptFeedback?.blockReason || candidate?.finishReason;
            if (blockReason) {
                throw new Error(`A IA não retornou uma imagem. Motivo: ${blockReason}. Tente uma imagem ou item diferente.`);
            }
            throw new Error('A IA não retornou uma imagem válida. A resposta pode ter sido bloqueada ou estar vazia.');
        }


        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error('A IA não retornou uma imagem. Tente novamente.');

    } catch (error) {
        console.error('Error calling Gemini API for beauty try-on:', error);
        if (error instanceof Error) {
            throw new Error(`Falha ao aplicar o produto de beleza: ${error.message}`);
        }
        throw new Error('Falha ao aplicar o produto de beleza. Verifique o console para mais detalhes.');
    }
};

export const generateFashionVideo = async (baseImage: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY não configurada. A geração de vídeo está desativada.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const { base64, mimeType } = getBase64Parts(baseImage);
        
        const prompt = `Gere um vídeo vertical com proporção de 9:16 e 5 segundos de duração da pessoa na imagem. Ela é uma modelo de alta-costura em uma sessão de fotos profissional. O vídeo deve consistir em uma série de mudanças de pose lentas, sutis e elegantes, como se um fotógrafo estivesse tirando várias fotos. Movimento mínimo, foco em poses confiantes e estilosas. O fundo deve permanecer consistente com a imagem original.`;

        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            image: {
                imageBytes: base64,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
            },
        });

        // Poll for the result
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds before checking again
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error('A geração de vídeo falhou em produzir um link para download.');
        }

        // Fetch the video using the download link and the API key
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Falha ao baixar o vídeo: ${response.statusText}`);
        }

        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob); // Create a local URL for the video blob
    } catch (error: any) {
        console.error('Erro ao chamar a API Gemini para geração de vídeo:', error);

        // More robustly check for the quota error, as its structure can vary.
        const errorString = JSON.stringify(error);
        const isQuotaError = errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('"code":429');

        if (isQuotaError) {
            throw new Error('O serviço de geração de vídeo atingiu seu limite de uso. Por favor, tente novamente mais tarde.');
        }

        if (error instanceof Error) {
            throw new Error(`Falha ao gerar o vídeo: ${error.message}`);
        }
        throw new Error('Falha ao gerar o vídeo. Verifique o console para mais detalhes.');
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

    const promptText = `Sua tarefa é ser um estilista virtual e especialista em edição de imagem de alta precisão. O objetivo é vestir uma nova peça de roupa em uma pessoa de forma ultra-realista.

REGRA MAIS IMPORTANTE E INQUEBRÁVEL: FIDELIDADE TOTAL À ILUMINAÇÃO
A iluminação da foto original (IMAGEM 1) é a verdade absoluta e NÃO PODE ser alterada. Sua única missão é fazer com que a nova peça de roupa (da IMAGEM 2) se integre perfeitamente a essa iluminação existente. A nova peça DEVE parecer que foi fotografada no mesmo local, no mesmo instante e com a mesma câmera.
Isto significa replicar EXATAMENTE:
- **Direção e Suavidade das Sombras:** As sombras projetadas sobre a nova peça devem corresponder perfeitamente às sombras existentes no corpo e no ambiente da foto original.
- **Brilhos e Reflexos:** Qualquer brilho de fonte de luz ou reflexo visível na pessoa ou no ambiente deve ser aplicado de forma realista à nova peça de roupa.
- **Temperatura de Cor:** A tonalidade da luz (seja quente, fria ou neutra) deve ser idêntica na nova peça e no resto da imagem.
- **Contraste Geral:** A peça não pode parecer artificialmente mais clara ou escura que o resto da cena. A integração de contraste deve ser perfeita.

IMAGENS FORNECIDAS:
- IMAGEM 1: A foto da pessoa, com suas condições de iluminação, sombras e ambiente. A pessoa pode já estar vestindo: ${existingItemNames}.
- IMAGEM 2: A nova peça de roupa que você deve adicionar ao visual: '${newItem.name}'.

SUA MISSÃO:
Analisar a IMAGEM 1 para identificar o que a pessoa está vestindo e, em seguida, integrar a nova peça ('${newItem.name}') da IMAGEM 2 de forma inteligente e realista.

REGRA DE VESTIR INTELIGENTE (ESSENCIAL):
1.  ANÁLISE E SUBSTITUIÇÃO: Primeiro, olhe para a IMAGEM 1 e identifique a peça de roupa principal que a pessoa está usando na parte superior do corpo (ex: uma camisa, uma T-shirt, um casaco). Se a nova peça ('${newItem.name}') for do mesmo tipo (ex: você está adicionando uma T-shirt e a pessoa já usa uma camisa), você DEVE REMOVER COMPLETAMENTE a peça antiga e TROCÁ-LA pela nova. A substituição deve ser perfeita, como se a pessoa tivesse trocado de roupa. NÃO sobreponha uma T-shirt sobre outra T-shirt ou camisa.
2.  SOBREPOSIÇÃO REALISTA: Se a nova peça for um item que se usa POR CIMA dos outros (ex: uma jaqueta sobre uma T-shirt que já foi adicionada), adicione-a realisticamente, criando dobras e sombras corretas sobre a roupa de baixo.
3.  O objetivo final é uma imagem que pareça uma fotografia 100% real, não uma colagem digital. O realismo é a prioridade máxima.

OUTRAS REGRAS CRÍTICAS:
1.  **NÃO CORTE A IMAGEM:** A imagem final que você gera DEVE ter **exatamente as mesmas dimensões (largura e altura em pixels) da IMAGEM 1 original.** É proibido fazer zoom, cortar (crop) ou reenquadrar a imagem. A pessoa inteira, da cabeça aos pés, e todo o fundo original DEVEM ser 100% preservados e visíveis.
2.  **FIDELIDADE TOTAL AO PRODUTO:** Você DEVE usar a imagem EXATA da nova peça da IMAGEM 2. Cor, textura, padrão, e logotipos DEVEM ser idênticos.
3.  **PRESERVAÇÃO DA PESSOA E ROUPAS NÃO AFETADAS:** O rosto, cabelo, corpo, pose e quaisquer outras roupas que a pessoa esteja vestindo (e que não foram substituídas) devem permanecer COMPLETAMENTE inalterados.
4.  **FUNDO INTOCÁVEL:** O fundo da IMAGEM 1 deve ser perfeitamente preservado, sem nenhuma alteração.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
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

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
        const blockReason = response.promptFeedback?.blockReason || candidate?.finishReason;
        if (blockReason) {
            throw new Error(`A IA não retornou uma imagem. Motivo: ${blockReason}. Tente uma imagem ou item diferente.`);
        }
        throw new Error('A IA não retornou uma imagem válida. A resposta pode ter sido bloqueada ou estar vazia.');
    }

    for (const part of candidate.content.parts) {
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
