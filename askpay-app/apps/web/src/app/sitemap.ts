import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://askpay.app";

  const routes = [
    "",
    "/how-it-works",
    "/about",
    "/pricing",
    "/legal",
    "/stats",
    "/dashboard",
    "/referrals",
    "/my-questions",
    "/roadmap",
    "/credits",
    "/changelog",
    "/contact",
  ];

  return routes.map((route) => {
    const isHome = route === "";
    const isPriorityPage = route === "/pricing" || route === "/how-it-works";

    return {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: isHome ? "daily" : "weekly",
      priority: isHome ? 1.0 : isPriorityPage ? 0.8 : 0.6,
    };
  });
}
