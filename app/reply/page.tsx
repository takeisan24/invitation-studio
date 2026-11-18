"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Inbox, Sparkles } from "lucide-react";
import { InviteNotFound } from "@/components/InviteNotFound";
import { decodeReply, readHashParam } from "@/lib/invite-codec";
import { useLocationHash } from "@/lib/use-location-hash";
import { applyReply, formatAnswer, type SavedInvitationRecord } from "@/lib/archive-storage";

// /reply#r=<payload>: the recipient's answers, sent back by chat. Opening it on the
// sender's device saves them into the local archive; nothing touches a server.
export default function ReplyPage() {
  const hash = useLocationHash();
  const reply = useMemo(() => {
    const encoded = hash ? readHashParam(hash, "r") : null;
    return encoded ? decodeReply(encoded) : null;
  }, [hash]);

  const [saved, setSaved] = useState<{ record: SavedInvitationRecord; matched: boolean } | null>(null);

  useEffect(() => {
    if (reply) queueMicrotask(() => setSaved(applyReply(reply)));
  }, [reply]);

  if (hash === null) {
    return (
      <div className="min-h-[100dvh] bg-[#F9F6F0] flex items-center justify-center">
        <div className="font-mono text-xs text-stone-500 tracking-widest uppercase animate-pulse">
          Đang mở thư hồi âm...
        </div>
      </div>
    );
  }
  if (!reply) return <InviteNotFound />;

  const isEn = reply.language === "en";
  const labels = saved?.record.labels;
  const entries = Object.entries(reply.answers).filter(
    ([, v]) => v && !(Array.isArray(v) && v.length === 0)
  );

  return (
    <div className="min-h-[100dvh] bg-[#F9F6F0] flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="text-center space-y-1">
          <Sparkles className="w-5 h-5 text-[#9E7D4B] mx-auto" />
          <h1 className="font-serif italic text-xl text-stone-900">
            {isEn
              ? `${reply.guestName || "Your date"} has replied`
              : `${reply.guestName || "Người ấy"} đã hồi âm`}
          </h1>
          {saved && (
            <p className="text-[11px] text-stone-500 font-light">
              {saved.matched
                ? isEn
                  ? "Saved to the invitation in your archive."
                  : "Đã lưu vào thiệp tương ứng trong hộp thư của bạn."
                : isEn
                ? "Saved to your archive as a new entry (this device did not create the invitation)."
                : "Đã lưu vào hộp thư như một mục mới (thiệp không được tạo trên máy này)."}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {entries.map(([id, value], idx) => (
            <div key={id} className="p-3 rounded-xl border border-stone-200/80 bg-[#FAF8F5] space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                {labels?.[id]?.title ?? (isEn ? `Choice 0${idx + 1}` : `Lựa chọn 0${idx + 1}`)}
              </span>
              <p className="text-xs text-stone-800 font-medium leading-relaxed whitespace-pre-line">
                {formatAnswer(value, labels?.[id])}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/customize?archive=1"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-[#F9F6F0] text-xs font-mono uppercase tracking-wider hover:bg-stone-800 transition-colors w-full"
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>{isEn ? "Open my archive" : "Mở hộp thư"}</span>
        </Link>
      </div>
    </div>
  );
}
