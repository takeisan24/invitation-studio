import LZString from "lz-string";
import type { InvitationConfig } from "./date-content";
import { BASELINE_V1 } from "./invite-baseline";
import { sanitizeInviteConfig } from "./invite-sanitize";

/**
 * Link payloads for the database-free flow.
 *
 * Invite (`/invite#c=...`): only the difference from a frozen baseline snapshot, so
 * an invite that changes names and date stays around 130 characters.
 * Reply (`/reply#r=...`): the recipient's answers, sent back to the sender by chat.
 *
 * Both live in the URL fragment, which browsers never send to the server.
 */

export const INVITE_PAYLOAD_VERSION = 1;
export const REPLY_PAYLOAD_VERSION = 1;

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type Answers = Record<string, string | string[]>;

// Marks an array delta: { "$len": n, "<index>": delta }.
const ARRAY_LEN = "$len";

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Delta of `value` against `base`; `undefined` means identical, `null` means removed. */
export function diffAgainst(value: unknown, base: unknown): Json | undefined {
  if (deepEqual(value, base)) return undefined;
  if (value === undefined) return null;

  if (Array.isArray(value) && Array.isArray(base)) {
    const out: Record<string, Json> = { [ARRAY_LEN]: value.length };
    value.forEach((item, i) => {
      const d = i < base.length ? diffAgainst(item, base[i]) : (item as Json);
      if (d !== undefined) out[String(i)] = d;
    });
    return out;
  }

  if (isObject(value) && isObject(base)) {
    const out: Record<string, Json> = {};
    for (const key of new Set([...Object.keys(base), ...Object.keys(value)])) {
      const d = diffAgainst(value[key], base[key]);
      if (d !== undefined) out[key] = d;
    }
    return out;
  }

  return value as Json;
}

/** Inverse of {@link diffAgainst}. */
export function applyDelta(base: unknown, delta: unknown): unknown {
  if (delta === undefined) return structuredClone(base);
  if (delta === null) return undefined;

  if (isObject(delta) && Array.isArray(base) && typeof delta[ARRAY_LEN] === "number") {
    const length = Math.min(Math.max(0, delta[ARRAY_LEN] as number), 100);
    return Array.from({ length }, (_, i) =>
      String(i) in delta ? applyDelta(base[i], delta[String(i)]) : structuredClone(base[i])
    ).filter((v) => v !== undefined);
  }

  if (isObject(delta) && isObject(base)) {
    const out: Record<string, unknown> = {};
    for (const key of new Set([...Object.keys(base), ...Object.keys(delta)])) {
      const v = key in delta ? applyDelta(base[key], delta[key]) : structuredClone(base[key]);
      if (v !== undefined) out[key] = v;
    }
    return out;
  }

  return delta;
}

function pack(payload: unknown): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

function unpack(encoded: string): unknown {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

/** Encodes an invite for `/invite#c=`. `key` ties replies back to the sender's archive. */
export function encodeInvite(config: InvitationConfig, key: string): string {
  const lang = config.language === "en" ? "en" : "vi";
  const delta = diffAgainst(config, BASELINE_V1[lang]) ?? {};
  return pack({ v: INVITE_PAYLOAD_VERSION, l: lang, k: key, d: delta });
}

export function decodeInvite(encoded: string): { config: InvitationConfig; key: string } | null {
  const payload = unpack(encoded);
  if (!isObject(payload) || payload.v !== INVITE_PAYLOAD_VERSION || !isObject(payload.d)) return null;

  const lang = payload.l === "en" ? "en" : "vi";
  const config = sanitizeInviteConfig(applyDelta(BASELINE_V1[lang], payload.d));
  if (!config) return null;

  const key = typeof payload.k === "string" ? payload.k.slice(0, 40) : "";
  return { config, key };
}

export interface ReplyPayload {
  /** Invite key the answers belong to (short-link id or local key). */
  key: string;
  language: "vi" | "en";
  guestName: string;
  answers: Answers;
}

export function encodeReply(reply: ReplyPayload): string {
  return pack({
    v: REPLY_PAYLOAD_VERSION,
    k: reply.key,
    l: reply.language,
    g: reply.guestName,
    a: reply.answers,
  });
}

const MAX_ANSWERS = 30;
const MAX_ANSWER_LENGTH = 2000;

export function decodeReply(encoded: string): ReplyPayload | null {
  const payload = unpack(encoded);
  if (!isObject(payload) || payload.v !== REPLY_PAYLOAD_VERSION || !isObject(payload.a)) return null;

  const answers: Answers = {};
  for (const [id, value] of Object.entries(payload.a).slice(0, MAX_ANSWERS)) {
    if (typeof value === "string") {
      answers[id.slice(0, 80)] = value.slice(0, MAX_ANSWER_LENGTH);
    } else if (Array.isArray(value)) {
      answers[id.slice(0, 80)] = value
        .filter((v): v is string => typeof v === "string")
        .slice(0, MAX_ANSWERS)
        .map((v) => v.slice(0, MAX_ANSWER_LENGTH));
    }
  }

  return {
    key: typeof payload.k === "string" ? payload.k.slice(0, 40) : "",
    language: payload.l === "en" ? "en" : "vi",
    guestName: typeof payload.g === "string" ? payload.g.slice(0, 80) : "",
    answers,
  };
}

/**
 * Reads `name=` from a URL fragment such as `#c=...`. Split by hand because
 * URLSearchParams turns the `+` that lz-string emits into a space.
 */
export function readHashParam(hash: string, name: string): string | null {
  const body = hash.startsWith("#") ? hash.slice(1) : hash;
  for (const part of body.split("&")) {
    if (part.startsWith(`${name}=`)) return part.slice(name.length + 1);
  }
  return null;
}

/** Random key for invites that fall back to `#c=` links (no server id). */
export function createLocalInviteKey(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return "l" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
