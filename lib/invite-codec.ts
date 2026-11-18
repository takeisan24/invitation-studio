import LZString from "lz-string";
import type { InvitationConfig, QuestionBlock } from "./date-content";
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
// v1: answers carry option ids/titles. v2: choice answers are option indexes (numbers),
// which keeps the link short; readers accept both so links already sent still open.
export const REPLY_PAYLOAD_VERSION = 2;

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

/** One answer slot of a v2 reply, aligned with the invite's questions: option indexes or text. */
export type ReplyCell = string | string[] | number | number[] | null;

export interface ReplyPayload {
  /** Invite key the answers belong to (short-link id or local key). */
  key: string;
  language: "vi" | "en";
  guestName: string;
  /** Answers by question id (v1 links, and the input to encodeReply). */
  answers: Answers;
  /** v2 links: one cell per question, in question order. Resolved to labels by the reader. */
  cells?: ReplyCell[];
  /** v2 links: fingerprint of the sender's questions, to know if default labels apply. */
  fingerprint?: string;
}

/** Short stable hash of question/option ids and titles (FNV-1a, base 36). */
export function questionsFingerprint(questions: QuestionBlock[]): string {
  const text = questions
    .map((q) => `${q.id}|${q.type}|${(q.options ?? []).map((o) => `${o.id}:${o.title}`).join(",")}`)
    .join(";");
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

/**
 * Encodes a reply. With `questions` (v2) each answer becomes one positional cell and choices
 * become option indexes, which keeps the link short; without, the v1 id-keyed form is used.
 */
export function encodeReply(reply: ReplyPayload, questions?: QuestionBlock[]): string {
  const head = { k: reply.key, l: reply.language, g: reply.guestName };
  if (!questions) return pack({ v: 1, ...head, a: reply.answers });

  const cells: ReplyCell[] = questions.map((q) => {
    const value = reply.answers[q.id];
    if (value === undefined || (Array.isArray(value) && value.length === 0) || value === "") return null;
    if (q.options?.length) {
      const values = Array.isArray(value) ? value : [value];
      const idx = values.map((v) => q.options!.findIndex((o) => o.id === v || o.title === v));
      if (idx.every((i) => i >= 0)) return Array.isArray(value) ? idx : idx[0];
    }
    return value;
  });
  while (cells.length > 0 && cells[cells.length - 1] === null) cells.pop();
  return pack({ v: REPLY_PAYLOAD_VERSION, ...head, a: cells, f: questionsFingerprint(questions) });
}

const MAX_ANSWERS = 30;
const MAX_ANSWER_LENGTH = 2000;

function cleanCell(value: unknown): ReplyCell {
  if (typeof value === "number") return Number.isInteger(value) && value >= 0 && value < 100 ? value : null;
  if (typeof value === "string") return value.slice(0, MAX_ANSWER_LENGTH);
  if (Array.isArray(value)) {
    const nums = value.filter((v): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 100);
    if (nums.length > 0 && nums.length === value.length) return nums.slice(0, MAX_ANSWERS);
    const strs = value.filter((v): v is string => typeof v === "string");
    if (strs.length > 0) return strs.slice(0, MAX_ANSWERS).map((v) => v.slice(0, MAX_ANSWER_LENGTH));
  }
  return null;
}

export function decodeReply(encoded: string): ReplyPayload | null {
  const payload = unpack(encoded);
  if (!isObject(payload)) return null;

  const base = {
    key: typeof payload.k === "string" ? payload.k.slice(0, 40) : "",
    language: payload.l === "en" ? ("en" as const) : ("vi" as const),
    guestName: typeof payload.g === "string" ? payload.g.slice(0, 80) : "",
  };

  if (payload.v === 2 && Array.isArray(payload.a)) {
    return {
      ...base,
      answers: {},
      cells: payload.a.slice(0, MAX_ANSWERS).map(cleanCell),
      ...(typeof payload.f === "string" ? { fingerprint: payload.f.slice(0, 12) } : {}),
    };
  }

  if (payload.v !== 1 || !isObject(payload.a)) return null;
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
  return { ...base, answers };
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
