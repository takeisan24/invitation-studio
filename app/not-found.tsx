import type { Metadata } from "next";
import { InviteNotFound } from "@/components/InviteNotFound";

export const metadata: Metadata = { title: "Không tìm thấy trang · Cuộc Hẹn Nhỏ" };

export default function NotFound() {
  return <InviteNotFound variant="page" />;
}
