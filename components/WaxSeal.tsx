"use client";

import { motion } from "framer-motion";

interface WaxSealProps {
  initials?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  animateStamp?: boolean;
  color?: string;
}

export function WaxSeal({
  initials = "M & L",
  className = "",
  size = "md",
  animateStamp = false,
  color = "#7A2021",
}: WaxSealProps) {
  const sizeMap = {
    sm: "w-12 h-12 text-xs",
    md: "w-16 h-16 text-sm",
    lg: "w-20 h-20 text-base",
  };

  return (
    <motion.div
      initial={animateStamp ? { scale: 2.2, opacity: 0, rotate: -25 } : false}
      animate={animateStamp ? { scale: 1, opacity: 1, rotate: 0 } : {}}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 18,
        delay: 0.15,
      }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
    >
      {/* Outer irregular wax rim with custom theme color */}
      <div
        style={{ backgroundColor: color }}
        className={`${sizeMap[size]} rounded-full text-[#E7CBA1] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.25),inset_0_-3px_6px_rgba(0,0,0,0.5),0_4px_10px_rgba(0,0,0,0.2)] border border-black/30`}
      >
        {/* Inner concentric ring */}
        <div className="w-[84%] h-[84%] rounded-full border border-dashed border-white/20 flex items-center justify-center">
          <div className="w-[82%] h-[82%] rounded-full border border-black/20 flex flex-col items-center justify-center shadow-inner">
            <span className="font-serif italic font-bold tracking-widest uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
              {initials}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
