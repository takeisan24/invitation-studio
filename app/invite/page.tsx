"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { MainWizard } from "@/components/MainWizard";
import { InviteNotFound } from "@/components/InviteNotFound";
import { decodeInvite, readHashParam } from "@/lib/invite-codec";
import { useLocationHash } from "@/lib/use-location-hash";

function OpeningLetter({ label }: { label: string }) {
  return (
    <div className="min-h-[100dvh] bg-[#F9F6F0] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full border border-stone-300 flex items-center justify-center mb-4 bg-white/70 shadow-sm animate-pulse">
        <Sparkles className="w-5 h-5 text-[#9E7D4B] animate-spin" style={{ animationDuration: "3s" }} />
      </div>
      <p className="font-serif italic text-lg text-stone-800 mb-1">{label}</p>
      <span className="font-mono text-[11px] text-stone-500 uppercase tracking-widest">
        Vintage Invitation Studio
      </span>
    </div>
  );
}

// Handles every invite link shape that is not a short /i/<id> link:
//   /invite#c=<delta>  current database-free links (fragment never hits the server)
//   /invite?c=<full>   links made before 2026-10
//   /invite?id=<id>    short links from the old database, now served by /i/<id>
function RecipientInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hash = useLocationHash();
  const legacyEncoded = searchParams.get("c");
  const legacyId = searchParams.get("id");

  const fromHash = useMemo(() => {
    const encoded = hash ? readHashParam(hash, "c") : null;
    return encoded ? decodeInvite(encoded) : null;
  }, [hash]);

  const shouldRedirectHome = hash !== null && !legacyId && !legacyEncoded && !readHashParam(hash, "c");

  useEffect(() => {
    if (legacyId) router.replace(`/i/${encodeURIComponent(legacyId)}`);
    else if (shouldRedirectHome) router.replace("/");
  }, [legacyId, shouldRedirectHome, router]);

  if (legacyId) return <OpeningLetter label="Đang mở bức thư riêng tư..." />;
  if (legacyEncoded) return <MainWizard isRecipientPureView />;
  if (hash === null || shouldRedirectHome) return <OpeningLetter label="Đang mở bức thư..." />;
  if (!fromHash) return <InviteNotFound />;

  return <MainWizard customConfig={fromHash.config} invitationId={fromHash.key} isRecipientPureView />;
}

export default function RecipientInvitePage() {
  return (
    <Suspense fallback={<OpeningLetter label="Đang mở bức thư..." />}>
      <RecipientInvitationContent />
    </Suspense>
  );
}
