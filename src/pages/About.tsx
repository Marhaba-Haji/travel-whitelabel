import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";
import AboutHero from "@/components/about/AboutHero";
import AboutStats from "@/components/about/AboutStats";
import WhoWeAre from "@/components/about/WhoWeAre";
import AboutTestimonials from "@/components/about/AboutTestimonials";
import HalalFocus from "@/components/about/HalalFocus";
import TechPlatform from "@/components/about/TechPlatform";
import ContractedInventory from "@/components/about/ContractedInventory";
import AIPowered from "@/components/about/AIPowered";
import TrainingSupport from "@/components/about/TrainingSupport";
import HospitalityTech from "@/components/about/HospitalityTech";
import Philosophy from "@/components/about/Philosophy";
import WorkWithUs from "@/components/about/WorkWithUs";
import { useEffect } from "react";

const About = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <AboutHero />
        <AboutStats />
        <WhoWeAre />
        <AboutTestimonials />
        <HalalFocus />
        <TechPlatform />
        <ContractedInventory />
        <AIPowered />
        <TrainingSupport />
        <HospitalityTech />
        <Philosophy />
        <WorkWithUs />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default About;
