// Copia o worker do MapLibre para public/ (o Turbopack não resolve o caminho que a lib calcula).
// Roda antes de `dev` e `build`; o arquivo copiado não vai para o git.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const distDir = dirname(require.resolve("maplibre-gl/dist/maplibre-gl.mjs"));
const outDir = join(process.cwd(), "public", "vendor");
mkdirSync(outDir, { recursive: true });
copyFileSync(
  join(distDir, "maplibre-gl-worker.mjs"),
  join(outDir, "maplibre-gl-worker.mjs"),
);
console.log("maplibre worker copiado para public/vendor/");
