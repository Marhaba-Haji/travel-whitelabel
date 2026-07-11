import { memo } from "react";
import { useHeroContent, type HeroContent } from "@/hooks/useHeroContent";

const TITLE_CLASS =
  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[72px] font-bold text-gray-900 mb-6 font-poppins leading-[1.1] tracking-tight";
const DESC_CLASS =
  "text-base sm:text-lg md:text-xl text-gray-500 mb-10 font-medium max-w-lg leading-relaxed";

/**
 * Owns the rotating hero title/description so that the 5s rotation interval
 * re-renders ONLY this small subtree — not the entire Hero.
 *
 * All slides are rendered stacked in the same grid cell, with inactive ones
 * kept invisible (visibility preserves layout). The container is therefore
 * always as tall as the TALLEST slide, so rotating between short and long
 * titles never changes the hero's height — previously every rotation shifted
 * all sections below the hero up or down.
 */
const HeroRotatingTitleInner = () => {
  const { heroContent, heroContents, loading } = useHeroContent();

  if (loading) {
    return (
      <>
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse mb-6 w-full" />
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-10 w-full max-w-lg" />
      </>
    );
  }

  const renderTitleText = (content: HeroContent | null) => {
    if (!content) {
      return (
        <>
          White Label <span style={{ color: "#B968C7" }} className="font-bold">Travel Portal</span>
          <br />
          for Agents
        </>
      );
    }
    const { title, subtitle, subtitle_color } = content;
    const parts = title.split(subtitle);
    return parts.map((part, index) => (
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
    ));
  };

  const renderDescription = (content: HeroContent | null) =>
    content?.description ||
    "Where adventure meets comfort. We create unforgettable travel experiences";

  const slides: (HeroContent | null)[] = heroContents.length > 0 ? heroContents : [null];
  const activeId = heroContent?.id ?? null;

  return (
    <div className="grid w-full">
      {slides.map((content) => {
        const active = (content?.id ?? null) === activeId;
        return (
          <div
            key={content?.id ?? "hero-fallback"}
            className={`col-start-1 row-start-1 ${active ? "animate-fade-in" : "invisible"}`}
            aria-hidden={!active}
          >
            {/* Only the visible slide is an h1 so the page keeps a single heading */}
            {active ? (
              <h1 className={TITLE_CLASS}>{renderTitleText(content)}</h1>
            ) : (
              <div className={TITLE_CLASS}>{renderTitleText(content)}</div>
            )}
            <p className={DESC_CLASS}>{renderDescription(content)}</p>
          </div>
        );
      })}
    </div>
  );
};

export const HeroRotatingTitle = memo(HeroRotatingTitleInner);
export default HeroRotatingTitle;
