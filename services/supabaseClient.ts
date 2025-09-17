import { createClient } from '@supabase/supabase-js';

// Conexão com o seu projeto Supabase
const supabaseUrl = 'https://ogyzxyomlrhqlvmqexew.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neXp4eW9tbHJocWx2bXFleGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzcyNDgsImV4cCI6MjA3MDc1MzI0OH0.9Vh8fyonr57JEsMrJvn5FmFp51lBNvVtRpWlS0YT0Zg';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Essencial para fluxos OAuth
    flowType: 'pkce',         // Recomendado para segurança
  },
});
