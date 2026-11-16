import { expect, test } from "@playwright/test";

test("home carrega em português e sem rolagem horizontal", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/bixo\.net/);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
