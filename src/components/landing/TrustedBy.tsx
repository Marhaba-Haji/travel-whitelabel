import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TrustedBy = () => {
  const { ref, isVisible } = useScrollAnimation();

  const logos = [
    { name: "TravelMax", initials: "TM" },
    { name: "Wanderlust", initials: "WL" },
    { name: "Global Tours", initials: "GT" },
    { name: "Hajj Travels", initials: "HT" },
    { name: "Sky Journeys", initials: "SJ" },
    { name: "Vista Holidays", initials: "VH" },
    { name: "Nomad Trips", initials: "NT" },
    { name: "Elite Voyages", initials: "EV" },
  ];

  return (
    <section className="py-12 bg-muted/30 border-y border-border overflow-hidden">
      <div
        ref={ref}
        className={`container mx-auto px-4 opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
      >
        <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-wider">
          Trusted by 500+ Travel Agencies Worldwide
        </p>
        
        {/* Logo Carousel */}
        <div className="relative">
          <div className="flex animate-scroll-left">
            {/* Duplicate logos for seamless scroll */}
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="flex-shrink-0 mx-8 flex items-center gap-2"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {logo.initials}
                </div>
                <span className="text-muted-foreground font-medium whitespace-nowrap">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-muted/30 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
