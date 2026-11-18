/**
 * Normaliza o WhatsApp digitado do jeito comum para o formato do banco (55 + DDD + número).
 * "(15) 99123-4567", "+55 15 99123-4567" e "15991234567" → "5515991234567".
 * Devolve null se não der um número brasileiro válido.
 */
export function normalizeWhatsapp(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0")) digits = digits.slice(1); // "015..." de quem disca com o 0
  if (digits.length !== 10 && digits.length !== 11) return null;

  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99 || ddd % 10 === 0) return null;
  if (digits.length === 11 && digits[2] !== "9") return null; // celular começa com 9

  return `55${digits}`;
}

/** "@rep.jabuticaba", "instagram.com/rep.jabuticaba/" → "rep.jabuticaba" (ou null). */
export function normalizeInstagram(input: string): string | null {
  const handle = input
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? handle : null;
}
