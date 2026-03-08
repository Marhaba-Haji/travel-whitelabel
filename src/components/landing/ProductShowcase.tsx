import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, PackageOpen, Users, ShoppingCart, BarChart3, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const ProductShowcase = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();
  const [activeTab, setActiveTab] = useState("admin");

  const portals = [
    {
      id: "admin",
      name: "Admin Portal",
      icon: Settings,
      color: "from-aurora-purple to-aurora-blue",
      description: "A high-fidelity dashboard preview (Admin Portal)",
      features: ["Real Bookings", "Nyra Tracking", "Health Incomes", "Credit Report"],
      mockup: {
        title: "Admin Portal",
        subtitle: "Real-time daily statistics",
        stats: [
          { label: "Net revenue", value: "₹2,45,000", color: "text-foreground" },
          { label: "Real time stats", value: "104", color: "text-aurora-teal" },
          { label: "Revenue ratio", value: "43", color: "text-foreground" },
        ],
        chartBars: [65, 45, 80, 55, 90, 70, 85],
      },
    },
    {
      id: "supplier",
      name: "Supplier Portal",
      icon: PackageOpen,
      color: "from-emerald-500 to-aurora-teal",
      description: "Dedicated access for suppliers to manage inventory",
      features: ["Inventory Management", "Rate Configuration", "Availability Calendar", "Performance Analytics"],
      mockup: {
        title: "Supplier Dashboard",
        subtitle: "Manage your supplier network",
        stats: [
          { label: "Active Products", value: "245", color: "text-foreground" },
          { label: "This Month", value: "₹12.5L", color: "text-aurora-teal" },
          { label: "Occupancy", value: "78%", color: "text-foreground" },
        ],
        chartBars: [70, 85, 60, 75, 90, 65, 80],
      },
    },
    {
      id: "agent",
      name: "B2B Agent",
      icon: Users,
      color: "from-violet-500 to-aurora-purple",
      description: "Professional booking interface for travel agents",
      features: ["Quick Search", "Commission Tracking", "Credit Management", "White-Label Access"],
      mockup: {
        title: "Agent Console",
        subtitle: "Track your commissions and bookings",
        stats: [
          { label: "Commission", value: "₹45,200", color: "text-foreground" },
          { label: "Bookings", value: "89", color: "text-aurora-teal" },
          { label: "Credit", value: "₹1.2L", color: "text-foreground" },
        ],
        chartBars: [55, 70, 45, 85, 60, 75, 90],
      },
    },
    {
      id: "b2c",
      name: "B2C Portal",
      icon: ShoppingCart,
      color: "from-amber-500 to-aurora-pink",
      description: "Beautiful booking experience for end customers",
      features: ["Easy Search & Book", "Secure Payments", "Trip Itineraries", "24/7 Support"],
      mockup: {
        title: "Book Your Trip",
        subtitle: "Discover amazing destinations",
        stats: [
          { label: "Destinations", value: "500+", color: "text-foreground" },
          { label: "Happy Travelers", value: "10K+", color: "text-aurora-teal" },
          { label: "Best Price", value: "✓", color: "text-foreground" },
        ],
        chartBars: [80, 65, 90, 70, 85, 75, 95],
      },
    },
  ];

  const activePortal = portals.find((p) => p.id === activeTab) || portals[0];

  return (
    <section className="py-24 relative overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 900px' }}>
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_left,_hsl(270_70%_58%_/_0.06),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div
          ref={headerRef}
          className={`mb-14 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            See It In Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            A high-fidelity dashboard preview (Admin Portal)
          </p>
        </div>

        <div
          ref={contentRef}
          className={`opacity-0 ${contentVisible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.1s" }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
              {/* Left — description and features */}
              <div>
                <ul className="space-y-2 mb-8">
                  {activePortal.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-aurora-teal" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button asChild className="rounded-full px-6 group bg-gradient-to-r from-aurora-blue to-primary hover:shadow-[0_0_20px_hsl(210_100%_50%_/_0.3)] transition-shadow">
                  <a href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>

                {/* Tab switcher — below CTA */}
                <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto mt-10">
                  {portals.map((portal) => (
                    <TabsTrigger
                      key={portal.id}
                      value={portal.id}
                      className="glass px-3 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:border-primary/40 transition-all text-sm"
                    >
                      <portal.icon className="h-4 w-4 mr-1.5" />
                      <span className="hidden sm:inline">{portal.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Right — mockup preview */}
              {portals.map((portal) => (
                <TabsContent key={portal.id} value={portal.id} className="mt-0">
                  <div className="relative">
                    {/* Browser frame */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                      {/* Chrome bar */}
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
                        </div>
                        <div className="flex-1 glass rounded-md px-3 py-1 text-xs text-muted-foreground">
                          youragency.com/admin
                        </div>
                        <Badge className="text-[10px] bg-aurora-teal/20 text-aurora-teal border-aurora-teal/30">Palette</Badge>
                      </div>

                      {/* Dashboard content */}
                      <div className="p-6">
                        {/* Dashboard header */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h4 className="font-semibold text-foreground text-lg">{portal.mockup.title}</h4>
                            <p className="text-xs text-muted-foreground">{portal.mockup.subtitle}</p>
                          </div>
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${portal.color} flex items-center justify-center`}>
                            <portal.icon className="h-4 w-4 text-white" />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          {portal.mockup.stats.map((stat, idx) => (
                            <div key={idx} className="glass rounded-xl p-3">
                              <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
                              <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Chart */}
                        <div className="glass rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-foreground">Overview Bookings</span>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex items-end justify-between gap-2 h-20">
                            {portal.mockup.chartBars.map((height, idx) => (
                              <div
                                key={idx}
                                className={`flex-1 rounded-t bg-gradient-to-t ${portal.color}`}
                                style={{ height: `${height}%` }}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                              <span key={d}>{d}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative glow */}
                    <div className="absolute -top-6 -right-6 w-40 h-40 bg-aurora-purple/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-aurora-blue/10 rounded-full blur-2xl" />
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
