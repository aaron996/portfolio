import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Hero } from "@/components/Hero";
import { StatBand } from "@/components/StatBand";
import { FeaturedCase } from "@/components/FeaturedCase";
import { AiSection } from "@/components/AiSection";
import { CaseGrid } from "@/components/CaseGrid";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { ValueProp } from "@/components/ValueProp";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main id="main">
        <Hero />
        <StatBand />
        <FeaturedCase />
        <AiSection />
        <CaseGrid />
        <Skills />
        <Experience />
        <ValueProp />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
