import { expect, test } from "@playwright/test";
import { adminDb, cleanup, signIn, TEST_PHOTO } from "./support";

// Fluxo completo de cadastro e moderação. Precisa do Supabase local (com a caixa de e-mails
// de teste, Mailpit). Cada projeto (mobile/desktop) usa e-mails e nomes próprios.
test.describe.configure({ mode: "serial", timeout: 60_000 });

const RUN = Date.now();
let owner: string;
let admin: string;
let stranger: string;
let repName: string;
const PREFIX = `Rep E2E ${RUN}`;

test.beforeAll(async ({}, testInfo) => {
  const tag = `${testInfo.project.name}-${RUN}`;
  owner = `dono-${tag}@example.com`;
  admin = `admin-${tag}@example.com`;
  stranger = `outro-${tag}@example.com`;
  repName = `${PREFIX} ${testInfo.project.name}`;

  // O admin é criado direto pela API (no site, isso é feito com npm run admin:add).
  const db = adminDb();
  const { data, error } = await db.auth.admin.createUser({
    email: admin,
    email_confirm: true,
  });
  if (error) throw error;
  await db.from("admins").insert({ user_id: data.user.id });
});

test.afterAll(async () => {
  await cleanup([owner, admin, stranger], PREFIX);
});

test("login por link mágico leva para Minhas reps", async ({ page }) => {
  await signIn(page, owner);
  await expect(page.getByRole("heading", { name: "Minhas reps" })).toBeVisible();
  await expect(page.getByText(`Logado como ${owner}`)).toBeVisible();
  await expect(
    page.getByText("Você ainda não cadastrou nenhuma república."),
  ).toBeVisible();
});

test("cadastro em 5 etapas fica em análise e não aparece na busca", async ({ page }) => {
  await signIn(page, owner, "/cadastrar-republica");
  await expect(page.getByRole("heading", { name: "Básico" })).toBeVisible();

  // 1. Básico (tentar avançar vazio mostra os erros)
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Dê um nome para a república.")).toBeVisible();
  await page.getByLabel("Nome da república").fill(repName);
  await page.getByText("Mista", { exact: true }).click();
  await page.getByLabel("Moradores (hoje)").fill("5");
  await page.getByLabel("Vagas abertas").fill("2");
  await page.getByLabel("Preço mínimo (R$/mês)").fill("600");
  await page.getByLabel("Preço máximo (R$/mês)").fill("750");
  await page.getByRole("button", { name: "Continuar" }).click();

  // 2. Onde fica: bairro + toque no mapa + faculdade
  await expect(page.getByRole("heading", { name: "Onde fica" })).toBeVisible();
  await page.getByLabel("Bairro", { exact: true }).fill("Centro");
  const picker = page.getByTestId("location-picker");
  await expect(picker.locator("canvas")).toBeVisible({ timeout: 20_000 });
  await picker.locator("canvas").click({ position: { x: 120, y: 120 } });
  await expect(
    picker.getByLabel("Ponto da república (arraste para ajustar)"),
  ).toBeVisible();
  await page.getByRole("checkbox", { name: "Unesp" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  // 3. A casa
  await expect(page.getByRole("heading", { name: "A casa" })).toBeVisible();
  await page
    .getByLabel("Sobre a casa", { exact: true })
    .fill("Casa de teste automatizado, com quintal e perto do ponto de ônibus.");
  await page.getByRole("checkbox", { name: "Wi-Fi" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  // 4. Fotos (reduzida no navegador e enviada ao Storage)
  await expect(page.getByRole("heading", { name: "Fotos" })).toBeVisible();
  await page.getByTestId("photo-input").setInputFiles(TEST_PHOTO);
  await expect(page.getByAltText("Foto 1")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Continuar" }).click();

  // 5. Contato e consentimentos
  await expect(page.getByRole("heading", { name: "Contato" })).toBeVisible();
  await page.getByLabel("Nome para contato").fill("Ana");
  await page.getByLabel("WhatsApp", { exact: true }).fill("(15) 99123-4567");
  await page.getByRole("button", { name: "Enviar para análise" }).click();
  await expect(page.getByText("É preciso autorizar a exibição")).toBeVisible();
  await page.getByText("Moro nesta república").click();
  await page.getByText("Autorizo exibir estas informações").click();
  await page.getByRole("button", { name: "Enviar para análise" }).click();

  await page.waitForURL(/\/minhas-reps\?enviado=/);
  const card = page.getByTestId("my-republic").filter({ hasText: repName });
  await expect(card).toContainText("Em análise");

  await page.goto("/sorocaba/unesp?raio=10");
  await expect(page.getByTestId("republic-card").first()).toBeVisible();
  await expect(page.getByText(repName)).toHaveCount(0);
});

test("admin aprova e a república aparece na busca", async ({ page }) => {
  await signIn(page, admin, "/admin");
  const review = page.getByTestId("admin-republic").filter({ hasText: repName });
  await expect(review).toBeVisible();
  await review.getByRole("button", { name: "Aprovar" }).click();
  await expect(review).toHaveCount(0);

  await page.goto("/sorocaba/unesp?raio=10");
  await expect(page.getByRole("link", { name: repName })).toBeVisible();
  await page.getByRole("link", { name: repName }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(repName);
  const whatsapp = page.getByTestId("whatsapp-button").filter({ visible: true });
  await expect(whatsapp).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/5515991234567\?text=/,
  );
});

test("admin recusa com motivo e o dono vê o motivo", async ({ page }) => {
  // Uma segunda república do dono, criada direto no banco para encurtar o teste.
  const db = adminDb();
  const { data: users } = await db.auth.admin.listUsers({ perPage: 1000 });
  const ownerId = users.users.find((u) => u.email === owner)!.id;
  const { data: city } = await db
    .from("cities")
    .select("id")
    .eq("slug", "sorocaba")
    .single();
  await db.from("republics").insert({
    slug: `e2e-recusar-${RUN}-${test.info().project.name}`,
    name: `${repName} (recusar)`,
    kind: "male",
    city_id: city!.id,
    approx_location: "SRID=4326;POINT(-47.45 -23.5)",
    consent_at: new Date().toISOString(),
    owner_user_id: ownerId,
    status: "pending",
  });

  await signIn(page, admin, "/admin");
  const review = page
    .getByTestId("admin-republic")
    .filter({ hasText: `${repName} (recusar)` });
  await review.getByRole("button", { name: "Recusar" }).click();
  await page.getByLabel("Motivo", { exact: true }).fill("Faltaram fotos dos quartos.");
  await page.getByRole("dialog").getByRole("button", { name: "Recusar" }).click();
  await expect(review).toHaveCount(0);

  await page.context().clearCookies();
  await signIn(page, owner);
  const card = page
    .getByTestId("my-republic")
    .filter({ hasText: `${repName} (recusar)` });
  await expect(card).toContainText("Recusada");
  await expect(card).toContainText("Faltaram fotos dos quartos.");
});

test("quem não é admin não vê o painel", async ({ page }) => {
  await signIn(page, stranger);
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Não achamos essa página" }),
  ).toBeVisible();
});
