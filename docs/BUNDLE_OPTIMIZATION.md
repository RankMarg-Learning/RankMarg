# Bundle Size Optimization Guide

This document outlines the comprehensive bundle size optimizations implemented in the RankMarg frontend application.

## 🚀 Current Bundle Analysis

Based on the build output, we identified several performance issues:

### Large First Load JS Sizes:
- `/admin/curriculum`: 249kB
- `/mastery`: 270kB  
- `/test/[testId]`: 286kB
- `/question/[slug]`: 307kB

### Heavy Shared Chunks:
- `chunks/7023-528ef853aa863802.js`: 31.7kB
- `chunks/fd9d1056-c61bfde645e3cbc7.js`: 53.6kB

### Large Middleware:
- Middleware: 48.3kB

## 🔧 Implemented Optimizations

### 1. Next.js Configuration Optimizations

#### Package Import Optimization
```javascript
experimental: {
  optimizePackageImports: [
    '@radix-ui/react-icons',
    'lucide-react', 
    'recharts',
    'framer-motion',
    'date-fns',
    'react-hook-form',
    'zod'
  ],
  esmExternals: 'loose',
  optimizeCss: true,
}
```

#### Webpack Optimizations
- **Tree Shaking**: Enabled `usedExports` and `sideEffects: false`
- **Code Splitting**: Separate chunks for heavy libraries
- **Bundle Analyzer**: Automatic bundle analysis in production builds

#### Chunk Splitting Strategy
```javascript
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    vendor: { test: /[\\/]node_modules[\\/]/, name: 'vendors' },
    framerMotion: { test: /[\\/]node_modules[\\/]framer-motion[\\/]/ },
    recharts: { test: /[\\/]node_modules[\\/]recharts[\\/]/ },
    firebase: { test: /[\\/]node_modules[\\/]firebase[\\/]/ },
    katex: { test: /[\\/]node_modules[\\/]katex[\\/]/ },
  }
}
```

### 2. Middleware Optimization

- **Removed console.log statements** to reduce bundle size
- **Simplified route matching logic**
- **Optimized imports** and removed unused code
- **Early returns** for static routes

### 3. Image Optimization

```javascript
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### 4. Performance Headers

```javascript
async headers() {
  return [
    {
      source: '/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

## 📊 Bundle Analysis Tools

### Bundle Analyzer
Run the bundle analyzer to get detailed insights:

```bash
npm run analyze:bundle
```

This will:
1. Build the application
2. Generate a static bundle analysis report
3. Show chunk sizes and dependencies

### Manual Analysis
```bash
npm run build
# Check .next/static/chunks/ for chunk files
# Check bundle-analyzer-report.html for detailed analysis
```

## 🎯 Further Optimization Recommendations

### 1. Dynamic Imports for Heavy Components

For components that are not immediately needed:

```javascript
// Instead of direct import
import { HeavyChart } from './HeavyChart';

// Use dynamic import
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartLoading />,
  ssr: false
});
```

### 2. Route-Based Code Splitting

Ensure each page is properly code-split:

```javascript
// pages/ are automatically code-split
// app/ routes are automatically code-split
```

### 3. Optimize Heavy Dependencies

#### Recharts Optimization
- Import only needed components
- Use lazy loading for charts
- Consider lighter alternatives for simple charts

#### Framer Motion Optimization
- Use `LazyMotion` for heavy animations
- Import only needed animation functions
- Consider CSS animations for simple effects

#### Firebase Optimization
- Load Firebase only when needed
- Use dynamic imports for Firebase services
- Consider server-side Firebase usage

### 4. Remove Unused Dependencies

Run dependency analysis:

```bash
npm install -g depcheck
depcheck
```

### 5. Optimize CSS

- Use Tailwind's purge feature
- Remove unused CSS classes
- Consider CSS-in-JS for component-specific styles

### 6. Implement Service Worker

For better caching and offline support:

```javascript
// next.config.mjs
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);
```

## 📈 Performance Monitoring

### Core Web Vitals
Monitor these metrics:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Bundle Size Targets
- **First Load JS**: < 200kB
- **Individual Chunks**: < 50kB
- **Total Bundle**: < 1MB

## 🔍 Monitoring Tools

1. **Lighthouse**: Run performance audits
2. **Bundle Analyzer**: Analyze bundle composition
3. **Webpack Bundle Analyzer**: Detailed dependency analysis
4. **Core Web Vitals**: Monitor real user metrics

## 🚀 Quick Wins

1. **Enable compression**: Already implemented
2. **Optimize images**: Use WebP/AVIF formats
3. **Remove console.log**: Already done
4. **Tree shaking**: Already enabled
5. **Code splitting**: Already configured

## 📝 Next Steps

1. **Monitor bundle sizes** after each deployment
2. **Implement dynamic imports** for heavy components
3. **Add performance budgets** to CI/CD
4. **Set up automated bundle analysis**
5. **Monitor Core Web Vitals** in production

## 🎯 Success Metrics

- **30% reduction** in First Load JS size
- **50% improvement** in Core Web Vitals
- **Faster page loads** for users
- **Better SEO scores** due to improved performance

---

*This guide should be updated regularly as new optimization techniques become available.*
