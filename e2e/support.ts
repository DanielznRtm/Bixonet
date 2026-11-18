import { expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Variáveis do Supabase local (URL e chave secreta) para preparar e limpar dados de teste.
try {
  process.loadEnvFile(".env.local");
} catch {
  // em CI as variáveis já vêm do ambiente
}

const MAILPIT = "http://127.0.0.1:54324";

export function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );
}

/** Lê o link de login mais recente enviado para `email` na caixa de teste local (Mailpit). */
async function latestMagicLink(email: string): Promise<string> {
  let link: string | undefined;
  await expect
    .poll(
      async () => {
        const search = await fetch(
          `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}&limit=1`,
        ).then((r) => r.json());
        const id = search.messages?.[0]?.ID;
        if (!id) return false;
        const message = await fetch(`${MAILPIT}/api/v1/message/${id}`).then((r) =>
          r.json(),
        );
        const body: string = `${message.HTML ?? ""} ${message.Text ?? ""}`;
        link = body.match(/https?:\/\/[^\s"'<>]+\/auth\/v1\/verify[^\s"'<>]+/)?.[0];
        return Boolean(link);
      },
      { timeout: 20_000, message: `e-mail de login para ${email} não chegou` },
    )
    .toBe(true);
  return link!.replace(/&amp;/g, "&");
}

/** Entra pelo /entrar: pede o link, abre o e-mail e segue o link (sem senha). */
export async function signIn(page: Page, email: string, next = "/minhas-reps") {
  await page.goto(`/entrar?next=${encodeURIComponent(next)}`);
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
  await page.getByLabel("Seu e-mail").fill(email);
  await page.getByRole("button", { name: "Receber link de acesso" }).click();
  await expect(page.getByText("Confira seu e-mail")).toBeVisible();
  await page.goto(await latestMagicLink(email));
  await page.waitForURL((url) => url.pathname === next.split("?")[0]);
  // Espera o React assumir a página: clique antes disso pode ser desfeito na hidratação.
  // Páginas com mapa ficam baixando tiles, então a espera tem limite.
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
}

/** Apaga tudo o que os testes criaram (repúblicas, usuários e admins). */
export async function cleanup(emails: string[], namePrefix: string) {
  const db = adminDb();
  await db.from("republics").delete().like("name", `${namePrefix}%`);
  const { data } = await db.auth.admin.listUsers({ perPage: 1000 });
  for (const user of data?.users ?? []) {
    if (user.email && emails.includes(user.email))
      await db.auth.admin.deleteUser(user.id);
  }
}

/** Foto de teste (PNG 64×48) para o upload. */
export const TEST_PHOTO = "e2e/fixtures/casa.png";
