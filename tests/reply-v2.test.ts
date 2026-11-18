import { describe, expect, it } from "vitest";
import LZString from "lz-string";
import { decodeReply, encodeReply } from "@/lib/invite-codec";
import { defaultInvitationConfigVi, formatReplyMessage } from "@/lib/date-content";
import { resolveReplyAnswers, buildAnswerLabels } from "@/lib/archive-storage";

const cfg = defaultInvitationConfigVi;
const answers = {
  "time-slot": "sunset",
  "vibe-location": "balcony",
  "drink-taste": ["Cà phê đậm vị", "Trà hoa thanh nhẹ"],
  dislikes: "Không ăn cay",
  "secret-note": "Mình dị ứng đậu phộng",
};

describe("reply link v2", () => {
  it("round-trips choices as indexes and keeps text", () => {
    const url = encodeReply({ key: "k1", language: "vi", guestName: "Linh", answers }, cfg.questions);
    const decoded = decodeReply(url)!;
    expect(decoded.cells?.slice(0, 3)).toEqual([0, 0, [0, 1]]);
    expect(decoded.cells?.[4]).toBe("Mình dị ứng đậu phộng");
    expect(decoded.cells?.[3]).toBe("Không ăn cay");
    expect(decoded.fingerprint).toBeTruthy();
  });

  it("is shorter than the v1 payload", () => {
    const v2 = encodeReply({ key: "2611abcdefghij", language: "vi", guestName: "Linh", answers }, cfg.questions);
    const v1 = LZString.compressToEncodedURIComponent(
      JSON.stringify({ v: 1, k: "2611abcdefghij", l: "vi", g: "Linh", a: answers })
    );
    expect(v2.length).toBeLessThan(v1.length);
  });

  it("still reads v1 links", () => {
    const v1 = LZString.compressToEncodedURIComponent(
      JSON.stringify({ v: 1, k: "k", l: "vi", g: "A", a: { "time-slot": "sunset" } })
    );
    expect(decodeReply(v1)?.answers["time-slot"]).toBe("sunset");
  });

  it("resolves indexes to labels with default questions, even without a saved record", () => {
    const decoded = decodeReply(encodeReply({ key: "k", language: "vi", guestName: "L", answers }, cfg.questions))!;
    const { answers: out, labels } = resolveReplyAnswers(decoded);
    expect(out["time-slot"]).toBe("sunset");
    expect(labels["time-slot"].options?.sunset).toBe("Hoàng hôn buông");
  });

  it("does not guess labels when the sender customised the questions", () => {
    const custom = structuredClone(cfg.questions);
    custom[0].options![0].title = "Sáng sớm";
    const decoded = decodeReply(encodeReply({ key: "k", language: "vi", guestName: "L", answers }, custom))!;
    expect(resolveReplyAnswers(decoded).answers["q1"]).toBe("Phương án 1");
    const saved = buildAnswerLabels({ ...cfg, questions: custom });
    expect(resolveReplyAnswers(decoded, saved).answers["time-slot"]).toBe("sunset");
  });
});

describe("formatReplyMessage", () => {
  it("is compact and uses labels", () => {
    const url = "https://cuochennho.vercel.app/reply#r=" + encodeReply(
      { key: "2611abcdefghij", language: "vi", guestName: "Linh", answers }, cfg.questions);
    const msg = formatReplyMessage({ ...cfg, guestName: "Linh", eventDate: "2026-12-20" }, answers, url);
    expect(msg).toContain("Hoàng hôn buông");
    expect(msg).not.toMatch(/\bsunset\b/);
    expect(msg.length).toBeLessThan(450);
  });
});
