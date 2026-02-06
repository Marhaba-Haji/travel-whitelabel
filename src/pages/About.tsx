import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";
import AboutHero from "@/components/about/AboutHero";
import WhoWeAre from "@/components/about/WhoWeAre";
import HalalFocus from "@/components/about/HalalFocus";
import Itineraries from "@/components/about/Itineraries";
import ContentSupplier from "@/components/about/ContentSupplier";
import TechPlatform from "@/components/about/TechPlatform";
import ContractedInventory from "@/components/about/ContractedInventory";
import AIPowered from "@/components/about/AIPowered";
import TrainingSupport from "@/components/about/TrainingSupport";
import HospitalityTech from "@/components/about/HospitalityTech";
import Philosophy from "@/components/about/Philosophy";
import WorkWithUs from "@/components/about/WorkWithUs";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <AboutHero />
        <WhoWeAre />
        <HalalFocus />
        <Itineraries />
        <ContentSupplier />
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
