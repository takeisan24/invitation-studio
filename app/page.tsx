"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Send,
  Globe,
  ExternalLink,
} from "lucide-react";
import { DICTIONARY, Language } from "@/lib/i18n";
import { encodeConfigToUrl } from "@/lib/config-encoder";
import {
  defaultInvitationConfigVi,
  defaultInvitationConfigEn,
  InvitationConfig,
} from "@/lib/date-content";
import { soundEngine } from "@/lib/audio";

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("vi");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("invitation_lang") as Language;
      if (savedLang === "vi" || savedLang === "en") {
        queueMicrotask(() => {
          setLang(savedLang);
        });
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleToggleLang = () => {
    const nextLang: Language = lang === "vi" ? "en" : "vi";
    setLang(nextLang);
    try {
      localStorage.setItem("invitation_lang", nextLang);
    } catch {
      // Ignore
    }
  };

  const t = DICTIONARY[lang];

  // Pre-generate a live demo invitation URL for immediate sample experience
  const demoUrl = useMemo(() => {
    const sampleConfig: InvitationConfig = {
      ...(lang === "en" ? defaultInvitationConfigEn : defaultInvitationConfigVi),
      guestName: lang === "en" ? "Sophia" : "Ngọc Linh",
      senderName: lang === "en" ? "Alexander" : "Hoàng Minh",
      themeId: "alabaster",
    };
    const code = encodeConfigToUrl(sampleConfig);
    return `/invite?c=${code}`;
  }, [lang]);

  // Primary CTA logic: route to /onboarding as the mandatory guide before studio
  const handleStart = () => {
    soundEngine.playPaperRustle();
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-stone-900 selection:bg-[#9E7D4B]/20 selection:text-stone-900 font-sans flex flex-col justify-between overflow-x-hidden">
      {/* Background Subtle Noise Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(#E7E5E4 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Header */}
      <header className="relative z-20 max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-stone-200">
        <div className="flex items-center gap-3">
          {/* Brand Icon matching favicon */}
          <div className="w-9 h-9 rounded-full bg-[#7A2021] text-[#E7CBA1] border border-[#D4AF37] flex items-center justify-center font-serif italic text-base shadow-xs flex-shrink-0">
            ✦
          </div>
          <div>
            <span className="font-serif italic font-medium text-lg text-stone-900 block leading-tight">
              {lang === "vi" ? "Cuộc Hẹn Nhỏ" : "A Quiet Gathering"}
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-stone-500 block">
              {lang === "vi" ? "Thiệp mời tinh tế & riêng tư" : "Editorial & Vintage Date Studio"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Studio Shortcut for returning creators */}
          <button
            onClick={() => router.push("/customize")}
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-300 text-xs font-mono uppercase tracking-wider text-stone-700 hover:border-stone-800 transition-colors bg-white/70"
          >
            <Sliders className="w-3.5 h-3.5 text-[#9E7D4B]" />
            <span>{t.landing.navStudio}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={handleToggleLang}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 text-xs font-mono uppercase tracking-wider text-stone-700 hover:border-stone-800 transition-colors bg-white/70 backdrop-blur-xs"
          >
            <Globe className="w-3.5 h-3.5 text-[#9E7D4B]" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-full border border-stone-300 text-stone-700 hover:text-stone-900 hover:border-stone-800 transition-colors bg-white/70"
            title="GitHub Repository"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-14 md:py-20 text-center">
        {/* Editorial Sub-badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-stone-300 bg-[#F2ECE1]/70 text-[10.5px] font-mono uppercase tracking-[0.25em] text-stone-600 mb-6">
          <Sparkles className="w-3 h-3 text-[#9E7D4B]" />
          <span>{t.landing.badge.replace(/^[✦★✨*•·]\s*/, "")}</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl italic font-normal tracking-tight text-stone-900 leading-[1.1] mb-6">
          {t.landing.heroTitle1} <br />
          <span className="text-[#9E7D4B]">{t.landing.heroTitle2}</span>
        </h1>

        <div className="w-16 h-px bg-stone-300 mx-auto my-6" />

        {/* Hero Description */}
        <p className="max-w-xl mx-auto text-stone-600 text-base md:text-lg font-light leading-relaxed tracking-wide mb-10">
          {t.landing.heroDesc}
        </p>

        {/* Single Primary CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            type="button"
            className="group inline-flex items-center justify-center gap-3.5 px-9 py-4 rounded-full bg-stone-900 text-[#F9F6F0] font-sans text-xs uppercase tracking-[0.2em] font-medium shadow-md transition-all duration-300 hover:bg-stone-800 active:scale-[0.98]"
          >
            <span>{t.landing.ctaStart}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Interactive Visual Mockup Card Preview (Single entry point to sample demo) */}
        <div className="mt-14 md:mt-16 relative max-w-md mx-auto">
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playWaxSeal()}
            title={t.landing.demoHint}
            className="block group text-left transition-all duration-300 transform hover:-translate-y-1.5"
          >
            <div className="bg-[#FAF8F5] border-2 border-dashed border-[#9E7D4B]/50 group-hover:border-[#9E7D4B] rounded-2xl p-6 shadow-xl group-hover:shadow-2xl transition-all relative overflow-hidden">
              {/* Notches on the sides to look like a real vintage admission pass */}
              <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F9F6F0] border border-stone-300 pointer-events-none" />
              <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F9F6F0] border border-stone-300 pointer-events-none" />

              {/* Floating Action Banner */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E7D4B] font-medium">
                    ADMISSION PASS · #INV-001
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-600 bg-stone-100 group-hover:bg-[#7A2021] group-hover:text-white px-2.5 py-1 rounded-full transition-colors">
                  <span>{lang === "vi" ? "Chạm để xem mẫu" : "Tap to view pass"}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {/* Names & Wax Seal */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                    {lang === "vi" ? "Buổi hẹn của hai bạn:" : "An evening for two:"}
                  </span>
                  <h4 className="font-serif italic text-2xl font-normal text-stone-900 leading-tight">
                    {lang === "vi" ? "Ngọc Linh & Hoàng Minh" : "Sophia & Alexander"}
                  </h4>
                </div>
                
                {/* 3D Wax Seal with Hover Animation */}
                <div className="w-12 h-12 rounded-full bg-[#7A2021] text-[#E7CBA1] border-2 border-[#D4AF37]/80 flex items-center justify-center font-serif italic text-base shadow-md group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  ✦
                </div>
              </div>

              {/* Quote / Subtext */}
              <p className="text-xs text-stone-600 font-light leading-relaxed mb-4 italic font-serif">
                {lang === "vi"
                  ? "“Lịch trình đã được xác nhận. Mọi khâu sắp xếp còn lại, để mình lo.”"
                  : "“Itinerary confirmed. Leave all remaining arrangements to me.”"}
              </p>

              {/* Sample itinerary footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 uppercase pt-3 border-t border-dashed border-stone-200">
                <span>Course 01 · 17:00</span>
                <span>Course 02 · Rooftop Jazz</span>
              </div>
            </div>
          </a>
        </div>

        {/* 3 Pillar Features (Warm & friendly non-tech wording) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-20 md:mt-24 pt-12 border-t border-stone-200">
          <div className="p-6 rounded-2xl border border-stone-200 bg-white/60 space-y-2.5 hover:border-stone-400 hover:shadow-md hover:bg-white transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-[#F2ECE1] text-[#9E7D4B] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-900">
              {t.landing.feature1Title}
            </h3>
            <p className="text-xs text-stone-600 font-light leading-relaxed">
              {t.landing.feature1Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-stone-200 bg-white/60 space-y-2.5 hover:border-stone-400 hover:shadow-md hover:bg-white transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-[#F2ECE1] text-[#9E7D4B] flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-900">
              {t.landing.feature2Title}
            </h3>
            <p className="text-xs text-stone-600 font-light leading-relaxed">
              {t.landing.feature2Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-stone-200 bg-white/60 space-y-2.5 hover:border-stone-400 hover:shadow-md hover:bg-white transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-[#F2ECE1] text-[#9E7D4B] flex items-center justify-center shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-900">
              {t.landing.feature3Title}
            </h3>
            <p className="text-xs text-stone-600 font-light leading-relaxed">
              {t.landing.feature3Desc}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-stone-200 py-6 text-center text-xs font-mono text-stone-500 uppercase tracking-widest">
        <span>{t.landing.openSourceNote}</span>
      </footer>
    </div>
  );
}
