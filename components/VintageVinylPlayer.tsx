"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Disc3,
} from "lucide-react";
import { soundEngine } from "@/lib/audio";
import { MusicTrackConfig } from "@/lib/date-content";
import { ThemePreset } from "@/lib/theme-config";

interface VintageVinylPlayerProps {
  musicConfig?: MusicTrackConfig;
  theme?: ThemePreset;
  lang?: "vi" | "en";
  className?: string;
}

export function VintageVinylPlayer({
  musicConfig,
  theme,
  lang = "vi",
  className = "",
}: VintageVinylPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isEn = lang === "en";
  const activeTrack = musicConfig || {
    trackId: "lofi-rhodes",
    title: isEn ? "Vintage Lo-Fi Rhodes" : "Vintage Lo-Fi Rhodes",
    artist: "Cuộc Hẹn Nhỏ Sessions",
  };

  const isBuiltInLoFi = activeTrack.trackId === "lofi-rhodes";

  // Sync with audio element when track changes or custom URL provided
  useEffect(() => {
    if (!isBuiltInLoFi && activeTrack.url) {
      if (!audioRef.current) {
        audioRef.current = new Audio(activeTrack.url);
        audioRef.current.loop = true;
      } else {
        audioRef.current.src = activeTrack.url;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (isBuiltInLoFi) {
        soundEngine.stopMusic();
      }
    };
  }, [activeTrack.url, isBuiltInLoFi]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      // Pause
      if (isBuiltInLoFi) {
        soundEngine.stopMusic();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Play
      soundEngine.playNeedleDropSound();

      if (isBuiltInLoFi) {
        soundEngine.startMusic();
      } else if (audioRef.current) {
        audioRef.current
          .play()
          .catch(() => {
            // Autoplay blocked fallback
          });
      }
      setIsPlaying(true);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
    soundEngine.setMuted(nextMuted);
  };

  const palette = theme?.palette || {
    cardBg: "#FAF8F5",
    charcoal: "#2C2A29",
    gold: "#9E7D4B",
    wax: "#7A2021",
    border: "#E7E5E4",
    taupe: "#78716C",
  };

  return (
    <div className={`fixed top-4 right-4 z-40 select-none ${className}`}>
      <motion.div
        layout
        style={{
          backgroundColor: palette.cardBg,
          borderColor: palette.border,
        }}
        className="flex items-center gap-2 p-1.5 sm:p-2 rounded-full border shadow-md backdrop-blur-md transition-all duration-300"
      >
        {/* Spinning Vinyl Record Visual */}
        <div
          onClick={handleTogglePlay}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#18181B] border-2 border-stone-800 flex items-center justify-center cursor-pointer shadow-inner overflow-hidden group flex-shrink-0"
        >
          {/* Vinyl Grooves concentric rings */}
          <div className="absolute inset-1 rounded-full border border-stone-700/40 pointer-events-none" />
          <div className="absolute inset-2 rounded-full border border-stone-700/30 pointer-events-none" />

          {/* Vinyl Label */}
          <div
            style={{ backgroundColor: palette.wax }}
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center text-[7px] text-[#E7CBA1] border border-white/20 transition-transform ${
              isPlaying ? "animate-[spin_3.5s_linear_infinite]" : ""
            }`}
          >
            ✦
          </div>

          {/* Hover Play/Pause Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Ticker & Track Info */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer max-w-[120px] sm:max-w-[170px] px-1 overflow-hidden"
        >
          <div className="flex items-center gap-1">
            <span
              style={{ color: palette.gold }}
              className="text-[9px] font-mono tracking-widest uppercase block truncate font-semibold"
            >
              {isPlaying ? (isEn ? "NOW PLAYING" : "ĐANG PHÁT") : isEn ? "VINYL BGM" : "NHẠC NỀN"}
            </span>
            {isPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          <p
            style={{ color: palette.charcoal }}
            className="text-[11px] font-serif italic truncate leading-tight font-medium"
          >
            {activeTrack.title}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-1 pr-1">
          <button
            type="button"
            onClick={handleTogglePlay}
            style={{
              backgroundColor: isPlaying ? palette.charcoal : "transparent",
              color: isPlaying ? "#F9F6F0" : palette.charcoal,
              borderColor: palette.border,
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 fill-current" />
            ) : (
              <Play className="w-3 h-3 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            style={{ color: palette.taupe }}
            className="p-1.5 rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer hidden sm:flex"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Expanded Track Details Card */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            style={{
              backgroundColor: palette.cardBg,
              borderColor: palette.border,
            }}
            className="mt-2 p-3.5 rounded-2xl border shadow-xl w-64 text-left space-y-2 backdrop-blur-md"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
                {isEn ? "Vintage Turntable" : "Máy Đĩa Than Cổ Điển"}
              </span>
              <Disc3
                className={`w-3.5 h-3.5 text-[#9E7D4B] ${
                  isPlaying ? "animate-spin" : ""
                }`}
              />
            </div>

            <div>
              <h4
                style={{ color: palette.charcoal }}
                className="font-serif italic text-sm font-medium"
              >
                {activeTrack.title}
              </h4>
              <p
                style={{ color: palette.taupe }}
                className="text-[11px] font-light mt-0.5"
              >
                {activeTrack.artist || "Cuộc Hẹn Nhỏ Records"}
              </p>
            </div>

            <div className="text-[10.5px] font-mono text-stone-500 bg-[#F4F1EA] p-2 rounded-lg border border-stone-200/60">
              {isBuiltInLoFi
                ? isEn
                  ? "Generated analog lo-fi with tape flutter & vinyl noise"
                  : "Âm thanh analog Rhodes Lo-Fi & tiếng nổ kim đĩa than độc bản"
                : isEn
                ? "Playing curated acoustic track"
                : "Đang phát bài nhạc do người gửi lựa chọn"}
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-full text-center text-[10px] font-mono uppercase text-stone-400 hover:text-stone-700 pt-1"
            >
              {isEn ? "Close" : "Thu gọn"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
