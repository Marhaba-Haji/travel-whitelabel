import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Mounts children only when the placeholder scrolls within `rootMargin` of the
 * viewport. Combined with `React.lazy`, this defers parse+execute of large
 * below-the-fold component chunks until they're actually needed, which is the
 * single biggest lever for cutting Total Blocking Time on landing pages.
 */
interface LazyOnVisibleProps {
  children: ReactNode;
  /** CSS distance from viewport at which to mount. Default: 600px. */
  rootMargin?: string;
  /** Reserved space so layout doesn't shift when the section mounts. */
  minHeight?: number | string;
  /** Mark the placeholder for accessibility/debug. */
  label?: string;
}

const LazyOnVisible = ({
  children,
  rootMargin = "600px 0px",
  minHeight = 200,
  label,
}: LazyOnVisibleProps) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  if (visible) return <>{children}</>;

  return (
    <div
      ref={ref}
      data-lazy-section={label}
      style={{ minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight }}
      aria-hidden="true"
    />
  );
};

export default LazyOnVisible;
