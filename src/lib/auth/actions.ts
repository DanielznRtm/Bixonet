"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSessionClient } from "@/lib/supabase/server";
import { safeNext } from "./next-path";

export type MagicLinkState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

const emailSchema = z.email("Digite um e-mail válido.");

/** Envia o link de login por e-mail (sem senha). */
export async function sendMagicLink(
  _prev: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const parsed = emailSchema.safeParse(
    String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
  );
  if (!parsed.success)
    return { status: "error", message: parsed.error.issues[0].message };

  const next = safeNext(String(formData.get("next") ?? ""));
  // O link volta para o mesmo endereço em que a pessoa está (dev, e2e ou produção).
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("Erro ao enviar link de login:", error.message);
    return {
      status: "error",
      message:
        error.status === 429
          ? "Muitos pedidos seguidos. Espere um minuto e tente de novo."
          : "Não deu para enviar o link agora. Tente de novo em instantes.",
    };
  }
  return { status: "sent", email: parsed.data };
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/");
}
