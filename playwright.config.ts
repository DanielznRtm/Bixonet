import { defineConfig, devices } from "@playwright/test";

// Os testes e2e rodam contra o BUILD DE PRODUÇÃO (porta 3100): é o que o usuário recebe,
// e o servidor de dev compila cada página na primeira visita, o que deixa os testes instáveis.
// Precisa do Supabase local rodando (npm run db:start).
const PORT = 3100;

// Dois tamanhos que a skill bixo-design exige: celular (375px) e desktop (1280px).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // 1 worker: com o Supabase local no Docker do Windows, testes em paralelo disputam o banco
  // e estouram o tempo. Em CI (Linux) dá para subir esse número.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  // O Supabase local no Docker do Windows às vezes leva alguns segundos na 1ª consulta.
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    // Nunca reaproveita: um servidor velho na porta 3100 testaria um build desatualizado.
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
