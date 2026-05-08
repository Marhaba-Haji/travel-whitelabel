import { memo } from "react";
import type { Partner } from "@/hooks/usePartners";

// Use Supabase image transformation to serve a small partner logo instead of full-size PNG
const optimizePartnerLogo = (url: string): string => {
  if (!url || !url.includes("/storage/v1/object/public/")) return url;
  const transformed = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  return `${transformed}?width=96&height=96&resize=contain&quality=70`;
};

interface PartnersScrollerProps {
  partners: Partner[];
  loading: boolean;
}

/**
 * Isolated scroller component. Memoized with a custom comparator so that
 * re-renders of the parent (e.g. hero image rotation) never re-mount this
 * component or restart the CSS animation.
 */
const PartnersScroller = memo(
  ({ partners, loading }: PartnersScrollerProps) => {
    if (loading) {
      return (
        <div className="flex gap-14 h-16 animate-pulse">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-shrink-0 h-12 w-32 bg-gray-200 rounded" />
          ))}
        </div>
      );
    }

    const renderItem = (partner: Partner, suffix: string) => (
      <div key={`${partner.id}-${suffix}`} className="flex-shrink-0 flex items-center gap-3">
        {partner.logo_url ? (
          <img
            src={optimizePartnerLogo(partner.logo_url)}
            alt={partner.name}
            width={48}
            height={48}
            loading="eager"
            decoding="async"
            className="h-12 w-12 rounded-lg object-contain bg-white shadow-sm ring-1 ring-gray-100 p-1"
          />
        ) : (
          <div
            className={`h-12 w-12 ${partner.color_badge} rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm`}
          >
            {partner.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </div>
        )}
        <span className="text-base font-semibold text-gray-700 whitespace-nowrap">{partner.name}</span>
      </div>
    );

    // 5 seconds of screen time per logo — guarantees every partner gets equal exposure
    // and the loop length always scales with the number of partners coming from the DB.
    const duration = Math.max(10, partners.length * 5);

    return (
      <div
        className="flex gap-14 items-center animate-scroll-cross will-change-transform"
        style={{ animationDuration: `${duration}s` }}
      >
        {partners.map((p) => renderItem(p, "1"))}
        {partners.map((p) => renderItem(p, "2"))}
      </div>
    );
  },
  (prev, next) => {
    if (prev.loading !== next.loading) return false;
    if (prev.partners === next.partners) return true;
    if (prev.partners.length !== next.partners.length) return false;
    // Compare by id signature so a stable list (same partners) skips re-render
    for (let i = 0; i < prev.partners.length; i++) {
      if (prev.partners[i].id !== next.partners[i].id) return false;
    }
    return true;
  },
);
PartnersScroller.displayName = "PartnersScroller";

export default PartnersScroller;