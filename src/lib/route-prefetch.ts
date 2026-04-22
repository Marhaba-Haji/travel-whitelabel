// Lightweight route prefetcher.
// Maps route paths to their dynamic import factories so we can warm up
// the chunk before the user clicks (on hover/focus or browser idle).

const loaders: Record<string, () => Promise<unknown>> = {
  "/about": () => import("@/pages/About"),
  "/blog": () => import("@/pages/Blog"),
  "/categories-destinations": () => import("@/pages/CategoriesDestinations"),
  "/umrah-visa-check": () => import("@/pages/UmrahVisaCheck"),
  "/login": () => import("@/pages/Login"),
  "/signup": () => import("@/pages/Signup"),
};

const prefetched = new Set<string>();

export const prefetchRoute = (path: string) => {
  if (typeof window === "undefined") return;
  const key = path.split(/[?#]/)[0];
  if (prefetched.has(key)) return;
  const loader = loaders[key];
  if (!loader) return;
  prefetched.add(key);
  // Fire and forget — errors swallowed; React.lazy will retry on actual nav.
  loader().catch(() => prefetched.delete(key));
};

export const prefetchIdleRoutes = (paths: string[]) => {
  if (typeof window === "undefined") return;
  const run = () => paths.forEach(prefetchRoute);
  const ric = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (typeof ric === "function") {
    ric(run, { timeout: 2000 });
  } else {
    setTimeout(run, 1500);
  }
};