import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function InviteNotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#F9F6F0] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto text-lg">
          ✉️
        </div>
        <h2 className="font-serif italic text-xl text-stone-900">Không tìm thấy bức thư</h2>
        <p className="text-xs text-stone-600 leading-relaxed font-light">
          Đường dẫn thiệp mời này có thể chưa chính xác hoặc đã hết hiệu lực. Bạn vui lòng liên hệ
          người gửi để nhận lại link nhé.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-[#F9F6F0] text-xs font-mono uppercase tracking-wider hover:bg-stone-800 transition-colors w-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
