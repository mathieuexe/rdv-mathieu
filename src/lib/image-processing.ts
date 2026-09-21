/** Utilitaires navigateur de préparation des visuels (recadrage + compression JPEG). */

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Impossible de charger l'image."));
    image.src = src;
  });
}

/** Recadre l'image au centre, au format demandé, et renvoie un data URL JPEG. */
export async function resizeSourceToJpeg(src: string, width: number, height: number) {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Le navigateur ne permet pas de traiter cette image.");
  }

  canvas.width = width;
  canvas.height = height;

  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  return canvas.toDataURL("image/jpeg", 0.86);
}

export async function resizeFileToJpeg(file: File, width: number, height: number) {
  return resizeSourceToJpeg(await readFileAsDataUrl(file), width, height);
}

/**
 * Les images distantes passent par notre proxy : même origine, donc le canvas
 * n'est pas « taint » et `toDataURL` reste utilisable.
 */
export function buildImageProxyUrl(remoteUrl: string) {
  return `/api/admin/stock-photos/proxy?url=${encodeURIComponent(remoteUrl)}`;
}

export async function resizeRemoteUrlToJpeg(remoteUrl: string, width: number, height: number) {
  return resizeSourceToJpeg(buildImageProxyUrl(remoteUrl), width, height);
}
