import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Como o bixo.net trata os dados de quem cadastra uma república e de quem visita o site.",
};

// Versão curta (Fase 5), para o consentimento do cadastro apontar para algum lugar.
// A versão completa, com encarregado (DPO) e canal de contato, entra na Fase 6.
export default function PrivacyPage() {
  return (
    <main className="mx-auto grid w-full max-w-2xl gap-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Privacidade</h1>
      <p className="text-muted-foreground">
        Resumo de como tratamos dados pessoais, seguindo a LGPD (Lei 13.709/2018).
      </p>

      <Section title="Quem procura moradia">
        Não precisa de conta. Não pedimos nome, e-mail nem telefone. Denúncias de
        informação errada são anônimas.
      </Section>

      <Section title="Quem cadastra uma república">
        <ul className="grid list-disc gap-2 pl-5">
          <li>
            <strong>E-mail:</strong> usado só para o login por link e nunca aparece no
            site.
          </li>
          <li>
            <strong>Dados da república</strong> (nome, bairro, área aproximada, fotos,
            preço, regras, nome de contato, WhatsApp e Instagram): ficam públicos{" "}
            <strong>somente com o seu consentimento</strong> e depois da nossa revisão.
          </li>
          <li>
            <strong>Localização:</strong> guardamos um ponto arredondado para cerca de 100
            m e mostramos uma área de ~150 m. O endereço exato não é armazenado.
          </li>
        </ul>
      </Section>

      <Section title="Seus direitos">
        Você pode corrigir os dados ou tirar a república do ar a qualquer momento em{" "}
        <Link
          href="/minhas-reps"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Minhas reps
        </Link>
        . Se a sua casa foi cadastrada sem autorização, use &ldquo;Reportar informação
        errada&rdquo; na página dela e escolha &ldquo;pedido de remoção&rdquo;: esses
        pedidos são tratados primeiro.
      </Section>

      <Section title="Cookies">
        Usamos apenas o cookie necessário para manter o login de quem cadastra uma
        república. Não usamos cookies de publicidade.
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="leading-relaxed">{children}</div>
    </section>
  );
}
