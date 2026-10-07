"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Palette,
  Users,
  Sliders,
  Ticket,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Eye,
  X,
  Globe,
  Lightbulb,
  Music,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  Loader2,
  Download,
  Wifi,
  LayoutGrid,
  Tags,
  AlignLeft,
  FileText,
  Calendar,
  Inbox,
  Disc3,
  Volume2,
  Play,
  Pause,
} from "lucide-react";
import { MainWizard } from "@/components/MainWizard";
import {
  InvitationConfig,
  defaultInvitationConfigVi,
  defaultInvitationConfigEn,
  QuestionBlock,
  QuestionOption,
  QuestionType,
  formatEventDate,
  getUpcomingDate,
  CURATED_TRACKS,
} from "@/lib/date-content";
import { THEME_PRESETS, ThemePreset } from "@/lib/theme-config";
import { encodeConfigToUrl } from "@/lib/config-encoder";
import { DICTIONARY, Language } from "@/lib/i18n";
import { soundEngine } from "@/lib/audio";
import { ArchiveDrawer } from "@/components/ArchiveDrawer";
import { saveInvitationRecord } from "@/lib/archive-storage";

function CustomizeContent() {
  const [lang, setLang] = useState<Language>("vi");
  const [config, setConfig] = useState<InvitationConfig>(defaultInvitationConfigVi);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"theme" | "couple" | "questions" | "ticket">("theme");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [invitationId, setInvitationId] = useState<string>("");
  const [lanIp, setLanIp] = useState<string | null>(null);
  const [shareMode, setShareMode] = useState<"wifi" | "local">("wifi");
  const [copied, setCopied] = useState(false);
  const [copiedWithMsg, setCopiedWithMsg] = useState(false);
  const [customMsg, setCustomMsg] = useState("");
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const tabBodyRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      soundEngine.stopMusic();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const checkTabsScroll = () => {
    const el = tabsContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  };

  useEffect(() => {
    checkTabsScroll();
    const handleResize = () => checkTabsScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [config.questions.length, lang]);

  // Non-blocking wheel handler: forwards vertical scrolling to the form body while preserving horizontal scroll
  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // If user is intentionally scrolling horizontally (trackpad swipe or shift key)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        el.scrollLeft += e.deltaX;
        checkTabsScroll();
        return;
      }

      // If user is scrolling vertically over the sticky tab header:
      // Forward vertical scroll to the form body below so scrolling down is never blocked!
      if (e.deltaY !== 0 && tabBodyRef.current) {
        tabBodyRef.current.scrollBy({ top: e.deltaY, behavior: "auto" });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleSlideLeft = () => {
    tabsContainerRef.current?.scrollBy({ left: -140, behavior: "smooth" });
    setTimeout(checkTabsScroll, 200);
  };

  const handleSlideRight = () => {
    tabsContainerRef.current?.scrollBy({ left: 140, behavior: "smooth" });
    setTimeout(checkTabsScroll, 200);
  };

  // Load language and draft on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("invitation_lang") as Language;
      const savedDraft = localStorage.getItem("invitation_builder_draft");

      queueMicrotask(() => {
        if (savedLang === "vi" || savedLang === "en") {
          setLang(savedLang);
          if (savedLang === "en") {
            setConfig(defaultInvitationConfigEn);
          }
        }

        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          setConfig((prev) => ({
            ...prev,
            ...parsed,
            cover: { ...prev.cover, ...(parsed.cover || {}) },
            questions: parsed.questions || prev.questions,
            stepTicket: { ...prev.stepTicket, ...(parsed.stepTicket || {}) },
          }));
        }
      });
    } catch {
      // Ignore
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    try {
      localStorage.setItem("invitation_builder_draft", JSON.stringify(config));
    } catch {
      // Ignore
    }
  }, [config]);

  const t = DICTIONARY[lang];

  // Direct, instant, non-blocking language switch (NO ALERTS, NO CONFIRM)
  const handleToggleLang = () => {
    const nextLang: Language = lang === "vi" ? "en" : "vi";
    setLang(nextLang);
    try {
      localStorage.setItem("invitation_lang", nextLang);
    } catch {
      // Ignore
    }

    setConfig((prev) => {
      const isDefaultVi =
        prev.cover.title === defaultInvitationConfigVi.cover.title &&
        prev.guestName === defaultInvitationConfigVi.guestName;
      const isDefaultEn =
        prev.cover.title === defaultInvitationConfigEn.cover.title &&
        prev.guestName === defaultInvitationConfigEn.guestName;

      if (nextLang === "en" && isDefaultVi) {
        return {
          ...defaultInvitationConfigEn,
          themeId: prev.themeId,
          customPalette: prev.customPalette,
          backgroundImage: prev.backgroundImage,
          backgroundOverlayOpacity: prev.backgroundOverlayOpacity,
          eventDate: prev.eventDate,
          music: prev.music,
        };
      } else if (nextLang === "vi" && isDefaultEn) {
        return {
          ...defaultInvitationConfigVi,
          themeId: prev.themeId,
          customPalette: prev.customPalette,
          backgroundImage: prev.backgroundImage,
          backgroundOverlayOpacity: prev.backgroundOverlayOpacity,
          eventDate: prev.eventDate,
          music: prev.music,
        };
      }
      return { ...prev, language: nextLang };
    });
  };

  const handleToggleMusic = () => {
    // If current selected track has a custom stream/file URL
    if (config.music?.url) {
      if (isMusicPlaying) {
        if (previewAudioRef.current) {
          previewAudioRef.current.pause();
        }
        setIsMusicPlaying(false);
      } else {
        soundEngine.stopMusic();
        soundEngine.playNeedleDropSound();
        if (!previewAudioRef.current) {
          previewAudioRef.current = new Audio(config.music.url);
          previewAudioRef.current.loop = true;
        } else {
          previewAudioRef.current.src = config.music.url;
        }
        previewAudioRef.current.play().catch(() => {});
        setIsMusicPlaying(true);
      }
    } else {
      // Offline Lo-Fi synthesizer engine
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const active = soundEngine.toggleMusic();
      setIsMusicPlaying(active);
    }
  };

  const handleTogglePreviewTrack = (trackId: string, trackUrl?: string) => {
    // If clicking the active preview track, pause it
    if (previewingTrackId === trackId) {
      if (trackId === "lofi-rhodes") {
        soundEngine.stopMusic();
        setIsMusicPlaying(false);
      } else if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewingTrackId(null);
      return;
    }

    // Stop currently running previews
    if (previewingTrackId === "lofi-rhodes" || isMusicPlaying) {
      soundEngine.stopMusic();
      setIsMusicPlaying(false);
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    // Needle drop vinyl sound effect
    soundEngine.playNeedleDropSound();

    // Play target track
    if (trackId === "lofi-rhodes") {
      soundEngine.startMusic();
      setIsMusicPlaying(true);
      setPreviewingTrackId("lofi-rhodes");
    } else if (trackUrl) {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(trackUrl);
      } else {
        previewAudioRef.current.src = trackUrl;
      }
      previewAudioRef.current.onended = () => {
        setPreviewingTrackId(null);
      };
      previewAudioRef.current.play().catch(() => {});
      setPreviewingTrackId(trackId);
    }
  };

  const handleSelectCuratedTrack = (track: (typeof CURATED_TRACKS)[number]) => {
    soundEngine.playClick();
    setConfig((p) => ({
      ...p,
      music: {
        trackId: track.id,
        title: track.title[lang],
        artist: track.artist,
        url: track.url,
      },
    }));
  };

  const handleSelectCustomTrack = () => {
    soundEngine.playClick();
    setConfig((p) => ({
      ...p,
      music: {
        trackId: "custom",
        title:
          p.music?.trackId === "custom" && p.music.title
            ? p.music.title
            : lang === "vi"
            ? "Bài Hát Kỷ Niệm"
            : "Our Song",
        artist:
          p.music?.trackId === "custom" && p.music.artist
            ? p.music.artist
            : p.senderName || (lang === "vi" ? "Dành riêng cho bạn" : "Just for you"),
        url: p.music?.trackId === "custom" ? p.music.url : "",
      },
    }));
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAudio =
      file.type.startsWith("audio/") ||
      /\.(mp3|wav|m4a|ogg|aac|webm)$/i.test(file.name);

    if (!isAudio) {
      showToast(
        lang === "vi"
          ? "Vui lòng chọn file âm thanh (.mp3, .m4a, .wav)"
          : "Please select an audio file (.mp3, .m4a, .wav)"
      );
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast(
        lang === "vi"
          ? "Dung lượng bài hát tối đa 15MB"
          : "Audio file exceeds 15MB limit"
      );
      return;
    }

    setIsUploadingAudio(true);
    showToast(t.studio.musicCustomUploading);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setConfig((prev) => ({
          ...prev,
          music: {
            trackId: "custom",
            title: cleanName || (lang === "vi" ? "Bài Hát Của Chúng Ta" : "Our Song"),
            artist:
              prev.senderName || (lang === "vi" ? "Dành riêng cho bạn" : "Just for you"),
            url: data.url,
          },
        }));
        soundEngine.playChime();
        showToast(
          lang === "vi"
            ? "Đã tải bài hát lên đĩa than thành công!"
            : "Audio track uploaded successfully!"
        );
      } else {
        showToast(data.error || (lang === "vi" ? "Tải bài hát thất bại" : "Upload failed"));
      }
    } catch (err) {
      console.error("Audio upload error:", err);
      showToast(
        lang === "vi"
          ? "Lỗi kết nối khi tải bài hát"
          : "Network error uploading audio"
      );
    } finally {
      setIsUploadingAudio(false);
      if (audioFileInputRef.current) {
        audioFileInputRef.current.value = "";
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(t.studio.bgUploadError);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast(t.studio.bgUploadError);
      return;
    }

    setIsUploadingBg(true);
    showToast(t.studio.bgUploading);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setConfig((prev) => ({
          ...prev,
          backgroundImage: data.url,
          backgroundOverlayOpacity: prev.backgroundOverlayOpacity || 0.35,
        }));
        soundEngine.playChime();
        showToast(t.studio.bgUploadSuccess);
      } else {
        showToast(t.studio.bgUploadError);
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast(t.studio.bgUploadError);
    } finally {
      setIsUploadingBg(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  // Helper to build URL based on ID, short/legacy mode, and wifi/local target
  const buildShareUrl = (
    idOrEncoded: string,
    isShortId: boolean,
    targetMode: "wifi" | "local",
    overrideLanIp?: string | null
  ) => {
    if (typeof window === "undefined") return "";
    const isLocal =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const port = window.location.port ? `:${window.location.port}` : "";
    const activeIp = overrideLanIp !== undefined ? overrideLanIp : lanIp;

    let base = window.location.origin;
    if (isLocal && targetMode === "wifi" && activeIp) {
      base = `http://${activeIp}${port}`;
    }

    if (isShortId) {
      return `${base}/invite?id=${idOrEncoded}`;
    } else {
      return `${base}/invite?c=${idOrEncoded}`;
    }
  };

  const updateQrCodeForUrl = async (url: string) => {
    try {
      const qr = await QRCode.toDataURL(url, {
        margin: 3,
        width: 360,
        errorCorrectionLevel: "M",
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qr);
    } catch {
      setQrCodeUrl("");
    }
  };

  // Generate shareable link
  const handleOpenShareModal = async () => {
    setIsGeneratingShare(true);

    let generatedId = "";
    let detectedLanIp: string | null = null;

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.id) {
        generatedId = data.id;
        detectedLanIp = data.lanIp || null;
        setInvitationId(generatedId);
        setLanIp(detectedLanIp);
      }
    } catch {
      // Gracefully fall back to URL compression if database is unreachable
    }

    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    const defaultMode: "wifi" | "local" = isLocalhost && detectedLanIp ? "wifi" : "local";
    setShareMode(defaultMode);

    let url = "";
    if (generatedId) {
      url = buildShareUrl(generatedId, true, defaultMode, detectedLanIp);
    } else {
      const encoded = encodeConfigToUrl(config);
      url = buildShareUrl(encoded, false, defaultMode, detectedLanIp);
    }

    setShareUrl(url);
    await updateQrCodeForUrl(url);

    // Save to sender's archive drawer
    if (generatedId) {
      saveInvitationRecord({
        id: generatedId,
        guestName: config.guestName,
        senderName: config.senderName,
        eventDate: config.eventDate,
        shareUrl: url,
        createdAt: new Date().toISOString(),
      });
    }

    setIsGeneratingShare(false);
    setIsShareModalOpen(true);
  };

  const handleSwitchShareMode = async (mode: "wifi" | "local") => {
    setShareMode(mode);
    let newUrl = "";
    if (invitationId) {
      newUrl = buildShareUrl(invitationId, true, mode);
    } else {
      const encoded = encodeConfigToUrl(config);
      newUrl = buildShareUrl(encoded, false, mode);
    }
    setShareUrl(newUrl);
    await updateQrCodeForUrl(newUrl);
  };

  const handleDownloadQr = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeUrl;
    a.download = `thiep-moi-qr-${invitationId || "invite"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(lang === "vi" ? "Đã tải mã QR về máy!" : "QR code downloaded!");
  };

  const handleCopyLinkOnly = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyLinkWithMessage = () => {
    const msg = customMsg.trim() ? `${customMsg.trim()}\n\n${shareUrl}` : `${t.studio.messagePlaceholder}\n\n${shareUrl}`;
    navigator.clipboard.writeText(msg);
    setCopiedWithMsg(true);
    setTimeout(() => setCopiedWithMsg(false), 3000);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3500);
      return;
    }
    setConfig(lang === "en" ? defaultInvitationConfigEn : defaultInvitationConfigVi);
    localStorage.removeItem("invitation_builder_draft");
    setConfirmReset(false);
    showToast(t.studio.resetSuccessToast);
  };

  // --- Dynamic Question Handlers ---
  const handleAddQuestion = (type: QuestionType) => {
    const id = `q-${Date.now()}`;
    let newQ: QuestionBlock;

    if (type === "course_card") {
      newQ = {
        id,
        type: "course_card",
        title: lang === "vi" ? "Lựa chọn cho buổi hẹn" : "New Date Choice",
        subtitle: lang === "vi" ? "Gợi ý những phương án đặc biệt cho đối phương..." : "Helpful subtitle for your date...",
        options: [
          {
            id: "opt-1",
            title: lang === "vi" ? "Lựa chọn 1" : "Option 1",
            subtitle: lang === "vi" ? "Chi tiết lựa chọn" : "Option detail",
            badge: lang === "vi" ? "Gợi ý 01" : "Option 01",
          },
          {
            id: "opt-2",
            title: lang === "vi" ? "Lựa chọn 2" : "Option 2",
            subtitle: lang === "vi" ? "Chi tiết lựa chọn" : "Option detail",
            badge: lang === "vi" ? "Gợi ý 02" : "Option 02",
          },
        ],
      };
    } else if (type === "tag_pills") {
      newQ = {
        id,
        type: "tag_pills",
        title: lang === "vi" ? "Sở thích & Gu của người ấy" : "Preferences & Tastes",
        subtitle: lang === "vi" ? "Chọn những điều làm người ấy thấy hứng thú" : "Select all you like",
        options: [
          { id: "p-1", title: lang === "vi" ? "Sở thích 1" : "Item 1" },
          { id: "p-2", title: lang === "vi" ? "Sở thích 2" : "Item 2" },
          { id: "p-3", title: lang === "vi" ? "Sở thích 3" : "Item 3" },
        ],
      };
    } else if (type === "short_text") {
      newQ = {
        id,
        type: "short_text",
        title: lang === "vi" ? "Câu hỏi ngắn một dòng" : "Single Line Question",
        subtitle: lang === "vi" ? "Mô tả ngắn gọn điều bạn muốn hỏi..." : "Brief prompt for your question...",
        placeholder: lang === "vi" ? "Ví dụ: Điều bạn muốn chia sẻ..." : "e.g., your answer...",
      };
    } else {
      newQ = {
        id,
        type: "long_text",
        title: lang === "vi" ? "Lời nhắn thư tay nhiều dòng" : "Letter Note Question",
        subtitle: lang === "vi" ? "Một không gian riêng để đối phương tâm tình..." : "A warm space to share more...",
        placeholder: lang === "vi" ? "Viết vài dòng vào đây..." : "Write a few lines here...",
      };
    }

    setConfig((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
  };

  const handleRemoveQuestion = (id: string) => {
    if (config.questions.length <= 1) {
      showToast(t.studio.minQuestionToast);
      return;
    }
    setConfig((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= config.questions.length) return;
    const list = [...config.questions];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;
    setConfig((p) => ({ ...p, questions: list }));
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-stone-900 flex flex-col font-sans">
      {/* Studio Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 border-b border-stone-200 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() => soundEngine.playPaperBack()}
            title={lang === "en" ? "Return to Home" : "Về Trang chủ"}
            className="w-8 h-8 rounded-full bg-stone-900 text-[#F9F6F0] flex items-center justify-center font-serif italic text-base hover:bg-stone-700 transition-colors cursor-pointer"
          >
            ✦
          </Link>
          <div>
            <h1 className="font-serif italic font-medium text-lg text-stone-900 leading-tight">
              {t.studio.title}
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
              {t.studio.subtitle}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Music Control embedded in Header (No overlap with buttons!) */}
          <button
            onClick={handleToggleMusic}
            type="button"
            className={`p-2 rounded-full border transition-all ${
              isMusicPlaying
                ? "bg-[#9E7D4B] text-white border-[#9E7D4B] shadow-xs"
                : "bg-white/80 border-stone-300 text-stone-700 hover:border-stone-800"
            }`}
            title={isMusicPlaying ? t.common.musicOff : t.common.musicOn}
          >
            <Music className={`w-3.5 h-3.5 ${isMusicPlaying ? "animate-pulse" : ""}`} />
          </button>

          {/* Lang Toggle */}
          <button
            onClick={handleToggleLang}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-stone-300 text-xs font-mono uppercase text-stone-700 hover:border-stone-800 bg-white/80"
          >
            <Globe className="w-3 h-3 text-[#9E7D4B]" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            type="button"
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider transition-all ${
              confirmReset
                ? "bg-rose-50 border-rose-400 text-rose-700 font-bold shadow-xs ring-2 ring-rose-200"
                : "border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-800 bg-white/80"
            }`}
          >
            <RotateCcw className={`w-3 h-3 ${confirmReset ? "text-rose-600 rotate-180 transition-transform" : ""}`} />
            <span>{confirmReset ? t.studio.resetConfirm : t.common.reset}</span>
          </button>

          {/* Archive Drawer Trigger */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsArchiveOpen(true);
            }}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 text-xs font-mono uppercase tracking-wider text-stone-700 hover:text-stone-900 hover:border-stone-800 bg-white/80 transition-all cursor-pointer shadow-2xs"
            title={lang === "vi" ? "Hộp thư thiệp đã lưu & phản hồi" : "Saved invitations & responses"}
          >
            <Inbox className="w-3.5 h-3.5 text-[#9E7D4B]" />
            <span className="hidden sm:inline">
              {lang === "vi" ? "Hộp Thư" : "Archive"}
            </span>
          </button>

          {/* Primary Share CTA */}
          <button
            onClick={handleOpenShareModal}
            disabled={isGeneratingShare}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 text-[#F9F6F0] text-xs font-sans uppercase tracking-widest font-medium hover:bg-stone-800 transition-all active:scale-[0.98] shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isGeneratingShare ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9E7D4B]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#9E7D4B]" />
            )}
            <span>
              {isGeneratingShare
                ? (lang === "vi" ? "ĐANG TẠO LINK..." : "CREATING...")
                : t.studio.btnGetLink(config.guestName)}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Switcher (Editor vs Preview) */}
      <div className="lg:hidden flex border-b border-stone-300 bg-[#FAF8F5]">
        <button
          onClick={() => setMobileView("editor")}
          type="button"
          className={`flex-1 py-2.5 text-center text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
            mobileView === "editor"
              ? "border-stone-900 text-stone-900 font-bold"
              : "border-transparent text-stone-500"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{t.common.edit}</span>
        </button>
        <button
          onClick={() => setMobileView("preview")}
          type="button"
          className={`flex-1 py-2.5 text-center text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
            mobileView === "preview"
              ? "border-stone-900 text-stone-900 font-bold"
              : "border-transparent text-stone-500"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t.common.preview}</span>
        </button>
      </div>

      {/* Studio Workspace */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full p-4 lg:p-8 gap-8">
        {/* LEFT COLUMN: Controls & Question Editor */}
        <div
          className={`flex-1 flex flex-col bg-[#FAF8F5] border border-stone-300 rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-100px)] min-h-[620px] ${
            mobileView === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* PERMANENT PINNED TAB HEADER (NEVER SCROLLS AWAY) */}
          <div className="p-3 sm:px-6 sm:pt-5 pb-3 border-b border-stone-200 bg-[#FAF8F5] flex-shrink-0 z-10">
            <div className="relative flex items-center w-full">
              {/* Left Slide Button & Gradient Mask */}
              {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-3 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent">
                  <button
                    type="button"
                    onClick={handleSlideLeft}
                    className="w-7 h-7 rounded-full bg-white border border-stone-300 shadow-md flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
                    title={t.studio.slideLeft}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Scrollable / Slidable Tabs Strip with Wheel Support */}
              <div
                ref={tabsContainerRef}
                onScroll={checkTabsScroll}
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-1 py-0.5 w-full select-none"
              >
                {[
                  { id: "theme", label: t.studio.tabTheme, icon: Palette },
                  { id: "couple", label: t.studio.tabCouple, icon: Users },
                  { id: "questions", label: `${t.studio.tabQuestions} (${config.questions.length})`, icon: Sliders },
                  { id: "ticket", label: t.studio.tabTicket, icon: Ticket },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={(e) => {
                        setActiveTab(tab.id as typeof activeTab);
                        e.currentTarget.scrollIntoView({
                          behavior: "smooth",
                          inline: "center",
                          block: "nearest",
                        });
                        tabBodyRef.current?.scrollTo({ top: 0, behavior: "instant" });
                      }}
                      type="button"
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
                        isActive
                          ? "bg-stone-900 text-[#F9F6F0] font-medium shadow-sm"
                          : "text-stone-600 hover:bg-stone-200/60"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Slide Button & Gradient Mask */}
              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-3 bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent">
                  <button
                    type="button"
                    onClick={handleSlideRight}
                    className="w-7 h-7 rounded-full bg-white border border-stone-300 shadow-md flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
                    title={t.studio.slideRight}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SCROLLABLE FORM BODY */}
          <div ref={tabBodyRef} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">

          {/* TAB 1: THEME */}
          {activeTab === "theme" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif italic text-2xl text-stone-900">
                  {t.studio.themeTitle}
                </h2>
                <p className="text-xs text-stone-500 font-light mt-1">
                  {t.studio.themeSubtitle}
                </p>
              </div>

              {/* Mode Switch: Presets vs Custom Palette */}
              <div className="flex rounded-lg border border-stone-300 p-1 bg-stone-100/80 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (config.themeId === "custom") {
                      setConfig((p) => ({ ...p, themeId: "alabaster" }));
                    }
                  }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all ${
                    config.themeId !== "custom"
                      ? "bg-white text-stone-900 font-bold shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {t.studio.modePresets}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const defaultPalette = THEME_PRESETS[0].palette;
                    setConfig((p) => ({
                      ...p,
                      themeId: "custom",
                      customPalette: p.customPalette || { ...defaultPalette },
                    }));
                  }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all ${
                    config.themeId === "custom"
                      ? "bg-white text-stone-900 font-bold shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {t.studio.modeCustom}
                </button>
              </div>

              {/* PRESETS GRID */}
              {config.themeId !== "custom" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {THEME_PRESETS.map((theme: ThemePreset) => {
                    const isSelected = config.themeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, themeId: theme.id }))}
                        className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "border-stone-900 ring-2 ring-stone-900/10 shadow-sm"
                            : "border-stone-300 hover:border-stone-400"
                        }`}
                        style={{ backgroundColor: theme.palette.cardBg }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            style={{ color: theme.palette.charcoal }}
                            className="font-serif italic font-medium text-base"
                          >
                            {t.studio.themeNames[theme.id] || theme.name}
                          </span>
                          {isSelected && (
                            <span
                              style={{
                                backgroundColor: theme.palette.charcoal,
                                color: theme.palette.cardBg,
                              }}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                            >
                              ✓
                            </span>
                          )}
                        </div>

                        <p
                          style={{ color: theme.palette.taupe }}
                          className="text-xs mb-4 line-clamp-1"
                        >
                          {t.studio.themeSubtitles[theme.id] || theme.subtitle}
                        </p>

                        <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                          <span
                            title={t.studio.colorCanvas}
                            style={{ backgroundColor: theme.palette.canvas }}
                            className="w-5 h-5 rounded-full border border-stone-300"
                          />
                          <span
                            title={t.studio.colorCharcoal}
                            style={{ backgroundColor: theme.palette.charcoal }}
                            className="w-5 h-5 rounded-full border border-stone-300"
                          />
                          <span
                            title={t.studio.colorGold}
                            style={{ backgroundColor: theme.palette.gold }}
                            className="w-5 h-5 rounded-full border border-stone-300"
                          />
                          <span
                            title={t.studio.colorWax}
                            style={{ backgroundColor: theme.palette.wax }}
                            className="w-5 h-5 rounded-full border border-stone-300"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* CUSTOM PALETTE COLOR PICKER SECTION */
                <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs font-mono uppercase text-stone-700 font-semibold">
                      {t.studio.customPaletteTitle}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((p) => ({
                          ...p,
                          customPalette: { ...THEME_PRESETS[0].palette },
                        }))
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-stone-300 bg-white text-[10px] font-mono uppercase text-stone-700 hover:border-stone-800 hover:bg-stone-50 transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-2.5 h-2.5 text-[#9E7D4B]" />
                      <span>{t.studio.resetColors}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Canvas Color */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono uppercase text-stone-600">
                        {t.studio.colorCanvas}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customPalette?.canvas || "#F9F6F0"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              customPalette: {
                                ...(p.customPalette || THEME_PRESETS[0].palette),
                                canvas: val,
                              },
                            }));
                          }}
                          className="w-8 h-8 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={config.customPalette?.canvas || "#F9F6F0"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              customPalette: {
                                ...(p.customPalette || THEME_PRESETS[0].palette),
                                canvas: val,
                              },
                            }));
                          }}
                          className="flex-1 bg-white border border-stone-300 rounded px-2.5 py-1.5 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    {/* CardBg Color */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono uppercase text-stone-600">
                        {t.studio.colorCardBg}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customPalette?.cardBg || "#FAF8F5"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              customPalette: {
                                ...(p.customPalette || THEME_PRESETS[0].palette),
                                cardBg: val,
                              },
                            }));
                          }}
                          className="w-8 h-8 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={config.customPalette?.cardBg || "#FAF8F5"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              customPalette: {
                                ...(p.customPalette || THEME_PRESETS[0].palette),
                                cardBg: val,
                              },
                            }));
                          }}
                          className="flex-1 bg-white border border-stone-300 rounded px-2.5 py-1.5 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    {/* Charcoal / Text Color */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono uppercase text-stone-600">
                        {t.studio.colorCharcoal}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customPalette?.charcoal || "#1C1917"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              customPalette: {
                                ...(p.customPalette || THEME_PRESETS[0].palette),
                                charcoal: val,
                              },
                            }));
                          }}
                          className="w-8 h-8 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={config.customPalette?.charcoal || "#1C1917"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              customPalette: {
                                ...(p.customPalette || THEME_PRESETS[0].palette),
                                charcoal: val,
                              },
                            }));
                          }}
                          className="flex-1 bg-white border border-stone-300 rounded px-2.5 py-1.5 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    {/* Gold Accent Color */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono uppercase text-stone-600">
                        {t.studio.colorGold}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customPalette?.gold || "#9E7D4B"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              customPalette: {
                                ...(p.customPalette || THEME_PRESETS[0].palette),
                                gold: val,
                              },
                            }));
                          }}
                          className="w-8 h-8 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={config.customPalette?.gold || "#9E7D4B"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              customPalette: {
                                ...(p.customPalette || THEME_PRESETS[0].palette),
                                gold: val,
                              },
                            }));
                          }}
                          className="flex-1 bg-white border border-stone-300 rounded px-2.5 py-1.5 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    {/* Wax Seal Color */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[11px] font-mono uppercase text-stone-600">
                        {t.studio.colorWax}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customPalette?.wax || "#7A2021"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              customPalette: {
                                ...(p.customPalette || THEME_PRESETS[0].palette),
                                wax: val,
                              },
                            }));
                          }}
                          className="w-8 h-8 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={config.customPalette?.wax || "#7A2021"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              customPalette: {
                                ...(p.customPalette || THEME_PRESETS[0].palette),
                                wax: val,
                              },
                            }));
                          }}
                          className="flex-1 bg-white border border-stone-300 rounded px-2.5 py-1.5 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BACKGROUND IMAGE CONFIGURATION */}
              <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200 space-y-3.5">
                <div>
                  <h3 className="font-serif italic text-lg font-medium text-stone-900">
                    {t.studio.bgImageTitle}
                  </h3>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    {t.studio.bgImageSubtitle}
                  </p>
                </div>

                {/* Device Upload Trigger & Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={isUploadingBg}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-800 bg-stone-900 text-[#F9F6F0] text-xs font-mono uppercase tracking-wider hover:bg-stone-800 active:scale-98 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isUploadingBg ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#9E7D4B]" />
                        <span>{t.studio.bgUploading}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#9E7D4B]" />
                        <span>{t.studio.bgUploadBtn}</span>
                      </>
                    )}
                  </button>

                  {config.backgroundImage && (
                    <button
                      type="button"
                      onClick={() => setConfig((p) => ({ ...p, backgroundImage: "" }))}
                      className="px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-600 hover:text-rose-600 hover:border-rose-300 text-xs font-mono uppercase tracking-wider transition-colors"
                    >
                      {t.studio.bgRemoveBtn}
                    </button>
                  )}
                </div>

                {/* Active Image Thumbnail Preview */}
                {config.backgroundImage && (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={config.backgroundImage}
                      alt="Ảnh nền đang dùng"
                      className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-semibold block">
                        ✓ Đang áp dụng ảnh nền
                      </span>
                      <p className="text-xs text-stone-500 truncate font-mono">
                        {config.backgroundImage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Or Paste Direct Link */}
                <div className="space-y-1.5 pt-1 border-t border-stone-200">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.bgOrUrl}
                  </label>
                  <input
                    type="text"
                    value={config.backgroundImage || ""}
                    onChange={(e) => setConfig((p) => ({ ...p, backgroundImage: e.target.value }))}
                    placeholder={t.studio.bgImagePlaceholder}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none"
                  />
                </div>

                {/* Quick suggestions */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-stone-500 block">
                    {t.studio.bgSamplesLabel}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig((p) => ({ ...p, backgroundImage: "" }))}
                      className="px-2.5 py-1 rounded-full border border-stone-300 bg-white text-[11px] text-stone-700 hover:border-stone-800"
                    >
                      {t.studio.bgNone}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((p) => ({
                          ...p,
                          backgroundImage:
                            "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=1000&auto=format&fit=crop&q=80",
                        }))
                      }
                      className="px-2.5 py-1 rounded-full border border-stone-300 bg-white text-[11px] text-stone-700 hover:border-stone-800"
                    >
                      {t.studio.bgPaper}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((p) => ({
                          ...p,
                          backgroundImage:
                            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80",
                        }))
                      }
                      className="px-2.5 py-1 rounded-full border border-stone-300 bg-white text-[11px] text-stone-700 hover:border-stone-800"
                    >
                      {t.studio.bgCafe}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((p) => ({
                          ...p,
                          backgroundImage:
                            "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1000&auto=format&fit=crop&q=80",
                        }))
                      }
                      className="px-2.5 py-1 rounded-full border border-stone-300 bg-white text-[11px] text-stone-700 hover:border-stone-800"
                    >
                      {t.studio.bgCandle}
                    </button>
                  </div>
                </div>

                {/* Opacity Overlay Slider */}
                {config.backgroundImage && (
                  <div className="space-y-1.5 pt-2 border-t border-stone-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono uppercase text-stone-600">
                        {t.studio.bgOverlayLabel}
                      </span>
                      <span className="font-mono text-stone-900 font-bold">
                        {Math.round((config.backgroundOverlayOpacity ?? 0.35) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={config.backgroundOverlayOpacity ?? 0.35}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          backgroundOverlayOpacity: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-stone-900 cursor-pointer"
                    />
                    <p className="text-[10px] text-stone-500">
                      {t.studio.bgOverlayHint}
                    </p>
                  </div>
                )}
              </div>

              {/* VINTAGE VINYL BACKGROUND MUSIC CONFIGURATION */}
              <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200 space-y-4">
                <div>
                  <h3 className="font-serif italic text-lg font-medium text-stone-900 flex items-center gap-2">
                    <Disc3 className="w-4.5 h-4.5 text-[#9E7D4B] animate-[spin_6s_linear_infinite]" />
                    <span>{t.studio.musicTitle}</span>
                  </h3>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    {t.studio.musicSubtitle}
                  </p>
                </div>

                {/* Hidden Audio File Input */}
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/x-m4a,audio/m4a,audio/ogg"
                  onChange={handleAudioUpload}
                  className="hidden"
                />

                {/* Track Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CURATED_TRACKS.map((track) => {
                    const isSelected =
                      (config.music?.trackId || "lofi-rhodes") === track.id;
                    const isPreviewing = previewingTrackId === track.id;

                    return (
                      <div
                        key={track.id}
                        onClick={() => handleSelectCuratedTrack(track)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-white border-stone-900 ring-2 ring-stone-900/10 shadow-xs"
                            : "bg-white/60 border-stone-300 hover:border-stone-400 hover:bg-white"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-serif italic font-medium text-sm text-stone-900">
                              {track.title[lang]}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center text-[9px]">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono uppercase text-[#9E7D4B] tracking-wider">
                            {track.artist}
                          </p>
                          <p className="text-[11px] text-stone-600 font-light leading-relaxed">
                            {track.desc[lang]}
                          </p>
                        </div>

                        <div className="pt-2.5 mt-2 border-t border-stone-200/80 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-stone-500">
                            {track.id === "lofi-rhodes"
                              ? (lang === "vi" ? "✦ Thu âm analog" : "✦ Analog Rhodes")
                              : (lang === "vi" ? "✦ Giai điệu tuyển chọn" : "✦ Curated Track")}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePreviewTrack(track.id, track.url);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                              isPreviewing
                                ? "bg-[#9E7D4B] text-white shadow-xs font-semibold"
                                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                            }`}
                          >
                            {isPreviewing ? (
                              <>
                                <Pause className="w-2.5 h-2.5 fill-current" />
                                <span>{t.studio.musicTestStop}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                <span>{t.studio.musicTestPlay}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* 4th Option: Custom Track Card */}
                  {(() => {
                    const isSelected = config.music?.trackId === "custom";
                    const isPreviewing = previewingTrackId === "custom";

                    return (
                      <div
                        onClick={handleSelectCustomTrack}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-white border-stone-900 ring-2 ring-stone-900/10 shadow-xs"
                            : "bg-white/60 border-stone-300 hover:border-stone-400 hover:bg-white"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-serif italic font-medium text-sm text-stone-900">
                              {t.studio.musicCustomOption}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center text-[9px]">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono uppercase text-[#9E7D4B] tracking-wider">
                            {config.music?.trackId === "custom" && config.music.artist
                              ? config.music.artist
                              : (lang === "vi" ? "Tự chọn nhạc riêng" : "Custom Choice")}
                          </p>
                          <p className="text-[11px] text-stone-600 font-light leading-relaxed">
                            {lang === "vi"
                              ? "Tải lên file MP3 bài hát kỷ niệm hoặc dán link nhạc riêng của hai bạn."
                              : "Upload an MP3 of your favorite song or paste a direct audio link."}
                          </p>
                        </div>

                        <div className="pt-2.5 mt-2 border-t border-stone-200/80 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-stone-500">
                            {config.music?.trackId === "custom" && config.music.url
                              ? (lang === "vi" ? "✓ Đã có nhạc riêng" : "✓ Audio linked")
                              : (lang === "vi" ? "✦ Chưa tải nhạc" : "✦ No audio yet")}
                          </span>
                          {config.music?.trackId === "custom" && config.music.url && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePreviewTrack("custom", config.music?.url);
                              }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                                isPreviewing
                                  ? "bg-[#9E7D4B] text-white shadow-xs font-semibold"
                                  : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                              }`}
                            >
                              {isPreviewing ? (
                                <>
                                  <Pause className="w-2.5 h-2.5 fill-current" />
                                  <span>{t.studio.musicTestStop}</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                  <span>{t.studio.musicTestPlay}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Sub-panel for Custom Song Details when 'custom' is active */}
                {config.music?.trackId === "custom" && (
                  <div className="p-3.5 rounded-xl bg-white border border-stone-300 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        disabled={isUploadingAudio}
                        onClick={() => audioFileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-800 bg-stone-900 text-[#F9F6F0] text-xs font-mono uppercase tracking-wider hover:bg-stone-800 active:scale-98 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {isUploadingAudio ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9E7D4B]" />
                            <span>{t.studio.musicCustomUploading}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-[#9E7D4B]" />
                            <span>{t.studio.musicCustomUploadBtn}</span>
                          </>
                        )}
                      </button>

                      {config.music.url && (
                        <button
                          type="button"
                          onClick={() => {
                            if (previewingTrackId === "custom") {
                              previewAudioRef.current?.pause();
                              setPreviewingTrackId(null);
                            }
                            setConfig((p) => ({
                              ...p,
                              music: {
                                trackId: "lofi-rhodes",
                                title: "Vintage Lo-Fi Rhodes",
                                artist: "Cuộc Hẹn Nhỏ Sessions",
                              },
                            }));
                          }}
                          className="px-3 py-2 rounded-xl border border-stone-300 text-stone-600 hover:text-rose-600 hover:border-rose-300 text-xs font-mono uppercase tracking-wider transition-colors"
                        >
                          {lang === "vi" ? "Gỡ bài hát" : "Remove"}
                        </button>
                      )}
                    </div>

                    {/* Active Custom Audio Badge */}
                    {config.music.url && (
                      <div className="flex items-center gap-2.5 p-2 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                        <Volume2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-semibold block">
                            {lang === "vi" ? "✓ Đã tải bài hát lên đĩa than" : "✓ Custom track loaded"}
                          </span>
                          <p className="text-[11px] text-stone-600 truncate font-mono">
                            {config.music.url}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Custom Song Title & Artist Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase text-stone-600">
                          {t.studio.musicCustomTitlePrompt}
                        </label>
                        <input
                          type="text"
                          value={config.music.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              music: {
                                ...(p.music || { trackId: "custom" }),
                                trackId: "custom",
                                title: val,
                              },
                            }));
                          }}
                          placeholder={lang === "vi" ? "Ví dụ: Bài ca kỷ niệm..." : "e.g., Our Song..."}
                          className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase text-stone-600">
                          {t.studio.musicCustomArtistPrompt}
                        </label>
                        <input
                          type="text"
                          value={config.music.artist || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              music: {
                                ...(p.music || { trackId: "custom", title: "Custom Track" }),
                                trackId: "custom",
                                artist: val,
                              },
                            }));
                          }}
                          placeholder={lang === "vi" ? "Ví dụ: Vũ, Lê Cát Trọng Lý, hoặc Bạn..." : "e.g., Artist or you..."}
                          className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Or Direct MP3 URL Input */}
                    <div className="space-y-1 pt-1 border-t border-stone-200">
                      <label className="block text-[10px] font-mono uppercase text-stone-600">
                        {t.studio.musicCustomUrlPlaceholder}
                      </label>
                      <input
                        type="url"
                        value={config.music.url || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfig((p) => ({
                            ...p,
                            music: {
                              ...(p.music || { trackId: "custom", title: "Custom Track" }),
                              trackId: "custom",
                              url: val,
                            },
                          }));
                        }}
                        placeholder="https://example.com/audio.mp3"
                        className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COUPLE & COVER */}
          {activeTab === "couple" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif italic text-2xl text-stone-900">
                  {t.studio.coupleTitle}
                </h2>
                <p className="text-xs text-stone-500 font-light mt-1">
                  {t.studio.coupleSubtitle}
                </p>
              </div>

              {/* Names input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.recipientLabel}
                  </label>
                  <input
                    type="text"
                    value={config.guestName}
                    onChange={(e) => setConfig((p) => ({ ...p, guestName: e.target.value }))}
                    placeholder={t.studio.recipientPlaceholder}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.senderLabel}
                  </label>
                  <input
                    type="text"
                    value={config.senderName}
                    onChange={(e) => setConfig((p) => ({ ...p, senderName: e.target.value }))}
                    placeholder={t.studio.senderPlaceholder}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {/* DATE PICKER & CALENDAR SECTION */}
              <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#9E7D4B]" />
                    <label className="text-xs font-mono uppercase text-stone-800 font-semibold tracking-wider">
                      {t.studio.dateTitle}
                    </label>
                  </div>
                  {config.eventDate && (
                    <button
                      type="button"
                      onClick={() => setConfig((p) => ({ ...p, eventDate: undefined }))}
                      className="text-[10.5px] font-mono uppercase tracking-wider text-rose-600 hover:underline cursor-pointer"
                    >
                      {t.studio.dateClear}
                    </button>
                  )}
                </div>
                <p className="text-xs text-stone-500 font-light -mt-1">
                  {t.studio.dateSubtitle}
                </p>

                {/* Date Input Field & Preview */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="date"
                    value={config.eventDate || ""}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, eventDate: e.target.value || undefined }))
                    }
                    className="w-full sm:w-60 bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900 font-mono shadow-2xs"
                  />

                  {/* Preview Badge */}
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-600 bg-white/80 border border-stone-200/80 px-3 py-2 rounded-lg flex-1">
                    <span className="text-[10px] uppercase text-stone-400">
                      {t.studio.datePreviewLabel}
                    </span>
                    <span className="font-serif italic text-stone-800 font-medium truncate">
                      {formatEventDate(config.eventDate, lang)}
                    </span>
                  </div>
                </div>

                {/* Quick Selection Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-200/60">
                  <span className="text-[10px] font-mono uppercase text-stone-400 mr-1">
                    {lang === "vi" ? "Gợi ý nhanh:" : "Quick pick:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setConfig((p) => ({ ...p, eventDate: getUpcomingDate(6) }));
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                      config.eventDate === getUpcomingDate(6)
                        ? "bg-stone-900 text-[#F9F6F0] border-stone-900 shadow-2xs"
                        : "bg-white text-stone-700 border-stone-300 hover:border-stone-800"
                    }`}
                  >
                    {t.studio.dateQuickThisSat}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setConfig((p) => ({ ...p, eventDate: getUpcomingDate(0) }));
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                      config.eventDate === getUpcomingDate(0)
                        ? "bg-stone-900 text-[#F9F6F0] border-stone-900 shadow-2xs"
                        : "bg-white text-stone-700 border-stone-300 hover:border-stone-800"
                    }`}
                  >
                    {t.studio.dateQuickThisSun}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setConfig((p) => ({ ...p, eventDate: getUpcomingDate(6, 1) }));
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                      config.eventDate === getUpcomingDate(6, 1)
                        ? "bg-stone-900 text-[#F9F6F0] border-stone-900 shadow-2xs"
                        : "bg-white text-stone-700 border-stone-300 hover:border-stone-800"
                    }`}
                  >
                    {t.studio.dateQuickNextSat}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setConfig((p) => ({ ...p, eventDate: undefined }));
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                      !config.eventDate
                        ? "bg-stone-900 text-[#F9F6F0] border-stone-900 shadow-2xs"
                        : "bg-white text-stone-700 border-stone-300 hover:border-stone-800"
                    }`}
                  >
                    {t.studio.dateClear}
                  </button>
                </div>
              </div>

              {/* Cover text elements */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.badgeLabel}
                  </label>
                  <input
                    type="text"
                    value={config.cover.badge || ""}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, cover: { ...p.cover, badge: e.target.value } }))
                    }
                    placeholder={t.studio.badgePlaceholder}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.coverTitleLabel}
                  </label>
                  <input
                    type="text"
                    value={config.cover.title}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, cover: { ...p.cover, title: e.target.value } }))
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none font-serif italic"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.introNoteLabel}
                  </label>
                  <textarea
                    rows={3}
                    value={config.cover.note}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, cover: { ...p.cover, note: e.target.value } }))
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg p-3 text-sm text-stone-900 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.ctaBtnLabel}
                  </label>
                  <input
                    type="text"
                    value={config.cover.cta}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, cover: { ...p.cover, cta: e.target.value } }))
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.footerNoteLabel}
                  </label>
                  <input
                    type="text"
                    value={config.cover.footerNote || ""}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        cover: { ...p.cover, footerNote: e.target.value },
                      }))
                    }
                    placeholder={lang === "vi" ? "Gửi riêng từ {{sender}}" : "Warmly from {{sender}}"}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.watermarkLabel}
                  </label>
                  <input
                    type="text"
                    value={config.cover.watermark || ""}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        cover: { ...p.cover, watermark: e.target.value },
                      }))
                    }
                    placeholder={
                      lang === "vi"
                        ? "Khoảnh khắc dịu dàng cho hai người"
                        : "A quiet moment for two"
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC QUESTIONS BUILDER */}
          {activeTab === "questions" && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-serif italic text-2xl text-stone-900">
                    {t.studio.questionsTitle}
                  </h2>
                  <p className="text-xs text-stone-500 font-light mt-1">
                    {t.studio.questionsSubtitle}
                  </p>
                </div>
              </div>

              {/* Soft Recommendation Tip */}
              <div className="p-3.5 rounded-xl border border-[#9E7D4B]/30 bg-[#F2ECE1]/60 flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-[#9E7D4B] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 font-light leading-relaxed">
                  {t.studio.recTip}
                </p>
              </div>

              {/* Question Blocks List */}
              <div className="space-y-4">
                {config.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 bg-white border border-stone-300 rounded-xl space-y-3 relative shadow-xs"
                  >
                    {/* Header of Block */}
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E7D4B] font-semibold">
                          {q.type === "course_card" && t.studio.typeCourse}
                          {q.type === "tag_pills" && t.studio.typePills}
                          {q.type === "short_text" && t.studio.typeShort}
                          {q.type === "long_text" && t.studio.typeLong}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveQuestion(idx, "up")}
                          type="button"
                          className="w-7 h-7 rounded-md border border-stone-200 bg-white text-stone-500 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50 flex items-center justify-center transition-all shadow-2xs disabled:opacity-25 disabled:pointer-events-none active:scale-95"
                          title={t.studio.moveUp}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === config.questions.length - 1}
                          onClick={() => handleMoveQuestion(idx, "down")}
                          type="button"
                          className="w-7 h-7 rounded-md border border-stone-200 bg-white text-stone-500 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50 flex items-center justify-center transition-all shadow-2xs disabled:opacity-25 disabled:pointer-events-none active:scale-95"
                          title={t.studio.moveDown}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveQuestion(q.id)}
                          type="button"
                          className="w-7 h-7 rounded-md border border-stone-200 bg-white text-stone-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 flex items-center justify-center transition-all shadow-2xs ml-0.5 active:scale-95"
                          title={t.studio.deleteQuestion}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={q.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfig((p) => ({
                            ...p,
                            questions: p.questions.map((item) =>
                              item.id === q.id ? { ...item, title: val } : item
                            ),
                          }));
                        }}
                        placeholder={t.studio.questionTitlePlaceholder}
                        className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none font-medium"
                      />
                      <input
                        type="text"
                        value={q.subtitle || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfig((p) => ({
                            ...p,
                            questions: p.questions.map((item) =>
                              item.id === q.id ? { ...item, subtitle: val } : item
                            ),
                          }));
                        }}
                        placeholder={t.studio.questionSubPlaceholder}
                        className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-[11px] text-stone-600 focus:outline-none"
                      />
                    </div>

                    {/* Specific editing per question type */}
                    {(q.type === "course_card" || q.type === "tag_pills") && q.options && (
                      <div className="space-y-2 pt-1 border-t border-stone-100">
                        <span className="text-[10px] font-mono uppercase text-stone-500 block">
                          {t.studio.optionsLabel}
                        </span>
                        <div className="space-y-2">
                          {q.options.map((opt) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              {q.type === "course_card" && (
                                <input
                                  type="text"
                                  value={opt.badge || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setConfig((p) => ({
                                      ...p,
                                      questions: p.questions.map((item) =>
                                        item.id === q.id
                                          ? {
                                              ...item,
                                              options: item.options?.map((o) =>
                                                o.id === opt.id ? { ...o, badge: val } : o
                                              ),
                                            }
                                          : item
                                      ),
                                    }));
                                  }}
                                  placeholder={lang === "vi" ? "Nhãn (vd: Ấm cúng...)" : "Badge tag..."}
                                  className="w-24 sm:w-28 bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs text-[#9E7D4B] font-mono"
                                />
                              )}
                              <input
                                type="text"
                                value={opt.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setConfig((p) => ({
                                    ...p,
                                    questions: p.questions.map((item) =>
                                      item.id === q.id
                                        ? {
                                            ...item,
                                            options: item.options?.map((o) =>
                                              o.id === opt.id ? { ...o, title: val } : o
                                            ),
                                          }
                                        : item
                                    ),
                                  }));
                                }}
                                placeholder={t.studio.optionTitlePlaceholder}
                                className="flex-1 bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs"
                              />
                              {q.type === "course_card" && (
                                <input
                                  type="text"
                                  value={opt.subtitle || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setConfig((p) => ({
                                      ...p,
                                      questions: p.questions.map((item) =>
                                        item.id === q.id
                                          ? {
                                              ...item,
                                              options: item.options?.map((o) =>
                                                o.id === opt.id ? { ...o, subtitle: val } : o
                                              ),
                                            }
                                          : item
                                      ),
                                    }));
                                  }}
                                  placeholder={t.studio.optionSubPlaceholder}
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs"
                                />
                              )}
                              <button
                                onClick={() => {
                                  if ((q.options?.length || 0) <= 1) return;
                                  setConfig((p) => ({
                                    ...p,
                                    questions: p.questions.map((item) =>
                                      item.id === q.id
                                        ? {
                                            ...item,
                                            options: item.options?.filter((o) => o.id !== opt.id),
                                          }
                                        : item
                                    ),
                                  }));
                                }}
                                type="button"
                                className="w-6 h-6 rounded-md border border-stone-200 bg-white text-stone-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 flex items-center justify-center transition-all flex-shrink-0 shadow-2xs active:scale-95"
                                title={lang === "vi" ? "Xóa lựa chọn này" : "Remove option"}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            const newOpt: QuestionOption = {
                              id: `opt-${Date.now()}`,
                              title: lang === "vi" ? "Lựa chọn mới" : "New Option",
                              badge: q.type === "course_card" ? (lang === "vi" ? "Gợi ý" : "Option") : undefined,
                            };
                            setConfig((p) => ({
                              ...p,
                              questions: p.questions.map((item) =>
                                item.id === q.id
                                  ? { ...item, options: [...(item.options || []), newOpt] }
                                  : item
                              ),
                            }));
                          }}
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#9E7D4B]/40 bg-amber-50/70 hover:bg-amber-100 text-stone-800 text-[11px] font-mono uppercase tracking-wider transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer mt-1 font-medium"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#9E7D4B]" />
                          <span>{t.studio.addOption}</span>
                        </button>
                      </div>
                    )}

                    {(q.type === "short_text" || q.type === "long_text") && (
                      <div className="pt-1 space-y-1">
                        <label className="block text-[10px] font-mono uppercase text-stone-500">
                          {t.studio.textPlaceholderLabel}
                        </label>
                        <input
                          type="text"
                          value={q.placeholder || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((p) => ({
                              ...p,
                              questions: p.questions.map((item) =>
                                item.id === q.id ? { ...item, placeholder: val } : item
                              ),
                            }));
                          }}
                          placeholder={t.studio.textPlaceholderPrompt}
                          className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-xs text-stone-600 italic focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Question Toolbar */}
              <div className="pt-4 border-t border-stone-200">
                <span className="text-xs font-mono uppercase text-stone-600 block mb-2.5 font-medium tracking-wider">
                  {t.studio.addQuestionHeader}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => handleAddQuestion("course_card")}
                    type="button"
                    className="p-3 rounded-xl border border-stone-200 bg-white hover:border-[#9E7D4B] hover:bg-amber-50/30 text-left transition-all group shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100/70 border border-amber-200/60 flex items-center justify-center text-[#9E7D4B] group-hover:scale-110 transition-transform">
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-stone-800 tracking-tight">
                        {t.studio.btnTypeCourse}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-sans leading-tight">
                      {t.studio.btnTypeCourseDesc}
                    </span>
                  </button>

                  <button
                    onClick={() => handleAddQuestion("tag_pills")}
                    type="button"
                    className="p-3 rounded-xl border border-stone-200 bg-white hover:border-emerald-600/70 hover:bg-emerald-50/30 text-left transition-all group shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100/70 border border-emerald-200/60 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
                        <Tags className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-stone-800 tracking-tight">
                        {t.studio.btnTypePills}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-sans leading-tight">
                      {t.studio.btnTypePillsDesc}
                    </span>
                  </button>

                  <button
                    onClick={() => handleAddQuestion("short_text")}
                    type="button"
                    className="p-3 rounded-xl border border-stone-200 bg-white hover:border-sky-600/70 hover:bg-sky-50/30 text-left transition-all group shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-100/70 border border-sky-200/60 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
                        <AlignLeft className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-stone-800 tracking-tight">
                        {t.studio.btnTypeShort}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-sans leading-tight">
                      {t.studio.btnTypeShortDesc}
                    </span>
                  </button>

                  <button
                    onClick={() => handleAddQuestion("long_text")}
                    type="button"
                    className="p-3 rounded-xl border border-stone-200 bg-white hover:border-rose-500/70 hover:bg-rose-50/30 text-left transition-all group shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-100/70 border border-rose-200/60 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-stone-800 tracking-tight">
                        {t.studio.btnTypeLong}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-sans leading-tight">
                      {t.studio.btnTypeLongDesc}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TICKET */}
          {activeTab === "ticket" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif italic text-2xl text-stone-900">
                  {t.studio.ticketTitle}
                </h2>
                <p className="text-xs text-stone-500 font-light mt-1">
                  {t.studio.ticketSubtitle}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.ticketBadgeLabel}
                  </label>
                  <input
                    type="text"
                    value={config.stepTicket.badge}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        stepTicket: { ...p.stepTicket, badge: e.target.value },
                      }))
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.ticketTypeLabel}
                  </label>
                  <input
                    type="text"
                    value={config.stepTicket.ticketType}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        stepTicket: { ...p.stepTicket, ticketType: e.target.value },
                      }))
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none font-mono uppercase tracking-wider"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.ticketQuoteLabel}
                  </label>
                  <input
                    type="text"
                    value={config.stepTicket.quote}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        stepTicket: { ...p.stepTicket, quote: e.target.value },
                      }))
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none font-serif italic"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.ticketClosingLabel}
                  </label>
                  <input
                    type="text"
                    value={config.stepTicket.closingTitle}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        stepTicket: { ...p.stepTicket, closingTitle: e.target.value },
                      }))
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none font-serif italic"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700">
                    {t.studio.ticketClosingSubLabel}
                  </label>
                  <input
                    type="text"
                    value={config.stepTicket.closingSub}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        stepTicket: { ...p.stepTicket, closingSub: e.target.value },
                      }))
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-stone-700">
                      {t.studio.ticketSendLabel}
                    </label>
                    <input
                      type="text"
                      value={config.stepTicket.actionSend}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          stepTicket: { ...p.stepTicket, actionSend: e.target.value },
                        }))
                      }
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-stone-700">
                      {t.studio.ticketDownloadLabel}
                    </label>
                    <input
                      type="text"
                      value={config.stepTicket.actionDownload}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          stepTicket: { ...p.stepTicket, actionDownload: e.target.value },
                        }))
                      }
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive iPhone Preview */}
        <div
          className={`flex-1 flex flex-col items-center justify-center py-2 ${
            mobileView === "editor" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Phone Mockup Frame (Realistic iPhone proportions: 375x800, isolated stacking context) */}
          <div className="w-[375px] max-w-full h-[800px] flex-shrink-0 bg-stone-900 rounded-[52px] p-3 shadow-2xl border-4 border-stone-700/80 relative isolate z-10 flex flex-col">
            {/* Dynamic Island */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 pointer-events-none flex items-center justify-end px-3">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-800" />
            </div>

            {/* Inner Phone Screen Container */}
            <div className="w-full h-full rounded-[40px] overflow-y-auto no-scrollbar relative flex flex-col">
              <MainWizard
                customConfig={config}
                hideAudioToggle={true}
                isRecipientPureView={false}
                className="min-h-full flex flex-col items-center justify-start pt-16 pb-12 px-3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SHAREABLE LINK MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl max-w-[375px] w-full p-4 sm:p-5 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#9E7D4B]" />
                <h3 className="font-serif italic font-medium text-base text-stone-900">
                  {t.studio.modalTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                type="button"
                className="w-7 h-7 rounded-full border border-stone-200 bg-white text-stone-500 hover:text-stone-900 hover:border-stone-400 flex items-center justify-center transition-all shadow-2xs active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed font-light">
              {t.studio.modalDesc}
            </p>

            {/* Discreet localhost development banner (hidden in production) */}
            {lanIp && typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
              <div className="flex items-center justify-between bg-stone-200/60 px-2.5 py-1 rounded-lg text-[10px] font-mono text-stone-600">
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  {shareMode === "wifi" ? `Wi-Fi (${lanIp})` : "Localhost"}
                </span>
                <button
                  type="button"
                  onClick={() => handleSwitchShareMode(shareMode === "wifi" ? "local" : "wifi")}
                  className="px-2 py-0.5 rounded border border-stone-300 bg-white text-stone-700 hover:border-stone-800 hover:bg-stone-50 text-[10px] font-mono shadow-2xs transition-colors cursor-pointer"
                >
                  {shareMode === "wifi" ? "Dùng localhost" : "Dùng Wi-Fi"}
                </button>
              </div>
            )}

            {/* QR Code or Friendly Fallback */}
            {qrCodeUrl ? (
              <div className="flex flex-col items-center justify-center py-0.5">
                <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Thiệp mời"
                    className="w-36 h-36 object-contain rounded-md"
                  />
                </div>
                <div className="flex items-center justify-between w-full px-1.5 mt-1.5 text-[10px] font-mono text-stone-500">
                  <span>QUÉT BẰNG ĐIỆN THOẠI</span>
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-[10px] font-mono font-medium shadow-2xs hover:border-stone-800 transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-2.5 h-2.5 text-[#9E7D4B]" />
                    <span>Tải ảnh QR</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-center space-y-0.5 my-1">
                <p className="text-xs font-medium text-amber-900">
                  {lang === "vi"
                    ? "Thiệp mời có nội dung phong phú!"
                    : "Your invitation has rich detailed content!"}
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed font-light">
                  {lang === "vi"
                    ? "Hãy dùng nút Sao chép link bên dưới để gửi qua Zalo, Messenger hoặc SMS nhé."
                    : "Use the Copy Link button below to send directly via messaging apps."}
                </p>
              </div>
            )}

            {/* Message with Placeholder */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase text-stone-600">
                {t.studio.modalMsgLabel}
              </label>
              <textarea
                rows={2}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder={t.studio.messagePlaceholder}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-[11px] text-stone-800 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-1.5 pt-0.5">
              <button
                onClick={handleCopyLinkWithMessage}
                type="button"
                className="w-full py-2 rounded-lg bg-stone-900 text-[#F9F6F0] text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-stone-800 active:scale-98 transition-all font-medium shadow-xs"
              >
                {copiedWithMsg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWithMsg ? t.common.copied : t.studio.modalCopyMsgBtn}</span>
              </button>

              <button
                onClick={handleCopyLinkOnly}
                type="button"
                className="w-full py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 text-[11px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 hover:border-stone-800 transition-colors shadow-2xs active:scale-98"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? t.common.copied : t.studio.modalCopyLinkBtn}</span>
              </button>
            </div>

            {/* Footer Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-200">
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:border-stone-800 hover:bg-stone-50 text-[11px] font-mono shadow-2xs transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-[#9E7D4B]" />
                <span>{t.studio.openTab}</span>
              </a>

              <button
                onClick={() => setIsShareModalOpen(false)}
                type="button"
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:border-stone-800 hover:bg-stone-50 text-[11px] font-mono uppercase shadow-2xs transition-colors font-medium active:scale-95"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-[#F9F6F0] px-5 py-2.5 rounded-full text-xs font-mono shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-stone-700">
          <Sparkles className="w-3.5 h-3.5 text-[#9E7D4B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Archive Drawer */}
      <ArchiveDrawer
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        lang={lang}
      />
    </div>
  );
}

export default function CustomizePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-stone-500">
          Đang khởi tạo Studio...
        </div>
      }
    >
      <CustomizeContent />
    </Suspense>
  );
}
