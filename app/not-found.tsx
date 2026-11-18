import type { Metadata } from "next";
import { InviteNotFound } from "@/components/InviteNotFound";

export const metadata: Metadata = { title: "Không tìm thấy trang" };

export default function NotFound() {
  return <InviteNotFound variant="page" />;
}
