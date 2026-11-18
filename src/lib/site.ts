// Configurações públicas do site (vêm das variáveis de ambiente; veja .env.example).

/** Endereço público do site, sem barra no final. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const SITE_NAME = "bixo.net";

/**
 * Responsável pelo tratamento de dados (LGPD) e canal de contato. Obrigatórios em produção:
 * o build na Vercel falha se faltarem, para o site não ir ao ar com a política incompleta.
 */
export const CONTROLLER_NAME = process.env.NEXT_PUBLIC_CONTROLLER_NAME ?? null;
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null;

if (process.env.VERCEL_ENV === "production" && (!CONTROLLER_NAME || !CONTACT_EMAIL)) {
  throw new Error(
    "Defina NEXT_PUBLIC_CONTROLLER_NAME e NEXT_PUBLIC_CONTACT_EMAIL na Vercel antes de publicar.",
  );
}
