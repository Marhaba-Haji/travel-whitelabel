import { Badge } from "@/components/ui/badge";
import { Settings, PackageOpen, Users, ShoppingCart, BarChart3 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Portals = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const portals = [
    {
      icon: Settings,
      title: "Admin Portal",
      badge: "Admin Portal",
      badgeColor: "bg-aurora-purple/20 text-aurora-purple border-aurora-purple/30",
      color: "from-aurora-purple to-aurora-blue",
      description: "Complete command-line dashboard for your travel business.",
      stats: [
        { icon: BarChart3, label: "Revenue Bookings", value: "3,450" },
        { label: "Revenue", value: "₹24L" },
      ],
      features: [
        "Holiday Packages",
        "Transport Services",
        "Hajj & Umrah",
        "Visa Management",
        "Activities & Tours",
        "Credit Management",
      ],
    },
    {
      icon: PackageOpen,
      title: "Supplier",
      badge: "Supplier Portal",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      color: "from-emerald-500 to-aurora-teal",
      description: "Manage your supplier hub and connect to manage from backend.",
      stats: [
        { icon: PackageOpen, label: "Supplier Bookings", value: "360" },
        { label: "Suppliers", value: "906" },
      ],
      features: [
        "Booking Management",
        "Enquiries Control",
        "Rate Updates",
        "Availability Calendar",
        "Performance Report",
        "Commission Support",
      ],
    },
    {
      icon: Users,
      title: "B2B Agent",
      badge: "B2B Portal",
      badgeColor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      color: "from-violet-500 to-aurora-purple",
      description: "Manage all report for your agent-agent commissions.",
      stats: [
        { icon: Users, label: "Total Agents", value: "1630" },
        { label: "Bookings", value: "40" },
      ],
      features: [
        "Agent Dashboard",
        "Booking Management",
        "Commission View",
        "Credit System",
        "Markup Control",
        "Payout Requests",
      ],
    },
    {
      icon: ShoppingCart,
      title: "B2C",
      badge: "B2C Website",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      color: "from-amber-500 to-aurora-pink",
      description: "Manage a modern portal for travel bookings.",
      stats: [
        { icon: ShoppingCart, label: "Total Customers", value: "1,60K" },
        { label: "Destinations", value: "104+" },
      ],
      features: [
        "Easy Search & Book",
        "Curated Activities",
        "User Accounts",
        "Booking History",
        "Payment Gateway",
        "Customer Support",
      ],
    },
  ];

  return (
    <section id="portals" className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(210_100%_50%_/_0.04),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(270_70%_58%_/_0.03),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] glass px-4 py-1.5 rounded-full mb-5">
            Four Powerful Portals
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Four Powerful Portals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage every micro-portal with dealer-status suppliers.
          </p>
        </div>

        {/* 2×2 Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 gap-5">
          {portals.map((portal, index) => (
            <div
              key={portal.title}
              className={`glass-card rounded-2xl p-6 hover:shadow-xl hover:border-white/20 transition-all duration-300 opacity-0 ${gridVisible ? "animate-fade-in" : ""}`}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              {/* Header row: icon + title + badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${portal.color} flex items-center justify-center shadow-lg`}>
                    <portal.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{portal.title}</h3>
                    <p className="text-xs text-muted-foreground">{portal.description}</p>
                  </div>
                </div>
                <Badge className={`text-[10px] shrink-0 ${portal.badgeColor}`}>{portal.badge}</Badge>
              </div>

              {/* Stats row */}
              <div className="flex gap-3 mb-5">
                {portal.stats.map((stat, idx) => (
                  <div key={idx} className="glass rounded-xl px-4 py-3 flex-1">
                    {stat.icon && <stat.icon className="h-3.5 w-3.5 text-muted-foreground mb-1" />}
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Feature pills */}
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {portal.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${portal.color}`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portals;
