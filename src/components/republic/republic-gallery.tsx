"use client";

import { ChevronLeft, ChevronRight, House } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RepublicKind } from "@/lib/search/filters";
import { KIND_STYLE } from "@/lib/search/kind-style";
import { cn } from "@/lib/utils";

type Props = { photos: string[]; name: string; kind: RepublicKind };

/**
 * Celular: fotos rolam na horizontal (scroll-snap). Desktop: uma foto grande + miniaturas.
 * Tocar numa foto abre em tela cheia. Sem fotos: quadro colorido com a casa.
 */
export function RepublicGallery({ photos, name, kind }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div
        className={cn(
          "flex h-48 items-center justify-center rounded-3xl bg-linear-to-br sm:h-64",
          KIND_STYLE[kind].tile,
        )}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <House aria-hidden className="size-12" />
          <p className="text-sm font-medium">Ainda sem fotos</p>
        </div>
      </div>
    );
  }

  const current = openIndex ?? 0;
  const go = (delta: number) =>
    setOpenIndex((i) => ((i ?? 0) + delta + photos.length) % photos.length);

  return (
    <>
      <ul
        aria-label={`Fotos de ${name}`}
        className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:grid-rows-2 sm:overflow-visible sm:px-0"
      >
        {photos.map((src, i) => (
          <li
            key={src}
            className={cn(
              "w-[85%] shrink-0 snap-center sm:w-auto",
              i === 0 && "sm:col-span-2 sm:row-span-2",
              i > 4 && "sm:hidden",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="block h-56 w-full overflow-hidden rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:h-full sm:min-h-32"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- fotos do Storage entram na Fase 5 */}
              <img
                src={src}
                alt={`Foto ${i + 1} de ${photos.length} de ${name}`}
                className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => !open && setOpenIndex(null)}
      >
        <DialogContent className="max-w-4xl gap-3 p-3 sm:p-4">
          <DialogTitle className="sr-only">Fotos de {name}</DialogTitle>
          <DialogDescription className="sr-only">
            Foto {current + 1} de {photos.length}
          </DialogDescription>
          {/* eslint-disable-next-line @next/next/no-img-element -- fotos do Storage entram na Fase 5 */}
          <img
            src={photos[current]}
            alt={`Foto ${current + 1} de ${photos.length} de ${name}`}
            className="max-h-[75dvh] w-full rounded-xl object-contain"
          />
          {photos.length > 1 ? (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => go(-1)}
                aria-label="Foto anterior"
              >
                <ChevronLeft />
              </Button>
              <span className="text-sm text-muted-foreground">
                {current + 1} / {photos.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => go(1)}
                aria-label="Próxima foto"
              >
                <ChevronRight />
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
