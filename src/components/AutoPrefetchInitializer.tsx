import { useEffect } from 'react';
import { prefetchIdleRoutes } from '@/lib/route-prefetch';

/**
 * Component to initialize automatic route prefetching on app load
 * Should be mounted once in the root of the app
 */
export const AutoPrefetchInitializer = () => {
  useEffect(() => {
    // Warm up commonly visited routes during idle time
    prefetchIdleRoutes([
      '/about',
      '/blog',
      '/categories-destinations',
      '/login',
      '/signup',
    ]);
  }, []);

  return null;
};

export default AutoPrefetchInitializer;
