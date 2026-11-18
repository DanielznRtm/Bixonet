import { expect, test } from "@playwright/test";

// Precisa do Supabase local rodando com o seed (npm run db:start / db:reset).

test("da busca de repúblicas para 'Outras opções' e de volta", async ({ page }) => {
  await page.goto("/sorocaba/unesp");
  await page.getByRole("link", { name: "Outras opções", exact: true }).click();

  await expect(page).toHaveURL(/\/sorocaba\/unesp\/moradia$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Moradia perto da Unesp",
  );
  await expect(
    page.getByRole("link", { name: "Outras opções", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await page.getByRole("link", { name: "Repúblicas", exact: true }).click();
  await expect(page).toHaveURL(/\/sorocaba\/unesp$/);
});

test("UFSCar mostra o contato de moradia e a moradia própria", async ({ page }) => {
  await page.goto("/sorocaba/ufscar/moradia");
  const card = page.getByTestId("housing-contact-card");
  await expect(card).toContainText("Tem moradia estudantil própria");
  await expect(card.getByRole("link", { name: "deace.sor@ufscar.br" })).toHaveAttribute(
    "href",
    "mailto:deace.sor@ufscar.br",
  );
});

test("faculdade sem contato confirmado mostra o aviso", async ({ page }) => {
  await page.goto("/sorocaba/unesp/moradia");
  const card = page.getByTestId("housing-contact-card");
  await expect(card).toContainText(
    "Ainda não confirmamos um contato de moradia da Unesp",
  );
  await expect(card.getByRole("link", { name: "site da Unesp" })).toHaveAttribute(
    "href",
    "https://www.sorocaba.unesp.br",
  );
});

test("imóveis em ordem de distância, com exemplo desativado", async ({ page }) => {
  await page.goto("/sorocaba/unesp/moradia");
  const cards = page.getByTestId("listing-card");
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).toContainText("Kitnet mobiliada perto da Unesp");
  await expect(cards.first()).toContainText("R$ 950/mês");
  await expect(
    cards.first().getByRole("button", { name: "Anúncio de exemplo" }),
  ).toBeDisabled();
});

test("filtro 'só mobiliados' atualiza a URL e a lista", async ({ page }) => {
  await page.goto("/sorocaba/unesp/moradia");
  await expect(page.getByTestId("listing-card")).toHaveCount(3);
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Só mobiliados").click();
  await expect(page).toHaveURL(/mobiliado=1/);
  await expect(page.getByTestId("listing-card")).toHaveCount(2);
});

test("sem imóveis no raio mostra o estado vazio com link para repúblicas", async ({
  page,
}) => {
  await page.goto("/sorocaba/facens/moradia?raio=1&ate=800");
  const empty = page.getByTestId("listings-empty");
  await expect(empty).toBeVisible();
  await expect(empty.getByRole("link", { name: "Ver repúblicas" })).toHaveAttribute(
    "href",
    "/sorocaba/facens",
  );
});

test("dicas de aluguel e sem rolagem horizontal", async ({ page }) => {
  await page.goto("/sorocaba/unesp/moradia");
  await expect(page.getByRole("heading", { name: "Antes de alugar" })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("faculdade inexistente na moradia mostra a página 404", async ({ page }) => {
  await page.goto("/sorocaba/nao-existe/moradia");
  await expect(
    page.getByRole("heading", { name: "Não achamos essa página" }),
  ).toBeVisible();
});
