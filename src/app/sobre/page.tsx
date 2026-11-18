import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage, ProseSection } from "@/components/legal/prose-page";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "O que é o bixo.net, como a busca funciona, de onde vêm os dados e como cadastrar sua república.",
  alternates: { canonical: "/sobre" },
};

export default function AboutPage() {
  return (
    <ProsePage
      title="Sobre o bixo.net"
      intro="Um jeito simples de achar moradia perto da faculdade, pensado para quem acabou de passar no vestibular."
    >
      <ProseSection title="Por que existe">
        <p>
          Entre a lista de aprovados e a matrícula, milhares de calouros precisam achar
          onde morar em poucas semanas. A informação costuma ficar espalhada em grupos de
          WhatsApp e posts de Instagram, sem filtro e sem noção de distância. Aqui a busca
          começa pela sua faculdade, que é como você pensa.
        </p>
      </ProseSection>

      <ProseSection title="Como funciona">
        <ul>
          <li>
            Você escolhe a cidade e a faculdade e vê as repúblicas mais perto do campus.
          </li>
          <li>
            Filtra por tipo, preço, vagas e distância, e compartilha o link já filtrado.
          </li>
          <li>
            Fala direto com os moradores pelo WhatsApp. O bixo.net não intermedia aluguel
            nem recebe pagamentos.
          </li>
          <li>
            Não quer república? Tem kitnets e apartamentos e os contatos de moradia da
            própria faculdade.
          </li>
        </ul>
      </ProseSection>

      <ProseSection title="De onde vêm os dados">
        <ul>
          <li>
            <strong>Repúblicas:</strong> cadastradas pelos próprios moradores e revisadas
            antes de aparecer. Não copiamos dados de redes sociais nem de sites de
            imóveis.
          </li>
          <li>
            <strong>Faculdades:</strong> nome, campus e contatos de moradia conferidos nos
            sites oficiais. O que não conseguimos confirmar fica de fora.
          </li>
          <li>
            <strong>Mapa:</strong> OpenStreetMap. A localização das repúblicas é sempre
            aproximada (cerca de 150 m): o endereço exato nunca aparece.
          </li>
          <li>
            <strong>Distâncias:</strong> em linha reta até o campus. O caminho a pé pode
            ser maior.
          </li>
        </ul>
      </ProseSection>

      <ProseSection title="Mora numa república?">
        <p>
          Cadastre de graça. Leva uns 5 minutos, a gente revisa e ela passa a aparecer
          para os bixos da sua faculdade. Você pode editar ou tirar do ar quando quiser.
        </p>
        <Button asChild className="justify-self-start rounded-full">
          <Link href="/cadastrar-republica" className="no-underline">
            Cadastrar minha rep
          </Link>
        </Button>
      </ProseSection>

      <ProseSection title="Mais">
        <p>
          Veja também a <Link href="/privacidade">política de privacidade</Link> e os{" "}
          <Link href="/termos">termos de uso</Link>.
        </p>
      </ProseSection>
    </ProsePage>
  );
}
