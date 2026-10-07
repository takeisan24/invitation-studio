"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Calendar } from "lucide-react";
import { soundEngine } from "@/lib/audio";
import { InvitationConfig, formatEventDate } from "@/lib/date-content";
import { ThemePreset } from "@/lib/theme-config";

interface ScreenCoverProps {
  config: InvitationConfig;
  theme: ThemePreset;
  onNext: () => void;
}

export function ScreenCover({ config, theme, onNext }: ScreenCoverProps) {
  const content = config.cover;

  const handleStart = () => {
    soundEngine.playPaperRustle();
    onNext();
  };

  const footerText = content.footerNote
    ? content.footerNote.replace(/{{sender}}/g, config.senderName)
    : "";

  return (
    <motion.div
      key="screen-cover"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col justify-between min-h-[520px] pt-4 pb-6 text-center"
    >
      {/* Top Header Badge (With safe area margin for mobile notches) */}
      <div className="pt-2">
        {content.badge && content.badge.trim() && (
          <div
            style={{
              borderColor: theme.palette.border,
              backgroundColor: theme.palette.selectedTint,
              color: theme.palette.taupe,
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[10.5px] font-mono uppercase tracking-[0.25em]"
          >
            <Sparkles style={{ color: theme.palette.gold }} className="w-2.5 h-2.5 flex-shrink-0" />
            <span>{content.badge.replace(/^[✦★✨*•·]\s*/, "").trim()}</span>
          </div>
        )}
      </div>

      {/* Main Title Section */}
      <div className="my-auto py-6">
        <span
          style={{ color: theme.palette.gold }}
          className="block text-sm font-mono tracking-widest uppercase mb-2 font-medium"
        >
          {config.language === "en" ? `Dear ${config.guestName},` : `Gửi ${config.guestName},`}
        </span>

        {config.eventDate && (
          <div
            style={{
              borderColor: theme.palette.border,
              backgroundColor: theme.palette.cardBg,
              color: theme.palette.taupe,
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono tracking-wider mb-4 shadow-2xs"
          >
            <Calendar style={{ color: theme.palette.gold }} className="w-3 h-3 flex-shrink-0" />
            <span>{formatEventDate(config.eventDate, config.language)}</span>
          </div>
        )}

        <h1
          style={{ color: theme.palette.charcoal }}
          className="font-serif text-4xl md:text-5xl italic font-normal tracking-tight leading-[1.2]"
        >
          {content.title}
        </h1>

        <div
          style={{ backgroundColor: theme.palette.border }}
          className="w-12 h-px mx-auto my-6"
        />

        <p
          style={{ color: theme.palette.taupe }}
          className="text-[14.5px] font-light leading-relaxed max-w-xs mx-auto tracking-wide"
        >
          {content.note}
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 space-y-3">
        <button
          onClick={handleStart}
          type="button"
          style={{
            borderColor: theme.palette.charcoal,
            color: theme.palette.charcoal,
          }}
          className="group relative inline-flex items-center gap-3 px-8 py-3 rounded-full border font-sans text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 hover:opacity-90 active:scale-[0.98] shadow-xs"
        >
          <span>{content.cta}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>

        {footerText && (
          <p
            style={{ color: theme.palette.taupe }}
            className="text-[11px] font-mono tracking-wider uppercase opacity-80"
          >
            {footerText}
          </p>
        )}
      </div>
    </motion.div>
  );
}
