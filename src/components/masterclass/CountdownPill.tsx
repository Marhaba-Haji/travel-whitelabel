import { useEffect, useState } from "react";

function calc(target: number) {
  const diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { d, h, m, s };
}

const Block = ({ n, label }: { n: number; label: string }) => (
  <div className="flex flex-col items-center min-w-[44px]">
    <div className="mc-num font-extrabold text-2xl sm:text-3xl leading-none text-[var(--mc-on-surface)]">
      {String(n).padStart(2, "0")}
    </div>
    <div className="text-[9px] uppercase tracking-[0.18em] text-[var(--mc-on-surface-variant)] mt-1.5">
      {label}
    </div>
  </div>
);

interface Props {
  scheduledAt: string;
  className?: string;
  /** "light" = compact, glassy. "dark" = solid violet container. */
  variant?: "light" | "dark";
  compact?: boolean;
}

const CountdownPill = ({ scheduledAt, className = "", variant = "dark", compact = false }: Props) => {
  const target = new Date(scheduledAt).getTime();
  const [t, setT] = useState(() => calc(target));
  useEffect(() => {
    const id = setInterval(() => setT(calc(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const base =
    variant === "dark"
      ? "bg-[var(--mc-tertiary-container)]/80 border border-[rgba(208,188,255,0.25)]"
      : "bg-white/[0.04] border border-[rgba(213,189,240,0.15)]";

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-2xl px-4 py-2.5 backdrop-blur-md ${base} ${
        compact ? "scale-90 origin-center md:origin-left" : ""
      } ${className}`}
    >
      <Block n={t.d} label="days" />
      <span className="text-[var(--mc-outline)] -mt-3">:</span>
      <Block n={t.h} label="hrs" />
      <span className="text-[var(--mc-outline)] -mt-3">:</span>
      <Block n={t.m} label="min" />
      <span className="text-[var(--mc-outline)] -mt-3">:</span>
      <Block n={t.s} label="sec" />
    </div>
  );
};

export default CountdownPill;
