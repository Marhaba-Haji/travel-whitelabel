import { Users, Globe, Briefcase, Clock } from "lucide-react";

const Stats = () => {
  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "Travel Agencies",
      description: "Trust our platform",
    },
    {
      icon: Globe,
      value: "50+",
      label: "Countries",
      description: "Global coverage",
    },
    {
      icon: Briefcase,
      value: "1M+",
      label: "Bookings",
      description: "Processed annually",
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Support",
      description: "Always available",
    },
  ];

  return (
    <section className="py-12 bg-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-4">
                <stat.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-primary-foreground/90">
                {stat.label}
              </div>
              <div className="text-xs text-primary-foreground/70">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
