import { expect, test } from "@playwright/test";

// Precisa do Supabase local rodando com o seed (npm run db:start / db:reset).

const JABUTICABA = "/republica/rep-jabuticaba-exemplo";

test("da busca até a página da república", async ({ page }) => {
  await page.goto("/sorocaba/unesp");
  await page.getByRole("link", { name: "Rep Jabuticaba (exemplo)" }).click();

  await expect(page).toHaveURL(/\/republica\/rep-jabuticaba-exemplo\?de=unesp$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Rep Jabuticaba (exemplo)",
  );
  await expect(
    page.getByRole("link", { name: "Repúblicas perto da Unesp" }),
  ).toHaveAttribute("href", "/sorocaba/unesp");
});

test("mostra preço, comodidades e faculdades próximas", async ({ page }) => {
  await page.goto(JABUTICABA);
  await expect(page.getByText("R$ 650–800/mês").first()).toBeVisible();
  await expect(page.getByText("Wi-Fi")).toBeVisible();

  const nearby = page.getByRole("list", { name: "Faculdades próximas" });
  await expect(nearby.getByRole("link").first()).toContainText("Unesp");
  await expect(nearby.getByRole("link").first()).toContainText("~400 m");
});

test("república de exemplo não tem contato", async ({ page }) => {
  await page.goto(JABUTICABA);
  const button = page.getByTestId("whatsapp-button").filter({ visible: true });
  await expect(button).toBeDisabled();
  await expect(
    page.getByText("República de exemplo: sem contato.").filter({ visible: true }),
  ).toBeVisible();
});

test("república de exemplo não é indexada", async ({ page }) => {
  await page.goto(JABUTICABA);
  await expect(
    page.locator('meta[name="robots"][content*="noindex"]').first(),
  ).toBeAttached();
});

test("o mapa da área aparece ao rolar até ele", async ({ page }) => {
  await page.goto(JABUTICABA);
  const map = page.getByTestId("area-map");
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator("canvas")).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("reportar informação errada", async ({ page }) => {
  await page.goto(JABUTICABA);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Reportar informação errada" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("A república não existe mais").check();
  await dialog.getByLabel("Detalhes (opcional)").fill("Teste automatizado (e2e).");
  await dialog.getByRole("button", { name: "Enviar" }).click();

  await expect(dialog.getByText("Obrigado por avisar!")).toBeVisible();
});

test("república pendente mostra a página 404", async ({ page }) => {
  await page.goto("/republica/rep-quintal-exemplo");
  await expect(
    page.getByRole("heading", { name: "Não achamos essa página" }),
  ).toBeVisible();
});
