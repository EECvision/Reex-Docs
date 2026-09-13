import type { MDXWrapper } from "nextra";
import type { ComponentProps } from "react";
import {
  absoluteUrl,
  serializeJsonLd,
  SITE_DESCRIPTION,
  SITE_NAME,
  SOCIAL_IMAGE,
} from "@/lib/seo";

const sectionNames: Record<string, string> = {
  "dev-mode": "Dev Mode",
  "preview-mode": "Preview Mode",
  "api-sandbox": "API Sandbox",
};

export function DocStructuredData({
  metadata,
}: Pick<ComponentProps<MDXWrapper>, "metadata">) {
  const canonical = metadata.alternates?.canonical;
  if (typeof canonical !== "string") return null;

  const url = absoluteUrl(canonical);
  const isHome = canonical === "/";
  const graph: Record<string, unknown>[] = [
    {
      "@type": isHome ? "WebPage" : "TechArticle",
      "@id": `${url}#page`,
      url,
      name: metadata.title,
      headline: metadata.title,
      description: metadata.description,
      inLanguage: "en",
      isPartOf: { "@id": absoluteUrl("/#website") },
      image: absoluteUrl(SOCIAL_IMAGE.url),
      ...(!isHome && {
        mainEntityOfPage: url,
      }),
    },
  ];

  if (isHome) {
    graph.push({
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url,
      name: SITE_NAME,
      alternateName: "Reex API Builder Docs",
      description: SITE_DESCRIPTION,
      inLanguage: "en",
    });
  } else {
    const segments = canonical.split("/").filter(Boolean);
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Documentation",
          item: absoluteUrl("/"),
        },
        ...segments.map((segment, index) => ({
          "@type": "ListItem",
          position: index + 2,
          name:
            index === segments.length - 1
              ? metadata.title
              : sectionNames[segment] || segment.replace(/-/g, " "),
          item: absoluteUrl(`/${segments.slice(0, index + 1).join("/")}`),
        })),
      ],
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
