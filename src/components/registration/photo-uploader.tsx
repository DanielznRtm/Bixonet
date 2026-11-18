"use client";

import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { resizeToWebp } from "@/lib/registration/image";
import { MAX_PHOTOS } from "@/lib/registration/schema";
import { createBrowserSupabase } from "@/lib/supabase/client";

type Props = {
  userId: string;
  value: string[];
  onChange: (photos: string[]) => void;
};

/**
 * Reduz cada foto no aparelho e envia para republic-photos/<userId>/<uuid>.webp.
 * A primeira foto é a capa (aparece no card da busca).
 */
export function PhotoUploader({ userId, value, onChange }: Props) {
  const inputId = useId();
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const remaining = MAX_PHOTOS - value.length;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const selected = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setError(
        `Dá para enviar até ${MAX_PHOTOS} fotos; usamos as primeiras ${remaining}.`,
      );
    }

    const supabase = createBrowserSupabase();
    setUploading(selected.length);
    const uploaded: string[] = [];
    for (const file of selected) {
      try {
        if (!file.type.startsWith("image/"))
          throw new Error(`"${file.name}" não é uma imagem.`);
        const blob = await resizeToWebp(file);
        const path = `${userId}/${crypto.randomUUID()}.webp`;
        const { error: uploadError } = await supabase.storage
          .from("republic-photos")
          .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
        if (uploadError) throw new Error(uploadError.message);
        uploaded.push(
          supabase.storage.from("republic-photos").getPublicUrl(path).data.publicUrl,
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não deu para enviar uma das fotos.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
  }

  function remove(url: string) {
    onChange(value.filter((p) => p !== url));
  }

  function makeCover(url: string) {
    onChange([url, ...value.filter((p) => p !== url)]);
  }

  return (
    <div className="grid gap-4">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Fotos enviadas">
        {value.map((url, i) => (
          <li
            key={url}
            className="relative overflow-hidden rounded-xl border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- prévia local do upload */}
            <img
              src={url}
              alt={`Foto ${i + 1}`}
              className="aspect-square w-full object-cover"
            />
            {i === 0 ? (
              <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                Capa
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(url)}
                className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-xs font-medium shadow"
              >
                <Star aria-hidden className="size-3" />
                Usar como capa
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label={`Remover foto ${i + 1}`}
              className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-card/90 shadow"
            >
              <X aria-hidden className="size-4" />
            </button>
          </li>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <li
            key={`up-${i}`}
            className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-border"
          >
            <Loader2
              aria-label="Enviando foto"
              className="size-6 animate-spin text-muted-foreground"
            />
          </li>
        ))}
      </ul>

      {remaining > 0 ? (
        <div>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            className="sr-only"
            data-testid="photo-input"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <Button asChild variant="outline" className="h-12 gap-2 rounded-xl">
            <label htmlFor={inputId} className="cursor-pointer">
              <ImagePlus aria-hidden className="size-5" />
              Adicionar fotos ({value.length}/{MAX_PHOTOS})
            </label>
          </Button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        Fotos dos quartos, da cozinha e das áreas comuns ajudam muito. Evite mostrar a
        fachada ou o número da casa.
      </p>
    </div>
  );
}
