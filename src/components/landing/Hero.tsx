import { Briefcase, MapPin, Users } from "lucide-react";
import kaabaIcon from "@/assets/landmarks/kaaba.png";
import eiffelIcon from "@/assets/landmarks/eiffel.png";
import pyramidsIcon from "@/assets/landmarks/pyramids.png";
import pisaIcon from "@/assets/landmarks/pisa.png";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePartners } from "@/hooks/usePartners";
import PartnersScroller from "./PartnersScroller";
import HeroRotatingTitle from "./HeroRotatingTitle";
import HeroRotatingCTA from "./HeroRotatingCTA";
import HeroRotatingImage from "./HeroRotatingImage";

const Hero = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { partners, loading } = usePartners();

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

            <HeroRotatingTitle />

            {/* CTA + Avatars */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
              <HeroRotatingCTA />
              
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

              {/* Main Subject Image (memoized to isolate rotation re-renders) */}
              <HeroRotatingImage />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
