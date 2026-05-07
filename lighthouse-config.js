module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // Emulate mobile conditions by default
    emulatedFormFactor: 'mobile',
    // Run on desktop for better performance testing
    // emulatedFormFactor: 'desktop',
    // Slow 4G throttling
    throttling: {
      rttMs: 150,
      downstreamThroughputKbps: 1600,
      upstreamThroughputKbps: 750,
    },
    // CPU throttling
    cpuSlowdownMultiplier: 4,
    // Max wait time for interactive elements
    maxWaitForFcp: 15000,
    maxWaitForLoad: 35000,
  },
  categories: {
    performance: {
      title: 'Performance',
      description: 'These metrics validate the performance of your web app.',
      auditRefs: [
        { id: 'first-contentful-paint', weight: 10, group: 'metrics' },
        { id: 'largest-contentful-paint', weight: 25, group: 'metrics' },
        { id: 'interaction-to-next-paint', weight: 10, group: 'metrics' },
        { id: 'cumulative-layout-shift', weight: 5, group: 'metrics' },
        { id: 'speed-index', weight: 10, group: 'metrics' },
      ],
    },
  },
};
