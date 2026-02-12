import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Calendar, Rocket, Users, Globe, Award, TrendingUp } from "lucide-react";

const CompanyTimeline = () => {
  const { ref, isVisible } = useScrollAnimation();

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "marhabaDMC was established with a vision to transform halal tourism",
      icon: Rocket,
    },
    {
      year: "2021",
      title: "First 100 Partners",
      description: "Reached milestone of 100 travel partners onboarded",
      icon: Users,
    },
    {
      year: "2022",
      title: "Global Expansion",
      description: "Expanded to 30+ countries with inventory access",
      icon: Globe,
    },
    {
      year: "2023",
      title: "Platform Launch",
      description: "Launched comprehensive WhiteLabel technology platform",
      icon: Award,
    },
    {
      year: "2024",
      title: "500+ Partners",
      description: "Achieved 500+ travel partners milestone",
      icon: TrendingUp,
    },
    {
      year: "2025",
      title: "Hospitality Tech",
      description: "Launching hospitality management platform",
      icon: Calendar,
    },
  ];

  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Our Journey
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Company Timeline & Milestones
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Key moments in marhabaDMC's growth and evolution
            </p>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Vertical Line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30" />

              {/* Milestones */}
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.year}
                    className={`relative flex flex-col md:flex-row items-center gap-6 opacity-0 ${
                      isVisible ? "animate-fade-in" : ""
                    }`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Left Side (Even) */}
                    <div
                      className={`w-full md:w-1/2 ${
                        index % 2 === 0 ? "md:text-right md:pr-8" : "md:text-left md:pl-8 md:order-2"
                      }`}
                    >
                      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-3 md:justify-start md:order-2">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <milestone.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className={index % 2 === 0 ? "md:text-right" : ""}>
                            <div className="text-sm font-semibold text-primary mb-1">{milestone.year}</div>
                            <h3 className="text-lg font-bold text-foreground">{milestone.title}</h3>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">{milestone.description}</p>
                      </div>
                    </div>

                    {/* Center Dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10 hidden md:block" />

                    {/* Right Side (Odd) */}
                    {index % 2 === 1 && (
                      <div className="w-full md:w-1/2 md:order-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Future Vision */}
          <div
            className={`mt-16 text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "1000ms" }}
          >
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-foreground mb-4">Looking Forward</h3>
              <p className="text-muted-foreground text-lg">
                We're just getting started. Our vision is to become the foundational operating layer 
                for halal tourism worldwide, empowering thousands of travel businesses to succeed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyTimeline;
