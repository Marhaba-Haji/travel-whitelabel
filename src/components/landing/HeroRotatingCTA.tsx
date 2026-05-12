import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useHeroContent } from "@/hooks/useHeroContent";

const HeroRotatingCTAInner = () => {
  const { heroContent } = useHeroContent();
  return (
    <Button
      size="lg"
      asChild
      className="h-12 rounded-full text-sm sm:text-[15px] font-semibold px-6 whitespace-nowrap bg-[#412A86] hover:bg-[#412A86]/90 text-white shadow-[0_10px_24px_-10px_rgba(65,42,134,0.55)] hover:shadow-[0_14px_30px_-12px_rgba(65,42,134,0.6)] hover:-translate-y-0.5 transition-all duration-300"
    >
      <a key={heroContent?.id || "hero-cta"} href={heroContent?.cta_url || "/signup"}>
        {heroContent?.cta_text || "Get Started"}
      </a>
    </Button>
  );
};

export const HeroRotatingCTA = memo(HeroRotatingCTAInner);
export default HeroRotatingCTA;
