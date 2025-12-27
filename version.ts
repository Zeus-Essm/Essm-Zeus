
/**
 * RELATÓRIO DE ALTERAÇÕES APLICADAS (SUPABASE & ESTRUTURA)
 * 
 * 1) STORAGE: O bucket 'avatars' deve ser público.
 * 2) FILENAMES: 
 *    - Perfil Pessoal: `[user_id]/avatar.[ext]`
 *    - Perfil Empresa: `[user_id]/logo.[ext]`
 *    - Isso permite usar 'upsert: true' de forma previsível.
 * 3) SQL RECOMENDADO:
 */

/*
-- Adicionar coluna de controle de atualização se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Política de Storage (Buckets)
-- Permite que usuários autenticados gerenciem seus próprios arquivos na pasta com seu UID
CREATE POLICY "Upload de Avatares Próprios" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política de Leitura Pública
CREATE POLICY "Visualização Pública de Avatares" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');
*/

export const DB_ALIGNMENT_VERSION = "2.5.0";
export const LAST_FEATURE_UPDATE = "2025-05-24 (Profile Photo Sync)";
