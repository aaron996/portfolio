import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { content } from "@/content/content.vi";
import { CursorLight } from "@/components/ui/CursorLight";
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
  icons: { icon: "/og.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${archivo.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="grain" suppressHydrationWarning>
        <template
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: `<!-- THESIS: Editorial Proofline makes operational proof lead each chapter; it refuses equal card shells and decorative rule-led sections.
OWN-WORLD: Deep forest green, warm off-white, restrained lime, tactile screenshots and atmospheric logistics stills; square image edges and quiet captions.
STORY: Recruiters and clients encounter the work first, then a concise note and an immediate route into each case.
FIRST VIEWPORT: The existing poster hero remains; the next viewport opens a flagship screenshot at dominant scale with copy anchored directly to its edge and the case link in that reading block.
FORM: Editorial Proofline, card 1 chosen from roll-dealt candidate 3, seed a675fe55.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->`,
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-lime focus:px-4 focus:py-2 focus:text-ink-950"
        >
          {content.prototype.labels.skip}
        </a>
        <CursorLight />
        {children}
      </body>
    </html>
  );
}
