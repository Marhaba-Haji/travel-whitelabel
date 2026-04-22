import { useEffect, useState } from "react";

interface Options {
  enabled?: boolean;
  onlyDesktop?: boolean;
  scrollPercent?: number;
  dwellSeconds?: number;
  cooldownDays?: number;
  storageKey?: string;
}

/**
 * Triggers a one-time signal when the user shows leave intent OR scrolls deep
 * AND has been on the page long enough. Frequency-capped via localStorage.
 */
export function useExitIntent({
  enabled = true,
  onlyDesktop = true,
  scrollPercent = 50,
  dwellSeconds = 30,
  cooldownDays = 7,
  storageKey = "mdmc_lead_modal_last",
}: Options = {}) {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const last = Number(localStorage.getItem(storageKey) || 0);
    if (last && Date.now() - last < cooldownDays * 86_400_000) return;

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (onlyDesktop && isMobile) return;

    const arrivedAt = Date.now();
    let fired = false;

    const fire = (reason: string) => {
      if (fired) return;
      fired = true;
      localStorage.setItem(storageKey, String(Date.now()));
      setTriggered(true);
      try {
        // optional debug
        // eslint-disable-next-line no-console
        console.debug("[lead-magnet] triggered:", reason);
      } catch {}
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (Date.now() - arrivedAt < 5_000) return;
      if (e.clientY <= 0) fire("exit-intent");
    };

    const onScroll = () => {
      const dwell = (Date.now() - arrivedAt) / 1000;
      if (dwell < dwellSeconds) return;
      const scrolled =
        ((window.scrollY + window.innerHeight) /
          document.documentElement.scrollHeight) *
        100;
      if (scrolled >= scrollPercent) fire(`scroll-${Math.round(scrolled)}`);
    };

    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, onlyDesktop, scrollPercent, dwellSeconds, cooldownDays, storageKey]);

  return { triggered };
}