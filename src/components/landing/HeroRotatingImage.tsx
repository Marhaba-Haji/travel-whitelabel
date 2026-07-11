import { memo, useEffect, useRef, useState } from "react";
import { useHeroImages } from "@/hooks/useHeroImages";
import {
  buildSupabaseSrcSet,
  transformSupabaseImage,
} from "@/lib/supabase-image";

const HERO_WIDTHS = [400, 600, 900, 1200];
const HERO_SIZES =
  "(max-width: 640px) 320px, (max-width: 1024px) 500px, 600px";

type DisplayedHeroImage = {
  id: string;
  src: string;
  alt: string;
};

/**
 * Owns the rotating hero image + crossfade transition. Memoized so that
 * other parts of the Hero (CTA, partners, floating cards) do not re-render
 * on every rotation tick.
 */
const HeroRotatingImageInner = () => {
  const { heroImage, loading: heroImageLoading } = useHeroImages();
  const [displayedHeroImage, setDisplayedHeroImage] = useState<DisplayedHeroImage>({
    id: "hero-image-fallback",
    src: "/assets/hero_woman_tickets.webp",
    alt: "Hero travel illustration",
  });
  const [nextHeroImage, setNextHeroImage] = useState<DisplayedHeroImage | null>(null);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const nextSource = heroImage?.image_url;
    const nextId = heroImage?.id;
    const nextAlt = heroImage?.alt_text || "Hero travel illustration";

    if (!nextSource || !nextId || nextSource === displayedHeroImage.src) {
      return;
    }

    const preloaded = new window.Image();
    preloaded.src = transformSupabaseImage(nextSource, { width: 900 }) || nextSource;
    preloaded.onload = () => {
      const preparedNextImage = { id: nextId, src: nextSource, alt: nextAlt };
      setNextHeroImage(preparedNextImage);
      setIsImageTransitioning(true);

      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = window.setTimeout(() => {
        setDisplayedHeroImage(preparedNextImage);
        setNextHeroImage(null);
        setIsImageTransitioning(false);
      }, 700);
    };
  }, [heroImage?.id, heroImage?.image_url, heroImage?.alt_text, displayedHeroImage.src]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  if (heroImageLoading && !displayedHeroImage.src) {
    return (
      <div className="w-[85%] sm:w-full aspect-[5/6] rounded-3xl bg-white/70 animate-pulse shadow-lg sm:shadow-2xl" />
    );
  }

  // The container owns a fixed 5:6 aspect ratio and both images fill it with
  // object-contain, so rotating between images of different proportions can
  // never change the hero's height (which shifted every section below it).
  return (
    <div className="relative w-[85%] sm:w-full z-10 aspect-[5/6]">
      <img
        key={displayedHeroImage.id}
        src={transformSupabaseImage(displayedHeroImage.src, { width: 900 }) || displayedHeroImage.src}
        srcSet={buildSupabaseSrcSet(displayedHeroImage.src, HERO_WIDTHS) || undefined}
        sizes={HERO_SIZES}
        alt={displayedHeroImage.alt}
        width={500}
        height={600}
        {...({ fetchpriority: "high" } as Record<string, string>)}
        className={`absolute inset-0 w-full h-full object-contain drop-shadow-lg sm:drop-shadow-2xl transition-all duration-700 ease-out ${
          isImageTransitioning ? "opacity-0 scale-[0.985]" : "opacity-100 scale-100"
        }`}
      />
      {nextHeroImage && (
        <img
          src={transformSupabaseImage(nextHeroImage.src, { width: 900 }) || nextHeroImage.src}
          srcSet={buildSupabaseSrcSet(nextHeroImage.src, HERO_WIDTHS) || undefined}
          sizes={HERO_SIZES}
          alt={nextHeroImage.alt}
          width={500}
          height={600}
          className={`absolute inset-0 w-full h-full object-contain drop-shadow-lg sm:drop-shadow-2xl pointer-events-none transition-all duration-700 ease-out ${
            isImageTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-[1.015]"
          }`}
        />
      )}
    </div>
  );
};

export const HeroRotatingImage = memo(HeroRotatingImageInner);
export default HeroRotatingImage;