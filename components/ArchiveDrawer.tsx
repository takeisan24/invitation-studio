"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Inbox,
  Clock,
  Sparkles,
  Calendar,
  Heart,
  ChevronRight,
  MessageSquareHeart,
} from "lucide-react";
import {
  SavedInvitationRecord,
  getSavedInvitations,
  removeSavedInvitation,
  syncInvitationsWithServer,
} from "@/lib/archive-storage";
import { formatEventDate } from "@/lib/date-content";
import { soundEngine } from "@/lib/audio";

interface ArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "vi" | "en";
}

export function ArchiveDrawer({
  isOpen,
  onClose,
  lang = "vi",
}: ArchiveDrawerProps) {
  const [invitations, setInvitations] = useState<SavedInvitationRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SavedInvitationRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load from local storage and sync when drawer opens
  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        const local = getSavedInvitations();
        setInvitations(local);
        setIsSyncing(true);
      });

      // Auto sync in background
      syncInvitationsWithServer()
        .then((updated) => setInvitations(updated))
        .finally(() => setIsSyncing(false));
    }
  }, [isOpen]);

  const handleManualSync = async () => {
    soundEngine.playClick();
    setIsSyncing(true);
    try {
      const updated = await syncInvitationsWithServer();
      setInvitations(updated);
      soundEngine.playChime();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyLink = (item: SavedInvitationRecord) => {
    soundEngine.playClick();
    navigator.clipboard.writeText(item.shareUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = (id: string) => {
    soundEngine.playPaperBack();
    removeSavedInvitation(id);
    setInvitations((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirmId(null);
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const isEn = lang === "en";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-md bg-[#FAF8F5] border-l border-stone-300 shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-5 border-b border-stone-200/80 bg-white/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[#9E7D4B]">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif italic text-lg font-medium text-stone-900">
                    {isEn ? "My Letter Archive" : "Hộp Thư Của Tôi"}
                  </h2>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                    {invitations.length}{" "}
                    {isEn ? "Invitations Tracked" : "Thiệp đã lưu"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  title={isEn ? "Sync latest responses" : "Đồng bộ phản hồi mới"}
                  className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw
                    className={`w-4 h-4 ${isSyncing ? "animate-spin text-[#9E7D4B]" : ""}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {invitations.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-stone-500">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 flex items-center justify-center shadow-xs text-stone-400">
                    <MessageSquareHeart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif italic text-base text-stone-800 font-medium">
                      {isEn ? "Your archive is currently empty" : "Hộp thư chưa có thiệp nào"}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs font-light leading-relaxed">
                      {isEn
                        ? "When you create and share an invitation, it will automatically be archived here so you can check your date's choices anytime."
                        : "Khi bạn tạo thiệp và chia sẻ đường link, thiệp sẽ tự động lưu vào đây để bạn dễ dàng theo dõi phản hồi của người ấy nhé."}
                    </p>
                  </div>
                </div>
              ) : (
                invitations.map((item) => {
                  const hasAnswers = item.answers && Object.keys(item.answers).length > 0;
                  const isConfirmingDelete = deleteConfirmId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs hover:border-stone-300 transition-all space-y-3"
                    >
                      {/* Top Row: Recipient & Status Pill */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                            {isEn ? "To" : "Gửi người ấy"}
                          </span>
                          <h4 className="font-serif italic text-base font-medium text-stone-900">
                            {item.guestName || (isEn ? "Your Date" : "Người ấy")}
                          </h4>
                          <span className="text-[11px] text-stone-500 font-light block">
                            {isEn ? `From: ${item.senderName}` : `Từ: ${item.senderName}`}
                          </span>
                        </div>

                        {hasAnswers ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10.5px] font-mono tracking-wider font-medium animate-pulse">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{isEn ? "Answered ✨" : "Đã phản hồi ✨"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 text-[10.5px] font-mono tracking-wider">
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            <span>{isEn ? "Awaiting reply" : "Chờ phản hồi"}</span>
                          </span>
                        )}
                      </div>

                      {/* Date details */}
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 font-mono bg-[#FAF8F5] px-2.5 py-1.5 rounded-lg border border-stone-200/60">
                        <Calendar className="w-3.5 h-3.5 text-[#9E7D4B] flex-shrink-0" />
                        <span className="truncate">
                          {item.eventDate
                            ? formatEventDate(item.eventDate, lang)
                            : isEn
                            ? "Flexible Weekend"
                            : "Một ngày cuối tuần thảnh thơi"}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                        <div className="flex items-center gap-1">
                          {hasAnswers ? (
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                setSelectedItem(item);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-900 text-[#F9F6F0] text-xs font-mono uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer"
                            >
                              <span>{isEn ? "View Choices" : "Xem phản hồi"}</span>
                              <ChevronRight className="w-3 h-3 text-[#9E7D4B]" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-stone-400 font-light italic">
                              {isEn ? "Waiting for your date..." : "Đang đợi người ấy mở thiệp..."}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(item)}
                            title={isEn ? "Copy invitation link" : "Sao chép link thiệp"}
                            className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <a
                            href={item.shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={isEn ? "Open invitation" : "Mở xem thiệp"}
                            className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1 pl-1">
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-600 text-white cursor-pointer"
                              >
                                {isEn ? "Yes" : "Xóa"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-stone-200 text-stone-700 cursor-pointer"
                              >
                                {isEn ? "No" : "Hủy"}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(item.id)}
                              title={isEn ? "Delete from archive" : "Xóa khỏi hộp thư"}
                              className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer tip */}
            <div className="p-3.5 border-t border-stone-200 bg-white/70 text-center">
              <p className="text-[11px] font-mono text-stone-400 uppercase tracking-widest">
                Cuộc Hẹn Nhỏ • Vintage Letter Archive
              </p>
            </div>
          </motion.div>

          {/* RESPONSE DETAIL MODAL */}
          <AnimatePresence>
            {selectedItem && selectedItem.answers && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedItem(null)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="relative z-10 w-full max-w-md bg-[#FAF8F5] border border-stone-300 rounded-2xl shadow-2xl overflow-hidden p-6 text-left max-h-[85vh] flex flex-col"
                >
                  <div className="flex items-start justify-between pb-4 border-b border-stone-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <Heart className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E7D4B] block">
                          {isEn ? "Date Confirmation" : "Xác nhận từ người ấy"}
                        </span>
                        <h3 className="font-serif italic text-lg font-medium text-stone-900">
                          {selectedItem.guestName} 💌
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Answers Body */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3.5">
                    <div className="p-3 bg-white rounded-xl border border-stone-200/80 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-stone-400 block tracking-wider">
                        {isEn ? "Proposed Date" : "Ngày hẹn dự kiến"}
                      </span>
                      <p className="text-xs font-serif italic text-stone-900 font-medium">
                        {selectedItem.eventDate
                          ? formatEventDate(selectedItem.eventDate, lang)
                          : isEn
                          ? "Flexible Weekend"
                          : "Một ngày cuối tuần thảnh thơi"}
                      </p>
                    </div>

                    {Object.entries(selectedItem.answers).map(([key, val], idx) => {
                      if (!val || (Array.isArray(val) && val.length === 0)) return null;
                      const displayVal = Array.isArray(val) ? val.join(", ") : String(val);

                      return (
                        <div
                          key={key}
                          className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                              {isEn ? `Choice 0${idx + 1}` : `Lựa chọn 0${idx + 1}`}
                            </span>
                            <Sparkles className="w-3 h-3 text-[#9E7D4B]" />
                          </div>
                          <p className="text-xs text-stone-800 font-medium leading-relaxed font-sans">
                            {displayVal}
                          </p>
                        </div>
                      );
                    })}

                    {selectedItem.updatedAt && (
                      <p className="text-[10.5px] font-mono text-stone-400 text-center pt-2">
                        {isEn ? "Responded on:" : "Phản hồi lúc:"}{" "}
                        {new Date(selectedItem.updatedAt).toLocaleString(
                          isEn ? "en-US" : "vi-VN"
                        )}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-200 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="px-6 py-2 rounded-full bg-stone-900 text-[#F9F6F0] text-xs font-mono uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      {isEn ? "Close" : "Đóng"}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
