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
