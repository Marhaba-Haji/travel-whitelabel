import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, PackageOpen, Users, ShoppingCart, BarChart3, ArrowRight, Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

const portals = [
  {
    id: "admin",
    name: "Admin Portal",
    icon: Settings,
    color: "from-aurora-purple to-aurora-blue",
    description: "Complete control center for your travel business operations",
    features: ["Real-time Bookings", "Nyra AI Tracking", "Revenue Analytics", "Credit Reports"],
    mockup: {
      title: "Admin Portal",
      subtitle: "Real-time daily statistics",
      urlPath: "youragency.com/admin",
      stats: [
        { label: "Net revenue", value: "₹2,45,000", color: "text-foreground" },
        { label: "Real time stats", value: "104", color: "text-aurora-teal" },
        { label: "Revenue ratio", value: "43%", color: "text-foreground" },
      ],
      chartBars: [65, 45, 80, 55, 90, 70, 85],
    },
  },
  {
    id: "supplier",
    name: "Supplier Portal",
    icon: PackageOpen,
    color: "from-aurora-teal to-emerald-500",
    description: "Dedicated access for suppliers to manage inventory & rates",
    features: ["Inventory Management", "Rate Configuration", "Availability Calendar", "Performance Analytics"],
    mockup: {
      title: "Supplier Dashboard",
      subtitle: "Manage your supplier network",
      urlPath: "youragency.com/supplier",
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
    color: "from-aurora-blue to-aurora-teal",
    description: "Professional booking interface for travel agents & partners",
    features: ["Quick Search", "Commission Tracking", "Credit Management", "White-Label Access"],
    mockup: {
      title: "Agent Console",
      subtitle: "Track your commissions and bookings",
      urlPath: "youragency.com/agent",
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
    color: "from-aurora-teal to-emerald-500",
    description: "Beautiful booking experience for your end customers",
    features: ["Easy Search & Book", "Secure Payments", "Trip Itineraries", "24/7 Support"],
    mockup: {
      title: "Book Your Trip",
      subtitle: "Discover amazing destinations",
      urlPath: "youragency.com/book",
      stats: [
        { label: "Destinations", value: "500+", color: "text-foreground" },
        { label: "Happy Travelers", value: "10K+", color: "text-aurora-teal" },
        { label: "Best Price", value: "✓", color: "text-foreground" },
      ],
      chartBars: [80, 65, 90, 70, 85, 75, 95],
    },
  },
];

const tabContentVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.2, ease: "easeIn" as const } },
};

const featureVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.15 + i * 0.07, duration: 0.35, ease: "easeOut" as const },
  }),
};

const AnimatedBar = ({ height, color, index, isVisible }: { height: number; color: string; index: number; isVisible: boolean }) => (
  <motion.div
    className={`flex-1 rounded-t bg-gradient-to-t ${color} opacity-80`}
    initial={{ height: 0 }}
    animate={isVisible ? { height: `${height}%` } : { height: 0 }}
    transition={{ duration: 0.6, delay: 0.1 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
  />
);

const TILT_MAX = 8;

const DashboardMockup = ({ portal, isVisible }: { portal: typeof portals[number]; isVisible: boolean }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothRotateX = useSpring(rotateX, { stiffness: 400, damping: 30 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 400, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    rotateY.set(x * TILT_MAX);
    rotateX.set(-y * TILT_MAX);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
  <div className="relative" ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ perspective: 1000 }}>
    <motion.div
      className="glass-card rounded-2xl overflow-hidden"
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b-surface">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
        </div>
        <div className="flex-1 glass rounded-md px-3 py-1 text-xs text-muted-foreground">
          {portal.mockup.urlPath}
        </div>
        <Badge className="text-[10px] bg-aurora-teal/20 text-aurora-teal border-aurora-teal/30">Live</Badge>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="font-semibold text-foreground text-lg">{portal.mockup.title}</h4>
            <p className="text-xs text-muted-foreground">{portal.mockup.subtitle}</p>
          </div>
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${portal.color} flex items-center justify-center`}>
            <portal.icon className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {portal.mockup.stats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="glass rounded-xl p-3 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
            >
              <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
              <span className={`text-lg sm:text-xl font-bold ${stat.color}`}>{stat.value}</span>
            </motion.div>
          ))}
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Weekly Overview</span>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-end justify-between gap-2 h-20">
            {portal.mockup.chartBars.map((height, idx) => (
              <AnimatedBar key={idx} height={height} color={portal.color} index={idx} isVisible={isVisible} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>

    <div className="absolute -top-6 -right-6 w-40 h-40 bg-aurora-purple/7 rounded-full blur-3xl pointer-events-none" />
  </div>
  );
};

const ProductShowcase = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  const [activeTab, setActiveTab] = useState("admin");
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ["start end", "end start"] });
  const mockupY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const activePortal = portals.find((p) => p.id === activeTab) || portals[0];

  return (
    <section ref={parallaxRef} className="py-24 relative overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 900px' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_left,_hsl(270_70%_58%_/_0.04),_transparent_50%)]" />

      <div
        ref={sectionRef}
        className={`container mx-auto px-4 relative opacity-0 ${sectionVisible ? "animate-fade-in" : ""}`}
      >
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            See It In Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four integrated portals powering every side of your travel business
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto mb-10">
            {portals.map((portal) => (
              <TabsTrigger
                key={portal.id}
                value={portal.id}
                className="glass px-4 py-2.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 dark:data-[state=active]:bg-white/10 transition-all text-sm"
              >
                <portal.icon className="h-4 w-4 mr-2" />
                {portal.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left — animated features */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + "-info"}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col justify-center"
              >
                <div className="inline-flex items-center gap-2 mb-4">
                  <motion.div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activePortal.color} flex items-center justify-center`}
                    layoutId="portal-icon"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <activePortal.icon className="h-5 w-5 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-foreground">{activePortal.name}</h3>
                </div>

                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  {activePortal.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {activePortal.features.map((feature, i) => (
                    <motion.li
                      key={feature}
                      custom={i}
                      variants={featureVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${activePortal.color} flex items-center justify-center flex-shrink-0`}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                <Button asChild className="rounded-full px-6 group bg-gradient-to-r from-aurora-blue to-primary hover:shadow-[0_0_20px_hsl(210_100%_50%_/_0.3)] transition-shadow w-fit">
                  <a href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </motion.div>
            </AnimatePresence>

            {/* Right — animated mockup with parallax */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + "-mockup"}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ y: mockupY }}
              >
                <DashboardMockup portal={activePortal} isVisible={sectionVisible} />
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export default ProductShowcase;
