import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Cliente para dados PÚBLICOS (busca, páginas de faculdade, sitemap).
 * Não lê cookies de login, então as páginas que usam só ele podem ser cacheadas.
 */
export function createPublicClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
