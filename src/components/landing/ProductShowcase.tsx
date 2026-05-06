"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Sparkles, LayoutTemplate, Network, LineChart, Settings, Package, Users, ShoppingCart, Check } from "lucide-react";

const ProductShowcase = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [activeTab, setActiveTab] = useState("admin");

  const tabContent = {
    admin: {
      title: "Admin Portal",
      icon: LayoutTemplate,
      features: ["Real Time booking", "Nyra AI Tracking", "Revenue Analytics", "Credit Report"],
    },
    supplier: {
      title: "Supplier Portal",
      icon: LayoutTemplate,
      features: ["Inventory Management", "Dynamic Pricing", "Service Configuration", "Performance Metrics"],
    },
    b2b: {
      title: "B2B Agent",
      icon: Network,
      features: ["Agent Commission Tracking", "Co-branding Options", "Lead Distribution", "Joint Marketing Tools"],
    },
    b2c: {
      title: "B2C Portal",
      icon: LineChart,
      features: ["Easy Search & Book", "Secure Payments", "Trip Itineraries", "24/7 Support"],
    },
  };

  const activeContent = tabContent[activeTab as keyof typeof tabContent];

  return (
    <section className="py-24 relative overflow-hidden bg-white w-full">
      <div ref={ref} className={`container mx-auto px-4 max-w-6xl relative opacity-0 ${isVisible ? "animate-fade-in" : ""}`}>
        
        {/* Header Section */}
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium text-sm px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Our strategies
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">
            See it in Action
          </h2>
          <p className="text-gray-500 text-lg max-w-xl">
            Four integrated portals powering every side of your travel Business
          </p>
        </div>

        {/* Tabs Row */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          <button 
            onClick={() => setActiveTab("admin")}
            className={`font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all ${activeTab === "admin" ? "bg-[#412A86] text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            Admin Portal
          </button>
          <button 
            onClick={() => setActiveTab("supplier")}
            className={`font-semibold px-6 py-2.5 rounded-xl transition-all ${activeTab === "supplier" ? "bg-[#412A86] text-white shadow-md" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            Supplier portal
          </button>
          <button 
            onClick={() => setActiveTab("b2b")}
            className={`font-semibold px-6 py-2.5 rounded-xl transition-all ${activeTab === "b2b" ? "bg-[#412A86] text-white shadow-md" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            B2B Agent
          </button>
          <button 
            onClick={() => setActiveTab("b2c")}
            className={`font-semibold px-6 py-2.5 rounded-xl transition-all ${activeTab === "b2c" ? "bg-[#412A86] text-white shadow-md" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            B2C Portal
          </button>
        </div>

        {/* Features 3-Column Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Active Card */}
          <div className="bg-white rounded-2xl p-8 border border-[#412A86]/30 shadow-[0_8px_30px_rgb(65,42,134,0.08)] relative">
            <div className="flex items-center gap-3 mb-6">
              <activeContent.icon className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
              <h3 className="font-bold text-gray-900 text-lg">{activeContent.title}</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-500 font-medium ml-2">
              {activeContent.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Text Column 1 */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Network className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
              <h3 className="font-bold text-gray-900 text-lg">Connect & Streamline</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Neuros seamlessly integrates with your favorite business tools, CRMs, and platforms. Experience a unified analytics platform that...
            </p>
          </div>

          {/* Text Column 2 */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <LineChart className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
              <h3 className="font-bold text-gray-900 text-lg">Instant Insights</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              In the fast-paced world of business, every second counts. Neuros processes data in real-time, ensuring you're always working w...
            </p>
          </div>
        </div>

        {/* Graphic Box */}
        <div className="w-full relative rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 bg-gradient-to-r from-[#4A8DF4] to-[#60A5FA] flex flex-col justify-center items-center h-[350px] md:h-[450px]">
          
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.4) 2px, transparent 2px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 2px, transparent 2px)",
            backgroundSize: "60px 60px"
          }}></div>
          
          {/* Central Pill */}
          <div className="relative z-20 text-center px-4 mb-4">
            <div className="inline-flex items-center justify-center bg-white rounded-full px-6 py-3 text-gray-900 font-bold shadow-xl border border-white/40 gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              AI-Driven Forecasts
            </div>
          </div>
          
          {/* Floating Line Charts SVGs */}
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center w-full h-full">
            <svg viewBox="0 0 1000 300" className="w-full h-full object-cover overflow-visible drop-shadow-xl" preserveAspectRatio="none">
              <path d="M 0 250 Q 150 200 250 230 T 450 150 T 650 200 T 850 120 T 1000 80" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
              <path d="M 0 280 Q 200 250 300 270 T 550 220 T 750 240 T 1000 180" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" />
              <path d="M 0 200 Q 100 250 200 210 T 500 280 T 700 200 T 1000 220" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          
          {/* Highlight Gradient Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#4A8DF4]/50 to-transparent z-10 pointer-events-none"></div>
          
          {/* Faint center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/20 blur-3xl rounded-full z-0 pointer-events-none"></div>

        </div>

      </div>
    </section>
  );
};

export default ProductShowcase;
