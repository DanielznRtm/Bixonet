import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage, ProseSection } from "@/components/legal/prose-page";

export const metadata: Metadata = {
  title: "Termos de uso",
  description:
    "Regras de uso do bixo.net para quem procura moradia e para quem cadastra uma república.",
  alternates: { canonical: "/termos" },
};

export default function TermsPage() {
  return (
    <ProsePage title="Termos de uso" updated="19 de novembro de 2026">
      <ProseSection title="O que o bixo.net é (e o que não é)">
        <p>
          O bixo.net é um diretório gratuito que ajuda calouros a encontrar moradia perto
          da faculdade. <strong>Não é imobiliária</strong>, não intermedia aluguel, não
          recebe pagamentos e não participa de nenhum acordo entre moradores e
          interessados.
        </p>
      </ProseSection>

      <ProseSection title="Para quem procura moradia">
        <ul>
          <li>As informações são enviadas pelas próprias repúblicas e podem mudar.</li>
          <li>
            O selo &ldquo;Verificada&rdquo; indica só que conferimos que a república
            existe. Não é garantia de qualidade nem de segurança.
          </li>
          <li>
            Visite antes de fechar negócio e desconfie de pedidos de pagamento antecipado.
          </li>
          <li>
            Viu algo errado? Use &ldquo;Reportar informação errada&rdquo; na página da
            república.
          </li>
        </ul>
      </ProseSection>

      <ProseSection title="Para quem cadastra uma república">
        <ul>
          <li>
            Você declara que mora na república ou tem autorização dos moradores para
            cadastrá-la.
          </li>
          <li>
            Você é responsável pelas informações e fotos que publica. Não publique dados
            de outras pessoas sem autorização, endereço exato ou conteúdo ofensivo.
          </li>
          <li>
            A gente pode recusar, editar ou tirar do ar cadastros que descumpram estes
            termos ou que recebam denúncias procedentes.
          </li>
          <li>
            Você pode tirar a república do ar a qualquer momento em &ldquo;Minhas
            reps&rdquo;.
          </li>
        </ul>
      </ProseSection>

      <ProseSection title="Privacidade">
        <p>
          O tratamento de dados pessoais está descrito na{" "}
          <Link href="/privacidade">política de privacidade</Link>.
        </p>
      </ProseSection>
    </ProsePage>
  );
}
