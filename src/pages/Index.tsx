import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TrustedBy from "@/components/landing/TrustedBy";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import ProductShowcase from "@/components/landing/ProductShowcase";
import Portals from "@/components/landing/Portals";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";
import StickyCTA from "@/components/landing/StickyCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <TrustedBy />
        <Stats />
        <Features />
        <ProductShowcase />
        <Portals />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <StickyCTA />
    </div>
  );
};

export default Index;
