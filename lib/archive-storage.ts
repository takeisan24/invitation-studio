"use client";

import type { InvitationConfig } from "./date-content";
import type { ReplyPayload } from "./invite-codec";

export type AnswerLabels = Record<string, { title: string; options?: Record<string, string> }>;

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
}

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
export function applyReply(reply: ReplyPayload): { record: SavedInvitationRecord; matched: boolean } {
  const now = new Date().toISOString();
  const existing = reply.key ? getSavedInvitations().find((item) => item.id === reply.key) : undefined;

  const record: SavedInvitationRecord = existing
    ? { ...existing, answers: reply.answers, updatedAt: now }
    : {
        id: reply.key || `reply-${Date.now()}`,
        guestName: reply.guestName,
        senderName: "",
        shareUrl: "",
        createdAt: now,
        answers: reply.answers,
        updatedAt: now,
      };

  saveInvitationRecord(record);
  return { record, matched: !!existing };
}
