import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string | null };

/** Usuário logado (ou null). Lê cookies: use dentro de <Suspense>. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // A validação do token usa a hora atual: marca este trecho como "por requisição" para o
  // Next não tentar pré-renderizá-lo (Cache Components).
  await connection();
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: (claims.email as string | undefined) ?? null };
}

/** Exige login; sem sessão, manda para /entrar e volta para `next` depois. */
export async function requireUser(next: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return user;
}

/** O usuário logado é admin? (consulta a função is_admin do banco, que olha a tabela admins) */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}
