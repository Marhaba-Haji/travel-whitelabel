import { Star, TrendingUp } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getAuroraGradient } from "@/lib/design-tokens";

const Testimonials = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const testimonials = [
    {
      name: "Ahmed Siddiqui",
      role: "CEO, TravelMax Tours",
      avatar: "AS",
      content: "marhabaDMC transformed our business. We launched our own branded portal in just 2 days and saw a 27% increase in B2B bookings within the first 3 months.",
      rating: 5,
      metric: { value: "27%", label: "Increase in bookings" },
    },
    {
      name: "Fatima Sheikh",
      role: "Director, Wanderlust Holidays",
      avatar: "FS",
      content: "The multi-portal system is a game-changer. Our suppliers love the dedicated access, and our agents appreciate the professional booking interface.",
      rating: 5,
      metric: { value: "3x", label: "Faster onboarding" },
    },
    {
      name: "Mohammed Al-Rashid",
      role: "Founder, Hajj Travels International",
      avatar: "MA",
      content: "The Hajj and Umrah package management is exactly what we needed. The platform handles everything from group bookings to visa processing seamlessly.",
      rating: 5,
      metric: { value: "100+", label: "Groups managed" },
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}>
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(270_70%_58%_/_0.05),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative">
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] glass px-4 py-1.5 rounded-full mb-5">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Loved by{" "}
            <span className="aurora-gradient-text-static">
              Travel Professionals
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about their experience with marhabaDMC.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-3 gap-5">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={`group glass-card rounded-2xl p-6 hover:shadow-xl hover:border-white/20 transition-all duration-300 opacity-0 ${gridVisible ? "animate-scale-in" : ""}`}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-aurora-teal text-aurora-teal" />
                  ))}
                </div>
                <div className="flex items-center gap-1 glass px-2.5 py-1 rounded-full text-xs font-semibold text-aurora-teal">
                  <TrendingUp className="h-3 w-3" />
                  {testimonial.metric.value}
                </div>
              </div>

              <div className={`bg-gradient-to-r ${getAuroraGradient(index)} rounded-xl px-4 py-2.5 mb-5 text-center`}>
                <span className="text-lg font-bold text-white">{testimonial.metric.value}</span>
                <span className="text-sm text-white/70 ml-1.5">{testimonial.metric.label}</span>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
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
      </div>
    </section>
  );
};

export default Testimonials;
