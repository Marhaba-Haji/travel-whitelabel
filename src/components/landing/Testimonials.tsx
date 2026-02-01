import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Testimonials = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "CEO, TravelMax Tours",
      content: "Facelyft transformed our business. We launched our own branded portal in just 2 days and saw a 40% increase in B2B bookings within the first month.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Director, Wanderlust Holidays",
      content: "The multi-portal system is a game-changer. Our suppliers love the dedicated access, and our agents appreciate the professional booking interface.",
      rating: 5,
    },
    {
      name: "Mohammed Al-Rashid",
      role: "Founder, Hajj Travels International",
      content: "The Hajj and Umrah package management is exactly what we needed. The platform handles everything from group bookings to visa processing seamlessly.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Loved by Travel Professionals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about their experience with Facelyft.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className={`hover:shadow-lg transition-all duration-300 opacity-0 ${gridVisible ? "animate-fade-in" : ""}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="pt-6">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
