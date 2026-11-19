"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Inbox, Sparkles } from "lucide-react";
import { InviteNotFound } from "@/components/InviteNotFound";
import { decodeReply, readHashParam } from "@/lib/invite-codec";
import { useLocationHash } from "@/lib/use-location-hash";
import { applyReply, formatAnswer, type ApplyReplyResult } from "@/lib/archive-storage";

// /reply#r=<payload>: the recipient's answers, sent back by chat. Opening it on the
// sender's device saves them into the local archive; nothing touches a server.
export default function ReplyPage() {
  const hash = useLocationHash();
  const reply = useMemo(() => {
    const encoded = hash ? readHashParam(hash, "r") : null;
    return encoded ? decodeReply(encoded) : null;
  }, [hash]);

  const [saved, setSaved] = useState<ApplyReplyResult | null>(null);

  useEffect(() => {
    if (reply) queueMicrotask(() => setSaved(applyReply(reply)));
  }, [reply]);

  const [keptOld, setKeptOld] = useState(false);
  const keepOld = () => {
    setKeptOld(true);
    setSaved((prev) => (prev ? { ...prev, incoming: undefined } : prev));
  };
  const replaceOld = () => {
    if (reply) setSaved(applyReply(reply, { replace: true }));
  };

  if (hash === null) {
    return (
      <div className="min-h-[100dvh] bg-[#F9F6F0] flex items-center justify-center">
        <div className="font-mono text-xs text-stone-500 tracking-widest uppercase animate-pulse">
          Đang mở thư hồi âm...
        </div>
      </div>
    );
  }
  if (!reply) return <InviteNotFound variant="reply" />;

  const isEn = reply.language === "en";
  const labels = saved?.record.labels;
  const pending = saved?.status === "needs_confirm" ? saved.incoming : undefined;
  const keptNote = keptOld && !pending;
  const history = saved?.record.history ?? [];
  const entries = Object.entries(saved?.record.answers ?? reply.answers).filter(
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
          {saved && !pending && (
            <p className="text-[11px] text-stone-500 font-light">
              {keptNote
                ? isEn
                  ? "Kept the earlier reply."
                  : "Đã giữ câu trả lời cũ."
                : saved.status === "unchanged"
                ? isEn
                  ? "This reply is already saved."
                  : "Đã có hồi âm này."
                : saved.matched
                ? isEn
                  ? "Saved to the invitation in your archive."
                  : "Đã lưu vào thiệp tương ứng trong hộp thư của bạn."
                : isEn
                ? "Saved to your archive as a new entry (this device did not create the invitation)."
                : "Đã lưu vào hộp thư như một mục mới (thiệp không được tạo trên máy này)."}
            </p>
          )}
        </div>

        {pending && (
          <div role="alert" className="p-3 rounded-xl border border-amber-300 bg-amber-50 space-y-2">
            <p className="text-xs text-stone-800 font-medium">
              {isEn ? "Replace the earlier reply?" : "Thay câu trả lời cũ?"}
            </p>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              {isEn
                ? "This invitation already has a different reply. The old one stays in its history."
                : "Thiệp này đã có một câu trả lời khác. Bản cũ vẫn được giữ trong lịch sử."}
            </p>
            <ul className="text-[11px] text-stone-700 space-y-0.5">
              {Object.entries(pending.answers)
                .filter(([, v]) => v && !(Array.isArray(v) && v.length === 0))
                .map(([id, value]) => (
                  <li key={id}>
                    <span className="text-stone-500">{pending.labels[id]?.title ?? id}: </span>
                    {formatAnswer(value, pending.labels[id])}
                  </li>
                ))}
            </ul>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={replaceOld}
                className="flex-1 px-3 py-2 rounded-full bg-stone-900 text-[#F9F6F0] text-[11px] font-mono uppercase tracking-wider"
              >
                {isEn ? "Replace" : "Thay thế"}
              </button>
              <button
                type="button"
                onClick={keepOld}
                className="flex-1 px-3 py-2 rounded-full border border-stone-300 bg-white text-stone-700 text-[11px] font-mono uppercase tracking-wider"
              >
                {isEn ? "Keep old" : "Giữ bản cũ"}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {pending && (
            <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              {isEn ? "Current saved reply" : "Câu trả lời đang lưu"}
            </p>
          )}
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

        {history.length > 0 && (
          <details className="text-[11px] text-stone-600">
            <summary className="cursor-pointer font-mono uppercase tracking-wider text-stone-500">
              {isEn ? `Earlier replies (${history.length})` : `Hồi âm trước đó (${history.length})`}
            </summary>
            <div className="mt-2 space-y-2">
              {history.map((h, i) => (
                <ul key={i} className="p-2 rounded-lg bg-[#FAF8F5] border border-stone-200/80 space-y-0.5">
                  {Object.entries(h.answers)
                    .filter(([, v]) => v && !(Array.isArray(v) && v.length === 0))
                    .map(([id, value]) => (
                      <li key={id}>
                        <span className="text-stone-400">{(h.labels ?? labels)?.[id]?.title ?? id}: </span>
                        {formatAnswer(value, (h.labels ?? labels)?.[id])}
                      </li>
                    ))}
                </ul>
              ))}
            </div>
          </details>
        )}

        <p className="text-[10px] text-stone-400 text-center leading-relaxed">
          {isEn
            ? "This reply can't be verified as coming from the person you invited."
            : "Hồi âm này không xác minh được người gửi."}
        </p>

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
