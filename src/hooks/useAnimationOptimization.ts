import { useEffect, useRef, useState } from 'react';

/**
 * Hook to defer animation until after page interactive (TTI)
 * Prevents animation work from blocking initial page load
 * @param delay - additional delay in ms after TTI (default: 0)
 */
export const useDeferredAnimation = (delay: number = 0) => {
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start animation after page becomes interactive (2s minimum)
    const scheduleAnimation = () => {
      timeoutRef.current = setTimeout(() => {
        setIsAnimationReady(true);
      }, delay);
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      scheduleAnimation();
    } else {
      document.addEventListener('readystatechange', scheduleAnimation, { once: true });
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [delay]);

  return isAnimationReady;
};

/**
 * Hook to check if animation should run based on user's motion preferences
 * Respects prefers-reduced-motion for accessibility
 */
export const useMotionPreference = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook to safely animate only transform and opacity (GPU-accelerated)
 * Avoid animating layout properties like width, height, top, left
 * @returns object with GPU-safe animation styles
 */
export const useOptimizedAnimation = () => {
  return {
    // Safe transforms - use these instead of margin/position changes
    getTransform: (x = 0, y = 0, scale = 1, rotate = 0) => ({
      transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`,
      willChange: 'transform',
    }),
    
    // Safe opacity changes
    getOpacity: (opacity: number) => ({
      opacity,
      willChange: 'opacity',
    }),
    
    // Combine for smooth transitions
    getCombined: (style: Record<string, any>) => ({
      ...style,
      willChange: Object.keys(style)
        .filter(key => ['transform', 'opacity', 'filter'].includes(key))
        .join(', '),
    }),
  };
};

/**
 * Utility to measure animation performance and log if janky
 * @param name - animation name for logging
 * @param onFrame - callback on each animation frame
 */
export const measureAnimationPerformance = (
  name: string,
  onFrame: (frameTime: number) => void
) => {
  let lastTime = performance.now();
  let frameCount = 0;
  let jankCount = 0;

  const measure = () => {
    const now = performance.now();
    const frameTime = now - lastTime;
    
    // 60fps = ~16.67ms per frame. Anything >25ms is janky
    if (frameTime > 25) {
      jankCount++;
    }

    frameCount++;
    onFrame(frameTime);
    lastTime = now;

    // Log every 100 frames
    if (frameCount % 100 === 0) {
      const jankPercent = ((jankCount / frameCount) * 100).toFixed(1);
      console.log(`[Performance] ${name} - Jank: ${jankPercent}% (${jankCount}/${frameCount} frames)`);
    }

    return requestAnimationFrame(measure);
  };

  const id = requestAnimationFrame(measure);
  
  return () => {
    cancelAnimationFrame(id);
    const jankPercent = ((jankCount / frameCount) * 100).toFixed(1);
    console.log(`[Performance] ${name} - Final Jank: ${jankPercent}% (${jankCount}/${frameCount} frames)`);
  };
};

export default {
  useDeferredAnimation,
  useMotionPreference,
  useOptimizedAnimation,
  measureAnimationPerformance,
};
