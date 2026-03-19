import { lazy, Suspense } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Above-the-fold: load eagerly
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";

// Below-the-fold: lazy load to reduce initial JS bundle and improve TTI
const HeroBenefits = lazy(() => import("@/components/landing/HeroBenefits"));
const TrustedBy = lazy(() => import("@/components/landing/TrustedBy"));
const Stats = lazy(() => import("@/components/landing/Stats"));
const Features = lazy(() => import("@/components/landing/Features"));
const CompetitiveEdge = lazy(() => import("@/components/landing/CompetitiveEdge"));
const ProductShowcase = lazy(() => import("@/components/landing/ProductShowcase"));
const HowItWorks = lazy(() => import("@/components/landing/HowItWorks"));
const Pricing = lazy(() => import("@/components/landing/Pricing"));
const Testimonials = lazy(() => import("@/components/landing/Testimonials"));
const FAQ = lazy(() => import("@/components/landing/FAQ"));
const Footer = lazy(() => import("@/components/landing/Footer"));
const FloatingWhatsApp = lazy(() => import("@/components/landing/FloatingWhatsApp"));
const StickyCTA = lazy(() => import("@/components/landing/StickyCTA"));

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Suspense fallback={null}>
          <TrustedBy />
          <Stats />
          <HeroBenefits />
          <Features />
          <CompetitiveEdge />
          <ProductShowcase />
          <HowItWorks />
          <Pricing />
          <Testimonials />
          <FAQ />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        <FloatingWhatsApp />
        <StickyCTA />
      </Suspense>
    </div>
  );
};

export default Index;

