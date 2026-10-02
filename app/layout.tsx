import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Be_Vietnam_Pro, Space_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cuochennho.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Cuộc Hẹn Nhỏ · Thiệp Mời Buổi Hẹn Cho Hai Người",
    template: "%s · Cuộc Hẹn Nhỏ",
  },
  description:
    "Tạo thiệp mời hẹn hò mang phong cách tạp chí cổ điển. Cùng nhau chọn thời gian, không gian và gu đồ uống tinh tế, không gượng gạo.",
  keywords: [
    "cuộc hẹn nhỏ",
    "thiệp mời hẹn hò",
    "lời ngỏ đi date",
    "cuochennho",
    "editorial date invite",
    "buổi hẹn đầu tiên",
  ],
  authors: [{ name: "Cuộc Hẹn Nhỏ", url: appUrl }],
  creator: "Cuộc Hẹn Nhỏ",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: appUrl,
    title: "Cuộc Hẹn Nhỏ · Thiệp Mời Buổi Hẹn Cho Hai Người",
    description:
      "Tạo thiệp mời hẹn hò phong cách tạp chí cổ điển. Khám phá khung giờ hoàng hôn, không gian ấm cúng và tấm vé kỷ niệm đóng dấu sáp đỏ.",
    siteName: "Cuộc Hẹn Nhỏ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuộc Hẹn Nhỏ · Thiệp Mời Buổi Hẹn Cho Hai Người",
    description:
      "Tạo thiệp mời hẹn hò phong cách tạp chí cổ điển dành riêng cho hai người.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F9F6F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${cormorant.variable} ${beVietnamPro.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F9F6F0] text-stone-900 font-sans selection:bg-[#9E7D4B]/20 selection:text-stone-900">
        {children}
      </body>
    </html>
  );
}
