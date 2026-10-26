// Photos are stored inside Firestore (Firebase Storage needs the paid plan),
// so they're shrunk in the browser to fit Firestore's 1 MB document limit.

async function loadImage(src: Blob | string): Promise<HTMLImageElement> {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  try {
    await img.decode();
  } finally {
    if (typeof src !== "string") setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return img;
}

function render(img: HTMLImageElement, maxDim: number, quality: number) {
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  // Safari can't encode WebP; it falls back to PNG, so try JPEG there.
  const webp = canvas.toDataURL("image/webp", quality);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", quality);
}

/** Returns a data URL no bigger than maxChars (Firestore field budget). */
function fit(img: HTMLImageElement, maxDim: number, maxChars: number) {
  let dim = maxDim;
  let quality = 0.82;
  for (let i = 0; i < 12; i++) {
    const url = render(img, dim, quality);
    if (url.length <= maxChars) return url;
    if (quality > 0.55) quality -= 0.08;
    else dim = Math.round(dim * 0.85);
  }
  throw new Error("Photo is too large to compress.");
}

export async function preparePhoto(src: Blob | string) {
  const img = await loadImage(src);
  return {
    full: fit(img, 1800, 900_000),
    thumb: fit(img, 700, 120_000),
  };
}
