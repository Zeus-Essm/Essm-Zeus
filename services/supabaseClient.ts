import { createClient } from '@supabase/supabase-js';

/**
 * Busca variáveis de ambiente de forma segura, evitando TypeErrors
 * caso import.meta ou process não estejam definidos no contexto atual.
 */
const getEnvVar = (key: string): string => {
  // 1. Tenta via import.meta (Vite/ESM)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}

  // 2. Tenta via process.env (Node/CommonJS shims)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {}

  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY');

/**
 * Verificação de validade para evitar que o createClient lance 'supabaseUrl is required'.
 * Se as variáveis estiverem ausentes, usamos URLs fictícias mas válidas para manter o app vivo.
 */
const isValid = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey;

const finalUrl = isValid ? supabaseUrl : 'https://placeholder-project.supabase.co';
const finalKey = isValid ? supabaseAnonKey : 'placeholder-key-for-preview-mode';

// Exportamos o cliente. Se estiver em modo placeholder, as chamadas de banco retornarão erro 404/401
// mas a aplicação NÃO irá travar no carregamento.
export const supabase = createClient(finalUrl, finalKey);

if (!isValid) {
  console.warn("[PUMP] Supabase rodando em modo de pré-visualização (variáveis de ambiente ausentes).");
}
