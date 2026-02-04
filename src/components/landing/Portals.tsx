import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, PackageOpen, Users, ShoppingCart, BarChart3, Calendar, CreditCard, Search } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Portals = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const portals = [
    {
      icon: Settings,
      title: "Admin Portal",
      badge: "Full Control",
      description: "Complete management dashboard for your travel business",
      color: "from-primary to-primary/70",
      accentBg: "bg-primary/5",
      accentBorder: "border-primary/20",
      features: [
        "Holiday Packages",
        "Hajj & Umrah Packages",
        "Visa Management",
        "Transport Services",
        "Activities & Tours",
        "Guide Management",
      ],
      mockup: {
        title: "Admin Dashboard",
        stats: [
          { label: "Total Bookings", value: "2,450" },
          { label: "Revenue", value: "₹24L" },
        ],
        icon: BarChart3,
      },
    },
    {
      icon: PackageOpen,
      title: "Supplier Portal",
      badge: "Content Access",
      description: "Give your suppliers dedicated access to manage their content",
      color: "from-emerald-500 to-emerald-500/70",
      accentBg: "bg-emerald-500/5",
      accentBorder: "border-emerald-500/20",
      features: [
        "Product Management",
        "Inventory Control",
        "Rate Updates",
        "Availability Calendar",
        "Performance Reports",
        "Commission Tracking",
      ],
      mockup: {
        title: "Inventory Manager",
        stats: [
          { label: "Products", value: "156" },
          { label: "Active", value: "98%" },
        ],
        icon: Calendar,
      },
    },
    {
      icon: Users,
      title: "B2B Agent Portal",
      badge: "For Agents",
      description: "Professional portal for your travel agent network",
      color: "from-violet-500 to-violet-500/70",
      accentBg: "bg-violet-500/5",
      accentBorder: "border-violet-500/20",
      features: [
        "Agent Dashboard",
        "Booking Management",
        "Commission View",
        "Credit System",
        "Markup Control",
        "White-Label Access",
      ],
      mockup: {
        title: "Agent Console",
        stats: [
          { label: "Commission", value: "₹45K" },
          { label: "Bookings", value: "89" },
        ],
        icon: CreditCard,
      },
    },
    {
      icon: ShoppingCart,
      title: "B2C Portal",
      badge: "Direct Sales",
      description: "Customer-facing portal for direct bookings",
      color: "from-amber-500 to-amber-500/70",
      accentBg: "bg-amber-500/5",
      accentBorder: "border-amber-500/20",
      features: [
        "Easy Search & Book",
        "User Accounts",
        "Payment Gateway",
        "Booking History",
        "Travel Itineraries",
        "Customer Support",
      ],
      mockup: {
        title: "Book Your Trip",
        stats: [
          { label: "Destinations", value: "500+" },
          { label: "Happy Users", value: "10K+" },
        ],
        icon: Search,
      },
    },
  ];

  return (
    <section id="portals" className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-1 rounded-full mb-4">
            Multi-Portal System
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Four Powerful Portals, One Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage every aspect of your travel business with dedicated portals for admins, suppliers, agents, and customers.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 gap-6">
          {portals.map((portal, index) => (
            <Card
              key={portal.title}
              className={`hover:shadow-xl transition-all duration-300 opacity-0 ${portal.accentBg} ${portal.accentBorder} border ${gridVisible ? "animate-fade-in" : ""}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${portal.color} flex items-center justify-center shadow-lg`}>
                    <portal.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <Badge className={`bg-gradient-to-r ${portal.color} text-primary-foreground border-0`}>
                    {portal.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{portal.title}</CardTitle>
                <CardDescription className="text-base">{portal.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Mini Mockup Preview */}
                <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                  {/* Mockup Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-destructive/50" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      <div className="w-2 h-2 rounded-full bg-primary/50" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">{portal.mockup.title}</span>
                  </div>
                  
                  {/* Mockup Content */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${portal.color} flex items-center justify-center`}>
                      <portal.mockup.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      {portal.mockup.stats.map((stat) => (
                        <div key={stat.label}>
                          <div className="text-sm font-bold text-foreground">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <ul className="grid grid-cols-2 gap-2">
                  {portal.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${portal.color}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Request Demo Button */}
                <Button variant="outline" size="sm" className="w-full mt-2 group" onClick={scrollToContact}>
                  Request Demo
                  <Calendar className="ml-2 h-3 w-3 group-hover:scale-110 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portals;
