import type { MetadataRoute } from "next";
import { teamsData } from "@/data/teamsData";

const baseUrl = "https://rugby-league-supporter-web.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/fixtures",
    "/results",
    "/league-table",
    "/teams",
    "/contact",
  ];

  const teamPages = Object.keys(teamsData).map((slug) => `/team/${slug}`);

  return [...staticPages, ...teamPages].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}