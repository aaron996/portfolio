import type { Metadata } from "next";
import { content } from "@/content/content.vi";
import { NullScene } from "@/components/notfound/NullScene";
import "@/components/home/home.css";
import "@/components/notfound/not-found.css";

export const metadata: Metadata = { title: content.notFound.found };

export default function NotFound() {
  return <NullScene />;
}
