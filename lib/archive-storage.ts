"use client";

export interface SavedInvitationRecord {
  id: string;
  guestName: string;
  senderName: string;
  eventDate?: string;
  shareUrl: string;
  createdAt: string;
  answers?: Record<string, string | string[]> | null;
  updatedAt?: string | null;
}

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

export function saveInvitationRecord(record: SavedInvitationRecord): void {
  if (typeof window === "undefined") return;
  try {
    const list = getSavedInvitations();
    const existingIndex = list.findIndex((item) => item.id === record.id);
    let updatedList: SavedInvitationRecord[];
    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        ...record,
      };
    } else {
      updatedList = [record, ...list];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error("Error saving invitation record:", e);
  }
}

export function removeSavedInvitation(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getSavedInvitations();
    const updatedList = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error("Error removing saved invitation:", e);
  }
}

export async function syncInvitationsWithServer(): Promise<SavedInvitationRecord[]> {
  const localList = getSavedInvitations();
  if (localList.length === 0) return [];

  const ids = localList.map((item) => item.id).filter(Boolean);
  if (ids.length === 0) return localList;

  try {
    const res = await fetch(`/api/invitations?ids=${encodeURIComponent(ids.join(","))}`);
    if (!res.ok) return localList;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.invitations)) return localList;

    const serverMap = new Map<
      string,
      {
        config: { guestName?: string; senderName?: string; eventDate?: string };
        answers: Record<string, string | string[]> | null;
        createdAt: string;
        updatedAt: string;
      }
    >();

    data.invitations.forEach(
      (inv: {
        id: string;
        config: { guestName?: string; senderName?: string; eventDate?: string };
        answers: Record<string, string | string[]> | null;
        createdAt: string;
        updatedAt: string;
      }) => {
        serverMap.set(inv.id, inv);
      }
    );

    const mergedList = localList.map((local) => {
      const remote = serverMap.get(local.id);
      if (!remote) return local;

      return {
        ...local,
        guestName: remote.config?.guestName || local.guestName,
        senderName: remote.config?.senderName || local.senderName,
        eventDate: remote.config?.eventDate || local.eventDate,
        answers: remote.answers || local.answers || null,
        updatedAt: remote.updatedAt || local.updatedAt,
      };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedList));
    return mergedList;
  } catch (err) {
    console.error("Failed to sync invitations with server:", err);
    return localList;
  }
}
