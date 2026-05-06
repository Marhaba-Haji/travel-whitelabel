import { Globe, Ticket, Luggage, Shield } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const EmbracingAdventure = () => {
  const { ref, isVisible } = useScrollAnimation();

  const features = [
    {
      icon: Globe,
      title: "Travel at insider rates",
      description: "Make memories around the world.",
      bgColor: "bg-[#FFF2EE]", // Light peach
    },
    {
      icon: Luggage,
      title: "Launch-Ready in 24 Hours",
      description: "4.7 stars from Google.",
      bgColor: "bg-[#E7F8F5]", // Light mint
    },
    {
      icon: Ticket,
      title: "Be Your Own Boss",
      description: "Book your spot first, pay later.",
      bgColor: "bg-[#EAF3FF]", // Light blue
    },
    {
      icon: Shield,
      title: "Build Your Dream Business",
      description: "Data security through encryption",
      bgColor: "bg-[#F3F2EB]", // Light beige
    },
  ];

  return (
    <section className="py-20 bg-white overflow-hidden w-full">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left Side: Text and Stats */}
          <div className={`lg:w-[45%] opacity-0 ${isVisible ? "animate-fade-in" : ""}`}>
            <span className="inline-flex items-center gap-2 bg-[#412A86] text-white font-semibold text-sm px-4 py-2 rounded-full mb-8 shadow-sm">
              <span className="text-lg leading-none">🌍</span>
              Why book at Marhaba ?
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-poppins leading-tight">
              Embracing Adventure Since 2022
            </h2>
            <p className="text-gray-700 text-lg mb-12 max-w-md">
              Choose one style or create a package, fill your passports with adventures together.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins mb-1">2000+</h4>
                <p className="text-xs md:text-sm text-gray-500 font-medium leading-snug">Customers served</p>
              </div>
              <div>
                <h4 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins mb-1">5CR +</h4>
                <p className="text-xs md:text-sm text-gray-500 font-medium leading-snug">Bookings</p>
              </div>
              <div>
                <h4 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins mb-1">5+</h4>
                <p className="text-xs md:text-sm text-gray-500 font-medium leading-snug">Years<br/>Experience</p>
              </div>
            </div>
          </div>

          {/* Right Side: 2x2 Grid */}
          <div className={`lg:w-[55%] grid grid-cols-1 sm:grid-cols-2 gap-6 opacity-0 ${isVisible ? "animate-scale-in" : ""}`} style={{ animationDelay: "0.2s" }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${feature.bgColor} p-8 rounded-2xl flex flex-col items-center text-center justify-center min-h-[220px] transition-transform hover:-translate-y-1 shadow-sm border border-black/5`}
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-black/5">
                  <feature.icon className="w-5 h-5 text-gray-800" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight">{feature.title}</h3>
                <p className="text-sm text-gray-500 max-w-[200px]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default EmbracingAdventure;
