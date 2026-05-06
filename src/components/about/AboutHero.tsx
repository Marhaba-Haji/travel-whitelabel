import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AboutHero = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="relative pt-32 pb-20 overflow-hidden min-h-[80vh] flex items-center bg-white">
      {/* Soft brand washes */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#2D9BFC]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#412A86]/5 rounded-full blur-3xl pointer-events-none" />
      {/* Decorative dashed travel path */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
        <svg viewBox="0 0 1440 600" className="w-full h-full" fill="none">
          <path d="M -50 300 C 200 100 600 500 900 200 S 1500 300 1500 300" stroke="#F472B6" strokeWidth="1.5" strokeDasharray="4 6" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`max-w-4xl mx-auto text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          {/* Badge */}
          <span className="inline-block bg-cyan-50 text-cyan-600 font-bold tracking-wide text-xs px-4 py-1.5 rounded-full mb-6 uppercase">
            Halal Tourism Enablement Company
          </span>
          
          {/* Main Heading */}
          <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            About{" "}
            <span className="text-[#B968C7]">marhabaDMC</span>
          </h1>
          
          {/* Enhanced Description */}
          <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-8">
            We build the infrastructure, content, technology, and operational systems that empower 
            travel agents, tour operators, and hospitality partners to design, sell, manage, and 
            scale halal-compliant travel experiences worldwide.
          </p>

          {/* Value Proposition */}
          <div className="rounded-3xl bg-white border border-gray-100 shadow-soft p-6 max-w-2xl mx-auto">
            <p className="text-gray-900 font-medium text-lg">
              Empowering travel businesses with{" "}
              <span className="text-[#412A86] font-semibold">intelligent infrastructure</span>,{" "}
              <span className="text-[#412A86] font-semibold">curated content</span>, and{" "}
              <span className="text-[#412A86] font-semibold">cutting-edge technology</span>{" "}
              to scale halal tourism globally.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
