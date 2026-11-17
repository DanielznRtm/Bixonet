/** Rótulos das comodidades (chaves gravadas em republics.amenities). */
export const AMENITY_LABEL: Record<string, string> = {
  wifi: "Wi-Fi",
  faxina: "Faxina",
  lavanderia: "Lavanderia",
  churrasqueira: "Churrasqueira",
  garagem: "Garagem",
  mobiliado: "Mobiliada",
  suite: "Quarto com suíte",
  pet: "Aceita pet",
};

/** Rótulo da comodidade; chave desconhecida vira texto legível ("ar_condicionado" → "Ar condicionado"). */
export function amenityLabel(key: string): string {
  if (AMENITY_LABEL[key]) return AMENITY_LABEL[key];
  const text = key.replace(/[_-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
