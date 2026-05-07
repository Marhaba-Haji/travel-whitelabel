import { ShieldCheck, User, Handshake, FileText } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const HowItWorks = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollAnimation();

  return (
    <section className="py-24 relative overflow-hidden bg-white w-full">
      {/* Background Dotted Path SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block" preserveAspectRatio="none" viewBox="0 0 1440 600">
        <path d="M-50,300 Q150,320 250,340 T500,450 T800,450 T1000,320 T1500,400" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeDasharray="6 6" />
        {/* Map pin starting point */}
        <g transform="translate(100, 260)">
          <path d="M10,0 C4.5,0 0,4.5 0,10 C0,18 10,30 10,30 C10,30 20,18 20,10 C20,4.5 15.5,0 10,0 Z" fill="none" stroke="#D1D5DB" strokeWidth="2"/>
          <circle cx="10" cy="10" r="3" fill="none" stroke="#D1D5DB" strokeWidth="2"/>
        </g>
        <circle cx="110" cy="312" r="8" fill="#D1D5DB" />
      </svg>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header aligned to the left */}
        <div
          ref={headerRef}
          className={`mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins max-w-xl">
            Launch your portal in 4 Simple Steps
          </h2>
        </div>

        <div ref={stepsRef} className={`relative flex flex-col lg:flex-row items-center justify-between opacity-0 ${stepsVisible ? "animate-scale-in" : ""}`}>
          
          {/* Left Column (Steps 1 & 2) */}
          <div className="flex flex-col gap-12 lg:gap-24 w-full lg:w-[35%] z-10">
            {/* Step 1 */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0 border border-gray-50 relative z-10">
                <ShieldCheck className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Up & Choose Plan</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Create your account and select the plan that fits your business needs. Get started in minutes.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0 border border-gray-50 relative z-10">
                <User className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Add Your Content</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Upload packages, set rates, configure APIs, and invite your suppliers to add their content.</p>
              </div>
            </div>
          </div>

          {/* Center Image */}
          <div className="w-full lg:w-[30%] flex justify-center my-16 lg:my-0 relative z-10">
            <div className="relative">
              <img
                src="/assets/man_with_backpack.webp"
                alt="Traveler with backpack"
                width={700}
                height={900}
                loading="lazy"
                decoding="async"
                className="w-full max-w-[350px] object-contain drop-shadow-2xl relative z-10"
              />
              {/* Floating Pill */}
              <div className="absolute bottom-24 left-0 sm:left-0 md:-left-12 bg-white shadow-xl rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-50 z-20 w-fit max-w-xs sm:max-w-none">
                <span className="text-[#F98825] font-bold tracking-wider text-xs sm:text-sm">2,000+ Customers Served</span>
              </div>
              {/* Starfish (Emojis/SVGs for decoration) */}
              <div className="absolute -bottom-2 right-4 text-3xl opacity-80 rotate-[15deg] z-20 select-none pointer-events-none text-orange-300">
                ⭐
              </div>
              <div className="absolute bottom-2 right-16 text-2xl opacity-70 rotate-[-10deg] z-20 select-none pointer-events-none text-orange-300">
                ⭐
              </div>
            </div>
          </div>

          {/* Right Column (Steps 3 & 4) */}
          <div className="flex flex-col gap-12 lg:gap-24 w-full lg:w-[35%] z-10">
            {/* Step 3 */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0 border border-gray-50 relative z-10">
                <Handshake className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your Domain</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Point your custom domain to our platform. Add your logo, colors, and branding elements.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0 border border-gray-50 relative z-10">
                <FileText className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Start Selling</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Launch your portal! Start accepting bookings from agents and customers immediately.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
