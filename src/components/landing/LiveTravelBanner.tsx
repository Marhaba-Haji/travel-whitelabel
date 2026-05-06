import { Instagram, Facebook, Linkedin, Twitter, Plane, Car } from "lucide-react";
import { useSocialSettings } from "@/hooks/useSocialSettings";

const LiveTravelBanner = () => {
  const { instagram, facebook, linkedin, x: twitter } = useSocialSettings();

  const socialItems = [
    { href: instagram, Icon: Instagram, label: "Instagram" },
    { href: facebook, Icon: Facebook, label: "Facebook" },
    { href: linkedin, Icon: Linkedin, label: "LinkedIn" },
    { href: twitter, Icon: Twitter, label: "X / Twitter" },
  ].filter((item) => item.href?.trim());

  return (
    <div className="container mx-auto px-4 my-16 w-full">
      <div className="relative w-full overflow-hidden rounded-3xl bg-[#FFFBF4] border border-orange-100 shadow-sm min-h-[300px] flex items-center justify-center">
        
        {/* Decorative Orange Blobs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#F98825] rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
        <div className="absolute top-10 -left-10 w-48 h-48 bg-[#FFB067] rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>
        
        <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-[#F98825] rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFB067] rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>

        {/* Dotted Flight Path */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
          <path d="M 100 200 Q 300 300 500 150 T 900 100" fill="none" stroke="black" strokeWidth="2" strokeDasharray="6,6" />
        </svg>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full max-w-5xl mx-auto py-12 px-6">
          
          {/* Left Polaroid */}
          <div className="hidden md:block relative w-64 h-56 rotate-[-6deg] bg-white p-3 shadow-lg rounded-sm mr-8 hover:rotate-0 transition-transform duration-300">
            <div className="w-full h-full bg-gray-200 overflow-hidden">
              <img src="/assets/mountain-view.jpg" alt="Mountain View" className="w-full h-full object-cover" />
            </div>
            {/* Doodle Icon - Plane */}
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center rotate-[15deg]">
              <Plane className="w-8 h-8 text-gray-800" />
            </div>
          </div>

          {/* Center Content */}
          <div className="text-center flex-1 max-w-lg mx-auto relative">
            <p className="text-sm font-bold text-gray-600 tracking-[0.2em] uppercase mb-2">Time to be happy!</p>
            <h2 className="text-5xl md:text-7xl text-[#F98825] mb-2" style={{ fontFamily: 'cursive' }}>Live Travel</h2>
            <p className="text-sm font-bold text-gray-800 tracking-wider mb-3">LIVE STREAM TRAVEL EVERY DAY</p>
            <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
              Join our daily live streams from stunning destinations—real-time tours, local tips, and authentic travel experiences.
            </p>
            <div className="flex items-center justify-center gap-4">
              {socialItems.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            
            {/* Doodle Stamp */}
            <div className="absolute -bottom-8 -right-12 w-20 h-20 rounded-full border-4 border-[#F98825] bg-[#F98825]/10 flex items-center justify-center text-[#F98825] font-bold text-[10px] text-center leading-tight rotate-[15deg]">
              AROUND<br/>THE<br/>WORLD
            </div>
          </div>

          {/* Right Polaroid */}
          <div className="hidden md:block relative w-64 h-56 rotate-[8deg] bg-white p-3 shadow-lg rounded-sm ml-8 hover:rotate-0 transition-transform duration-300">
            <div className="w-full h-full bg-gray-200 overflow-hidden">
              <img src="/assets/ocean-view.jpg" alt="Ocean View" className="w-full h-full object-cover" />
            </div>
            {/* Doodle Icon - Car */}
            <div className="absolute -top-8 -left-8 w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center rotate-[-15deg]">
              <Car className="w-7 h-7 text-gray-800" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LiveTravelBanner;
