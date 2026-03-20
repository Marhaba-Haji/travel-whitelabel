import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TrustedBy = () => {
  const { ref, isVisible } = useScrollAnimation();

  const logos = [
    { name: "TravelMax", initials: "TM", gradient: "from-aurora-blue to-aurora-teal" },
    { name: "Wanderlust", initials: "WL", gradient: "from-aurora-purple to-aurora-blue" },
    { name: "Global Tours", initials: "GT", gradient: "from-aurora-teal to-emerald-500" },
    { name: "Hajj Travels", initials: "HT", gradient: "from-aurora-purple to-aurora-blue" },
    { name: "Sky Journeys", initials: "SJ", gradient: "from-aurora-blue to-aurora-teal" },
    { name: "Vista Holidays", initials: "VH", gradient: "from-aurora-teal to-emerald-500" },
    { name: "Nomad Trips", initials: "NT", gradient: "from-aurora-purple to-aurora-blue" },
    { name: "Elite Voyages", initials: "EV", gradient: "from-aurora-blue to-aurora-teal" },
  ];

  return (
    <section className="py-10 relative overflow-hidden border-y border-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-card/40 to-background" />

      <div
        ref={ref}
        className={`container mx-auto px-4 relative opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
      >
        <p className="text-center text-xs font-semibold text-aurora-teal/80 mb-6 uppercase tracking-[0.2em]">
          Trusted by 500+ Travel Agencies Worldwide
        </p>

        <div className="relative">
          <div className="flex animate-scroll-left">
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="flex-shrink-0 mx-8 flex items-center gap-2.5"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${logo.gradient} flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                  {logo.initials}
                </div>
                <span className="text-muted-foreground/70 font-medium whitespace-nowrap text-sm">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>

          {/* Edge fade — matches dark bg */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
