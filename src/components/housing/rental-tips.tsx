import { ClipboardCheck, Eye, FileText, Receipt, ShieldAlert } from "lucide-react";

const TIPS = [
  {
    icon: Eye,
    title: "Visite antes de fechar",
    text: "Vá pessoalmente (ou peça para alguém de confiança ir) antes de pagar qualquer valor.",
  },
  {
    icon: ShieldAlert,
    title: "Desconfie de depósito antecipado",
    text: "Pedido de PIX para “garantir a vaga” sem visita e sem contrato é sinal de golpe.",
  },
  {
    icon: FileText,
    title: "Peça contrato por escrito",
    text: "Confira prazo, valor do reajuste, multa por saída antecipada e quem paga o quê.",
  },
  {
    icon: ClipboardCheck,
    title: "Faça a vistoria",
    text: "Fotografe o imóvel na entrada: paredes, chuveiro, tomadas. Evita cobrança na saída.",
  },
  {
    icon: Receipt,
    title: "Pergunte o que está incluso",
    text: "Água, luz, internet, condomínio e IPTU podem mudar bastante o valor do mês.",
  },
];

export function RentalTips() {
  return (
    <section
      aria-labelledby="dicas-aluguel"
      className="grid gap-4 rounded-3xl bg-surface p-5 sm:p-6"
    >
      <h2 id="dicas-aluguel" className="text-xl font-semibold">
        Antes de alugar
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {TIPS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary">
              <Icon aria-hidden className="size-5" />
            </span>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
