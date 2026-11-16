export const PHOTO_MAX_BYTES = 30_000;

/** Reduce quality first, then dimensions; never accept an oversized result. */
export async function fitPhoto(encode: (edge: number, quality: number) => Promise<Blob>): Promise<Blob> {
  for (let edge = 1200; edge >= 64; edge = Math.floor(edge * 0.75)) {
    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const blob = await encode(edge, quality);
      if (blob.size > 0 && blob.size < PHOTO_MAX_BYTES) return blob;
    }
  }
  throw new Error("This photo could not be compressed. Please choose another photo.");
}

export async function compressPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose a valid photo.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not load this photo.");
    const blob = await fitPhoto(async (edge, quality) => {
      const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("Could not compress this photo."));
      }, "image/webp", quality));
    });
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read this photo."));
      reader.onerror = () => reject(new Error("Could not read this photo."));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error("Choose a valid photo.");
  } finally {
    URL.revokeObjectURL(url);
  }
}