import { describe, expect, it } from "vitest";
import { sanitizeInviteConfig } from "@/lib/invite-sanitize";
import { defaultInvitationConfigVi } from "@/lib/date-content";

const withMusic = (music: unknown) => sanitizeInviteConfig({ ...structuredClone(defaultInvitationConfigVi), music });

describe("music sanitising", () => {
  it("old Mixkit invites fall back to the built-in track", () => {
    const c = withMusic({ trackId: "cozy-piano", title: "x", artist: "y", url: "https://assets.mixkit.co/a.mp3" });
    expect(c?.music).toEqual({ trackId: "lofi-rhodes", title: "Vintage Lo-Fi Rhodes", artist: "Cuộc Hẹn Nhỏ Sessions" });
  });
  it("drops custom music that is not on our Blob host", () => {
    expect(withMusic({ trackId: "custom", title: "x", url: "https://evil.example/a.mp3" })?.music).toBeUndefined();
  });
  it("keeps custom music on the Blob host", () => {
    const url = "https://abc.public.blob.vercel-storage.com/a.mp3";
    expect(withMusic({ trackId: "custom", title: "x", url })?.music?.url).toBe(url);
  });
});
