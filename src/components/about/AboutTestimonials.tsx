import { Star, TrendingUp, Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

import { getAuroraGradient } from "@/lib/design-tokens";

const AboutTestimonials = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const testimonials = [
    {
      name: "Ahmed Siddiqui",
      role: "CEO, TravelMax Tours",
      avatar: "AS",
      content: "marhabaDMC transformed our business. We launched our own branded portal in just 2 days and saw a 27% increase in B2B bookings within the first 3 months. The platform's ease of use and comprehensive support made all the difference.",
      rating: 5,
      metric: { value: "27%", label: "Increase in bookings" },
    },
    {
      name: "Fatima Sheikh",
      role: "Director, Wanderlust Holidays",
      avatar: "FS",
      content: "The multi-portal system is a game-changer. Our suppliers love the dedicated access, and our agents appreciate the professional booking interface. The training support was exceptional—we were operational within a week.",
      rating: 5,
      metric: { value: "3x", label: "Faster onboarding" },
    },
    {
      name: "Mohammed Al-Rashid",
      role: "Founder, Hajj Travels International",
      avatar: "MA",
      content: "The Hajj and Umrah package management is exactly what we needed. The platform handles everything from group bookings to visa processing seamlessly. We've managed over 100 groups this year with zero operational issues.",
      rating: 5,
      metric: { value: "100+", label: "Groups managed" },
    },
    {
      name: "Sara Al-Mansoori",
      role: "Operations Manager, Global Halal Tours",
      avatar: "SA",
      content: "The content library is incredible. We've reduced our content creation costs by 60% while improving quality. The halal-focused itineraries are exactly what our customers want, and they're ready to sell immediately.",
      rating: 5,
      metric: { value: "60%", label: "Cost reduction" },
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(270_70%_58%_/_0.08),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative">
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] bg-white border border-gray-100 shadow-sm px-4 py-1.5 rounded-full mb-5">
            Trusted Partners
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Loved by{" "}
            <span className="aurora-gradient-text-static">
              Travel Professionals
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our partners have to say about their experience building successful halal tourism businesses with marhabaDMC.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 gap-5">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={`group rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-6 hover-surface-card hover:shadow-2xl transition-all duration-300 opacity-0 ${
                gridVisible ? "animate-scale-in" : ""
              }`}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <Quote className="w-8 h-8 text-aurora-purple/30" />
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-aurora-teal text-aurora-teal" />
                  ))}
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed text-sm italic">
                "{testimonial.content}"
              </p>

              <div className={`bg-gradient-to-r ${getAuroraGradient(index)} rounded-xl px-4 py-3 mb-5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-white/70" />
                    <span className="text-sm text-white/70">Achievement</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white">{testimonial.metric.value}</span>
                    <span className="text-sm text-white/70 ml-1">{testimonial.metric.label}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t-surface">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAuroraGradient(index)} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`mt-14 text-center opacity-0 ${gridVisible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          <p className="text-muted-foreground">
            Join <span className="aurora-gradient-text-static font-semibold">100+ travel professionals</span> who trust marhabaDMC to power their halal tourism businesses
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutTestimonials;
