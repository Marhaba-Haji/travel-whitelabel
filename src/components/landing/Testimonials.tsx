import { useEffect, useRef, useState } from "react";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";

const Testimonials = () => {
  const { testimonials, loading } = useTestimonials();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef(false);
  const rafIdRef = useRef(0);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || loading || testimonials.length === 0) return;

    const startTimer = setTimeout(() => {
      const speed = 1.5;
      const maxScroll = () => el.scrollWidth - el.clientWidth;
      let currentScroll = el.scrollLeft;

      const handleEnter = () => { isPausedRef.current = true; };
      const handleLeave = () => { isPausedRef.current = false; };

      const animate = () => {
        if (!isPausedRef.current) {
          currentScroll += speed;
          if (currentScroll >= maxScroll()) {
            currentScroll = 0;
          }
          el.scrollLeft = currentScroll;
        } else {
          // If paused (e.g. user is dragging/scrolling manually), sync the variable
          currentScroll = el.scrollLeft;
        }
        rafIdRef.current = requestAnimationFrame(animate);
      };

      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
      
      rafIdRef.current = requestAnimationFrame(animate);

      return () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
      };
    }, 50);

    return () => {
      clearTimeout(startTimer);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [loading, testimonials.length]);

  return (
    <section className="py-24 relative overflow-hidden bg-white w-full">
      {/* Decorative Background Elements */}
      <div
        className="absolute top-10 right-0 w-96 h-48 opacity-20 pointer-events-none bg-no-repeat bg-right-top mix-blend-multiply"
        style={{ backgroundImage: 'url("/assets/flight-path.svg")' }}
      />
      <div className="absolute bottom-0 left-0 w-2/3 h-48 opacity-[0.05] pointer-events-none bg-[url('https://placehold.co/1920x300/000000/transparent?text=Skyline')] bg-repeat-x bg-bottom" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Block */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 bg-[#412A86] rounded-full pl-1 pr-4 py-1 mb-6 shadow-md">
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?img=1" className="w-6 h-6 rounded-full border border-[#412A86]" alt="User" />
              <img src="https://i.pravatar.cc/100?img=2" className="w-6 h-6 rounded-full border border-[#412A86]" alt="User" />
              <img src="https://i.pravatar.cc/100?img=3" className="w-6 h-6 rounded-full border border-[#412A86]" alt="User" />
            </div>
            <span className="text-white text-xs font-semibold tracking-wide">Testimonials</span>
          </div>
          <h2 className="font-poppins text-4xl md:text-5xl font-bold text-gray-900 leading-tight max-w-xl">
            Don't take our word for it
          </h2>
        </div>

        {/* Carousel / Cards */}
        <div ref={containerRef} className="flex overflow-x-auto gap-6 pb-8 -mx-4 px-4 hide-scrollbar cursor-pointer">
          {loading ? (
            <div className="w-full flex items-center justify-center py-12 text-muted-foreground">
              Loading testimonials...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="w-full flex items-center justify-center py-12 text-muted-foreground">
              No testimonials available yet.
            </div>
          ) : (
            (() => {
              const displayTestimonials = [...testimonials, ...testimonials];
              return displayTestimonials.map((testimonial, idx) => (
                <div
                  key={`${testimonial.id}-${idx}`}
                  className="min-w-[280px] md:min-w-[360px] w-[280px] md:w-[360px] min-h-[220px] md:min-h-[260px] shrink-0 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
                >
                  <div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                      {testimonial.review}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                        {getInitials(testimonial.name)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              ));
            })()
          )}
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" aria-label="Previous testimonial">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" aria-label="Next testimonial">
            <ArrowRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <style>{`\
        .hide-scrollbar::-webkit-scrollbar {\
          display: none;\
        }\
        .hide-scrollbar {\
          -ms-overflow-style: none;\
          scrollbar-width: none;\
        }\
      `}</style>
    </section>
  );
};

export default Testimonials;
