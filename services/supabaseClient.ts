import { createClient } from '@supabase/supabase-js';

function safeGetEnv(key: string): string | undefined {
  if (typeof window !== 'undefined') {
    const w = window as any;
    if (w[`__${key}__`]) return w[`__${key}__`];
    const short = key.replace('VITE_', '');
    if (w[`__${short}__`]) return w[`__${short}__`];
  }

  try {
    const meta = (import.meta as any);
    return meta?.env?.[key];
  } catch {
    return undefined;
  }
}

const SUPABASE_URL = safeGetEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = safeGetEnv('VITE_SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[Supabase] ENV missing', {
    SUPABASE_URL: !!SUPABASE_URL,
    SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY
  });
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);