import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Star,
  TrendingUp,
  Users,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import TypewriterText from "@/components/TypewriterText";
import AnimatedCounter from "@/components/AnimatedCounter";

const ROTATING_BENEFITS = [
  "Be Your Own Boss",
  "Earning Potential: ₹50,000+/mo",
  "Travel at Insider Rates",
  "Work From Anywhere",
  "Launch-Ready in 24 Hours",
  "Build Your Dream Business",
];

const Hero = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();

  return (
    <section className="relative pt-24 pb-8 lg:pt-32 lg:pb-24 overflow-hidden min-h-screen flex items-center">
      {/* Aurora gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(230,40%,10%)] via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_hsl(220_80%_40%_/_0.25),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,_hsl(270_70%_58%_/_0.1),_transparent_50%)]" />

      {/* Floating ambient blobs */}
      <div className="absolute top-10 left-5 w-60 h-60 bg-aurora-blue/20 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-32 right-5 w-72 h-72 bg-aurora-purple/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />

      <div
        ref={heroRef}
        className={`container mx-auto px-4 relative z-10 opacity-0 ${heroVisible ? "animate-fade-in" : ""}`}
      >
        {/* =========== MOBILE LAYOUT (centered, single column) =========== */}
        <div className="flex flex-col items-center text-center lg:hidden">
          <h1 className="text-[2.5rem] md:text-5xl font-bold text-foreground leading-[1.1] mb-3">
            Start Your Own
            <span className="block aurora-gradient-text animate-gradient-shift bg-[length:200%_auto] italic py-1">
              Travel Agency
            </span>
            in 24 Hours
          </h1>

          <div className="text-lg text-muted-foreground mb-6 min-h-[1.75rem] flex items-center justify-center">
            <TypewriterText
              words={ROTATING_BENEFITS}
              className="text-muted-foreground font-medium"
              typingSpeed={80}
              deletingSpeed={40}
              pauseDuration={3000}
              pausePerChar={100}
            />
          </div>

          {/* Hero illustration — screen blend makes dark bg invisible */}
          <div className="relative -mx-6 mb-4">
            <img
              src="/assets/hero-globe-illustration.png"
              alt="3D globe with airplane, compass and suitcase"
              width={749}
              height={418}
              fetchPriority="high"
              className="w-full max-w-lg mx-auto object-contain"
            />
          </div>

          {/* CTA */}
          <Button
            size="lg"
            asChild
            className="w-full max-w-sm h-14 rounded-full text-lg font-semibold bg-gradient-to-r from-aurora-blue via-primary to-aurora-blue bg-[length:200%_auto] animate-gradient-shift shadow-[0_0_30px_hsl(210_100%_50%_/_0.3)] hover:shadow-[0_0_40px_hsl(210_100%_50%_/_0.5)] transition-shadow group"
          >
            <a href="/signup">
              Start My Travel Business
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>

          {/* Social proof pill */}
          <div className="mt-6 flex items-center gap-3 glass px-5 py-3 rounded-full">
            <div className="flex -space-x-2.5">
              {["A", "F", "R", "Z", "H"].map((letter, i) => (
                <div
                  key={letter}
                  className="w-8 h-8 rounded-full border-2 border-card bg-gradient-to-br from-primary/30 to-aurora-blue/40 flex items-center justify-center text-[10px] font-bold text-foreground/80"
                  style={{ zIndex: 5 - i }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">5,000+</span> travelers
            </span>
          </div>
        </div>

        {/* =========== DESKTOP LAYOUT (2-column: text left, globe right) =========== */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_1.1fr] gap-8 xl:gap-12 items-center">
          {/* Left — Text & CTA */}
          <div className="text-left">
            <h1 className="text-6xl xl:text-7xl font-bold text-foreground leading-[1.08] mb-4">
              Start Your Own
              <span className="block aurora-gradient-text animate-gradient-shift bg-[length:200%_auto] italic py-1">
                Travel Agency
              </span>
              in 24 Hours
            </h1>

            <div className="text-xl text-muted-foreground mb-8 min-h-[2rem] flex items-center">
              <TypewriterText
                words={ROTATING_BENEFITS}
                className="text-muted-foreground font-medium"
                typingSpeed={80}
                deletingSpeed={40}
                pauseDuration={3000}
                pausePerChar={100}
              />
            </div>

            {/* Trust stats row */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  <AnimatedCounter end={2000} suffix="+" className="text-primary font-bold" /> Customers
                </span>
              </div>
              <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  <span className="text-primary font-bold">₹</span><AnimatedCounter end={5} className="text-primary font-bold" /><span className="text-primary font-bold">Cr+</span> Booked
                </span>
              </div>
              <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-sm font-medium">
                  <span className="text-primary font-bold">4.7</span> Rating
                </span>
              </div>
            </div>

            {/* CTA + WhatsApp */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                size="lg"
                asChild
                className="h-14 rounded-full text-lg font-semibold px-10 bg-gradient-to-r from-aurora-blue via-primary to-aurora-blue bg-[length:200%_auto] animate-gradient-shift shadow-[0_0_30px_hsl(210_100%_50%_/_0.3)] hover:shadow-[0_0_40px_hsl(210_100%_50%_/_0.5)] transition-shadow group"
              >
                <a href="/signup">
                  Start My Travel Business
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>Have questions?</span>
              <a
                href="https://wa.me/919008447887"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                Talk to a Success Coach
              </a>
            </div>

            {/* Avatar row */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2.5">
                {["A", "F", "R", "Z", "H"].map((letter, i) => (
                  <div
                    key={letter}
                    className="w-9 h-9 rounded-full border-2 border-card bg-gradient-to-br from-primary/30 to-aurora-blue/40 flex items-center justify-center text-[10px] font-bold text-foreground/80"
                    style={{ zIndex: 5 - i }}
                  >
                    {letter}
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-card bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  +
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                <AnimatedCounter end={5000} suffix="+" className="font-bold text-primary" /> travelers looking for agents
              </span>
            </div>
          </div>

          {/* Right — Globe illustration, oversized for impact */}
          <div className="relative -mr-12 xl:-mr-16">
            <img
              src="/assets/hero-globe-illustration.png"
              alt="3D globe with airplane, compass and suitcase"
              width={1376}
              height={768}
              fetchPriority="high"
              className="w-[115%] max-w-none object-contain"
            />

            {/* Floating metric card */}
            <div className="absolute top-[8%] right-[8%] glass-card rounded-xl p-4 aurora-glow animate-float z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Earning Potential</p>
                  <p className="text-lg font-bold text-primary">₹50,000+/mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
