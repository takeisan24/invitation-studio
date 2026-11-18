import { Suspense } from "react";
import type { Metadata } from "next";
import { MainWizard } from "@/components/MainWizard";
import { notFound } from "next/navigation";
import { readInvite } from "@/lib/server/invite-store";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ShortInvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await readInvite(id);

  if (!config) notFound();

  return (
    <Suspense>
      <MainWizard customConfig={config} invitationId={id} isRecipientPureView />
    </Suspense>
  );
}
