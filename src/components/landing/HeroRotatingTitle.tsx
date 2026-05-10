import { memo } from "react";
import { useHeroContent } from "@/hooks/useHeroContent";

/**
 * Owns the rotating hero title/description/CTA so that the 5s rotation
 * interval re-renders ONLY this small subtree — not the entire Hero
 * (partners scroller, floating cards, decorative SVG, avatars, etc.).
 */
const HeroRotatingTitleInner = () => {
  const { heroContent, loading } = useHeroContent();

  if (loading) {
    return (
      <>
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse mb-6 w-full" />
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-10 w-full max-w-lg" />
      </>
    );
  }

  const renderTitle = () => {
    if (!heroContent) {
      return (
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[72px] font-bold text-gray-900 mb-6 font-poppins leading-[1.1] tracking-tight">
          Travel <span style={{ color: "#B968C7" }} className="font-bold">top destination</span>
          <br />
          of the world
        </h1>
      );
    }
    const { title, subtitle, subtitle_color } = heroContent;
    const parts = title.split(subtitle);
    return (
      <h1
        key={heroContent.id}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[72px] font-bold text-gray-900 mb-6 font-poppins leading-[1.1] tracking-tight"
      >
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <>
                <span style={{ color: subtitle_color }} className="font-bold">
                  {subtitle}
                </span>
                <br />
              </>
            )}
          </span>
        ))}
      </h1>
    );
  };

  return (
    <>
      <div className="animate-fade-in">{renderTitle()}</div>
      <p
        key={`${heroContent?.id || "hero"}-desc`}
        className="text-base sm:text-lg md:text-xl text-gray-500 mb-10 font-medium max-w-lg leading-relaxed animate-fade-in"
      >
        {heroContent?.description ||
          "Where adventure meets comfort. We create unforgettable travel experiences"}
      </p>
    </>
  );
};

export const HeroRotatingTitle = memo(HeroRotatingTitleInner);
export default HeroRotatingTitle;
