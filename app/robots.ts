import type { MetadataRoute } from "next";
import { absoluteUrl, INDEXING_ENABLED } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    ...(INDEXING_ENABLED ? { sitemap: absoluteUrl("/sitemap.xml") } : {}),
  };
}
