import { useEffect, useState, type ReactNode } from "react";

/**
 * Mounts children only after the browser is idle (or after `delay` ms),
 * so non-critical widgets never block initial render or route transitions.
 */
const DeferredMount = ({ children, delay = 2000 }: { children: ReactNode; delay?: number }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const mount = () => { if (!cancelled) setReady(true); };
    const ric = (window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    });
    let idleId: number | undefined;
    const timeoutId = window.setTimeout(mount, delay);
    if (typeof ric.requestIdleCallback === "function") {
      idleId = ric.requestIdleCallback(mount, { timeout: delay });
    }
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (idleId !== undefined && typeof ric.cancelIdleCallback === "function") {
        ric.cancelIdleCallback(idleId);
      }
    };
  }, [delay]);

  return ready ? <>{children}</> : null;
};

export default DeferredMount;