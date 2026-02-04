import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, PackageOpen, Users, ShoppingCart, BarChart3, Calendar, Wallet, Search, ArrowRight } from "lucide-react";
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
      color: "from-primary to-primary/70",
      description: "Complete control over your travel business operations",
      features: ["Real-time Analytics", "Revenue Tracking", "Agent Management", "Booking Reports"],
      mockup: {
        title: "Admin Dashboard",
        subtitle: "youragency.com/admin",
        stats: [
          { label: "Today's Revenue", value: "₹2,45,000", trend: "+12%" },
          { label: "Active Bookings", value: "156", trend: "+8%" },
          { label: "Agents Online", value: "42", trend: "" },
        ],
        chartBars: [65, 45, 80, 55, 90, 70, 85],
      },
    },
    {
      id: "supplier",
      name: "Supplier Portal",
      icon: PackageOpen,
      color: "from-emerald-500 to-emerald-500/70",
      description: "Dedicated access for suppliers to manage inventory",
      features: ["Inventory Management", "Rate Configuration", "Availability Calendar", "Performance Analytics"],
      mockup: {
        title: "Supplier Dashboard",
        subtitle: "youragency.com/supplier",
        stats: [
          { label: "Active Products", value: "245", trend: "+5" },
          { label: "This Month", value: "₹12.5L", trend: "+18%" },
          { label: "Occupancy", value: "78%", trend: "" },
        ],
        chartBars: [70, 85, 60, 75, 90, 65, 80],
      },
    },
    {
      id: "agent",
      name: "B2B Agent Portal",
      icon: Users,
      color: "from-violet-500 to-violet-500/70",
      description: "Professional booking interface for travel agents",
      features: ["Quick Search", "Commission Tracking", "Credit Management", "White-Label Access"],
      mockup: {
        title: "Agent Console",
        subtitle: "youragency.com/agent",
        stats: [
          { label: "My Commission", value: "₹45,200", trend: "+₹5K" },
          { label: "Bookings", value: "89", trend: "+12" },
          { label: "Credit Balance", value: "₹1.2L", trend: "" },
        ],
        chartBars: [55, 70, 45, 85, 60, 75, 90],
      },
    },
    {
      id: "b2c",
      name: "B2C Customer Portal",
      icon: ShoppingCart,
      color: "from-amber-500 to-amber-500/70",
      description: "Beautiful booking experience for end customers",
      features: ["Easy Search & Book", "Secure Payments", "Trip Itineraries", "24/7 Support"],
      mockup: {
        title: "Book Your Trip",
        subtitle: "youragency.com",
        stats: [
          { label: "Destinations", value: "500+", trend: "" },
          { label: "Happy Travelers", value: "10K+", trend: "" },
          { label: "Best Price", value: "Guaranteed", trend: "" },
        ],
        chartBars: [80, 65, 90, 70, 85, 75, 95],
      },
    },
  ];

  const activePortal = portals.find((p) => p.id === activeTab) || portals[0];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div
          ref={headerRef}
          className={`text-center mb-12 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-1 rounded-full mb-4">
            Product Demo
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            See It In Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our powerful portal system with interactive previews of each interface.
          </p>
        </div>

        <div
          ref={contentRef}
          className={`opacity-0 ${contentVisible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.1s" }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-transparent h-auto mb-8">
              {portals.map((portal) => (
                <TabsTrigger
                  key={portal.id}
                  value={portal.id}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border border-border data-[state=active]:border-primary/50 data-[state=active]:bg-primary/5 transition-all`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${portal.color} flex items-center justify-center`}>
                    <portal.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-medium text-sm hidden sm:inline">{portal.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            {portals.map((portal) => (
              <TabsContent key={portal.id} value={portal.id} className="mt-0">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Left - Description */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${portal.color} flex items-center justify-center shadow-lg`}>
                        <portal.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{portal.name}</h3>
                        <p className="text-muted-foreground">{portal.description}</p>
                      </div>
                    </div>

                    <ul className="grid grid-cols-2 gap-3">
                      {portal.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${portal.color}`} />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-3">
                      <Button asChild className="group">
                        <a href="/signup">
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Right - Mockup Preview */}
                  <div className="relative">
                    {/* Browser Frame */}
                    <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                      {/* Browser Chrome */}
                      <div className="bg-muted/50 px-4 py-3 flex items-center gap-3 border-b border-border">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-destructive/60" />
                          <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                          <div className="w-3 h-3 rounded-full bg-primary/60" />
                        </div>
                        <div className="flex-1 bg-background/50 rounded-lg px-4 py-1.5 text-xs text-muted-foreground">
                          {portal.mockup.subtitle}
                        </div>
                        <Badge variant="secondary" className="text-xs">Live</Badge>
                      </div>

                      {/* Dashboard Content */}
                      <div className="p-6 bg-accent/20">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h4 className="font-semibold text-foreground">{portal.mockup.title}</h4>
                            <p className="text-xs text-muted-foreground">Welcome back, Admin</p>
                          </div>
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${portal.color} flex items-center justify-center`}>
                            <portal.icon className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          {portal.mockup.stats.map((stat, idx) => (
                            <div key={idx} className="bg-card rounded-lg p-3 border border-border">
                              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-foreground">{stat.value}</span>
                                {stat.trend && (
                                  <span className="text-xs text-primary font-medium">{stat.trend}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Mini Chart */}
                        <div className="bg-card rounded-lg p-4 border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-foreground">Weekly Overview</span>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex items-end justify-between gap-2 h-16">
                            {portal.mockup.chartBars.map((height, idx) => (
                              <div
                                key={idx}
                                className={`flex-1 rounded-t bg-gradient-to-t ${portal.color} opacity-80`}
                                style={{ height: `${height}%` }}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative Glow */}
                    <div className={`absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br ${portal.color} opacity-10 rounded-full blur-2xl`} />
                    <div className={`absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br ${portal.color} opacity-10 rounded-full blur-2xl`} />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
