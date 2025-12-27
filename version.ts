
/**
 * RELATÓRIO DE ALTERAÇÕES APLICADAS (SUPABASE & ESTRUTURA)
 * 
 * 1) SEGUIDORES: Tabela 'follows' criada para suportar relações UUID-UUID (Loja e Pessoal).
 * 2) VTO FLOW: Lógica integrada para upload obrigatório antes da prova em itens de loja.
 * 3) SQL RECOMENDADO:
 */

/*
-- Tabela de Seguidores Universais
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(follower_id, following_id)
);

-- RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ver seguidores" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Usuários podem seguir outros" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Usuários podem deixar de seguir" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
*/

export const DB_ALIGNMENT_VERSION = "2.6.0";
export const LAST_FEATURE_UPDATE = "2025-05-25 (Universal Follows & VTO-to-Post Flow)";
