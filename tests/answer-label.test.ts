import { describe, expect, it } from "vitest";
import { answerLabel, defaultInvitationConfigVi } from "@/lib/date-content";

describe("answerLabel", () => {
  const card = defaultInvitationConfigVi.questions.find((q) => q.options?.length)!;
  it("maps an option id to its title", () => {
    const opt = card.options![0];
    expect(answerLabel(card, opt.id)).toBe(opt.title);
  });
  it("keeps free text as is", () => {
    expect(answerLabel(card, "một câu tự do")).toBe("một câu tự do");
  });
});

import { extractTimeFromAnswers } from "@/lib/date-content";

describe("extractTimeFromAnswers", () => {
  const qs = defaultInvitationConfigVi.questions;
  it("reads the time from the chosen option subtitle", () => {
    expect(extractTimeFromAnswers({ "time-slot": "sunset" }, qs)).toBe("16:30");
    expect(extractTimeFromAnswers({ "time-slot": "night" }, qs)).toBe("19:30");
  });
  it("still reads a time typed into free text", () => {
    expect(extractTimeFromAnswers({ note: "gặp lúc 8:15 nhé" })).toBe("08:15");
  });
  it("defaults to 19:00 only when no time exists", () => {
    expect(extractTimeFromAnswers({ "vibe-location": "balcony" }, qs)).toBe("19:00");
    expect(extractTimeFromAnswers({})).toBe("19:00");
  });
});
