import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Acessibilidade automática (axe): contraste, rótulos, ARIA, estrutura de títulos.
// Não substitui teste com leitor de tela, mas pega a maior parte dos erros comuns.

const PAGES = [
  "/",
  "/sorocaba",
  "/sorocaba/unesp",
  "/sorocaba/unesp/moradia",
  "/republica/rep-jabuticaba-exemplo",
  "/entrar",
  "/cadastrar-republica",
  "/sobre",
  "/privacidade",
  "/termos",
];

for (const path of PAGES) {
  test(`sem violações de acessibilidade em ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.locator("main").first().waitFor();
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // O mapa (canvas do MapLibre) é decorativo para leitores de tela; a lista é a alternativa.
      .exclude(".maplibregl-canvas")
      .analyze();

    const summary = results.violations.map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes.length}x — ${v.help}\n   ${v.nodes[0]?.target.join(" ")}`,
    );
    expect(summary, summary.join("\n")).toEqual([]);
  });
}

test("o primeiro Tab leva ao 'Pular para o conteúdo'", async ({ page }) => {
  await page.goto("/sorocaba/unesp");
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#conteudo")).toBeFocused();
});
