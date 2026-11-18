import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { retryOnTimeout } from "@/lib/supabase/retry";

/** Repúblicas publicadas (sem exemplos) para o sitemap. */
export async function listPublicRepublics(): Promise<
  { slug: string; updatedAt: string }[]
> {
  "use cache";
  cacheLife("hours");
  cacheTag("republics");

  const { data, error } = await retryOnTimeout(() =>
    createPublicClient().rpc("list_public_republics"),
  );
  if (error || !data) throw new Error(`Erro ao montar o sitemap: ${error?.message}`);
  return data.map((r) => ({ slug: r.slug, updatedAt: r.updated_at }));
}
