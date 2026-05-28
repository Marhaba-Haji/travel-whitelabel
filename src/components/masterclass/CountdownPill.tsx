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
  <div className="flex flex-col items-center">
    <div className="font-mono font-bold text-xl sm:text-2xl tabular-nums leading-none">{String(n).padStart(2, "0")}</div>
    <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1">{label}</div>
  </div>
);

interface Props {
  scheduledAt: string;
  className?: string;
  variant?: "light" | "dark";
}

const CountdownPill = ({ scheduledAt, className = "", variant = "dark" }: Props) => {
  const target = new Date(scheduledAt).getTime();
  const [t, setT] = useState(() => calc(target));
  useEffect(() => {
    const id = setInterval(() => setT(calc(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const colors = variant === "dark"
    ? "bg-[#412A86] text-white"
    : "bg-white text-[#412A86] border border-[#412A86]/15";

  return (
    <div className={`inline-flex items-center gap-4 rounded-2xl px-5 py-3 ${colors} ${className}`}>
      <Block n={t.d} label="days" />
      <span className="opacity-50">:</span>
      <Block n={t.h} label="hrs" />
      <span className="opacity-50">:</span>
      <Block n={t.m} label="min" />
      <span className="opacity-50">:</span>
      <Block n={t.s} label="sec" />
    </div>
  );
};

export default CountdownPill;