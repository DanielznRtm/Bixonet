/**
 * Formata a distância em linha reta até o campus, sempre aproximada.
 * Ex.: 780 → "~800 m", 2340 → "~2,3 km".
 */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) {
    throw new RangeError("distância inválida");
  }
  if (meters < 950) {
    const rounded = Math.max(100, Math.round(meters / 100) * 100);
    return `~${rounded} m`;
  }
  const km = meters / 1000;
  const formatted = km.toLocaleString("pt-BR", {
    maximumFractionDigits: km < 10 ? 1 : 0,
  });
  return `~${formatted} km`;
}
