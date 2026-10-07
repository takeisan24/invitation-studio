"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Share2,
  Download,
  CheckCircle2,
  Bookmark,
  RotateCcw,
  Calendar,
  ExternalLink,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { domToPng, domToBlob } from "modern-screenshot";
import { WaxSeal } from "@/components/WaxSeal";
import { soundEngine } from "@/lib/audio";
import {
  InvitationConfig,
  formatDynamicShareMessage,
  formatEventDate,
  extractTimeFromAnswers,
  getUpcomingDate,
  createGoogleCalendarUrl,
  createIcsFileContent,
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
  const [showCalendarModal, setShowCalendarModal] = useState(false);

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

  const eventDateStr = config.eventDate || getUpcomingDate(6);
  const eventTimeStr = extractTimeFromAnswers(answers);
  const eventTitle =
    config.language === "en"
      ? `Date with ${config.senderName} 💌`
      : `Buổi hẹn cùng ${config.senderName} 💌`;
  const eventDetails = formatDynamicShareMessage(config, answers);

  const handleDownloadIcs = () => {
    soundEngine.playChime();
    const icsContent = createIcsFileContent({
      title: eventTitle,
      details: eventDetails,
      startDateStr: eventDateStr,
      startTimeStr: eventTimeStr,
      durationHours: 2.5,
    });
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cuoc-hen-${config.guestName.replace(/\s+/g, "_")}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
    setShowCalendarModal(false);
    setCopyFeedback(
      config.language === "en"
        ? "Calendar event (.ics) downloaded ✨"
        : "Đã tải file lịch (.ics) về máy ✨"
    );
    setTimeout(() => setCopyFeedback(null), 3500);
  };

  const handleOpenGoogleCalendar = () => {
    soundEngine.playClick();
    const gUrl = createGoogleCalendarUrl({
      title: eventTitle,
      details: eventDetails,
      startDateStr: eventDateStr,
      startTimeStr: eventTimeStr,
      durationHours: 2.5,
    });
    window.open(gUrl, "_blank", "noopener,noreferrer");
    setShowCalendarModal(false);
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

          {/* Date & Time Field on Boarding Pass */}
          <div
            style={{
              borderColor: theme.palette.border,
              backgroundColor: theme.palette.canvas + "80",
            }}
            className="flex items-center justify-between px-3 py-2 rounded-lg border mb-4 text-xs"
          >
            <div className="flex items-center gap-2">
              <Calendar style={{ color: theme.palette.gold }} className="w-3.5 h-3.5 flex-shrink-0" />
              <span
                style={{ color: theme.palette.taupe }}
                className="font-mono uppercase text-[9.5px] tracking-wider"
              >
                {config.language === "en" ? "DATE & TIME" : "NGÀY & GIỜ HẸN"}
              </span>
            </div>
            <span
              style={{ color: theme.palette.charcoal }}
              className="font-medium text-right text-[11px] font-mono"
            >
              {formatEventDate(config.eventDate, config.language)}
              {eventTimeStr !== "19:00" ? ` • ${eventTimeStr}` : ""}
            </span>
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

        {/* Add to Calendar Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            setShowCalendarModal(true);
          }}
          type="button"
          style={{
            borderColor: theme.palette.border,
            color: theme.palette.charcoal,
            backgroundColor: theme.palette.cardBg,
          }}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border font-sans text-xs uppercase tracking-widest font-normal hover:border-stone-800 transition-all shadow-2xs active:scale-[0.99] cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-[#9E7D4B]" />
          <span>
            {config.language === "en" ? "✦ Add to Calendar" : "✦ Thêm vào Lịch"}
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
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[11px] font-mono uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 opacity-70" />
            <span>{config.language === "en" ? "Modify your choices" : "Chỉnh sửa lại lựa chọn"}</span>
          </button>
        </div>
      </div>

      {/* Calendar Selection Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{
              backgroundColor: theme.palette.cardBg,
              borderColor: theme.palette.border,
            }}
            className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl relative text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: theme.palette.selectedTint }}
                  className="w-8 h-8 rounded-full flex items-center justify-center border"
                >
                  <Calendar className="w-4 h-4 text-[#9E7D4B]" />
                </div>
                <div>
                  <h3
                    style={{ color: theme.palette.charcoal }}
                    className="font-serif italic text-lg font-medium"
                  >
                    {config.language === "en" ? "Add to Calendar" : "Thêm Buổi Hẹn Vào Lịch"}
                  </h3>
                  <p
                    style={{ color: theme.palette.taupe }}
                    className="text-[11px] font-mono"
                  >
                    {formatEventDate(config.eventDate, config.language)}
                    {eventTimeStr !== "19:00" ? ` • ${eventTimeStr}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 font-light mb-4">
              {config.language === "en"
                ? "Save our quiet rendezvous to your calendar so you won't miss this special moment:"
                : "Lưu lại cuộc hẹn vào ứng dụng lịch để không bỏ lỡ khoảnh khắc đặc biệt này nhé:"}
            </p>

            <div className="space-y-2.5 mb-4">
              {/* Apple Calendar / .ics file */}
              <button
                type="button"
                onClick={handleDownloadIcs}
                style={{
                  borderColor: theme.palette.border,
                  backgroundColor: theme.palette.canvas,
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border text-left hover:border-stone-800 transition-all cursor-pointer group"
              >
                <div>
                  <span
                    style={{ color: theme.palette.charcoal }}
                    className="text-xs font-semibold block"
                  >
                    {config.language === "en" ? "Apple Calendar / .ics File" : "Apple Calendar / File Lịch (.ics)"}
                  </span>
                  <span
                    style={{ color: theme.palette.taupe }}
                    className="text-[10.5px] block font-light mt-0.5"
                  >
                    {config.language === "en"
                      ? "Best for iPhone, iPad, Mac & Outlook"
                      : "Tối ưu cho iPhone, iPad, Mac & Outlook"}
                  </span>
                </div>
                <Download className="w-4 h-4 text-stone-400 group-hover:text-stone-900 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Google Calendar */}
              <button
                type="button"
                onClick={handleOpenGoogleCalendar}
                style={{
                  borderColor: theme.palette.border,
                  backgroundColor: theme.palette.canvas,
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border text-left hover:border-stone-800 transition-all cursor-pointer group"
              >
                <div>
                  <span
                    style={{ color: theme.palette.charcoal }}
                    className="text-xs font-semibold block"
                  >
                    {config.language === "en" ? "Google Calendar" : "Google Calendar (Web)"}
                  </span>
                  <span
                    style={{ color: theme.palette.taupe }}
                    className="text-[10.5px] block font-light mt-0.5"
                  >
                    {config.language === "en"
                      ? "Open directly in your Google Calendar"
                      : "Mở trực tiếp trên web Google Calendar"}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              >
                {config.language === "en" ? "Cancel" : "Đóng"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
