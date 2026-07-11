import { Helmet } from "react-helmet-async";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo-schemas";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string; // route path with leading slash, e.g. "/about"
  image?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
  /** @deprecated meta keywords are ignored by search engines; accepted for compatibility, no longer rendered */
  keywords?: string[];
  jsonLd?: Record<string, any> | Record<string, any>[];
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Per-route metadata + JSON-LD injection.
 * Place once near the top of each page component.
 */
const SEOHead = ({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
  jsonLd,
  publishedTime,
  modifiedTime,
}: SEOHeadProps) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@marhabaDMC" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;