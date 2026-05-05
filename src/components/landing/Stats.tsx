import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Plane, MapPin } from "lucide-react";

const Stats = () => {
  const { ref, isVisible } = useScrollAnimation();

  const stats = [
    { value: 168, suffix: "k", label: "Happy Clients" },
    { value: 45, prefix: "+", suffix: "k", label: "Destinations" },
    { value: 49, prefix: "+", label: "Global Branch" },
    { value: 26, prefix: "+", suffix: "k", label: "Campaigns" },
  ];

  return (
    <section className="py-12 relative overflow-hidden bg-[#FAFAFC] w-full">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className="bg-black rounded-[2rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-xl max-w-6xl mx-auto">
          
          {/* Background Map Graphic (Right aligned) */}
          <div className="absolute top-0 right-0 bottom-0 w-1/2 opacity-[0.05] pointer-events-none">
            <svg viewBox="0 0 1000 500" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover object-right">
              <path d="M495,202c-5,0-10,3-13,8c-5,8,4,20,11,25c11,7,21,14,35,17c17,3,38,1,50-10c9-9,8-22-2-30 c-14-11-40-15-58-15c-4,0-8,0-12,1c-7,1-13,6-11,14 M360,195c-7-2-15-4-23-4c-12,0-23,4-30,12c-5,6-5,14,0,20 c8,9,24,11,35,10c11-1,20-5,26-14C374,209,370,198,360,195 M582,311c-13-1-26,4-36,12c-8,7-10,18-5,27c6,10,19,15,31,16 c17,1,34-5,44-18c7-9,7-21-1-29C605,312,593,312,582,311 M458,359c-10,2-18,10-21,20c-2,10,2,21,11,27c12,8,28,8,40,2 c11-5,16-16,14-26c-1-11-11-20-22-23C472,357,464,357,458,359" />
              {/* Simplified generic continents placeholder */}
              <circle cx="200" cy="150" r="100" />
              <circle cx="700" cy="200" r="150" />
              <circle cx="850" cy="350" r="80" />
              <circle cx="350" cy="400" r="120" />
            </svg>
          </div>

          {/* Left Decorative Flight Path */}
          <div className="absolute top-0 left-0 bottom-0 w-64 pointer-events-none hidden md:block">
            <svg width="100%" height="100%" viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-50,50 C50,50 150,10 150,80 C150,150 -20,130 -20,200 C-20,270 50,250 80,250" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6"/>
              <path d="M-50,20 C80,30 200,-10 200,60 C200,130 0,110 0,180" stroke="white" strokeWidth="1" strokeDasharray="2 4" strokeOpacity="0.3"/>
            </svg>
            <div className="absolute bottom-[40px] left-[70px] text-white">
              <MapPin className="w-5 h-5 fill-white text-black" />
            </div>
          </div>

          {/* Right Decorative Flight Path and Planes */}
          <div className="absolute top-0 right-0 bottom-0 w-64 pointer-events-none hidden md:block">
            <svg width="100%" height="100%" viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50,150 C50,80 150,50 250,20" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6"/>
              <path d="M100,150 C100,200 150,250 250,220" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6"/>
              <path d="M150,150 C180,180 200,250 150,300" stroke="white" strokeWidth="1" strokeDasharray="2 4" strokeOpacity="0.3"/>
            </svg>
            <div className="absolute top-[30px] right-[40px] text-white rotate-45">
              <Plane className="w-8 h-8 fill-white text-white" />
            </div>
            <div className="absolute bottom-[60px] right-[70px] text-white rotate-[15deg]">
              <Plane className="w-8 h-8 fill-white text-white" />
            </div>
            <div className="absolute top-[130px] right-[90px] text-white">
              <MapPin className="w-5 h-5 fill-white text-black" />
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-0 divide-x divide-white/20 relative z-10">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center justify-center text-center opacity-0 px-2 sm:px-6 ${
                  isVisible ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="text-4xl md:text-5xl lg:text-[56px] font-bold mb-3 flex items-baseline justify-center font-poppins leading-none tracking-tight">
                  {stat.prefix && <span>{stat.prefix}</span>}
                  <AnimatedCounter end={stat.value} />
                  {stat.suffix && <span>{stat.suffix}</span>}
                </div>
                <div className="text-sm md:text-base font-semibold text-white/90">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
