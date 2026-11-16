import { describe, expect, it } from "vitest";
import { createPublicClient } from "./public";

// Precisa do Supabase local rodando (npm run db:start + db:reset) e do .env.local preenchido.
// Rode com: npm run test:integration
const UNESP_SOROCABA = "00000000-0000-4000-8000-000000000101";

describe.runIf(import.meta.env.MODE === "integration")(
  "search_republics (banco local)",
  () => {
    it("devolve repúblicas aprovadas perto da Unesp, ordenadas pela distância", async () => {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("search_republics", {
        p_institution_id: UNESP_SOROCABA,
      });

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);

      const distances = (data ?? []).map((r) => r.distance_m);
      expect(distances).toEqual([...distances].sort((a, b) => a - b));
      expect(data?.some((r) => r.slug === "rep-quintal-exemplo")).toBe(false);
    });

    it("o público não lê a tabela republics direto", async () => {
      const supabase = createPublicClient();
      const { error } = await supabase.from("republics").select("id").limit(1);
      expect(error?.code).toBe("42501");
    });
  },
);
