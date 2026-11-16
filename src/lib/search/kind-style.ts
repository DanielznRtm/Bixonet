import type { RepublicKind } from "./filters";

/** Cores por tipo de república: classes para a UI e hex para o mapa (MapLibre não lê CSS vars). */
export const KIND_STYLE: Record<
  RepublicKind,
  { badge: string; tile: string; hex: string }
> = {
  male: {
    badge: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100",
    tile: "from-sky-200 to-sky-100 text-sky-700 dark:from-sky-900 dark:to-sky-950 dark:text-sky-200",
    hex: "#2b7bbd",
  },
  female: {
    badge: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
    tile: "from-rose-200 to-rose-100 text-rose-700 dark:from-rose-900 dark:to-rose-950 dark:text-rose-200",
    hex: "#c23f72",
  },
  mixed: {
    badge: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100",
    tile: "from-violet-200 to-violet-100 text-violet-700 dark:from-violet-900 dark:to-violet-950 dark:text-violet-200",
    hex: "#7c5bc4",
  },
};
