import { describe, expect, it } from "vitest";
import { defaultInvitationConfigVi, formatDynamicShareMessage } from "@/lib/date-content";

describe("formatDynamicShareMessage", () => {
  it("shows option titles instead of stored option ids", () => {
    const message = formatDynamicShareMessage(defaultInvitationConfigVi, { "time-slot": "sunset" });
    expect(message).toContain("Hoàng hôn buông");
    expect(message).not.toMatch(/: sunset\b/);
  });
});
