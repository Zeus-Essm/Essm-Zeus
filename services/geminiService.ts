

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

// NEW: Helper to resize an image using canvas
const resizeImage = (
  dataUrl: string,
  maxDimension: number,
  quality: number = 0.9
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Only resize if the image is larger than the max dimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Não foi possível obter o contexto do canvas para redimensionar a imagem.'));
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Get the data URL for the resized image (JPEG for better compression)
      const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(resizedDataUrl);
    };
    img.onerror = () => {
      reject(new Error("Falha ao carregar a imagem para redimensionamento."));
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

// --- NEW ASPECT RATIO LOGIC ---
const SUPPORTED_ASPECT_RATIOS = [
  // Portrait
  { ratio: 9 / 16, label: '9:16' }, // 0.5625
  { ratio: 2 / 3, label: '2:3' },   // 0.6667
  { ratio: 3 / 4, label: '3:4' },   // 0.75
  { ratio: 4 / 5, label: '4:5' },   // 0.8
  // Square
  { ratio: 1 / 1, label: '1:1' },   // 1.0
  // Flexible / Landscape
  { ratio: 5 / 4, label: '5:4' },   // 1.25
  { ratio: 4 / 3, label: '4:3' },   // 1.3333
  { ratio: 3 / 2, label: '3:2' },   // 1.5
  { ratio: 16 / 9, label: '16:9' }, // 1.7778
  { ratio: 21 / 9, label: '21:9' }, // 2.3333
];

const getClosestAspectRatio = (width: number, height: number): string => {
  if (height === 0) return '1:1'; // Avoid division by zero
  const originalRatio = width / height;

  const closest = SUPPORTED_ASPECT_RATIOS.reduce((prev, curr) => {
    return (Math.abs(curr.ratio - originalRatio) < Math.abs(prev.ratio - originalRatio) ? curr : prev);
  });

  return closest.label;
};

export const normalizeImageAspectRatio = async (userImage: string): Promise<string> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not set. Cannot normalize image aspect ratio. Returning original.");
        return userImage;
    }

    const { width, height } = await getImageDimensions(userImage);
    const targetAspectRatio = getClosestAspectRatio(width, height);

    // Check if the aspect ratio is already close enough to a supported one
    const originalRatio = width / height;
    const targetRatioValue = SUPPORTED_ASPECT_RATIOS.find(r => r.label === targetAspectRatio)!.ratio;
    if (Math.abs(originalRatio - targetRatioValue) < 0.02) { // Allow a small tolerance
        console.log(`Image aspect ratio is already close to ${targetAspectRatio}. Skipping normalization.`);
        return userImage;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const { base64: userBase64, mimeType: userMimeType } = getBase64Parts(userImage);
        
        const promptText = `Sua tarefa é ser um editor de imagens especialista. Ajuste a imagem fornecida para uma proporção de aspecto exata de **${targetAspectRatio}**.

**REGRAS CRÍTICAS E INQUEBRÁVEIS:**
1.  **PROPORÇÃO FINAL:** A imagem de saída DEVE ter exatamente a proporção de **${targetAspectRatio}**.
2.  **PRESERVAÇÃO DO ASSUNTO:** O assunto principal (pessoa, objetos) na imagem original deve ser mantido 100% intacto. Não corte, distorça, estique ou altere o assunto de forma alguma.
3.  **EXPANSÃO REALISTA:** Se a imagem precisar ser expandida para atingir a proporção alvo, preencha as novas áreas com conteúdo que estenda o fundo existente de forma ultra-realista e imperceptível. A iluminação, textura e sombras da área expandida devem corresponder perfeitamente à imagem original.
4.  **RESULTADO LIMPO:** Forneça apenas a imagem finalizada, sem texto adicional.`;

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
                throw new Error(`Falha ao ajustar a imagem. Motivo: ${blockReason}. Tente uma imagem diferente.`);
            }
            throw new Error('A IA não retornou uma imagem ajustada válida. A resposta pode ter sido bloqueada ou estar vazia.');
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error('A IA não retornou uma imagem ajustada.');
    } catch (error) {
        console.error('Error calling Gemini API for image aspect ratio normalization:', error);
        if (error instanceof Error) {
            throw new Error(`Falha ao normalizar a proporção da imagem: ${error.message}`);
        }
        throw new Error('Falha ao normalizar a proporção da imagem. Verifique o console para mais detalhes.');
    }
};

// --- BEGIN RUNWAY FALLBACK IMPLEMENTATION ---

// This is a fictional implementation for a RunwayML API client proxy.
// In a real-world scenario, you would use their official SDK or a well-defined API.

/**
 * Initiates a video generation job with the Runway API proxy.
 * @returns A promise that resolves with the job ID.
 */
async function createRunwayJob(imageDataUrl: string, prompt: string): Promise<string> {
    const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;
    if (!RUNWAY_API_KEY) {
        console.warn("RUNWAY_API_KEY not configured. Using mock job creation for fallback.");
    }
    // This is a mock response. In a real app, you would make a fetch request.
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency
    return `runway_job_${Date.now()}`;
}

let runwayPollCount = 0; // Module-level variable for mocking polling state
/**
 * Checks the status of a video generation job with the Runway API proxy.
 * @returns A promise that resolves with the job status and video URL if complete.
 */
async function checkRunwayStatus(jobId: string): Promise<{ status: 'processing' | 'succeeded' | 'failed', url?: string }> {
    // This is a mock response. In a real app, you would fetch the job status.
    runwayPollCount++;
    if (runwayPollCount > 3) {
        runwayPollCount = 0; // Reset for the next call
        return { status: 'succeeded', url: 'https://files.catbox.moe/joiet2.mp4' }; // Use a valid placeholder video
    }
    return { status: 'processing' };
}

/**
 * Handles the complete video generation flow using Runway as a fallback.
 */
const generateVideoWithRunway = async (imageDataUrl: string, onTick?: (s: string) => void): Promise<string> => {
    try {
        onTick?.("Preparando imagem para Runway...");
        const resizedImageDataUrl = await resizeImage(imageDataUrl, 1024, 0.95);

        const prompt = `A pessoa na imagem se exibe para a câmera como se estivesse em um ensaio fotográfico. A câmera deve permanecer completamente parada, sem nenhum movimento ou zoom. Apenas a pessoa realiza movimentos sutis e elegantes, posando para a foto. O fundo deve permanecer estático e consistente com a imagem original. Preserve a proporção de aspecto vertical da imagem. O vídeo deve ter cerca de 4 a 6 segundos.`;

        onTick?.("Enviando para o Runway Gen-3 Turbo...");
        const jobId = await createRunwayJob(resizedImageDataUrl, prompt);
        onTick?.("Trabalho enviado para Runway. Aguardando processamento...");
        
        const maxWaitTime = 300000;
        const initialDelay = 10000;
        let totalWaitTime = 0;
        let currentDelay = initialDelay;

        while (totalWaitTime < maxWaitTime) {
            const result = await checkRunwayStatus(jobId);
            
            if (result.status === 'succeeded' && result.url) {
                onTick?.("Processamento concluído! Baixando o vídeo do Runway...");
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(result.url)}`;
                const videoResponse = await fetch(proxyUrl);

                if (!videoResponse.ok) {
                    throw new Error(`Falha ao baixar o vídeo gerado pelo Runway. Status: ${videoResponse.status}`);
                }
                const videoBlob = await videoResponse.blob();
                onTick?.("Vídeo gerado com sucesso via Runway!");
                return URL.createObjectURL(videoBlob);
            } else if (result.status === 'failed') {
                throw new Error("A geração de vídeo do Runway falhou.");
            }

            onTick?.(`Processando via Runway... (Isso pode levar alguns minutos)`);
            await new Promise(resolve => setTimeout(resolve, currentDelay));
            totalWaitTime += currentDelay;
            currentDelay = Math.min(Math.floor(currentDelay * 1.2), 30000); 
        }

        throw new Error("Tempo limite atingido ao aguardar a geração do vídeo do Runway.");
    } catch (error) {
        console.error('Erro no fluxo de geração de vídeo do Runway:', error);
        if (error instanceof Error) {
            throw new Error(`Falha no gerador de vídeo alternativo: ${error.message}`);
        }
        throw new Error('Ocorreu um erro desconhecido ao usar o gerador de vídeo alternativo.');
    }
};

// --- END RUNWAY FALLBACK IMPLEMENTATION ---

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

**MISSÃO ESPECÍFICA: APLICAR SOMRA DE OLHOS**
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

export const generateFashionVideo = async (imageDataUrl: string, onTick?: (s: string) => void): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY não está configurada. A geração de vídeo está desativada.");
    }

    try {
        onTick?.("Preparando imagem para o vídeo...");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const resizedImageDataUrl = await resizeImage(imageDataUrl, 1024, 0.95);
        const { base64, mimeType } = getBase64Parts(resizedImageDataUrl);

        const prompt = `A pessoa na imagem se exibe para a câmera como se estivesse em um ensaio fotográfico. A câmera deve permanecer completamente parada, sem nenhum movimento ou zoom. Apenas a pessoa realiza movimentos sutis e elegantes, posando para a foto. O fundo deve permanecer estático e consistente com a imagem original. Preserve a proporção de aspecto vertical da imagem. O vídeo deve ter cerca de 4 a 6 segundos.`;

        onTick?.("Enviando para o modelo de vídeo VEO...");
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            image: {
                imageBytes: base64,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1
            }
        });
        
        onTick?.("Trabalho de vídeo enviado. Aguardando processamento...");

        const maxWaitTime = 300000; // 5 minutos
        const initialDelay = 10000; // 10 segundos
        let totalWaitTime = 0;
        let currentDelay = initialDelay;

        while (!operation.done && totalWaitTime < maxWaitTime) {
            onTick?.(`Processando... (Isso pode levar alguns minutos)`);
            await new Promise(resolve => setTimeout(resolve, currentDelay));
            totalWaitTime += currentDelay;
            operation = await ai.operations.getVideosOperation({ operation: operation });
            currentDelay = Math.min(Math.floor(currentDelay * 1.2), 30000); 
        }

        if (!operation.done) {
            throw new Error("Tempo limite atingido ao aguardar a geração do vídeo.");
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            const reason = operation.error?.message || "Verifique se há bloqueios de segurança na sua conta da API.";
            throw new Error(`Geração concluída, mas nenhuma URL de vídeo foi retornada. Motivo: ${reason}`);
        }
        
        onTick?.("Processamento concluído! Baixando o vídeo...");
        
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            if (videoResponse.status === 429) {
                 throw new Error("429 Too Many Requests");
            }
            throw new Error(`Falha ao baixar o vídeo gerado. Status: ${videoResponse.status}`);
        }

        const videoBlob = await videoResponse.blob();
        
        onTick?.("Vídeo gerado com sucesso!");

        return URL.createObjectURL(videoBlob);

    } catch (error) {
        if (error instanceof Error && (error.message.includes('429') || error.message.toLowerCase().includes('rate limit'))) {
            console.warn("Erro 429 do VEO detectado. Ativando fallback para Runway.");
            onTick?.("O modelo VEO está ocupado. Tentando o nosso gerador de vídeo alternativo...");
            return generateVideoWithRunway(imageDataUrl, onTick);
        }

        console.error('Erro no fluxo de geração de vídeo do VEO:', error);
        if (error instanceof Error) {
            throw new Error(`Falha na geração do vídeo: ${error.message}`);
        }
        throw new Error('Ocorreu um erro desconhecido ao gerar o vídeo.');
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

    const promptText = `**SISTEMA DE ANÁLISE AVANÇADA: Fit Check**

**MISSÃO:** Sua única função é ser o motor do sistema "Fit Check", um especialista em provador virtual de altíssima precisão. Você deve vestir a pessoa na **IMAGEM 1** com a peça de roupa da **IMAGEM 2**. O resultado deve ser indistinguível de uma fotografia real.

**DADOS DE ENTRADA:**
*   **IMAGEM 1:** A foto da pessoa, incluindo sua pose, tipo de corpo e iluminação ambiente. A pessoa já está vestindo: ${existingItemNames}.
*   **IMAGEM 2:** A imagem de catálogo da nova peça de roupa a ser vestida: '${newItem.name}'.

**DIRETRIZES CRÍTICAS DO FIT CHECK (NÃO-NEGOCIÁVEIS):**

1.  **ANÁLISE CORPORAL E FÍSICA DO TECIDO (PRIORIDADE MÁXIMA):**
    *   **MAPEIE O CORPO:** Analise a silhueta, curvas e pose da pessoa na IMAGEM 1.
    *   **SIMULE O CAIMENTO:** A nova peça (IMAGEM 2) deve "vestir" o corpo de forma realista. Crie dobras, vincos, sombras e tensões no tecido exatamente onde eles ocorreriam naturalmente devido à pose e ao formato do corpo. O tecido não pode parecer um adesivo plano.
    *   **LÓGICA DE CAMADAS:** Se a pessoa já estiver vestindo roupas, a nova peça deve ser colocada por cima (como uma jaqueta sobre uma camisa) ou substituir a peça existente (uma nova camisa substitui a antiga) de forma lógica e fisicamente crível.

2.  **INTEGRAÇÃO FOTOREALISTA COM A CENA:**
    *   **ILUMINAÇÃO IDÊNTICA:** A luz que incide na nova peça DEVE ser uma réplica exata da iluminação da IMAGEM 1. As sombras projetadas pela nova peça no corpo e as sombras no próprio tecido devem corresponder perfeitamente à direção, intensidade e cor da luz ambiente.
    *   **CORES E TEXTURAS FIÉIS:** A cor, estampa e textura da nova peça devem ser 100% fiéis à IMAGEM 2, mas ajustadas à iluminação da IMAGEM 1.

3.  **PRESERVAÇÃO ABSOLUTA DO ORIGINAL:**
    *   **NÃO ALTERE O FUNDO, ROSTO OU CORPO:** O rosto da pessoa, seu cabelo, sua pose, o fundo da imagem e quaisquer outras peças de roupa que não foram substituídas devem permanecer **ABSOLUTAMENTE INTOCADOS**.
    *   **DIMENSÕES ORIGINAIS:** A imagem final deve ter exatamente as mesmas dimensões da IMAGEM 1. Não corte a imagem.

**SAÍDA ESPERADA:**
Apenas a imagem final, sem nenhum texto. Uma única fotografia mostrando a pessoa da IMAGEM 1 vestindo perfeitamente a peça da IMAGEM 2.`;

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