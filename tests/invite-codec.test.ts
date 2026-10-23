import { describe, expect, it } from "vitest";
import {
  applyDelta,
  decodeInvite,
  decodeReply,
  diffAgainst,
  encodeInvite,
  encodeReply,
  readHashParam,
} from "@/lib/invite-codec";
import { BASELINE_V1 } from "@/lib/invite-baseline";
import { sanitizeInviteConfig } from "@/lib/invite-sanitize";
import { defaultInvitationConfigEn, defaultInvitationConfigVi } from "@/lib/date-content";
import type { InvitationConfig } from "@/lib/date-content";

const vi = (): InvitationConfig => structuredClone(BASELINE_V1.vi);

describe("delta", () => {
  it("round-trips object, array and removal changes", () => {
    const base = { a: 1, b: { c: "x", d: "y" }, list: [{ id: "1", t: "a" }, { id: "2", t: "b" }] };
    const value = { a: 2, b: { c: "x" }, list: [{ id: "1", t: "z" }], extra: [1, 2] };
    const delta = diffAgainst(value, base);
    expect(applyDelta(base, delta)).toEqual(value);
  });

  it("is undefined for identical values", () => {
    expect(diffAgainst(vi(), BASELINE_V1.vi)).toBeUndefined();
  });
});

describe("invite links", () => {
  it("round-trips a customised invite", () => {
    const config = vi();
    config.guestName = "Minh Thư";
    config.senderName = "Tuấn Anh";
    config.eventDate = "2026-11-20";
    config.cover.title = "Cuối tuần này đi dạo hồ Tây nhé?";
    config.questions[0].title = "Bạn rảnh lúc nào?";
    config.questions.push({ id: "q-1", type: "short_text", title: "Ăn gì sau đó?" });
    config.questions.splice(1, 1);

    const decoded = decodeInvite(encodeInvite(config, "abc"));
    expect(decoded?.key).toBe("abc");
    expect(decoded?.config).toEqual(config);
  });

  it("keeps a names-and-date invite short enough for an easy QR code", () => {
    const config = { ...vi(), guestName: "Minh Thư", senderName: "Tuấn Anh", eventDate: "2026-11-20" };
    expect(encodeInvite(config, "l0123456789abcdef").length).toBeLessThan(200);
  });

  it("round-trips English invites against the English baseline", () => {
    const config = { ...structuredClone(BASELINE_V1.en), guestName: "Sophia" };
    expect(decodeInvite(encodeInvite(config, "k"))?.config).toEqual(config);
  });

  it("rejects garbage and unknown versions", () => {
    expect(decodeInvite("not-a-payload")).toBeNull();
    expect(decodeInvite("")).toBeNull();
  });

  // Links already sent decode against the frozen snapshot, so drift between the
  // live defaults and the snapshot must be a deliberate v2, never an accident.
  it("baseline snapshot still matches the live defaults", () => {
    expect(BASELINE_V1.vi).toEqual(JSON.parse(JSON.stringify(defaultInvitationConfigVi)));
    expect(BASELINE_V1.en).toEqual(JSON.parse(JSON.stringify(defaultInvitationConfigEn)));
  });
});

describe("sanitizeInviteConfig", () => {
  it("drops unsafe URLs and colors", () => {
    const dirty = {
      ...vi(),
      backgroundImage: "javascript:alert(1)",
      customPalette: { canvas: "red;background:url(x)" },
      music: { trackId: "custom", title: "x", url: "https://evil.example/a.mp3" },
    };
    const clean = sanitizeInviteConfig(dirty);
    expect(clean?.backgroundImage).toBeUndefined();
    expect(clean?.customPalette).toBeUndefined();
    expect(clean?.music).toBeUndefined();
  });

  it("keeps https backgrounds and Blob-hosted music", () => {
    const clean = sanitizeInviteConfig({
      ...vi(),
      backgroundImage: "https://images.unsplash.com/photo-1",
      music: { trackId: "custom", title: "Our song", url: "https://abc.public.blob.vercel-storage.com/a.mp3" },
    });
    expect(clean?.backgroundImage).toBe("https://images.unsplash.com/photo-1");
    expect(clean?.music?.url).toBe("https://abc.public.blob.vercel-storage.com/a.mp3");
  });

  it("fills missing sections and drops malformed questions", () => {
    const clean = sanitizeInviteConfig({ guestName: "A", questions: [{ id: 1 }, { id: "q", type: "short_text", title: "T" }] });
    expect(clean?.cover.title).toBe(BASELINE_V1.vi.cover.title);
    expect(clean?.questions).toEqual([{ id: "q", type: "short_text", title: "T" }]);
  });

  it("returns null for non-objects", () => {
    expect(sanitizeInviteConfig("x")).toBeNull();
    expect(sanitizeInviteConfig(null)).toBeNull();
  });
});

describe("reply links", () => {
  it("round-trips answers and stays short", () => {
    const reply = {
      key: "2611abcdefghjk",
      language: "vi" as const,
      guestName: "Minh Thư",
      answers: { "time-slot": "sunset", vibe: ["Trà", "Bánh"], "secret-note": "Hẹn sau 5h nha" },
    };
    const encoded = encodeReply(reply);
    expect(decodeReply(encoded)).toEqual(reply);
    expect(encoded.length).toBeLessThan(300);
  });

  it("drops non-string answer values", () => {
    const encoded = encodeReply({ key: "k", language: "vi", guestName: "", answers: { a: 1 as unknown as string } });
    expect(decodeReply(encoded)?.answers).toEqual({});
  });
});

describe("readHashParam", () => {
  it("reads values from a fragment", () => {
    expect(readHashParam("#c=abc&x=1", "c")).toBe("abc");
    expect(readHashParam("", "c")).toBeNull();
  });

  it("keeps the '+' characters lz-string emits", () => {
    expect(readHashParam("#c=a+b$c", "c")).toBe("a+b$c");
  });

  it("round-trips an invite through a real fragment", () => {
    const config = { ...vi(), guestName: "Ngọc Linh ✦ & Hoàng Minh" };
    const hash = `#c=${encodeInvite(config, "k")}`;
    expect(decodeInvite(readHashParam(hash, "c")!)?.config).toEqual(config);
  });
});
