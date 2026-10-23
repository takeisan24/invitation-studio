import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cuochennho.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/onboarding", "/customize"],
        disallow: ["/api/", "/invite", "/i/", "/reply"], // Keep personal invite links private
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
