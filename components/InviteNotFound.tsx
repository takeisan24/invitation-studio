import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";

type Variant = "invite" | "reply" | "page";

const COPY: Record<Variant, { icon: string; title: string; body: string }> = {
  invite: {
    icon: "✉️",
    title: "Không tìm thấy bức thư",
    body: "Đường dẫn thiệp mời này có thể chưa chính xác, bị cắt bớt khi sao chép hoặc đã hết hiệu lực. Bạn vui lòng liên hệ người gửi để nhận lại link nhé.",
  },
  reply: {
    icon: "💌",
    title: "Chưa có thư hồi âm ở đây",
    body: "Link này không chứa câu trả lời nào, hoặc đã bị cắt bớt khi sao chép. Hãy mở lại đúng link hồi âm mà người nhận gửi cho bạn. Các hồi âm đã nhận trước đó vẫn nằm trong hộp thư.",
  },
  page: {
    icon: "🧭",
    title: "Trang này không tồn tại",
    body: "Có thể đường dẫn đã gõ sai hoặc trang đã được dời đi. Quay về trang chủ để bắt đầu lại nhé.",
  },
};

export function InviteNotFound({ variant = "invite" }: { variant?: Variant }) {
  const copy = COPY[variant];
  const btn =
    "inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors w-full";
  return (
    <main className="min-h-[100dvh] bg-[#F9F6F0] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto text-lg">
          {copy.icon}
        </div>
        <h1 className="font-serif italic text-xl text-stone-900">{copy.title}</h1>
        <p className="text-xs text-stone-600 leading-relaxed font-light">{copy.body}</p>
        <div className="pt-2 space-y-2">
          {variant === "reply" && (
            <Link href="/customize?archive=1" className={`${btn} bg-stone-900 text-[#F9F6F0] hover:bg-stone-800`}>
              <Inbox className="w-3.5 h-3.5" />
              <span>Mở hộp thư</span>
            </Link>
          )}
          <Link
            href="/"
            className={`${btn} ${
              variant === "reply"
                ? "border border-stone-300 text-stone-700 hover:border-stone-800"
                : "bg-stone-900 text-[#F9F6F0] hover:bg-stone-800"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
