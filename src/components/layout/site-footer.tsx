import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6">
        <p>
          <span className="font-heading font-semibold text-foreground">bixo.net</span> —
          moradia perto da faculdade, começando por Sorocaba.
        </p>
        <p>
          As informações das repúblicas são enviadas pelas próprias repúblicas. Visite
          antes de fechar negócio.
        </p>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/minhas-reps" className="hover:text-foreground hover:underline">
            Área da república
          </Link>
          <Link href="/sobre" className="hover:text-foreground hover:underline">
            Sobre
          </Link>
          <Link href="/privacidade" className="hover:text-foreground hover:underline">
            Privacidade
          </Link>
          <Link href="/termos" className="hover:text-foreground hover:underline">
            Termos
          </Link>
        </nav>
      </div>
    </footer>
  );
}
