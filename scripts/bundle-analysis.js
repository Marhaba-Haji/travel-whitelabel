#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the production build output and reports:
 * - Total bundle size
 * - Per-chunk sizes
 * - Dependencies size breakdown
 * - Recommendations for optimization
 */

const fs = require('fs');
const path = require('path');

// Get the directory where this script is running
const distDir = path.join(process.cwd(), 'dist');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (e) {
    return 0;
  }
}

function analyzeBundle() {
  if (!fs.existsSync(distDir)) {
    console.error(`${colors.red}Error: dist directory not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.cyan}${colors.bright}=== BUNDLE ANALYSIS ===${colors.reset}\n`);

  let totalSize = 0;
  const files = [];
  const chunks = {};

  // Scan dist directory
  function scanDir(dir, subPath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      const relativePath = subPath ? `${subPath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        scanDir(fullPath, relativePath);
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.css') || entry.name.endsWith('.woff2')) {
        const size = getFileSize(fullPath);
        files.push({ name: relativePath, size });
        totalSize += size;

        // Group by chunk type
        if (entry.name.includes('vendor')) {
          chunks['vendor'] = (chunks['vendor'] || 0) + size;
        } else if (entry.name.includes('assets')) {
          chunks['assets'] = (chunks['assets'] || 0) + size;
        } else if (entry.name.endsWith('.css')) {
          chunks['css'] = (chunks['css'] || 0) + size;
        } else {
          chunks['app'] = (chunks['app'] || 0) + size;
        }
      }
    });
  }

  scanDir(distDir);

  // Sort files by size
  files.sort((a, b) => b.size - a.size);

  // Report total size
  console.log(`${colors.bright}Total Bundle Size:${colors.reset} ${formatBytes(totalSize)}\n`);

  // Report chunk breakdown
  console.log(`${colors.bright}Chunk Breakdown:${colors.reset}`);
  Object.entries(chunks)
    .sort((a, b) => b[1] - a[1])
    .forEach(([chunk, size]) => {
      const percentage = ((size / totalSize) * 100).toFixed(1);
      console.log(`  ${chunk.padEnd(15)} ${formatBytes(size).padEnd(10)} (${percentage}%)`);
    });

  // Report top 10 largest files
  console.log(`\n${colors.bright}Top 10 Largest Files:${colors.reset}`);
  files.slice(0, 10).forEach((file, i) => {
    const percentage = ((file.size / totalSize) * 100).toFixed(1);
    console.log(`  ${(i + 1).toString().padEnd(3)} ${file.name.padEnd(40)} ${formatBytes(file.size).padEnd(10)} (${percentage}%)`);
  });

  // Performance budgets
  console.log(`\n${colors.bright}Performance Budgets:${colors.reset}`);
  const budgets = {
    'Vendor JS': { max: 250 * 1024, actual: chunks['vendor'] || 0 },
    'App JS': { max: 150 * 1024, actual: chunks['app'] || 0 },
    'CSS': { max: 50 * 1024, actual: chunks['css'] || 0 },
    'Total': { max: 500 * 1024, actual: totalSize },
  };

  Object.entries(budgets).forEach(([name, budget]) => {
    const status = budget.actual <= budget.max ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    const exceeded = budget.actual > budget.max ? ` (${colors.red}+${formatBytes(budget.actual - budget.max)}${colors.reset})` : '';
    console.log(`  ${status} ${name.padEnd(15)} ${formatBytes(budget.actual).padEnd(10)} / ${formatBytes(budget.max)}${exceeded}`);
  });

  // Recommendations
  console.log(`\n${colors.bright}Recommendations:${colors.reset}`);
  if (chunks['vendor'] > 250 * 1024) {
    console.log(`  ${colors.yellow}⚠${colors.reset}  Vendor bundle is large. Consider tree-shaking unused dependencies.`);
  }
  if (chunks['app'] > 150 * 1024) {
    console.log(`  ${colors.yellow}⚠${colors.reset}  App bundle is large. Consider splitting code further or lazy loading.`);
  }
  if (totalSize > 500 * 1024) {
    console.log(`  ${colors.yellow}⚠${colors.reset}  Total bundle exceeds 500KB. Performance may be impacted on slow networks.`);
  }
  if (Object.keys(chunks).length < 5) {
    console.log(`  ${colors.yellow}ℹ${colors.reset}  Consider more aggressive code splitting to reduce initial load time.`);
  }

  console.log(`\n${colors.green}${colors.bright}Analysis complete!${colors.reset}\n`);
}

analyzeBundle();
