import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Thiệp Mời Buổi Hẹn · Lời Ngỏ Tinh Tế",
    short_name: "Thiệp Mời",
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
