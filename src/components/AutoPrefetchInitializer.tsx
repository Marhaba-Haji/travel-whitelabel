import { useEffect } from 'react';
import { initializeAutoPreload } from '@/lib/route-prefetch';

/**
 * Component to initialize automatic route prefetching on app load
 * Should be mounted once in the root of the app
 */
export const AutoPrefetchInitializer = () => {
  useEffect(() => {
    // Initialize prefetching on mount
    initializeAutoPreload();
  }, []);

  return null;
};

export default AutoPrefetchInitializer;
