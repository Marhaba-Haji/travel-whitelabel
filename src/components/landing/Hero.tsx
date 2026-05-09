import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Users } from "lucide-react";
import kaabaIcon from "@/assets/landmarks/kaaba.png";
import eiffelIcon from "@/assets/landmarks/eiffel.png";
import pyramidsIcon from "@/assets/landmarks/pyramids.png";
import pisaIcon from "@/assets/landmarks/pisa.png";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePartners } from "@/hooks/usePartners";
import { useHeroContent } from "@/hooks/useHeroContent";
import { useHeroImages } from "@/hooks/useHeroImages";
import PartnersScroller from "./PartnersScroller";
import { transformSupabaseImage, buildSupabaseSrcSet } from "@/lib/supabase-image";

const HERO_WIDTHS = [400, 600, 900, 1200];
const HERO_SIZES = "(max-width: 640px) 320px, (max-width: 1024px) 500px, 600px";

type DisplayedHeroImage = {
  id: string;
  src: string;
  alt: string;
};


const Hero = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { partners, loading } = usePartners();
  const { heroContent, loading: heroLoading } = useHeroContent();
  const { heroImage, loading: heroImageLoading } = useHeroImages();
  const [displayedHeroImage, setDisplayedHeroImage] = useState<DisplayedHeroImage>({
    id: 'hero-image-fallback',
    src: '/assets/hero_woman_tickets.webp',
    alt: 'Hero travel illustration',
  });
  const [nextHeroImage, setNextHeroImage] = useState<DisplayedHeroImage | null>(null);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const nextSource = heroImage?.image_url;
    const nextId = heroImage?.id;
    const nextAlt = heroImage?.alt_text || 'Hero travel illustration';

    if (!nextSource || !nextId || nextSource === displayedHeroImage.src) {
      return;
    }

    const preloaded = new window.Image();
    // Preload the medium variant (matches ~600w typical hero render width)
    preloaded.src = transformSupabaseImage(nextSource, { width: 900 }) || nextSource;
    preloaded.onload = () => {
      const preparedNextImage = {
        id: nextId,
        src: nextSource,
        alt: nextAlt,
      };

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

  // Render title with highlighted subtitle
  const renderTitle = () => {
    if (!heroContent) {
      // Fallback title with default purple highlight
      return (
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[72px] font-bold text-gray-900 mb-6 font-poppins leading-[1.1] tracking-tight">
          Travel <span style={{ color: '#B968C7' }} className="font-bold">top destination</span>
          <br />
          of the world
        </h1>
      );
    }

    const { title, subtitle, subtitle_color } = heroContent;
    const parts = title.split(subtitle);

    return (
      <h1 key={heroContent?.id || 'hero-fallback'} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[72px] font-bold text-gray-900 mb-6 font-poppins leading-[1.1] tracking-tight">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <>
                <span style={{ color: subtitle_color }} className="font-bold">
                  {subtitle}
                </span>
                <br />
              </>
            )}
          </span>
        ))}
      </h1>
    );
  };

  return (
    <section className="relative pt-24 pb-8 lg:pt-32 lg:pb-24 overflow-hidden min-h-screen flex items-center bg-white w-full">
      
      {/* Decorative dashed lines & planes (Background) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden lg:block">
        <svg viewBox="0 0 1440 800" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left curve */}
          <path d="M -100 400 C 100 600 400 600 600 400" stroke="#F472B6" strokeWidth="1.5" strokeDasharray="4 6" />
          <path d="M 600 400 L 590 390 M 600 400 L 580 405" stroke="#F472B6" strokeWidth="2" /> {/* Mock Plane */}
          
          {/* Right curve */}
          <path d="M 800 200 C 1000 0 1300 100 1500 300" stroke="#F472B6" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="1250" cy="220" r="4" fill="#F472B6" /> {/* Map Pin Dot */}
          <path d="M 1250 224 L 1250 234" stroke="#F472B6" strokeWidth="1.5" />
        </svg>
      </div>

      <div
        ref={heroRef}
        className={`container mx-auto px-4 relative z-10 opacity-0 ${heroVisible ? "animate-fade-in" : ""}`}
      >
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column — Text & CTA */}
          <div className="w-full text-center lg:text-left flex flex-col items-center lg:items-start pt-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-sm mb-6 border border-gray-100">
              <span className="font-bold text-sm text-[#412A86]">Explore the world!</span>
              <Briefcase className="w-4 h-4 text-[#412A86]" />
            </div>

            {heroLoading ? (
              <div className="h-24 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
            ) : (
              <div className="animate-fade-in">
                {renderTitle()}
              </div>
            )}

            {heroLoading ? (
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-10 w-full max-w-lg"></div>
            ) : (
              <p key={heroContent?.id || 'hero-description'} className="text-base sm:text-lg md:text-xl text-gray-500 mb-10 font-medium max-w-lg leading-relaxed animate-fade-in">
                {heroContent?.description || 'Where adventure meets comfort. We create unforgettable travel experiences'}
              </p>
            )}

            {/* CTA + Avatars */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
              <Button
                size="lg"
                asChild
                className="h-14 rounded-full text-base font-semibold px-8 bg-[#412A86] hover:bg-[#412A86]/90 text-white shadow-lg transition-shadow"
              >
                <a key={heroContent?.id || 'hero-cta'} href={heroContent?.cta_url || '/signup'}>
                  {heroContent?.cta_text || 'Get Started'}
                </a>
              </Button>
              
              <div className="flex items-center gap-3 bg-white/95 sm:bg-white border border-gray-100 shadow-sm pl-2 pr-5 py-2 rounded-full h-16">
                <div className="flex -space-x-2.5">
                  {[
                    { src: kaabaIcon, alt: "Kaaba, Makkah", bg: "bg-slate-100" },
                    { src: eiffelIcon, alt: "Eiffel Tower, Paris", bg: "bg-sky-50" },
                    { src: pyramidsIcon, alt: "Pyramids of Giza", bg: "bg-amber-50" },
                    { src: pisaIcon, alt: "Leaning Tower of Pisa", bg: "bg-emerald-50" },
                  ].map((d) => (
                    <div
                      key={d.alt}
                      title={d.alt}
                      className={`w-12 h-12 rounded-full border-2 border-white ${d.bg} flex items-center justify-center shadow-sm overflow-hidden ring-1 ring-slate-900/5`}
                    >
                      <img
                        src={d.src}
                        alt={d.alt}
                        width={44}
                        height={44}
                        loading="lazy"
                        decoding="async"
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-slate-700 font-medium max-w-[200px] leading-tight">
                  <span className="font-bold text-slate-900">5,000+</span> travelers discovering destinations every minute
                </span>
              </div>
            </div>

            {/* Partner Logos — Single Line Scrolling Animation (Database-driven) */}
            <div className="w-full overflow-hidden relative py-3 min-h-[5rem]">
              <PartnersScroller partners={partners} loading={loading} />
            </div>
          </div>

          {/* Right Column — Globe illustration & Floating Cards */}
          <div className="relative mt-12 lg:mt-0 flex justify-center items-center w-full">
            
            <div className="relative w-full max-w-[500px] z-10 flex justify-center">
              <div
                aria-hidden="true"
                className="absolute inset-6 sm:inset-4 rounded-[3rem] blur-2xl sm:blur-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 30%, rgba(65, 42, 134, 0.16) 0%, rgba(91, 120, 255, 0.10) 36%, rgba(255, 255, 255, 0) 72%)",
                }}
              />
              
              {/* Floating Card: Top Places */}
              <div
                className="absolute bottom-[20%] -left-[14%] sm:-left-[16%] lg:-left-[14%] bg-white/90 sm:bg-white/80 backdrop-blur-sm sm:backdrop-blur-xl rounded-full pl-2.5 pr-4 py-2 sm:pl-3 sm:pr-5 sm:py-2.5 shadow-md sm:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/10 z-20 flex items-center gap-2.5 sm:gap-3 animate-float-slow scale-75 sm:scale-100 origin-bottom-left"
                style={{ animationDelay: "0s" }}
              >
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 ring-1 ring-amber-200">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-slate-900 tracking-tight">Top Places</span>
              </div>

              {/* Floating Card: Earning Potential */}
              <div
                className="absolute top-[20%] -right-[14%] sm:-right-[18%] lg:-right-[20%] bg-white/90 sm:bg-white/80 backdrop-blur-sm sm:backdrop-blur-xl rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md sm:shadow-[0_22px_50px_-20px_rgba(93,80,198,0.35)] ring-1 ring-slate-900/10 z-20 animate-float-slow w-[150px] sm:w-[190px] text-left scale-75 sm:scale-100 origin-top-right"
                style={{ animationDelay: "0.35s" }}
              >
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-slate-600 font-semibold mb-1">Earning Potential</p>
                <p className="text-[#5D50C6] font-bold text-base sm:text-lg leading-tight">₹50,000<span className="text-slate-400 font-medium text-xs sm:text-sm">+/mo</span></p>
              </div>

              {/* Floating Card: Customers */}
              <div
                className="absolute bottom-[0%] -right-[12%] sm:-right-[10%] lg:-right-[8%] bg-white/90 sm:bg-white/80 backdrop-blur-sm sm:backdrop-blur-xl rounded-full pl-2.5 pr-4 py-2 sm:pl-3 sm:pr-5 sm:py-2.5 shadow-md sm:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/10 z-20 flex items-center gap-2.5 sm:gap-3 animate-float-slow scale-75 sm:scale-100 origin-bottom-right"
                style={{ animationDelay: "0.7s" }}
              >
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 ring-1 ring-emerald-200">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-slate-900 tracking-tight">2,000+ Customers</span>
              </div>

              {/* Main Subject Image */}
              {heroImageLoading && !displayedHeroImage.src ? (
                <div className="w-[85%] sm:w-full h-[420px] rounded-3xl bg-white/70 animate-pulse shadow-lg sm:shadow-2xl" />
              ) : (
                <div className="relative w-[85%] sm:w-full z-10">
                  <img
                    key={displayedHeroImage.id}
                    src={displayedHeroImage.src}
                    alt={displayedHeroImage.alt}
                    width={500}
                    height={600}
                    {...({ fetchpriority: "high" } as Record<string, string>)}
                    className={`w-full h-auto object-contain relative drop-shadow-lg sm:drop-shadow-2xl transition-all duration-700 ease-out ${
                      isImageTransitioning ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'
                    }`}
                  />

                  {nextHeroImage && (
                    <img
                      src={nextHeroImage.src}
                      alt={nextHeroImage.alt}
                      width={500}
                      height={600}
                      className={`absolute inset-0 w-full h-full object-contain drop-shadow-lg sm:drop-shadow-2xl pointer-events-none transition-all duration-700 ease-out ${
                        isImageTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.015]'
                      }`}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
