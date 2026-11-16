import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Cliente para dados PÚBLICOS (busca, páginas de faculdade, sitemap).
 * Não lê cookies de login, então as páginas que usam só ele podem ser cacheadas.
 * TODO(Fase 1, com Docker): tipar com `Database` de "@/types/database" depois do `npm run db:types`.
 */
export function createPublicClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
