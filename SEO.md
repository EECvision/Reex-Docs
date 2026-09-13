# Maintaining documentation SEO

The production origin is `https://docs.reex-api.dev`, configured in `lib/seo.ts`.
Every documentation page supplies its title, description, canonical path, and
Open Graph settings in its MDX front matter. Next.js adds the brand to nested
page titles and uses each page's title and description for Open Graph and
Twitter cards. The homepage includes its brand explicitly because Next.js 14
does not apply the root layout's title template to a page in the same segment.

Shared keyword metadata is maintained in `SITE_KEYWORDS` in `lib/seo.ts` and
inherited by documentation pages through the root layout.

When adding a page, copy the front matter from a neighboring page and update
the title, description, `alternates.canonical`, and `openGraph.url`. Use paths
without `/docs`. Keep the canonical and Open Graph URL identical. Write a
description of the actual page content rather than a list of keywords.

The sitemap reads Nextra's page map, includes documentation pages once, and
excludes pages explicitly marked `robots.index: false` or `robots: noindex`.
Modification dates come from Git when available; build dates are not used as
content modification dates. `robots.txt` permits crawling, including the old
URLs so crawlers can follow their permanent redirects.

The MDX wrapper emits WebSite/WebPage data on the home page and TechArticle
and BreadcrumbList data on documentation pages. It derives the values from
page metadata. The navbar uses `public/logo.svg`. The browser favicon is
`public/favicon.png` (96 by 96 pixels), and the Apple touch icon is
`public/apple-touch-icon.png` (180 by 180 pixels). Both are square PNG exports
of the supplied `public/logo-icon.svg`, centered on transparent padding without
cropping or stretching the artwork. Open Graph, Twitter, and structured data use
`public/og-image.png` (1200 by 630 pixels). These files are served directly;
there are no generated image routes. When replacing the preview image, keep
its dimensions or update the dimensions in `lib/seo.ts` and MDX front matter.

## Verification

Run `npm run build`, then `npm run check:seo`. The check starts a temporary
production server and verifies every page's rendered metadata, structured
data, sitemap membership, old URL redirects, image responses, and 404 behavior.
It also checks that tracking parameters do not change a page's canonical URL.

After deploying, run `npm run check:seo -- https://docs.reex-api.dev` to run the
same checks against the live site. This checks public responses; Search Console
URL Inspection is still needed to confirm Google's actual indexing decisions.

## Rendering and mobile audit

Keep heading levels sequential, starting with one H1 and then H2 sections.
Avoid multiline plain text inside explicit `<p>` and heading tags in MDX:
Nextra can insert nested paragraphs, which causes React hydration errors.

The body uses the font configured by `next/font`. Optional font display avoids
late font swaps on slow connections. Code examples use a high-contrast light
theme. Examples with at least 40 lines defer off-screen layout with
`content-visibility: auto`; their complete text remains in the server-rendered
HTML. Placeholder heights use line counts, and printing renders all examples.

Local production audit on 2026-09-13, using Lighthouse 13.4.1 and Chrome 153
with simulated mobile throttling at 360 by 800 pixels:

| Page | Performance | Accessibility | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 87 | 95 | 100 | 4.1 s | 0 |
| `/dev-mode/getting-started` | 93 | 95 | 100 | 3.1 s | 0 |
| `/dev-mode/architecture` | 91 | 95 | 100 | 3.4 s | 0 |

All 15 pages were checked at 360 pixels wide, with these three representative
pages also checked at 320, 768, and 1440 pixels. All 24 checks passed without
horizontal page overflow or React errors. Mobile navigation, deep links near
the bottom of the architecture page, and browser search within long code
examples also passed. Pagefind successfully indexed all 15 pages.

These are local lab results, not production Core Web Vitals or indexing
guarantees. Loading time still has room to improve, especially on the homepage.
Lighthouse also flags the unlabeled dropdown in Nextra 4.6.1's built-in
"Copy page" control; heading order and code contrast checks now pass.

## After deployment

1. If you verified `reex-api.dev` as a Domain property in Google Search Console,
   use it: it covers `docs.reex-api.dev` and `studio.reex-api.dev`. If the existing
   property is only the URL prefix `https://reex-api.dev/`, add and verify
   `https://docs.reex-api.dev/` separately, because URL-prefix properties do
   not include other subdomains.
2. Submit `https://docs.reex-api.dev/sitemap.xml` and inspect the homepage and a
   nested page with URL Inspection. Request indexing after the deployment.
3. Validate a nested page with Google's Rich Results Test, and monitor indexing
   and Core Web Vitals in Search Console as real usage data becomes available.

Do not add invented verification tokens, author names, ratings, or modification
dates. Technical SEO makes pages easier to discover and understand; rankings
also depend on the documentation's usefulness and relevance.

References: [Next.js metadata](https://nextjs.org/docs/14/app/api-reference/functions/generate-metadata),
[Google title guidance](https://developers.google.com/search/docs/appearance/title-link),
[Google breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb),
[Google sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[Google favicon requirements](https://developers.google.com/search/docs/appearance/favicon-in-search),
[Search Console property coverage](https://support.google.com/webmasters/answer/34592),
[Off-screen rendering](https://web.dev/articles/content-visibility),
[Font loading](https://web.dev/learn/performance/optimize-web-fonts).
