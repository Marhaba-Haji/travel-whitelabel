import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Users } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePartners } from "@/hooks/usePartners";
import { useHeroContent } from "@/hooks/useHeroContent";
import { useHeroImages } from "@/hooks/useHeroImages";

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
    src: '/assets/hero_woman_tickets.png',
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
    preloaded.src = nextSource;
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
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start pt-10">
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
              <p key={heroContent?.id || 'hero-description'} className="text-base sm:text-lg md:text-xl text-gray-500 mb-10 font-medium w-full max-w-lg leading-relaxed animate-fade-in px-2 lg:px-0">
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
              
              <div className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm px-6 py-2 rounded-full h-14">
                <div className="flex -space-x-3">
                  <img src="https://i.pravatar.cc/100?img=1" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="User" />
                  <img src="https://i.pravatar.cc/100?img=2" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="User" />
                  <img src="https://i.pravatar.cc/100?img=3" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="User" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#412A86] flex items-center justify-center shadow-sm z-10">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium max-w-[140px] leading-tight">
                  <span className="font-bold text-gray-900">5,000+</span> travelers looking for agents
                </span>
              </div>
            </div>

            {/* Partner Logos — Single Line Scrolling Animation (Database-driven) */}
            <div className="w-full overflow-hidden relative">
              {loading ? (
                <div className="flex gap-12 h-8 animate-pulse">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 h-6 w-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-12 animate-scroll-cross">
                  {/* First set */}
                  {partners.map((partner) => (
                    <div key={`${partner.id}-1`} className="flex-shrink-0 flex items-center gap-2">
                      {partner.logo_url ? (
                        <img src={partner.logo_url} alt={partner.name} className="h-6 w-6 rounded" />
                      ) : (
                        <div className={`h-6 w-6 ${partner.color_badge} rounded flex items-center justify-center text-white text-xs font-bold`}>
                          {partner.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{partner.name}</span>
                    </div>
                  ))}

                  {/* Duplicate for seamless loop */}
                  {partners.map((partner) => (
                    <div key={`${partner.id}-2`} className="flex-shrink-0 flex items-center gap-2">
                      {partner.logo_url ? (
                        <img src={partner.logo_url} alt={partner.name} className="h-6 w-6 rounded" />
                      ) : (
                        <div className={`h-6 w-6 ${partner.color_badge} rounded flex items-center justify-center text-white text-xs font-bold`}>
                          {partner.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{partner.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Globe illustration & Floating Cards */}
          <div className="relative mt-12 lg:mt-0 flex justify-center items-center w-full">
            
            {/* The Blue Circle Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-[#2D9BFC] rounded-full z-0 overflow-hidden">
              {/* Faint world map inside the circle */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1024px-World_map_-_low_resolution.svg.png')] bg-center bg-contain bg-no-repeat"></div>
            </div>

            <div className="relative w-full max-w-[500px] z-10 flex justify-center">
              
              {/* Floating Card: Top Places */}
              <div className="absolute bottom-[20%] -left-[5%] sm:-left-[10%] bg-white rounded-full px-3 py-2 sm:px-5 sm:py-3 shadow-xl z-20 flex items-center gap-2 sm:gap-3 animate-float-slow scale-75 sm:scale-100 origin-bottom-left">
                <div className="flex items-center justify-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400/20" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-gray-900">Top Places</span>
              </div>

              {/* Floating Card: Earning Potential */}
              <div className="absolute top-[30%] -right-[5%] sm:-right-[15%] bg-white rounded-xl p-2 sm:p-4 shadow-xl z-20 animate-float w-[140px] sm:w-[180px] text-center border border-gray-50 scale-75 sm:scale-100 origin-top-right">
                <p className="text-[#5D50C6] font-bold text-sm sm:text-base mb-1">₹50,000+/mo</p>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Earning Potential</p>
              </div>

              {/* Floating Card: Customers */}
              <div className="absolute bottom-[10%] -right-[5%] sm:-right-[5%] bg-white rounded-full px-3 py-2 sm:px-5 sm:py-3 shadow-xl z-20 flex items-center gap-2 sm:gap-3 animate-float-slow scale-75 sm:scale-100 origin-bottom-right" style={{ animationDelay: '1s' }}>
                <div className="flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400/20" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-gray-900">2,000+ Customers</span>
              </div>

              {/* Main Subject Image */}
              {heroImageLoading && !displayedHeroImage.src ? (
                <div className="w-[85%] sm:w-full h-[420px] rounded-3xl bg-white/70 animate-pulse shadow-2xl" />
              ) : (
                <div className="relative w-[85%] sm:w-full z-10">
                  <img
                    key={displayedHeroImage.id}
                    src={displayedHeroImage.src}
                    alt={displayedHeroImage.alt}
                    width={500}
                    height={600}
                    fetchPriority="high"
                    className={`w-full h-auto object-contain relative drop-shadow-2xl transition-all duration-700 ease-out ${
                      isImageTransitioning ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'
                    }`}
                  />

                  {nextHeroImage && (
                    <img
                      src={nextHeroImage.src}
                      alt={nextHeroImage.alt}
                      width={500}
                      height={600}
                      className={`absolute inset-0 w-full h-full object-contain drop-shadow-2xl pointer-events-none transition-all duration-700 ease-out ${
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
