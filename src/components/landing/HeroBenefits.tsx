import { Building2, Map, Hotel, Headset } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const BENEFITS = [
  { text: "100 + Travel Agencies", subtext: "Make memories around the world.", icon: Building2, blobColor: "bg-[#FFE8E3]" },
  { text: "30 + Countries", subtext: "Global Coverage", icon: Map, blobColor: "bg-[#E6F8F5]" },
  { text: "1 M + Hotels", subtext: "Worldwide hotels available\nfor every journey.", icon: Hotel, blobColor: "bg-[#EBF3FF]" },
  { text: "Support Availability", subtext: "9am to 7pm\nMonday to Saturday", icon: Headset, blobColor: "bg-[#F3EFFF]" },
];

const HeroBenefits = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-14 relative overflow-hidden bg-white">
      <div ref={ref} className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {BENEFITS.map((benefit, index) => (
            <div
              key={benefit.text}
              className={`group flex flex-col items-center text-center opacity-0 ${
                isVisible ? "animate-fade-in" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                {/* Organic blurred blob background */}
                <div 
                  className={`absolute inset-0 ${benefit.blobColor} rounded-[40%_60%_70%_30%/40%_50%_60%_50%] group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 ease-in-out blur-[2px] opacity-80`}
                ></div>
                {/* Icon */}
                <benefit.icon className="h-6 w-6 text-gray-800 relative z-10" strokeWidth={1.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                {benefit.text}
              </h4>
              <p className="text-sm text-gray-500 font-medium whitespace-pre-line leading-relaxed max-w-[220px]">
                {benefit.subtext}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBenefits;
