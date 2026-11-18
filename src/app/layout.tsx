import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Base para links absolutos (canonical, Open Graph, sitemap).
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "bixo.net — ache sua república perto da faculdade",
    template: "%s | bixo.net",
  },
  description:
    "Passou no vestibular? Escolha sua cidade e sua faculdade e veja repúblicas, kitnets e contatos de moradia perto do campus.",
  openGraph: { siteName: SITE_NAME, locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#221a16" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Primeiro item do Tab: pula o cabeçalho (navegação por teclado/leitor de tela). */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:font-semibold focus:text-primary-foreground"
        >
          Pular para o conteúdo
        </a>
        <TooltipProvider delayDuration={150}>
          <SiteHeader />
          <div id="conteudo" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </div>
          <SiteFooter />
        </TooltipProvider>
      </body>
    </html>
  );
}
