import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";

// O MapLibre calcula o caminho do worker a partir do próprio arquivo, o que não funciona no
// bundle do Turbopack. A cópia é servida de public/vendor/ (scripts/copy-maplibre-worker.mjs).
setWorkerUrl("/vendor/maplibre-gl-worker.mjs");

export const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/liberty";

/** Raio do círculo de área aproximada (LGPD: nunca um pino exato). */
export const AREA_RADIUS_M = 150;

export const OSM_ATTRIBUTION =
  'Dados do mapa © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';
