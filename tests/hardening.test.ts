import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultInvitationConfigVi } from "@/lib/date-content";
import { isAllowedBackgroundImage, sanitizeInviteConfig } from "@/lib/invite-sanitize";
import { isInviteExpired } from "@/lib/server/invite-store";
import { applyReply, getSavedInvitations, saveInvitationRecord } from "@/lib/archive-storage";
import type { ReplyPayload } from "@/lib/invite-codec";

const bg = (backgroundImage: unknown) =>
  sanitizeInviteConfig({ ...structuredClone(defaultInvitationConfigVi), backgroundImage })?.backgroundImage;

describe("background image hosts", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("keeps the sample photos", () => {
    const u = "https://images.unsplash.com/photo-1?w=1000";
    expect(bg(u)).toBe(u);
  });
  it("drops unknown hosts, plain http and look-alikes", () => {
    expect(bg("https://example.com/a.jpg")).toBeUndefined();
    expect(bg("http://images.unsplash.com/a.jpg")).toBeUndefined();
    expect(bg("https://images.unsplash.com.evil.example/a.jpg")).toBeUndefined();
    expect(bg("https://evil.example/images.unsplash.com")).toBeUndefined();
    expect(bg("javascript:alert(1)")).toBeUndefined();
  });
  it("accepts only our own store when the build knows it", () => {
    vi.stubEnv("NEXT_PUBLIC_BLOB_HOST", "mine123.public.blob.vercel-storage.com");
    const ours = "https://mine123.public.blob.vercel-storage.com/assets/2611/bg-x.webp";
    expect(bg(ours)).toBe(ours);
    expect(bg("https://other456.public.blob.vercel-storage.com/assets/2611/bg-x.webp")).toBeUndefined();
    expect(isAllowedBackgroundImage("https://x.public.blob.vercel-storage.com/a.png", "mine123.public.blob.vercel-storage.com")).toBe(false);
  });
  it("accepts any Blob store when the build has no store (local dev)", () => {
    expect(isAllowedBackgroundImage("https://abc.public.blob.vercel-storage.com/a.png", undefined)).toBe(true);
  });
  it("an old card with a stray URL still opens with the theme background", () => {
    const c = sanitizeInviteConfig({ ...structuredClone(defaultInvitationConfigVi), backgroundImage: "https://tracker.example/p.png" });
    expect(c).not.toBeNull();
    expect(c?.backgroundImage).toBeUndefined();
  });
});

describe("background image URL shape", () => {
  const payloads = [
    "https://images.unsplash.com/a),url(https://tracker.example/t.gif",
    "https://images.unsplash.com/a'); color: red; (",
    "https://images.unsplash.com/a\";x",
    "https://images.unsplash.com/a;background:url(x)",
    "https://images.unsplash.com/a b.jpg",
    "https://images.unsplash.com/a\\b.jpg",
    "https://images.unsplash.com:8443/a.jpg",
    "https://user:pw@images.unsplash.com/a.jpg",
    "https://images.unsplash.com/a\nb.jpg",
  ];
  it.each(payloads)("drops %j", (u) => {
    expect(bg(u)).toBeUndefined();
  });
  it("stores the normalized href", () => {
    expect(bg("https://IMAGES.unsplash.com/photo-1?w=1000&q=80")).toBe("https://images.unsplash.com/photo-1?w=1000&q=80");
  });
});

describe("custom music host", () => {
  afterEach(() => vi.unstubAllEnvs());
  const music = (url: string) =>
    sanitizeInviteConfig({ ...structuredClone(defaultInvitationConfigVi), music: { trackId: "custom", title: "x", artist: "y", url } })?.music;

  it("accepts only our store when the build knows it", () => {
    vi.stubEnv("NEXT_PUBLIC_BLOB_HOST", "mine123.public.blob.vercel-storage.com");
    const ours = "https://mine123.public.blob.vercel-storage.com/assets/2611/audio-x.mp3";
    expect(music(ours)?.url).toBe(ours);
    expect(music("https://other456.public.blob.vercel-storage.com/a.mp3")).toBeUndefined();
  });
  it("applies the same character and port rules", () => {
    expect(music("https://abc.public.blob.vercel-storage.com:444/a.mp3")).toBeUndefined();
    expect(music("https://abc.public.blob.vercel-storage.com/a.mp3\"x")).toBeUndefined();
  });
});

describe("isInviteExpired", () => {
  const now = new Date(Date.UTC(2026, 10, 19)); // Nov 2026 -> 2611
  it("expires ids whose month has passed", () => {
    expect(isInviteExpired("2501abcdefghjk", now)).toBe(true);
    expect(isInviteExpired("2610abcdefghjk", now)).toBe(true);
  });
  it("keeps the current and future months", () => {
    expect(isInviteExpired("2611abcdefghjk", now)).toBe(false);
    expect(isInviteExpired("2702abcdefghjk", now)).toBe(false);
  });
  it("never expires legacy 8-char ids or junk", () => {
    expect(isInviteExpired("abcdefgh", now)).toBe(false);
    expect(isInviteExpired("zzz", now)).toBe(false);
  });
});

describe("applyReply", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    });
    saveInvitationRecord({ id: "k1", guestName: "Linh", senderName: "An", shareUrl: "", createdAt: "2026-11-01" });
  });
  afterEach(() => vi.unstubAllGlobals());

  const reply = (answers: ReplyPayload["answers"]): ReplyPayload => ({ key: "k1", language: "vi", guestName: "Linh", answers });
  const stored = () => getSavedInvitations().find((r) => r.id === "k1")!;

  it("saves the first reply without asking", () => {
    expect(applyReply(reply({ a: "x" })).status).toBe("saved");
    expect(stored().answers).toEqual({ a: "x" });
  });
  it("reports an identical reply as already saved", () => {
    applyReply(reply({ a: "x", b: ["1", "2"] }));
    expect(applyReply(reply({ b: ["1", "2"], a: "x" })).status).toBe("unchanged");
  });
  it("asks before replacing and writes nothing", () => {
    applyReply(reply({ a: "x" }));
    const r = applyReply(reply({ a: "y" }));
    expect(r.status).toBe("needs_confirm");
    expect(r.incoming?.answers).toEqual({ a: "y" });
    expect(stored().answers).toEqual({ a: "x" });
    expect(stored().history).toBeUndefined();
  });
  it("replaces on confirm and keeps the old answer in history", () => {
    applyReply(reply({ a: "x" }));
    expect(applyReply(reply({ a: "y" }), { replace: true }).status).toBe("saved");
    expect(stored().answers).toEqual({ a: "y" });
    expect(stored().history?.[0].answers).toEqual({ a: "x" });
  });
  it("caps the history", () => {
    for (let i = 0; i < 15; i++) applyReply(reply({ a: String(i) }), { replace: true });
    expect(stored().history?.length).toBe(10);
  });
});
