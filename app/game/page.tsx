import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { OpsGame } from "@/components/game/OpsGame";
import { content } from "@/content/content.vi";

const { game } = content;

export const metadata: Metadata = {
  title: game.heading,
  description: game.intro,
};

export default function GamePage() {
  return (
    <>
      <Nav />
      <main id="main" className="px-5 pb-24 pt-28 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow text-lime">{game.eyebrow}</p>
          <h1 className="display mt-3 text-4xl text-paper sm:text-6xl">{game.heading}</h1>
          <p className="prose-lede mt-5 text-mute">{game.intro}</p>
        </div>

        <div className="mt-10">
          <OpsGame />
        </div>

        <div className="mx-auto mt-10 max-w-4xl border-t border-ink-800 pt-6">
          <p className="prose-lede text-sm text-mute-2">{game.note}</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-lime underline-offset-4 hover:underline"
          >
            ← Về trang chủ
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
