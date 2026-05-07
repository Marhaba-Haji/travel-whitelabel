
import {
  onCLS,
  onFCP,
  onLCP,
  onINP,
  onTTFB,
  type Metric,
} from 'web-vitals';
// Performance metrics store for tracking and reporting
const performanceMetrics: Record<string, Metric> = {};

// Thresholds for "good" Core Web Vitals
const WEB_VITALS_THRESHOLDS = {
  LCP: 2500,  // 2.5 seconds
  FID: 100,   // 100 milliseconds
  CLS: 0.1,   // 0.1
  FCP: 1800,  // 1.8 seconds
  TTFB: 600,  // 600 milliseconds
};

type MetricThreshold = keyof typeof WEB_VITALS_THRESHOLDS;

/**
 * Determine if a metric value is "good" based on Web Vitals thresholds
 */
const isGoodMetric = (name: string, value: number): boolean => {
  const threshold = WEB_VITALS_THRESHOLDS[name as MetricThreshold];
  if (!threshold) return true;
  return value <= threshold;
};

/**
 * Format metric for reporting
 */
const formatMetric = (metric: Metric): string => {
  const status = isGoodMetric(metric.name, metric.value) ? '✓' : '✗';
  const unit = metric.name === 'CLS' ? '' : 'ms';
  const value = metric.name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value);
  return `${status} ${metric.name}: ${value}${unit}`;
};

/**
 * Report a single metric to console and storage
 */
const reportMetric = (metric: Metric) => {
  performanceMetrics[metric.name] = metric;
  console.log(`[Performance] ${formatMetric(metric)}`);
  
  // Store in sessionStorage for later retrieval
  try {
    const existing = JSON.parse(sessionStorage.getItem('web-vitals') || '{}');
    existing[metric.name] = {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    };
    sessionStorage.setItem('web-vitals', JSON.stringify(existing));
  } catch (e) {
    // sessionStorage might not be available in some contexts
  }
};

/**
 * Send metrics to analytics endpoint (e.g., Google Analytics, custom server)
 * Configure this based on your analytics service
 */
const sendMetricsToAnalytics = (metric: Metric) => {
  // Example: Send to Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'web_vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Example: Send to custom analytics endpoint
  // Uncomment and configure as needed
  /*
  if (navigator.sendBeacon) {
    const data = new FormData();
    data.append('name', metric.name);
    data.append('value', metric.value.toString());
    data.append('rating', metric.rating || '');
    data.append('url', window.location.href);
    navigator.sendBeacon('/api/analytics/web-vitals', data);
  }
  */
};

/**
 * Initialize Web Vitals monitoring
 * This should be called once on app initialization
 */
export const initializeWebVitalsMonitoring = () => {
  if (typeof window === 'undefined') return;

  console.log('[Performance] Initializing Web Vitals monitoring...');


  // Track Largest Contentful Paint (LCP)
  onLCP((metric) => {
    reportMetric(metric);
    sendMetricsToAnalytics(metric);
  });

  // Track Interaction to Next Paint (INP) - replaces FID
  onINP((metric) => {
    reportMetric(metric);
    sendMetricsToAnalytics(metric);
  });

  // Track Cumulative Layout Shift (CLS)
  onCLS((metric) => {
    reportMetric(metric);
    sendMetricsToAnalytics(metric);
  });

  // Track First Contentful Paint (FCP)
  onFCP((metric) => {
    reportMetric(metric);
    sendMetricsToAnalytics(metric);
  });

  // Track Time to First Byte (TTFB)
  onTTFB((metric) => {
    reportMetric(metric);
    sendMetricsToAnalytics(metric);
  });
  // Log navigation timing info
  if (performance.timing) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigationTiming = performance.timing;
        const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
        const domReadyTime = navigationTiming.domContentLoadedEventEnd - navigationTiming.navigationStart;
        const resourceTime = navigationTiming.responseEnd - navigationTiming.fetchStart;

        console.log(`[Performance] Page Load Time: ${pageLoadTime}ms`);
        console.log(`[Performance] DOM Ready Time: ${domReadyTime}ms`);
        console.log(`[Performance] Resource Load Time: ${resourceTime}ms`);
      }, 0);
    });
  }
};

/**
 * Get all collected metrics
 */
export const getCollectedMetrics = (): Record<string, Metric> => {
  return performanceMetrics;
};

/**
 * Get metrics summary as string
 */
export const getMetricsSummary = (): string => {
  const metrics = Object.values(performanceMetrics);
  if (metrics.length === 0) return 'No metrics collected yet';

  const summary = metrics.map(formatMetric).join('\n');
  return `Web Vitals Summary:\n${summary}`;
};

/**
 * Log performance metrics to console
 */
export const logMetricsSummary = () => {
  console.log('\n' + getMetricsSummary() + '\n');
};

/**
 * Mark custom performance points (e.g., for measuring button clicks or specific interactions)
 */
export const markPerformancePoint = (name: string) => {
  if (typeof window !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
};

/**
 * Measure time between two performance marks
 */
export const measurePerformance = (name: string, startMark: string, endMark: string) => {
  if (typeof window !== 'undefined' && performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      console.log(`[Performance] ${name}: ${Math.round(measure.duration)}ms`);
    } catch (e) {
      // Marks might not exist yet
    }
  }
};

/**
 * Monitor interaction delay for buttons and interactive elements
 */
export const setupInteractionMonitoring = () => {
  if (typeof window === 'undefined' || !PerformanceObserver) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`[Performance] Interaction: ${entry.name} - Duration: ${Math.round(entry.duration)}ms`);
      }
    });

    observer.observe({ entryTypes: ['event', 'first-input'] });
  } catch (e) {
    // PerformanceObserver might not be supported
  }
};

export default initializeWebVitalsMonitoring;
