import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Cliente com a sessão do usuário (dono de república / admin), para Server Components,
 * Server Actions e Route Handlers. Ler cookies torna a rota dinâmica: use só onde precisa de login.
 */
export async function createSessionClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components não podem gravar cookies. Tudo bem: o proxy de sessão
          // (Fase 5) renova o token antes de a página renderizar.
        }
      },
    },
  });
}
