/**
 * Remove solid / near-solid image backgrounds in the browser.
 *
 * Pipeline (common chroma-key + matting approach):
 * 1. Auto-detect background color by sampling edge pixels (dominant bucket)
 * 2. Flood-fill from image borders through similar pixels only (keeps interior ink)
 * 3. Feather alpha on boundary pixels to clean anti-aliased halos
 *
 * @see https://jsokit.com/blog/posts/pure-frontend-image-background-removal-canvas-api-and-color-distance-algorithm/
 */

export type Rgb = { r: number; g: number; b: number };

export type RemoveBackgroundOptions = {
  /** Euclidean RGB distance (0–255 scale). Default 52 */
  tolerance?: number;
  /** Extra soft edge band beyond tolerance. Default 36 */
  feather?: number;
  /** Skip auto-detect and use this backdrop color */
  background?: Rgb;
  /** Trim transparent margins after processing */
  trim?: boolean;
  trimPad?: number;
};

function colorDistance(r: number, g: number, b: number, tr: number, tg: number, tb: number) {
  const dr = r - tr;
  const dg = g - tg;
  const db = b - tb;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function detectEdgeBackground(data: Uint8ClampedArray, w: number, h: number): Rgb {
  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();

  const sample = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    const a = data[i + 3]!;
    if (a < 16) return;
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const key = ((r >> 3) << 16) | ((g >> 3) << 8) | (b >> 3);
    const prev = buckets.get(key);
    if (prev) {
      prev.count += 1;
      prev.r += r;
      prev.g += g;
      prev.b += b;
    } else {
      buckets.set(key, { count: 1, r, g, b });
    }
  };

  const step = Math.max(1, Math.floor(Math.min(w, h) / 64));
  for (let x = 0; x < w; x += step) {
    sample(x, 0);
    sample(x, h - 1);
  }
  for (let y = 0; y < h; y += step) {
    sample(0, y);
    sample(w - 1, y);
  }

  let best = { count: 0, r: 0, g: 0, b: 0 };
  for (const b of buckets.values()) {
    if (b.count > best.count) best = b;
  }

  if (best.count === 0) return { r: 0, g: 0, b: 0 };

  return {
    r: Math.round(best.r / best.count),
    g: Math.round(best.g / best.count),
    b: Math.round(best.b / best.count),
  };
}

function floodBackgroundMask(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  bg: Rgb,
  tolerance: number,
): Uint8Array {
  const mask = new Uint8Array(w * h);
  const queue: number[] = [];

  const trySeed = (x: number, y: number) => {
    const idx = y * w + x;
    if (mask[idx]) return;
    const i = idx * 4;
    const dist = colorDistance(data[i]!, data[i + 1]!, data[i + 2]!, bg.r, bg.g, bg.b);
    if (dist > tolerance) return;
    mask[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < w; x++) {
    trySeed(x, 0);
    trySeed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    trySeed(0, y);
    trySeed(w - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop()!;
    const x = idx % w;
    const y = (idx / w) | 0;
    if (x > 0) trySeed(x - 1, y);
    if (x < w - 1) trySeed(x + 1, y);
    if (y > 0) trySeed(x, y - 1);
    if (y < h - 1) trySeed(x, y + 1);
  }

  return mask;
}

function applyMaskAndFeather(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  mask: Uint8Array,
  bg: Rgb,
  tolerance: number,
  feather: number,
) {
  const hard = tolerance;
  const soft = tolerance + feather;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const i = idx * 4;
      if (mask[idx]) {
        data[i + 3] = 0;
        continue;
      }

      const dist = colorDistance(data[i]!, data[i + 1]!, data[i + 2]!, bg.r, bg.g, bg.b);
      if (dist <= hard) {
        data[i + 3] = 0;
        continue;
      }

      const touchesBg =
        (x > 0 && mask[idx - 1]) ||
        (x < w - 1 && mask[idx + 1]) ||
        (y > 0 && mask[idx - w]) ||
        (y < h - 1 && mask[idx + w]);

      if (touchesBg && dist < soft) {
        const t = (dist - hard) / Math.max(1, feather);
        data[i + 3] = Math.round(data[i + 3]! * t);
      }
    }
  }
}

function trimBounds(data: Uint8ClampedArray, w: number, h: number, pad: number) {
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3]! > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX <= minX) return { canvas: null, minX: 0, minY: 0, maxX: w - 1, maxY: h - 1 };

  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);

  const tw = maxX - minX + 1;
  const th = maxY - minY + 1;
  const trimmed = document.createElement("canvas");
  trimmed.width = tw;
  trimmed.height = th;
  const tctx = trimmed.getContext("2d");
  if (!tctx) return { canvas: null, minX, minY, maxX, maxY };

  const full = document.createElement("canvas");
  full.width = w;
  full.height = h;
  full.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(data.slice()), w, h), 0, 0);
  tctx.drawImage(full, minX, minY, tw, th, 0, 0, tw, th);

  return { canvas: trimmed, minX, minY, maxX, maxY };
}

export function removeBackgroundFromImageData(
  imageData: ImageData,
  options: RemoveBackgroundOptions = {},
): HTMLCanvasElement {
  const { tolerance = 52, feather = 36, trim = true, trimPad = 6 } = options;
  const { width: w, height: h } = imageData;
  const data = new Uint8ClampedArray(imageData.data.slice());

  const bg = options.background ?? detectEdgeBackground(data, w, h);
  const mask = floodBackgroundMask(data, w, h, bg, tolerance);
  applyMaskAndFeather(data, w, h, mask, bg, tolerance, feather);

  const full = document.createElement("canvas");
  full.width = w;
  full.height = h;
  full.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(data.slice()), w, h), 0, 0);

  if (!trim) return full;

  const trimmed = trimBounds(data, w, h, trimPad);
  return trimmed.canvas ?? full;
}

export function removeBackgroundFromCanvas(
  source: HTMLCanvasElement,
  options?: RemoveBackgroundOptions,
): HTMLCanvasElement {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return source;
  return removeBackgroundFromImageData(ctx.getImageData(0, 0, source.width, source.height), options);
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export async function removeBackgroundFromUrl(
  src: string,
  options?: RemoveBackgroundOptions,
): Promise<HTMLCanvasElement> {
  const img = await loadImageElement(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No canvas context");
  ctx.drawImage(img, 0, 0);
  return removeBackgroundFromCanvas(canvas, options);
}

const processedUrlCache = new Map<string, string>();

export async function getTransparentImageUrl(src: string, options?: RemoveBackgroundOptions): Promise<string> {
  const key = `${src}:${options?.tolerance ?? 52}:${options?.feather ?? 36}`;
  const hit = processedUrlCache.get(key);
  if (hit) return hit;
  const canvas = await removeBackgroundFromUrl(src, options);
  const url = canvas.toDataURL("image/png");
  processedUrlCache.set(key, url);
  return url;
}

export function clearProcessedImageCache() {
  processedUrlCache.clear();
}
