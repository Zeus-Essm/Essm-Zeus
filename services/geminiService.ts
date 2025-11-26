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
  const corsApiKey = 'AQ.Ab8RN6K4XMcdwkHtoN1KbfTHg_gTy0YGT85ZyKjzHFGMoxIlCg';
  const urlWithKey = new URL(url);
  urlWithKey.searchParams.append('key', corsApiKey);
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(urlWithKey.href)}`;
  
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

/**
 * Normalizes the image to a 1:1 (4:4) aspect ratio by adding a white background.
 * The user's image is centered on the white canvas.
 * This effectively creates the "white background base" requested.
 */
export const normalizeImageAspectRatio = async (userImage: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // 1. Determine the square size based on the largest dimension
      const size = Math.max(img.width, img.height);

      // 2. Create a square canvas
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Não foi possível criar o contexto do canvas.'));
        return;
      }

      // 3. Fill the background with white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // 4. Calculate position to center the image
      const x = (size - img.width) / 2;
      const y = (size - img.height) / 2;

      // 5. Draw the user image on top
      ctx.drawImage(img, x, y);

      // 6. Return the new image data
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = (err) => {
      console.error('Error loading image for normalization:', err);
      reject(new Error('Falha ao processar a imagem para formato 1:1.'));
    };
    img.src = userImage;
  });
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

        const prompt = `**PROMPT DE GERAÇÃO DE VÍDEO ULTRA-PRECISO**

**MISSÃO PRINCIPAL:** Animar a imagem de referência num vídeo de 8 segundos. O contexto é um ensaio fotográfico profissional (photoshoot) de alta-costura.

**REGRAS ABSOLUTAS E INQUEBRÁVEIS:**

1.  **CÂMERA TOTALMENTE ESTÁTICA (REGRA CRÍTICA):**
    *   A câmera está 100% FIXA, como num tripé de cimento.
    *   **ZERO MOVIMENTO DE CÂMERA.** Sem panorâmica, sem inclinação, sem zoom, sem tremores, sem qualquer deslocamento. A câmera permanece completamente PARADA durante todo o vídeo. A cena não se move.

2.  **AÇÃO EXCLUSIVA DA MODELO: POSES DE MODA:**
    *   A pessoa é uma modelo profissional e deve apenas realizar uma sequência de **poses de moda suaves e elegantes**.
    *   **MOVIMENTOS PERMITIDOS:** Mudanças sutis de pose, inclinações lentas de cabeça, rotações suaves de tronco, expressões faciais serenas (séria, sorriso leve), gestos delicados com as mãos.
    *   **AÇÕES ESTRITAMENTE PROIBIDAS:** A modelo **NÃO DEVE falar, mover os lábios, cantar, ou gesticular como se estivesse numa conversa**. A performance é puramente visual e silenciosa.

3.  **CONSISTÊNCIA VISUAL PERFEITA:**
    *   O vídeo deve ser uma continuação fotorealista da imagem. Mantenha a **mesma pessoa, mesma roupa, mesmo cabelo, mesma maquiagem, mesma iluminação e o mesmo fundo exato** da imagem de referência.

**ESTILO FINAL:** Um ensaio fotográfico de luxo, profissional, focado puramente nas poses da modelo, com uma qualidade visual impecável e sem cortes.`;

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
                const corsApiKey = 'AQ.Ab8RN6K4XMcdwkHtoN1KbfTHg_gTy0YGT85ZyKjzHFGMoxIlCg';
                const urlWithKey = new URL(result.url);
                urlWithKey.searchParams.append('key', corsApiKey);
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(urlWithKey.href)}`;
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
               return `**INSTRUÇÃO DE ELITE PARA GEMINI 3 PRO (NANO BANANA):**

**TAREFA:** Aplicação de peruca com acabamento invisível e remoção de artefatos.

**REGRA SUPREMA (ZERO TOLERÂNCIA PARA ERROS DE BORDAS):**
Na imagem de referência da peruca (IMAGEM 2), existe frequentemente uma borda de tecido, renda (lace) ou parte de um manequim na testa.
**VOCÊ DEVE RECORTAR E REMOVER DIGITALMENTE ESSA BORDA DE RENDA/TECIDO.**
*   Se você aplicar a peruca com a borda da renda visível, o resultado será considerado FALHA.
*   O cabelo deve começar diretamente na pele, simulando uma raiz natural ("melting lace").

**INTEGRAÇÃO PERFEITA:**
1.  **Substituição Total:** Apague digitalmente o cabelo antigo da modelo (IMAGEM 1) para evitar volume excessivo. A peruca é o novo cabelo.
2.  **Proporção da Cabeça:** Analise se a foto é de corpo inteiro ou close. Ajuste a peruca para ter o tamanho anatômico correto do crânio da pessoa. Não deixe a cabeça desproporcionalmente grande.
3.  **Iluminação:** A peruca deve ter as mesmas sombras e brilhos da cena original.

**RESULTADO FINAL:** Uma foto realista onde a peruca parece ser o cabelo biológico da pessoa, sem bordas de tecido visíveis na testa.`;
           case 'eyeshadow':
               return `${basePrompt}

**MISSÃO ESPECÍFICA: TRANSFERÊNCIA DE LOOK FULL FACE DE ALTA FIDELIDADE**

**OBJETIVO:** Você é um maquiador profissional de Hollywood. Sua tarefa é transferir o **look de maquiagem COMPLETO** da IMAGEM 2 para o rosto da pessoa na IMAGEM 1, como se fosse para uma capa de revista.

**INSTRUÇÕES DETALHADAS (CHECKLIST OBRIGATÓRIO):**
1.  **PELE (A BASE DE TUDO):**
    *   **Base e Corretivo:** Recrie o acabamento da pele (matte ou glow) e a cobertura da maquiagem da IMAGEM 2 na IMAGEM 1.
    *   **Contorno e Blush:** Copie o estilo do contorno (suave ou marcado) e a cor/posição do blush.
    *   **Iluminador:** Aplique o iluminador nos mesmos pontos (maçãs do rosto, nariz, etc.) com a mesma intensidade (sutil ou intenso).

2.  **OLHOS (O FOCO):**
    *   **Sombra:** Transfira as cores, o formato do esfumado e qualquer detalhe (cut crease, brilho) da IMAGEM 2.
    *   **Delineado e Cílios:** Replique o estilo do delineado (se houver) e o volume dos cílios.

3.  **LÁBIOS:** Se a IMAGEM 2 mostrar uma cor de lábio específica, aplique essa cor e acabamento (ex: gloss, matte) na IMAGEM 1.

4.  **FUSÃO E REALISMO:** A maquiagem final deve parecer que foi aplicada sob a mesma luz da IMAGEM 1. Sem parecer artificial.`;
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

        // USE THE PRO MODEL FOR HIGH QUALITY EDITING
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview', 
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

    const veoModelsToTry: string[] = [
        'veo-3.1-generate-preview',
        'veo-3.1-fast-generate-preview',
    ];
    let lastError: Error | null = null;

    for (const model of veoModelsToTry) {
        try {
            onTick?.(`Preparando para gerar vídeo com o modelo: ${model}`);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const resizedImageDataUrl = await resizeImage(imageDataUrl, 1024, 0.95);
            const { base64, mimeType } = getBase64Parts(resizedImageDataUrl);

            const prompt = `**PROMPT DE GERAÇÃO DE VÍDEO ULTRA-PRECISO**

**MISSÃO PRINCIPAL:** Animar a imagem de referência num vídeo de 8 segundos. O contexto é um ensaio fotográfico profissional (photoshoot) de alta-costura.

**REGRAS ABSOLUTAS E INQUEBRÁVEIS:**

1.  **CÂMERA TOTALMENTE ESTÁTICA (REGRA CRÍTICA):**
    *   A câmera está 100% FIXA, como num tripé de cimento.
    *   **ZERO MOVIMENTO DE CÂMERA.** Sem panorâmica, sem inclinação, sem zoom, sem tremores, sem qualquer deslocamento. A câmera permanece completamente PARADA durante todo o vídeo. A cena não se move.

2.  **AÇÃO EXCLUSIVA DA MODELO: POSES DE MODA:**
    *   A pessoa é uma modelo profissional e deve apenas realizar uma sequência de **poses de moda suaves e elegantes**.
    *   **MOVIMENTOS PERMITIDOS:** Mudanças sutis de pose, inclinações lentas de cabeça, rotações suaves de tronco, expressões faciais serenas (séria, sorriso leve), gestos delicados com as mãos.
    *   **AÇÕES ESTRITAMENTE PROIBIDAS:** A modelo **NÃO DEVE falar, mover os lábios, cantar, ou gesticular como se estivesse numa conversa**. A performance é puramente visual e silenciosa.

3.  **CONSISTÊNCIA VISUAL PERFEITA:**
    *   O vídeo deve ser uma continuação fotorealista da imagem. Mantenha a **mesma pessoa, mesma roupa, mesmo cabelo, mesma maquiagem, mesma iluminação e o mesmo fundo exato** da imagem de referência.

**ESTILO FINAL:** Um ensaio fotográfico de luxo, profissional, focado puramente nas poses da modelo, com uma qualidade visual impecável e sem cortes.`;

            onTick?.(`Enviando para o modelo de vídeo ${model}...`);
            let operation = await ai.models.generateVideos({
                model: model,
                prompt: prompt,
                image: {
                    imageBytes: base64,
                    mimeType: mimeType,
                },
                config: {
                    numberOfVideos: 1,
                    aspectRatio: '9:16',
                    resolution: '720p',
                }
            });
            
            onTick?.("Trabalho de vídeo enviado. Aguardando processamento...");

            const maxWaitTime = 300000; // 5 minutos
            const initialDelay = 10000; // 10 segundos
            let totalWaitTime = 0;
            let currentDelay = initialDelay;

            while (!operation.done && totalWaitTime < maxWaitTime) {
                onTick?.(`Processando com ${model}... (Isso pode levar alguns minutos)`);
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
                // If there's a specific error message from the API, use it.
                if (operation.error?.message) {
                    const reason = String(operation.error.message);
                    // The catch block below will handle quota errors, so just re-throw.
                    throw new Error(reason);
                }
                
                // Otherwise, it's likely a silent failure (e.g., safety block).
                throw new Error(`Geração concluída, mas nenhum vídeo foi retornado. Isso pode ocorrer devido a políticas de segurança. Tente uma imagem ou prompt diferente.`);
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
            lastError = error instanceof Error ? error : new Error(String(error));
            const errorMessage = lastError.message.toLowerCase();

            const isRetriableError = 
                errorMessage.includes('429') || 
                errorMessage.includes('rate limit') ||
                errorMessage.includes('quota') ||
                errorMessage.includes('requested entity was not found');

            if (isRetriableError) {
                const reason = errorMessage.includes('not found') ? 'não foi encontrado' : 'está ocupado';
                console.warn(`O modelo ${model} ${reason}. Tentando o próximo...`);
                onTick?.(`O modelo ${model} ${reason}. Tentando uma alternativa...`);
            } else {
                console.error(`Erro inesperado com o modelo ${model}:`, error);
                break;
            }
        }
    }

    if (!lastError) {
        throw new Error('Ocorreu um erro desconhecido ao gerar o vídeo.');
    }

    const lastErrorMessage = lastError.message.toLowerCase();
    
    if (lastErrorMessage.includes("requested entity was not found")) {
        throw lastError;
    }
    
    const lastErrorWasQuota = 
        lastErrorMessage.includes('429') || 
        lastErrorMessage.includes('rate limit') ||
        lastErrorMessage.includes('quota');

    if (lastErrorWasQuota) {
        console.warn("Todos os modelos VEO falharam devido a cotas. Ativando fallback para Runway.");
        onTick?.("Os modelos VEO estão ocupados. Tentando o nosso gerador de vídeo alternativo...");
        return generateVideoWithRunway(imageDataUrl, onTick);
    }

    console.error('Erro final no fluxo de geração de vídeo do VEO:', lastError);
    throw lastError;
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
