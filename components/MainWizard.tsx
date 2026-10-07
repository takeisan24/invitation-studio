"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ScreenCover } from "@/components/ScreenCover";
import { ScreenDynamicQuestion } from "@/components/ScreenDynamicQuestion";
import { ScreenTicket } from "@/components/ScreenTicket";
import { AudioToggle } from "@/components/AudioToggle";
import {
  InvitationConfig,
  defaultInvitationConfigVi,
  defaultInvitationConfigEn,
} from "@/lib/date-content";
import { decodeConfigFromUrl } from "@/lib/config-encoder";
import { getThemeById } from "@/lib/theme-config";

interface MainWizardProps {
  customConfig?: InvitationConfig;
  hideAudioToggle?: boolean;
  isRecipientPureView?: boolean;
  className?: string;
  invitationId?: string;
}

export function MainWizard({
  customConfig,
  hideAudioToggle = false,
  className,
  invitationId,
}: MainWizardProps) {
  const searchParams = useSearchParams();
  const effectiveInvitationId = invitationId || searchParams.get("id") || undefined;

  // Determine active configuration: prop customConfig > URL encoded ?c=... > defaults
  const config = useMemo<InvitationConfig>(() => {
    if (customConfig) {
      return customConfig;
    }

    const encodedParam = searchParams.get("c");
    if (encodedParam) {
      const decoded = decodeConfigFromUrl(encodedParam);
      if (decoded) return decoded;
    }

    const lang = (searchParams.get("lang") as "vi" | "en") || "vi";
    const base = lang === "en" ? defaultInvitationConfigEn : defaultInvitationConfigVi;
    const toParam = searchParams.get("to");
    const senderParam = searchParams.get("sender");

    return {
      ...base,
      guestName: toParam || base.guestName,
      senderName: senderParam || base.senderName,
    };
  }, [customConfig, searchParams]);

  // Resolve theme using either preset or customPalette if themeId === "custom"
  const activeTheme = useMemo(() => {
    return getThemeById(config.themeId, config.customPalette);
  }, [config.themeId, config.customPalette]);

  // Total steps = 1 (Cover) + questions.length + 1 (Ticket)
  const totalQuestions = config.questions.length;

  // Step state: 1 is Cover; 2..(totalQuestions + 1) are questions; totalQuestions + 2 is Ticket
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Dynamic answers dictionary: questionId -> value
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(() => {
    const initial: Record<string, string | string[]> = {};
    config.questions.forEach((q) => {
      if (q.type === "course_card" && q.options && q.options.length > 0) {
        initial[q.id] = q.options[0].id || q.options[0].title;
      } else if (q.type === "tag_pills" && q.options && q.options.length > 0) {
        initial[q.id] = [q.options[0].title];
      } else {
        initial[q.id] = "";
      }
    });
    return initial;
  });

  const handleUpdateAnswer = (questionId: string, val: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  };

  // Auto-sync answers to database when reaching confirmed ticket
  useEffect(() => {
    if (currentStep === totalQuestions + 2 && effectiveInvitationId) {
      fetch("/api/invitations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: effectiveInvitationId,
          answers,
        }),
      }).catch((err) => console.error("Error auto-recording answers:", err));
    }
  }, [currentStep, totalQuestions, effectiveInvitationId, answers]);

  const isAtQuestion = currentStep >= 2 && currentStep <= totalQuestions + 1;
  const currentQuestionIndex = currentStep - 2;

  const watermarkText = config.cover.watermark ?? "A quiet moment for two";

  return (
    <div
      style={{ backgroundColor: activeTheme.palette.canvas }}
      className={`relative ${
        className || "min-h-[100dvh] flex flex-col justify-center items-center px-4 py-8"
      } overflow-x-hidden transition-colors duration-500`}
    >
      {/* Background Image if configured */}
      {config.backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-700"
            style={{ backgroundImage: `url(${config.backgroundImage})` }}
          />
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              backgroundColor: activeTheme.palette.canvas,
              opacity: config.backgroundOverlayOpacity ?? 0.35,
            }}
          />
        </>
      )}

      {/* Subtle Paper Noise Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(${activeTheme.palette.border} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Floating Audio Toggle */}
      {!hideAudioToggle && <AudioToggle />}

      {/* Central Editorial Frame (Safe area padding for mobile cameras & notches) */}
      <main
        style={{
          backgroundColor: activeTheme.palette.cardBg,
          borderColor: activeTheme.palette.border,
        }}
        className="w-full max-w-md relative z-10 border rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6 pt-8 pb-8 md:px-8 backdrop-blur-xs transition-colors duration-500"
      >
        {/* Step Progress Bar during questions */}
        {isAtQuestion && totalQuestions > 1 && (
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {config.questions.map((_, idx) => {
              const active = idx === currentQuestionIndex;
              const completed = idx < currentQuestionIndex;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: active
                      ? activeTheme.palette.charcoal
                      : completed
                      ? activeTheme.palette.gold
                      : activeTheme.palette.border,
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    active ? "w-7" : "w-3"
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Dynamic Screen Transition */}
        <AnimatePresence mode="wait">
          {/* STEP 1: COVER */}
          {currentStep === 1 && (
            <ScreenCover
              key="step-cover"
              config={config}
              theme={activeTheme}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {/* QUESTION STEPS */}
          {isAtQuestion && (
            <ScreenDynamicQuestion
              key={`step-q-${config.questions[currentQuestionIndex].id}`}
              question={config.questions[currentQuestionIndex]}
              stepIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              theme={activeTheme}
              value={answers[config.questions[currentQuestionIndex].id] || ""}
              onChange={(val) =>
                handleUpdateAnswer(config.questions[currentQuestionIndex].id, val)
              }
              onBack={() => setCurrentStep(currentStep - 1)}
              onNext={() => setCurrentStep(currentStep + 1)}
              isLastQuestion={currentQuestionIndex === totalQuestions - 1}
              language={config.language}
            />
          )}

          {/* FINAL STEP: SEALED TICKET */}
          {currentStep === totalQuestions + 2 && (
            <ScreenTicket
              key="step-ticket"
              config={config}
              theme={activeTheme}
              answers={answers}
              onBack={() => setCurrentStep(totalQuestions + 1)}
              invitationId={effectiveInvitationId}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer Watermark (Clean, no 'STUDIO' text) */}
      {watermarkText && (
        <footer
          style={{ color: activeTheme.palette.taupe }}
          className="mt-6 text-center text-[10.5px] font-mono tracking-widest uppercase z-10 opacity-75"
        >
          {watermarkText}
        </footer>
      )}
    </div>
  );
}
