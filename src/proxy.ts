import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Renova a sessão do Supabase (troca o token vencido e regrava o cookie) antes da página
 * renderizar. Roda SÓ nas rotas com login: as páginas públicas não leem cookie e continuam
 * em cache.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          // Cabeçalhos anti-cache: resposta que grava cookie de login nunca vai para CDN.
          for (const [key, value] of Object.entries(headers))
            response.headers.set(key, value);
        },
      },
    },
  );

  // Valida o token (e renova se precisar). Não coloque código entre o client e esta chamada.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    "/entrar",
    "/auth/:path*",
    "/cadastrar-republica/:path*",
    "/minhas-reps/:path*",
    "/admin/:path*",
  ],
};
