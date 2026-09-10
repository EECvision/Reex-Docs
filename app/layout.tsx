import { Layout, Navbar, Footer } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import { Head } from "nextra/components";
import "nextra-theme-docs/style.css";
import "./globals.css";

export const metadata = {
  title: "Reex API Builder Documentation",
  description: "Documentation for Reex API Builder",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const footer = (
  <Footer>MIT {new Date().getFullYear()} © Reex API Builder.</Footer>
);

const navbar = (
  <Navbar
    logo={
      <img
        src="/docs/logo.svg"
        alt="Reex API Builder"
        style={{ height: "32px" }}
      />
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

const inter = Inter({ subsets: ["latin"] });

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
          docsRepositoryBase="https://github.com/EECvision/Reex-api-client/tree/main/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          toc={{ float: true, title: "On This Page" }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
