import { createClient } from '@supabase/supabase-js';

/**
 * Lê variáveis de ambiente de forma segura
 * Compatível com:
 * - WEB (Vite / Vercel)
 * - WEB → APP (WebView, wrapper, PWA)
 */
function safeGetEnv(key: string): string | undefined {
  // 1️⃣ Web → App (index.html)
  if (typeof window !== 'undefined') {
    const w = window as any;
    if (w[`__${key}__`]) return w[`__${key}__`];
    if (w[`__${key.replace('VITE_', '')}__`]) return w[`__${key.replace('VITE_', '')}__`];
  }

  // 2️⃣ Web (Vite)
  try {
    const meta = (import.meta as any);
    return meta?.env?.[key];
  } catch (err) {
    return undefined;
  }
}

const SUPABASE_URL = safeGetEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = safeGetEnv('VITE_SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[SUPABASE INIT FAILED]', {
    url: SUPABASE_URL ? 'OK' : 'MISSING',
    anonKey: SUPABASE_ANON_KEY ? 'OK' : 'MISSING',
    runtime: typeof window !== 'undefined' ? 'browser/webview' : 'server'
  });
  throw new Error('Supabase ENV ausente');
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);