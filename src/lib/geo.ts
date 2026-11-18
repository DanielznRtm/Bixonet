import type { Polygon } from "geojson";

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

/**
 * Polígono (GeoJSON) aproximando um círculo de `radiusMeters` em volta de um ponto.
 * Usado no mapa para mostrar a ÁREA aproximada da república, nunca um pino exato.
 */
export function circlePolygon(
  lat: number,
  lng: number,
  radiusMeters: number,
  steps = 48,
): Polygon {
  const earthRadius = 6_371_000;
  const dLat = (radiusMeters / earthRadius) * (180 / Math.PI);
  const dLng = dLat / Math.cos((lat * Math.PI) / 180);
  const ring: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    ring.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]);
  }
  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

/**
 * Lê um ponto no formato que a API do Supabase devolve para colunas geography
 * (EWKB em hexadecimal: "0101000020E6100000…"). Devolve null se não for um ponto.
 */
export function parsePointEwkb(hex: string): { lat: number; lng: number } | null {
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length < 42) return null;
  const bytes = new Uint8Array(hex.match(/../g)!.map((b) => parseInt(b, 16)));
  const view = new DataView(bytes.buffer);
  const little = bytes[0] === 1;
  const type = view.getUint32(1, little);
  const hasSrid = (type & 0x20000000) !== 0;
  if ((type & 0xff) !== 1) return null; // 1 = Point
  const offset = 5 + (hasSrid ? 4 : 0);
  if (bytes.length < offset + 16) return null;
  const lng = view.getFloat64(offset, little);
  const lat = view.getFloat64(offset + 8, little);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}
