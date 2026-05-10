import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useHeroContent } from "@/hooks/useHeroContent";

const HeroRotatingCTAInner = () => {
  const { heroContent } = useHeroContent();
  return (
    <Button
      size="lg"
      asChild
      className="h-14 rounded-full text-base font-semibold px-8 bg-[#412A86] hover:bg-[#412A86]/90 text-white shadow-lg transition-shadow"
    >
      <a key={heroContent?.id || "hero-cta"} href={heroContent?.cta_url || "/signup"}>
        {heroContent?.cta_text || "Get Started"}
      </a>
    </Button>
  );
};

export const HeroRotatingCTA = memo(HeroRotatingCTAInner);
export default HeroRotatingCTA;
