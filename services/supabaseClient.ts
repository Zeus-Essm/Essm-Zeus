
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (window as any).__SUPABASE_URL__;

const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (window as any).__SUPABASE_ANON_KEY__;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase ENV não encontrada. Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas ou se o objeto window.__SUPABASE_URL__ está definido.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
