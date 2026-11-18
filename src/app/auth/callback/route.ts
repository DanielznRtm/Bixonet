import { type NextRequest, NextResponse } from "next/server";
import { safeNext } from "@/lib/auth/next-path";
import { createSessionClient } from "@/lib/supabase/server";

/** O link do e-mail cai aqui com ?code=…; trocamos o código pela sessão e seguimos. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("Erro ao confirmar login:", error.message);
  }
  return NextResponse.redirect(
    `${origin}/entrar?erro=link&next=${encodeURIComponent(next)}`,
  );
}
