/**
 * Centralised JSON-LD schema builders for SEO + GSO (Generative Search Optimization).
 * All builders return plain JS objects — stringify in the consuming Helmet.
 */

export const SITE_URL = "https://marhabadmc.com";
export const SITE_NAME = "Marhaba DMC";
export const ORG_LEGAL_NAME = "marhabaDMC";
export const DEFAULT_OG_IMAGE =
  "https://res.cloudinary.com/doxoxzz02/image/upload/v1771003247/Global_Halal_Destination_Management_Company_ydzhvo.jpg";

export const SOCIAL_PROFILES = [
  "https://www.linkedin.com/company/marhabadmc",
  "https://twitter.com/marhabaDMC",
  "https://www.instagram.com/marhabadmc",
  "https://www.facebook.com/marhabadmc",
  "https://www.youtube.com/@marhabadmc",
];

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: ORG_LEGAL_NAME,
  alternateName: ORG_LEGAL_NAME,
  description:
    "White-label travel portal for travel agents and entrepreneurs. Halal-friendly destinations, Hajj/Umrah modules, and AI sales tools.",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/marhaba-dmc-logo.png`,
  image: DEFAULT_OG_IMAGE,
  email: "hello@marhabadmc.com",
  telephone: "+91-9008447887",
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Paramount Avenue, 63/1, 3rd floor, mosque road cross, frazer town",
    addressLocality: "Bangalore",
    addressRegion: "KA",
    postalCode: "560005",
    addressCountry: "IN",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: "+91-9008447887",
      email: "hello@marhabadmc.com",
      availableLanguage: ["English", "Hindi", "Arabic"],
      areaServed: "Worldwide",
    },
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "sales@marhabadmc.com",
      availableLanguage: ["English", "Hindi"],
    },
  ],
  sameAs: SOCIAL_PROFILES,
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.url,
  })),
});

export const faqPageSchema = (
  faqs: { question: string; answer: string }[],
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});

export const speakableSchema = (cssSelectors: string[]) => ({
  "@context": "https://schema.org",
  "@type": "SpeakableSpecification",
  cssSelector: cssSelectors,
});

export const serviceSchema = (
  name: string,
  description: string,
  url?: string,
) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  description,
  url: url || SITE_URL,
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: "Worldwide",
});

export const productOfferSchema = (
  name: string,
  description: string,
  price: string,
  priceCurrency = "INR",
) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name,
  description,
  brand: { "@type": "Brand", name: SITE_NAME },
  offers: {
    "@type": "Offer",
    price,
    priceCurrency,
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/signup`,
    seller: { "@id": `${SITE_URL}/#organization` },
  },
});

export const articleSchema = (post: {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  published_at: string | null;
  updated_at?: string | null;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  image: post.cover_image_url || DEFAULT_OG_IMAGE,
  url: `${SITE_URL}/blog/${post.slug}`,
  datePublished: post.published_at,
  dateModified: post.updated_at || post.published_at,
  author: {
    "@type": "Organization",
    name: post.author_name || SITE_NAME,
    url: SITE_URL,
  },
  publisher: { "@id": `${SITE_URL}/#organization` },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${SITE_URL}/blog/${post.slug}`,
  },
  description: post.excerpt || "",
});