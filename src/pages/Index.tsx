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
import { useContactSettings } from "@/hooks/useContactSettings";
import { useHomeFaqs } from "@/hooks/useHomeFaqs";
import { DEFAULT_HOME_FAQS } from "@/lib/home-faqs";

// Above-the-fold: load eagerly
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";

// Below-the-fold: lazy load to reduce initial JS bundle and improve TTI
const HeroBenefits = lazy(() => import("@/components/landing/HeroBenefits"));
const TrustedBy = lazy(() => import("@/components/landing/TrustedBy"));
const Stats = lazy(() => import("@/components/landing/Stats"));
const Features = lazy(() => import("@/components/landing/Features"));
const CompetitiveEdge = lazy(() => import("@/components/landing/CompetitiveEdge"));
const OurServices = lazy(() => import("@/components/landing/OurServices"));
const ProductShowcase = lazy(() => import("@/components/landing/ProductShowcase"));
const HowItWorks = lazy(() => import("@/components/landing/HowItWorks"));
const LiveTravelBanner = lazy(() => import("@/components/landing/LiveTravelBanner"));
const Pricing = lazy(() => import("@/components/landing/Pricing"));
const Inspiration = lazy(() => import("@/components/landing/Inspiration"));
const Testimonials = lazy(() => import("@/components/landing/Testimonials"));
const FAQ = lazy(() => import("@/components/landing/FAQ"));
const Footer = lazy(() => import("@/components/landing/Footer"));
const FloatingWhatsApp = lazy(() => import("@/components/landing/FloatingWhatsApp"));
const StickyCTA = lazy(() => import("@/components/landing/StickyCTA"));

const Index = () => {
  const location = useLocation();
  const { email, phone, whatsapp, address } = useContactSettings();
  const { faqs: dbFaqs } = useHomeFaqs();

  useEffect(() => {
    if (location.hash) {
      // Lazy-loaded sections (e.g. #contact in Footer) may not be in the DOM
      // yet, so we poll briefly until the element appears.
      let attempts = 0;
      const maxAttempts = 20;
      const interval = setInterval(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          clearInterval(interval);
          element.scrollIntoView({ behavior: "smooth" });
        } else if (++attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [location.hash]);

  // Warm up the most common next-route chunks during browser idle time
  // so navigation to /about, /blog, /categories-destinations feels instant.
  useEffect(() => {
    // Note: /categories-destinations is intentionally excluded — its chunk
    // is very large (bundles country flag SVGs) and prefetching it tanks
    // homepage TTI on slower devices. It will load on demand on click.
    prefetchIdleRoutes(["/about", "/blog", "/book-demo", "/contact", "/signup", "/login"]);
  }, []);

  const homepageFaqs =
    dbFaqs.length > 0
      ? dbFaqs.map((faq) => ({ question: faq.question, answer: faq.answer }))
      : DEFAULT_HOME_FAQS;

  const jsonLd = [
    organizationSchema({ email, phone, whatsapp, address }),
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
      <main className="flex flex-col gap-[24px] bg-white w-full overflow-hidden">
        <Hero />
        <Suspense fallback={null}>
          <HeroBenefits />
          <CompetitiveEdge />
          <OurServices />
          <Stats />
          <Features />
          <ProductShowcase />
          <HowItWorks />
          <LiveTravelBanner />
          <Testimonials />
          <Inspiration />
          <Pricing />
          <FAQ faqs={homepageFaqs} />
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

