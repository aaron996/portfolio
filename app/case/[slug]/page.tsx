import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { content } from "@/content/content.vi";
import { CaseArticle } from "@/components/case/CaseArticle";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return content.cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = content.cases.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: c.title,
    description: c.oneLiner,
    openGraph: { title: c.title, description: c.oneLiner },
  };
}

export default async function CasePage({ params }: Params) {
  const { slug } = await params;
  const c = content.cases.find((x) => x.slug === slug);
  if (!c) notFound();
  return <CaseArticle caseStudy={c} />;
}
