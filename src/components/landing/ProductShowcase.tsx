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
      icon: Settings,
      tabIcon: Settings,
      features: ["Real Time booking", "Nyra AI Tracking", "Revenue Analytics", "Credit Report"],
      insightTitle: "Connect & Streamline",
      insightText: "Manage bookings, suppliers, and operations from one dashboard.",
      analyticsTitle: "Instant Insights",
      analyticsText: "Track revenue trends and performance in real time.",
      panelLabel: "AI-Driven Forecasts",
      panelGradient: "from-[#4A8DF4] to-[#60A5FA]",
      panelOverlay: "from-[#4A8DF4]/50",
      panelGlow: "bg-[#7BB3FF]/30",
      panelGridSize: "60px 60px",
    },
    supplier: {
      title: "Supplier Portal",
      icon: Package,
      tabIcon: Package,
      features: ["Inventory Management", "Dynamic Pricing", "Service Configuration", "Performance Metrics"],
      insightTitle: "Inventory Control",
      insightText: "Update hotel, transfer, and activity inventory with live pricing.",
      analyticsTitle: "Supplier Performance",
      analyticsText: "Monitor response times, margins, and booking conversion rates.",
      panelLabel: "Live Supplier Sync",
      panelGradient: "from-[#1597A5] to-[#38B2AC]",
      panelOverlay: "from-[#1597A5]/50",
      panelGlow: "bg-[#49D6C7]/25",
      panelGridSize: "52px 52px",
    },
    b2b: {
      title: "B2B Agent",
      icon: Users,
      tabIcon: Users,
      features: ["Agent Commission Tracking", "Co-branding Options", "Lead Distribution", "Joint Marketing Tools"],
      insightTitle: "Partner Growth",
      insightText: "Enable sub-agents with branded tools and centralized control.",
      analyticsTitle: "Commission Visibility",
      analyticsText: "Track payouts, incentives, and booking sources in one place.",
      panelLabel: "Agent Network Intelligence",
      panelGradient: "from-[#5C6AC4] to-[#7C8BF5]",
      panelOverlay: "from-[#5C6AC4]/50",
      panelGlow: "bg-[#90A0FF]/25",
      panelGridSize: "58px 58px",
    },
    b2c: {
      title: "B2C Portal",
      icon: ShoppingCart,
      tabIcon: ShoppingCart,
      features: ["Easy Search & Book", "Secure Payments", "Trip Itineraries", "24/7 Support"],
      insightTitle: "Customer Experience",
      insightText: "Beautiful booking flow for your end customers across devices.",
      analyticsTitle: "Conversion Pulse",
      analyticsText: "Understand demand trends and optimize offers instantly.",
      panelLabel: "Demand & Booking Trends",
      panelGradient: "from-[#3F8CFF] to-[#60A5FA]",
      panelOverlay: "from-[#3F8CFF]/50",
      panelGlow: "bg-[#7CB6FF]/25",
      panelGridSize: "60px 60px",
    },
  };

  const activeContent = tabContent[activeTab as keyof typeof tabContent];
  const ActiveTabIcon = activeContent.tabIcon;
  const ActivePanelIcon = activeContent.icon;

  const panelLines = {
    admin: [
      "M 0 250 Q 150 200 250 230 T 450 150 T 650 200 T 850 120 T 1000 80",
      "M 0 280 Q 200 250 300 270 T 550 220 T 750 240 T 1000 180",
      "M 0 200 Q 100 250 200 210 T 500 280 T 700 200 T 1000 220",
    ],
    supplier: [
      "M 0 220 Q 180 260 320 210 T 620 180 T 1000 120",
      "M 0 290 Q 220 240 380 250 T 700 210 T 1000 170",
      "M 0 170 Q 140 130 330 180 T 640 240 T 1000 190",
    ],
    b2b: [
      "M 0 260 Q 130 210 280 225 T 540 170 T 820 150 T 1000 95",
      "M 0 295 Q 170 260 350 245 T 650 225 T 1000 175",
      "M 0 180 Q 160 230 320 205 T 620 165 T 1000 230",
    ],
    b2c: [
      "M 0 245 Q 160 180 310 220 T 560 155 T 820 140 T 1000 90",
      "M 0 285 Q 210 245 360 255 T 670 205 T 1000 165",
      "M 0 210 Q 130 255 300 225 T 610 195 T 1000 230",
    ],
  };

  const activeLines = panelLines[activeTab as keyof typeof panelLines];

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
            <Settings className="w-4 h-4 inline mr-2" />
            Admin Portal
          </button>
          <button 
            onClick={() => setActiveTab("supplier")}
            className={`font-semibold px-6 py-2.5 rounded-xl transition-all ${activeTab === "supplier" ? "bg-[#412A86] text-white shadow-md" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Supplier portal
          </button>
          <button 
            onClick={() => setActiveTab("b2b")}
            className={`font-semibold px-6 py-2.5 rounded-xl transition-all ${activeTab === "b2b" ? "bg-[#412A86] text-white shadow-md" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            B2B Agent
          </button>
          <button 
            onClick={() => setActiveTab("b2c")}
            className={`font-semibold px-6 py-2.5 rounded-xl transition-all ${activeTab === "b2c" ? "bg-[#412A86] text-white shadow-md" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            <ShoppingCart className="w-4 h-4 inline mr-2" />
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
              <ActiveTabIcon className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
              <h3 className="font-bold text-gray-900 text-lg">{activeContent.insightTitle}</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {activeContent.insightText}
            </p>
          </div>

          {/* Text Column 2 */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <LineChart className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
              <h3 className="font-bold text-gray-900 text-lg">{activeContent.analyticsTitle}</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {activeContent.analyticsText}
            </p>
          </div>
        </div>

        {/* Graphic Box */}
        <div className={`w-full relative rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 bg-gradient-to-r ${activeContent.panelGradient} flex flex-col justify-center items-center h-[350px] md:h-[450px] transition-all duration-500`}>
          
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.4) 2px, transparent 2px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 2px, transparent 2px)",
            backgroundSize: activeContent.panelGridSize
          }}></div>
          
          {/* Central Pill */}
          <div className="relative z-20 text-center px-4 mb-4">
            <div className="inline-flex items-center justify-center bg-white rounded-full px-6 py-3 text-gray-900 font-bold shadow-xl border border-white/40 gap-2">
              <ActivePanelIcon className="w-5 h-5 text-blue-500" />
              {activeContent.panelLabel}
            </div>
          </div>
          
          {/* Floating Line Charts SVGs */}
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center w-full h-full">
            <svg viewBox="0 0 1000 300" className="w-full h-full object-cover overflow-visible drop-shadow-xl" preserveAspectRatio="none">
              <path d={activeLines[0]} fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
              <path d={activeLines[1]} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" />
              <path d={activeLines[2]} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          
          {/* Highlight Gradient Overlay for depth */}
          <div className={`absolute inset-0 bg-gradient-to-t ${activeContent.panelOverlay} to-transparent z-10 pointer-events-none`}></div>
          
          {/* Faint center glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${activeContent.panelGlow} blur-3xl rounded-full z-0 pointer-events-none`}></div>

        </div>

      </div>
    </section>
  );
};

export default ProductShowcase;
