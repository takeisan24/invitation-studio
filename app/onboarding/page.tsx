"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Heart,
  Clock,
  Coffee,
  Ticket,
  Globe,
  Lightbulb,
  Laptop,
  Sliders,
  Palette,
  Users,
} from "lucide-react";
import { DICTIONARY, Language } from "@/lib/i18n";
import { soundEngine } from "@/lib/audio";

export default function OnboardingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("vi");
  const [activeTab, setActiveTab] = useState<"software" | "content">("software");

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

  const handleFinishOnboarding = () => {
    soundEngine.playPaperRustle();
    try {
      localStorage.setItem("has_completed_onboarding", "true");
    } catch {
      // Ignore
    }
    router.push("/customize");
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-stone-900 font-sans selection:bg-[#9E7D4B]/20 selection:text-stone-900 flex flex-col justify-between">
      {/* Background Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(#E7E5E4 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Header */}
      <header className="relative z-20 max-w-4xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-stone-200">
        <button
          onClick={() => {
            soundEngine.playPaperBack();
            router.push("/");
          }}
          type="button"
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === "en" ? "Home" : "Trang chủ"}</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={handleFinishOnboarding}
            type="button"
            className="text-xs font-mono uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1.5"
          >
            <span>{t.onboarding.skip}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={handleToggleLang}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 text-xs font-mono uppercase tracking-wider text-stone-700 hover:border-stone-800 transition-colors bg-white/60"
          >
            <Globe className="w-3.5 h-3.5 text-[#9E7D4B]" />
            <span>{lang.toUpperCase()}</span>
          </button>
        </div>
      </header>

      {/* Main Guide Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-10 md:py-14 w-full">
        {/* Sub-badge */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-stone-300 bg-[#F2ECE1]/70 text-[10px] font-mono uppercase tracking-[0.25em] text-[#9E7D4B]">
            <Sparkles className="w-3 h-3" />
            <span>{t.onboarding.badge}</span>
          </span>
        </div>

        {/* Title */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="font-serif text-3xl md:text-5xl italic font-normal tracking-tight text-stone-900 leading-tight">
            {t.onboarding.title}
          </h1>
          <p className="text-stone-600 text-xs md:text-sm font-light max-w-lg mx-auto leading-relaxed">
            {t.onboarding.subtitle}
          </p>
        </div>

        {/* Segmented Control: Software Guide vs Content Guide */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-2xl bg-stone-200/80 border border-stone-300 gap-1 shadow-inner">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab("software");
              }}
              type="button"
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "software"
                  ? "bg-white text-stone-900 font-bold shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Laptop className="w-4 h-4 text-[#9E7D4B]" />
              <span>{t.onboarding.tabSoftware}</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab("content");
              }}
              type="button"
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "content"
                  ? "bg-white text-stone-900 font-bold shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Heart className="w-4 h-4 text-[#9E7D4B]" />
              <span>{t.onboarding.tabContent}</span>
            </button>
          </div>
        </div>

        {/* ================= SECTION 1: SOFTWARE GUIDE ================= */}
        {activeTab === "software" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Section 1A: 3-Step App Workflow */}
            <div className="space-y-4">
              <div className="border-b border-stone-200 pb-2">
                <h2 className="font-serif italic text-2xl text-stone-900">
                  {t.onboarding.appWorkflowTitle}
                </h2>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  {t.onboarding.appWorkflowSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="p-5 rounded-2xl border border-stone-200 bg-white/70 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="w-9 h-9 rounded-full bg-[#F2ECE1] text-[#9E7D4B] flex items-center justify-center font-mono font-bold text-xs">
                    01
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-medium text-base text-stone-900">
                      {t.onboarding.appStep1Title}
                    </h3>
                    <p className="text-xs text-stone-600 font-light leading-relaxed">
                      {t.onboarding.appStep1Desc}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-2xl border border-stone-200 bg-white/70 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="w-9 h-9 rounded-full bg-[#F2ECE1] text-[#9E7D4B] flex items-center justify-center font-mono font-bold text-xs">
                    02
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-medium text-base text-stone-900">
                      {t.onboarding.appStep2Title}
                    </h3>
                    <p className="text-xs text-stone-600 font-light leading-relaxed">
                      {t.onboarding.appStep2Desc}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-2xl border border-stone-200 bg-white/70 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="w-9 h-9 rounded-full bg-[#F2ECE1] text-[#9E7D4B] flex items-center justify-center font-mono font-bold text-xs">
                    03
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-medium text-base text-stone-900">
                      {t.onboarding.appStep3Title}
                    </h3>
                    <p className="text-xs text-stone-600 font-light leading-relaxed">
                      {t.onboarding.appStep3Desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1B: 4 Studio Tabs Details */}
            <div className="space-y-4">
              <div className="border-b border-stone-200 pb-2">
                <h2 className="font-serif italic text-2xl text-stone-900">
                  {t.onboarding.studioTabsTitle}
                </h2>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  {t.onboarding.studioTabsSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tab 1 */}
                <div className="p-5 rounded-xl border border-stone-200 bg-white/60 hover:border-stone-400 transition-all space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#FAF8F5] border border-stone-200 text-[#9E7D4B]">
                      <Palette className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif text-base font-medium text-stone-900">
                      {t.onboarding.tool1Title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {t.onboarding.tool1Desc}
                  </p>
                </div>

                {/* Tab 2 */}
                <div className="p-5 rounded-xl border border-stone-200 bg-white/60 hover:border-stone-400 transition-all space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#FAF8F5] border border-stone-200 text-[#9E7D4B]">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif text-base font-medium text-stone-900">
                      {t.onboarding.tool2Title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {t.onboarding.tool2Desc}
                  </p>
                </div>

                {/* Tab 3 */}
                <div className="p-5 rounded-xl border border-stone-200 bg-white/60 hover:border-stone-400 transition-all space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#FAF8F5] border border-stone-200 text-[#9E7D4B]">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif text-base font-medium text-stone-900">
                      {t.onboarding.tool3Title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {t.onboarding.tool3Desc}
                  </p>
                </div>

                {/* Tab 4 */}
                <div className="p-5 rounded-xl border border-stone-200 bg-white/60 hover:border-stone-400 transition-all space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#FAF8F5] border border-stone-200 text-[#9E7D4B]">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif text-base font-medium text-stone-900">
                      {t.onboarding.tool4Title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {t.onboarding.tool4Desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1C: Tips Box */}
            <div className="p-5 rounded-xl border border-[#9E7D4B]/30 bg-[#F2ECE1]/50 flex items-start gap-3.5">
              <Lightbulb className="w-5 h-5 text-[#9E7D4B] flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-serif text-base font-medium text-stone-900">
                  {t.onboarding.appTipsTitle}
                </h4>
                <p className="text-xs text-stone-700 font-light leading-relaxed">
                  {t.onboarding.appTipsDesc}
                </p>
              </div>
            </div>

            {/* Link to Content Tab */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab("content");
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                className="text-xs font-mono text-[#9E7D4B] hover:text-stone-900 hover:underline uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                <span>{lang === "en" ? "Explore Dating Content & Etiquette Guide →" : "Xem tiếp cẩm nang nội dung & tâm lý hẹn hò →"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= SECTION 2: CONTENT GUIDE ================= */}
        {activeTab === "content" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Introduction Philosophy Card */}
            <div className="bg-[#FAF8F5] border border-stone-300 border-l-4 border-l-[#9E7D4B] rounded-2xl p-6 md:p-8 shadow-xs leading-relaxed text-sm md:text-base font-light text-stone-700">
              <p className="italic font-serif text-stone-900 text-lg mb-2">
                “The most memorable invitations are felt, not simply read.”
              </p>
              <p>{t.onboarding.intro}</p>
            </div>

            {/* 4 Touchpoints */}
            <div className="space-y-4">
              {/* Touchpoint 1 */}
              <div className="flex gap-4 p-5 rounded-xl border border-stone-200 bg-white/60 hover:border-stone-400 hover:shadow-xs hover:bg-white/80 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#F2ECE1] text-[#9E7D4B] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-medium text-stone-900">
                      {t.onboarding.step1Title}
                    </h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E7D4B] bg-[#9E7D4B]/10 px-2 py-0.5 rounded">
                      {lang === "en" ? "Cover" : "Bìa thư"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {t.onboarding.step1Desc}
                  </p>
                </div>
              </div>

              {/* Touchpoint 2 */}
              <div className="flex gap-4 p-5 rounded-xl border border-stone-200 bg-white/60 hover:border-stone-400 hover:shadow-xs hover:bg-white/80 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#F2ECE1] text-[#9E7D4B] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-medium text-stone-900">
                      {t.onboarding.step2Title}
                    </h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E7D4B] bg-[#9E7D4B]/10 px-2 py-0.5 rounded">
                      {lang === "en" ? "Choices" : "Lựa chọn"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {t.onboarding.step2Desc}
                  </p>
                </div>
              </div>

              {/* Touchpoint 3 */}
              <div className="flex gap-4 p-5 rounded-xl border border-stone-200 bg-white/60 hover:border-stone-400 hover:shadow-xs hover:bg-white/80 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#F2ECE1] text-[#9E7D4B] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Coffee className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-medium text-stone-900">
                      {t.onboarding.step3Title}
                    </h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E7D4B] bg-[#9E7D4B]/10 px-2 py-0.5 rounded">
                      {lang === "en" ? "Preferences" : "Khẩu vị & Gu"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {t.onboarding.step3Desc}
                  </p>
                </div>
              </div>

              {/* Touchpoint 4 */}
              <div className="flex gap-4 p-5 rounded-xl border border-stone-200 bg-white/60 hover:border-stone-400 hover:shadow-xs hover:bg-white/80 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#F2ECE1] text-[#9E7D4B] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Ticket className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-medium text-stone-900">
                      {t.onboarding.step4Title}
                    </h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E7D4B] bg-[#9E7D4B]/10 px-2 py-0.5 rounded">
                      {lang === "en" ? "Wax Pass" : "Vé hẹn & Sáp"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {t.onboarding.step4Desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Tips Box */}
            <div className="p-5 rounded-xl border border-[#9E7D4B]/30 bg-[#F2ECE1]/50 flex items-start gap-3.5">
              <Lightbulb className="w-5 h-5 text-[#9E7D4B] flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-serif text-base font-medium text-stone-900">
                  {t.onboarding.tipsTitle}
                </h4>
                <p className="text-xs text-stone-700 font-light leading-relaxed">
                  {t.onboarding.tipsDesc}
                </p>
              </div>
            </div>

            {/* Link to Software Tab */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab("software");
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                className="text-xs font-mono text-[#9E7D4B] hover:text-stone-900 hover:underline uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                <span>{lang === "en" ? "← Back to Software How-To Guide" : "← Xem lại hướng dẫn sử dụng phần mềm"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10 mt-10 border-t border-stone-200">
          <button
            onClick={handleFinishOnboarding}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-stone-900 text-[#F9F6F0] font-sans text-xs uppercase tracking-widest font-medium shadow-md hover:bg-stone-800 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{t.onboarding.ctaReady}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleFinishOnboarding}
            type="button"
            className="text-xs font-mono uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          >
            {t.onboarding.skip}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-stone-200 py-6 text-center text-xs font-mono text-stone-500 uppercase tracking-widest">
        <span>Curated with care · Editorial First-Date Experience</span>
      </footer>
    </div>
  );
}
