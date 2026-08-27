import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Hero } from "@/components/Hero";
import { LogoRail } from "@/components/LogoRail";
import { CaseGrid } from "@/components/CaseGrid";
import { PipelineSection } from "@/components/PipelineSection";
import { About } from "@/components/About";
import { Testimonials } from "@/components/Testimonials";
import { Experience } from "@/components/Experience";
import { ValueProp } from "@/components/ValueProp";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { SensorBotCanvas } from "@/components/ui/SensorBotCanvas";

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main id="main">
        <Hero />
        <LogoRail />
        <CaseGrid />
        <PipelineSection />
        <About />
        <Testimonials />
        <Experience />
        <ValueProp />
        <Contact />
      </main>
      <SensorBotCanvas />
      <Footer />
    </>
  );
}
