import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface HeadlineTriplet {
  before: string;
  highlight: string;
  after: string;
}

interface RotatingHeroHeadlineProps {
  headlines: HeadlineTriplet[];
  variant: "mobile" | "desktop";
  intervalMs?: number;
}

const ROTATION_INTERVAL_MS = 6000;

const RotatingHeroHeadline = ({
  headlines,
  variant,
  intervalMs = ROTATION_INTERVAL_MS,
}: RotatingHeroHeadlineProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % headlines.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [headlines.length, intervalMs]);

  const h1Class =
    variant === "mobile"
      ? "text-[2.5rem] md:text-5xl font-bold text-foreground leading-[1.1] mb-2 min-h-[3.2em] md:min-h-[3.6em]"
      : "text-6xl xl:text-7xl font-bold text-foreground leading-[1.08] mb-2 min-h-[3.4em] xl:min-h-[3.8em]";

  const current = headlines[index];

  return (
    <h1 className={h1Class} aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="block"
        >
          {current.before}
          <span className="block aurora-gradient-text-static italic py-1">
            {current.highlight}
          </span>
          {current.after}
        </motion.span>
      </AnimatePresence>
    </h1>
  );
};

export default RotatingHeroHeadline;
