import { randomInt } from "node:crypto";
import { put } from "@vercel/blob";
import type { InvitationConfig } from "@/lib/date-content";
import { sanitizeInviteConfig } from "@/lib/invite-sanitize";
import { toBucket } from "@/lib/blob-bucket";

/**
 * Short-link invites stored as immutable public JSON blobs.
 *
 * Id = 4-digit expiry bucket (YYMM, UTC) + 10 random chars, e.g. `2702k3m9pq7xwt`.
 * The blob lives at `invites/<YYMM>/<random>.json`, so the cleanup cron drops a whole
 * month folder at once. Invites from the old database keep their 8-char ids under
 * `legacy/<id>.json` and never expire.
 */

const ID_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const RANDOM_LENGTH = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

// Retention approved on 2026-10-23: 30 days after the date, or 90 days after
// creation when there is no date. Capped so uploaded assets can expire too.
export const INVITE_MIN_DAYS = 90;
export const INVITE_AFTER_EVENT_DAYS = 30;
export const INVITE_MAX_DAYS = 180;

const NEW_ID_RE = new RegExp(`^(\\d{4})([${ID_ALPHABET}]{${RANDOM_LENGTH}})$`);
const LEGACY_ID_RE = new RegExp(`^[${ID_ALPHABET}]{8}$`);

export function blobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN || undefined;
}

/** Public URL of a blob in this store (same scheme the SDK uses internally). */
function publicBlobUrl(token: string, pathname: string): string {
  const storeId = token.split("_")[3];
  return `https://${storeId}.public.blob.vercel-storage.com/${pathname}`;
}

export function inviteExpiry(config: InvitationConfig, now = new Date()): Date {
  let expiry = now.getTime() + INVITE_MIN_DAYS * DAY_MS;
  if (config.eventDate) {
    const event = Date.parse(`${config.eventDate}T00:00:00Z`);
    if (Number.isFinite(event)) expiry = Math.max(expiry, event + INVITE_AFTER_EVENT_DAYS * DAY_MS);
  }
  return new Date(Math.min(expiry, now.getTime() + INVITE_MAX_DAYS * DAY_MS));
}

function randomId(): string {
  let id = "";
  for (let i = 0; i < RANDOM_LENGTH; i++) id += ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  return id;
}

export function invitePathname(id: string): string | null {
  const match = NEW_ID_RE.exec(id);
  if (match) return `invites/${match[1]}/${match[2]}.json`;
  if (LEGACY_ID_RE.test(id)) return `legacy/${id}.json`;
  return null;
}

export async function createInvite(
  config: InvitationConfig,
  token: string
): Promise<{ id: string; expiresAt: string }> {
  const expiry = inviteExpiry(config);
  const id = toBucket(expiry) + randomId();

  // allowOverwrite: false — a colliding id (31^10 per month) fails instead of
  // replacing someone else's invite; the client then falls back to a #c= link.
  await put(invitePathname(id)!, JSON.stringify({ v: 1, config }), {
    access: "public",
    token,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: false,
    cacheControlMaxAge: 60 * 60 * 24 * 30,
  });
  return { id, expiresAt: expiry.toISOString() };
}

export async function readInvite(id: string): Promise<InvitationConfig | null> {
  const token = blobToken();
  const pathname = invitePathname(id);
  if (!token || !pathname) return null;

  const res = await fetch(publicBlobUrl(token, pathname), { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  try {
    const data = await res.json();
    return sanitizeInviteConfig(data?.config);
  } catch {
    return null;
  }
}
