const STATEMENT_TIMEOUT = "57014";

type Result<T> = { data: T | null; error: { code?: string; message: string } | null };

/**
 * Repete a consulta uma vez se o banco cancelar por tempo (código 57014).
 * Numa conexão nova, a 1ª chamada ao PostGIS carrega a biblioteca e pode passar dos 3 s
 * do papel anon (acontece no Supabase local do Docker no Windows; raro na nuvem).
 */
export async function retryOnTimeout<T>(
  query: () => PromiseLike<Result<T>>,
): Promise<Result<T>> {
  const first = await query();
  if (first.error?.code !== STATEMENT_TIMEOUT) return first;
  return query();
}
