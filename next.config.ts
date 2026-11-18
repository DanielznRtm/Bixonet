import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
// Supabase local (dev e e2e) roda em 127.0.0.1: o Next bloqueia otimizar imagem de IP local
// por segurança, então só liberamos nesse caso. Em produção (*.supabase.co) fica bloqueado.
const isLocalSupabase = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(supabaseUrl);

// Cabeçalhos de segurança em todas as respostas.
const securityHeaders = [
  // Ninguém coloca o bixo.net dentro de um iframe (evita clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // O navegador não "adivinha" o tipo do arquivo.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Links externos recebem só o domínio, nunca o caminho completo.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Recursos do aparelho que o site não usa ficam desligados.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Fotos das repúblicas: só do bucket público do nosso Supabase.
    remotePatterns: [
      new URL(`${supabaseUrl}/storage/v1/object/public/republic-photos/**`),
    ],
    dangerouslyAllowLocalIP: isLocalSupabase,
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
