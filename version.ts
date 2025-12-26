
/**
 * RELATÓRIO DE ALTERAÇÕES APLICADAS (SUPABASE & RLS)
 * 
 * 1) Estrutura: RLS habilitado em todas as tabelas (profiles, folders, products, posts, likes, comments).
 * 2) Políticas: Substituídas regras FOR ALL por políticas granulares (INSERT/UPDATE/DELETE).
 * 3) Automação: Trigger 'on_auth_user_created' cria automaticamente o perfil ao registrar.
 * 4) Segurança: Todas as checagens de propriedade usam 'auth.uid()' contra 'user_id' ou 'owner_id'.
 * 5) Performance: Índices criados nas colunas de relacionamento para otimização de consultas filtradas por RLS.
 */

export const DB_ALIGNMENT_VERSION = "2.2.0";
export const LAST_RLS_UPDATE = "2025-05-20";

export const RLSSummary = {
    posts: "INSERT/UPDATE/DELETE restrito a auth.uid() == user_id",
    folders: "INSERT/UPDATE/DELETE restrito a auth.uid() == owner_id",
    products: "INSERT/UPDATE/DELETE restrito a auth.uid() == owner_id",
    profiles: "UPDATE restrito a auth.uid() == user_id. Criação via Trigger.",
    interactions: "Leitura pública, escrita restrita ao usuário autenticado."
};
