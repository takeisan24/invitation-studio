"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { soundEngine } from "@/lib/audio";
import { QuestionBlock, QuestionOption } from "@/lib/date-content";
import { ThemePreset } from "@/lib/theme-config";

interface ScreenDynamicQuestionProps {
  question: QuestionBlock;
  stepIndex: number;
  totalQuestions: number;
  theme: ThemePreset;
  value: string | string[];
  onChange: (val: string | string[]) => void;
  onBack: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
  language?: "vi" | "en";
}

export function ScreenDynamicQuestion({
  question,
  stepIndex,
  totalQuestions,
  theme,
  value,
  onChange,
  onBack,
  onNext,
  isLastQuestion,
  language = "vi",
}: ScreenDynamicQuestionProps) {
  const handleNext = () => {
    soundEngine.playPaperRustle();
    onNext();
  };

  const handleBack = () => {
    soundEngine.playPaperBack();
    onBack();
  };

  const handleCardClick = (id: string) => {
    soundEngine.playClick();
    onChange(id);
  };

  const handlePillClick = (title: string) => {
    soundEngine.playClick();
    const current = Array.isArray(value) ? value : [];
    if (current.includes(title)) {
      onChange(current.filter((item) => item !== title));
    } else {
      onChange([...current, title]);
    }
  };

  return (
    <motion.div
      key={`question-${question.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col justify-between min-h-[560px] py-4"
    >
      <div>
        {/* Top Header */}
        <div
          style={{ borderColor: theme.palette.border }}
          className="flex items-center justify-between border-b pb-3 mb-6"
        >
          <span
            style={{ color: theme.palette.taupe }}
            className="text-[10px] font-mono uppercase tracking-[0.2em]"
          >
            {language === "en" ? "CURATED QUESTION" : "LỰA CHỌN BUỔI HẸN"}
          </span>
          <span
            style={{ color: theme.palette.gold }}
            className="text-[11px] font-mono tracking-widest uppercase font-medium"
          >
            {stepIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Question Title & Subtitle */}
        <div className="mb-6">
          <h2
            style={{ color: theme.palette.charcoal }}
            className="font-serif text-2xl md:text-3xl italic font-normal tracking-tight"
          >
            {question.title}
          </h2>
          {question.subtitle && (
            <p
              style={{ color: theme.palette.taupe }}
              className="text-xs font-light mt-1.5 leading-relaxed"
            >
              {question.subtitle}
            </p>
          )}
        </div>

        {/* TYPE 1: COURSE CARDS */}
        {question.type === "course_card" && question.options && (
          <div className="space-y-3 pt-1">
            {question.options.map((opt: QuestionOption) => {
              const isSelected = value === opt.id || value === opt.title;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleCardClick(opt.id || opt.title)}
                  style={{
                    backgroundColor: isSelected ? theme.palette.selectedTint : "transparent",
                    borderColor: isSelected ? theme.palette.charcoal : theme.palette.border,
                  }}
                  className="w-full relative text-left p-4 rounded-xl border transition-all duration-300"
                >
                  {isSelected && (
                    <span
                      style={{ backgroundColor: theme.palette.gold }}
                      className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full ring-2 ring-black/10"
                    />
                  )}

                  {opt.badge && (
                    <span
                      style={{ color: theme.palette.gold }}
                      className="block text-[10px] font-mono uppercase tracking-widest mb-1 font-medium"
                    >
                      {opt.badge}
                    </span>
                  )}
                  <h3
                    style={{ color: theme.palette.charcoal }}
                    className="font-serif text-lg font-medium leading-snug"
                  >
                    {opt.title}
                  </h3>
                  {opt.subtitle && (
                    <p
                      style={{ color: theme.palette.taupe }}
                      className="text-xs font-light mt-1 leading-relaxed"
                    >
                      {opt.subtitle}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* TYPE 2: TAG PILLS */}
        {question.type === "tag_pills" && question.options && (
          <div className="flex flex-wrap gap-2.5 pt-2">
            {question.options.map((opt: QuestionOption) => {
              const currentList = Array.isArray(value) ? value : [];
              const isSelected = currentList.includes(opt.title) || currentList.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePillClick(opt.title)}
                  style={{
                    borderColor: isSelected ? theme.palette.charcoal : theme.palette.border,
                    backgroundColor: isSelected ? theme.palette.charcoal : "transparent",
                    color: isSelected ? theme.palette.cardBg : theme.palette.charcoal,
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs transition-all duration-200 border"
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span className="font-medium tracking-wide">{opt.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* TYPE 3: UNDERLINE SHORT TEXT */}
        {question.type === "short_text" && (
          <div className="pt-4">
            <input
              type="text"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={
                question.placeholder ||
                (language === "en" ? "Write what's on your mind..." : "Viết điều bạn nghĩ vào đây...")
              }
              style={{
                borderColor: theme.palette.border,
                color: theme.palette.charcoal,
              }}
              className="w-full bg-transparent border-0 border-b pb-2.5 placeholder:font-serif placeholder:italic text-sm focus:outline-none transition-colors"
            />
          </div>
        )}

        {/* TYPE 4: RULED LETTER LONG TEXT */}
        {question.type === "long_text" && (
          <div className="pt-2">
            <textarea
              rows={4}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={
                question.placeholder ||
                (language === "en" ? "Leave a private note..." : "Để lại lời nhắn bí mật...")
              }
              style={{
                borderColor: theme.palette.border,
                color: theme.palette.charcoal,
              }}
              className="w-full lined-letter bg-transparent border rounded-lg p-3.5 placeholder:font-serif placeholder:italic text-sm focus:outline-none transition-colors resize-none leading-loose"
            />
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div
        style={{ borderColor: theme.palette.border }}
        className="pt-6 border-t flex items-center justify-between"
      >
        <button
          onClick={handleBack}
          type="button"
          style={{
            borderColor: theme.palette.border,
            color: theme.palette.charcoal,
            backgroundColor: theme.palette.cardBg,
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-[11px] font-mono uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === "en" ? "Back" : "Trang trước"}</span>
        </button>

        <button
          onClick={handleNext}
          type="button"
          style={{
            borderColor: theme.palette.charcoal,
            color: theme.palette.charcoal,
            backgroundColor: theme.palette.cardBg,
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border font-sans text-xs uppercase tracking-widest font-medium transition-all duration-300 hover:opacity-85 active:scale-[0.98] shadow-2xs"
        >
          <span>
            {isLastQuestion
              ? language === "en"
                ? "Seal Admission Pass"
                : "Hoàn tất tấm vé"
              : language === "en"
              ? "Continue"
              : "Tiếp tục"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
