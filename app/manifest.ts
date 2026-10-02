import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cuộc Hẹn Nhỏ · Thiệp Mời Hẹn Hò",
    short_name: "Cuộc Hẹn Nhỏ",
    description: "Tạo thiệp mời hẹn hò phong cách tạp chí cổ điển dành riêng cho hai người",
    start_url: "/",
    display: "standalone",
    background_color: "#F9F6F0",
    theme_color: "#F9F6F0",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
