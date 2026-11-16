import { expect, type Page, test } from "@playwright/test";

// Precisa do Supabase local rodando com o seed (npm run db:start / db:reset).

const isMobile = (projectName: string) => projectName === "mobile";

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test("da home até a busca escolhendo a faculdade", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Faculdade" }).click();
  await page.getByPlaceholder("Ex.: unesp, federal, puc").fill("unesp");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/sorocaba\/unesp$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Unesp");
  await expect(page.getByTestId("republic-card")).toHaveCount(6);
  await expect(page.getByTestId("republic-card").first()).toContainText("Rep Jabuticaba");
  await expectNoHorizontalScroll(page);
});

test("o autocomplete entende nome sem sigla", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Faculdade" }).click();
  await page.getByPlaceholder("Ex.: unesp, federal, puc").fill("federal");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option")).toContainText("UFSCar");
});

test("a república pendente não aparece", async ({ page }) => {
  await page.goto("/sorocaba/puc-sp?raio=10");
  await expect(page.getByTestId("republic-card").first()).toBeVisible();
  await expect(page.getByText("Rep Quintal")).toHaveCount(0);
});

test("filtrar por tipo atualiza a URL e a lista", async ({ page }, testInfo) => {
  await page.goto("/sorocaba/unesp");
  await expect(page.getByTestId("republic-card")).toHaveCount(6);

  if (isMobile(testInfo.project.name)) {
    await page.getByRole("button", { name: /Filtros/ }).click();
  }
  await page.getByRole("radio", { name: "Feminina" }).click();

  await expect(page).toHaveURL(/tipo=feminina/);
  await expect(page.getByTestId("republic-card")).toHaveCount(2);
  for (const card of await page.getByTestId("republic-card").all()) {
    await expect(card).toContainText("Feminina");
  }
});

test("estado vazio sugere aumentar a distância", async ({ page }) => {
  await page.goto("/sorocaba/unesp?tipo=feminina&raio=1");
  await expect(page.getByTestId("empty-state")).toBeVisible();

  // O botão vem do servidor; espera o React hidratar antes de clicar.
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Aumentar a distância" }).click();
  await expect(page).toHaveURL(/raio=2/, { timeout: 15_000 });
  await expect(page.getByTestId("republic-card")).toHaveCount(1);
});

test("filtro inválido na URL é ignorado", async ({ page }) => {
  await page.goto("/sorocaba/unesp?tipo=alien&raio=999");
  await expect(page.getByTestId("republic-card")).toHaveCount(6);
});

test("o mapa aparece", async ({ page }, testInfo) => {
  await page.goto("/sorocaba/unesp");
  if (isMobile(testInfo.project.name)) {
    await page.getByRole("tab", { name: "Mapa" }).click();
  }
  const map = page.getByTestId("republic-map");
  await expect(map).toBeVisible();
  await expect(map.locator("canvas")).toBeVisible({ timeout: 15_000 });
  await expect(map.getByText("OpenStreetMap").first()).toBeVisible();
});

test("página da cidade lista as faculdades", async ({ page }) => {
  await page.goto("/sorocaba");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Repúblicas em Sorocaba",
  );
  await expect(page.getByRole("link", { name: /UFSCar/ })).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("faculdade inexistente mostra a página 404 e não é indexada", async ({ page }) => {
  // Com streaming (Cache Components), o status já saiu como 200 quando o notFound() roda;
  // o Next mostra a tela de 404 e marca a página como noindex.
  await page.goto("/sorocaba/faculdade-que-nao-existe");
  await expect(
    page.getByRole("heading", { name: "Não achamos essa página" }),
  ).toBeVisible();
  await expect(
    page.locator('meta[name="robots"][content*="noindex"]').first(),
  ).toBeAttached();
});

test("cidade inexistente mostra a página 404", async ({ page }) => {
  await page.goto("/cidade-que-nao-existe");
  await expect(
    page.getByRole("heading", { name: "Não achamos essa página" }),
  ).toBeVisible();
});
