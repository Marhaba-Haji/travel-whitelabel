import { ArrowLeft, ArrowRight, Calendar, Clock, MessageCircle, Heart, ArrowRight as ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const Inspiration = () => {
  const posts = [
    {
      id: 1,
      category: "Cultural",
      image: "https://placehold.co/600x400/e2e8f0/64748b?text=Cultural+Trip",
      date: "18 Sep 2024",
      readTime: "6 mins",
      comments: "38 comments",
      title: "Ultimate Travel Planning Guide: 10 Tips for a Seamless Journey",
      author: {
        name: "Jimmy Dave",
        avatar: "https://i.pravatar.cc/150?img=11",
      },
    },
    {
      id: 2,
      category: "Travel",
      image: "https://placehold.co/600x400/e2e8f0/64748b?text=Travel+Friends",
      date: "18 Sep 2024",
      readTime: "6 mins",
      comments: "38 comments",
      title: "Top 10 Travel Hacks for Budget-Conscious Adventurers",
      author: {
        name: "Jimmy Dave",
        avatar: "https://i.pravatar.cc/150?img=11",
      },
    },
    {
      id: 3,
      category: "Discovery",
      image: "https://placehold.co/600x400/e2e8f0/64748b?text=Discovery+City",
      date: "18 Sep 2024",
      readTime: "6 mins",
      comments: "38 comments",
      title: "Discovering Hidden Gems: 10 Off-the-Beaten-Path Travel Tips",
      author: {
        name: "Jimmy Dave",
        avatar: "https://i.pravatar.cc/150?img=11",
      },
    },
    {
      id: 4,
      category: "Cultural",
      image: "https://placehold.co/600x400/e2e8f0/64748b?text=Another+Trip",
      date: "18 Sep 2024",
      readTime: "6 mins",
      comments: "38 comments",
      title: "Ultimate Travel Planning Guide: 10 Tips for a Seamless Journey",
      author: {
        name: "Jimmy Dave",
        avatar: "https://i.pravatar.cc/150?img=11",
      },
    },
  ];

  return (
    <section className="py-24 relative w-full overflow-hidden bg-[#FAFAFC]">
      {/* Topographic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("/assets/map-pattern.png")', backgroundSize: '800px' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="font-poppins text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get inspiration for your next trip
            </h2>
            <p className="text-lg text-gray-500">
              Favorite destinations based on customer reviews
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Carousel / Grid */}
        {/* Using a flex container with overflow-x-auto for the carousel effect */}
        <div className="flex overflow-x-auto gap-6 pb-8 -mx-4 px-4 snap-x hide-scrollbar">
          {posts.map((post) => (
            <div key={post.id} className="min-w-[320px] md:min-w-[380px] w-[320px] md:w-[380px] shrink-0 snap-start bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
              
              {/* Image Section */}
              <div className="relative h-56 w-full">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-gray-900">
                  {post.category}
                </div>
                <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-1">
                
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{post.comments}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 leading-snug mb-6 flex-1">
                  {post.title}
                </h3>

                {/* Footer (Author & Button) */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-sm font-semibold text-gray-900">{post.author.name}</span>
                  </div>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold px-4 py-2 rounded-full transition-colors">
                    Keep Reading
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="mt-4">
          <Button className="rounded-full px-6 py-6 bg-[#412A86] hover:bg-[#412A86]/90 text-white font-medium group">
            View More
            <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

      </div>
      
      {/* Add a style tag for hiding scrollbar but allowing scroll */}
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

export default Inspiration;
