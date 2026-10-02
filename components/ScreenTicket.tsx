"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Share2,
  Download,
  CheckCircle2,
  Bookmark,
  RotateCcw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { domToPng, domToBlob } from "modern-screenshot";
import { WaxSeal } from "@/components/WaxSeal";
import { soundEngine } from "@/lib/audio";
import {
  InvitationConfig,
  formatDynamicShareMessage,
} from "@/lib/date-content";
import { ThemePreset } from "@/lib/theme-config";

interface ScreenTicketProps {
  config: InvitationConfig;
  theme: ThemePreset;
  answers: Record<string, string | string[]>;
  onBack: () => void;
}

export function ScreenTicket({
  config,
  theme,
  answers,
  onBack,
}: ScreenTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const ticketContent = config.stepTicket;

  // Trigger wax seal sound & light confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      soundEngine.playWaxSeal();
    }, 200);

    const confettiTimer = setTimeout(() => {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: [theme.palette.gold, theme.palette.wax, "#E7CBA1", theme.palette.charcoal],
      });
    }, 450);

    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [theme]);

  const getShareMessage = () => {
    return formatDynamicShareMessage(config, answers);
  };

  // 1. Native Share Handler (Direct to Zalo/Messenger/iMessage)
  const handleNativeShare = async () => {
    soundEngine.playChime();
    const shareText = getShareMessage();

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        let fileToShare: File | null = null;

        if (ticketRef.current && typeof navigator.canShare === "function") {
          try {
            const blob = await domToBlob(ticketRef.current, {
              scale: 2,
              backgroundColor: theme.palette.cardBg,
            });
            if (blob) {
              fileToShare = new File(
                [blob],
                `invitation-pass-${config.guestName}.png`,
                {
                  type: "image/png",
                }
              );
            }
          } catch {
            // Ignore capture error and fallback
          }
        }

        if (fileToShare && navigator.canShare({ files: [fileToShare] })) {
          await navigator.share({
            title:
              config.language === "en"
                ? `First Date Admission Pass for ${config.guestName} & ${config.senderName}`
                : `Vé hẹn đầu tiên dành cho ${config.guestName} & ${config.senderName}`,
            text: shareText,
            files: [fileToShare],
          });
          return;
        }

        await navigator.share({
          title:
            config.language === "en"
              ? `First Date Admission Pass for ${config.guestName} & ${config.senderName}`
              : `Vé hẹn đầu tiên dành cho ${config.guestName} & ${config.senderName}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          fallbackCopyToClipboard(shareText);
        }
      }
    } else {
      fallbackCopyToClipboard(shareText);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(
      config.language === "en"
        ? `Response copied! You can paste and send it to ${config.senderName} ✨`
        : `Đã sao chép phản hồi! Bạn có thể dán vào tin nhắn gửi cho ${config.senderName} nhé ✨`
    );
    setTimeout(() => setCopyFeedback(null), 4500);
  };

  // 2. Download Ticket as PNG Image
  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;
    setIsExporting(true);
    soundEngine.playClick();

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      const dataUrl = await domToPng(ticketRef.current, {
        scale: 2.5,
        backgroundColor: theme.palette.canvas,
      });

      const link = document.createElement("a");
      link.download = `VINTAGE-DATE-PASS-${config.guestName.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();

      soundEngine.playChime();
      setCopyFeedback(
        config.language === "en"
          ? "Pass image saved to your device ✨"
          : "Đã lưu ảnh cuống vé về máy của bạn ✨"
      );
      setTimeout(() => setCopyFeedback(null), 3500);
    } catch {
      setCopyFeedback(
        config.language === "en"
          ? "Could not save pass image. You can take a quick screenshot instead! 📸"
          : "Không thể lưu ảnh vé lúc này. Bạn có thể chụp màn hình lại nhé! 📸"
      );
      setTimeout(() => setCopyFeedback(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const initials = `${config.senderName[0] || "M"} & ${config.guestName[0] || "L"}`;

  return (
    <motion.div
      key="screen-ticket"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col justify-between min-h-[620px] py-4"
    >
      <div>
        {/* Top Notice */}
        <div className="text-center mb-5">
          <span
            style={{ color: theme.palette.gold }}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase font-medium"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {config.language === "en" ? "CONFIRMED & SEALED" : "ĐÃ XÁC NHẬN & NIÊM PHONG"}
            </span>
          </span>
        </div>

        {/* Vintage Boarding Pass / Ticket Element */}
        <div
          ref={ticketRef}
          style={{
            backgroundColor: theme.palette.cardBg,
            borderColor: theme.palette.border,
          }}
          className="relative border rounded-xl p-6 shadow-sm overflow-hidden"
        >
          {/* Top Notch Left & Right */}
          <div
            style={{
              backgroundColor: theme.palette.canvas,
              borderColor: theme.palette.border,
            }}
            className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full border pointer-events-none"
          />
          <div
            style={{
              backgroundColor: theme.palette.canvas,
              borderColor: theme.palette.border,
            }}
            className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full border pointer-events-none"
          />

          {/* Ticket Header */}
          <div
            style={{ borderColor: theme.palette.border }}
            className="flex items-center justify-between border-b border-dashed pb-4 mb-5"
          >
            <div>
              <span
                style={{ color: theme.palette.gold }}
                className="text-[10px] font-mono uppercase tracking-[0.2em]"
              >
                {ticketContent.badge}
              </span>
              <h3
                style={{ color: theme.palette.charcoal }}
                className="font-serif text-xl italic font-medium mt-0.5"
              >
                {config.guestName} & {config.senderName}
              </h3>
            </div>
            <div className="text-right">
              <span
                style={{ color: theme.palette.taupe }}
                className="text-[10px] font-mono tracking-widest uppercase block"
              >
                {config.language === "en" ? "TICKET NO." : "MÃ VÉ HẸN"}
              </span>
              <span
                style={{ color: theme.palette.charcoal }}
                className="font-mono text-xs font-bold"
              >
                #INV-001
              </span>
            </div>
          </div>

          {/* Flexible Dynamic Answers Recap */}
          <div className="space-y-3 text-xs">
            {config.questions.map((q) => {
              const raw = answers[q.id];
              if (!raw || (Array.isArray(raw) && raw.length === 0) || (typeof raw === "string" && !raw.trim())) {
                return null;
              }

              const displayVal = Array.isArray(raw) ? raw.join(", ") : raw;

              return (
                <div key={q.id} className="flex items-start gap-2.5">
                  <Bookmark
                    style={{ color: theme.palette.gold }}
                    className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <span
                      style={{ color: theme.palette.taupe }}
                      className="font-mono uppercase text-[9.5px] tracking-wider block"
                    >
                      {q.title}
                    </span>
                    <span
                      style={{ color: theme.palette.charcoal }}
                      className="font-medium leading-snug block"
                    >
                      {displayVal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Perforated Divider */}
          <div
            style={{ borderColor: theme.palette.border }}
            className="my-5 border-b border-dashed relative"
          />

          {/* Ticket Footer with Wax Seal */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-1">
              <p
                style={{ color: theme.palette.charcoal }}
                className="font-serif italic text-base leading-snug"
              >
                {ticketContent.closingTitle}
              </p>
              <p
                style={{ color: theme.palette.gold }}
                className="text-xs font-light"
              >
                {ticketContent.closingSub}
              </p>
            </div>

            <WaxSeal
              initials={initials}
              size="md"
              animateStamp={true}
              color={theme.palette.wax}
            />
          </div>
        </div>

        {/* Feedback message banner */}
        {copyFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: theme.palette.selectedTint,
              borderColor: theme.palette.gold,
              color: theme.palette.charcoal,
            }}
            className="mt-4 p-3 rounded-lg border text-center text-xs"
          >
            {copyFeedback}
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        {/* Main CTA */}
        <button
          onClick={handleNativeShare}
          type="button"
          style={{
            backgroundColor: theme.palette.charcoal,
            color: theme.palette.canvas,
          }}
          className="w-full group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full font-sans text-xs uppercase tracking-widest font-medium transition-all duration-300 hover:opacity-90 active:scale-[0.99] shadow-sm"
        >
          <Share2 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
          <span>
            {ticketContent.actionSend} {config.senderName} 💌
          </span>
        </button>

        {/* Secondary CTA */}
        <button
          onClick={handleDownloadTicket}
          disabled={isExporting}
          type="button"
          style={{
            borderColor: theme.palette.border,
            color: theme.palette.charcoal,
            backgroundColor: theme.palette.cardBg,
          }}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border font-sans text-xs uppercase tracking-widest font-normal hover:opacity-90 transition-all shadow-2xs active:scale-[0.99]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>
            {isExporting
              ? config.language === "en"
                ? "Generating pass image..."
                : "Đang tạo ảnh cuống vé..."
              : ticketContent.actionDownload}
          </span>
        </button>

        {/* Back option */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              soundEngine.playPaperBack();
              onBack();
            }}
            type="button"
            style={{
              borderColor: theme.palette.border,
              color: theme.palette.taupe,
              backgroundColor: theme.palette.cardBg,
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[11px] font-mono uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-2xs"
          >
            <RotateCcw className="w-3 h-3 opacity-70" />
            <span>{config.language === "en" ? "Modify your choices" : "Chỉnh sửa lại lựa chọn"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
