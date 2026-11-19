import { NextRequest, NextResponse } from "next/server";
import { sanitizeInviteConfig } from "@/lib/invite-sanitize";
import { blobToken, createInvite } from "@/lib/server/invite-store";
import { devLanIp } from "@/lib/server/lan-ip";
import { forbiddenOrigin, isAllowedOrigin, rateLimited } from "@/lib/server/request-guard";

const MAX_BODY_BYTES = 64 * 1024;
const RATE = { bucket: "invites", limit: 20, windowMs: 60_000 };

// POST /api/invites  Body: { config }  ->  { id, expiresAt }
// 503 means short links are unavailable; the studio then shares a #c= link instead.
export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) return forbiddenOrigin();
  const lanIp = devLanIp();
  const limited = rateLimited(req, RATE, { lanIp });
  if (limited) return limited;

  const token = blobToken();
  if (!token) {
    return NextResponse.json({ error: "storage_unavailable", lanIp }, { status: 503 });
  }

  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "too_large", lanIp }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid_json", lanIp }, { status: 400 });
  }

  const config = sanitizeInviteConfig((body as { config?: unknown } | null)?.config);
  if (!config) {
    return NextResponse.json({ error: "invalid_config", lanIp }, { status: 400 });
  }

  try {
    const { id, expiresAt } = await createInvite(config, token);
    return NextResponse.json({ id, expiresAt, lanIp });
  } catch (error) {
    console.error("POST /api/invites failed:", error);
    return NextResponse.json({ error: "storage_failed", lanIp }, { status: 503 });
  }
}
