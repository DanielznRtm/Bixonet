/** WhatsApp no formato do banco: só dígitos, com DDI 55 + DDD + 8 ou 9 dígitos. */
const PHONE_RE = /^55\d{10,11}$/;

/** Mensagem pronta que o bixo manda para a república. */
export function whatsappMessage(institutionShortName?: string | null): string {
  return institutionShortName
    ? `Oi! Vi a rep de vocês no bixo.net e passei na ${institutionShortName}. Ainda tem vaga?`
    : "Oi! Vi a rep de vocês no bixo.net. Ainda tem vaga?";
}

/**
 * Link `wa.me` com a mensagem pronta. Devolve null se o número não estiver no formato
 * esperado: melhor não mostrar o botão do que mandar o bixo para um número errado.
 */
export function whatsappLink(
  phone: string | null | undefined,
  institutionShortName?: string | null,
): string | null {
  if (!phone || !PHONE_RE.test(phone)) return null;
  const text = encodeURIComponent(whatsappMessage(institutionShortName));
  return `https://wa.me/${phone}?text=${text}`;
}

/** "5515912345678" → "(15) 91234-5678", para mostrar na tela. */
export function formatPhone(phone: string): string {
  const local = phone.replace(/^55/, "");
  const ddd = local.slice(0, 2);
  const number = local.slice(2);
  const split = number.length - 4;
  return `(${ddd}) ${number.slice(0, split)}-${number.slice(split)}`;
}
