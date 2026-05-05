import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Users } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Hero = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();

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

            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-bold text-gray-900 mb-6 font-poppins leading-[1.1] tracking-tight">
              Travel <span className="text-[#B968C7]">top destination</span><br className="hidden md:block" /> of the world
            </h1>

            <p className="text-lg md:text-xl text-gray-500 mb-10 font-medium max-w-lg leading-relaxed">
              Where adventure meets comfort. We create unforgettable travel experiences
            </p>

            {/* CTA + Avatars */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
              <Button
                size="lg"
                asChild
                className="h-14 rounded-full text-base font-semibold px-8 bg-[#412A86] hover:bg-[#412A86]/90 text-white shadow-lg transition-shadow"
              >
                <a href="/signup">
                  Get Started
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

            {/* Partner Logos */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <img src="/assets/expedia.png" alt="Expedia" className="h-6 object-contain" onError={(e) => e.currentTarget.src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Expedia_logo.svg/1024px-Expedia_logo.svg.png"} />
              <img src="/assets/tripadvisor.png" alt="Tripadvisor" className="h-6 object-contain" onError={(e) => e.currentTarget.src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/TripAdvisor_Logo.svg/1024px-TripAdvisor_Logo.svg.png"} />
              <img src="/assets/booking.png" alt="Booking.com" className="h-6 object-contain" onError={(e) => e.currentTarget.src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Booking.com_logo.svg/1024px-Booking.com_logo.svg.png"} />
              <img src="/assets/airbnb.png" alt="Airbnb" className="h-6 object-contain" onError={(e) => e.currentTarget.src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/1024px-Airbnb_Logo_B%C3%A9lo.svg.png"} />
            </div>
          </div>

          {/* Right Column — Globe illustration & Floating Cards */}
          <div className="relative mt-12 lg:mt-0 flex justify-center items-center w-full">
            
            {/* The Blue Circle Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-[#2D9BFC] rounded-full z-0 overflow-hidden">
              {/* Faint world map inside the circle */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1024px-World_map_-_low_resolution.svg.png')] bg-center bg-contain bg-no-repeat"></div>
            </div>

            <div className="relative w-full max-w-[500px] z-10 flex justify-center">
              
              {/* Floating Card: Top Places */}
              <div className="absolute bottom-[20%] left-0 sm:-left-[10%] bg-white rounded-full px-5 py-3 shadow-xl z-20 flex items-center gap-3 animate-float-slow">
                <div className="flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                </div>
                <span className="font-bold text-sm text-gray-900">Top Places</span>
              </div>

              {/* Floating Card: Earning Potential */}
              <div className="absolute top-[30%] right-0 sm:-right-[15%] bg-white rounded-xl p-4 shadow-xl z-20 animate-float w-[180px] text-center border border-gray-50">
                <p className="text-[#5D50C6] font-bold text-base mb-1">₹50,000+/month</p>
                <p className="text-xs text-gray-500 font-medium">Earning Potential</p>
              </div>

              {/* Floating Card: Customers */}
              <div className="absolute bottom-[10%] right-[10%] sm:-right-[5%] bg-white rounded-full px-5 py-3 shadow-xl z-20 flex items-center gap-3 animate-float-slow" style={{ animationDelay: '1s' }}>
                <div className="flex items-center justify-center">
                  <Users className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                </div>
                <span className="font-bold text-sm text-gray-900">2,000 + Customers</span>
              </div>

              {/* Main Subject Image */}
              <img
                src="/assets/hero_woman_tickets.png"
                alt="Woman holding travel tickets"
                width={500}
                height={600}
                fetchpriority="high"
                className="w-[85%] sm:w-full h-auto object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
