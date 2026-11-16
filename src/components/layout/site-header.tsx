import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Logo() {
  return (
    <Link
      href="/"
      className="font-heading text-xl font-bold tracking-tight"
      aria-label="bixo.net, página inicial"
    >
      bixo<span className="text-primary">.</span>net
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <Button asChild variant="outline" size="sm" className="h-9 rounded-full px-4">
          <Link href="/cadastrar-republica">Cadastrar minha rep</Link>
        </Button>
      </div>
    </header>
  );
}
