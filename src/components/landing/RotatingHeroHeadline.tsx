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
      ? "font-poppins text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-2 min-h-[3.2em] md:min-h-[3.6em]"
      : "font-poppins text-6xl xl:text-[5rem] font-bold text-gray-900 leading-[1.08] mb-2 min-h-[3.4em] xl:min-h-[3.8em]";

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
          Travel <span className="text-[#B360E4]">top</span>
          <span className="block text-[#B360E4] py-1">
            destination
          </span>
          of the world
        </motion.span>
      </AnimatePresence>
    </h1>
  );
};

export default RotatingHeroHeadline;
