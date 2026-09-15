import { Layout, Navbar, Footer } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import { Head } from "nextra/components";
import type { Metadata } from "next";
import {
  SITE_DESCRIPTION,
  INDEXING_ENABLED,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
  TITLE_TEMPLATE,
} from "@/lib/seo";
import "nextra-theme-docs/style.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
  robots: {
    index: INDEXING_ENABLED,
    follow: true,
    googleBot: { index: INDEXING_ENABLED, follow: true },
  },
  icons: {
    icon: { url: "/favicon.png", type: "image/png", sizes: "96x96" },
    apple: { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const footer = (
  <Footer>MIT {new Date().getFullYear()} © Reex API.</Footer>
);

const navbar = (
  <Navbar
    logo={
      <>
        <img
          src="/logo.svg"
          alt="Reex API Docs"
          width={1703}
          height={528}
          className="logo-light"
          style={{ height: "32px", width: "auto" }}
        />
        <img
          src="/logo-dark.svg"
          alt="Reex API Docs"
          width={1703}
          height={528}
          className="logo-dark"
          style={{ height: "32px", width: "auto" }}
        />
      </>
    }
  >
    <a
      href="https://studio.reex-api.dev/"
      target="_blank"
      rel="noopener noreferrer"
      className="get-started-button"
    >
      Get Started
    </a>
  </Navbar>
);

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "optional" });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head />
      <body className={inter.className}>
        <Layout
          navbar={navbar}
          // @ts-ignore
          pageMap={await getPageMap()}
          footer={footer}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/EECvision/Reex-api-docs/tree/main"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          toc={{ float: true, title: "On This Page" }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
