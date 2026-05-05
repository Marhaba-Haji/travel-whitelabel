import { Star, ArrowLeft, ArrowRight } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sara Mohamed",
      role: "Jakatar",
      avatar: "https://i.pravatar.cc/150?img=47",
      content: "I've been using the hotel booking system for several years now, and it's become my go-to platform for planning my trips. The interface is user-friendly, and I appreciate the detailed information and real-time availability of hotels.",
      title: "The best booking system",
    },
    {
      id: 2,
      name: "Atend John",
      role: "Califonia",
      avatar: "https://i.pravatar.cc/150?img=11",
      content: "I've been using the hotel booking system for several years now, and it's become my go-to platform for planning my trips. The interface is user-friendly, and I appreciate the detailed information and real-time availability of hotels.",
      title: "The best booking system",
    },
    {
      id: 3,
      name: "Sara Mohamed",
      role: "Jakatar",
      avatar: "https://i.pravatar.cc/150?img=47",
      content: "I've been using the hotel booking system for several years now, and it's become my go-to platform for planning my trips. The interface is user-friendly, and I appreciate the detailed information and real-time availability of hotels.",
      title: "The best booking system",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-white w-full">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 right-0 w-96 h-48 opacity-20 pointer-events-none bg-[url('https://placehold.co/800x400/transparent/000000?text=Flight+Path')] bg-no-repeat bg-right-top mix-blend-multiply" style={{ backgroundImage: 'url("/assets/flight-path.svg")' }}></div>
      <div className="absolute bottom-0 left-0 w-2/3 h-48 opacity-[0.05] pointer-events-none bg-[url('https://placehold.co/1920x300/000000/transparent?text=Skyline')] bg-repeat-x bg-bottom"></div>

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
        <div className="flex overflow-x-auto gap-6 pb-8 -mx-4 px-4 snap-x hide-scrollbar">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="min-w-[320px] md:min-w-[480px] w-[320px] md:w-[480px] shrink-0 snap-start bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{testimonial.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  {testimonial.content}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ArrowRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
