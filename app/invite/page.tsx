"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MainWizard } from "@/components/MainWizard";
import { InvitationConfig } from "@/lib/date-content";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

function RecipientInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const encodedParam = searchParams.get("c");
  const idParam = searchParams.get("id");

  const [remoteConfig, setRemoteConfig] = useState<InvitationConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(idParam));
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    if (!encodedParam && !idParam) {
      router.replace("/");
      return;
    }

    if (idParam) {
      let isMounted = true;
      fetch(`/api/invitations?id=${encodeURIComponent(idParam)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((data) => {
          if (isMounted) {
            if (data.success && data.config) {
              setRemoteConfig(data.config);
            } else {
              setIsError(true);
            }
          }
        })
        .catch(() => {
          if (isMounted) setIsError(true);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [encodedParam, idParam, router]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#F9F6F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border border-stone-300 flex items-center justify-center mb-4 bg-white/70 shadow-sm animate-pulse">
          <Sparkles className="w-5 h-5 text-[#9E7D4B] animate-spin" style={{ animationDuration: "3s" }} />
        </div>
        <p className="font-serif italic text-lg text-stone-800 mb-1">
          Đang mở bức thư riêng tư...
        </p>
        <span className="font-mono text-[11px] text-stone-500 uppercase tracking-widest">
          Vintage Invitation Studio
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[100dvh] bg-[#F9F6F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto text-lg">
            ✉️
          </div>
          <h2 className="font-serif italic text-xl text-stone-900">
            Không tìm thấy bức thư
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            Đường dẫn thiệp mời này có thể chưa chính xác hoặc đã hết hiệu lực. Bạn vui lòng liên hệ người gửi để nhận lại link nhé.
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

  if (idParam && remoteConfig) {
    return (
      <MainWizard
        customConfig={remoteConfig}
        invitationId={idParam}
        isRecipientPureView={true}
        hideAudioToggle={false}
      />
    );
  }

  if (encodedParam) {
    return (
      <MainWizard
        isRecipientPureView={true}
        hideAudioToggle={false}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F9F6F0] flex items-center justify-center">
      <div className="font-mono text-xs text-stone-500 tracking-widest uppercase animate-pulse">
        Đang chuyển hướng...
      </div>
    </div>
  );
}

export default function RecipientInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#F9F6F0] flex items-center justify-center">
          <div className="font-mono text-xs text-stone-500 tracking-widest uppercase animate-pulse">
            Đang mở bức thư...
          </div>
        </div>
      }
    >
      <RecipientInvitationContent />
    </Suspense>
  );
}
