import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp, Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AboutTestimonials = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const testimonials = [
    {
      name: "Ahmed Siddiqui",
      role: "CEO, TravelMax Tours",
      company: "TravelMax",
      avatar: "AS",
      avatarColor: "from-primary to-primary/70",
      content: "marhabaDMC transformed our business. We launched our own branded portal in just 2 days and saw a 27% increase in B2B bookings within the first 3 months. The platform's ease of use and comprehensive support made all the difference.",
      rating: 5,
      metric: { value: "27%", label: "Increase in bookings" },
      highlight: "27% increase in bookings",
    },
    {
      name: "Fatima Sheikh",
      role: "Director, Wanderlust Holidays",
      company: "Wanderlust",
      avatar: "FS",
      avatarColor: "from-primary/90 to-primary/60",
      content: "The multi-portal system is a game-changer. Our suppliers love the dedicated access, and our agents appreciate the professional booking interface. The training support was exceptional—we were operational within a week.",
      rating: 5,
      metric: { value: "3x", label: "Faster onboarding" },
      highlight: "3x faster onboarding",
    },
    {
      name: "Mohammed Al-Rashid",
      role: "Founder, Hajj Travels International",
      company: "Hajj Travels",
      avatar: "MA",
      avatarColor: "from-primary/80 to-primary/50",
      content: "The Hajj and Umrah package management is exactly what we needed. The platform handles everything from group bookings to visa processing seamlessly. We've managed over 100 groups this year with zero operational issues.",
      rating: 5,
      metric: { value: "100+", label: "Groups managed" },
      highlight: "100+ groups managed",
    },
    {
      name: "Sara Al-Mansoori",
      role: "Operations Manager, Global Halal Tours",
      company: "Global Halal",
      avatar: "SA",
      avatarColor: "from-gold/80 to-gold/50",
      content: "The content library is incredible. We've reduced our content creation costs by 60% while improving quality. The halal-focused itineraries are exactly what our customers want, and they're ready to sell immediately.",
      rating: 5,
      metric: { value: "60%", label: "Cost reduction" },
      highlight: "60% cost reduction",
    },
  ];

  return (
    <section className="py-20 bg-muted/20 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Trusted Partners
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by Travel Professionals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our partners have to say about their experience building successful halal tourism businesses with marhabaDMC.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className={`hover:shadow-xl transition-all duration-300 opacity-0 border-border hover:border-primary/20 hover:-translate-y-1 ${
                gridVisible ? "animate-fade-in" : ""
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="pt-6">
                {/* Quote Icon */}
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-8 h-8 text-primary/20" />
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 leading-relaxed text-base italic">
                  "{testimonial.content}"
                </p>

                {/* Metric Highlight */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg px-4 py-3 border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Achievement</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary">{testimonial.metric.value}</span>
                      <span className="text-sm text-muted-foreground ml-1">{testimonial.metric.label}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicator */}
        <div
          className={`mt-12 text-center opacity-0 ${gridVisible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.8s" }}
        >
          <p className="text-muted-foreground">
            Join <span className="text-primary font-semibold">100+ travel professionals</span> who trust marhabaDMC to power their halal tourism businesses
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutTestimonials;
