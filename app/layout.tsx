import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { content } from "@/content/content.vi";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const { meta } = content;

export const metadata: Metadata = {
  metadataBase: new URL(meta.url),
  title: { default: meta.title, template: `%s — ${meta.name}` },
  description: meta.description,
  openGraph: {
    type: "website",
    locale: meta.locale,
    url: meta.url,
    title: meta.title,
    description: meta.description,
    siteName: meta.name,
    images: [{ url: meta.ogImage, width: 1200, height: 630, alt: meta.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${archivo.variable} ${inter.variable}`}>
      <body className="grain">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-lime focus:px-4 focus:py-2 focus:text-ink-950"
        >
          Bỏ qua tới nội dung chính
        </a>
        {children}
      </body>
    </html>
  );
}
