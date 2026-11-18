"use client";

import { upload } from "@vercel/blob/client";
import { toBucket } from "./blob-bucket";

export type UploadKind = "bg" | "audio";
export type UploadErrorCode = "type" | "size" | "unavailable" | "failed";

export class UploadError extends Error {
  constructor(public code: UploadErrorCode) {
    super(code);
  }
}

// Keep in sync with RULES in app/api/upload/route.ts.
export const AUDIO_MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_MAX_SIDE = 1600;

const AUDIO_TYPES: Record<string, string> = { mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac" };

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Downscales and re-encodes a photo so a background is usually well under 1 MB. */
async function compressImage(file: File): Promise<{ blob: Blob; ext: string }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UploadError("type"); // e.g. HEIC outside Safari
  }

  const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Browsers without WebP encoding hand back PNG; use JPEG for those instead.
  const webp = await canvasToBlob(canvas, "image/webp", 0.82);
  if (webp?.type === "image/webp") return { blob: webp, ext: "webp" };
  const jpeg = await canvasToBlob(canvas, "image/jpeg", 0.85);
  if (jpeg) return { blob: jpeg, ext: "jpg" };
  throw new UploadError("failed");
}

async function prepare(file: File, kind: UploadKind): Promise<{ body: Blob; ext: string; contentType: string }> {
  if (kind === "bg") {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") throw new UploadError("type");
    const { blob, ext } = await compressImage(file);
    if (blob.size > IMAGE_MAX_BYTES) throw new UploadError("size");
    return { body: blob, ext, contentType: blob.type };
  }

  const ext = extensionOf(file.name);
  const contentType = AUDIO_TYPES[ext];
  if (!contentType) throw new UploadError("type");
  if (file.size > AUDIO_MAX_BYTES) throw new UploadError("size");
  return { body: file, ext, contentType };
}

/** Uploads straight from the browser to Vercel Blob and returns the public URL. */
export async function uploadAsset(file: File, kind: UploadKind): Promise<string> {
  const { body, ext, contentType } = await prepare(file, kind);
  try {
    const result = await upload(`assets/${toBucket(new Date())}/${kind}.${ext}`, body, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType,
    });
    return result.url;
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    // The SDK reports any refusal from /api/upload (e.g. 503 without a Blob store)
    // only as "Failed to retrieve the client token".
    if (/retrieve the client token/i.test(message)) throw new UploadError("unavailable");
    if (/size|too large/i.test(message)) throw new UploadError("size");
    if (/content type|contentType/i.test(message)) throw new UploadError("type");
    throw new UploadError("failed");
  }
}
