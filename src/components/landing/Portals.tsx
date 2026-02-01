import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, PackageOpen, Users, ShoppingCart } from "lucide-react";

const Portals = () => {
  const portals = [
    {
      icon: Settings,
      title: "Admin Portal",
      badge: "Full Control",
      description: "Complete management dashboard for your travel business",
      features: [
        "Holiday Packages",
        "Hajj & Umrah Packages",
        "Visa Management",
        "Transport Services",
        "Activities & Tours",
        "Guide Management",
      ],
    },
    {
      icon: PackageOpen,
      title: "Supplier Portal",
      badge: "Content Access",
      description: "Give your suppliers dedicated access to manage their content",
      features: [
        "Product Management",
        "Inventory Control",
        "Rate Updates",
        "Availability Calendar",
        "Performance Reports",
        "Commission Tracking",
      ],
    },
    {
      icon: Users,
      title: "B2B Agent Portal",
      badge: "For Agents",
      description: "Professional portal for your travel agent network",
      features: [
        "Agent Dashboard",
        "Booking Management",
        "Commission View",
        "Credit System",
        "Markup Control",
        "White-Label Access",
      ],
    },
    {
      icon: ShoppingCart,
      title: "B2C Portal",
      badge: "Direct Sales",
      description: "Customer-facing portal for direct bookings",
      features: [
        "Easy Search & Book",
        "User Accounts",
        "Payment Gateway",
        "Booking History",
        "Travel Itineraries",
        "Customer Support",
      ],
    },
  ];

  return (
    <section id="portals" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Multi-Portal System
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Four Powerful Portals, One Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage every aspect of your travel business with dedicated portals for admins, suppliers, agents, and customers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {portals.map((portal) => (
            <Card key={portal.title} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <portal.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{portal.badge}</Badge>
                </div>
                <CardTitle className="text-xl">{portal.title}</CardTitle>
                <CardDescription className="text-base">{portal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-2 gap-2">
                  {portal.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portals;
