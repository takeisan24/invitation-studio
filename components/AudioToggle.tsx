"use client";

import { useEffect, useState } from "react";
import { soundEngine } from "@/lib/audio";
import { Volume2, VolumeX, Disc } from "lucide-react";

export function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setIsMuted(soundEngine.getIsMuted());
      setIsPlaying(soundEngine.getIsMusicPlaying());
    });
  }, []);

  const handleToggleMusic = () => {
    const active = soundEngine.toggleMusic();
    setIsPlaying(active);
    if (active) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    setIsPlaying(!muted && soundEngine.getIsMusicPlaying());
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* Vinyl Music Player Button */}
      <button
        onClick={handleToggleMusic}
        type="button"
        title={isPlaying ? "Tắt nhạc nền" : "Bật giai điệu ấm áp (Lo-fi Chill)"}
        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2ECE1]/90 border border-stone-300 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-stone-800 hover:bg-[#F2ECE1]"
      >
        <Disc
          className={`w-4 h-4 text-stone-800 transition-transform duration-1000 ${
            isPlaying ? "animate-spin" : "group-hover:rotate-45"
          }`}
        />
        <span className="text-[11px] font-mono uppercase tracking-widest text-stone-700">
          {isPlaying ? "Music ON" : "Music"}
        </span>

        {isPlaying && (
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9E7D4B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#9E7D4B]"></span>
          </span>
        )}
      </button>

      {/* Quick Sound Mute Toggle */}
      <button
        onClick={handleToggleMute}
        type="button"
        title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        className="p-1.5 rounded-full bg-[#F2ECE1]/80 border border-stone-300 text-stone-600 hover:text-stone-900 transition-colors"
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
