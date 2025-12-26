import { createClient } from '@supabase/supabase-js';

/**
 * Busca uma variável de ambiente em todas as fontes possíveis.
 * Tenta process.env (Node/Vercel), import.meta.env (Vite) e o escopo global.
 */
const getEnvValue = (key: string): string | undefined => {
  // 1. Tenta via process.env
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  // 2. Tenta via import.meta.env
  try {
    // @ts-ignore
    const viteEnv = import.meta.env;
    if (viteEnv && viteEnv[key]) {
      return viteEnv[key];
    }
  } catch (e) {}

  // 3. Tenta via window
  try {
    if (typeof window !== 'undefined' && (window as any)[key]) {
      return (window as any)[key];
    }
  } catch (e) {}

  return undefined;
};

// Mapeia as variáveis de ambiente com fallbacks para as chaves fornecidas
const supabaseUrl = 
  getEnvValue('VITE_SUPABASE_URL') || 
  getEnvValue('NEXT_PUBLIC_SUPABASE_URL') || 
  'https://opuewdyvstcepgyattqg.supabase.co';

const supabaseAnonKey = 
  getEnvValue('VITE_SUPABASE_ANON_KEY') || 
  getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
  'sb_publishable_lopVw8ZFn4df_B6DjfP0kQ_R8PMyQcy';

/**
 * Inicializa o cliente Supabase.
 * Agora utiliza as chaves reais como padrão caso o ambiente não as forneça automaticamente.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
