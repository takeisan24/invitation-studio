"use client";

import type { InvitationConfig } from "./date-content";
import { questionsFingerprint, type ReplyPayload } from "./invite-codec";
import { BASELINE_V1 } from "./invite-baseline";

export type AnswerLabels = Record<
  string,
  { title: string; options?: Record<string, string>; /** option ids in display order */ optionIds?: string[] }
>;

export interface SavedInvitationRecord {
  /** Invite key: the short-link id, or the local key embedded in a #c= link. */
  id: string;
  guestName: string;
  senderName: string;
  eventDate?: string;
  shareUrl: string;
  createdAt: string;
  answers?: Record<string, string | string[]> | null;
  updatedAt?: string | null;
  /** Question and option titles, so answers can be shown without the invite config. */
  labels?: AnswerLabels;
  /** Earlier replies that were replaced, newest first. */
  history?: ReplyHistoryEntry[];
}

export interface ReplyHistoryEntry {
  answers: Record<string, string | string[]>;
  labels?: AnswerLabels;
  replacedAt: string;
}

const MAX_HISTORY = 10;

// The archive lives only in this browser; answers arrive through /reply links.
const STORAGE_KEY = "cuochennho_saved_invitations";

export function getSavedInvitations(): SavedInvitationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error reading saved invitations:", e);
    return [];
  }
}

function writeAll(list: SavedInvitationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Error saving invitations:", e);
  }
}

export function saveInvitationRecord(record: SavedInvitationRecord): void {
  if (typeof window === "undefined") return;
  const list = getSavedInvitations();
  const existingIndex = list.findIndex((item) => item.id === record.id);
  if (existingIndex >= 0) {
    const updatedList = [...list];
    updatedList[existingIndex] = { ...updatedList[existingIndex], ...record };
    writeAll(updatedList);
  } else {
    writeAll([record, ...list]);
  }
}

export function removeSavedInvitation(id: string): void {
  if (typeof window === "undefined") return;
  writeAll(getSavedInvitations().filter((item) => item.id !== id));
}

export function buildAnswerLabels(config: InvitationConfig): AnswerLabels {
  const labels: AnswerLabels = {};
  for (const q of config.questions) {
    labels[q.id] = {
      title: q.title,
      optionIds: q.options?.map((o) => o.id || o.title),
      options: q.options
        ? Object.fromEntries(q.options.map((o) => [o.id || o.title, o.title]))
        : undefined,
    };
  }
  return labels;
}

/** Display text for one answer, using stored labels when the archive has them. */
export function formatAnswer(
  value: string | string[],
  label?: AnswerLabels[string]
): string {
  const values = Array.isArray(value) ? value : [value];
  return values.map((v) => label?.options?.[v] ?? v).join(", ");
}

/**
 * Stores answers from a reply link. Matches the sender's own record by invite key;
 * when this browser never created that invite, keeps the answers as a new record.
 */
/**
 * Turns a reply into answers keyed by question id. v2 links carry positional cells and option
 * indexes, resolved with the sender's saved labels, else the default questions (only when the
 * sender kept them). Whatever cannot be resolved shows as "Phương án N".
 */
export function resolveReplyAnswers(
  reply: ReplyPayload,
  savedLabels?: AnswerLabels
): { answers: Record<string, string | string[]>; labels: AnswerLabels } {
  const defaults = BASELINE_V1[reply.language].questions;
  const useDefaults = !reply.fingerprint || reply.fingerprint === questionsFingerprint(defaults);
  const labels: AnswerLabels = {
    ...(useDefaults ? buildAnswerLabels(BASELINE_V1[reply.language]) : {}),
    ...savedLabels,
  };
  const answers: Record<string, string | string[]> = { ...reply.answers };
  if (!reply.cells) return { answers, labels };

  const prefix = reply.language === "en" ? "Option" : "Phương án";
  const order = Object.keys(savedLabels ?? (useDefaults ? labels : {}));
  reply.cells.forEach((cell, i) => {
    if (cell === null) return;
    const qid = order[i] ?? `q${i + 1}`;
    if (typeof cell === "string" || (Array.isArray(cell) && typeof cell[0] === "string")) {
      answers[qid] = cell as string | string[];
      return;
    }
    const label = labels[qid];
    const ids = label?.optionIds ?? (label?.options ? Object.keys(label.options) : []);
    const picked = (Array.isArray(cell) ? (cell as number[]) : [cell as number]).map(
      (n) => ids[n] ?? `${prefix} ${n + 1}`
    );
    answers[qid] = picked.length === 1 ? picked[0] : picked;
  });
  return { answers, labels };
}

type Answers = Record<string, string | string[]>;

function sameAnswers(a?: Answers | null, b?: Answers | null): boolean {
  const norm = (x?: Answers | null) =>
    JSON.stringify(Object.entries(x ?? {}).sort(([k1], [k2]) => (k1 < k2 ? -1 : 1)));
  return norm(a) === norm(b);
}

export type ApplyReplyStatus =
  /** Stored (first reply, or the sender confirmed a replacement). */
  | "saved"
  /** The same answers are already stored. */
  | "unchanged"
  /** Different answers already exist; nothing was written until the sender confirms. */
  | "needs_confirm";

export interface ApplyReplyResult {
  record: SavedInvitationRecord;
  matched: boolean;
  status: ApplyReplyStatus;
  /** Present when status is "needs_confirm": what the new link carries. */
  incoming?: { answers: Answers; labels: AnswerLabels };
}

/**
 * Stores a reply. Replies are not authenticated, so a different answer for an invite that
 * already has one is not written until `replace` is set; the replaced answer is kept in `history`.
 */
export function applyReply(reply: ReplyPayload, options: { replace?: boolean } = {}): ApplyReplyResult {
  const now = new Date().toISOString();
  const existing = reply.key ? getSavedInvitations().find((item) => item.id === reply.key) : undefined;
  const { answers, labels } = resolveReplyAnswers(reply, existing?.labels);
  const hasOld = !!existing?.answers && Object.keys(existing.answers).length > 0;

  if (existing && hasOld) {
    if (sameAnswers(existing.answers, answers)) return { record: existing, matched: true, status: "unchanged" };
    if (!options.replace) {
      return { record: existing, matched: true, status: "needs_confirm", incoming: { answers, labels } };
    }
  }

  const history =
    existing && hasOld
      ? [
          { answers: existing.answers as Answers, labels: existing.labels, replacedAt: now },
          ...(existing.history ?? []),
        ].slice(0, MAX_HISTORY)
      : existing?.history;

  const record: SavedInvitationRecord = existing
    ? { ...existing, answers, labels, updatedAt: now, ...(history ? { history } : {}) }
    : {
        id: reply.key || `reply-${Date.now()}`,
        guestName: reply.guestName,
        senderName: "",
        shareUrl: "",
        createdAt: now,
        answers,
        labels,
        updatedAt: now,
      };

  saveInvitationRecord(record);
  return { record, matched: !!existing, status: "saved" };
}
