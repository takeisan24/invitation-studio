"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Lock,
  Unlock,
  Sparkles,
  Bookmark,
  Calendar,
} from "lucide-react";
import { domToPng } from "modern-screenshot";
import { WaxSeal } from "@/components/WaxSeal";
import { soundEngine } from "@/lib/audio";
import { InvitationConfig, formatEventDate, extractTimeFromAnswers } from "@/lib/date-content";
import { ThemePreset } from "@/lib/theme-config";

interface StoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: InvitationConfig;
  theme: ThemePreset;
  answers: Record<string, string | string[]>;
  initialPrivacyMode?: boolean;
}

export function StoryCardModal({
  isOpen,
  onClose,
  config,
  theme,
  answers,
  initialPrivacyMode = true,
}: StoryCardModalProps) {
  const storyCardRef = useRef<HTMLDivElement>(null);
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(initialPrivacyMode);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isEn = config.language === "en";
  const eventTimeStr = extractTimeFromAnswers(answers);

  const displayGuestName = isPrivacyMode
    ? config.guestName[0]?.toUpperCase() || "L"
    : config.guestName;
  const displaySenderName = isPrivacyMode
    ? config.senderName[0]?.toUpperCase() || "M"
    : config.senderName;
  const initials = `${displaySenderName} & ${displayGuestName}`;

  const handleDownloadStory = async () => {
    if (!storyCardRef.current) return;
    setIsExporting(true);
    soundEngine.playClick();

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      const dataUrl = await domToPng(storyCardRef.current, {
        scale: 3.2,
        backgroundColor: theme.palette.canvas,
      });

      const link = document.createElement("a");
      const nameTag = isPrivacyMode ? "PRIVATE" : config.guestName.replace(/\s+/g, "_");
      link.download = `STORY-9-16-${nameTag}.png`;
      link.href = dataUrl;
      link.click();

      soundEngine.playChime();
      setFeedback(
        isEn
          ? "Story card (1080×1920) saved to device! 📸"
          : "Đã lưu ảnh Story 9:16 (1080×1920) về máy! 📸"
      );
      setTimeout(() => setFeedback(null), 3500);
    } catch {
      setFeedback(
        isEn
          ? "Could not export image. You can screenshot this card! 📸"
          : "Không thể xuất ảnh lúc này. Bạn có thể chụp màn hình lại nhé! 📸"
      );
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg bg-[#FAF8F5] border border-stone-300 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col items-center my-auto max-h-[96vh] overflow-y-auto"
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="font-serif italic text-base sm:text-lg font-medium text-stone-900">
                  {isEn ? "Story 9:16 Card Export" : "Xuất Thẻ Story 9:16"}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-stone-200 text-stone-700">
                  1080×1920
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Privacy Mode Switch Bar */}
            <div className="w-full flex items-center justify-between py-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setIsPrivacyMode(!isPrivacyMode);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                  isPrivacyMode
                    ? "bg-stone-900 text-[#F9F6F0] border-stone-900 shadow-2xs"
                    : "bg-white text-stone-700 border-stone-300 hover:border-stone-800"
                }`}
              >
                {isPrivacyMode ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#9E7D4B]" />
                    <span>{isEn ? "Privacy Mode: ON" : "Chế độ riêng tư: BẬT"}</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{isEn ? "Privacy Mode: OFF" : "Chế độ riêng tư: TẮT"}</span>
                  </>
                )}
              </button>

              <span className="text-[11px] font-mono text-stone-500">
                {isPrivacyMode
                  ? isEn
                    ? "Initials only • Note hidden"
                    : "Chỉ hiện tên viết tắt & ẩn tâm sự"
                  : isEn
                  ? "Full names • Detailed note"
                  : "Hiện đầy đủ tên & chi tiết"}
              </span>
            </div>

            {/* LIVE PREVIEW CONTAINER (Scaled 9:16 Card) */}
            <div className="py-2 flex items-center justify-center w-full">
              <div
                ref={storyCardRef}
                style={{
                  backgroundColor: theme.palette.canvas,
                  borderColor: theme.palette.border,
                }}
                className="w-[310px] h-[551px] sm:w-[330px] sm:h-[586px] rounded-2xl border p-5 flex flex-col justify-between shadow-md relative overflow-hidden select-none"
              >
                {/* Background decorative watermark */}
                <div
                  style={{ borderColor: theme.palette.border }}
                  className="absolute inset-3 border border-dashed rounded-xl pointer-events-none opacity-60"
                />

                {/* Top Corner Ornaments */}
                <span
                  style={{ color: theme.palette.gold }}
                  className="absolute top-4 left-4 text-[9px] pointer-events-none opacity-70"
                >
                  ✦
                </span>
                <span
                  style={{ color: theme.palette.gold }}
                  className="absolute top-4 right-4 text-[9px] pointer-events-none opacity-70"
                >
                  ✦
                </span>
                <span
                  style={{ color: theme.palette.gold }}
                  className="absolute bottom-4 left-4 text-[9px] pointer-events-none opacity-70"
                >
                  ✦
                </span>
                <span
                  style={{ color: theme.palette.gold }}
                  className="absolute bottom-4 right-4 text-[9px] pointer-events-none opacity-70"
                >
                  ✦
                </span>

                {/* Story Top Header */}
                <div className="text-center pt-2 relative z-10">
                  <div
                    style={{
                      borderColor: theme.palette.border,
                      backgroundColor: theme.palette.cardBg,
                      color: theme.palette.taupe,
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9.5px] font-mono uppercase tracking-[0.2em] shadow-2xs"
                  >
                    <Sparkles
                      style={{ color: theme.palette.gold }}
                      className="w-2.5 h-2.5"
                    />
                    <span>{config.stepTicket.badge || "FIRST DATE PASS"}</span>
                  </div>

                  <h3
                    style={{ color: theme.palette.charcoal }}
                    className="font-serif italic text-2xl font-normal mt-3 leading-tight"
                  >
                    {isPrivacyMode
                      ? `${displayGuestName} & ${displaySenderName}`
                      : `${config.guestName} & ${config.senderName}`}
                  </h3>

                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <Calendar
                      style={{ color: theme.palette.gold }}
                      className="w-3 h-3 flex-shrink-0"
                    />
                    <span
                      style={{ color: theme.palette.taupe }}
                      className="text-[10.5px] font-mono tracking-wider"
                    >
                      {formatEventDate(config.eventDate, config.language)}
                      {eventTimeStr !== "19:00" ? ` • ${eventTimeStr}` : ""}
                    </span>
                  </div>
                </div>

                {/* Story Center: Selected Highlights */}
                <div
                  style={{
                    backgroundColor: theme.palette.cardBg,
                    borderColor: theme.palette.border,
                  }}
                  className="relative z-10 p-3.5 rounded-xl border space-y-2 text-xs shadow-2xs mx-1"
                >
                  {config.questions.map((q) => {
                    const raw = answers[q.id];
                    if (!raw || (Array.isArray(raw) && raw.length === 0)) return null;

                    const isTextAnswer = q.type === "short_text" || q.type === "long_text";

                    return (
                      <div key={q.id} className="flex items-start gap-2">
                        <Bookmark
                          style={{ color: theme.palette.gold }}
                          className="w-3 h-3 mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span
                            style={{ color: theme.palette.taupe }}
                            className="text-[9px] font-mono uppercase tracking-wider block"
                          >
                            {q.title}
                          </span>
                          {isTextAnswer && isPrivacyMode ? (
                            <span
                              style={{ color: theme.palette.gold }}
                              className="italic text-[10.5px] font-serif block opacity-85"
                            >
                              ✦ {isEn ? "Kept private for two" : "Giữ riêng cho hai người"} ✦
                            </span>
                          ) : (
                            <span
                              style={{ color: theme.palette.charcoal }}
                              className="font-medium text-[11px] block leading-snug truncate"
                            >
                              {Array.isArray(raw) ? raw.join(", ") : raw}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Story Center Wax Seal & Quote */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-2 pb-1">
                  <WaxSeal
                    initials={initials}
                    size="md"
                    color={theme.palette.wax}
                  />

                  <p
                    style={{ color: theme.palette.charcoal }}
                    className="font-serif italic text-xs max-w-[240px] leading-relaxed line-clamp-2"
                  >
                    {config.stepTicket.quote}
                  </p>

                  <span
                    style={{ color: theme.palette.taupe }}
                    className="text-[9px] font-mono tracking-widest uppercase opacity-70"
                  >
                    cuochennho.vercel.app
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono text-center w-full">
                {feedback}
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full pt-4 space-y-2">
              <button
                type="button"
                onClick={handleDownloadStory}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-[#F9F6F0] text-xs font-sans uppercase tracking-widest font-medium hover:bg-stone-800 active:scale-[0.99] transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-[#9E7D4B]" />
                <span>
                  {isExporting
                    ? isEn
                      ? "Generating Story Card..."
                      : "Đang tạo ảnh Story..."
                    : isEn
                    ? "Save Story 9:16 (1080×1920) 📸"
                    : "Lưu ảnh Story 9:16 (1080×1920) 📸"}
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-center text-xs font-mono uppercase text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              >
                {isEn ? "Back" : "Quay lại"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
