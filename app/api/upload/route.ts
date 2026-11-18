import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { blobToken } from "@/lib/server/invite-store";
import { toBucket } from "@/lib/blob-bucket";

// Client uploads: the browser sends the file straight to Vercel Blob (no 4.5 MB
// function body limit); this route only issues a short-lived, constrained token.
const RULES = {
  bg: {
    contentTypes: ["image/webp", "image/jpeg", "image/png"],
    extensions: ["webp", "jpg", "jpeg", "png"],
    maxBytes: 5 * 1024 * 1024,
  },
  audio: {
    contentTypes: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac"],
    extensions: ["mp3", "m4a", "aac"],
    maxBytes: 10 * 1024 * 1024,
  },
} as const;

const PATHNAME_RE = /^assets\/(\d{4})\/(bg|audio)\.([a-z0-9]{2,4})$/;

function allowedBuckets(now = new Date()): string[] {
  // Current month plus its neighbours, to tolerate client clock skew.
  return [-1, 0, 1].map((offset) => toBucket(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1))));
}

export async function POST(req: NextRequest) {
  const token = blobToken();
  if (!token) {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }

  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request: req,
      token,
      onBeforeGenerateToken: async (pathname) => {
        const match = PATHNAME_RE.exec(pathname);
        if (!match || !allowedBuckets().includes(match[1])) {
          throw new Error("invalid_pathname");
        }
        const rule = RULES[match[2] as keyof typeof RULES];
        if (!(rule.extensions as readonly string[]).includes(match[3])) {
          throw new Error("invalid_extension");
        }
        return {
          allowedContentTypes: [...rule.contentTypes],
          maximumSizeInBytes: rule.maxBytes,
          addRandomSuffix: true,
          allowOverwrite: false,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
