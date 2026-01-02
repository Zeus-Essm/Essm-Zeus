import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Busca variáveis de ambiente de forma segura em diferentes contextos (Vite ou Node/Shims).
 */
const getEnvVar = (key: string): string | undefined => {
  try {
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch {}

  try {
    if (typeof process !== "undefined" && process.env?.[key]) {
      return process.env[key];
    }
  } catch {}

  return undefined;
};

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL") ?? getEnvVar("SUPABASE_URL");
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY") ?? getEnvVar("SUPABASE_ANON_KEY");

/**
 * Validação rigorosa para garantir que o createClient não receba parâmetros inválidos.
 */
const isValidSupabaseConfig =
  typeof supabaseUrl === "string" &&
  supabaseUrl.startsWith("https://") &&
  typeof supabaseAnonKey === "string" &&
  supabaseAnonKey.length > 20;

/**
 * Exporta o cliente como SupabaseClient ou null.
 * O uso de null força os desenvolvedores a tratarem a ausência de conexão via tipagem e verificações.
 */
export const supabase: SupabaseClient | null =
  isValidSupabaseConfig
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!isValidSupabaseConfig) {
  console.warn(
    "[PUMP] Supabase: Cliente não inicializado (variáveis ausentes). Operando em modo de visualização."
  );
}
