import brand from "../seo/brand.json";

export { brand };
export const SITE_URL = brand.origins.docs;
export const SITE_NAME = brand.sites.docs.name;
export const TITLE_TEMPLATE = "%s | " + SITE_NAME;
export const SITE_DESCRIPTION =
  "Learn " + brand.searchName + ", " + brand.positioning.replace(/^The /, "the ") + ". Follow guides for CLI setup, TypeScript clients, TanStack Query hooks, and authentication.";

// Set these before building: pages, robots.txt and the sitemap are prerendered.
export const INDEXING_ENABLED =
  process.env.SEO_NOINDEX !== "true" &&
  process.env.NODE_ENV === "production" &&
  (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production");

export const SOCIAL_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Reex API logo",
};

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
