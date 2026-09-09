import { Archivo_Black, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

export const posterFont = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--hero-poster",
});

export const groteskFont = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--hero-grotesk",
});

export const monoFont = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--hero-mono",
});

export const portfolioFontVariables = `${posterFont.variable} ${groteskFont.variable} ${monoFont.variable}`;
