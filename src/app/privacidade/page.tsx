import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage, ProseSection } from "@/components/legal/prose-page";
import { CONTACT_EMAIL, CONTROLLER_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Como o bixo.net trata os dados de quem cadastra uma república e de quem visita o site, segundo a LGPD.",
  alternates: { canonical: "/privacidade" },
};

// Sem as variáveis, o build de produção falha (src/lib/site.ts). Em desenvolvimento,
// mostramos um aviso no lugar para ninguém esquecer de preencher.
const controller = CONTROLLER_NAME ?? "[defina NEXT_PUBLIC_CONTROLLER_NAME]";
const email = CONTACT_EMAIL ?? "[defina NEXT_PUBLIC_CONTACT_EMAIL]";

export default function PrivacyPage() {
  return (
    <ProsePage
      title="Política de privacidade"
      intro="Como tratamos dados pessoais no bixo.net, seguindo a Lei Geral de Proteção de Dados (Lei 13.709/2018)."
      updated="19 de novembro de 2026"
    >
      <ProseSection title="Quem é o responsável">
        <p>
          O responsável pelo tratamento dos dados (controlador) e encarregado é{" "}
          <strong>{controller}</strong>. Fale com a gente por{" "}
          {CONTACT_EMAIL ? (
            <a href={`mailto:${email}`}>{email}</a>
          ) : (
            <strong>{email}</strong>
          )}
          .
        </p>
      </ProseSection>

      <ProseSection title="Quem procura moradia">
        <p>
          Não precisa de conta. Não pedimos nome, e-mail nem telefone. Denúncias de
          informação errada são anônimas: guardamos só o motivo e a mensagem que você
          escrever.
        </p>
      </ProseSection>

      <ProseSection title="Quem cadastra uma república">
        <ul>
          <li>
            <strong>E-mail</strong> (para o login por link). Finalidade: dar acesso à sua
            conta. Nunca aparece no site.
          </li>
          <li>
            <strong>Dados da república</strong>: nome, tipo, bairro, área aproximada,
            fotos, preço, regras, nome de contato, WhatsApp e Instagram. Finalidade:
            mostrar a república para quem procura moradia. Ficam públicos{" "}
            <strong>somente com o seu consentimento</strong> e depois da nossa revisão.
          </li>
          <li>
            <strong>Localização</strong>: guardamos um ponto arredondado para cerca de 100
            m e mostramos uma área de ~150 m. O endereço exato não é armazenado.
          </li>
          <li>
            <strong>Base legal</strong>: consentimento (art. 7º, I), registrado com data
            no momento do cadastro e renovado a cada edição.
          </li>
        </ul>
      </ProseSection>

      <ProseSection title="Por quanto tempo">
        <ul>
          <li>Enquanto a república estiver publicada ou você mantiver a conta.</li>
          <li>
            Ao tirar a república do ar, ela deixa de aparecer na hora. Se quiser que os
            dados sejam apagados de vez, peça pelo e-mail acima e excluímos em até 15
            dias.
          </li>
          <li>Denúncias resolvidas são apagadas depois de 12 meses.</li>
        </ul>
      </ProseSection>

      <ProseSection title="Com quem compartilhamos">
        <p>
          Não vendemos nem compartilhamos dados para publicidade. Usamos estes serviços
          para operar o site:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong>: banco de dados, login e armazenamento das fotos.
          </li>
          <li>
            <strong>Vercel</strong>: hospedagem do site.
          </li>
          <li>
            <strong>Provedor de e-mail</strong>: envio do link de login.
          </li>
          <li>
            <strong>OpenStreetMap / OpenFreeMap</strong>: desenho do mapa (recebem só o
            pedido das imagens do mapa, sem dados seus).
          </li>
        </ul>
      </ProseSection>

      <ProseSection title="Seus direitos">
        <p>
          Você pode pedir acesso, correção, portabilidade e exclusão dos seus dados, e
          revogar o consentimento a qualquer momento. Correções e &ldquo;tirar do
          ar&rdquo; você mesmo faz em <Link href="/minhas-reps">Minhas reps</Link>; os
          outros pedidos, pelo e-mail acima.
        </p>
        <p>
          Se a sua casa foi cadastrada sem autorização, use &ldquo;Reportar informação
          errada&rdquo; na página dela e escolha &ldquo;pedido de remoção&rdquo;: esses
          pedidos são tratados primeiro.
        </p>
      </ProseSection>

      <ProseSection title="Cookies">
        <p>
          Usamos apenas o cookie necessário para manter o login de quem cadastra uma
          república. Não usamos cookies de publicidade nem de rastreamento.
        </p>
      </ProseSection>
    </ProsePage>
  );
}
