import { useEffect, useState } from "react";

function calc(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    expired: diff <= 0,
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  };
}

const Cell = ({ n, label, dark }: { n: number; label: string; dark?: boolean }) => (
  <div className="flex flex-col items-center min-w-[42px]">
    <span
      className={`mh-num text-xl sm:text-2xl font-extrabold leading-none ${
        dark ? "text-[#f6ecd4]" : "text-[var(--mh-green)]"
      }`}
    >
      {String(n).padStart(2, "0")}
    </span>
    <span
      className={`text-[9px] uppercase tracking-[0.16em] mt-1 ${
        dark ? "text-[#f6ecd4]/65" : "text-[var(--mh-ink-soft)]"
      }`}
    >
      {label}
    </span>
  </div>
);

interface Props {
  deadlineISO: string;
  dark?: boolean;
  className?: string;
}

const UmrahCountdown = ({ deadlineISO, dark = false, className = "" }: Props) => {
  const target = new Date(deadlineISO).getTime();
  const [t, setT] = useState(() => calc(target));

  useEffect(() => {
    const id = setInterval(() => setT(calc(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (t.expired) {
    return (
      <span className={`mh-chip mh-chip-gold ${className}`}>Bookings closed — join the waitlist</span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Time left to book">
      <Cell n={t.d} label="days" dark={dark} />
      <span className={dark ? "text-[#f6ecd4]/40 -mt-3" : "text-[var(--mh-line)] -mt-3"}>:</span>
      <Cell n={t.h} label="hrs" dark={dark} />
      <span className={dark ? "text-[#f6ecd4]/40 -mt-3" : "text-[var(--mh-line)] -mt-3"}>:</span>
      <Cell n={t.m} label="min" dark={dark} />
      <span className={dark ? "text-[#f6ecd4]/40 -mt-3" : "text-[var(--mh-line)] -mt-3"}>:</span>
      <Cell n={t.s} label="sec" dark={dark} />
    </div>
  );
};

export default UmrahCountdown;
