
/**
 * RELATÓRIO DE ALTERAÇÕES APLICADAS (SUPABASE & RLS)
 * 
 * 1) Estrutura: RLS habilitado em todas as tabelas (profiles, folders, products, posts, likes, comments).
 * 2) Políticas: Adicionada política FOR ALL para 'products', permitindo que o dono atualize seus itens.
 * 3) Automação: Campo 'updated_at' integrado na tabela 'products' para rastreio de modificações.
 * 4) Segurança: Todas as checagens de propriedade usam 'auth.uid()' contra 'user_id' ou 'owner_id'.
 * 5) Experiência: Logout agora força 'location.reload(true)' para limpeza completa de cache e estados sensíveis.
 */

export const DB_ALIGNMENT_VERSION = "2.3.0";
export const LAST_RLS_UPDATE = "2025-05-22";

export const RLSSummary = {
    posts: "INSERT/UPDATE/DELETE restrito a auth.uid() == user_id",
    folders: "INSERT/UPDATE/DELETE restrito a auth.uid() == owner_id",
    products: "FOR ALL restrito a auth.uid() == owner_id (Habilitada Edição)",
    profiles: "UPDATE restrito a auth.uid() == user_id. Criação via Trigger.",
    interactions: "Leitura pública, escrita restrita ao usuário autenticado."
};
