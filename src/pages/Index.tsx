import { lazy, Suspense } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { prefetchIdleRoutes } from "@/lib/route-prefetch";
import {
  organizationSchema,
  websiteSchema,
  faqPageSchema,
  speakableSchema,
  serviceSchema,
  productOfferSchema,
  breadcrumbSchema,
  SITE_URL,
} from "@/lib/seo-schemas";

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

  // Warm up the most common next-route chunks during browser idle time
  // so navigation to /about, /blog, /categories-destinations feels instant.
  useEffect(() => {
    prefetchIdleRoutes(["/about", "/categories-destinations", "/blog"]);
  }, []);

  const homepageFaqs = [
    { question: "How long does it take to set up my portal?", answer: "Most clients have their branded portal live within 2-3 business days, including domain setup, branding, and API integration." },
    { question: "Can I use my own domain name?", answer: "Yes. You can use any custom domain (e.g., book.youragency.com). DNS and SSL setup are included." },
    { question: "What APIs are included?", answer: "Flight, Hotel (1M+ properties), Visa (50+ countries), and Activities APIs are all included in the annual subscription." },
    { question: "How does the AI Sales Assistant work?", answer: "Multilingual chatbot and voicebot that handles inquiries 24/7 in Hindi, English and more — billed on consumption (per conversation)." },
    { question: "Is there a limit on agents or customers?", answer: "No — unlimited B2B agents and B2C customers, no per-user fees." },
    { question: "What kind of support do you provide?", answer: "Six-day technical support via email, phone, and WhatsApp, plus a dedicated account manager for the first 30 days." },
  ];

  const jsonLd = [
    organizationSchema(),
    websiteSchema(),
    breadcrumbSchema([{ name: "Home", url: SITE_URL }]),
    faqPageSchema(homepageFaqs),
    speakableSchema(["h1", "#faq h3", "#faq [data-radix-collection-item]"]),
    serviceSchema("White Label Travel Portal", "Branded travel booking portal with Flight, Hotel, Visa, and Activities APIs.", `${SITE_URL}/#features`),
    serviceSchema("AI Sales Assistant", "Multilingual chatbot and voicebot that converts visitors 24/7."),
    productOfferSchema("Launch Plan", "Annual white-label travel portal subscription — Launch tier.", "24999"),
    productOfferSchema("Growth Plan", "Annual white-label travel portal subscription — Growth tier (most popular).", "29999"),
    productOfferSchema("Authority Plan", "Annual white-label travel portal subscription — Authority tier.", "34999"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="White Label Travel Portal for Agents & Entrepreneurs"
        description="Start your own travel business in 24 hours. White label portal, Flight + Hotel + Visa APIs, AI sales assistant, and Hajj/Umrah modules — built for agents and entrepreneurs."
        path="/"
        keywords={["white label travel portal", "B2B travel platform", "travel agent software", "halal tourism", "Umrah portal", "AI travel assistant"]}
        jsonLd={jsonLd}
      />
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

