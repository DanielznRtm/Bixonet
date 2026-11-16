import { Badge } from "@/components/ui/badge";

// Página provisória da Fase 0: só confirma que tokens, fontes e shadcn estão funcionando.
// O hero de busca de verdade entra na Fase 2.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-5 py-16">
      <Badge variant="secondary" className="w-fit">
        Em construção
      </Badge>
      <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
        Passou? Agora bora achar <span className="text-primary">sua rep</span>.
      </h1>
      <p className="max-w-prose text-lg text-muted-foreground">
        Escolha a cidade e a faculdade e veja repúblicas, kitnets e os contatos de moradia
        perto do campus. Começando por Sorocaba.
      </p>
      <div className="rounded-2xl bg-surface p-5 text-base text-foreground">
        Em breve: busca por cidade e faculdade, mapa e cadastro de repúblicas.
      </div>
    </main>
  );
}
