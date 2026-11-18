/** Dimensões que cabem num quadrado de `max` px, mantendo a proporção (nunca aumenta). */
export function fitWithin(width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Reduz a foto no próprio aparelho antes do envio (até 1600 px, WebP ~82%).
 * Uma foto de celular de 4 MB costuma virar ~250 KB: menos dados e menos espaço no Storage.
 */
export async function resizeToWebp(
  file: File,
  max = 1600,
  quality = 0.82,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { width, height } = fitWithin(bitmap.width, bitmap.height, max);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não deu para processar a imagem neste navegador.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) throw new Error("Não deu para converter a imagem.");
  return blob;
}
