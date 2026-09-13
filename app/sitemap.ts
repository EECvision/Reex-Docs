import type { MetadataRoute } from "next";
import type { PageMapItem } from "nextra";
import { getPageMap } from "nextra/page-map";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = new Map<string, MetadataRoute.Sitemap[number]>();

  function collect(items: PageMapItem[]) {
    for (const item of items) {
      if ("frontMatter" in item && item.frontMatter) {
        const { robots, timestamp } = item.frontMatter;
        const noindex =
          typeof robots === "string"
            ? /\bnoindex\b/i.test(robots)
            : robots?.index === false;

        if (!noindex) {
          const url = absoluteUrl(item.route);
          pages.set(url, {
            url,
            // Nextra supplies the actual Git commit time when it is available.
            ...(typeof timestamp === "number" && timestamp > 0
              ? { lastModified: new Date(timestamp) }
              : {}),
          });
        }
      }

      if ("children" in item) collect(item.children);
    }
  }

  collect(await getPageMap());
  return Array.from(pages.values()).sort((a, b) => a.url.localeCompare(b.url));
}
