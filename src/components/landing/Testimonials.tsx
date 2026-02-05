import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Testimonials = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const testimonials = [
    {
      name: "Ahmed Siddiqui",
      role: "CEO, TravelMax Tours",
      avatar: "AS",
      avatarColor: "from-primary to-primary/70",
      content: "NOMADORE transformed our business. We launched our own branded portal in just 2 days and saw a 27% increase in B2B bookings within the first 3 months.",
      rating: 5,
      metric: { value: "27%", label: "Increase in bookings" },
      company: "TravelMax",
    },
    {
      name: "Fatima Sheikh",
      role: "Director, Wanderlust Holidays",
      avatar: "FS",
      avatarColor: "from-primary/90 to-primary/60",
      content: "The multi-portal system is a game-changer. Our suppliers love the dedicated access, and our agents appreciate the professional booking interface.",
      rating: 5,
      metric: { value: "3x", label: "Faster onboarding" },
      company: "Wanderlust",
    },
    {
      name: "Mohammed Al-Rashid",
      role: "Founder, Hajj Travels International",
      avatar: "MA",
      avatarColor: "from-primary/80 to-primary/50",
      content: "The Hajj and Umrah package management is exactly what we needed. The platform handles everything from group bookings to visa processing seamlessly.",
      rating: 5,
      metric: { value: "100+", label: "Groups managed" },
      company: "Hajj Travels",
    },
  ];

  return (
    <section className="py-20 bg-muted/20 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-1 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Loved by Travel Professionals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about their experience with Nomadore.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className={`hover:shadow-xl transition-all duration-300 opacity-0 border-border hover:border-primary/20 ${gridVisible ? "animate-fade-in" : ""}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="pt-6">
                {/* Rating & Metric */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                    <TrendingUp className="h-3 w-3" />
                    {testimonial.metric.value}
                  </div>
                </div>

                {/* Metric Highlight */}
                <div className="bg-accent/50 rounded-lg px-3 py-2 mb-4 text-center">
                  <span className="text-lg font-bold text-primary">{testimonial.metric.value}</span>
                  <span className="text-sm text-muted-foreground ml-1">{testimonial.metric.label}</span>
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
